# Astro SSR + Content Collections Specific Rules

> Stack: Astro 4+ (SSR) + React/Vue/Svelte islands + Content Collections + MDX
> Variant: Content-focused static sites with dynamic capabilities

## Architecture

### Project Structure
```
project/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   └── Card.astro
│   │   ├── islands/
│   │   │   ├── Search.tsx           # Interactive island
│   │   │   └── Comments.tsx
│   │   └── layouts/
│   │       ├── Base.astro
│   │       ├── BlogPost.astro
│   │       └── Docs.astro
│   ├── content/
│   │   ├── blog/
│   │   │   ├── hello-world.mdx
│   │   │   └── config.ts            # Content collection schema
│   │   ├── docs/
│   │   │   ├── getting-started.mdx
│   │   │   └── api-reference.mdx
│   │   └── authors/
│   │       └── config.ts
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── api/
│   │   │   └── search.json.ts
│   │   └── rss.xml.ts
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   ├── content.ts
│   │   └── formatters.ts
│   └── env.d.ts
├── public/
│   ├── fonts/
│   └── images/
├── astro.config.mjs
├── tailwind.config.mjs
├── content.config.ts
└── package.json
```

## Configuration

### Astro Config
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

/**
 * Astro configuration for SSR content site.
 * 
 * ASSUMPTIONS:
 * - SSR for dynamic content
 * - Content collections for structured data
 * - MDX for rich content
 * - React islands for interactivity
 */

export default defineConfig({
  output: 'server',  // SSR mode
  adapter: vercel({
    mode: 'standalone',
    edgeMiddleware: true,
  }),
  
  integrations: [
    tailwind(),
    react({
      include: ['**/react/**/*'],
    }),
    mdx(),
    sitemap(),
  ],
  
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    remarkPlugins: [],
    rehypePlugins: [],
  },
  
  vite: {
    ssr: {
      noExternal: ['@radix-ui/*'],
    },
  },
  
  security: {
    checkOrigin: true,
  },
});
```

### Content Collections Schema
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

/**
 * Content collection schemas with full validation.
 * 
 * SECURITY NOTE:
 * - All content validated at build/parse time
 * - No user input directly rendered
 * - Sanitization for MDX content
 */

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(10).max(200),
    description: z.string().min(50).max(500),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Anonymous'),
    image: z.object({
      url: z.string().url(),
      alt: z.string(),
    }).optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    readingTime: z.number().optional(),
  }),
});

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.string(),
    order: z.number().default(0),
    category: z.enum(['getting-started', 'api', 'advanced', 'deployment']),
    prerequisites: z.array(z.string()).optional(),
    next: z.string().optional(),
    prev: z.string().optional(),
  }),
});

const authorsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string().url(),
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    website: z.string().url().optional(),
    role: z.enum(['author', 'editor', 'maintainer']),
  }),
});

export const collections = {
  blog: blogCollection,
  docs: docsCollection,
  authors: authorsCollection,
};
```

## Components

