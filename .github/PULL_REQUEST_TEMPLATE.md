## Summary

<!-- Provide a clear, concise description of the changes in this PR -->

## Related Issue

<!-- Link to the related issue if applicable: Fixes #123, Closes #456 -->

## Type of Change

- [ ] `feat` — New feature or enhancement
- [ ] `fix` — Bug fix
- [ ] `chore` — Maintenance, dependencies, or configuration
- [ ] `docs` — Documentation only
- [ ] `refactor` — Code refactoring without behavior change
- [ ] `test` — Adding or updating tests

> **Note**: Changes limited to documentation (`docs/`, `README.md`, etc.) or tests will skip Vercel builds automatically. See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for details.

## Technical Governance Compliance

- [ ] Follows [Engineering Standards](../docs/ENGINEERING_STANDARDS.md)
- [ ] Follows [Architecture](../docs/ARCHITECTURE.md) guidelines
- [ ] Follows [Technical Governance](https://vicenteopaso.com/technical-governance) principles
- [ ] Aligns with the SDD (`/sdd.yaml`) or updates it in this PR
- [ ] Documentation updated in `docs/` (if applicable)
- [ ] Component documentation added/updated (if applicable)
- [ ] README updated (if behavior changes)

## AI Governance (if applicable)

> **Note**: If this PR includes AI-generated code, ensure compliance with AI governance requirements.

- [ ] Reviewed [AI Guardrails](../docs/AI_GUARDRAILS.md) — Security constraints respected
- [ ] Reviewed [Forbidden Patterns](../docs/FORBIDDEN_PATTERNS.md) — No anti-patterns introduced
- [ ] Completed [Review Checklist](../docs/REVIEW_CHECKLIST.md) — All applicable items verified
- [ ] Security controls maintained (Turnstile, rate limiting, input validation, HTML sanitization)
- [ ] No secrets or credentials hard-coded
- [ ] Accessibility standards maintained (WCAG 2.1 AA)
- [ ] Architecture boundaries respected (no cross-layer imports)

## Quality Checks

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes with adequate coverage
- [ ] `pnpm test:e2e` passes (if UI/routing changes)
- [ ] Visual tests updated if UI changed (`pnpm test:visual:update`)

## Additional Verification

- [ ] Cross-browser testing completed (if UI changes)
- [ ] Accessibility verified (keyboard nav, screen reader, ARIA)
- [ ] Performance impact considered (bundle size, Core Web Vitals)
- [ ] Security review completed (no secrets, proper input validation)
- [ ] SEO metadata updated (if content/routing changes)
