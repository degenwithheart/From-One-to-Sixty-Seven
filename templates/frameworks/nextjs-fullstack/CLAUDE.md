# From One to Sixty-Seven: Next.js 14 Full Stack

Behavioral contract for Next.js 14 full-stack development with App Router.

---

## Core Rules (From One to Sixty-Seven Base)

[Include all 20 core rules from main CLAUDE.md]

### Before Writing Code

1. **Restate the goal** before writing code.
2. If the task is ambiguous, **present 2-3 interpretations** and ask which is correct.
3. Identify which files and modules will be affected.

### Code Changes

4. **Change only what the task requires**. Nothing more.
5. Match the existing code style, indentation, and patterns exactly.
6. **No new abstractions** unless the task explicitly requires them.
7. **Do not refactor unrelated code**. Note it separately.
8. Do not write speculative code for requirements that don't exist yet.

### Simplicity

9. Prefer simple, explicit, "boring" code over clever solutions.
10. No nested ternary operators. Use if-statements.

### Testing

11. When fixing a bug, write a failing test that reproduces it first.
12. Every significant change needs tests for: happy path, edge cases, error paths.

### Communication

13. Always declare assumptions explicitly in an `ASSUMPTIONS:` block.
14. If the task is ambiguous and you proceed, the `ASSUMPTIONS:` block is mandatory.

### Security

15. Never hardcode secrets, API keys, or credentials.
16. Never log passwords, tokens, or PII even partially.
17. Never build SQL queries via string concatenation or interpolation.
18. Validate all external input at the trust boundary with allowlists.

### Error Handling

19. Every code path must handle errors gracefully. No silent failures.
20. Fail loudly in development, fail gracefully in production.

### Verification

21. After any non-trivial change, confirm it compiles, tests pass, edge cases handled.

### Dependencies

22. Add dependencies only when the benefit clearly outweighs the cost.

### Tool Usage

23. Use the right tool for the job. Don't use a chainsaw when scissors will do.

### Documentation

24. Every public function needs a docstring.
25. Comments should explain why, not what.

### Final Statement

26. End every significant code change with a SUMMARY block.

---

## Next.js 14 Specific Rules

### App Router (Required)

**Use App Router for all new code.**

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── loading.tsx             # Loading UI
├── error.tsx               # Error boundary
├── not-found.tsx           # 404 page
├── globals.css             # Global styles
│
├── (marketing)/            # Route groups
│   ├── about/
│   └── pricing/
│
├── dashboard/
│   ├── layout.tsx          # Dashboard layout
│   ├── page.tsx            # Dashboard page
│   ├── loading.tsx         # Dashboard loading
│   ├── settings/
│   │   └── page.tsx        # Nested route
│   └── @modal/             # Parallel route
│
├── api/                    # Route handlers
│   └── users/
│       └── route.ts        # REST API
│
└── [...catchall]/          # Catch-all routes
    └── page.tsx
