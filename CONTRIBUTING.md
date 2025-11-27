# Contributing

This project uses **pnpm** for package management.

## Prerequisites

- Node.js (LTS recommended)
- pnpm (see `packageManager` in `package.json` for the expected version)

## Installing dependencies

```bash
pnpm install
```

## Common commands

- Start dev server:
  ```bash
  pnpm dev
  ```
- Run tests:
  ```bash
  pnpm test
  ```
- Run end-to-end tests (requires dev server running on `http://localhost:3000`):
  ```bash
  pnpm test:e2e
  ```
- Lint:
  ```bash
  pnpm lint
  ```
- Type check:
  ```bash
  pnpm typecheck
  ```
- Generate unit test coverage:
  ```bash
  pnpm coverage
  ```
- Generate sitemap (requires build first):
  ```bash
  pnpm build
  pnpm sitemap
  ```

## Before opening a PR

- Make sure the code is formatted, linted, and type-safe:
- - `pnpm lint` (or `pnpm lint:fix` to auto-fix import ordering and other auto-fixable issues)
- - `pnpm typecheck`
- Run tests locally:
- - `pnpm test`
- - `pnpm test:e2e` (when relevant)
- - `pnpm coverage` to verify coverage and generate reports.
- Check for security vulnerabilities in dependencies:
- - `pnpm audit:security` to check for moderate+ vulnerabilities
- - `pnpm audit:security:fix` to attempt automatic fixes if needed
- Update documentation (README/docs) when changing behavior, workflows, or environment requirements.

### Linting guidelines

- **Import ordering**: Imports are automatically sorted by `eslint-plugin-simple-import-sort`. Run `pnpm lint:fix` to auto-sort imports.
- **Security**: The security plugin will warn about potential security issues. Most checks are errors, but some are warnings to avoid noise. Review and address security warnings appropriately.
- **Type imports**: Use `import type` for type-only imports to satisfy `@typescript-eslint/consistent-type-imports`.

## CI, CodeQL, and auto-merge

- CI and CodeQL run automatically on pushes and pull requests to `main`.
- Dependabot opens weekly PRs for dependency and GitHub Actions updates; these are labeled `dependencies` (and `github-actions` for workflow updates).
- Some PRs can be auto-merged when all required checks pass and branch protection allows it:
  - Dependabot PRs with the `dependencies` label.
  - PRs authored by `vicenteopaso` with the `copilot-automerge` label.

Please prefer `pnpm` over `npm` or `yarn` when working in this repository.
