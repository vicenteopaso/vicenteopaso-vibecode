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

## Composite scripts

These scripts simplify common developer workflows:

- **Full local reset** (wipe → reinstall → rebuild):

  ```bash
  pnpm reset
  ```

  Use when the environment is in an inconsistent state, after switching branches with lockfile changes, or after upgrading dependencies.

- **Full local verification** (install → lint → typecheck → validate:links → test → test:e2e → build):
  ```bash
  pnpm verify
  ```
  Use before pushing changes to ensure local correctness matches CI expectations. This mirrors the CI pipeline. Requires Playwright browsers to be installed (`npx playwright install --with-deps`).

## Before opening a PR

- Make sure the code is formatted, linted, and type-safe:
  - `pnpm lint` (or `pnpm lint:fix` to auto-fix import ordering and other auto-fixable issues)
  - `pnpm typecheck`
- Run tests locally:
  - `pnpm test` (unit & integration tests)
  - `pnpm test:e2e` (end-to-end tests when relevant)
  - `pnpm test:visual` (visual regression tests when UI changes)
  - `pnpm coverage` to verify coverage stays above 90%
- Check for security vulnerabilities in dependencies:
  - `pnpm audit:security` to check for high+ vulnerabilities
- Update documentation (README/docs) when changing behavior, workflows, or environment requirements.

### Testing guidelines

This project maintains **>90% test coverage** across multiple testing layers. See [Testing Guide](./docs/TESTING.md) for comprehensive documentation.

#### Test Types

- **Unit tests** (`pnpm test`): Test individual functions, utilities, and component logic
- **E2E tests** (`pnpm test:e2e`): Test complete user flows and critical paths
- **Visual regression** (`pnpm test:visual`): Catch unintended UI changes
- **Type checking** (`pnpm typecheck`): Ensure TypeScript type safety

#### When to Add Tests

- **New features**: Always include unit and E2E tests for new functionality
- **Bug fixes**: Add regression test that would have caught the bug
- **UI changes**: Run visual tests and update baselines if intentional
- **Refactoring**: Tests should still pass; if not, tests need updating

#### Running Tests

```bash
# Quick test run
pnpm test                    # Unit tests only

# Full test suite
pnpm test:e2e                # E2E tests (requires dev server)
pnpm test:visual             # Visual regression tests
pnpm coverage                # Generate coverage report

# Update visual baselines (after intentional UI changes)
pnpm test:visual:update
```

#### Test Coverage Requirements

- Maintain **>90% statement coverage**
- All new components must have tests
- All bug fixes must include regression tests
- E2E tests required for critical user flows (contact form, CV download, navigation)

See [Testing Guide](./docs/TESTING.md) for detailed best practices and examples.

### Component documentation guidelines

When creating or modifying UI components:

- **Document new components** in `docs/components/` following the established format (see [Component Catalog](./docs/components/README.md)).
- **Update existing documentation** when component APIs change (props, behavior, accessibility features).
- **Include**:
  - Purpose and use cases
  - Complete props/API reference with TypeScript types
  - Usage examples with code snippets
  - Accessibility features (keyboard navigation, ARIA, screen reader support)
  - Design tokens used (colors, spacing, typography)
  - Testing notes and current coverage
- **Link from `DESIGN_SYSTEM.md`** if the component represents a new design pattern.
- See existing component docs (`ProfileCard.md`, `Modal.md`, etc.) as examples.

### Linting guidelines

- **Import ordering**: Imports are automatically sorted by `eslint-plugin-simple-import-sort`. Run `pnpm lint:fix` to auto-sort imports.
- **Security**: The security plugin will warn about potential security issues. Most checks are errors, but some are warnings to avoid noise. Review and address security warnings appropriately.
- **Type imports**: Use `import type` for type-only imports to satisfy `@typescript-eslint/consistent-type-imports`.

### Error handling guidelines

- **Client-side errors**: Use `ErrorBoundary` component for React errors and `logError()` from `lib/error-logging` for explicit error logging.
- **Server-side errors**: Use `console.error()` in API routes and server components; Vercel logs capture these in production.
- **Structured logging**: Use `logError()` and `logWarning()` from `lib/error-logging` to include context (component, action, metadata).
- **User-friendly fallbacks**: Never expose stack traces or internal details to users; always show graceful error messages.
- See `docs/ERROR_HANDLING.md` for comprehensive error handling patterns and debugging workflows.

## CI, CodeQL, and auto-merge

- CI and CodeQL run automatically on pushes and pull requests to `main`.
- Dependabot opens weekly PRs for dependency and GitHub Actions updates; these are labeled `dependencies` (and `github-actions` for workflow updates).
- Some PRs can be auto-merged when all required checks pass and branch protection allows it:
  - Dependabot PRs with the `dependencies` label.
  - PRs authored by `vicenteopaso` with the `copilot-automerge` label.

## Labels

Repository labels are managed declaratively via `.github/labels.yml`. The `sync-labels` workflow syncs labels automatically when the configuration file changes. To add or modify labels, update the configuration file and merge to `main`.

Please prefer `pnpm` over `npm` or `yarn` when working in this repository.
