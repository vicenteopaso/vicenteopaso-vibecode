# ADR-0002: Implement AI Guardrails in CI

**Status:** Accepted

**Date:** 2025-12-13

**Deciders:** Development Team

**Tags:** architecture, ci, testing, quality-assurance

## Context

Without automated CI gates for AI-generated changes:

- AI-generated changes may lack tests or only pass lint by accident
- Architectural decisions can be merged without documented rationale
- Reviewers lack a machine-enforced checklist (a11y, SEO, error handling)
- Regressions slip through because visual/e2e/unit tests are not mandatory
- There's no way to distinguish "AI-generated" changes for stricter review

The project already has comprehensive testing infrastructure (unit, e2e, visual) and quality tools (lint, typecheck), but these are not all enforced consistently in CI for every PR.

## Decision

We will implement AI guardrails through:

1. **Enhanced CI Workflow** (`.github/workflows/ci.yml`):
   - Add visual regression tests to CI pipeline
   - Add test coverage verification step
   - Check PR template compliance
   - Validate ADR linkage for architecture changes

2. **Test Coverage Verification Script** (`scripts/check-pr-tests.mjs`):
   - Verify that code changes in `app/` or `lib/` have corresponding test changes
   - Fail CI if tests are missing for code changes
   - Allow bypass for documentation-only changes

3. **Enhanced PR Template** (`.github/PULL_REQUEST_TEMPLATE.md`):
   - Add explicit AI guardrails checkboxes
   - Require ADR links for architecture changes
   - Enforce quality checklist items

4. **ADR Process** (`docs/adr/`):
   - Establish directory structure for Architecture Decision Records
   - Provide template and guidelines
   - Require ADRs for PRs labeled `architecture-change`

## Consequences

### Positive

- **Consistency**: Every code change is held to the same testing standard
- **Documentation**: Architecture changes are documented with rationale
- **Quality**: Automated checks reduce reviewer burden and catch issues early
- **Transparency**: Clear expectations for what constitutes a complete PR
- **Prevention**: Visual, e2e, and unit tests become mandatory, preventing regressions

### Negative

- **Overhead**: Small changes require test updates, which may feel heavy for trivial fixes
- **Friction**: Contributors must understand and satisfy multiple checks
- **Maintenance**: Test coverage script needs to be maintained as project structure evolves

### Risks

- **False Positives**: Script may flag legitimate changes (e.g., pure refactors) as missing tests
  - Mitigation: Allow manual override and clear documentation on when tests are required
- **Developer Experience**: Too many checks may slow down development
  - Mitigation: Keep checks fast with caching; provide clear error messages
- **Test Quality**: Enforcing test presence doesn't guarantee test quality
  - Mitigation: Code review still required; rely on coverage reports for depth

## Alternatives Considered

### 1. Manual Code Review Only

- **Rejected**: Too inconsistent; relies on reviewer availability and attention
- Human reviewers can still miss things; automation provides baseline

### 2. Post-Merge Quality Checks

- **Rejected**: Allows issues into main branch; harder to revert
- Prefer blocking at PR stage to keep main stable

### 3. Lightweight Checks (lint/typecheck only)

- **Rejected**: Insufficient; many quality issues only caught by runtime tests
- Visual regressions and e2e flows require actual test execution

### 4. Require 100% Code Coverage

- **Rejected**: Too strict; coverage percentage doesn't guarantee quality
- Instead, require test file changes to accompany code changes

## References

- [Engineering Standards](../ENGINEERING_STANDARDS.md)
- [Testing Documentation](../TESTING.md)
- [Visual Regression Testing](../VISUAL_REGRESSION_TESTING.md)
