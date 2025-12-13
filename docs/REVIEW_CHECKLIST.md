# Review Checklist

This checklist ensures consistent, thorough review of all changes to this repository, whether authored by humans or AI tools. Use this as a pre-merge validation guide.

## Overview

Every PR should be reviewed against this checklist before merging. Some items are automated via CI, but human judgment is still required for architectural alignment, security implications, and maintainability.

## Quick Reference

**For simple changes** (docs, formatting, minor fixes):

- [ ] CI passes (lint, typecheck, tests, build)
- [ ] Documentation is accurate
- [ ] No security implications

**For code changes** (features, refactors, fixes):

- [ ] Complete the full checklist below
- [ ] All automated checks pass
- [ ] Manual verification completed

**For security-sensitive changes** (API routes, auth, validation):

- [ ] Complete the security section twice
- [ ] Get additional human review
- [ ] Test security controls manually

---

## 1. Code Quality

### Linting and Formatting

- [ ] `pnpm lint` passes with no warnings
- [ ] `pnpm format` passes (Prettier)
- [ ] Import ordering is correct (auto-sorted by ESLint)
- [ ] No ESLint disable comments without justification
- [ ] TypeScript strict mode compliance

### Type Safety

- [ ] `pnpm typecheck` passes
- [ ] No `any` types without documented justification
- [ ] `import type` used for type-only imports
- [ ] Zod schemas for all external data
- [ ] Proper type exports from shared modules

### Code Standards

- [ ] Follows patterns in `docs/ENGINEERING_STANDARDS.md`
- [ ] No forbidden patterns from `docs/FORBIDDEN_PATTERNS.md`
- [ ] Respects architecture boundaries from `sdd.yaml`
- [ ] DRY: No duplicated logic
- [ ] Functions have single responsibility
- [ ] Meaningful variable and function names

---

## 2. Security

### Input Validation

- [ ] All external input validated with Zod schemas
- [ ] Email addresses validated with proper regex/Zod
- [ ] String lengths constrained (max lengths set)
- [ ] No SQL injection vectors (this project doesn't use SQL, but check any DB queries)
- [ ] No command injection vectors

### Authentication and Authorization

- [ ] Turnstile verification present where required (`/api/contact`)
- [ ] Rate limiting maintained on API routes
- [ ] Honeypot check not bypassed
- [ ] Domain origin check not removed
- [ ] No authentication logic weakened

### Data Sanitization

- [ ] HTML sanitized via `lib/sanitize-html.ts` before rendering
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] ReactMarkdown uses controlled component mappings
- [ ] No direct `innerHTML` usage

### Secrets and Configuration

- [ ] No hard-coded secrets, API keys, or credentials
- [ ] Environment variables used for all secrets
- [ ] `NEXT_PUBLIC_*` only for truly public data
- [ ] `.env.example` updated if new env vars added
- [ ] No secrets in git history (check with `git log -p`)

### Error Handling

- [ ] Errors logged via `lib/error-logging.ts`
- [ ] No stack traces or internal details exposed to users
- [ ] Generic error messages for external users
- [ ] Structured error context for debugging

### Dependencies

- [ ] No new dependencies with known vulnerabilities
- [ ] `pnpm audit` passes (high+ vulnerabilities addressed)
- [ ] Dependencies are justified and not redundant
- [ ] License compatibility checked

---

## 3. Accessibility

### Semantic HTML

- [ ] Proper heading hierarchy (h1 → h2 → h3, no skips)
- [ ] Landmarks used (`header`, `nav`, `main`, `footer`, `aside`)
- [ ] Lists use `<ul>`, `<ol>`, `<li>` (not div soup)
- [ ] Tables use proper table markup (if applicable)
- [ ] Forms use `<label>` with `htmlFor` or nested structure

### Keyboard Navigation

- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical
- [ ] Focus visible (`:focus-visible` styles present)
- [ ] No keyboard traps
- [ ] Enter/Space work on custom interactive elements
- [ ] Escape closes modals/dialogs

### ARIA

- [ ] ARIA used only when semantic HTML insufficient
- [ ] ARIA roles, states, and properties correct
- [ ] No redundant ARIA (e.g., `role="button"` on `<button>`)
- [ ] `aria-label` or `aria-labelledby` for icons
- [ ] `aria-live` for dynamic content updates (if needed)

### Visual Accessibility

- [ ] Color contrast ≥ 4.5:1 for body text
- [ ] Color contrast ≥ 3:1 for large text and UI components
- [ ] Color not sole means of conveying information
- [ ] Focus indicators visible in both light and dark modes
- [ ] Text resizes properly (no fixed pixel font sizes)

