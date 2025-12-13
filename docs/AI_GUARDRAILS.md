# AI Guardrails

This document defines the constraints, safety measures, and quality gates that govern AI-assisted development in this repository.

## Overview

This project embraces AI-first development with strong guardrails to ensure code quality, security, and maintainability. AI tools (GitHub Copilot, Cursor, etc.) are used extensively, but their outputs are subject to rigorous validation and review processes.

## Core Principles

### 1. AI as Accelerator, Not Decision Maker

- AI tools suggest implementations based on documented standards
- Architectural decisions remain human-driven and documented in governance docs
- AI operates within boundaries defined by `sdd.yaml` and engineering standards
- Final approval and responsibility rest with human reviewers

### 2. Documentation-First Foundation

- AI tools reference comprehensive governance documents for context
- Standards in `docs/ENGINEERING_STANDARDS.md` guide AI suggestions
- Architecture in `docs/ARCHITECTURE.md` constrains AI implementation choices
- AI helps maintain documentation consistency as code evolves

### 3. Quality Gates Are Non-Negotiable

- All AI-generated code must pass CI checks (lint, typecheck, tests)
- Coverage thresholds (90% lines, 85% branches, 90% functions) must be maintained
- Accessibility standards (WCAG 2.1 AA) cannot be regressed
- Security checks (CodeQL, dependency scanning) must pass

## Mandatory Guardrails

### Security Constraints

**AI-generated code must never:**

- Bypass Cloudflare Turnstile verification in contact flow
- Remove or weaken rate limiting in `/api/contact`
- Disable honeypot spam protection
- Remove domain origin checks
- Hard-code secrets, API keys, or credentials
- Weaken Content Security Policy (CSP) or security headers
- Introduce XSS vulnerabilities (all HTML must be sanitized via `lib/sanitize-html.ts`)
- Bypass error logging (all errors must use `lib/error-logging.ts`)

**Required security practices:**

- All external input must be validated with Zod schemas
- All HTML content must be sanitized before rendering
- Environment variables must be used for all secrets
- Rate limiting must be maintained on all API routes
- Turnstile tokens must be verified server-side

### Accessibility Constraints

**AI-generated code must maintain:**

- WCAG 2.1 AA compliance minimum
- Semantic HTML structure (proper heading hierarchy, landmarks)
- Keyboard navigation (tab order, focus visible, no traps)
- ARIA attributes used correctly (only when necessary)
- Color contrast ratios ≥ 4.5:1 for body text
- Alt text on all non-decorative images
- Screen reader compatibility

**Prohibited accessibility regressions:**

- Breaking keyboard navigation
- Removing semantic HTML elements
- Adding incorrect or redundant ARIA
- Reducing color contrast below thresholds
- Breaking focus management

### Architecture Boundaries

**AI tools must respect:**

- **App Router structure**: Components stay in `app/components/`, no mixing with API routes
- **Server Components first**: Use Client Components only when necessary
- **Pure logic in `lib/`**: Business rules don't belong in API routes or components
- **Single Source of Truth**: Configuration in `lib/seo.ts`, error handling in `lib/error-logging.ts`
- **Content separation**: Content lives in `content/`, not hard-coded in components

**Prohibited patterns:**

- Shared mutable state across routes
- Cross-layer imports (e.g., `app/components` importing from `app/api`)
- Direct filesystem or `process.env` access in components (use props/lib helpers)
- Bypassing centralized error logging or sanitization utilities

### Testing Requirements

**All AI-generated code changes must:**

- Include or update unit tests (Vitest) for new functionality
- Include or update E2E tests (Playwright) for user-facing changes
- Maintain or improve coverage thresholds
- Update visual regression baselines if UI changed
- Pass all existing tests without modification (unless fixing bugs)

**Test patterns:**

- Unit tests in `test/unit/` mirror file structure
- E2E tests in `test/e2e/` cover critical user flows
- Visual tests in `test/visual/` validate UI consistency
- Coverage exclusions are justified in `vitest.config.ts`

## CI/CD Enforcement

### Required CI Checks

All PRs (including AI-generated changes) must pass:

1. **Linting** (`pnpm lint`)
   - ESLint with Next.js, TypeScript, a11y, security rules
   - Import ordering with `eslint-plugin-simple-import-sort`
   - Prettier formatting

2. **Type Checking** (`pnpm typecheck`)
   - TypeScript strict mode
   - No `any` types without justification
   - Consistent type imports (`import type`)

3. **Link Validation** (`pnpm validate:links`)
   - All internal markdown links must resolve
   - Broken links fail CI

4. **Unit Tests** (`pnpm test`)
   - Coverage thresholds: 90% lines, 85% branches, 90% functions
   - Tests must be meaningful, not just coverage padding

5. **E2E Tests** (`pnpm test:e2e`)
   - Core user flows must pass
   - Contact form, navigation, content rendering

