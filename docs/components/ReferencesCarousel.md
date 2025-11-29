# ReferencesCarousel Component

## Overview

An auto-rotating carousel that displays professional references with HTML formatting support. Features manual navigation dots and smooth height transitions.

**Location:** `app/components/ReferencesCarousel.tsx`

**Usage:** Rendered on CV page to display professional references

## Props

| Prop         | Type          | Default  | Description                               |
| ------------ | ------------- | -------- | ----------------------------------------- |
| `references` | `Reference[]` | required | Array of reference objects                |
| `intervalMs` | `number`      | `12000`  | Milliseconds between auto-rotations (12s) |

### Reference Type

```typescript
type Reference = {
  name: string; // Reference provider name (supports HTML)
  reference: string; // Reference content (supports HTML)
};
```

## Features

### Automatic Rotation

- Cycles through references every `intervalMs` (default 12 seconds)
- Loops back to first reference after last
- Continues indefinitely while component is mounted

### Manual Navigation

- Dot indicators below content
- Click any dot to jump to that reference
- Active dot highlighted with secondary color
- Inactive dots use subtle border color

### Height Management

- Measures all references to find tallest
- Applies `minHeight` to prevent layout shift
- Uses hidden measurement blocks for accurate sizing
- Responds to window resize events

### HTML Content Support

- Reference text can contain HTML formatting
- Content sanitized via `sanitizeRichText()` before rendering
- Supports: `<strong>`, `<em>`, `<a>`, `<p>`, `<br>`, basic formatting
- Dangerous tags removed for security

## States

| State    | Description                               | Visual Feedback             |
| -------- | ----------------------------------------- | --------------------------- |
| Initial  | First reference displayed                 | First dot active            |
| Rotating | Advancing to next reference automatically | Active dot updates          |
| Manual   | User clicked a dot                        | Jumps to selected reference |

## Accessibility

### ARIA Attributes

- Navigation buttons have `aria-label="Show reference {n}"`
- Hidden measurement blocks are `aria-hidden="true"`
- Semantic HTML for content structure

### Keyboard Navigation

- Dot buttons are keyboard accessible
- Tab key navigates between dots
- Enter/Space activates button to show reference
- Focus visible indicators on all buttons

### Screen Reader Support

- Reference content properly structured with semantic HTML
- Author name clearly separated and right-aligned
- Dots announce as "Show reference 1", "Show reference 2", etc.

## Responsive Behavior

The component adapts to all screen sizes:

- Reference content uses responsive spacing
- Dot indicators scale appropriately
- Height transitions smooth on all viewports

## Design Tokens

```css
--text-primary     /* Reference content and author */
--secondary        /* Active dot indicator */
--border-subtle    /* Inactive dot indicators */
```

## Usage Examples

### Basic Usage

```tsx
const references = [
  {
    name: "John Doe, CTO at Example Corp",
    reference:
      "<p><strong>Outstanding technical leadership.</strong> Vicente consistently delivered high-quality systems that scaled across our organization.</p>",
  },
  {
    name: "Jane Smith, VP Product",
    reference:
      "<p>A rare combination of design sensibility and technical depth. <em>Highly recommended.</em></p>",
  },
];

<ReferencesCarousel references={references} />;
```

### Custom Rotation Speed

```tsx
<ReferencesCarousel
  references={references}
  intervalMs={15000} // Slower rotation: 15 seconds
/>
```

### Single Reference (No Rotation)

```tsx
<ReferencesCarousel
  references={[singleReference]}
  // Auto-rotation doesn't start with 1 reference
  // Dots not shown with 1 reference
/>
```

## Implementation Details

### Content Sanitization

All HTML content is sanitized before rendering:

```typescript
const safeHtml = sanitizeRichText(html);
```

The `sanitizeRichText()` function (from `lib/sanitize-html.ts`):

- Allows safe HTML tags: `<p>`, `<strong>`, `<em>`, `<a>`, `<br>`, etc.
- Removes dangerous tags: `<script>`, `<style>`, `<iframe>`, etc.
- Strips event handlers: `onclick`, `onerror`, etc.
- Validates and sanitizes URLs in links

### Height Synchronization

Uses the same pattern as ImpactCards:

1. **Hidden measurement blocks**: Render all references off-screen
2. **Calculate max height**: Find tallest reference
3. **Apply to visible block**: Set `minHeight` to prevent layout shift
4. **Update on resize**: Recalculate when window resizes

### Auto-Rotation Logic

```typescript
useEffect(() => {
  const id = setInterval(() => {
    setIndex((prev) => (prev + 1) % references.length);
  }, intervalMs);

  return () => clearInterval(id);
}, [references.length, intervalMs]);
```

- Uses modulo operator to loop back to start
- Cleans up interval on unmount
- Resets if `references` or `intervalMs` changes

## Styling

### Reference Block

```tsx
className="space-y-3"
style={{ minHeight: maxHeight }}
```

- Vertical spacing between reference and author
- Dynamic min-height prevents layout shift

### Author Name

```tsx
className = "text-right text-xs text-[color:var(--text-primary)]";
```

- Right-aligned to distinguish from reference content
- Extra small text size (12px)
- Primary text color

### Navigation Dots

```tsx
className={`h-1.5 w-4 rounded-full transition-colors ${
  i === index
    ? "bg-[color:var(--secondary)]"
    : "bg-[color:var(--border-subtle)]"
}`}
```

- Small pill shape (1.5px height, 16px width)
- Smooth color transition on change
- Active: secondary color
- Inactive: subtle border color

## Testing

**Test file:** `test/unit/references-carousel.test.tsx`

- ✅ Renders first reference initially
- ✅ Shows navigation dots (when multiple references)
- ✅ Manual navigation works (click dots)
- ✅ Auto-rotation timer set up correctly
- ✅ Sanitizes HTML content
- ✅ Handles single reference gracefully
- ✅ Height measurement prevents layout shift

## Security Considerations

- **HTML sanitization**: All user-provided HTML content sanitized
- **XSS protection**: Dangerous tags and attributes removed
- **Safe rendering**: Only allows whitelisted HTML elements
- **Link validation**: URLs in `<a>` tags validated

## Performance Considerations

- Hidden measurement blocks have `pointer-events-none` and are off-screen
- Rotation interval of 12s prevents excessive re-renders
- ResizeObserver more efficient than window resize listener
- Component cleans up timers on unmount

## Related Components

None - This is a standalone presentational component

## Related Documentation

- [CV Page](../../app/cv/page.tsx)
- [HTML Sanitization](../../lib/sanitize-html.ts)
- [Design System - Motion](../DESIGN_SYSTEM.md#motion--transitions)
