# Remix + Prisma Full-Stack Specific Rules

> Stack: Remix (React Router) + Prisma ORM + TypeScript + PostgreSQL
> Variant: Full-stack type-safe web development with progressive enhancement

## Architecture

### Project Structure
```
project/
├── app/
│   ├── routes/
│   │   ├── _index.tsx              # Homepage
│   │   ├── products/
│   │   │   ├── _layout.tsx        # Nested layout
│   │   │   ├── _index.tsx         # Products list
│   │   │   ├── $productId.tsx     # Product detail
│   │   │   ├── $productId.edit.tsx
│   │   │   └── new.tsx
│   │   ├── api/
│   │   │   ├── products.ts        # API routes
│   │   │   └── webhook.ts
│   │   └── auth/
│   │       ├── login.tsx
│   │       ├── register.tsx
│   │       └── logout.ts
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   │   ├── db.server.ts           # Prisma singleton
│   │   ├── session.server.ts      # Session management
│   │   └── auth.server.ts         # Auth utilities
│   ├── models/
│   │   ├── user.server.ts         # User data access
│   │   └── product.server.ts      # Product data access
│   ├── styles/
│   └── entry files...
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
├── public/
├── remix.config.js
└── package.json
```

## Database (Prisma)

### Schema Design
```prisma
// prisma/schema.prisma

// Use specific provider version
// Always enable strict mode

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed, never plain text
  name      String?
  role      Role     @default(USER)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  products  Product[]
  sessions  Session[]
  
  @@index([email])
  @@index([isActive])
  @@map("users")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  sku         String   @unique
  isActive    Boolean  @default(true) @map("is_active")
  quantity    Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  // Relations
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId  String?  @map("category_id")
  category    Category? @relation(fields: [categoryId], references: [id])
  
  @@index([userId])
  @@index([categoryId])
  @@index([isActive, createdAt])
  @@map("products")
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  products Product[]
  
  @@map("categories")
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  
  @@index([token])
  @@index([userId])
  @@map("sessions")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### Database Client Setup
```typescript
// app/utils/db.server.ts
import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton for Remix.
 * 
 * ASSUMPTIONS:
 * - One connection pool per worker
 * - Proper cleanup on shutdown
 * - Logging in development only
 */

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__db__;
}

export { prisma };

// Cleanup on process exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### Data Access Layer
```typescript
// app/models/user.server.ts
import { prisma } from '~/utils/db.server';
import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';

export type { User };

/**
 * User data access functions.
 * 
 * SECURITY NOTE:
 * - Never return password field
 * - Hash passwords before storage
 * - Validate all inputs
 */

export async function getUserById(id: string): Promise<Omit<User, 'password'> | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<Omit<User, 'password'>> {
  /**
   * ASSUMPTIONS:
   * - Email uniqueness validated at DB level
   * - Password meets complexity requirements (checked before call)
   * - bcrypt cost factor appropriate for hardware
   */
  
  const hashedPassword = await bcrypt.hash(password, 12);
  
  try {
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name?.trim(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return user;
  } catch (error) {
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      throw new Error('Email already registered');
    }
    throw error;
  }
}

export async function verifyLogin(
  email: string,
  password: string
): Promise<Omit<User, 'password'> | null> {
  const userWithPassword = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  
  if (!userWithPassword || !userWithPassword.isActive) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, userWithPassword.password);
  
  if (!isValid) {
    return null;
  }
  
  const { password: _, ...userWithoutPassword } = userWithPassword;
  return userWithoutPassword;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, 'name' | 'email'>>
): Promise<Omit<User, 'password'>> {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...data,
      email: data.email?.toLowerCase().trim(),
      name: data.name?.trim(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return user;
}

export async function softDeleteUser(id: string): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
}
```

```typescript
// app/models/product.server.ts
import { prisma } from '~/utils/db.server';
import type { Product, Prisma } from '@prisma/client';

export type { Product };

interface ProductFilter {
  userId?: string;
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'price' | 'name';
  order?: 'asc' | 'desc';
}

/**
 * Get products with filtering and pagination.
 */
export async function getProducts(
  filters: ProductFilter = {},
  pagination: PaginationParams = {}
): Promise<{ products: Product[]; total: number; pageCount: number }> {
  const { page = 1, limit = 20, orderBy = 'createdAt', order = 'desc' } = pagination;
  const skip = (page - 1) * limit;
  
  const where: Prisma.ProductWhereInput = {};
  
  if (filters.userId) where.userId = filters.userId;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }
  
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderBy]: order },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);
  
  return {
    products,
    total,
    pageCount: Math.ceil(total / limit),
  };
}

export async function getProductById(id: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { sku: sku.toUpperCase() },
  });
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Product> {
  /**
   * ASSUMPTIONS:
   * - SKU validated for uniqueness before call
   * - Price is in decimal format
   * - User exists and has permission
   */
  
  return prisma.product.create({
    data: {
      ...data,
      sku: data.sku.toUpperCase().trim(),
    },
    include: {
      category: true,
    },
  });
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>
): Promise<Product> {
  return prisma.product.update({
    where: { id },
    data: {
      ...data,
      sku: data.sku?.toUpperCase().trim(),
    },
    include: {
      category: true,
    },
  });
}

export async function softDeleteProduct(id: string): Promise<void> {
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}
```

