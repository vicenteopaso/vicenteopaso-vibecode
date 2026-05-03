# BrutalistFooter

Primary site footer for the v3 brutalist redesign. Renders the site wordmark, policy links, and copyright line.

**File**: `app/components/BrutalistFooter.tsx`

## Behaviour

- Policy links use `next/link` with locale-prefixed hrefs (e.g. `/${locale}/privacy-policy`) so navigation stays client-side and avoids redirect through the locale proxy
- Links are i18n-driven via `t("footer.*")` keys

## Props

None — reads locale from `LocaleProvider`.

## Footer Links

| Label key | Route |
| --- | --- |
| `footer.privacy` | `/${locale}/privacy-policy` |
| `footer.cookie` | `/${locale}/cookie-policy` |
| `footer.techStack` | `/${locale}/tech-stack` |

## Accessibility

All policy links are standard `<Link>` anchors with descriptive text.

## Visual Testing

Covered by `test/visual/components/footer.visual.spec.ts` — light, dark, mobile, and CV page variants.
