<!-- Note: Issues are disabled in this repo. Use PRs for any proposed changes. -->

## Summary

Explain the change in a sentence or two.

## Type of change

- [ ] feat (new feature)
- [ ] fix (bug fix)
- [ ] chore (maintenance, deps, config)
- [ ] docs (documentation only)
- [ ] refactor (no behavior change)

## Context / Motivation

Why is this change needed? Link to any related discussions or references.

## Screenshots / Videos (if UI)

Add before/after visuals and responsive states if applicable.

## Accessibility considerations

List any a11y checks (focus order, semantics, color contrast, keyboard nav, ARIA, prefers-color-scheme, etc.).

## Test plan

Commands you ran and scenarios covered (edit as appropriate):

- `yarn lint`
- `yarn typecheck`
- `yarn test`
- `npx playwright install --with-deps` (first run only)
- `yarn test:e2e` (if relevant)

## Risks & Rollout

Potential regressions, feature flags, or rollout notes.

---

### Checklist

- [ ] yarn lint
- [ ] yarn typecheck
- [ ] yarn test
- [ ] yarn test:e2e (if relevant)
- [ ] Updated README/docs if needed
- [ ] No secrets or keys committed; env vars documented
- [ ] Cross-browser/viewport checks for UI changes (if relevant)
