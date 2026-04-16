# Next.js 14 Full Stack Template

From One to Sixty-Seven behavioral contract optimized for Next.js 14 full-stack development.

---

## Quick Start

### 1. Copy Configuration Files

```bash
# From this template directory
cp CLAUDE.md /path/to/your/nextjs-project/
cp .cursorrules /path/to/your/nextjs-project/  # If using Cursor
```

### 2. Install Dependencies

```bash
# Core dependencies already in your Next.js project
npm install zod                 # Validation
npm install @prisma/client      # Database (optional)
npm install swr                 # Data fetching (optional)
```

### 3. Verify Installation

Ask your AI assistant:
```
What rules are you following for this Next.js project?
```

Should reference:
- From One to Sixty-Seven core spec
- Next.js 14 specific rules
- App Router patterns
- Server/Client Component guidelines

---

## What's Included

### Core Spec
- All 26 core rules from From One to Sixty-Seven
- Goal restatement, minimal changes, SUMMARY blocks
- Security, error handling, testing requirements

### Next.js Specific
- **App Router**: Directory structure and conventions
- **Server Components**: Default pattern, when to use
- **Client Components**: 'use client' guidelines
- **Data Fetching**: Caching strategies, Server vs Client
- **API Routes**: Route handlers, validation, error handling
- **Performance**: next/image, next/link, next/script, next/font
- **TypeScript**: Strict mode, prop types
- **Server Actions**: Form submissions, mutations
- **Project Structure**: Recommended layout
- **Testing**: Component and API testing patterns

---

## Recommended Stack

This template is optimized for:

- **Next.js 14** (App Router)
- **TypeScript** (Strict mode)
- **Tailwind CSS** (Styling)
- **Prisma** (ORM) - Optional
- **Zod** (Validation)
- **NextAuth.js** or **Clerk** (Auth)
- **Vercel** (Deployment)

---

## Key Differences from Base Spec

### Next.js Additions

1. **App Router Patterns**
   - layout.tsx, loading.tsx, error.tsx
   - Route groups (marketing)
   - Parallel routes (@modal)
   - Intercepting routes

2. **Server Component First**
   - Fetch data in Server Components
   - Minimize 'use client' usage
   - Proper data flow patterns

3. **Performance Built-in**
   - Automatic image optimization
   - Font optimization
   - Script loading strategies
   - Route prefetching

4. **Type Safety**
   - Typed API routes
   - Typed page props
   - Strict TypeScript configuration

---

## Project Structure

```
my-app/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with fonts
│   ├── page.tsx             # Home page
│   ├── loading.tsx          # Loading UI
│   ├── error.tsx            # Error boundary
│   ├── globals.css          # Tailwind + globals
│   │
│   ├── api/                 # API routes
│   │   └── users/
│   │       └── route.ts
│   │
│   └── dashboard/           # Example route
│       ├── layout.tsx
│       ├── page.tsx
│       └── loading.tsx
│
├── components/              # React components
│   ├── ui/                 # Button, Card, Input, etc.
│   └── forms/              # Form-specific components
│
├── lib/                    # Utilities
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # Auth helpers
│   └── utils.ts           # cn() and helpers
│
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript types
├── public/                 # Static assets
├── tests/                  # Test files
├── .env.local             # Environment variables
├── next.config.js         # Next.js config
├── tailwind.config.ts     # Tailwind config
└── tsconfig.json         # TypeScript config
```

---

## Common Patterns

### Server Component with Data

```tsx
// app/users/page.tsx
async function UsersPage() {
  const users = await fetch('https://api.example.com/users')
    .then(r => r.json())
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### Client Component with Interactivity

```tsx
'use client'

function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false)
  
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'}
    </button>
  )
}
```

### API Route with Validation

```tsx
// app/api/posts/route.ts
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const CreatePostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const validated = CreatePostSchema.safeParse(body)
  if (!validated.success) {
    return NextResponse.json(
      { error: validated.error.flatten() },
      { status: 400 }
    )
  }
  
  const post = await createPost(validated.data)
  return NextResponse.json({ post }, { status: 201 })
}
```

### Server Action for Forms

```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const post = await db.post.create({
    data: {
      title: formData.get('title'),
      content: formData.get('content'),
    }
  })
  
  revalidatePath('/posts')
  return post
}
```

---

## Environment Variables

### Required

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Auth (choose one)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
# OR
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."

# API Keys (server-side only)
STRIPE_SECRET_KEY="sk_live_..."
OPENAI_API_KEY="sk-..."

# Public (exposed to browser)
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

---

## Testing

### Install Test Dependencies

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D jest-environment-jsdom
npm install -D @types/jest
```

### Run Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # With coverage
```

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Zero configuration. Optimized for Next.js.

### Self-Hosted with Docker

```bash
# Build production image
docker build -t my-nextjs-app .

# Run
docker run -p 3000:3000 my-nextjs-app
```

See `Dockerfile` in Next.js docs for production build.

---

## Customization

### Adding Project-Specific Rules

Append to `CLAUDE.md`:

```markdown
## Project-Specific Rules

### Auth
- Use Clerk for authentication
- Protect routes with middleware.ts
- Check auth in Server Actions

### Database
- Use Prisma for all database access
- Run migrations before deploying
- Use connection pooling in production

### API Integration
- Use tRPC for internal APIs
- Use REST for external APIs
- Cache aggressively with React Query
```

---

## Troubleshooting

### "Server Component can't use useState"

**Solution:** Move interactivity to Client Component, keep data fetching in Server Component.

```tsx
// Server Component
async function Page() {
  const data = await fetchData() // ✅ OK
  return <ClientComponent initialData={data} />
}

// Client Component
'use client'
function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData) // ✅ OK
}
```

### "Cannot read environment variable"

**Solution:** Check variable name. Server vars don't have `NEXT_PUBLIC_` prefix.

```env
# Server-side (OK in Server Components)
SECRET_KEY="value"

# Client-side (OK in Client Components)
NEXT_PUBLIC_API_URL="value"
```

### "Image optimization failed"

**Solution:** Add domains to `next.config.js`:

```javascript
module.exports = {
  images: {
    domains: ['cdn.example.com', 'avatars.githubusercontent.com']
  }
}
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn Course](https://nextjs.org/learn)
- [Vercel Templates](https://vercel.com/templates)
- [From One to Sixty-Seven](../../CLAUDE.md)

---

## Contributing

Found an issue with this template? 

1. Open issue in main repo
2. Tag with `template:nextjs`
3. Propose changes with SUMMARY block

---

## License

MIT — See [LICENSE](../../LICENSE)
