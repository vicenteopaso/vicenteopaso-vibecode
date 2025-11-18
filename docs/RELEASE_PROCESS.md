# Release Process

This project uses a lightweight release process suitable for a personal site.

## Branching

- `main` is always deployable.
- Feature branches are used for changes and merged via PR.

## Steps

1. Open a PR with your changes.
2. Ensure CI checks pass (lint, tests, accessibility).
3. Merge into `main` once approvals/checks are green.
4. Vercel automatically deploys `main`.

## Versioning

- Track notable changes in `CHANGELOG.md`.
- Use semantic versioning concepts informally (major/minor/patch).
