# Copilot Repository Instructions

These instructions guide AI assistants contributing to this repo. Follow these conventions unless a PR explicitly proposes changing them.

## Project context and goals

> Source of truth: This repository is governed by the System Design & Development
> Specification (SDD) in `/sdd.yaml`. Copilot should treat that file as
> authoritative for principles, architecture boundaries, and CI expectations.

- Framework/runtime: **Next.js (App Router) on Node.js LTS**, managed with **pnpm**.
- Language: **TypeScript** with React 19.
- Content model: markdown files under `content/` plus a JSON CV object embedded in `content/cv.md`.
  - Do not break the JSON CV parsing semantics; preserve existing error handling and graceful fallbacks.
- Styling/components: **Tailwind CSS v4**, **Radix UI**, theming via **next-themes**.
- Deployment: **Vercel** (standard Next.js deployment).
- Quality goals: strong **SEO**, **accessibility (a11y)**, **performance**, and **code quality**, aligned with `docs/ENGINEERING_STANDARDS.md`.

## Do

- Use **pnpm** scripts:
- - `pnpm dev`, `pnpm build`, `pnpm start`
- - `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:fix`
- - `pnpm typecheck`
- - `pnpm test`, `pnpm test:e2e`
- Write **TypeScript** (TS/TSX) and prefer `import type` for type-only imports to satisfy ESLint rules (notably `@typescript-eslint/consistent-type-imports`).
- Keep to the **App Router** structure under `app/`, colocating shared components under `app/components/` where appropriate.
- Maintain accessibility:
  - Use semantic HTML, correct heading hierarchy, and logical focus order.
  - Ensure keyboard navigation works (focusable controls, focus visible, no keyboard traps).
  - Use ARIA only when necessary and correctly.
  - Maintain sufficient color contrast and respect light/dark themes.
- Maintain SEO:
  - Keep or update `metadata` exports, title/description, and canonical URLs as needed.
  - Use descriptive link text and alt text on images.
- Handle errors gracefully:
  - Use `ErrorBoundary` for component errors with user-friendly fallback UI.
  - Use `logError()` and `logWarning()` from `lib/error-logging` for structured logging.
  - Errors are captured by Vercel logs in production and forwarded to Sentry for aggregation, replay, and alerting.
  - Client-side errors should fail gracefully without exposing internal details.
  - Preserve user context and avoid losing form data on errors.
- Preserve content behavior:
  - `app/[lang]/page.tsx` and `app/[lang]/cv/page.tsx` read from the filesystem (`content/[locale]/about.md`, `content/[locale]/cv.md`) at build time.
  - If migrating to Contentlayer, ensure **feature parity** and preserve error handling for invalid CV JSON.
- Preserve the contact flow:
  - Client dialog with Cloudflare Turnstile → `/api/contact` route handler → Formspree.
  - Do not weaken spam or origin checks (honeypot, domain check, Turnstile verification).
- Keep tests in sync with changes:
  - Unit tests: **Vitest** under `test/unit/`.
  - E2E tests: **Playwright** under `test/e2e/`.
  - Visual regression tests: **Playwright** under `test/visual/pages/` with shared utilities in `test/visual/utils.ts`.
    - Always use shared utilities (`waitForStableHeight`, `freezeCarouselInteractions`, etc.) instead of inline waits.
    - Mask dynamic content (portrait, ImpactCards, references) using `homepageMasks()` or `cvPageMasks()`.
- Follow existing linting, formatting, and Husky + lint-staged setup.

## Don't

- Do not:
- - Switch package managers again or convert the app to the legacy `pages/` router.
- Bypass or remove Turnstile verification or other spam protections in the contact flow.
- Hard-code secrets, API keys, or credentials.
- Introduce changes that obviously regress accessibility, SEO, or performance without justification and tests.

## AI Guardrails: Must/Avoid

These guidelines help AI assistants avoid common pitfalls specific to this repository:

### Must Do

- **Import types correctly**: Always use `import type` for type-only imports to satisfy ESLint rule `@typescript-eslint/consistent-type-imports`.
- **Preserve CV JSON parsing**: The CV page (`app/[lang]/cv/page.tsx`) parses a JSON object from `content/[locale]/cv.md`. Keep the parsing logic, error handling, and graceful fallback UI intact.
- **Validate contact flow security**: The contact form uses a multi-layer defense:
  - Honeypot field (if filled, silently accept without forwarding)
  - Cloudflare Turnstile verification (client-side widget + server-side token verification)
  - Rate limiting via `lib/rate-limit.ts` (per-IP, best-effort)
  - Origin/domain checks in the route handler
  - Never weaken these checks or bypass Turnstile verification.