## Session Management
```typescript
// app/utils/session.server.ts
import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { getUserById } from '~/models/user.server';
import type { User } from '~/models/user.server';

/**
 * Session configuration with security best practices.
 * 
 * SECURITY NOTE:
 * - SESSION_SECRET must be strong random string
 * - Secure flag in production
 * - SameSite strict to prevent CSRF
 * - HttpOnly to prevent XSS
 */

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<string> {
  const session = await getSession(request);
  const userId = session.get('userId');
  
  if (!userId || typeof userId !== 'string') {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  
  return userId;
}

export async function getUser(request: Request): Promise<User | null> {
  const userId = await requireUserId(request).catch(() => null);
  if (!userId) return null;
  
  const user = await getUserById(userId);
  if (!user || !user.isActive) {
    throw await logout(request);
  }
  
  return user;
}

export async function requireUser(request: Request): Promise<User> {
  const user = await getUser(request);
  if (!user) {
    throw await logout(request);
  }
  return user;
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set('userId', userId);
  
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
```

## Routes (Remix)

### Route with Loader and Action
```tsx
// app/routes/products._index.tsx
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, Form, useNavigation, Link } from '@remix-run/react';
import { getProducts, softDeleteProduct } from '~/models/product.server';
import { requireUser } from '~/utils/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
  /**
   * ASSUMPTIONS:
   * - User must be authenticated
   * - User only sees their own products (or all if admin)
   */
  const user = await requireUser(request);
  
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const categoryId = url.searchParams.get('category') || undefined;
  
  const { products, total, pageCount } = await getProducts(
    {
      userId: user.role === 'ADMIN' ? undefined : user.id,
      categoryId,
      isActive: true,
    },
    { page, limit: 20 }
  );
  
  return json({ products, total, pageCount, currentPage: page, user });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get('intent');
  const productId = formData.get('productId');
  
  if (intent === 'delete' && typeof productId === 'string') {
    /**
     * SECURITY NOTE:
     * - Verify user owns product or is admin before delete
     * - Soft delete, not hard delete
     */
    const product = await getProductById(productId);
    
    if (!product) {
      return json({ error: 'Product not found' }, { status: 404 });
    }
    
    if (product.userId !== user.id && user.role !== 'ADMIN') {
      return json({ error: 'Not authorized' }, { status: 403 });
    }
    
    await softDeleteProduct(productId);
    return json({ success: true });
  }
  
  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function ProductsIndex() {
  const { products, total, pageCount, currentPage, user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  
  const isDeleting = navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === 'delete';

  return (
    <div className="products-page">
      <div className="header">
        <h1>Products ({total})</h1>
        <Link to="/products/new" className="btn-primary">
          New Product
        </Link>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <Link to={`/products/${product.id}`}>
              <h2>{product.name}</h2>
            </Link>
            <p className="price">${product.price}</p>
            <p className="meta">
              SKU: {product.sku} • {product.quantity} in stock
            </p>
            
            <div className="actions">
              <Link to={`/products/${product.id}/edit`} className="btn-secondary">
                Edit
              </Link>
              
              {(product.userId === user.id || user.role === 'ADMIN') && (
                <Form method="post" className="inline">
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    name="intent"
                    value="delete"
                    disabled={isDeleting}
                    className="btn-danger"
                    onClick={(e) => {
                      if (!confirm('Delete this product?')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </Form>
              )}
            </div>
          </article>
        ))}
      </div>

      {pageCount > 1 && (
        <nav className="pagination">
          {currentPage > 1 && (
            <Link to={`?page=${currentPage - 1}`}>← Previous</Link>
          )}
          <span>Page {currentPage} of {pageCount}</span>
          {currentPage < pageCount && (
            <Link to={`?page=${currentPage + 1}`}>Next →</Link>
          )}
        </nav>
      )}
    </div>
  );
}
```

