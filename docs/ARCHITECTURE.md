# Architecture Overview

This document describes the technical architecture of the `vicenteopaso-vibecode` site, including system components, key flows, and deployment model.

## Goals

- Future-proof, SEO-first personal site
- Minimal client-side JavaScript
- Accessible by default (WCAG-aware)
- Easy to extend with new content and sections

## Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Next.js 15 (App Router, RSC)
- **Content**: Markdown + JSON CV, with Contentlayer configured for future refactors
- **Styling**: Tailwind CSS v4 + Radix UI primitives
- **Deployment**: Vercel
- **Testing**: Unit (Vitest) + E2E (Playwright)
- **Observability**: Vercel Analytics/Speed Insights + Sentry (sampled traces, replay, alerts)

## System Map

```
┌─────────────────────────────────────────────────────────────┐
│                   Vercel (CDN + Edge Network)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Next.js App Router (SSR + SSG)                       │  │
│  │  ├─ app/                  (routes & layouts)          │  │
│  │  ├─ app/components/       (UI components)             │  │
│  │  ├─ app/api/              (API routes)                │  │
│  │  └─ lib/                  (utilities & services)      │  │
│  └───────────────────────────────────────────────────────┘  │
│           ▲                        │                         │
│           │                        ▼                         │
│  ┌────────────────┐      ┌──────────────────┐               │
│  │  content/      │      │  Security Headers │               │
│  │  (markdown)    │      │  - CSP            │               │
│  │                │      │  - COOP/COEP      │               │
│  └────────────────┘      └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
         │                           │
         │                           └──────────────┐
         │                                          ▼
         │                              ┌────────────────────────┐
         │                              │  External Services     │
         │                              │  ├─ Cloudflare         │
         │                              │  │   Turnstile         │
         │                              │  ├─ Formspree          │
         │                              │  └─ Sentry (errors)    │
         │                              └────────────────────────┘
         │
         └──────► Build Time (Contentlayer optional)
```

## High-Level Design

- `app/` — Route segments and layout composition using the App Router
- `content/` — Markdown source of truth for pages and CV content
- `lib/` — Shared utilities (SEO, analytics, schema JSON-LD, Contentlayer helpers)
- `components/` — Reusable presentational and layout components
- `styles/` — Global and design token styles
- `scripts/` — Automation scripts (OG generation, link validation, a11y audits)

Rendering is handled primarily via **Server Components**, with Client Components
introduced only where interactivity is required.

## Content Model & Rendering

- `content/about.md` contains frontmatter and markdown for the About page.
- `content/cv.md` contains frontmatter and a JSON object in the markdown body for the CV.
- `app/about/page.tsx` and `app/cv/page.tsx` currently read these files directly at runtime using `fs` + `gray-matter` / `JSON.parse`.
- Contentlayer is configured and may be used in the future, but the filesystem remains the runtime source of truth for About/CV.

**Content Rendering Flow:**

```
User requests /about or /cv
  ↓
Next.js page component (SSG at build time with force-static)
  ↓
Read markdown from content/ directory (fs.readFileSync)
  ↓
Parse frontmatter with gray-matter
  ↓
For CV: extract and parse JSON object from body
  ↓
Render with ReactMarkdown or custom components
  ↓
Apply sanitization (sanitize-html) for rich content
  ↓
Return HTML to client
```

**Key files:**

- `app/about/page.tsx` - renders `content/about.md`
- `app/cv/page.tsx` - renders `content/cv.md` with JSON CV parsing
- `lib/sanitize-html.ts` - sanitizes rich content

**Error handling:**

- CV JSON parsing has graceful fallbacks for invalid JSON
- Missing files handled with appropriate error boundaries
- Logs errors to Sentry in production

## Contact Flow

The contact form implements defense-in-depth with multiple validation layers:

**Contact Form Submission Flow:**

```
User opens contact dialog
  ↓
ContactDialog component loads Cloudflare Turnstile
  ↓
User fills form (email, message, optional phone)
  ↓
Turnstile challenge completes → token received
  ↓
Client POSTs to /api/contact
  ↓
API route validates:
  - Request origin (domain check)
  - Honeypot field (spam filter)
  - Rate limiting (per-IP)
  - Turnstile token verification
  - Form data schema (Zod)
  ↓
If valid: forward to Formspree
  ↓
Return success/error to client
  ↓
Client shows confirmation or error message
```

**Key files:**

