# Engineering Standards

This document captures the engineering intent for this repository. It is a **north-star** standard: some items are fully implemented today, and others are aspirational or on the backlog. Governance docs, architecture docs, and tooling should align to these principles.

## 1. Architectural Foundations _(partially implemented)_

### 1.1 Core Architecture Principles

- Modular, component-based architecture (React/Next.js).
- Separation of concerns between UI, data, configuration, build pipeline, and infrastructure.
- DRY, SOLID, and Clean Architecture principles applied to UI and backend code where practical.
- Single Source of Truth for configuration and content.
- Prefer server-side rendering (SSR) or static generation (SSG) for performance and SEO.
- Composable architecture built from:
  - Components
  - Layouts
  - Content models (markdown/Contentlayer today; CMS-ready in the future)
  - Utilities/services layer

### 1.2 Content Architecture

- Content abstraction via markdown + Contentlayer (MD/MDX today, headless CMS-compatible later).
- Structured content models with clear schemas and versioning.
- Internationalization-ready (i18n pipeline can be added even if English-only for now).

## 2. Frontend Engineering Standards _(largely implemented)_

### 2.1 Code Quality

- ESLint configured with at least:
  - Stylistic rules
  - Accessibility rules
  - Security-focused rules
  - Import ordering
- Prettier formatting enforced.
- TypeScript end-to-end (TS/TSX only).
- Strict TypeScript mode.
- Absolute imports and path aliases for core modules.
- Modular architecture directories:
  - `app/`
  - `components/`
  - `layouts/` (if/when introduced)
  - `lib/`
  - `styles/`
  - `content/`

### 2.2 Component Engineering

- Components should be documented (Storybook is optional but recommended if the component surface grows).
- Reusable design tokens for spacing, colors, typography, breakpoints, radii, and shadows.
- Composition over inheritance.
- No ad-hoc inline styles; prefer Tailwind or structured CSS.
- Components expose meaningful, typed prop interfaces.
- No dead code; CI and code review should push towards continuous cleanup.

## 3. Accessibility (A11y) _(implemented and enforced in CI)_

### 3.1 WCAG Standards

- Target **WCAG 2.1 AA** as a minimum.
- Proper semantic HTML (headings, lists, landmarks).
- Landmarks defined (`header`, `nav`, `main`, `footer`, etc.).
- Full keyboard navigability (tab order, focus visible, no traps).
- ARIA attributes used only when necessary and correctly.
- Color contrast at least 4.5:1 for body text and critical UI.
- ALT text on all images (or explicit `alt=""` for decorative images).
- A visible skip-to-content link.

### 3.2 Automated Testing

- Accessibility linting via `eslint-plugin-jsx-a11y`.
- A11y checks in CI (custom scripts, axe, or equivalent) for key flows.
- Lighthouse accessibility baseline ≥ 90 on core pages, **enforced in CI** via the `lighthouse-ci.yml` workflow (target: ≥ 95).
- Additional accessibility-specific assertions enforced in `lighthouserc.js`:
  - Color contrast (currently warning - needs improvement)
  - HTML language attribute (error)
  - Meta viewport (error)
  - Document title (error)
  - Link text clarity (error)
- **Known accessibility issues**:
  - Color contrast ratios need improvement in some UI components
  - This is tracked via Lighthouse warnings and will be addressed incrementally

## 4. Security Hardening _(partially implemented; see SECURITY_POLICY and CI security workflows)_

### 4.1 Runtime Security

- HTTPS with modern TLS (enforced by the hosting platform).
- HSTS enabled.
- No mixed content.
- Content Security Policy (CSP) configured, with intent to evolve towards:
  - `default-src 'self'`
  - Tight `img-src` whitelist
  - Strict `script-src` (nonce/`strict-dynamic`) as tooling allows
- XSS protection:
  - Avoid `dangerouslySetInnerHTML` where possible.
  - When HTML injection is required, sanitize beforehand.

### 4.2 Build-Time Security

