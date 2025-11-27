# Architecture Overview

This document describes the technical architecture of the `vicenteopaso-vibecode` site.

## Goals

- Future-proof, SEO-first personal site
- Minimal client-side JavaScript
- Accessible by default (WCAG-aware)
- Easy to extend with new content and sections

## Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Next.js 15 (App Router, RSC)
- **Content**: Markdown + JSON CV, with Contentlayer configured for future refactors
- **Styling**: Tailwind CSS + Radix UI primitives
- **Deployment**: Vercel
- **Testing**: Unit (Vitest) + E2E (Playwright)
- **Observability**: Vercel Analytics/Speed Insights + Sentry (sampled traces, replay, alerts)

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

## Contact Flow

- Client-side contact dialog (`ContactDialog.tsx`) collects email, message, and optional phone.
- Cloudflare Turnstile is used for bot protection, with the script loaded globally in `app/layout.tsx`.
- Submissions are posted to `app/api/contact/route.ts`, which:
  - Validates input with `zod`.
  - Applies honeypot and origin checks.
  - Verifies the Turnstile token against Cloudflare.
  - Forwards valid submissions to Formspree.

## SEO & Metadata

- SEO is centralized in a small `lib/seo` layer (site config, base metadata, and JSON-LD helpers).
- `app/layout.tsx` uses the Next.js Metadata API for titles, descriptions, and Open Graph tags.
- JSON-LD for `WebSite` and `Person` schema is injected via a dedicated component used in the root layout.
- Open Graph images are generated via a dedicated route (`app/opengraph-image.tsx`).

## Testing & Coverage

- Unit tests are written with Vitest and run in a jsdom environment.
- Playwright handles end-to-end tests under `test/e2e`, targeting `http://localhost:3000`.
- Coverage is collected via Vitest with thresholds set around 80% for lines, statements, branches, and functions.
- CI runs linting, typechecking, unit tests, coverage, E2E tests, accessibility checks, and CodeQL analysis on PRs and pushes to `main`.

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

## Related Documentation

- **[WARP.md](../WARP.md)** — High-level project overview and structure
- **[README.md](../README.md)** — Setup instructions and quick start
- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** — Accessibility strategy
- **[SEO_GUIDE.md](./SEO_GUIDE.md)** — SEO implementation
- **[SECURITY_POLICY.md](./SECURITY_POLICY.md)** — Security headers and defense-in-depth
- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — Error handling and observability
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** — Development workflow and standards