- **Handle errors gracefully**: Use `ErrorBoundary` for component errors and `logError()`/`logWarning()` from `lib/error-logging` for structured logging. Never expose stack traces or internal details to users.
- **Keep side effects server-side**: API routes and server components should handle sensitive operations (e.g., Turnstile verification, Formspree forwarding). Client components should only handle UI state and user interactions.
- **Use visual test utilities**: When updating visual regression tests, use shared utilities from `test/visual/utils.ts` (`waitForStableHeight`, `freezeCarouselInteractions`, etc.) and mask dynamic content with `homepageMasks()` or `cvPageMasks()`.
- **Maintain i18n semantics**: Use utilities from `lib/i18n/` for locale detection and translation. Keep content parsing behavior consistent with existing patterns.
- **Follow server-first principles**: Prefer server-side rendering (SSR) or static generation (SSG) over client-side data fetching. Avoid heavy client-side effects that could hurt performance.

### Avoid

- **Breaking CV JSON parsing**: Do not change how `content/[locale]/cv.md` is parsed or remove the error fallback UI. This JSON must remain valid and parseable.
- **Weakening security checks**: Do not remove or simplify Turnstile verification, honeypot checks, rate limiting, or origin validation in the contact flow.
- **Hardcoding values**: Do not hardcode API keys, secrets, domain names, or environment-specific values. Use environment variables and the `siteConfig` object in `lib/seo.ts`.
- **Ignoring accessibility**: Do not remove semantic HTML, skip keyboard navigation, ignore focus states, or reduce color contrast. All changes must maintain WCAG 2.1 AA compliance.
- **Skipping tests**: Do not make changes without updating or adding corresponding tests. All new features need unit tests; critical flows need E2E tests; UI changes need visual regression tests.
- **Bypassing linting**: Do not disable ESLint rules or ignore linting errors. Fix issues or discuss exceptions in PR comments.
- **Inline waits in visual tests**: Do not use arbitrary `page.waitForTimeout()` in Playwright visual tests. Use shared utilities from `test/visual/utils.ts` instead.

## Files and directories overview

- `app/`:
  - App Router pages and layouts.
  - `[lang]/`: Locale-specific routes (pages are in here, not at root).
  - Route handlers (e.g., `app/api/contact/route.ts`).
  - Shared UI components in `app/components/`.
- `content/`:
  - `en/`: English source content files.
    - `about.md`: frontmatter + markdown body for the Home page.
    - `cv.md`: frontmatter + **JSON object** in the body for the CV; this JSON is parsed at build time and must stay valid.
  - `es/`: Spanish auto-translated content files (mirror structure of `en/`).
- `i18n/`:
  - `en/ui.json`, `es/ui.json`: UI string dictionaries for i18n.
- `lib/`:
  - `i18n/`: Locale detection and translation utilities.
  - Other shared utilities (SEO, error logging, markdown components, sanitization, rate limiting).
- `styles/`:
  - Tailwind CSS v4 setup and global styles.
- `scripts/`:
  - Utility scripts for build, cleaning local artifacts, audits, translation, etc.
- `test/unit/`, `test/e2e/`, `test/visual/`:
  - Vitest unit tests, Playwright E2E tests, and Playwright visual regression tests, respectively.
  - `test/visual/utils.ts` contains shared helpers for deterministic screenshots.

## Commands cheat sheet

- Dev: `pnpm dev`
- Build: `pnpm build` (or full content + app build: `node scripts/build.mjs`)
- Contentlayer: `pnpm content`
- Lint/format: `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:fix`
- Types: `pnpm typecheck`
- Unit tests: `pnpm test` (Vitest)
- E2E tests: `pnpm test:e2e` (Playwright; ensure a dev server is running and run `npx playwright install --with-deps` at least once)
- Visual tests: `pnpm test:visual` (Playwright visual regression; update baselines with `pnpm test:visual:update`)

## PR expectations

- Use the PR template, include screenshots or recordings for UI changes.
- Call out accessibility and SEO implications of significant changes.
- Keep CI green: lint, typecheck, unit tests, and E2E tests (where relevant).
- Update documentation (e.g., `README.md`) when behavior or flows change.
- If a PR is safe for auto-merge, add the `copilot-automerge` label (an auto-merge workflow will only act on such PRs once required checks pass).

Tip: For more granular behavior in the future, you can add path-specific instruction files under `.github/instructions/*.instructions.md` with `applyTo` globs.