```

**Rules:**
- Place pages in `app/` directory
- Use `layout.tsx` for shared UI
- Use `loading.tsx` for loading states
- Use `error.tsx` for error boundaries
- Use `not-found.tsx` for 404 handling
- Use `template.tsx` for re-mounting layouts
- Use `default.tsx` for parallel route defaults

### Server vs Client Components

**Server Components by default.**

Use `'use client'` directive ONLY when:

1. **Browser APIs**
   ```typescript
   'use client'
   
   export function LocalStorageDemo() {
     useEffect(() => {
       localStorage.setItem('key', 'value')
     }, [])
   }
   ```

2. **Event handlers that need DOM**
   ```typescript
   'use client'
   
   export function ClickButton() {
     return <button onClick={() => alert('clicked')}>Click</button>
   }
   ```

3. **React hooks that need DOM refs**
   ```typescript
   'use client'
   
   export function Canvas() {
     const canvasRef = useRef<HTMLCanvasElement>(null)
     
     useEffect(() => {
       const ctx = canvasRef.current?.getContext('2d')
       // Canvas operations
     }, [])
     
     return <canvas ref={canvasRef} />
   }
   ```

4. **Third-party components that need DOM**
   ```typescript
   'use client'
   
   import { ThirdPartyChart } from 'some-library'
   
   export function Chart() {
     return <ThirdPartyChart data={data} />
   }
   ```

**When in doubt, start as Server Component and add 'use client' only when needed.**

### Data Fetching

**Fetch in Server Components when possible.**

```typescript
// ✅ Server Component - fetch directly
async function UserProfile({ userId }: { userId: string }) {
  const user = await fetch(`https://api.example.com/users/${userId}`, {
    next: { revalidate: 3600 } // ISR
  }).then(r => r.json())
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

// ✅ Client Component - use SWR or React Query
'use client'

import useSWR from 'swr'

function UserProfile({ userId }: { userId: string }) {
  const { data: user, error } = useSWR(
    `/api/users/${userId}`,
    fetcher
  )
  
  if (error) return <div>Failed to load</div>
  if (!user) return <div>Loading...</div>
  
  return (
    <div>
      <h1>{user.name}</h1>
    </div>
  )
}
```

**Caching strategies:**

```typescript
// Static (default) - cached indefinitely
fetch('https://api.example.com/data')

// Dynamic - no caching
fetch('https://api.example.com/data', { cache: 'no-store' })

// ISR - revalidate every hour
fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }
})

// On-demand revalidation
// In route handler or server action:
revalidateTag('users')
```

### API Routes (Route Handlers)

**Use Route Handlers in `app/api/`.**

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const users = await getUsers({ page, limit })
    
    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    const result = CreateUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      )
    }
    
    const user = await createUser(result.data)
    
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof UserExistsError) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
```

### TypeScript Types

**Strict mode required.**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Page props types:**

```typescript
// Typed page props
interface PageProps {
  params: {
    id: string
    // For [id]/page.tsx
  }
  searchParams: {
    // Query params
    page?: string
    limit?: string
  }
}

export default async function UserPage({ params }: PageProps) {
  const user = await getUser(params.id)
  // ...
}

// Layout props
interface LayoutProps {
  children: React.ReactNode
  params: {
    slug: string
  }
}

export default function DashboardLayout({ children }: LayoutProps) {
  return <div>{children}</div>
}

// Parallel routes
interface ParallelLayoutProps {
  children: React.ReactNode
  modal: React.ReactNode
}

export default function Layout({ children, modal }: ParallelLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

### Performance Rules

**Always use Next.js built-in components:**

```typescript
// ✅ Use next/image
import Image from 'next/image'

<Image
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // For above-fold images
/>

// ❌ Don't use plain <img>
<img src="/photo.jpg" alt="Description" />

// ✅ Use next/link
import Link from 'next/link'

<Link href="/about">About</Link>

// ❌ Don't use plain <a> for internal navigation
<a href="/about">About</a>

// ✅ Use next/script for third-party scripts
import Script from 'next/script'

<Script
  src="https://analytics.com/script.js"
  strategy="lazyOnload"
/>

// ✅ Use next/font
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### Database Integration

**Use Prisma or Drizzle with Server Components.**

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// app/users/page.tsx
import { prisma } from '@/lib/db'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  })
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.email}</li>
      ))}
    </ul>
  )
}
```

### Server Actions

**Use for form submissions and mutations.**

```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

export async function createUser(formData: FormData) {
  const validated = CreateUserSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
  })
  
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors }
  }
  
  try {
    const user = await prisma.user.create({
      data: validated.data
    })
    
    revalidatePath('/users')
    return { success: true, user }
  } catch (error) {
    return { error: 'Failed to create user' }
  }
}

// app/users/new/page.tsx
import { createUser } from './actions'

