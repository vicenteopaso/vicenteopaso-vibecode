# Vicente Opaso – Personal Site & CV

This repo contains the source for my personal site and CV, built with Next.js App Router and a content-first approach. It renders an “About” page and a structured CV from markdown/JSON content, and includes a spam‑protected contact flow using Cloudflare Turnstile and Formspree.

The project is optimized for readability, accessibility, and maintainability, with a focus on composable UI, modern tooling, and strong Developer Experience.

---

## Tech stack

- **Framework**: Next.js (App Router, `app/` directory, typed routes, Turbopack)
- **Language**: TypeScript, React 18
- **Styling**: Tailwind CSS v4, custom design tokens, utility classes (e.g. `shell`, `section-card`)
- **UI primitives**: Radix UI (`@radix-ui/react-*`) for navigation, dialogs, avatars
- **Theming**: `next-themes` for light/dark mode with `class` attribute on `<html>`
- **Content**:
  - Markdown in `content/about.md`
  - Markdown + JSON CV in `content/cv.md`
  - Contentlayer integration (`contentlayer.config.ts`, `next-contentlayer`) for structured content
- **Forms / backend**:
  - Cloudflare Turnstile for bot protection
  - Next.js Route Handler (`app/api/contact/route.ts`) for contact form
  - Formspree as the actual email backend
- **Tooling**:
  - ESLint (Next.js, TypeScript, JSX a11y, Prettier)
  - Prettier
  - Vitest (unit tests, jsdom)
  - Playwright (end‑to‑end tests)
  - Husky + lint-staged (pre‑commit checks)
  - TypeScript strict typechecking

---

## Project structure

High‑level layout:

- `app/`
  - `layout.tsx` – HTML shell, global styles, SEO metadata, theme provider, header/footer.
  - `page.tsx` – Home route, implemented as the About page.
  - `about/page.tsx` – Reads `content/about.md` and renders it via `react-markdown`, plus a profile card and contact section.
  - `cv/page.tsx` – Reads `content/cv.md`, parses the JSON CV body, and renders experience, skills, education, languages, interests, publications, and references.
  - `components/`
    - `Header.tsx`, `Footer.tsx` – Layout chrome.
    - `NavigationMenu.tsx` – Radix navigation menu with theme toggle, logo, and contact trigger.
    - `ProfileCard.tsx` – Hero/profile card, with stable portraits by theme and initials fallback.
    - `ContactDialog.tsx` – Radix dialog implementing the contact form UI and Turnstile integration.
    - `ReferencesCarousel.tsx` – Auto‑rotating carousel for CV references.
    - `ThemeProvider.tsx` – Wraps `next-themes` configuration.
  - `api/contact/route.ts` – Validates and forwards contact form submissions (Turnstile verification + Formspree).
- `content/`
  - `about.md` – Frontmatter + markdown body for the About page.
  - `cv.md` – Frontmatter + JSON object in the markdown body for the CV.
- `styles/globals.css` – Tailwind CSS v4 setup, design tokens, global typography, layout utilities.
- `scripts/`
  - `build.mjs` – Contentlayer + Next.js build orchestration.
  - `clean-local.mjs` – Cleans local artifacts (`.next`, `.turbo`, `.contentlayer`, `.vercel`, coverage, Playwright artifacts, etc.).
  - `audit-a11y.mjs`, `validate-links.mjs`, `generate-og.mjs` – Placeholder scripts wired into CI for future workflows.
- Config:
  - `next.config.js` – Next.js config wrapped in `withContentlayer`.
  - `tailwind.config.js` – Tailwind content globs for `app/`, `components/`, and `content/`.
  - `tsconfig.json` – Strict TS config with path mapping for `@/*` and `contentlayer/generated`.
  - `.eslintrc.json`, `.prettierrc`, `.husky/`, `.github/workflows/*.yml`, etc.

> Note: `app/about/page.tsx` and `app/cv/page.tsx` currently read from the filesystem at runtime rather than querying Contentlayer. Any refactor should keep the existing behavior (especially the JSON‑driven CV and its error handling) or migrate fully to Contentlayer with equivalent semantics.

---

## Getting started

> For contribution-specific details (Yarn usage, common commands, and workflow expectations), see `CONTRIBUTING.md`.

### Prerequisites

- Node.js (LTS recommended)
- Yarn (preferred package manager for this project)

### Installation

```bash
yarn install
```

### Running the dev server

```bash
yarn dev
```

Then open `http://localhost:3000` in your browser.

The main routes are:

