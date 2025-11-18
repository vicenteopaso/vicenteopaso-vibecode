# SEO Guide

This site treats SEO as an engineering concern.

## Core Practices

- Use the Next.js Metadata API for titles, descriptions, and Open Graph tags.
- Maintain clean, descriptive URLs (e.g., `/cv`, `/about`, `/contact`).
- Use JSON-LD structured data for Person and Website (no Articles planned for this site).
- Generate sitemaps and `robots.txt` automatically.

## Implementation Notes

### `lib/seo.ts`

- `siteConfig` is the **single source of truth** for:
  - `name` – used across metadata and JSON-LD.
  - `url` and `domain` – base URL for metadata and structured data.
  - `description` – reused in the default `Metadata` and Open Graph fields.
- `baseMetadata(overrides)` returns a Next.js `Metadata` object using `siteConfig` values and allows per-route overrides.
  - The root layout (`app/layout.tsx`) calls `baseMetadata` to define the global `metadata` export.
- `getWebsiteJsonLd()` returns the JSON-LD object for the `WebSite` schema using `siteConfig`.
- `getPersonJsonLd()` returns the JSON-LD object for the `Person` schema using `siteConfig`.

### `app/components/SeoJsonLd.tsx`

- `SeoJsonLd` is a client component that injects JSON-LD via `<Script type="application/ld+json">`:
  - Always includes the `WebSite` JSON-LD on all routes.
  - Includes the `Person` JSON-LD **only** on `/about` and `/cv` (controlled via `usePathname`).
- If you add new routes that should expose `Person` schema, update the `includePerson` condition.

### `app/layout.tsx`

- Imports and uses both helpers:
  - `baseMetadata` for the `metadata` export.
  - `SeoJsonLd` inside the `<body>` alongside the Turnstile script.
- When changing the site name, domain, or description, update `siteConfig` in `lib/seo.ts`; metadata and JSON-LD will stay in sync automatically.

## Content Practices

- Write clear, descriptive headings.
- Use one `<h1>` per page and a logical heading hierarchy.
- Prefer descriptive link text over "click here".
