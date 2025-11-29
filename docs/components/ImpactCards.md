# ImpactCards Component

## Overview

A rotating grid of impact statement cards with smooth fade animations. Cards automatically cycle through a larger pool of content, displaying a subset at a time.

**Location:** `app/components/ImpactCards.tsx`

**Usage:** Rendered on About page to showcase key achievements and impact areas

## Props

| Prop           | Type       | Default  | Description                                   |
| -------------- | ---------- | -------- | --------------------------------------------- |
| `cards`        | `string[]` | required | Array of markdown-formatted impact statements |
| `visibleCount` | `number`   | `3`      | How many cards to show simultaneously         |
| `intervalMs`   | `number`   | `15000`  | Milliseconds between card rotations (15s)     |

## Features

### Automatic Rotation

- One random card swaps out every `intervalMs`
- New card fades in with subtle animation
- Ensures no duplicate cards shown simultaneously
- Continues indefinitely while component is mounted

### Height Management

- Measures all cards to find tallest
- Applies `minHeight` to prevent layout shift during transitions
- Uses hidden measurement grid for accurate sizing
- Responds to window resize events

### Markdown Support

Each card content string is parsed as markdown with custom components:

- `**bold text**` → Large, semibold, secondary color (main statement)
- `*italic text*` → Medium, semibold, primary color (subheading)
- Regular text → Small, centered, primary color (supporting text)
- `<br />` tags ignored (use markdown line breaks)

## Card Format Example

```markdown
**15+ years**
_in design & engineering leadership_
Bridging creative vision with technical execution
```

Renders as:

- "15+ years" - Large, bold, secondary color
- "in design & engineering leadership" - Medium, primary color
- Supporting text - Small, primary color

## States

| State    | Description                           | Animation                   |
| -------- | ------------------------------------- | --------------------------- |
| Initial  | First 3 cards displayed               | Fade in on mount            |
| Rotating | One card fading out, new card ready   | 90ms fade-out, then fade-in |
| Stable   | All cards visible between transitions | Static display              |

## Accessibility

- All cards rendered in hidden measurement grid are `aria-hidden="true"`
- Content is semantic and readable by screen readers
- No interactive elements (cards are informational only)
- Automatic rotation can be paused if user prefers reduced motion (future enhancement)

## Responsive Behavior

### Mobile (< 768px)

- Single column grid
- Cards stack vertically
- Full width cards

### Desktop (≥ 768px)

- 3-column grid (`md:grid-cols-3`)
- Fixed gap between cards (`gap-4` = 1rem)
- Cards maintain aspect ratio via `minHeight`

## Design Tokens

```css
--bg-surface      /* Card background */
--border-subtle   /* Card border */
--text-primary    /* Regular text, italic text */
--secondary       /* Bold text (main statement) */
```

## Animation Classes

Defined in `styles/globals.css`:

### `.impact-card--in`

```css
animation: impact-card-fade-in 500ms ease-out forwards;

@keyframes impact-card-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### `.impact-card--out`

```css
animation: impact-card-fade-out 140ms ease-in forwards;

@keyframes impact-card-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
```

## Usage Examples

### Basic Usage (3 Cards, 15s Interval)

```tsx
const impacts = [
  "**15+ years**\n*in design & engineering*",
  "**50+ engineers**\n*led and mentored*",
  "**Design systems**\n*at scale*",
  "**Global teams**\n*across 4 continents*",
  "**Product leadership**\n*from concept to launch*",
];

<ImpactCards cards={impacts} />;
```

### Custom Configuration

```tsx
<ImpactCards
  cards={impacts}
  visibleCount={4} // Show 4 cards at once
  intervalMs={10000} // Rotate every 10 seconds
/>
```

### Single Column Display

```tsx
<ImpactCards
  cards={impacts}
  visibleCount={1} // Show 1 card at a time
  intervalMs={5000} // Faster rotation
/>
```

## Implementation Notes

### Random Selection Algorithm

1. Pick a random slot (0 to visibleCount-1)
2. Pick a random card from the full pool
3. Ensure new card isn't already visible
4. Retry with different card if duplicate (up to total\*4 attempts)
5. If all attempts fail, skip this rotation

### Height Synchronization

The component uses two grids:

1. **Hidden measurement grid**: Renders all cards off-screen to measure heights
2. **Visible grid**: Shows only visible cards with `minHeight` applied

This prevents layout shift when cards with different heights rotate in.

### ResizeObserver Integration

- Observes all hidden measurement cards
- Recalculates `maxHeight` when window resizes
- Falls back to setTimeout if ResizeObserver unavailable

## Testing

**Test file:** Tested as part of About page (`test/unit/about-page.test.tsx`)

- ✅ Renders correct number of cards initially
- ✅ Cards contain markdown content
- ✅ Rotation timer set up correctly
- ✅ No duplicate cards shown
- ✅ Height measurement working

## Performance Considerations

- Hidden measurement grid has `pointer-events-none` and is off-screen
- Rotation interval of 15s prevents excessive re-renders
- ResizeObserver more efficient than window resize listener
- Component cleans up timers on unmount

## Related Components

None - This is a standalone presentational component

## Related Documentation

- [About Page](../../app/about/page.tsx)
- [Design System - Cards](../DESIGN_SYSTEM.md#cards)
- [Design System - Motion](../DESIGN_SYSTEM.md#motion--transitions)
