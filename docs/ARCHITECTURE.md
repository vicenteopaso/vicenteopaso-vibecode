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
