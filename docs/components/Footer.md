# Footer Component

## Overview

The `Footer` component is the site-wide footer containing copyright information, attribution links, and navigation to policy/governance pages.

**Location:** `app/components/Footer.tsx`

**Usage:** Rendered in root layout (`app/layout.tsx`)

## Props

None - The component is self-contained and generates the current year dynamically.

## Features

- **Dynamic copyright year**: Automatically updates via `new Date().getFullYear()`
- **Attribution links**: Credits to [Warp](https://app.warp.dev/referral/8X3W39) and Cursor development tools
- **Policy navigation**: Links to legal and governance pages
- **Responsive layout**: Stacks vertically on mobile, horizontal on desktop
- **Semantic separators**: Visual separators hidden from screen readers

## Structure

```tsx
<footer>
  <div className="shell">
    <p>© {year} Vicente Opaso. Vibecoded with...</p>
    <nav>{/* Policy and governance links */}</nav>
  </div>
</footer>
```

## Links

### Attribution Links (External)

1. **Warp** - `https://app.warp.dev/referral/8X3W39`
   - Terminal application
   - Opens in new tab
   - `rel="noreferrer"` for security

2. **Cursor** - `https://cursor.com`
   - AI code editor
   - Opens in new tab
   - `rel="noreferrer"` for security

### Policy Links (Internal)

1. **Privacy Policy** - `/privacy-policy`
2. **Cookie Policy** - `/cookie-policy`
3. **Accessibility** - `/accessibility`
4. **Technical Governance** - `/technical-governance`
5. **Tech Stack** - `/tech-stack`

## Design Tokens

```css
--bg-app         /* Footer background (95% opacity) */
--border-subtle  /* Top border color */
--text-muted     /* Copyright text, separators */
--link           /* Link default color */
--link-hover     /* Link hover color */
```

## Accessibility

### Semantic HTML

- Uses `<footer>` landmark element
- Proper link text (no "click here" patterns)
- External links have `target="_blank"` and `rel="noreferrer"`

### ARIA Attributes

- Separators use `aria-hidden="true"` (decorative pipe `|` characters)
- Links have descriptive text (no additional ARIA needed)

### Keyboard Navigation

- All links are keyboard accessible
- Focus visible outline on all links
- Tab order follows visual layout (top to bottom, left to right)

### Screen Reader Support

- Semantic `<footer>` landmark announced
- Separators hidden from screen readers
- External link behavior announced by browser

## Responsive Behavior

### Mobile (< 1024px)

```css
flex-col items-center justify-center  /* Vertical stack, centered */
text-center                            /* Center copyright text */
flex-wrap justify-center               /* Wrap links, center */
```

### Desktop (≥ 1024px)

```css
lg:text-left       /* Left-align copyright */
lg:justify-end     /* Right-align links */
```

## Styling

### Footer Container

```tsx
className =
  "border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/95";
```

- Top border separator
- Semi-transparent background (95% opacity)

### Inner Container

```tsx
className =
  "shell flex flex-col items-center justify-center gap-3 py-6 text-sm text-[color:var(--text-muted)]";
```

- `shell` - Consistent horizontal padding and max-width
- `flex flex-col` - Vertical stack layout
- `gap-3` - 0.75rem spacing between elements
- `py-6` - 1.5rem vertical padding
- `text-sm` - Small text size (14px)
- `text-[color:var(--text-muted)]` - Muted text color

### Link Styling

```tsx
className =
  "text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4";
```

- Default link color
- Hover: color change + underline
- Offset underline for better readability

## Usage

### In Root Layout

```tsx
import { Footer } from "./components/Footer";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

## Testing

**Test file:** `test/unit/layout.test.tsx` (tests full layout including footer)

- ✅ Renders footer element
- ✅ Displays current year
- ✅ Contains policy links
- ✅ External links have correct attributes

**E2E tests:** `test/e2e/policies-and-a11y.spec.ts`

- ✅ Footer links navigate to correct pages
- ✅ All policy pages render correctly
- ✅ Links maintain focus visibility

## Implementation Notes

### Dynamic Year

The copyright year updates automatically:

```typescript
const year = new Date().getFullYear();
```

This prevents the need to manually update the footer each year.

### External Link Security

External links use `rel="noreferrer"` to:

- Prevent the destination site from accessing `window.opener`
- Avoid leaking the referrer URL
- Improve security and privacy

### Shell Container

The `shell` class ensures footer content aligns with page content:

```css
.shell {
  @apply mx-auto max-w-6xl px-4 sm:px-6 lg:px-8;
}
```

## Related Components

- **[Header](./Header.md)** - Site header companion
- **Policy Modals** - Alternative modal-based policy access (not used in footer)

## Related Documentation

- [Layout Documentation](../../app/layout.tsx)
- [Design System - Layout](../DESIGN_SYSTEM.md)
- [Privacy Policy](../PRIVACY_POLICY.md)
- [Accessibility Guidelines](../ACCESSIBILITY.md)

## Best Practices

1. **Keep footer simple**: Essential links only, avoid clutter
2. **Use semantic HTML**: `<footer>` landmark for accessibility
3. **Provide clear link text**: No ambiguous labels
4. **Secure external links**: Always use `rel="noreferrer"` with `target="_blank"`
5. **Hide decorative elements**: Use `aria-hidden="true"` on separators
6. **Maintain link contrast**: Ensure sufficient color contrast in both themes
7. **Update automatically**: Use dynamic year calculation
