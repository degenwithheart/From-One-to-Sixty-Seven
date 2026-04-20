# Ruby on Rails + React Full-Stack Specific Rules

> Stack: Rails 7+ (API mode) + React 18 + PostgreSQL + Hotwire/Turbo optional
> Variant: Convention-over-configuration with modern frontend

## Architecture

### Project Structure
```
project/
├── app/
│   ├── controllers/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── products_controller.rb
│   │   │   │   └── users_controller.rb
│   │   │   └── base_controller.rb
│   │   └── concerns/
│   ├── models/
│   │   ├── product.rb
│   │   ├── user.rb
│   │   └── application_record.rb
│   ├── serializers/
│   │   ├── product_serializer.rb
│   │   └── user_serializer.rb
│   ├── policies/
│   │   └── product_policy.rb
│   ├── services/
│   │   └── product_service.rb
│   └── validators/
│       └── sku_validator.rb
├── config/
│   ├── routes.rb
│   └── initializers/
│       ├── cors.rb
│       └── jsonapi.rb
├── db/
│   ├── migrate/
│   ├── schema.rb
│   └── seeds.rb
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── spec/                        # RSpec tests
│   ├── models/
│   ├── requests/
│   └── policies/
└── docker-compose.yml
```

## Backend (Rails API)

### Models
```ruby
# app/models/user.rb
class User < ApplicationRecord
  # User model with authentication and validations
  # 
  # ASSUMPTIONS:
  # - Email is unique and verified
  # - Password is hashed with bcrypt
  # - Soft delete via discard gem
  
  include Discard::Model  # Soft deletes
  
  has_secure_password
  
  has_many :products, dependent: :destroy
  has_many :sessions, dependent: :destroy
  
  enum role: { user: 0, admin: 1, moderator: 2 }
  
  validates :email, presence: true,
                   uniqueness: { case_sensitive: false },
                   format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true, length: { minimum: 2, maximum: 255 }
  validates :password, length: { minimum: 8 }, if: :password_required?
  
  before_save :downcase_email
  before_create :set_confirmation_token
  
  scope :active, -> { kept.where(active: true) }
  scope :admins, -> { where(role: :admin) }
  
  def admin?
    role == 'admin'
  end
  
  def full_name
    name.to_s.titleize
  end
  
  def deactivate!
    update!(active: false)
  end
  
  private
  
  def downcase_email
    self.email = email.downcase if email.present?
  end
  
  def set_confirmation_token
    self.confirmation_token = SecureRandom.urlsafe_base64
    self.confirmation_sent_at = Time.current
  end
  
  def password_required?
    new_record? || password.present?
  end
end
```

```ruby
# app/models/product.rb
class Product < ApplicationRecord
  # Product model with full validation and business rules
  # 
  # SECURITY NOTE:
  # - SKU must be unique (enforced at DB level)
  # - Price stored in cents as integer
  # - Soft delete preserves order history
  
  include Discard::Model
  
  belongs_to :user
  belongs_to :category, optional: true
  
  has_many :order_items, dependent: :restrict_with_error
  
  validates :name, presence: true,
                   length: { minimum: 2, maximum: 200 }
  validates :sku, presence: true,
                 uniqueness: { conditions: -> { undiscarded } },
                 format: { with: /\A[A-Z0-9\-]+\z/,
                          message: "must contain only uppercase letters, numbers, and hyphens" }
  validates :price_cents, presence: true,
                         numericality: { greater_than_or_equal_to: 1,
                                        less_than_or_equal_to: 99_999_999 }
  validates :quantity, presence: true,
                       numericality: { greater_than_or_equal_to: 0,
                                      less_than_or_equal_to: 999_999 }
  
  before_validation :normalize_sku
  before_save :set_slug
  
  scope :active, -> { where(active: true) }
  scope :in_stock, -> { where('quantity > ?', 0) }
  scope :recent, -> { order(created_at: :desc) }
  
  def price
    price_cents / 100.0
  end
  
  def price=(value)
    self.price_cents = (value.to_f * 100).round
  end
  
  def in_stock?
    quantity > 0
  end
  
  def low_stock?
    quantity < 10
  end
  
  def formatted_price
    "$#{'%.2f' % price}"
  end
  
  private
  
  def normalize_sku
    self.sku = sku.to_s.upcase.strip.gsub(/\s+/, '-')
  end
  
  def set_slug
    self.slug = name.to_s.parameterize
  end
end
```