- `/` and `/about` – About page (markdown‑driven)
- `/cv` – JSON CV page
- `/api/contact` – Contact form API route

---

## Editing content

### About page (`/about`)

- Source file: `content/about.md`
- Frontmatter fields:
  - `name` – Display name
  - `title` – Used for metadata / page title
  - `slug` – Should be `about`
  - `tagline` – One‑line descriptor used in the profile card
  - `initials` – Used for avatar fallback
- Body: Standard markdown rendered via `react-markdown` with custom list and separator styling.

### CV page (`/cv`)

- Source file: `content/cv.md`
- Frontmatter fields:
  - `name`, `title`, `slug: cv`
- Body: A **single JSON object**, parsed at runtime into a `CvJson` structure. Key fields include:
  - `basics` – Name, label, summary, highlights (with optional titles and HTML content).
  - `work` – Companies, locations, positions, date ranges, highlights, and skills.
  - `education`, `skills`, `languages`, `interests`, `publications`, `references`.

- Some fields contain HTML strings (e.g. `references[*].reference`), which are injected with `dangerouslySetInnerHTML` in both `CVPage` and `ReferencesCarousel`.

If the JSON is invalid, the CV page will:

- Render a fallback message.
- Show an error prompting you to fix `content/cv.md`.

---

## Contact flow

The contact flow is:

1. **Client dialog** (`ContactDialog.tsx`)
   - Radix `Dialog` with:
     - Required email and message fields.
     - Optional phone field.
     - Hidden `website` field (honeypot) for basic spam protection.
     - Hidden `domain` field, set to `https://opa.so`.
   - Integrates **Cloudflare Turnstile**:
     - The Turnstile script is loaded globally in `app/layout.tsx`.
     - A global `window.onTurnstileSuccess` callback receives the token.
     - The widget is inserted into a `<div className="cf-turnstile" ...>` container.
   - On submit, sends `POST /api/contact` with:
     - `email`, `phone?`, `message`, `domain?`, `turnstileToken`, `honeypot?`.

2. **API route** (`app/api/contact/route.ts`)
   - Validates payload with `zod`.
   - Anti‑spam & origin checks:
     - If `honeypot` is non‑empty → return `{ ok: true }` and do nothing else.
     - If `domain` is present and not equal to the allowed domain → `400` error.
   - Turnstile verification:
     - Requires `TURNSTILE_SECRET_KEY` in the environment.
     - Reads client IP from `x-forwarded-for` or `cf-connecting-ip` if present.
     - Calls `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
   - On success:
     - Forwards the payload to a Formspree endpoint.
   - On failure:
     - Returns appropriate `4xx`/`5xx` responses with generic messages (no internal details leaked).

### Required environment variables

To enable the contact form:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` – Public site key used on the client.
- `TURNSTILE_SECRET_KEY` – Secret key used server‑side for Turnstile verification.

The Formspree endpoint is hard‑coded in the route handler; update it there if you change providers or form IDs.

---

## Scripts

All scripts are defined in `package.json` and intended to be run via Yarn.

### Core scripts

```bash
# Dev server (Next.js, port 3000)
yarn dev

# Production build
yarn build

# Start production server (after `yarn build`)
yarn start
```

### Content & build

```bash
# Build Contentlayer output into `.contentlayer/generated`
yarn content

# Full content + app build (via custom script)
node scripts/build.mjs
```

### Linting & formatting

```bash
# Lint TypeScript/JavaScript
yarn lint

# Lint and auto-fix
yarn lint:fix

# Check formatting with Prettier
yarn format

# Auto-fix formatting
yarn format:fix
```

### Type checking

```bash
yarn typecheck
```

### Testing

```bash
# Unit tests (Vitest, jsdom)
yarn test

# Watch mode for unit tests
yarn test:watch

# End-to-end tests (Playwright)
yarn test:e2e
```

Before running Playwright tests locally, ensure:

1. The dev server is running (`yarn dev` on `http://localhost:3000`).
2. Playwright browsers are installed at least once:

```bash
npx playwright install --with-deps
```

### Maintenance

```bash
# Clean local artifacts (.next, .turbo, .contentlayer, .vercel, coverage, etc.)
yarn clean:local

# Install Husky git hooks
yarn prepare
```

---

## Linting, formatting, and git hooks

- **ESLint**:
  - Extends `next/core-web-vitals`, `plugin:@typescript-eslint/recommended`, `plugin:jsx-a11y/recommended`, `prettier`.
  - Enforces `@typescript-eslint/consistent-type-imports` (use `import type` for types).