### Images and Media

- [ ] All meaningful images have descriptive `alt` text
- [ ] Decorative images have `alt=""` and `aria-hidden="true"`
- [ ] No generic alt text ("image", "photo")
- [ ] Videos have captions (if applicable)
- [ ] SVGs have proper titles/descriptions for screen readers

### Testing

- [ ] Manual keyboard testing completed
- [ ] Screen reader testing (NVDA, VoiceOver, or JAWS) if major UI change
- [ ] `pnpm audit:a11y` passes
- [ ] Lighthouse accessibility score ≥ 90

---

## 4. Testing

### Unit Tests

- [ ] `pnpm test` passes
- [ ] New functionality has unit tests
- [ ] Changed functionality has updated tests
- [ ] Coverage thresholds maintained (90% lines, 85% branches, 90% functions)
- [ ] Tests are meaningful, not just coverage padding
- [ ] Tests focus on behavior, not implementation details
- [ ] Mocks used appropriately (external APIs, timers)

### E2E Tests

- [ ] `pnpm test:e2e` passes
- [ ] User-facing changes have E2E tests
- [ ] Critical flows covered (contact form, navigation, CV rendering)
- [ ] Tests are deterministic (no random failures)
- [ ] Proper waits (`waitFor`, `waitForSelector`) instead of `sleep`

### Visual Regression Tests

- [ ] UI changes have updated visual baselines (`pnpm test:visual:update`)
- [ ] Visual tests pass (`pnpm test:visual`)
- [ ] Screenshots reviewed for regressions
- [ ] Dynamic content properly masked in screenshots

### Manual Testing

- [ ] Feature tested locally in dev mode
- [ ] Feature tested in production build (`pnpm build && pnpm start`)
- [ ] Tested in multiple browsers (Chrome, Firefox, Safari if possible)
- [ ] Tested on mobile viewport (responsive design)
- [ ] Edge cases considered and tested

---

## 5. Performance

### Bundle Size

- [ ] No unnecessary dependencies added
- [ ] Tree-shakeable imports used (`import { specific } from 'lib'`)
- [ ] Client Components used only when necessary
- [ ] Dynamic imports for large components (if needed)

### Images and Assets

- [ ] Images optimized (Next.js `<Image>` component)
- [ ] Proper width/height attributes
- [ ] Lazy loading enabled
- [ ] WebP/AVIF formats used where appropriate
- [ ] No unoptimized assets in `public/`

### Rendering

- [ ] Server Components by default
- [ ] Client Components marked with `'use client'`
- [ ] No blocking synchronous operations
- [ ] Suspense boundaries for async data (if needed)

### Lighthouse

- [ ] Performance score ≥ 90
- [ ] Accessibility score ≥ 90
- [ ] SEO score ≥ 95
- [ ] Best Practices score ≥ 70
- [ ] Core Web Vitals green (LCP, FID, CLS)

---

## 6. SEO

### Metadata

- [ ] Page has proper `metadata` export
- [ ] Title is descriptive and unique
- [ ] Description is compelling and under 160 characters
- [ ] Canonical URL set correctly
- [ ] Open Graph tags present (`og:title`, `og:description`, `og:image`)
- [ ] Twitter Card metadata present

### Content

- [ ] Headings used for structure, not styling
- [ ] Links have descriptive text (not "click here")
- [ ] Alt text on images provides context
- [ ] Internal links use proper Next.js `<Link>`

### Technical SEO

- [ ] No broken internal links (`pnpm validate:links`)
- [ ] Sitemap updated if new routes added
- [ ] robots.txt not blocking important pages
- [ ] Structured data (JSON-LD) correct if applicable

---

## 7. Architecture and Design

### Boundaries

- [ ] Respects architecture boundaries (no cross-layer imports)
- [ ] Components in `app/components/` are UI-only
- [ ] API routes in `app/api/` handle side effects only
- [ ] Business logic in `lib/` where appropriate
- [ ] No shared mutable state across routes

### Patterns

- [ ] Follows established patterns in codebase
- [ ] Reuses existing utilities (error logging, sanitization, SEO)
- [ ] Composable components (not monolithic)
- [ ] Single Source of Truth maintained
- [ ] No duplicate configuration

### Documentation

- [ ] `README.md` updated if behavior changed
- [ ] `docs/` updated if architecture changed
- [ ] `sdd.yaml` updated if principles/boundaries changed
- [ ] Component documentation added/updated if new component
- [ ] Inline comments for complex logic (but prefer self-documenting code)

