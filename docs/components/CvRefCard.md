# CvRefCard / CvRefsGrid

CV references display for the v3 redesign. Replaces the old `ReferencesCarousel`.

**File**: `app/components/CvRefCard.tsx`
**Section**: `#cv-references` on `/[lang]/cv`

## Components

### `CvRefsGrid`

Renders all reference cards in a 2-column CSS grid (`.v3-cv-refs-grid`). Manages `activeIndex` state to dim non-expanded cards.

| Prop   | Type                              | Description           |
| ------ | --------------------------------- | --------------------- |
| `refs` | `Array<{ name, role, fullText }>` | Parsed reference data |

### `CvRefCard`

Individual `<button type="button">` card. Expands on hover/focus to show full reference text in an absolutely-positioned overlay.

| Prop       | Type         | Description                                 |
| ---------- | ------------ | ------------------------------------------- |
| `index`    | number       | Card position (0-based)                     |
| `total`    | number       | Total card count                            |
| `name`     | string       | Referee name                                |
| `role`     | string       | Referee role/title                          |
| `fullText` | string       | Full reference text (HTML-stripped)         |
| `dimmed`   | boolean      | Reduces opacity when another card is active |
| `onEnter`  | `() => void` | Called on `mouseenter` / `focus`            |
| `onLeave`  | `() => void` | Called on `mouseleave` / `blur`             |

## Accessibility

- Native `<button type="button">` for keyboard support
- Expanded overlay: `aria-hidden={!expanded}`
- Collapsed text block: `aria-hidden={true}` when expanded (prevents duplicate narration)

## Selectors

| Purpose            | Selector                  |
| ------------------ | ------------------------- |
| References section | `#cv-references`          |
| Grid container     | `.v3-cv-refs-grid`        |
| Individual cards   | `.v3-cv-refs-grid button` |

## Visual Testing

Covered by `test/visual/components/references-carousel.visual.spec.ts` — light, dark, mobile, single card.
