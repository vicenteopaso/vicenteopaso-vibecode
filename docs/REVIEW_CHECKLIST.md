# Code Review Checklist

This checklist helps reviewers consistently evaluate AI-authored and human-authored changes. Use it to ensure changes meet the project's quality standards across error handling, security, accessibility, SEO, performance, i18n, and testing.

## Table of Contents

- [Error Handling](#error-handling)
- [Security](#security)
- [Accessibility (a11y)](#accessibility-a11y)
- [SEO](#seo)
- [Performance](#performance)
- [Internationalization & Content](#internationalization--content)
- [Testing](#testing)
- [Code Quality](#code-quality)

---

## Error Handling

**Goal**: Errors fail gracefully with user-friendly messages; internal details are logged but never exposed to users.

### Checklist

- [ ] **ErrorBoundary usage**: Component errors are caught by `ErrorBoundary` with a user-friendly fallback UI.
  - Root layout wraps `<main>` in `<ErrorBoundary>`.
  - Custom fallbacks provided where needed via the `fallback` prop.
- [ ] **Structured logging**: Errors logged using `logError()` or `logWarning()` from `lib/error-logging` with context (component, action, metadata).
  - Example: `logError(error, { component: "ContactDialog", action: "submit" });`
- [ ] **User-friendly messages**: Error messages are clear, actionable, and never expose stack traces, environment variables, or internal details.
  - Good: "Failed to load content. Please try again."
  - Bad: "Error: ENOENT: no such file or directory, open '/var/task/content/cv.md'"
- [ ] **Client-side error handling**: Client components use local error state (e.g., `useState<string | null>`) for expected failures (fetch errors, validation errors).
- [ ] **Server-side error handling**: API routes and server components log errors with `console.error()` (captured by Vercel logs) and return generic 500 responses.
  - API routes return `{ error: "User-friendly message" }` in JSON.
  - Server components render fallback UI (not stack traces).
- [ ] **Preserve user context**: Forms and modals do not lose user input on error. Error messages appear inline without clearing fields.
- [ ] **Global error handling**: `GlobalErrorHandler` component is mounted in the root layout to catch unhandled errors and promise rejections.
- [ ] **Error tests**: Unit tests cover error scenarios (invalid input, network failures, missing env vars). E2E tests validate user-facing error messages.

**Related documentation**:

- [Error Handling Guide](./ERROR_HANDLING.md)
- [Engineering Standards § Error Handling](./ENGINEERING_STANDARDS.md#client-side-errors)

---

## Security

**Goal**: Protect user data, prevent abuse, and maintain defense-in-depth for the contact form and API routes.

### Checklist

- [ ] **Contact flow integrity**: The contact form flow is intact and unweakened:
  - Client-side: Cloudflare Turnstile widget loads and generates a token.
  - API route (`app/api/contact/route.ts`):
    - Validates the Turnstile token with Cloudflare's API.
    - Checks the honeypot field (if filled, silently accept without forwarding).
    - Enforces rate limiting via `checkRateLimitForKey()` from `lib/rate-limit.ts`.
    - Validates input with Zod schema (`contactSchema`).
    - Forwards valid submissions to Formspree.
- [ ] **Turnstile verification**: Server-side Turnstile token verification is present and not bypassed.
  - `TURNSTILE_SECRET_KEY` must be set; route returns 500 if missing.
  - Token validated via `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- [ ] **Honeypot check**: Honeypot field (`honeypot`) is checked. If filled, the route returns success without forwarding.
- [ ] **Rate limiting**: `checkRateLimitForKey()` is called with the client IP. Requests return 429 if rate limit exceeded.
  - Rate limit config in `lib/rate-limit.ts` is unchanged or improvements are justified.
- [ ] **Origin checks**: API routes validate request origin/referer where applicable (e.g., contact route checks domain).
- [ ] **No secrets in client code**: API keys, tokens, and secrets are never hardcoded in client components or public environment variables.
  - Client uses `NEXT_PUBLIC_*` env vars only for public values (Formspree key, Turnstile site key).
  - Server uses private env vars for secrets (Turnstile secret, Sentry DSN).
- [ ] **Input sanitization**: User input is sanitized before rendering (e.g., `sanitizeRichText()` from `lib/sanitize-html` for markdown content).
- [ ] **Content Security Policy (CSP)**: Changes do not weaken CSP headers or introduce inline scripts without nonces.
- [ ] **Dependency vulnerabilities**: No new high/critical vulnerabilities introduced. Run `pnpm audit:security` if dependencies change.
- [ ] **Security tests**: Unit tests cover security scenarios (invalid Turnstile token, honeypot filled, rate limit exceeded). E2E tests validate rate limiting behavior.

**Related documentation**:

- [Security Policy](./SECURITY_POLICY.md)
- [Engineering Standards § Security Hardening](./ENGINEERING_STANDARDS.md#4-security-hardening-partially-implemented-see-security_policy-and-ci-security-workflows)

---

## Accessibility (a11y)

**Goal**: The site is usable by everyone, including keyboard-only users, screen reader users, and users with visual impairments. Target: WCAG 2.1 AA compliance.

### Checklist

- [ ] **Semantic HTML**: Uses semantic elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`, etc.) instead of generic `<div>` and `<span>` where meaningful.
- [ ] **Heading hierarchy**: Headings follow a logical order (`<h1>` → `<h2>` → `<h3>`). No skipped levels (e.g., `<h1>` → `<h3>`).
- [ ] **Landmarks**: Page has clear landmarks (`role="banner"`, `role="main"`, `role="navigation"`, `role="contentinfo"`) or uses semantic equivalents.
- [ ] **Keyboard navigation**: All interactive elements (buttons, links, form controls) are keyboard accessible:
  - Reachable via Tab key.
  - Activatable via Enter or Space.
  - No keyboard traps (user can always Tab out).
- [ ] **Focus visible**: Focus states are clearly visible (outline, ring, or custom focus styles). Avoid `outline: none` without a replacement.
- [ ] **ARIA usage**: ARIA attributes are used correctly and only when necessary:
  - `aria-label` or `aria-labelledby` for unlabeled controls.
  - `aria-expanded`, `aria-hidden`, `aria-live` for dynamic content.
  - Do not override semantic HTML with incorrect ARIA (e.g., `<button role="link">`).
- [ ] **Color contrast**: Text and interactive elements meet WCAG AA contrast ratios:
  - Normal text: 4.5:1
  - Large text (18pt+ or 14pt+ bold): 3:1
  - UI components: 3:1
  - Use a contrast checker (e.g., WebAIM, Chrome DevTools) to verify.
- [ ] **Alt text**: All images have descriptive `alt` text (or `alt=""` for decorative images).
  - `<Image>` components have meaningful alt text describing the content.
  - Profile images use "Portrait of [Name]".
- [ ] **Form labels**: All form inputs have associated `<label>` elements or `aria-label`.
- [ ] **Error announcements**: Error messages are associated with form fields via `aria-describedby` or `aria-live` regions.
- [ ] **Skip link**: A "Skip to main content" link is present and functional (already implemented in root layout).
- [ ] **Theme support**: Changes work in both light and dark modes. Color contrast is sufficient in both themes.
- [ ] **Reduced motion**: Animations respect `prefers-reduced-motion` media query where applicable.
- [ ] **Accessibility tests**: Changes pass ESLint a11y rules (`eslint-plugin-jsx-a11y`). Run `pnpm lint` to check. Visual tests include keyboard navigation and focus states where relevant.

**Related documentation**:

- [Accessibility Guidelines](./ACCESSIBILITY.md)
- [Engineering Standards § Accessibility](./ENGINEERING_STANDARDS.md#3-accessibility-a11y-implemented-and-enforced-in-ci)

---

## SEO

**Goal**: The site is discoverable, crawlable, and ranks well for relevant searches. Metadata is complete, accurate, and consistent.

### Checklist

- [ ] **Metadata exports**: Each page exports a `metadata` object (Next.js Metadata API) with:
  - `title` (unique per page, descriptive, <60 characters)
  - `description` (unique per page, compelling, <160 characters)
  - `openGraph` (title, description, image, url)
  - `twitter` (card type, site, creator)
- [ ] **Canonical URLs**: Pages set canonical URLs via `metadata.alternates.canonical` or `<link rel="canonical">`.
- [ ] **Descriptive link text**: Links have meaningful text (not "click here" or "read more").
  - Good: "View my CV" or "Read the accessibility guidelines"
  - Bad: "Click here" or "More info"
- [ ] **Alt text on images**: Images have descriptive alt text (supports SEO and a11y).
- [ ] **Structured data**: JSON-LD structured data is present and valid:
  - `WebSite` schema on all pages (via `SeoJsonLd` component).
  - `Person` schema on homepage and CV page (controlled by `usePathname` in `SeoJsonLd`).
  - Use Google's [Rich Results Test](https://search.google.com/test/rich-results) to validate.
- [ ] **Sitemap**: New routes are added to the sitemap configuration (`./next-sitemap.config.js` in project root) if they should be indexed.
- [ ] **URL structure**: URLs are clean, descriptive, and human-readable (e.g., `/cv`, `/accessibility`, not `/page?id=123`).
- [ ] **No duplicate content**: Avoid multiple URLs serving identical content without canonical tags.
- [ ] **Page speed**: Changes do not introduce unnecessary client-side JavaScript or large assets that hurt Core Web Vitals.
- [ ] **Mobile-friendly**: Pages render correctly on mobile devices (viewport meta tag is set, responsive layout).
- [ ] **SEO tests**: Run Lighthouse CI (`pnpm build && npx unlighthouse --site http://localhost:3000`) to check SEO score (target: ≥95).

**Related documentation**:

- [SEO Guide](./SEO_GUIDE.md)
- [Engineering Standards § SEO & Discoverability](./ENGINEERING_STANDARDS.md#7-seo--discoverability-implemented-for-current-routes)

---

## Performance

**Goal**: The site loads fast, responds quickly, and meets Core Web Vitals targets. Server-first architecture is maintained.

### Checklist

- [ ] **Server-first rendering**: Pages use server components (default in Next.js App Router) or static generation where possible. Client components are used only for interactivity.
- [ ] **Avoid heavy client effects**: Do not fetch data in `useEffect` if it can be fetched server-side. Avoid large client-side libraries for tasks that can be done server-side.
- [ ] **Code splitting**: Heavy components are lazy-loaded with `next/dynamic` where appropriate.
  - Example: Modals, charts, or large third-party libraries.
- [ ] **Image optimization**: Images use `next/image` with appropriate `width`, `height`, and `priority` props.
  - Hero images have `priority={true}`.
  - Below-the-fold images use lazy loading (default).
- [ ] **Font optimization**: Fonts are loaded via `next/font` (e.g., `next/font/google` for Next.js 13.2+) with `display: swap`.
- [ ] **Bundle size**: Changes do not significantly increase bundle size without justification. Run `pnpm build` and check `.next/static/chunks/` sizes.
- [ ] **Core Web Vitals**: Changes do not regress:
  - **LCP** (Largest Contentful Paint): <2.5s
  - **CLS** (Cumulative Layout Shift): <0.1
  - **INP** (Interaction to Next Paint): <200ms
  - Run Lighthouse CI to verify: `pnpm build && npx unlighthouse --site http://localhost:3000`
- [ ] **Avoid layout shift**: Images, embeds, and dynamic content have fixed dimensions or aspect ratios to prevent layout shift.
- [ ] **Cache-friendly**: Static assets (images, fonts, CSS) are cache-friendly (immutable where safe).
- [ ] **Streaming where appropriate**: Server components can stream content with `loading.tsx` or Suspense boundaries for large data fetches.
- [ ] **Performance tests**: Run Lighthouse CI on affected pages. Visual tests ensure no layout shift. E2E tests check load times indirectly (pages load without timeout errors).

**Related documentation**:

- [Engineering Standards § Performance & Web Vitals](./ENGINEERING_STANDARDS.md#6-performance--web-vitals-enforced-in-ci-via-lighthouse-ci)
- [Lighthouse Integration](./LIGHTHOUSE_INTEGRATION.md)

---

## Internationalization & Content

**Goal**: Content is locale-aware, translatable, and parsed correctly. CV JSON parsing semantics are preserved.

### Checklist

- [ ] **Use i18n utilities**: Locale detection and translation use utilities from `lib/i18n/`.
  - `getLocale()` for server components.
  - `useTranslations()` for client components (if/when added).
- [ ] **Locale-aware routes**: Routes follow `app/[lang]/` structure. `lang` parameter is validated against supported locales (`en`, `es`).
- [ ] **UI strings in JSON**: UI strings are stored in `i18n/[locale]/ui.json`, not hardcoded in components.
- [ ] **Content files by locale**: Content files are organized by locale (`content/en/`, `content/es/`). English is the source locale; Spanish is auto-translated.
- [ ] **CV JSON parsing**: The CV page parses a JSON object from `content/[locale]/cv.md`:
  - Parsing logic in `app/[lang]/cv/page.tsx` is unchanged or improvements are tested.
  - Error handling is preserved: if JSON is invalid, render a fallback error message (not a crash).
  - Example fallback: "CV data could not be loaded. Please check that the JSON body in `content/cv.md` is valid."
- [ ] **Markdown rendering**: Markdown content is rendered with `ReactMarkdown` using shared components from `lib/markdown-components.tsx`.
  - Rendering is consistent across pages (homepage, CV, policy pages).
- [ ] **No hardcoded text**: Avoid hardcoded English strings in components. Use `ui.json` or content files.
- [ ] **Date/number formatting**: Dates and numbers are formatted locale-aware (e.g., `Intl.DateTimeFormat`, `Intl.NumberFormat`) if applicable.
- [ ] **i18n tests**: Unit tests cover locale detection and content parsing. E2E tests validate that both locales render correctly.

**Related documentation**:

- [Copilot Instructions § Content model](../.github/copilot-instructions.md#project-context-and-goals)
- [Architecture § Content](./ARCHITECTURE.md)

---

## Testing

**Goal**: All changes are tested at the appropriate level (unit, E2E, visual). Coverage remains >90%.

### Checklist

- [ ] **Unit tests added**: New utilities, functions, and component logic have unit tests in `test/unit/`.
  - Test both happy path and edge cases (errors, invalid input, boundary conditions).
  - Use Vitest + React Testing Library.
  - Example: `test/unit/sanitize-html.test.ts`, `test/unit/error-logging.test.ts`.
- [ ] **E2E tests added**: New user flows and critical paths have E2E tests in `test/e2e/`.
  - Use Playwright.
  - Example: `test/e2e/contact-and-cv.spec.ts`, `test/e2e/error-handling.spec.ts`.
  - E2E tests should run on a dev server (`pnpm dev`) or build + start server (`pnpm build && pnpm start`).
- [ ] **Visual tests updated**: UI changes have visual regression tests in `test/visual/pages/`.
  - Use Playwright screenshot comparison.
  - **Always use shared utilities** from `test/visual/utils.ts`:
    - `waitForStableHeight()` to wait for layout stability.
    - `freezeCarouselInteractions()` to stop animations.
    - `homepageMasks()` or `cvPageMasks()` to mask dynamic content (portrait, ImpactCards, references).
  - **Never use inline waits** like `page.waitForTimeout(1000)` without justification.
  - Update baselines with `pnpm test:visual:update` when UI changes are intentional.
- [ ] **Test coverage maintained**: Coverage remains >90% statement coverage.
  - Run `pnpm coverage` to generate a report.
  - Check `coverage/index.html` for file-level coverage.
- [ ] **Tests pass locally**: All tests pass before pushing:
  - `pnpm test` (unit tests)
  - `pnpm test:e2e` (E2E tests, requires dev server)
  - `pnpm test:visual` (visual tests, requires dev server)
  - `pnpm typecheck` (TypeScript)
  - `pnpm lint` (ESLint)
- [ ] **Tests are maintainable**: Tests use stable selectors (data-testid, semantic selectors) and avoid brittle implementation details.
  - Good: `screen.getByRole("button", { name: "Submit" })`
  - Bad: `document.querySelector(".css-1234-button")`
- [ ] **Mock external dependencies**: API routes and third-party services (Turnstile, Formspree) are mocked in tests. Do not make real API calls in unit/E2E tests.
  - Example: Mock `fetch()` in unit tests for API routes.
  - Example: Mock Turnstile widget in E2E tests via Playwright route interception.

**Related documentation**:

- [Testing Guide](./TESTING.md)
- [Visual Regression Testing](./VISUAL_REGRESSION_TESTING.md)
- [Engineering Standards § Testing Strategy](./ENGINEERING_STANDARDS.md#5-testing-strategy-implemented-90-coverage-maintained)

---

## Code Quality

**Goal**: Code is clean, maintainable, and follows project conventions. Linting and type checking pass.

### Checklist

- [ ] **TypeScript strict mode**: Code uses TypeScript strict mode. No `any` types without justification (prefer `unknown` and narrow with type guards).
- [ ] **Import type usage**: Type-only imports use `import type` to satisfy ESLint rule `@typescript-eslint/consistent-type-imports`.
  - Good: `import type { NextRequest } from "next/server";`
  - Bad: `import { NextRequest } from "next/server";` (when NextRequest is only used as a type)
- [ ] **Linting passes**: Run `pnpm lint`. Fix all errors and warnings (or justify exceptions in PR comments).
  - ESLint rules include security, accessibility, and import ordering checks.
- [ ] **Type checking passes**: Run `pnpm typecheck`. Fix all TypeScript errors.
- [ ] **Formatting passes**: Run `pnpm format` to auto-format code with Prettier. Commit formatted code.
- [ ] **No dead code**: Remove unused imports, variables, and functions. ESLint warns about unused vars.
- [ ] **No console logs**: Remove `console.log()` used for debugging. Use `logError()` or `logWarning()` for production logging.
  - Exception: `console.error()` in API routes and server components (captured by Vercel logs).
- [ ] **Consistent naming**: Follow project conventions:
  - Components: PascalCase (e.g., `ContactDialog`)
  - Files: kebab-case for utilities, PascalCase for components (e.g., `rate-limit.ts`, `ContactDialog.tsx`)
  - Variables/functions: camelCase (e.g., `checkRateLimitForKey`)
- [ ] **Modular code**: Components and utilities are small, focused, and reusable. Avoid monolithic files.
- [ ] **Comments are meaningful**: Add comments to explain "why" (not "what"). Avoid obvious comments.
  - Good: `// Honeypot: if filled, likely a bot. Silently accept without forwarding.`
  - Bad: `// Call checkRateLimitForKey`
- [ ] **Dependencies are justified**: New dependencies are necessary and well-maintained. Run `pnpm audit:security` if dependencies change.
- [ ] **Git history is clean**: Commits are atomic, descriptive, and follow conventional commit format (e.g., `feat:`, `fix:`, `docs:`, `test:`).

**Related documentation**:

- [Engineering Standards § Code Quality](./ENGINEERING_STANDARDS.md#21-code-quality)
- [Contributing Guide](../CONTRIBUTING.md)

---

## Quick Reference: Common Issues

| Issue                                | Check                       | Solution                                                                    |
| ------------------------------------ | --------------------------- | --------------------------------------------------------------------------- |
| Type imports not using `import type` | Linting fails               | Change `import { X }` to `import type { X }` when X is only used as a type  |
| CV page crashes on invalid JSON      | Error handling missing      | Ensure CV parsing has try/catch and fallback UI                             |
| Contact form bypasses security       | Security weakened           | Verify Turnstile, honeypot, rate limit, and origin checks are intact        |
| Accessibility violations             | Lighthouse or ESLint errors | Fix semantic HTML, add alt text, ensure keyboard nav, check contrast        |
| Visual test failures                 | Screenshot diffs            | Use shared utilities, mask dynamic content, update baselines if intentional |
| Test coverage below 90%              | Coverage report             | Add unit tests for new code                                                 |
| Client-side data fetching            | Performance regression      | Move data fetching to server components or API routes                       |
| Hardcoded strings                    | i18n issue                  | Move strings to `i18n/[locale]/ui.json`                                     |

---

## Related Documentation

- [Engineering Standards](./ENGINEERING_STANDARDS.md) – Overall quality goals and architecture principles
- [Copilot Instructions](../.github/copilot-instructions.md) – AI-specific guidance and conventions
- [Contributing Guide](../CONTRIBUTING.md) – Workflow, commands, and PR expectations
- [Error Handling](./ERROR_HANDLING.md) – Error handling patterns and observability
- [Security Policy](./SECURITY_POLICY.md) – Security practices and reporting
- [Accessibility Guidelines](./ACCESSIBILITY.md) – a11y principles and tooling
- [SEO Guide](./SEO_GUIDE.md) – SEO implementation and metadata
- [Testing Guide](./TESTING.md) – Testing philosophy, stack, and examples
- [Visual Regression Testing](./VISUAL_REGRESSION_TESTING.md) – Visual test utilities and workflow

---

**Last updated**: 2025-12-13  
**Purpose**: Consistent, thorough code reviews for AI-authored and human-authored changes
