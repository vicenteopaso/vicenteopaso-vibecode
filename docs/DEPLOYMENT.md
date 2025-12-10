# Deployment Guide

This document describes how the application is deployed to production and how the build process works.

---

## Deployment Platform

The application is deployed on **Vercel**, which provides:

- Automatic deployments for every commit and pull request
- Preview deployments for PRs
- Production deployments for the `main` branch
- Edge network for global CDN distribution
- Serverless functions for API routes

---

## Build Skip Logic

To optimize CI/CD resources and reduce unnecessary builds, the project uses a **Vercel Ignored Build Step** that intelligently determines when a build should be skipped.

> **Setup Guide**: For step-by-step Vercel configuration instructions, see [VERCEL_BUILD_SKIP_SETUP.md](./VERCEL_BUILD_SKIP_SETUP.md).

### How It Works

Vercel runs the script `scripts/vercel-ignore-build.sh` before starting a build. This script:

1. Compares the current commit to the previous commit
2. Checks which files have changed
3. Returns exit code `0` (skip build) or `1` (proceed with build)

### Paths That Trigger Builds

The following paths contain code, dependencies, or configuration that affects the build output:

- **Application code:**
  - `app/` — Next.js App Router pages, layouts, and components
  - `lib/` — Utility libraries and shared functions
  - `styles/` — CSS and styling configuration
  - `public/` — Static assets (fonts, images, icons)
  - `content/` — Markdown content files
  - `scripts/` — Build scripts and utilities

- **Dependencies and configuration:**
  - `package.json` — Dependencies and scripts
  - `pnpm-lock.yaml` — Dependency lockfile
  - `next.config.mjs` — Next.js configuration
  - `tailwind.config.js` — Tailwind CSS configuration
  - `tsconfig.json` — TypeScript configuration
  - `contentlayer.config.ts` — Contentlayer configuration
  - `postcss.config.js` — PostCSS configuration
  - `eslint.config.mjs` — ESLint configuration (affects build validation)
  - `.prettierrc` — Prettier configuration (affects build validation)
  - `vercel.json` — Vercel deployment configuration
  - `instrumentation.ts` / `instrumentation-client.ts` — Next.js instrumentation files (custom tracing/hooks)
  - `sentry.edge.config.ts` / `sentry.server.config.ts` — Sentry error reporting configuration
  - `next-sitemap.config.js` — Sitemap generation configuration

**Any change to these paths will trigger a full build and deployment.**

### Paths That Skip Builds

The following paths contain documentation, tests, or metadata that doesn't affect the build output:

- **Documentation:**
  - `docs/` — Technical documentation and guides
  - `README.md` — Repository readme
  - `CONTRIBUTING.md` — Contribution guidelines
  - `WARP.md` — High-level architecture overview
  - `LICENSE` — License file
  - `SECURITY.md` — Security policy
  - `SUPPORT.md` — Support information

- **Tests and CI:**
  - `test/` — Unit, E2E, and visual regression tests
  - `.github/` — GitHub Actions workflows and configuration

- **Development configuration:**
  - `.gitignore` — Git ignore patterns
  - `.prettierignore` — Prettier ignore patterns
  - `.eslintignore` — ESLint ignore patterns
  - `.nvmrc` — Node version manager configuration
  - `pnpm-workspace.yaml` — pnpm workspace configuration

**Changes limited to these paths will skip the build entirely.**

### Mixed Changes

If a commit includes both build-triggering and skip-eligible changes, **the build will run**. The logic is conservative: when in doubt, build.

Example:

- ✅ Skip: Only updated `README.md` and `docs/TESTING.md`
- ✅ Build: Only updated `app/page.tsx`
- ✅ Build: Updated both `README.md` and `app/page.tsx`

---

## Manual Redeployment

In rare cases, you may need to manually trigger a deployment even when only documentation changed:

### Option 1: Vercel Dashboard

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to the "Deployments" tab
4. Click "Redeploy" on any previous deployment
5. Optionally check "Use existing build cache"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Trigger a production deployment
vercel --prod

# Or force a rebuild without cache
vercel --prod --force
```

### Option 3: Empty Commit

Force a build by creating an empty commit:

```bash
git commit --allow-empty -m "chore: trigger deployment"
git push origin main
```

---

## Environment Variables

The following environment variables are required for production deployment:

### Required

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile public key (contact form bot protection)
- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile secret key (server-side verification)

### Optional (Monitoring & Analytics)

- `SENTRY_DSN` — Sentry error tracking DSN
- `SENTRY_AUTH_TOKEN` — Sentry authentication token for source map uploads
- `SENTRY_ORG` — Sentry organization slug
- `SENTRY_PROJECT` — Sentry project slug
- `NEXT_PUBLIC_SENTRY_DSN` — Sentry DSN for client-side error tracking

See **[SENTRY_SETUP.md](./SENTRY_SETUP.md)** for detailed Sentry configuration.

---

## Build Configuration

### Build Command

```bash
pnpm build
```

This runs:

1. Contentlayer content processing (via `withContentlayer` wrapper in `next.config.mjs`)
2. Next.js production build
3. Static page generation for routes
4. Serverless function bundling for API routes

### Output Directory

The build output is in `.next/`, which Vercel automatically deploys.

### Build Time

Typical build times:

- Clean build: 90-180 seconds
- Cached build: 30-60 seconds

---

## Deployment Workflow

### Pull Request Deployments

1. Open a PR against `main`
2. Vercel creates a preview deployment automatically
3. Preview URL is posted as a comment on the PR
4. Each subsequent push updates the preview deployment

### Production Deployments

1. Merge PR to `main`
2. Vercel creates a production deployment automatically
3. New version is promoted to production URL
4. Previous deployment remains available for rollback

### Skipped Deployments

1. Push a docs-only commit
2. Vercel runs `scripts/vercel-ignore-build.sh`
3. Script detects no build-impacting changes
4. Build is skipped with status "Skipped (Ignored Build Step)"
5. Previous deployment remains active

---

## Rollback

To rollback to a previous deployment:

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to the "Deployments" tab
4. Find the deployment you want to restore
5. Click the three-dot menu and select "Promote to Production"

---

## Troubleshooting

### Build Skipped When It Shouldn't Be

If a build is incorrectly skipped:

1. Check the Vercel build logs for the ignored build step output
2. Verify the changed files are in the BUILD_PATHS list in `scripts/vercel-ignore-build.sh`
3. Manually trigger a deployment (see "Manual Redeployment" above)
4. Open an issue if the logic needs adjustment

### Build Runs When It Should Be Skipped

If a build runs for documentation-only changes:

1. Check the Vercel build logs for the ignored build step output
2. Verify the changed files are listed in SKIP_PATHS in `scripts/vercel-ignore-build.sh`
3. The build may run intentionally if system files were also changed
4. This is conservative behavior to avoid missing real changes

### Initial Deployment Always Builds

The first deployment of a branch always builds, even if only documentation changed. This is expected behavior because there's no previous deployment to compare against.

---

## Testing Build Skip Locally

You can test the build skip logic locally:

```bash
# Set up test environment variables
export VERCEL_GIT_PREVIOUS_SHA=$(git rev-parse HEAD~1)
export VERCEL_GIT_COMMIT_SHA=$(git rev-parse HEAD)

# Run the script
bash scripts/vercel-ignore-build.sh

# Exit code 0 = build will be skipped
# Exit code 1 = build will proceed
echo "Exit code: $?"
```

---

## Related Documentation

- [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md) — Quality standards and CI/CD principles
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical architecture and design decisions
- [SENTRY_SETUP.md](./SENTRY_SETUP.md) — Error tracking and monitoring setup
- [README.md](../README.md) — Getting started and project overview