- Dependency vulnerability checks in CI (e.g., `pnpm audit`, CodeQL).
- Dependabot (or equivalent) enabled for dependency and workflow updates.
- Prefer well-maintained and reputable packages; verified publishers when available.

### 4.3 Authentication (If Applicable)

- No public tokens in client bundles.
- Sensitive values provided via encrypted environment variables (e.g., Vercel env).
- API routes protected as appropriate (rate limits, basic origin checks, edge protections).

## 5. Performance & Web Vitals _(enforced in CI via Lighthouse CI)_

### 5.1 Core Web Vitals Targets

- LCP < 2.5s on primary pages.
- CLS < 0.1.
- INP / interaction latency < 200ms on typical hardware.

### 5.2 Metrics and Optimizations

- Use Next.js image optimization where applicable.
- Static assets cached with long-lived, immutable headers when safe.
- Preload critical assets (fonts, hero imagery) where beneficial.
- Avoid layout shifts via fixed dimensions and predictable layout.
- Code splitting and route-based chunking.
- Rely on tree-shaking and dead-code elimination.

### 5.3 Lighthouse

- **Long-term target** Lighthouse scores of ≥ 95 for all categories
- **Current baseline thresholds** (enforced in CI as warnings):
  - Performance ≥ 90
  - Accessibility ≥ 90
  - Best Practices ≥ 70
  - SEO ≥ 95 (enforced as error)
- **Enforced in CI**: The `lighthouse-ci.yml` workflow runs Lighthouse audits on every push and PR.
  - Warnings are generated for performance, accessibility, and best practices issues
  - Builds fail only on critical SEO and structural issues
  - Thresholds will be incrementally raised as improvements are made
- **Known issues to address**:
  - Color contrast ratios need improvement across the site
  - Best practices score impacted by third-party scripts (analytics, error tracking)
  - Performance optimizations for policy pages needed
- Additional performance budget assertions are configured in `lighthouserc.js` for:
  - First Contentful Paint (FCP) ≤ 2000ms
  - Largest Contentful Paint (LCP) ≤ 2500ms
  - Cumulative Layout Shift (CLS) ≤ 0.1
  - Total Blocking Time (TBT) ≤ 300ms
  - Speed Index ≤ 3000ms
- Reports are uploaded as GitHub Actions artifacts and to temporary public storage for easy review.
- PRs automatically receive a comment with Lighthouse scores for all audited pages.

## 6. SEO & Discoverability _(implemented for current routes)_

### 6.1 Technical SEO

- Per-page titles and meta descriptions.
- Canonical URLs.
- Open Graph metadata.
- Twitter cards.
- `sitemap.xml` and `robots.txt` with correct directives.
- Clean, descriptive URL structure.
- JSON-LD structured data (Person/Profile, Website, and other types as appropriate).

### 6.2 Content SEO

- Descriptive H1/H2 hierarchy per page.
- Clear, scannable paragraphs and bullet lists.
- Thoughtful keyword usage without keyword stuffing.

## 7. Observability & Monitoring _(implemented: Vercel Analytics/Speed Insights + Sentry)_

### 7.1 Logging & Analytics

- Privacy-respecting analytics (e.g., Vercel Analytics plus any chosen 3rd-party tracking that meets privacy constraints).
- Basic traffic dashboards and referrer insights.
- Ability to see top pages and engagement.

### 7.2 Performance & Error Monitoring

- Real-time Core Web Vitals via Vercel Speed Insights.
- Error tracking via Sentry (client + server) with grouping, breadcrumbs, and replay.

### 7.3 Build & Deployment Monitoring

- CI build logs for each PR and push.
- Preview deployments per PR (Vercel).
- Optional Lighthouse CI or periodic Lighthouse checks.

## 8. Reliability & Operations _(implemented via GitHub Actions + Vercel)_

### 8.1 Deployment

- Continuous Deployment via GitHub → Vercel.
- Branch protection on `main`.
- Per-PR preview environments.
- Zero-downtime rollouts using Vercel’s model.