### Database Migrations
```ruby
# db/migrate/20240115000001_create_users.rb
class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :name, null: false
      t.integer :role, default: 0, null: false
      t.boolean :active, default: true, null: false
      t.string :confirmation_token
      t.datetime :confirmation_sent_at
      t.datetime :confirmed_at
      
      t.datetime :discarded_at  # Soft delete
      
      t.timestamps
    end
    
    add_index :users, :email, unique: true
    add_index :users, :confirmation_token, unique: true
    add_index :users, :discarded_at
  end
end
```

```ruby
# db/migrate/20240115000002_create_products.rb
class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.text :description
      t.string :sku, null: false
      t.integer :price_cents, null: false
      t.integer :quantity, default: 0, null: false
      t.string :slug, null: false
      t.boolean :active, default: true, null: false
      
      t.references :user, null: false, foreign_key: true
      t.references :category, foreign_key: true
      
      t.datetime :discarded_at
      
      t.timestamps
    end
    
    add_index :products, :sku, unique: true, where: 'discarded_at IS NULL'
    add_index :products, :slug, unique: true
    add_index :products, :discarded_at
    add_index :products, [:active, :created_at]
    add_index :products, [:user_id, :active]
  end
end
```

### Controllers
```ruby
# app/controllers/api/v1/base_controller.rb
module Api
  module V1
    class BaseController < ActionController::API
      # Base controller for API with common functionality
      # 
      # SECURITY NOTE:
      # - All endpoints require authentication by default
      # - Rate limiting enforced
      # - JSON parsing errors handled gracefully
      
      include Pundit::Authorization
      include Pagy::Backend
      
      before_action :authenticate_user!
      after_action :verify_authorized, except: :index
      after_action :verify_policy_scoped, only: :index
      
      rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
      rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :record_invalid
      
      private
      
      def authenticate_user!
        token = request.headers['Authorization']&.gsub(/Bearer /i, '')
        
        if token.present?
          session = Session.find_by(token: token)
          
          if session&.valid?
            @current_user = session.user
          else
            render_error('Invalid or expired token', :unauthorized)
          end
        else
          render_error('Authentication required', :unauthorized)
        end
      end
      
      def current_user
        @current_user
      end
      
      def user_not_authorized
        render_error('You are not authorized to perform this action', :forbidden)
      end
      
      def record_not_found(exception)
        render_error("#{exception.model} not found", :not_found)
      end
      
      def record_invalid(exception)
        render json: {
          error: 'Validation failed',
          messages: exception.record.errors.full_messages
        }, status: :unprocessable_entity
      end
      
      def render_error(message, status = :bad_request)
        render json: { error: message }, status: status
      end
      
      def pagination_meta(pagy)
        {
          current_page: pagy.page,
          next_page: pagy.next,
          prev_page: pagy.prev,
          total_pages: pagy.pages,
          total_count: pagy.count
        }
      end
    end
  end
end
```

```ruby
# app/controllers/api/v1/products_controller.rb
module Api
  module V1
    class ProductsController < BaseController
      # Product API endpoints
      # 
      # ASSUMPTIONS:
      # - Users see only their products unless admin
      # - Pagination prevents memory issues
      # - Soft delete preserves data integrity
      
      before_action :set_product, only: [:show, :update, :destroy]
      
      def index
        # ASSUMPTION: Users see own products, admins see all
        @pagy, @products = pagy(policy_scope(Product).includes(:category, :user))
        
        render json: {
          data: @products.map { |p| ProductSerializer.new(p).as_json },
          meta: pagination_meta(@pagy)
        }
      end
      
      def show
        authorize @product
        render json: ProductSerializer.new(@product).as_json
      end
      
      def create
        @product = current_user.products.build(product_params)
        authorize @product
        
        if @product.save
          # Audit log
          AuditLog.create!(
            user: current_user,
            action: 'product_created',
            record: @product,
            details: { name: @product.name, sku: @product.sku }
          )
          
          render json: ProductSerializer.new(@product).as_json, status: :created
        else
          render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def update
        authorize @product
        
        if @product.update(product_params)
          AuditLog.create!(
            user: current_user,
            action: 'product_updated',
            record: @product,
            details: { changes: @product.previous_changes }
          )
          
          render json: ProductSerializer.new(@product).as_json
        else
          render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def destroy
        authorize @product
        
        @product.discard  # Soft delete
        
        AuditLog.create!(
          user: current_user,
          action: 'product_deleted',
          record: @product,
          details: { name: @product.name }
        )
        
        head :no_content
      end
      
      private
      
      def set_product
        @product = Product.find(params[:id])
      end
      
      def product_params
        params.require(:product).permit(
          :name, :description, :sku, :price, :quantity,
          :active, :category_id
        )
      end
    end
  end
end
```

