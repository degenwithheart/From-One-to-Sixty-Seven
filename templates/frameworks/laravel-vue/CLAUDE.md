# Laravel + Vue.js Full-Stack Specific Rules

> Stack: Laravel (PHP) + Vue 3 + TypeScript + MySQL/PostgreSQL
> Variant: Traditional MVC with modern SPA frontend

## Architecture

### Project Structure
```
project/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── ProductController.php
│   │   │   │   └── AuthController.php
│   │   │   └── Web/
│   │   ├── Middleware/
│   │   │   ├── EnsureJsonResponse.php
│   │   │   └── RateLimiter.php
│   │   └── Requests/
│   │       ├── StoreProductRequest.php
│   │       └── UpdateUserRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Product.php
│   │   └── Category.php
│   ├── Services/
│   │   ├── ProductService.php
│   │   └── AuthService.php
│   ├── Policies/
│   │   └── ProductPolicy.php
│   └── Providers/
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── ProductList.vue
│   │   │   └── ProductForm.vue
│   │   ├── composables/
│   │   │   ├── useProducts.ts
│   │   │   └── useAuth.ts
│   │   ├── stores/
│   │   │   └── auth.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── app.ts
│   ├── views/
│   │   └── app.blade.php
│   └── css/
├── routes/
│   ├── web.php
│   └── api.php
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── tests/
│   ├── Feature/
│   └── Unit/
└── docker-compose.yml
```

## Backend (Laravel)

### Models
```php
<?php

// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * User model with relationships and validation.
     * 
     * ASSUMPTIONS:
     * - Email is unique and verified
     * - Password is always hashed
     * - Soft deletes preserve data
     */

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            $user->email = strtolower(trim($user->email));
        });
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
```

```php
<?php

// app/Models/Product.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Product model with full validation and relations.
     * 
     * SECURITY NOTE:
     * - SKU uniqueness enforced at database level
     * - Price stored as integer (cents) to avoid float issues
     * - Soft delete preserves order history
     */

    protected $fillable = [
        'name',
        'description',
        'sku',
        'price_cents',
        'quantity',
        'is_active',
        'user_id',
        'category_id',
    ];

    protected $casts = [
        'price_cents' => 'integer',
        'quantity' => 'integer',
        'is_active' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    protected $appends = ['price'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            $product->sku = strtoupper(trim($product->sku));
            
            if (empty($product->user_id)) {
                $product->user_id = auth()->id();
            }
        });

        static::saving(function ($product) {
            // Validate SKU format
            if (!preg_match('/^[A-Z0-9\-]+$/', $product->sku)) {
                throw new \InvalidArgumentException('SKU must contain only uppercase letters, numbers, and hyphens');
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getPriceAttribute(): string
    {
        return number_format($this->price_cents / 100, 2);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('quantity', '>', 0);
    }

    public function scopeFilterByUser($query, ?User $user = null)
    {
        $user = $user ?? auth()->user();
        
        if (!$user || !$user->isAdmin()) {
            return $query->where('user_id', $user?->id);
        }
        
        return $query;
    }
}
```

### Form Requests (Validation)
```php
<?php

// app/Http/Requests/StoreProductRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized.
     * 
     * ASSUMPTIONS:
     * - Only authenticated users can create products
     * - Admins can create for any user, others only for self
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'sku' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[A-Z0-9\-]+$/',
                Rule::unique('products', 'sku')->whereNull('deleted_at'),
            ],
            'price' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'quantity' => ['required', 'integer', 'min:0', 'max:999999'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'sku.regex' => 'SKU must contain only uppercase letters, numbers, and hyphens',
            'sku.unique' => 'This SKU is already in use',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'sku' => strtoupper(trim($this->sku ?? '')),
            'price_cents' => $this->price ? (int) round($this->price * 100) : null,
        ]);
    }
}
```

### Controllers
```php
<?php

// app/Http/Controllers/Api/ProductController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {}

    /**
     * List products with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        /**
         * ASSUMPTIONS:
         * - Users see only their products unless admin
         * - Pagination prevents memory issues
         * - Eager loading prevents N+1
         */
        
        $perPage = min($request->input('per_page', 20), 100);
        
        $products = Product::with(['user:id,name,email', 'category'])
            ->filterByUser()
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->active()
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_order ?? 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Store a new product.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->create($request->validated());

        // Audit log
        activity()
            ->performedOn($product)
            ->causedBy(auth()->user())
            ->log('created');

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product->load(['category', 'user']),
        ], 201);
    }

    /**
     * Display a product.
     */
    public function show(Product $product): JsonResponse
    {
        /**
         * SECURITY NOTE:
         * - Policy checks authorization
         * - Soft-deleted products return 404
         */
        Gate::authorize('view', $product);

        return response()->json([
            'data' => $product->load(['category', 'user']),
        ]);
    }

    /**
     * Update a product.
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        Gate::authorize('update', $product);

        $product = $this->productService->update($product, $request->validated());

        activity()
            ->performedOn($product)
            ->causedBy(auth()->user())
            ->withProperties(['changes' => $product->getChanges()])
            ->log('updated');

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product->fresh(['category', 'user']),
        ]);
    }

    /**
     * Soft delete a product.
     */
    public function destroy(Product $product): JsonResponse
    {
        Gate::authorize('delete', $product);

        $product->delete();

        activity()
            ->performedOn($product)
            ->causedBy(auth()->user())
            ->log('deleted');

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}
```

