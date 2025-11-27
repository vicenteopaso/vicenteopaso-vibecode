# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Tooling & common commands

This is a single Next.js App Router project using pnpm.

- **Install dependencies**
  - `pnpm install`
- **Start dev server (Next.js, port 3000)**
  - `pnpm dev`
- **Build**
  - Standard Next.js production build: `pnpm build`
  - Full content + app build (runs Contentlayer, then Next): `node scripts/build.mjs`
- **Contentlayer generation**
  - `pnpm content` (builds `.contentlayer/generated` from files in `content/`)
- **Linting & formatting**
  - Lint all: `pnpm lint`
  - Lint and auto-fix: `pnpm lint:fix`
  - Check formatting: `pnpm format`
  - Auto-format: `pnpm format:fix`
- **Type-checking**
  - `pnpm typecheck`
- **Unit tests (Vitest, jsdom)**
  - Run all unit tests: `pnpm test`
  - Watch mode: `pnpm test:watch`
  - Run a single test file (example): `pnpm test test/unit/components.test.ts`
- **End-to-end tests (Playwright)**
  - One-time (or CI) browser install: `npx playwright install --with-deps`
  - Ensure the app is running locally on `http://localhost:3000` (e.g. `pnpm dev`)
  - Run E2E suite: `pnpm test:e2e`
- **Pre-commit hooks & lint-staged**
  - Husky pre-commit runs `pnpm lint-staged` (see `package.json` and `.husky/pre-commit`).
- **Cleaning local artifacts**
  - `node scripts/clean-local.mjs` removes `.next`, `.turbo`, `.contentlayer`, `.vercel`, coverage reports, Playwright artifacts, test result folders, and `node_modules/`. Run this only when you intentionally want a full local reset.
- **Auxiliary scripts**
  - Accessibility audit: `node scripts/audit-a11y.mjs` (basic but enforced; called from `.github/workflows/accessibility.yml` and exits non-zero when it finds potential `<Image />` `alt` issues).
  - Link validation: `node scripts/validate-links.mjs` (run in the main `ci.yml` workflow via `pnpm validate:links`; fails CI on broken internal markdown links).

> CI (`.github/workflows/ci.yml`) runs `pnpm lint`, `pnpm typecheck`, `pnpm test` (with `--runInBand` fallback), and `pnpm test:e2e`. PRs are expected to keep these green.

## High-level architecture

### 1. Next.js App Router layout & shell

- The app uses the **App Router** with the entrypoint in `app/`:
  - `app/layout.tsx` defines the HTML shell, imports global styles from `styles/globals.css`, and exports `metadata` and `viewport` for SEO and theming.
    - Wraps the app with `ThemeProvider` (`app/components/ThemeProvider.tsx`) powered by `next-themes` to support light/dark themes via a `class` attribute on `<html>`.
    - Injects the Cloudflare Turnstile script (`https://challenges.cloudflare.com/turnstile/v0/api.js`) globally, which is required by the contact form.
    - Renders a persistent `Header`, main content container (`<main>` with a centered shell), and `Footer`.
  - `app/page.tsx` simply re-uses `app/about/page.tsx` so the home route (`/`) is the same as the About page.
- Routes are organized under `app/`:
  - `/about` → `app/about/page.tsx`
  - `/contact` → `app/contact/page.tsx`
  - `/cv` → `app/cv/page.tsx`
  - `/api/contact` → `app/api/contact/route.ts` (Next.js Route Handler for the contact form).

### 2. UI components & theming

- Shared UI lives in `app/components/`:
  - `Header.tsx` and `Footer.tsx` are the layout chrome.
  - `NavigationMenu.tsx` is a client component using `@radix-ui/react-navigation-menu`, `next/link`, `next/image`, and `next-themes`:
    - Manages theme toggling (light/dark) and switches between logo variants (`/logo_dark.png` vs `/logo.png`).
    - Renders primary nav links (`/cv`, `/contact`) and a theme toggle button.
  - `ProfileCard.tsx` renders the hero card on the About page using `@radix-ui/react-avatar` and `next/link`.
  - `ContactDialog.tsx` is a client-side Radix Dialog used for the contact form UI and submission flow (see section 4).
  - `ReferencesCarousel.tsx` is a client-side component that rotates through reference quotes from the CV JSON.
  - `ThemeProvider.tsx` wraps children with `NextThemesProvider` configured for `class`-based theme switching, defaulting to `dark`.