### Base Layout
```astro
---
// src/layouts/Layout.astro
import { SEO } from 'astro-seo';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

/**
 * Base layout with SEO, analytics, and security headers.
 * 
 * ASSUMPTIONS:
 * - SEO meta tags auto-generated from frontmatter
 * - CSP headers set via middleware
 * - Analytics loaded conditionally
 */

interface Props {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  publishDate?: Date;
  author?: string;
  tags?: string[];
}

const {
  title,
  description,
  image = '/default-og.jpg',
  type = 'website',
  publishDate,
  author,
  tags = [],
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const siteTitle = `${title} | My Site`;
---

<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    
    <!-- Security -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.example.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self' https://api.example.com;" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    
    <!-- SEO -->
    <SEO
      title={siteTitle}
      description={description}
      canonical={canonicalURL.toString()}
      openGraph={{
        basic: {
          title,
          type,
          image,
          url: canonicalURL.toString(),
        },
        optional: {
          description,
          siteName: 'My Site',
          locale: 'en_US',
        },
        article: type === 'article' ? {
          publishedTime: publishDate?.toISOString(),
          authors: author ? [author] : undefined,
          tags,
        } : undefined,
      }}
      twitter={{
        card: 'summary_large_image',
        site: '@mysite',
        title,
        description,
        image,
      }}
    />
    
    <!-- Preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    
    <!-- RSS -->
    <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml" />
    
    <!-- Theme -->
    <meta name="theme-color" content="#0f172a" />
    <script is:inline>
      // Theme toggle with no FOUC
      const theme = localStorage.getItem('theme') || 'system';
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
      document.documentElement.classList.toggle('dark', isDark);
    </script>
    
    <slot name="head" />
  </head>
  <body class="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded">
      Skip to main content
    </a>
    
    <Header />
    
    <main id="main" class="flex-1">
      <slot />
    </main>
    
    <Footer />
    
    <!-- Analytics (load conditionally) -->
    {import.meta.env.PROD && (
      <script is:inline async src="https://analytics.example.com/script.js" data-website-id="YOUR_ID"></script>
    )}
  </body>
</html>
```

### Blog Post Page (SSR)
```astro
---
// src/pages/blog/[...slug].astro
import { getCollection, getEntry } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import Prose from '../../components/Prose.astro';
import TableOfContents from '../../components/TableOfContents.astro';
import AuthorCard from '../../components/AuthorCard.astro';
import RelatedPosts from '../../components/RelatedPosts.astro';
import { formatDate, calculateReadingTime } from '../../utils/formatters';

/**
 * Blog post page with SSR for dynamic content.
 * 
 * ASSUMPTIONS:
 * - Content validated by collection schema
 * - Reading time calculated on demand
 * - Related posts fetched dynamically
 */

export const prerender = false;  // SSR mode

const { slug } = Astro.params;

if (!slug) {
  return Astro.redirect('/404');
}

const post = await getEntry('blog', slug);

if (!post || post.data.draft) {
  return Astro.redirect('/404');
}

const { Content, headings } = await post.render();

// Calculate reading time if not provided
const readingTime = post.data.readingTime || calculateReadingTime(post.body);

// Get related posts (same tags, excluding current)
const allPosts = await getCollection('blog', (p) => 
  !p.data.draft && p.id !== post.id
);

const relatedPosts = allPosts
  .filter((p) => p.data.tags.some((tag) => post.data.tags.includes(tag)))
  .slice(0, 3);

// Get author data
const author = await getEntry('authors', post.data.author);

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.data.title,
  description: post.data.description,
  author: {
    '@type': 'Person',
    name: author?.data.name || post.data.author,
  },
  datePublished: post.data.pubDate.toISOString(),
  dateModified: post.data.updatedDate?.toISOString(),
  image: post.data.image?.url,
};
---

<Layout
  title={post.data.title}
  description={post.data.description}
  type="article"
  publishDate={post.data.pubDate}
  author={author?.data.name}
  tags={post.data.tags}
  image={post.data.image?.url}
>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  </Fragment>
  
  <article class="max-w-4xl mx-auto px-4 py-12">
    {/* Header */}
    <header class="mb-12 text-center">
      {post.data.featured && (
        <span class="inline-block px-3 py-1 mb-4 text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          Featured
        </span>
      )}
      
      <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">
        {post.data.title}
      </h1>
      
      <p class="text-xl text-slate-600 dark:text-slate-400 mb-6">
        {post.data.description}
      </p>
      
      <div class="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <time datetime={post.data.pubDate.toISOString()}>
          {formatDate(post.data.pubDate)}
        </time>
        <span>•</span>
        <span>{readingTime} min read</span>
        {post.data.updatedDate && (
          <>
            <span>•</span>
            <span>Updated {formatDate(post.data.updatedDate)}</span>
          </>
        )}
      </div>
      
      {post.data.tags.length > 0 && (
        <div class="flex flex-wrap justify-center gap-2 mt-6">
          {post.data.tags.map((tag) => (
            <a
              href={`/blog/tag/${tag}`}
              class="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              #{tag}
            </a>
          ))}
        </div>
      )}
    </header>
    
    {/* Featured Image */}
    {post.data.image && (
      <figure class="mb-12">
        <img
          src={post.data.image.url}
          alt={post.data.image.alt}
          class="w-full h-64 md:h-96 object-cover rounded-2xl"
          loading="eager"
          width={1200}
          height={630}
        />
        <figcaption class="sr-only">{post.data.image.alt}</figcaption>
      </figure>
    )}
    
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
      {/* Main Content */}
      <Prose>
        <Content />
      </Prose>
      
      {/* Sidebar */}
      <aside class="hidden lg:block">
        <div class="sticky top-24 space-y-8">
          <TableOfContents headings={headings} />
          
          {author && <AuthorCard author={author} />}
        </div>
      </aside>
    </div>
    
    {/* Related Posts */}
    {relatedPosts.length > 0 && (
      <RelatedPosts posts={relatedPosts} />
    )}
    
    {/* Comments Island */}
    <section class="mt-16 pt-16 border-t border-slate-200 dark:border-slate-800">
      <h2 class="text-2xl font-bold mb-8">Comments</h2>
      <Comments postId={post.id} client:visible />
    </section>
  </article>
</Layout>
```