### Policies (Authorization)
```php
<?php

// app/Policies/ProductPolicy.php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine whether the user can view the product.
     */
    public function view(User $user, Product $product): bool
    {
        return $user->isAdmin() || $user->id === $product->user_id;
    }

    /**
     * Determine whether the user can create products.
     */
    public function create(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can update the product.
     */
    public function update(User $user, Product $product): bool
    {
        return $user->isAdmin() || $user->id === $product->user_id;
    }

    /**
     * Determine whether the user can delete the product.
     */
    public function delete(User $user, Product $product): bool
    {
        return $user->isAdmin() || $user->id === $product->user_id;
    }

    /**
     * Determine whether the user can restore the product.
     */
    public function restore(User $user, Product $product): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete.
     */
    public function forceDelete(User $user, Product $product): bool
    {
        return $user->isAdmin();
    }
}
```

### Services
```php
<?php

// app/Services/ProductService.php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ProductService
{
    /**
     * Create a new product.
     * 
     * ASSUMPTIONS:
     * - Validation already performed in FormRequest
     * - User ID set automatically if not provided
     */
    public function create(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $product = Product::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'sku' => $data['sku'],
                'price_cents' => $data['price_cents'],
                'quantity' => $data['quantity'],
                'is_active' => $data['is_active'] ?? true,
                'category_id' => $data['category_id'] ?? null,
                'user_id' => $data['user_id'] ?? auth()->id(),
            ]);

            // Clear cache
            Cache::tags(['products'])->flush();

            return $product;
        });
    }

    /**
     * Update an existing product.
     */
    public function update(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $product->update([
                'name' => $data['name'] ?? $product->name,
                'description' => $data['description'] ?? $product->description,
                'price_cents' => $data['price_cents'] ?? $product->price_cents,
                'quantity' => $data['quantity'] ?? $product->quantity,
                'is_active' => $data['is_active'] ?? $product->is_active,
                'category_id' => $data['category_id'] ?? $product->category_id,
            ]);

            Cache::tags(['products'])->forget("product:{$product->id}");

            return $product;
        });
    }

    /**
     * Get product by ID with caching.
     */
    public function getById(int $id): ?Product
    {
        return Cache::tags(['products'])->remember(
            "product:{$id}",
            now()->addMinutes(10),
            fn() => Product::find($id)
        );
    }
}
```

## Frontend (Vue 3 + TypeScript)

### Composition API Pattern
```vue
<!-- resources/js/components/ProductList.vue -->
<template>
  <div class="product-list">
    <div class="header">
      <h1>Products ({{ pagination.total }})</h1>
      <RouterLink to="/products/new" class="btn-primary">
        New Product
      </RouterLink>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input
        v-model="filters.search"
        type="text"
        placeholder="Search products..."
        @input="debouncedSearch"
      />
      <select v-model="filters.category">
        <option value="">All Categories</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      Loading products...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error" role="alert">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="empty">
      No products found
    </div>

    <!-- Product Grid -->
    <div v-else class="grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @delete="handleDelete"
      />
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="pagination.last_page > 1"
      :current="pagination.current_page"
      :last="pagination.last_page"
      @change="changePage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import ProductCard from './ProductCard.vue';
import Pagination from './Pagination.vue';
import type { Product, PaginationMeta, Category } from '../types';

/**
 * ASSUMPTIONS:
 * - User authenticated (handled by router guard)
 * - API returns paginated response
 * - Soft deletes handled server-side
 */

const route = useRoute();
const router = useRouter();

// State
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
});

const filters = ref({
  search: (route.query.search as string) || '',
  category: (route.query.category as string) || '',
});

// Fetch products
async function fetchProducts(page = 1) {
  loading.value = true;
  error.value = null;

  try {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', '20');
    
    if (filters.value.search) {
      params.append('search', filters.value.search);
    }
    if (filters.value.category) {
      params.append('category_id', filters.value.category);
    }

    const response = await fetch(`/api/products?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    products.value = data.data;
    pagination.value = data.meta;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    loading.value = false;
  }
}

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  pagination.value.current_page = 1;
  updateQueryParams();
  fetchProducts(1);
}, 300);

// Update URL query params
function updateQueryParams() {
  const query: Record<string, string> = {};
  if (filters.value.search) query.search = filters.value.search;
  if (filters.value.category) query.category = filters.value.category;
  
  router.replace({ query });
}