### Serializers
```ruby
# app/serializers/product_serializer.rb
class ProductSerializer
  # Fast JSON serialization with Oj
  
  def initialize(product)
    @product = product
  end
  
  def as_json(*_args)
    {
      id: @product.id,
      name: @product.name,
      description: @product.description,
      sku: @product.sku,
      slug: @product.slug,
      price: @product.price,
      formatted_price: @product.formatted_price,
      quantity: @product.quantity,
      in_stock: @product.in_stock?,
      low_stock: @product.low_stock?,
      active: @product.active,
      category: category_data,
      user: user_data,
      created_at: @product.created_at.iso8601,
      updated_at: @product.updated_at.iso8601
    }
  end
  
  private
  
  def category_data
    return nil unless @product.category
    
    {
      id: @product.category.id,
      name: @product.category.name
    }
  end
  
  def user_data
    return nil unless @product.user
    
    {
      id: @product.user.id,
      name: @product.user.name
    }
  end
end
```

### Policies (Authorization)
```ruby
# app/policies/product_policy.rb
class ProductPolicy < ApplicationPolicy
  # Pundit policy for product authorization
  
  class Scope < Scope
    def resolve
      if user.admin?
        scope.all
      else
        scope.where(user: user)
      end
    end
  end
  
  def show?
    user.admin? || record.user_id == user.id
  end
  
  def create?
    user.active?
  end
  
  def update?
    user.admin? || record.user_id == user.id
  end
  
  def destroy?
    update?
  end
end
```

### Routes
```ruby
# config/routes.rb
Rails.application.routes.draw do
  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication
      post 'auth/login', to: 'sessions#create'
      post 'auth/register', to: 'users#create'
      delete 'auth/logout', to: 'sessions#destroy'
      get 'auth/me', to: 'users#me'
      
      # Resources
      resources :products, except: [:new, :edit]
      resources :categories, only: [:index, :show]
      resources :users, only: [:show, :update] do
        member do
          post :deactivate
        end
      end
    end
  end
  
  # Health check
  get 'health', to: proc { [200, {}, ['OK']] }
  
  # Catch-all for React SPA
  get '*path', to: 'frontend#index', constraints: ->(req) {
    !req.xhr? && req.format.html?
  }
  
  root to: 'frontend#index'
end
```

## Frontend (React + TypeScript)

### API Client
```typescript
// frontend/src/services/api.ts
import { z } from 'zod';

/**
 * API client with automatic error handling and token management.
 * 
 * ASSUMPTIONS:
 * - Token stored in localStorage after login
 * - 401 responses trigger automatic logout
 * - CSRF token handled for non-GET requests
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private csrfToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
    this.loadCsrfToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token');
  }

  private loadCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    this.csrfToken = meta?.getAttribute('content') || null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (options.method && options.method !== 'GET' && this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
        throw new ApiError(401, 'Session expired');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: 'An error occurred',
        }));
        throw new ApiError(
          response.status,
          error.error || 'Request failed',
          error.errors
        );
      }

      if (response.status === 204) {
        return null as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, 'Network error');
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
export { ApiError };
```

### React Hooks
```typescript
// frontend/src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { z } from 'zod';

// Zod schemas for runtime validation
const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  sku: z.string(),
  slug: z.string(),
  price: z.number(),
  formatted_price: z.string(),
  quantity: z.number(),
  in_stock: z.boolean(),
  low_stock: z.boolean(),
  active: z.boolean(),
  category: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable(),
  user: z.object({
    id: z.number(),
    name: z.string(),
  }),
  created_at: z.string(),
  updated_at: z.string(),
});

const ProductsResponseSchema = z.object({
  data: z.array(ProductSchema),
  meta: z.object({
    current_page: z.number(),
    next_page: z.number().nullable(),
    prev_page: z.number().nullable(),
    total_pages: z.number(),
    total_count: z.number(),
  }),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;

export interface ProductFilters {
  search?: string;
  category_id?: number;
  page?: number;
}

export function useProducts(filters: ProductFilters = {}) {
  const { search, category_id, page = 1 } = filters;
  
  return useQuery({
    queryKey: ['products', { search, category_id, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      if (search) params.append('search', search);
      if (category_id) params.append('category_id', String(category_id));
      
      const response = await api.get<unknown>(`/products?${params.toString()}`);
      return ProductsResponseSchema.parse(response);
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Product>) =>
      api.post<Product>('/products', { product: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) =>
      api.put<Product>(`/products/${id}`, { product: data }),
    onSuccess: (data) => {
      queryClient.setQueryData(['product', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

## Testing
```ruby
# spec/requests/api/v1/products_spec.rb
require 'rails_helper'

