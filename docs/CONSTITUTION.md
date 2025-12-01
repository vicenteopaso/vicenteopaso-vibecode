# Engineering Constitution

This document defines how this repository is run and maintained.

## Purpose

- Treat this personal site like a well-governed product.
- Make decisions explicit.
- Keep quality high without slowing down iteration.

## Principles

1. **Single Source of Truth** — The main branch reflects the canonical state of the site.
2. **Quality Over Volume** — Fewer, higher-quality pages instead of many shallow ones.
3. **Accessibility First** — Features must be keyboard- and screen-reader friendly.
4. **SEO as a Feature** — Structured data, metadata, and performance are first-class.
5. **Continuous Improvement** — Small, frequent improvements beat big rewrites.
6. **Standards-Driven Engineering** — Architecture, testing, a11y, performance, and governance follow the intent captured in `docs/ENGINEERING_STANDARDS.md`.

## Decision-Making

- Architectural decisions are documented inline in code comments or in `ARCHITECTURE.md`.
- Changes to governance or policies are made via PRs that clearly state intent.

## Change Process

1. Open an issue using the appropriate template (bug report, feature request, or documentation) or write a short rationale in the PR description.
2. Run linting, tests, and accessibility checks locally where possible.
3. Use small, focused PRs that are easy to review.

## Quality Gates & CI

- `main` must always be in a deployable state.
- All PRs are expected to keep the following checks green:
- - `pnpm lint`
- - `pnpm typecheck`
- - `pnpm test` (unit tests)
- - `pnpm test:e2e` when UI or routing changes are involved
- - `pnpm coverage` for unit test coverage
- GitHub Actions CI mirrors these expectations and also runs accessibility and security checks (CodeQL).

## Coverage & Testing Expectations

- Unit tests are the default; new features should ship with tests and bug fixes should include regression tests.
- Vitest coverage thresholds are set to a minimum of ~80% for lines, statements, branches, and functions.
- Coverage reports live in `coverage/unit`; treat noticeable drops in coverage as a reason to add or improve tests.

## Automation & Bots

- Dependabot manages dependency and GitHub Actions updates.
- Auto-merge is allowed only for:
  - Dependabot PRs labeled `dependencies` (and `github-actions` where relevant) once required checks pass.
  - PRs authored by `vicenteopaso` that are explicitly labeled `copilot-automerge`.
- Release notes are drafted automatically based on PR labels (features, fixes, docs, dependencies, etc.).

## Labels

Repository labels are managed declaratively via `.github/labels.yml` and synced automatically by the `sync-labels` workflow. This ensures:

- Required labels for Dependabot (`dependencies`, `github-actions`) always exist.
- Labels for Release Drafter categorization are consistent.
- New labels can be added by updating the configuration file.

To add or modify labels, edit `.github/labels.yml` and merge to `main`. The workflow runs automatically on changes to that file or can be triggered manually.

## Branch & PR Policy

- `main` is protected and changes land via Pull Requests.
- PRs should be small, focused, and easy to review.
- Documentation should be updated alongside behavior or workflow changes (including CI, coverage, and scripts).
- Secrets must never be committed; environment configuration is documented instead.
