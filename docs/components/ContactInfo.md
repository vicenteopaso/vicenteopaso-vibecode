# ContactInfo Component

## Overview

Displays contact information (location, phone, email) with clickable links. Supports two layout variants for different contexts.

**Location:** `app/components/ContactInfo.tsx`

## Props

| Prop      | Type                   | Default    | Description                      |
| --------- | ---------------------- | ---------- | -------------------------------- |
| `variant` | `"inline" \| "dialog"` | `"inline"` | Layout variant and styling theme |

## Variants

### Inline Variant (Default)

- Used on About page, CV page
- Primary text color
- Small top margin
- Compact layout

### Dialog Variant

- Used inside ContactDialog
- Muted text color
- Top border and padding
- Separated from form content

## Contact Information

1. **Location**: Málaga, Spain
   - Links to Google Maps
   - Opens in new tab
   - `rel="noreferrer"` for security

2. **Phone**: +34 684 005 262
   - `tel:` protocol link
   - Mobile-friendly (triggers phone dialer)

3. **Email**: vicente@opa.so
   - `mailto:` protocol link
   - Opens default email client

## Accessibility

- All links keyboard accessible
- External links open in new tab with proper security attributes
- Separators hidden from screen readers (`aria-hidden="true"`)
- Semantic link text (no additional ARIA needed)

## Responsive Behavior

### Mobile

- Vertical stack
- No separators visible
- Centered alignment

### Desktop (≥ 640px)

- Horizontal row
- Dot separators between items
- Flexible wrap if needed

## Design Tokens

```css
--text-primary   /* Inline variant text */
--text-muted     /* Dialog variant text */
--link           /* Link color */
--link-hover     /* Link hover color */
--border-subtle  /* Dialog variant top border */
```

## Usage Examples

### Inline on About Page

```tsx
<ContactInfo variant="inline" />
```

### Inside Contact Dialog

```tsx
<form>
  {/* Form fields */}
  <ContactInfo variant="dialog" />
</form>
```

## Testing

**Test file:** Tested as part of parent components (ContactDialog, About page)

- ✅ Renders all contact links
- ✅ Links have correct protocols
- ✅ External links have security attributes
- ✅ Responsive layout works

## Related Components

- **[ContactDialog](./ContactDialog.md)** - Uses dialog variant
- **[GetInTouchSection](./GetInTouchSection.md)** - Uses inline variant