### Form Handling with Validation
```tsx
// app/routes/products.new.tsx
import { json, type ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { createProduct } from '~/models/product.server';
import { requireUser } from '~/utils/session.server';
import { z } from 'zod';

/**
 * Validation schema using Zod.
 * 
 * SECURITY NOTE:
 * - Never trust client input
   * - Validate all fields server-side
 * - Sanitize strings to prevent injection
 */
const ProductSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().max(2000).optional(),
  price: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Price must be a positive number'),
  sku: z.string().min(3).max(50).toUpperCase().trim(),
  quantity: z.string().default('0'),
  categoryId: z.string().optional(),
});

type ActionData = {
  errors?: {
    name?: string[];
    price?: string[];
    sku?: string[];
    quantity?: string[];
    form?: string;
  };
  values?: {
    name: string;
    description: string;
    price: string;
    sku: string;
    quantity: string;
  };
};

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  
  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    sku: formData.get('sku') as string,
    quantity: formData.get('quantity') as string,
    categoryId: formData.get('categoryId') as string,
  };
  
  // Validate with Zod
  const result = ProductSchema.safeParse(rawData);
  
  if (!result.success) {
    return json<ActionData>({
      errors: result.error.flatten().fieldErrors,
      values: rawData,
    }, { status: 400 });
  }
  
  const data = result.data;
  
  try {
    // Check SKU uniqueness
    const existing = await getProductBySku(data.sku);
    if (existing) {
      return json<ActionData>({
        errors: { sku: ['SKU already exists'] },
        values: rawData,
      }, { status: 400 });
    }
    
    const product = await createProduct({
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      sku: data.sku,
      quantity: parseInt(data.quantity, 10),
      userId: user.id,
      categoryId: data.categoryId || null,
      isActive: true,
    });
    
    return redirect(`/products/${product.id}`);
  } catch (error) {
    console.error('Failed to create product:', error);
    return json<ActionData>({
      errors: { form: ['Failed to create product. Please try again.'] },
      values: rawData,
    }, { status: 500 });
  }
}

export default function NewProduct() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="new-product-page">
      <h1>Create New Product</h1>
      
      <Form method="post" className="product-form">
        {actionData?.errors?.form && (
          <div className="error-banner" role="alert">
            {actionData.errors.form}
          </div>
        )}
        
        <div className="field">
          <label htmlFor="name">Product Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={actionData?.values?.name}
            required
            minLength={2}
            maxLength={200}
            aria-invalid={!!actionData?.errors?.name}
            aria-describedby={actionData?.errors?.name ? 'name-error' : undefined}
          />
          {actionData?.errors?.name && (
            <p id="name-error" className="error">
              {actionData.errors.name[0]}
            </p>
          )}
        </div>
        
        <div className="field">
          <label htmlFor="sku">SKU *</label>
          <input
            type="text"
            id="sku"
            name="sku"
            defaultValue={actionData?.values?.sku}
            required
            minLength={3}
            maxLength={50}
            aria-invalid={!!actionData?.errors?.sku}
          />
          {actionData?.errors?.sku && (
            <p className="error">{actionData.errors.sku[0]}</p>
          )}
        </div>
        
        <div className="field">
          <label htmlFor="price">Price ($) *</label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            min="0.01"
            defaultValue={actionData?.values?.price}
            required
          />
        </div>
        
        <div className="field">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="0"
            defaultValue={actionData?.values?.quantity || '0'}
          />
        </div>
        
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            defaultValue={actionData?.values?.description}
          />
        </div>
        
        <div className="actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </button>
          <a href="/products" className="btn-secondary">Cancel</a>
        </div>
      </Form>
    </div>
  );
}
```

## Testing

### Route Testing
```typescript
// tests/products.test.ts
import { test, expect } from '@playwright/test';

test.describe('Products', () => {
  test.beforeEach(async ({ page }) => {
    // Login before tests
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/products');
  });

  test('can create a product', async ({ page }) => {
    await page.click('text=New Product');
    await page.waitForURL('/products/new');
    
    await page.fill('[name="name"]', 'Test Product');
    await page.fill('[name="sku"]', 'TEST001');
    await page.fill('[name="price"]', '99.99');
    await page.fill('[name="quantity"]', '10');
    
    await page.click('button[type="submit"]');
    
    // Should redirect to product detail
    await page.waitForURL(/\/products\/[a-z0-9]+$/);
    
    // Verify product created
    await expect(page.locator('h1')).toContainText('Test Product');
  });

  test('shows validation errors', async ({ page }) => {
    await page.goto('/products/new');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Should show errors
    await expect(page.locator('.error')).toBeVisible();
  });

  test('can delete own product', async ({ page }) => {
    // Create a product first
    await page.goto('/products/new');
    await page.fill('[name="name"]', 'Delete Me');
    await page.fill('[name="sku"]', 'DELETE001');
    await page.fill('[name="price"]', '10');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/products\/[a-z0-9]+$/);
    
    // Delete it
    page.once('dialog', dialog => dialog.accept());
    await page.click('text=Delete');
    
    // Should redirect to products list
    await page.waitForURL('/products');
  });
});
```

## Security Checklist

- [ ] CSRF protection via SameSite cookies
- [ ] Session secret strong random string
- [ ] Password hashing with bcrypt (cost 12+)
- [ ] Rate limiting on auth endpoints
- [ ] Input validation with Zod on all forms
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (Remix auto-escapes)
- [ ] Authorization checks on every route
- [ ] Audit logging for sensitive operations
- [ ] HTTPS in production
- [ ] Secure session cookies (HttpOnly, Secure, SameSite)
- [ ] Database connection pooling configured
- [ ] Query optimization with proper indexing

## SUMMARY

Remix + Prisma stack:
1. Use Prisma schema with proper relations and indexes
2. Separate data access into model files (user.server.ts, product.server.ts)
3. Server-side validation with Zod in actions
4. Progressive enhancement - forms work without JS
5. Type safety from database through UI
6. Optimistic UI with useNavigation state
7. Soft deletes for data integrity
8. Proper session management with security headers