- Styling and layout:
  - `styles/globals.css` uses Tailwind CSS v4-style directives (`@import "tailwindcss";`, `@plugin ...`) and defines the design tokens:
    - CSS variables for colors, backgrounds, borders, and radii in `:root` and `:root.dark`.
    - Utility classes like `.shell` (max-width layout container), `.page-card`, and `.section-card` for consistent surface styling.
    - Base styles for typography, including headings, paragraphs, lists, links, and inline code.
  - `tailwind.config.js` scopes Tailwind’s content scanning to `app/**/*.{ts,tsx,mdx}`, `components/**/*.{ts,tsx}`, and `content/**/*.{md,mdx}`.

### 3. Content model: markdown + JSON CV

- Raw content lives under `content/`:
  - `content/about.md` contains frontmatter (`name`, `title`, `slug`, `tagline`, `initials`) and markdown body for the About page.
  - `content/cv.md` uses frontmatter (`name`, `title`, `slug`) and a **JSON object in the markdown body** describing the CV:
    - `basics`, `work`, `education`, `skills`, `languages`, `interests`, `references`, and `publications`.
    - Many fields (e.g., `references[*].reference`) contain HTML strings, which are rendered via `dangerouslySetInnerHTML` in `app/cv/page.tsx` and `ReferencesCarousel.tsx`.
- Page implementations:
  - `app/about/page.tsx` uses `fs` + `path` + `gray-matter` to read `content/about.md` at runtime (`process.cwd()/content/about.md`), parse frontmatter (`name`, `tagline`, `initials`), and render the markdown content via `react-markdown` inside a styled `section-card`.
  - `app/cv/page.tsx` similarly reads `content/cv.md`, parses frontmatter with `gray-matter`, and then `JSON.parse`s the body as a `CvJson` structure. It then renders sections for experience, skills, education, languages, interests, publications, and references.
    - If the JSON is invalid, the page gracefully falls back to a simple error message and instructs the user to check `content/cv.md`.
- Contentlayer configuration:
  - `contentlayer.config.ts` defines a `Page` document type over `content/*.md` with required fields `name`, `title`, `slug` and optional `tagline`, `initials`.
  - It also defines a computed `cv` field that attempts to parse `doc.body.raw` as JSON for the `slug === "cv"` document.
  - `next.config.mjs` wraps the Next config with `withContentlayer`, and `tsconfig.json` maps `"contentlayer/generated"` to `"./.contentlayer/generated"`.
  - **Important**: the current pages (`app/about/page.tsx`, `app/cv/page.tsx`) still read from the filesystem directly and do not yet query Contentlayer. If you refactor them, ensure you keep feature parity (especially error handling and the JSON-based CV structure) or transition them fully to Contentlayer.

### 4. Contact flow: client dialog → API route → Turnstile → Formspree

- Client-side dialog (`app/components/ContactDialog.tsx`):
  - A Radix `Dialog` with controlled email and message fields, optional phone field, a hidden honeypot `website` field, and a hidden `domain` field preset to `https://opa.so`.
  - Integrates **Cloudflare Turnstile**:
    - The global script is loaded in `app/layout.tsx`.
    - The component exposes `window.onTurnstileSuccess` to receive the token and sets `turnstileToken` state.
    - Renders a `<div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-callback="onTurnstileSuccess" />` container, which Turnstile hydrates.
  - On submit, it validates that email, message, and `turnstileToken` are present, then POSTs JSON to `/api/contact` with `{ email, phone?, message, domain?, turnstileToken, honeypot? }`.
  - Handles error/success states and resets the Turnstile widget via `window.turnstile?.reset()` on failure.
