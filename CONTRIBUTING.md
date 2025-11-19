# Contributing

This project uses **Yarn** for package management.

## Prerequisites

- Node.js (LTS recommended)
- Yarn 1.x (currently `1.22.22`)

## Installing dependencies

```bash
yarn install
```

## Common commands

- Start dev server:
  ```bash
  yarn dev
  ```
- Run tests:
  ```bash
  yarn test
  ```
- Run end-to-end tests (requires dev server running on `http://localhost:3000`):
  ```bash
  yarn test:e2e
  ```
- Lint:
  ```bash
  yarn lint
  ```
- Type check:
  ```bash
  yarn typecheck
  ```

## CI, CodeQL, and auto-merge

- CI and CodeQL run automatically on pushes and pull requests to `main`.
- Dependabot opens weekly PRs for dependency and GitHub Actions updates; these are labeled `dependencies` (and `github-actions` for workflow updates).
- Some PRs can be auto-merged when all required checks pass and branch protection allows it:
  - Dependabot PRs with the `dependencies` label.
  - PRs authored by `vicenteopaso` with the `copilot-automerge` label.

Please prefer `yarn` over `npm` or `pnpm` when working in this repository.