// Change page
function changePage(page: number) {
  pagination.value.current_page = page;
  fetchProducts(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle delete
async function handleDelete(product: Product) {
  if (!confirm(`Delete "${product.name}"?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/products/${product.id}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }

    // Remove from list
    products.value = products.value.filter(p => p.id !== product.id);
    pagination.value.total--;
  } catch (err) {
    alert('Failed to delete product');
  }
}

// Watch for filter changes
watch(() => filters.value.category, () => {
  pagination.value.current_page = 1;
  updateQueryParams();
  fetchProducts(1);
});

// Initial load
fetchProducts();

// Load categories
fetch('/api/categories')
  .then(r => r.json())
  .then(data => categories.value = data.data)
  .catch(console.error);
</script>
```

### Composables
```typescript
// resources/js/composables/useProducts.ts
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import type { Product, PaginationMeta, ProductFilters } from '../types';

interface UseProductsReturn {
  products: Ref<Product[]>;
  pagination: Ref<PaginationMeta>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchProducts: (page?: number, filters?: ProductFilters) => Promise<void>;
  createProduct: (data: Partial<Product>) => Promise<Product>;
  updateProduct: (id: number, data: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const products = ref<Product[]>([]);
  const pagination = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const loading = ref(false);
  const error = ref<string | null>(null);

  const csrfToken = computed(() => 
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
  );

  async function fetchProducts(
    page = 1,
    filters: ProductFilters = {}
  ): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(pagination.value.per_page));

      if (filters.search) params.append('search', filters.search);
      if (filters.category_id) params.append('category_id', String(filters.category_id));

      const response = await fetch(`/api/products?${params.toString()}`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      products.value = data.data;
      pagination.value = data.meta;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load products';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(data: Partial<Product>): Promise<Product> {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken.value,
      },
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }

    const result = await response.json();
    return result.data;
  }

  async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken.value,
      },
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }

    const result = await response.json();
    
    // Update local state
    const index = products.value.findIndex(p => p.id === id);
    if (index !== -1) {
      products.value[index] = result.data;
    }

    return result.data;
  }

  async function deleteProduct(id: number): Promise<void> {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-TOKEN': csrfToken.value,
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }

    products.value = products.value.filter(p => p.id !== id);
    pagination.value.total--;
  }

  return {
    products,
    pagination,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
```

## Routes
```php
<?php

// routes/api.php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All API routes are stateless and return JSON.
| Authentication via Sanctum tokens or session.
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Products
    Route::apiResource('products', ProductController::class);
    
    // Categories (read-only for users)
    Route::get('/categories', [CategoryController::class, 'index']);
});

// Public routes (if any)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
```

## Testing
```php
<?php

// tests/Feature/ProductApiTest.php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_products(): void
    {
        $user = User::factory()->create();
        $products = Product::factory()->count(5)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/products');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'sku', 'price', 'user'],
                ],
                'meta' => ['current_page', 'last_page', 'total'],
            ]);
    }

    public function test_user_cannot_see_others_products(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        Product::factory()->count(3)->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/products');

        $response->assertOk();
        $this->assertCount(0, $response->json('data'));
    }

    public function test_user_can_create_product(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', [
                'name' => 'Test Product',
                'description' => 'A test product',
                'sku' => 'TEST001',
                'price' => 99.99,
                'quantity' => 10,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Test Product');

        $this->assertDatabaseHas('products', [
            'sku' => 'TEST001',
            'user_id' => $user->id,
        ]);
    }

    public function test_duplicate_sku_is_rejected(): void
    {
        $user = User::factory()->create();
        Product::factory()->create([
            'user_id' => $user->id,
            'sku' => 'DUPLICATE',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', [
                'name' => 'Another Product',
                'sku' => 'DUPLICATE',
                'price' => 50.00,
                'quantity' => 5,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['sku']);
    }

    public function test_user_can_delete_own_product(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/products/{$product->id}");

        $response->assertOk();
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_user_cannot_delete_others_product(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/products/{$product->id}");

        $response->assertForbidden();
    }
}
```

## Security Checklist

- [ ] APP_KEY set and not committed
- [ ] APP_DEBUG=false in production
- [ ] CSRF tokens on all state-changing requests
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (Blade escaping, vue auto-escaping)
- [ ] Authorization policies on all resources
- [ ] Rate limiting on auth endpoints
- [ ] Password hashing (bcrypt default)
- [ ] Session security (regenerate on login)
- [ ] HTTPS in production
- [ ] Secure cookies
- [ ] Input validation on all forms
- [ ] Activity logging for sensitive operations

## SUMMARY

Laravel + Vue stack:
1. Use Eloquent models with proper relations and scopes
2. Form Request validation for all inputs
3. Policies for authorization checks
4. Service layer for complex business logic
5. Vue 3 Composition API with TypeScript
6. API resource responses with metadata
7. Soft deletes for data integrity
8. Full test coverage with PHPUnit and Pest