- Server-side handler (`app/api/contact/route.ts`):
  - Uses `zod` (`contactSchema`) to validate the incoming payload.
  - **Spam and origin protections**:
    - Honeypot: if `honeypot` is non-empty, the handler responds with `{ ok: true }` without forwarding to Formspree.
    - Origin check: if `domain` is set and not equal to `ALLOWED_DOMAIN` (`"https://opa.so"`), it responds with `400` and an error.
  - **Turnstile validation**:
    - Requires `TURNSTILE_SECRET_KEY` in the environment; returns `500` with a generic error if missing.
    - Extracts client IP from `x-forwarded-for` or `cf-connecting-ip` when present and passes it to Turnstile.
    - POSTs to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `secret`, `response` (token), and optional `remoteip`.
    - If verification fails, responds with `400` and a generic "Verification failed" message.
  - **Form forwarder**:
    - Forwards `{ email, phone?, message, domain? }` to a Formspree endpoint (`FORMSPREE_ENDPOINT = "https://formspree.io/f/${FORMSPREE_KEY}"`).
    - If Formspree responds with an error, attempts to parse `{ error?: string }` and returns `502` with an appropriate message.
    - On success, responds with `{ ok: true }`.
  - Logs unexpected errors server-side and returns a generic `500` JSON error to the client.
- **Environment variables required for a working contact form**:
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (used client-side)
  - `TURNSTILE_SECRET_KEY` (used server-side in the API route)
  - Formspree endpoint is currently hard-coded; if you change it, update `FORMSPREE_ENDPOINT` in `route.ts`.

### 5. Testing strategy

- **Unit tests (Vitest)**
  - Config: `vitest.config.ts` sets `environment: "jsdom"`, `globals: true`, and `setupFiles: ["./test/setup-vitest.ts"]`.
  - `test/setup-vitest.ts` imports `@testing-library/jest-dom/vitest` to extend assertions.
  - Unit tests live under `test/unit/` (e.g., `test/unit/components.test.ts`), and you can add more files there.
  - `tsconfig.json` includes `"vitest/globals"` in `types`, so test files can use `describe`, `it`, `expect`, etc. without explicit imports.
- **End-to-end tests (Playwright)**
  - Config: `playwright.config.ts` sets `testDir: "./test/e2e"` so only files under `test/e2e/` are picked up.
  - Example test: `test/e2e/basic-navigation.spec.ts` visits `http://localhost:3000/` and asserts the page title and visibility of the `CV` and `Contact` links.
  - When running locally, ensure a dev server is running before invoking `pnpm test:e2e` (or using the configured Playwright web server command).

### 6. Linting, formatting, and CI expectations

- **ESLint configuration** (`.eslintrc.json`):
  - Extends `next/core-web-vitals`, `plugin:@typescript-eslint/recommended`, `plugin:jsx-a11y/recommended`, and `prettier`.
  - Uses `@typescript-eslint/parser` and plugins `@typescript-eslint` and `jsx-a11y`.
  - Notable custom rule: `@typescript-eslint/consistent-type-imports: "error"` (prefer `import type` for types).
- **Prettier**: `.prettierrc` and `.prettierignore` exist (with `scripts/validate-links.mjs` ignored to avoid parser issues), with `prettier` invoked via scripts and `lint-staged`.
- **Lint-staged & Husky**:
  - `lint-staged` in `package.json`:
    - `*.{ts,tsx,js,jsx}` → `eslint --max-warnings=0` then `prettier --write`.
    - `*.{md,mdx,json,css}` → `prettier --write`.
  - `.husky/pre-commit` executes `pnpm lint-staged`, so staged changes must pass linting/formatting before commits.
- **CI workflows** (`.github/workflows/`):
  - `ci.yml`: On `push` to `main` and all PRs, runs Node LTS with pnpm, installs dependencies, then:
    - `pnpm lint`
    - `pnpm typecheck`
    - `pnpm test --runInBand || pnpm test`
    - `pnpm validate:links` (fails CI on broken internal markdown links)
    - `npx playwright install --with-deps` and `pnpm test:e2e`
  - `lint.yml`: On PRs, runs `pnpm lint` in isolation.
  - `accessibility.yml`: On PRs, runs the accessibility audit script (`pnpm node scripts/audit-a11y.mjs`).
- **PR template** (`.github/PULL_REQUEST_TEMPLATE.md`):
  - The checklist calls out running `pnpm lint`, `pnpm test`, `pnpm test:e2e`, and `pnpm coverage` before marking a PR as ready.

### 7. Other notes

- `CODEOWNERS` assigns all paths (`*`) to `@vicenteopaso`.
- `README.md` provides the primary human-facing documentation for this project (overview, architecture, flows).
- `CONTRIBUTING.md` documents pnpm usage and common commands; prefer `pnpm` over `npm` when running scripts.
