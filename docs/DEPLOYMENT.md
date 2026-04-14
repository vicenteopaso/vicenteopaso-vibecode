# Deployment Guide

This document describes how the application is built in GitHub Actions and deployed to Vercel.

---

## Deployment Platform

The application is hosted on **Vercel**, while builds and deployment orchestration run from **GitHub Actions**.

- Pull requests against `main` create preview deployments.
- Pushes to `main` create production deployments.
- Vercel Git deployments are disabled in `vercel.json`.
- GitHub Actions runs quality checks before each Vercel build.
- Deployments use `vercel deploy --prebuilt`, so the artifact built in GitHub is the artifact Vercel deploys.

---

## GitHub Actions Workflow

Deployment is handled by `.github/workflows/vercel.yml`.

### Preview Deployments

Preview deployments run for pull requests targeting `main` when the PR branch is in this repository.

The workflow:

1. Checks out the PR branch
2. Enables Corepack and uses the Node version from `.nvmrc`
3. Installs dependencies with `pnpm install --frozen-lockfile`
4. Installs the Vercel CLI
5. Pulls the Vercel preview environment with `vercel pull --environment=preview`
6. Runs `pnpm lint`, `pnpm typecheck`, and `pnpm test`
7. Builds with `vercel build`
8. Deploys with `vercel deploy --prebuilt`

Forked PRs do not run preview deployments because Vercel secrets are not available to untrusted forks.

### Production Deployments

Production deployments run on pushes to `main`.

The workflow follows the same validation path as previews, then runs:

```bash
vercel build --prod
vercel deploy --prebuilt --prod
```

---

## Required GitHub Secrets

Configure these secrets in GitHub repository settings under **Settings** -> **Secrets and variables** -> **Actions**:

- `VERCEL_ORG_ID` — Vercel team or user ID
- `VERCEL_PROJECT_ID` — Vercel project ID
- `VERCEL_TOKEN` — Vercel token with access to the project

The workflow uses GitHub environments named `preview` and `production`. If either environment has protection rules, deployment waits for those rules to pass.

---

## Vercel Configuration

`vercel.json` disables Vercel's automatic Git integration:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": false
  }
}
```

This keeps Vercel from creating a second build for the same commit. GitHub Actions is the only automatic deployment path.

---

## Environment Variables

Application environment variables should remain configured in Vercel project settings. The GitHub workflow pulls them before each build with `vercel pull`.

### Required

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile public key for the contact form
- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile secret key for server-side verification

### Optional Monitoring & Analytics

- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `NEXT_PUBLIC_SENTRY_DSN`

See [SENTRY_SETUP.md](./SENTRY_SETUP.md) for detailed Sentry configuration.

---

## Build Configuration

GitHub Actions installs dependencies, pulls the Vercel environment, and lets Vercel CLI perform the framework-aware build.

### Local Build

```bash
pnpm build
```

### Deployment Build

```bash
vercel build
vercel build --prod
```

The build output is generated in `.vercel/output` for prebuilt deployment.

---

## Manual Redeployment

### Option 1: GitHub Actions

Use **Actions** -> **Build and deploy to Vercel** and rerun the latest workflow run for the branch or commit you want to deploy.

### Option 2: Empty Commit

Force a production deployment from `main`:

```bash
git commit --allow-empty -m "chore: trigger deployment"
git push origin main
```

### Option 3: Local Vercel CLI

Use this only when you intentionally want to deploy outside the GitHub workflow:

```bash
npm install -g vercel
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```

---

## Rollback

To roll back to a previous deployment:

1. Go to the Vercel Dashboard
2. Select the project
3. Open the **Deployments** tab
4. Find the deployment to restore
5. Use **Promote to Production**

---

## Troubleshooting

### Vercel Builds a Commit Automatically

Check `vercel.json` and the Vercel project Git settings. `git.deploymentEnabled` should be `false`, and there should not be a Vercel-side Git deployment path enabled for this repository.

### GitHub Deployment Cannot Pull Vercel Settings

Verify `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and `VERCEL_TOKEN` are available to the selected GitHub environment. Environment protection rules can also block secret access until approval.

### Preview Deployment Is Missing

Preview deployments only run for pull requests from branches in this repository. Forked PRs intentionally skip the deployment job because GitHub does not expose deployment secrets to untrusted forks.

### Build Fails in `vercel build`

Use the GitHub Actions logs first. They contain the lint, typecheck, test, Vercel environment pull, and build output for the same artifact that would be deployed.

---

## Related Documentation

- [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md) — Quality standards and CI/CD principles
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical architecture and design decisions
- [SENTRY_SETUP.md](./SENTRY_SETUP.md) — Error tracking and monitoring setup
- [README.md](../README.md) — Getting started and project overview
