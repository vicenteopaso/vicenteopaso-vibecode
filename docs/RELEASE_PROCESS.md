# Release Process

This project uses a lightweight release process suitable for a personal site.

## Branching

- `main` is always deployable.
- Feature branches are used for changes and merged via PR.

## Steps

1. Open a PR with your changes.
2. Ensure all CI checks pass, including at least:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm test:e2e` (when relevant)
   - `pnpm coverage`
   - Accessibility and security checks (CodeQL) run in GitHub Actions.
3. Merge into `main` once approvals/checks are green.
4. Vercel automatically deploys `main`.

## Versioning & Release Notes

- Release notes are drafted automatically using Release Drafter, based on PR labels (features, fixes, docs, dependencies, etc.).
- Semantic versioning concepts (major/minor/patch) are applied informally through PR labeling and generated release notes.
