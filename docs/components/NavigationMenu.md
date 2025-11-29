# NavigationMenu Component

## Overview

The main site navigation menu with logo, primary links, contact dialog trigger, and theme toggle. Built on Radix UI Navigation Menu primitive for accessibility.

**Location:** `app/components/NavigationMenu.tsx`

## Props

None - The component is self-contained and determines active state from the current route.

## Features

- **Logo**: Theme-aware logo image (dark/light variants)
- **Navigation Links**: CV page link
- **Contact Dialog**: Opens contact form modal
- **Theme Toggle**: Switch between light and dark modes
- **Active State**: Highlights current page
- **Keyboard Navigation**: Full keyboard support

## Accessibility

- Uses Radix UI NavigationMenu primitive
- `aria-current="page"` on active link
- `aria-label` on theme toggle button
- Focus visible indicators on all interactive elements
- Keyboard navigable with Tab and arrow keys

## Design Tokens

```css
--text-primary       /* Link text */
--link-hover         /* Link hover color */
--surface-subtle     /* Active link background */
--border-subtle      /* Active link border, button borders */
--bg-surface         /* Button backgrounds */
--bg-elevated        /* Logo background */
```

## Testing

**Test file:** `test/unit/navigation-menu.test.tsx`

- ✅ Renders logo link
- ✅ Renders CV link
- ✅ Renders contact button
- ✅ Renders theme toggle
- ✅ Shows active state on current page
- ✅ Theme toggle changes theme
- ✅ Keyboard navigation works

## Related

- [Header Component](./Header.md)
- [ContactDialog Component](./ContactDialog.md)
- [Design System](../DESIGN_SYSTEM.md)