- **Prettier**:
  - Used for `.ts`, `.tsx`, `.js`, `.jsx`, `.md`, `.mdx`, `.json`, `.css`.
- **lint-staged**:
  - On staged TypeScript/JavaScript files:
    - Runs ESLint with `--max-warnings=0`.
    - Runs Prettier (`--write`).
  - On staged markdown/JSON/CSS:
    - Runs Prettier (`--write`).
- **Husky**:
  - Pre‑commit hook runs `yarn lint-staged`, so commits must pass linting/formatting.

---

## CI & automation

GitHub Actions workflows in `.github/workflows/` include:

- `ci.yml`:
  - Runs on pushes to `main` and all PRs.
  - Installs dependencies, then runs:
    - `yarn lint`
    - `yarn typecheck`
    - `yarn test --runInBand || yarn test`
    - `npx playwright install --with-deps`
    - `yarn test:e2e`
- `lint.yml`:
  - Runs `yarn lint` on PRs.
- `accessibility.yml`:
  - Runs a placeholder accessibility audit script: `node scripts/audit-a11y.mjs`.
- `codeql.yml`:
  - Runs GitHub CodeQL analysis (JavaScript/TypeScript) on pushes, PRs targeting `main`, and a weekly schedule.
- `release-drafter.yml` and `Release Drafter` workflow:
  - Build a draft changelog and release notes based on PR labels (features, fixes, docs, maintenance).
- `automerge.yml`:
  - Listens for completed `CI` and `CodeQL` workflow runs.
  - Automatically merges certain PRs when all required checks pass and branch protection allows it:
    - Dependabot PRs authored by `dependabot[bot]` with the `dependencies` label.
    - PRs authored by `vicenteopaso` with the `copilot-automerge` label (intended for safe Copilot-assisted changes).

Dependabot is configured in `.github/dependabot.yml` to open weekly PRs for Yarn dependencies and GitHub Actions updates, labeling them as `dependencies` (and `github-actions` for workflow updates) and grouping minor/patch bumps.

> Note: For auto-merge to work safely, branch protection on `main` should require the `CI` and `CodeQL` checks and allow auto-merge.

---

## Labels

Common labels used in this repository include:

- `dependencies` – Dependency update PRs (primarily from Dependabot), eligible for auto-merge when checks pass.
- `github-actions` – Updates to GitHub Actions workflows (also opened by Dependabot).
- `copilot-automerge` – Opt-in label for PRs authored by `vicenteopaso` that are safe to auto-merge when all required checks pass.
- `enhancement`, `feature` – New features or improvements (used by Release Drafter).
- `bug`, `fix` – Bug fixes.
- `documentation`, `docs` – Documentation-only changes.
- `chore`, `refactor` – Maintenance and refactoring changes.
- `dependencies` (again) – Also used by Release Drafter to categorize maintenance changes.
- `skip-changelog` – Exclude a PR from Release Drafter’s generated release notes.

---

## Maintainer guide: branch protection & auto-merge

To get the most out of CI, CodeQL, Dependabot, and auto-merge:

1. In **Settings → Branches**, add a branch protection rule for `main`:
   - Require a pull request before merging.
   - Require status checks to pass before merging, including at least:
     - The main CI job from `ci.yml`.
     - The `CodeQL` job from `codeql.yml`.
   - Enable **Allow auto-merge**.
2. Keep the following labels available in the repository:
   - `dependencies`, `github-actions`, `copilot-automerge`, `enhancement`, `feature`, `bug`, `fix`, `documentation`, `docs`, `chore`, `refactor`, `skip-changelog`.
3. When opening PRs:
   - Dependabot will label its own PRs (`dependencies`, `github-actions`) automatically.
   - For your own PRs that are safe for auto-merge, add the `copilot-automerge` label.

With these rules in place, the `automerge.yml` workflow will only merge PRs that:

- Come from trusted sources (Dependabot or `vicenteopaso` + `copilot-automerge`).
- Have all required checks (CI and CodeQL) green.
- Satisfy your branch protection requirements.

---

## Deployment

The app is designed for a standard **Next.js deployment**, and works well on platforms like **Vercel**:

- Build command: `yarn build` (or `node scripts/build.mjs` if you want to ensure Contentlayer runs first).
- Output: Standard Next.js output (`.next`).
- Environment:
  - Provide `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in your hosting provider’s environment settings.
  - Configure any analytics, sitemap, or custom domains as needed.

---

## License

This project is open-sourced under the [MIT License](./LICENSE).

- See `SECURITY.md` for the security policy and reporting guidelines.
- See `SUPPORT.md` for support, contact information, and expectations.
