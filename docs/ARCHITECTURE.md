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
- **Content**: MDX + Contentlayer
- **Styling**: Tailwind CSS + Radix UI primitives
- **Deployment**: Vercel
- **Testing**: Unit (Vitest/Jest) + E2E (Playwright)

## High-Level Design

- `app/` — Route segments and layout composition using the App Router
- `content/` — Markdown/MDX source of truth for pages and CV content
- `lib/` — Shared utilities (SEO, analytics, schema JSON-LD, Contentlayer helpers)
- `components/` — Reusable presentational and layout components
- `styles/` — Global and design token styles
- `scripts/` — Automation scripts (OG generation, link validation, a11y audits)

Rendering is handled primarily via **Server Components**, with Client Components
introduced only where interactivity is required.