### Interactive Island Component
```tsx
// src/components/islands/Search.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

/**
 * Search component as an interactive island.
 * 
 * ASSUMPTIONS:
 * - Searches both blog posts and docs
 * - Debounced to prevent excessive API calls
 * - Keyboard navigable
 * - Accessible with ARIA
 */

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'blog' | 'docs';
  highlighted: string;
}

export function Search() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Perform search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    fetch(`/api/search.json?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setSelectedIndex(0);
      })
      .catch((err) => {
        console.error('Search failed:', err);
        setResults([]);
      })
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          window.location.href = results[selectedIndex].url;
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!resultsRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="relative" role="search">
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search articles and docs..."
          className="w-full px-4 py-2 pl-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={results[selectedIndex]?.id}
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        
        {isLoading && (
          <LoadingSpinner className="absolute right-3 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {isOpen && (query || results.length > 0) && (
        <div
          ref={resultsRef}
          id="search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
          role="listbox"
        >
          {results.length === 0 ? (
            query ? (
              <div className="p-4 text-slate-500 dark:text-slate-400">
                No results for "{query}"
              </div>
            ) : (
              <div className="p-4 text-slate-500 dark:text-slate-400">
                Type to search...
              </div>
            )
          ) : (
            <ul className="py-2">
              {results.map((result, index) => (
                <li key={result.id}>
                  <a
                    href={result.url}
                    id={result.id}
                    className={`
                      block px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700
                      ${index === selectedIndex ? 'bg-slate-100 dark:bg-slate-700' : ''}
                    `}
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={() => setIsOpen(false)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`
                        text-xs px-2 py-0.5 rounded
                        ${result.type === 'blog' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
                      `}>
                        {result.type}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {result.title}
                    </h4>
                    <p
                      className="text-sm text-slate-500 dark:text-slate-400 mt-1"
                      dangerouslySetInnerHTML={{ __html: result.highlighted }}
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin h-5 w-5 text-slate-400`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
```

### API Route (SSR Endpoint)
```typescript
// src/pages/api/search.json.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { createHighlighter } from 'shiki';

/**
 * Search API endpoint with full-text search.
 * 
 * SECURITY NOTE:
 * - Query sanitized to prevent injection
 * - Rate limiting via edge middleware
 * - No sensitive data exposed
 */

export const GET: APIRoute = async ({ request, locals }) => {
  // Rate limiting check (via middleware)
  if (locals.rateLimited) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim().toLowerCase();

  if (!query || query.length < 2) {
    return new Response(
      JSON.stringify({ results: [] }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Sanitize query
  const sanitizedQuery = query.replace(/[^\w\s-]/g, '');

  try {
    // Search in parallel
    const [blogPosts, docs] = await Promise.all([
      getCollection('blog', (post) => !post.data.draft),
      getCollection('docs'),
    ]);

    const results = [];

    // Search blog posts
    for (const post of blogPosts) {
      const score = calculateScore(post, sanitizedQuery);
      if (score > 0) {
        const body = post.body.toLowerCase();
        const index = body.indexOf(sanitizedQuery);
        const highlighted = extractHighlight(post.body, index);

        results.push({
          id: `blog-${post.id}`,
          title: post.data.title,
          description: post.data.description,
          url: `/blog/${post.slug}`,
          type: 'blog',
          score,
          highlighted,
        });
      }
    }

    // Search docs
    for (const doc of docs) {
      const score = calculateDocScore(doc, sanitizedQuery);
      if (score > 0) {
        results.push({
          id: `docs-${doc.id}`,
          title: doc.data.title,
          description: doc.data.description,
          url: `/docs/${doc.slug}`,
          type: 'docs',
          score,
          highlighted: doc.data.description,
        });
      }
    }

    // Sort by relevance and limit
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...rest }) => rest);

    return new Response(
      JSON.stringify({ results: sortedResults }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: 'Search failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

function calculateScore(post: any, query: string): number {
  let score = 0;
  const title = post.data.title.toLowerCase();
  const desc = post.data.description.toLowerCase();
  const body = post.body.toLowerCase();
  const tags = post.data.tags.map((t: string) => t.toLowerCase());

  if (title.includes(query)) score += 10;
  if (desc.includes(query)) score += 5;
  if (body.includes(query)) score += 3;
  if (tags.some((t: string) => t.includes(query))) score += 2;

  return score;
}

function calculateDocScore(doc: any, query: string): number {
  let score = 0;
  const title = doc.data.title.toLowerCase();
  const desc = doc.data.description.toLowerCase();

  if (title.includes(query)) score += 8;
  if (desc.includes(query)) score += 4;

  return score;
}

function extractHighlight(body: string, index: number): string {
  const start = Math.max(0, index - 50);
  const end = Math.min(body.length, index + 150);
  let snippet = body.slice(start, end);

  if (start > 0) snippet = '...' + snippet;
  if (end < body.length) snippet = snippet + '...';

  return snippet;
}
```

## RSS Feed (Dynamic)
```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

/**
 * Dynamic RSS feed with latest posts.
 * 
 * ASSUMPTIONS:
 * - Shows 20 most recent published posts
 * - Full content included (configurable)
 * - Validated RSS 2.0 format
 */

export const GET: APIRoute = async (context) => {
  const posts = await getCollection('blog', (post) => !post.data.draft);
  
  // Sort by date, newest first
  const sortedPosts = posts
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 20);

  return rss({
    title: 'My Site Blog',
    description: 'Latest articles and tutorials',
    site: context.site || 'https://example.com',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}`,
      categories: post.data.tags,
      author: post.data.author,
    })),
    customData: `<language>en-us</language>`,
  });
};
```

## Utilities
```typescript
// src/utils/formatters.ts
/**
 * Formatting utilities with i18n support.
 */

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  
  return formatDate(date);
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

## Security Checklist

- [ ] CSP headers configured
- [ ] No user input rendered without sanitization
- [ ] Environment variables validated
- [ ] API routes rate limited
- [ ] Content validated by Zod schemas
- [ ] X-Frame-Options set
- [ ] HTTPS enforced in production
- [ ] Analytics respect DNT header
- [ ] No sensitive data in client-side code
- [ ] Search query sanitized
- [ ] CORS properly configured
- [ ] Security headers via middleware

## SUMMARY

Astro SSR + Content Collections:
1. Use content collections for structured data
2. SSR for dynamic content (search, auth-gated content)
3. React/Vue islands for interactivity
4. Pre-render static content for performance
5. API routes for server-side operations
6. Full SEO with structured data
7. Accessibility built-in (skip links, ARIA)
8. Dark mode with no FOUC
9. Image optimization with Astro assets
10. RSS feeds auto-generated