export default function NewUserPage() {
  return (
    <form action={createUser}>
      <input name="email" type="email" required />
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

### Environment Variables

**Use NEXT_PUBLIC_ only for client-side variables.**

```env
# .env.local
# Server-side only (safe)
DATABASE_URL="postgresql://..."
STRIPE_SECRET_KEY="sk_live_..."
JWT_SECRET="secret..."

# Client-side (exposed to browser)
NEXT_PUBLIC_API_URL="https://api.example.com"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

### Middleware

**Use for authentication, headers, redirects.**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  
  // Protect routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Add headers
  const response = NextResponse.next()
  response.headers.set('x-request-id', generateId())
  
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*']
}
```

---

## Project Structure

### Recommended Layout

```
my-nextjs-app/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── loading.tsx          # Loading UI
│   ├── error.tsx            # Error boundary
│   ├── globals.css          # Global styles
│   │
│   ├── api/                 # Route handlers
│   │   └── users/
│   │       └── route.ts
│   │
│   ├── (marketing)/         # Route group (no URL segment)
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── pricing/
│   │       └── page.tsx
│   │
│   └── dashboard/           # Dashboard section
│       ├── layout.tsx
│       ├── page.tsx
│       ├── loading.tsx
│       └── settings/
│           └── page.tsx
│
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── forms/               # Form components
│   └── layouts/             # Layout components
│
├── lib/                     # Utilities and configs
│   ├── db.ts               # Database client
│   ├── auth.ts             # Auth utilities
│   ├── api.ts              # API client
│   └── utils.ts            # Helper functions
│
├── hooks/                   # Custom React hooks
│   └── useAuth.ts
│
├── types/                   # TypeScript types
│   └── index.ts
│
├── actions/                 # Server Actions
│   └── user-actions.ts
│
├── public/                  # Static assets
│   └── images/
│
├── prisma/                  # Prisma schema (if using)
│   └── schema.prisma
│
├── tests/                   # Test files
│   ├── unit/
│   └── integration/
│
├── .env.local              # Environment variables
├── .env.example            # Example env file
├── next.config.js          # Next.js config
├── tailwind.config.ts      # Tailwind config
├── tsconfig.json           # TypeScript config
└── package.json
```

---

## Testing

### Test Structure

```typescript
// tests/unit/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })
})

// tests/integration/api.test.ts
import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/users/route'

describe('/api/users', () => {
  it('returns users list', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })
    
    await GET(req)
    
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toHaveProperty('users')
  })
})
```

---

## Deployment

### Environment Considerations

**Vercel (recommended):**
```bash
# Zero config for most cases
vercel
```

**Self-hosted:**
```javascript
// next.config.js
module.exports = {
  output: 'standalone', // For Docker
  experimental: {
    // Features for self-hosting
  }
}
```

**Docker:**
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## Verification Checklist

For Next.js projects:

- [ ] Using App Router (not Pages Router for new code)
- [ ] Server Components by default
- [ ] 'use client' only when necessary
- [ ] next/image used instead of img
- [ ] next/link used for internal navigation
- [ ] Proper loading.tsx and error.tsx
- [ ] API routes typed
- [ ] Input validation with Zod
- [ ] Environment variables properly split
- [ ] Tests for components and API
- [ ] TypeScript strict mode
- [ ] Proper caching strategies

---

## SUMMARY Template for Next.js

```markdown
SUMMARY:
- What changed: [Component/API/Feature description]
- Files affected: [List of files]
- Server/Client: [Which components are server vs client]
- Data fetching: [How data is fetched and cached]
- API changes: [If any route handlers modified]
- Why: [Business/technical reason]
- Verified:
  - [ ] TypeScript compiles
  - [ ] Linting passes
  - [ ] Tests pass
  - [ ] Manual test in browser
  - [ ] Mobile responsive (if applicable)
- Assumptions:
  - [Any assumptions made]
- Risks:
  - [Any deployment or compatibility concerns]
```

---

## See Also

- [Next.js Documentation](https://nextjs.org/docs)
- [From One to Sixty-Seven Core Spec](../../CLAUDE.md)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