### 8.2 CI/CD

- GitHub Actions workflows for at least:
  - Lint
  - Typecheck
  - Unit tests
  - E2E tests
  - Security/a11y checks
- PR templates with checklists covering:
  - Accessibility
  - SEO
  - Security
  - Responsive layout
  - Tests

### 8.3 Uptime

- Uptime monitoring via Vercel or an external service (e.g., UptimeRobot) if/when warranted.

## 9. Testing Standards _(implemented for unit + E2E; visual/smoke are aspirational)_

### 9.1 Unit Testing

- Vitest (or Jest) for unit tests.
- React Testing Library for component behavior.

### 9.2 Integration & E2E Testing

- Playwright (or Cypress) for integration and end-to-end tests, covering:
  - Routing and navigation
  - Form interactions (happy path + failures)
  - Basic accessibility interactions

### 9.3 Visual & Smoke Testing (Aspirational)

- Visual regression testing (e.g., Chromatic or Percy) as the UI surface grows.
- Automated smoke tests per PR for core flows.

## 10. Design System Standards _(partially implemented via Tailwind tokens and shared components)_

### 10.1 Design Tokens

- Centralized tokens for:
  - Color palette
  - Typography scale
  - Spacing scale
  - Radii and shadows

### 10.2 Component Guidelines

- Consistent patterns for:
  - Buttons
  - Cards
  - Navigation
  - Typography
  - Forms

### 10.3 Documentation

- Living documentation, via markdown docs and optionally Storybook, for key components and tokens.

## 11. Governance & Documentation _(implemented: README, ARCHITECTURE, CONSTITUTION, CONTRIBUTING, SECURITY, ERROR_HANDLING, etc.)_

### 11.1 Project Documentation

- `README.md` with:
  - Overview
  - Architecture overview
  - Folder structure
  - Local development setup
  - Deployment flow
- `CONTRIBUTING.md` for contribution workflow and expectations.
- `docs/CONSTITUTION.md` for engineering governance.
- `SECURITY` policy document.
- Additional docs for SEO, accessibility, error handling, release process, etc.
- Public-facing governance and policy pages (`/accessibility`, `/tech-stack`, `/technical-governance`, `/cookie-policy`, `/privacy-policy`) render markdown via a shared ReactMarkdown components map in `lib/markdown-components.tsx` to keep typography and semantics consistent.

### 11.2 Architecture Documentation

- High-level architecture description (`docs/ARCHITECTURE.md`).
- Additional diagrams (component, content model) may be added over time.

## 12. Developer Experience & Tooling _(implemented and evolving)_

### 12.1 Local Development

- `pnpm` as the package manager.
- Auto-format on save in editor configuration.
- Git hooks via Husky + lint-staged.

### 12.2 Automation

- Code formatting on commit.
- Auto-deploy on merge to `main`.
- Automated dependency updates (Dependabot).
- Automated tests and checks in CI.

## 13. Privacy, Legal, and Compliance _(partially implemented; privacy policy and policies live in `content/` and docs)_

### 13.1 Privacy & GDPR

- Cookie banner only if and when cookies or non-essential tracking are used.
- Privacy policy page describing data collection and retention.
- Minimal data collection aligned with user expectations.

### 13.2 Accessibility Statement

- Optional accessibility statement documenting the target WCAG level and known limitations.

## 14. Future-Ready Considerations _(backlog / aspirational)_

### 14.1 Infrastructure Trends

- Edge runtime and Server Actions (Next.js) where they add clear value.
- OG image automation via Vercel OG routes.
- Selective use of WebAssembly or AI-assisted features where appropriate.

### 14.2 Content & Branding Trends

- MDX with interactive components for richer content.
- Dark mode as a first-class theme.
- Motion-reduced animations for users who prefer reduced motion.
- OG image automation pipeline to keep previews on-brand.

---

This document is intentionally broad: it encodes **intent**. When reality diverges (for example, missing tooling or checks), treat that as backlog or future work and update both the code and this file when the gap is closed.