6. **Build** (`pnpm build`)
   - Production build must succeed
   - No build-time errors or warnings

7. **Accessibility Audit** (`.github/workflows/accessibility.yml`)
   - Automated a11y checks
   - Image alt text validation

8. **Security Scanning**
   - CodeQL analysis (JavaScript/TypeScript)
   - Dependency vulnerability scanning
   - High+ vulnerabilities block merge

9. **Lighthouse CI** (`.github/workflows/lighthouse-ci.yml`)
   - Performance ≥ 90
   - Accessibility ≥ 90
   - SEO ≥ 95 (error threshold)

### Automated vs Manual Review

**Auto-merge eligible** (with `copilot-automerge` label):

- Documentation-only changes
- Dependency updates (via Dependabot)
- Test updates without behavior changes
- Formatting/linting fixes

**Requires manual review:**

- Security-related changes
- API route modifications
- Contact form changes
- Architecture changes
- Breaking changes
- New dependencies

## AI-Assisted Workflow

### Development Phase

1. **Context Loading**
   - AI reads `sdd.yaml` for principles and boundaries
   - AI consults `docs/ENGINEERING_STANDARDS.md` for quality bar
   - AI references `docs/ARCHITECTURE.md` for design patterns

2. **Implementation**
   - AI suggests code following documented patterns
   - AI generates tests matching coverage requirements
   - AI updates documentation when introducing new patterns

3. **Validation**
   - AI runs `pnpm lint:fix` and `pnpm format:fix`
   - AI runs `pnpm typecheck`
   - AI runs `pnpm test` and verifies coverage

### Review Phase

1. **Self-Review Checklist** (see `docs/REVIEW_CHECKLIST.md`)
   - Security: No secrets, proper validation, sanitization
   - Accessibility: Keyboard nav, ARIA, contrast
   - Testing: Coverage maintained, meaningful tests
   - Documentation: Updated if behavior changed

2. **CI Validation**
   - All required checks pass
   - No new warnings or errors
   - Lighthouse scores maintained

3. **Human Review**
   - Architectural alignment verified
   - Security implications assessed
   - Maintainability considered

## Escalation Path

### When AI-Generated Code Fails

1. **CI Failure**
   - Review GitHub Actions logs
   - Fix issues locally
   - Re-run checks
   - Push fixes

2. **Security Vulnerability**
   - Stop immediately
   - Review `docs/SECURITY_POLICY.md`
   - Fix vulnerability
   - Re-run CodeQL and security scans
   - Document decision if vulnerability is false positive

3. **Accessibility Regression**
   - Review `docs/ACCESSIBILITY.md`
   - Fix with keyboard testing
   - Verify with screen reader
   - Update visual tests if needed

4. **Architecture Violation**
   - Review `docs/ARCHITECTURE.md` and `sdd.yaml`
   - Refactor to align with boundaries
   - Update documentation if pattern is new
   - Get human approval for architecture changes

### Emergency Stop Conditions

**Immediately stop and escalate if:**

- Security checks fail with high/critical vulnerabilities
- Production errors spike after deployment
- Accessibility is severely broken
- Data loss or corruption occurs
- Secrets are exposed in commits

**Escalation contacts:**

- Repository owner: @vicenteopaso
- Security issues: Follow `SECURITY.md` private reporting
- GitHub Security Advisories for vulnerabilities

## Monitoring and Observability

### Error Tracking

- **Sentry integration**: All production errors captured
- **Structured logging**: Via `lib/error-logging.ts`
- **Error boundaries**: Graceful UI fallbacks
- **Vercel logs**: Build and runtime diagnostics

### Performance Monitoring

- **Lighthouse CI**: Automated on every PR
- **Core Web Vitals**: Tracked in production
- **Bundle analysis**: Manual via `pnpm build`

### Security Monitoring

- **Dependabot**: Weekly dependency scans
- **CodeQL**: On every PR and weekly
- **Manual audits**: `pnpm audit:security`

## Related Documentation

- [Forbidden Patterns](./FORBIDDEN_PATTERNS.md) — Anti-patterns and prohibited changes
- [Review Checklist](./REVIEW_CHECKLIST.md) — Pre-merge validation checklist
- [Engineering Standards](./ENGINEERING_STANDARDS.md) — Quality bar and coding standards
- [Security Policy](./SECURITY_POLICY.md) — Threat model and security practices
- [Architecture](./ARCHITECTURE.md) — System design and boundaries
- [Technical Governance](../content/en/technical-governance.md) — Governance model and decision-making

## Continuous Improvement

This document evolves with the project:

- Guardrails may be added as new risks are identified
- Thresholds may be tightened as quality improves
- New tools may be integrated as AI tooling evolves
- Feedback from CI failures informs updates

**Last updated**: December 13, 2024
