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
  - Includes the `Person` JSON-LD **only** on `/` (root/About page) and `/cv` (controlled via `usePathname`).
- If you add new routes that should expose `Person` schema, update the `includePerson` condition (currently includes `/` and `/cv`).

### `app/layout.tsx` and Open Graph images

- Imports and uses both helpers:
  - `baseMetadata` for the `metadata` export.
  - `SeoJsonLd` inside the `<body>` alongside the Turnstile script.
- Open Graph images are route-specific and **locale-aware** to prevent inheritance issues:
  - **Homepage (`/`)**: Uses `app/[lang]/opengraph-image.tsx` for the homepage OG image. The `baseMetadata` function in `lib/seo.ts` references `/opengraph-image`.
    - Accepts `lang` parameter to generate locale-specific images
    - English (`/en/opengraph-image`): Uses English badge and subtitle text
    - Spanish (`/es/opengraph-image`): Uses Spanish badge and subtitle text ("Liderazgo en Ingeniería de Software, Design Systems y Experiencia del Desarrollador (DevEx)")
  - **CV (`/cv`)**: Uses `app/[lang]/cv/opengraph-image.tsx` for the CV-specific OG image. The CV page defines its own `metadata` export to override the homepage OG image with `/cv/opengraph-image`.
    - Also locale-aware with translated badge ("Currículum Vitae") and footer text ("Experiencia · Habilidades · Publicaciones · Referencias")
- When adding new routes that need custom OG images:
  1. Create an `opengraph-image.tsx` file in the route folder within `app/[lang]/`.
  2. Accept the `params: Promise<{ lang: Locale }>` parameter to support translations.
  3. Export a `metadata` object in the page to override the default OG image path.
- When changing the site name, domain, or description, update `siteConfig` in `lib/seo.ts`; metadata, JSON-LD, and OG images will stay in sync automatically.
- **Translation Note**: Opengraph images maintain "Design Systems" in English as a technical term, translating other content appropriately for each locale.

## Content Practices

- Write clear, descriptive headings.
- Use one `<h1>` per page and a logical heading hierarchy.
- Prefer descriptive link text over "click here".

## Checklist: Adding a New Route with SEO

```
Is this a new public-facing page or API route?
  ├─ YES, page: Does it need custom metadata or OG image?
  │  ├─ YES: Export metadata in page.tsx; create opengraph-image.tsx if needed
  │  │       Ensure opengraph-image.tsx accepts params: Promise<{ lang: Locale }>
  │  │       Render locale-specific text (translate non-technical terms)
  │  └─ NO: Default metadata from root layout will apply
  └─ NO, API route: You don't need SEO metadata

Does the page have translated content?
  ├─ YES: Place markdown in content/[locale]/[page-name].md
  │       Read locale from params.lang and select correct file: content/[locale]/[page-name].md
  │       Example: app/[lang]/page.tsx reads content/[locale]/about.md based on params.lang
  └─ NO: Can be hardcoded if internal/admin-only

Does the page need a special JSON-LD schema (Person, Article, etc.)?
  ├─ YES: Generate in SeoJsonLd.tsx, keyed by pathname
  │       Update the includePerson (or new) condition to include your route
  └─ NO: WebSite and BreadcrumbList (if added) schemas cover you

Is this page indexed by search engines (not robots.txt-excluded)?
  ├─ YES: Ensure robots.txt allows it (default allows all except API routes)
  │       Add to sitemaps (automatic via next-sitemap if not excluded)
  └─ NO: Add to robots.txt disallow list in next-sitemap.config.js
```

## Opengraph Image Implementation Details

### When to Use

- **All public-facing pages**: Homepage, CV, policy pages, tech stack, etc.
- **Not needed**: API routes, internal dashboards, redirects.

### How It Works

Each locale-aware opengraph image file:

1. Accepts `params: Promise<{ lang: Locale }>` from Next.js App Router
2. Extracts locale from params
3. Conditionally renders English or Spanish content
4. Uses ImageResponse API to generate PNG at 1200x630
5. Returns as a route-specific metadata handler

**Example: `app/[lang]/opengraph-image.tsx`**

```typescript
import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n/locales";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const { lang } = await params;
  const isSpanish = lang === "es";

  const title = isSpanish
    ? "Liderazgo en Ingeniería de Software"
    : "Software Engineering Leadership";

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {title}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### Adding a New Locale

To add support for a new locale (e.g., French `fr`):

1. Add the locale to `lib/i18n/locales.ts` (type `Locale`)
2. Create `content/fr/about.md`, `content/fr/cv.md`, etc.
3. Create `i18n/fr/ui.json` with French UI strings
4. Update all opengraph-image.tsx files to handle the new locale:

```typescript
const isFrench = lang === "fr";
const title = isFrench
  ? "Titre en Français"
  : isSpanish
    ? "...es..."
    : "...en...";
```

5. Verify locale routing in middleware.ts includes the new locale
6. Add E2E tests to verify opengraph generation for the new locale