- `app/components/ContactDialog.tsx` - client component with Turnstile integration
- `app/api/contact/route.ts` - API route handler with validation
- `lib/rate-limit.ts` - in-memory rate limiting (best-effort, per-instance)

**Security measures:**

- Cloudflare Turnstile verification (CAPTCHA alternative)
- Honeypot field to catch simple bots
- Origin/domain validation
- Rate limiting by client IP
- Content Security Policy (CSP) headers

**Data Flow Diagram:**

```
┌──────────┐      ┌──────────────┐      ┌─────────────┐
│  User    │─────▶│ ContactDialog│─────▶│ Cloudflare  │
│  Browser │      │  Component   │      │ Turnstile   │
└──────────┘      └──────────────┘      └─────────────┘
     ▲                    │                     │
     │                    ▼                     ▼
     │            ┌──────────────┐      ┌─────────────┐
     │            │  /api/contact│◀─────│   Token     │
     │            │  Route       │      │ Verification│
     │            └──────────────┘      └─────────────┘
     │                    │
     │                    ▼
     │            ┌──────────────┐
     └────────────│  Formspree   │
                  │  Email API   │
                  └──────────────┘
```

## SEO & Metadata

- SEO is centralized in a small `lib/seo` layer (site config, base metadata, and JSON-LD helpers).
- `app/layout.tsx` uses the Next.js Metadata API for titles, descriptions, and Open Graph tags.
- JSON-LD for `WebSite` and `Person` schema is injected via a dedicated component used in the root layout.
- Open Graph images are generated via a dedicated route (`app/opengraph-image.tsx`).

**SEO Implementation:**

- `lib/seo.ts` - single source of truth for site config (name, URL, description)
- `baseMetadata()` - returns Next.js `Metadata` object with defaults
- `getWebsiteJsonLd()` - generates WebSite schema JSON-LD
- `getPersonJsonLd()` - generates Person schema JSON-LD
- `app/components/SeoJsonLd.tsx` - injects JSON-LD scripts

**Structured Data:**

- `WebSite` schema on all routes
- `Person` schema on `/about` and `/cv` only
- See `docs/SEO_GUIDE.md` for full details

## Testing & Coverage

- Unit tests are written with Vitest and run in a jsdom environment.
- Playwright handles end-to-end tests under `test/e2e`, targeting `http://localhost:3000`.
- Coverage is collected via Vitest with thresholds set around 80% for lines, statements, branches, and functions.
- CI runs linting, typechecking, unit tests, coverage, E2E tests, accessibility checks, and CodeQL analysis on PRs and pushes to `main`.

**Test Commands:**

```bash
pnpm test              # Run Vitest unit tests
pnpm test:e2e          # Run Playwright E2E tests
pnpm test:coverage     # Run tests with coverage report
```

## Security Architecture

**Security Headers Flow:**

```
All HTTP responses from Vercel
  ↓
next.config.mjs applies security headers
  ↓
Headers attached to response:
  - Content-Security-Policy (CSP)
  - X-Frame-Options (DENY)
  - X-Content-Type-Options (nosniff)
  - Referrer-Policy (no-referrer-when-downgrade)
  - Permissions-Policy (restrictive)
  - Cross-Origin-Opener-Policy (same-origin)
  - Cross-Origin-Resource-Policy (same-origin)
  ↓
Browser enforces policies
```

**Defense in Depth:**

1. **Network Layer**: Vercel edge network with DDoS protection, CDN caching, HTTPS enforcement
2. **Application Layer**: CSP, CORS restrictions, input validation (Zod), output sanitization
3. **API Layer**: Rate limiting, honeypot filter, Turnstile verification, origin checks
4. **Monitoring**: Sentry error tracking, Vercel logs, structured logging

**CSP Configuration** (from `next.config.mjs`):

- Scripts: self, Turnstile, inline Next.js
- Styles: self, inline (Tailwind)
- Images: self, data URIs
- Frames: Turnstile only
- Connect: self, Turnstile, Formspree
- Form actions: self, Formspree

See `docs/SECURITY_POLICY.md` for full security guidelines.

## Observability & Error Handling

**Current approach**: Vercel's observability is complemented by Sentry for aggregation, replay, and alerts.

- **Vercel Analytics**: Page views, user interactions
- **Vercel Speed Insights**: Core Web Vitals, performance metrics
- **Vercel Logs**: Server-side error logs (all `console.error()` output)
- **Production source maps**: Stack traces show original TypeScript line numbers
- **Sentry (Next.js SDK)**: Client/server exception tracking, issue grouping, breadcrumbs, session replay, and alerting