### Maintainability

- [ ] Code is readable and self-explanatory
- [ ] No premature optimization
- [ ] Trade-offs documented in comments or docs
- [ ] Consistent with existing code style
- [ ] No dead code or commented-out blocks

---

## 8. Content and Copy

### Content Changes

- [ ] English content (`content/en/`) updated
- [ ] Spanish translations generated (`pnpm translate` or wait for CI)
- [ ] Markdown syntax correct
- [ ] Links work and use proper relative/absolute paths
- [ ] Images referenced correctly

### CV Data

- [ ] CV JSON in `content/en/cv.md` is valid
- [ ] All required fields present
- [ ] HTML in CV sanitized and safe
- [ ] Dates formatted consistently

### UI Strings

- [ ] UI strings in `i18n/en/ui.json` updated
- [ ] Translations generated or marked for translation
- [ ] Consistent terminology

---

## 9. CI/CD

### Automated Checks

- [ ] All CI workflows pass
  - [ ] `ci.yml` (lint, typecheck, validate:links, test, test:e2e, build)
  - [ ] `coverage.yml` (coverage thresholds)
  - [ ] `lighthouse-ci.yml` (performance, a11y, SEO)
  - [ ] `accessibility.yml` (a11y audit)
  - [ ] `codeql.yml` (security scanning)
  - [ ] `security-audit.yml` (dependency vulnerabilities)

### Build

- [ ] Production build succeeds (`pnpm build`)
- [ ] No build warnings or errors
- [ ] No type errors
- [ ] Output is deployable

### Deployment

- [ ] Vercel build skip logic considered (docs/tests don't trigger full builds)
- [ ] Environment variables documented if new ones added
- [ ] No deployment blockers

---

## 10. AI-Specific Checks

### AI-Generated Code

- [ ] Follows `docs/AI_GUARDRAILS.md` constraints
- [ ] No forbidden patterns from `docs/FORBIDDEN_PATTERNS.md`
- [ ] Security controls not bypassed
- [ ] Documentation-first approach followed
- [ ] Aligns with `sdd.yaml` and `ENGINEERING_STANDARDS.md`

### AI Context

- [ ] Change is understandable without external context
- [ ] Rationale documented in commit message or PR description
- [ ] Links to issues or relevant docs provided

---

## 11. Final Review

### PR Quality

- [ ] PR title is clear and follows conventional commits
- [ ] PR description explains what and why
- [ ] PR template checklist completed
- [ ] Related issue linked (if applicable)
- [ ] Screenshots/recordings included for UI changes
- [ ] Breaking changes clearly called out

### Merge Readiness

- [ ] All checklist items above completed or N/A
- [ ] CI fully green
- [ ] Conflicts resolved (if any)
- [ ] Branch up to date with base branch
- [ ] Approved by required reviewers (if applicable)

### Post-Merge

- [ ] Monitor Vercel deployment
- [ ] Check Sentry for new errors (if production)
- [ ] Verify feature in production
- [ ] Close related issues

---

## Checklist Usage Guide

### For PR Authors

1. **Before opening PR**: Complete relevant sections
2. **In PR description**: Reference this checklist and note any items skipped with rationale
3. **After review**: Address feedback and re-check

### For Reviewers

1. **Skim PR**: Understand scope and complexity
2. **Check CI**: Ensure automated checks pass
3. **Use checklist**: Go through relevant sections systematically
4. **Focus on**:
   - Security implications
   - Architecture alignment
   - Maintainability
   - Test quality
5. **Approve when**: All critical items checked, minor items noted but not blocking

### For AI Copilots

1. **Pre-commit**: Run through checklist locally
2. **Include in PR**: Note which items verified
3. **Self-review**: If checklist reveals issues, fix before submitting
4. **Learn**: Update AI context with lessons from failed checks

---

## Related Documentation

- [AI Guardrails](./AI_GUARDRAILS.md) — Constraints for AI-generated code
- [Forbidden Patterns](./FORBIDDEN_PATTERNS.md) — Anti-patterns to avoid
- [Engineering Standards](./ENGINEERING_STANDARDS.md) — Quality bar
- [Architecture](./ARCHITECTURE.md) — System design
- [Security Policy](./SECURITY_POLICY.md) — Security practices
- [Accessibility](./ACCESSIBILITY.md) — A11y guidelines

---

## Continuous Improvement

This checklist evolves with the project:

- Items may be added as new patterns emerge
- Automated checks reduce manual review burden
- Feedback from PR reviews informs updates
- Lessons from production issues are incorporated

**Last updated**: December 13, 2024
