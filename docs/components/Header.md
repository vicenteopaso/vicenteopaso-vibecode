# Header Component

## Overview

The `Header` component is the site-wide header with sticky positioning, backdrop blur, and navigation menu. It remains visible at the top of the viewport as users scroll.

**Location:** `app/components/Header.tsx`

**Usage:** Rendered in root layout (`app/layout.tsx`)

## Props

None - The component is self-contained.

## Features

- **Sticky positioning**: Stays at top of viewport on scroll
- **Backdrop blur**: Semi-transparent background with blur effect
- **High z-index**: Appears above page content (`z-50`)
- **Bottom border**: Subtle separator from page content
- **Shell container**: Consistent horizontal padding and max-width
- **Navigation menu**: Contains NavigationMenu component

## Structure

```tsx
<header>
  <nav>
    <NavigationMenu />
  </nav>
</header>
```

## Styling

### CSS Classes

```tsx
className =
  "sticky top-0 z-50 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/90 backdrop-blur-lg";
```

- `sticky top-0` - Sticky positioning at viewport top
- `z-50` - High z-index to appear above content
- `border-b` - Bottom border separator
- `border-[color:var(--border-subtle)]` - Subtle border color token
- `bg-[color:var(--bg-app)]/90` - Semi-transparent background (90% opacity)
- `backdrop-blur-lg` - Large backdrop blur effect

### Inner Navigation

```tsx
className = "shell flex items-center justify-between py-4";
```

- `shell` - Consistent horizontal padding and max-width utility
- `flex items-center justify-between` - Flexbox layout
- `py-4` - Vertical padding (1rem top/bottom)

## Design Tokens

```css
--border-subtle    /* Bottom border color */
--bg-app          /* Header background (with 90% opacity) */
```

## Accessibility

### Semantic HTML

- Uses `<header>` landmark element
- Contains `<nav>` for navigation
- Proper heading hierarchy maintained by NavigationMenu

### Keyboard Navigation

- Fully keyboard accessible via NavigationMenu
- Skip link available to bypass navigation

### ARIA Attributes

- No additional ARIA needed (semantic HTML sufficient)
- NavigationMenu handles navigation-specific ARIA

## Responsive Behavior

### Mobile (< 768px)

- Full-width header
- NavigationMenu adapts to mobile layout
- Maintains sticky positioning

### Desktop (≥ 768px)

- Max-width container via `shell` class
- Horizontal padding maintained
- Navigation items in horizontal row

## Usage

### In Root Layout

```tsx
import { Header } from "./components/Header";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

## Testing

**Test file:** `test/unit/layout.test.tsx` (tests full layout including header)

- ✅ Renders header element
- ✅ Contains navigation menu
- ✅ Has sticky positioning
- ✅ Maintains z-index hierarchy

**E2E tests:** `test/e2e/basic-navigation.spec.ts`

- ✅ Header visible on all pages
- ✅ Navigation links work correctly
- ✅ Theme toggle functions
- ✅ Contact dialog opens from header

## Implementation Notes

### Backdrop Blur

The `backdrop-blur-lg` combined with `bg-[color:var(--bg-app)]/90` creates a frosted glass effect that:

- Allows content to be slightly visible behind the header
- Maintains readability of header content
- Creates visual depth and hierarchy
- Works in both light and dark themes

### Z-Index Management

The header uses `z-50` to ensure it appears above:

- Page content (typically `z-0` to `z-10`)
- Elevated sections (typically `z-10` to `z-20`)
- Tooltips and popovers (typically `z-30` to `z-40`)

Modals use `z-50` as well and render in portals, so they don't conflict.

### Shell Utility

The `shell` class provides consistent page margins and max-width:

```css
.shell {
  @apply mx-auto max-w-6xl px-4 sm:px-6 lg:px-8;
}
```

This ensures the header content aligns with page content.

## Related Components

- **[NavigationMenu](./NavigationMenu.md)** - Main navigation component
- **[Footer](./Footer.md)** - Site footer companion

## Related Documentation

- [Layout Documentation](../../app/layout.tsx)
- [Design System - Layout](../DESIGN_SYSTEM.md)
- [Accessibility Guidelines](../ACCESSIBILITY.md)

## Best Practices

1. **Keep header simple**: Avoid cluttering the sticky header
2. **Maintain performance**: Backdrop blur can be expensive on low-end devices (acceptable trade-off for design)
3. **Test scroll behavior**: Ensure header doesn't occlude content
4. **Consider mobile**: Header takes vertical space, especially on small screens
5. **Maintain z-index hierarchy**: Don't add elements with higher z-index unless necessary