Sentry is configured via `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`, with structured logging wired through `lib/error-logging.ts` and a `GlobalErrorHandler` client component.

**Why this stack?** For a low-traffic personal portfolio, Vercel's observability provides a solid baseline, while Sentry adds aggregation, replay, and alerting with minimal complexity. Sampling keeps overhead reasonable while still surfacing meaningful issues.

**When to tune**: If traffic exceeds ~10k users/month or error volume grows, revisit Sentry sampling and alert rules rather than adding new tooling.

See **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** for full error handling patterns and debugging workflows.

## Build & Deployment Pipeline

### Local Development

```bash
pnpm dev              # Start dev server (port 3000)
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm typecheck        # TypeScript compilation check
pnpm test             # Run Vitest unit tests
pnpm test:e2e         # Run Playwright E2E tests
```

### Build Process

```
1. pnpm install            # Install dependencies
2. pnpm content            # (Optional) Generate Contentlayer types
3. pnpm build              # Next.js production build
   ├─ Compile TypeScript
   ├─ Generate static pages (SSG)
   ├─ Optimize assets
   ├─ Generate sitemap (next-sitemap)
   └─ Output to .next/
4. pnpm start              # Production server
```

### CI/CD (GitHub Actions → Vercel)

```
Git push to main branch
  ↓
GitHub Actions triggered
  ├─ Run linters (ESLint, Prettier)
  ├─ Run type checks (TypeScript)
  ├─ Run unit tests (Vitest)
  ├─ Run E2E tests (Playwright)
  └─ Run accessibility audit
  ↓
If checks pass:
  ↓
Vercel deployment triggered
  ├─ Install dependencies
  ├─ Run build command
  ├─ Deploy to edge network
  ├─ Assign preview URL (for PRs)
  └─ Promote to production (for main branch)
  ↓
Live at opa.so
```

**Environment variables (Vercel):**

- `NEXT_PUBLIC_FORMSPREE_KEY` - Formspree form ID
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret (server-side)
- `SENTRY_DSN` - Sentry error tracking DSN
- `SENTRY_AUTH_TOKEN` - Sentry auth token for source maps

## Directory Structure

```
app/
├── layout.tsx               # Root layout with providers
├── page.tsx                 # Home page
├── about/
│   └── page.tsx            # About page (reads content/about.md)
├── cv/
│   └── page.tsx            # CV page (reads content/cv.md)
├── api/
│   └── contact/
│       └── route.ts        # Contact form API route
├── components/             # Shared UI components
│   ├── ContactDialog.tsx   # Contact form modal
│   ├── ErrorBoundary.tsx   # React error boundary
│   ├── Header.tsx          # Site header
│   ├── Footer.tsx          # Site footer
│   └── ...
└── config/
    └── cv.ts               # CV configuration

content/
├── about.md                # About page content
├── cv.md                   # CV data (JSON + frontmatter)
├── privacy-policy.md       # Privacy policy
└── cookie-policy.md        # Cookie policy

lib/
├── seo.ts                  # SEO utilities & metadata
├── error-logging.ts        # Sentry integration
├── rate-limit.ts           # Rate limiting logic
└── sanitize-html.ts        # HTML sanitization

styles/
└── globals.css             # Design tokens & global styles

test/
├── unit/                   # Vitest unit tests
└── e2e/                    # Playwright E2E tests
```

## Performance Optimization

- **Static Generation**: About/CV pages statically generated at build time
- **Image Optimization**: Next.js Image component with automatic WebP conversion
- **Code Splitting**: Automatic route-based code splitting
- **Font Optimization**: Self-hosted variable fonts with `font-display: swap`
- **CSS Optimization**: Tailwind CSS purges unused styles
- **Edge Caching**: Static assets cached at CDN edge
- **Lazy Loading**: Components lazy-loaded where appropriate
- **Analytics**: Vercel Speed Insights for Core Web Vitals monitoring

**Core Web Vitals targets:**

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## Related Documentation

- **[WARP.md](../WARP.md)** — High-level project overview and structure
- **[README.md](../README.md)** — Setup instructions and quick start
- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** — Accessibility strategy
- **[SEO_GUIDE.md](./SEO_GUIDE.md)** — SEO implementation
- **[SECURITY_POLICY.md](./SECURITY_POLICY.md)** — Security headers and defense-in-depth
- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — Error handling and observability
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** — Development workflow and standards