RSpec.describe 'Products API', type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{user.sessions.create.token}" } }
  
  describe 'GET /api/v1/products' do
    it 'returns paginated products for current user' do
      products = create_list(:product, 5, user: user)
      create(:product, user: other_user)  # Should not appear
      
      get '/api/v1/products', headers: auth_headers
      
      expect(response).to have_http_status(:ok)
      expect(json['data'].length).to eq(5)
      expect(json['meta']['total_count']).to eq(5)
    end
    
    it 'returns all products for admin' do
      create_list(:product, 3, user: user)
      create_list(:product, 2, user: other_user)
      
      admin_headers = { 'Authorization' => "Bearer #{admin.sessions.create.token}" }
      get '/api/v1/products', headers: admin_headers
      
      expect(json['meta']['total_count']).to eq(5)
    end
  end
  
  describe 'POST /api/v1/products' do
    let(:valid_params) do
      {
        product: {
          name: 'Test Product',
          sku: 'TEST001',
          price: 99.99,
          quantity: 10
        }
      }
    end
    
    it 'creates a new product' do
      expect {
        post '/api/v1/products', params: valid_params, headers: auth_headers
      }.to change(Product, :count).by(1)
      
      expect(response).to have_http_status(:created)
      expect(json['data']['name']).to eq('Test Product')
    end
    
    it 'returns validation errors for invalid data' do
      post '/api/v1/products',
           params: { product: { name: '', sku: '' } },
           headers: auth_headers
      
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json['errors']).to include(/Name can't be blank/)
    end
    
    it 'prevents duplicate SKUs' do
      create(:product, sku: 'DUPLICATE', user: user)
      
      post '/api/v1/products',
           params: { product: { name: 'Test', sku: 'DUPLICATE', price: 10 } },
           headers: auth_headers
      
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
  
  describe 'DELETE /api/v1/products/:id' do
    let(:product) { create(:product, user: user) }
    let(:other_product) { create(:product, user: other_user) }
    
    it 'soft deletes own product' do
      delete "/api/v1/products/#{product.id}", headers: auth_headers
      
      expect(response).to have_http_status(:no_content)
      expect(product.reload.discarded?).to be true
    end
    
    it 'returns 403 for other user product' do
      delete "/api/v1/products/#{other_product.id}", headers: auth_headers
      
      expect(response).to have_http_status(:forbidden)
    end
  end
  
  def json
    JSON.parse(response.body)
  end
end
```

## Security Checklist

- [ ] Rails credentials properly encrypted (master.key not committed)
- [ ] SECRET_KEY_BASE strong and rotated regularly
- [ ] BCrypt cost factor appropriate (default 12)
- [ ] Strong parameters on all controllers
- [ ] SQL injection prevention (ActiveRecord)
  * [ ] XSS prevention (auto-escaping)
- [ ] CSRF protection (for non-API routes)
- [ ] CORS properly configured (whitelist origins)
- [ ] Rate limiting on auth endpoints
- [ ] Authorization with Pundit on all resources
- [ ] Audit logging for sensitive operations
- [ ] Input validation with custom validators
- [ ] Database encryption for sensitive fields
- [ ] Session security (HttpOnly, Secure, SameSite)

## SUMMARY

Rails + React stack:
1. Use ActiveRecord with proper validations and scopes
2. Strong parameters and form objects for input handling
3. Pundit policies for authorization
4. Service objects for complex business logic
5. Fast JSON serializers for API responses
6. Soft deletes with discard gem
7. React Query for server state management
8. Zod for runtime type validation
9. Comprehensive RSpec test coverage
10. Security at every layer
