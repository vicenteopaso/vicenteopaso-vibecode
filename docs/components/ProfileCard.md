# ProfileCard Component

## Overview

The `ProfileCard` component displays a user profile with an avatar, name, tagline, and optional action links. It supports multiple layout configurations and theme-aware portrait selection.

**Location:** `app/components/ProfileCard.tsx`

**Usage:** Primary user profile display on the About page and CV page header.

## Props

| Prop               | Type                                   | Default     | Description                                                                   |
| ------------------ | -------------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `name`             | `string`                               | required    | Full name to display                                                          |
| `tagline`          | `string`                               | required    | Tagline or professional description (supports multi-sentence format)          |
| `initials`         | `string`                               | required    | Fallback initials shown if avatar fails to load                               |
| `align`            | `"left" \| "right"`                    | `"left"`    | Text alignment (affects flexbox layout on desktop)                            |
| `showLinks`        | `boolean`                              | `true`      | Show CV read/download links                                                   |
| `showAvatar`       | `boolean`                              | `true`      | Show profile avatar image                                                     |
| `showSocialIcons`  | `boolean`                              | `false`     | Show social media icons (GitHub, LinkedIn, X)                                 |
| `showDownloadIcon` | `boolean`                              | `false`     | Show download CV icon in social icons row                                     |
| `sectionLinks`     | `Array<{href: string, label: string}>` | `undefined` | Navigation links for CV sections (only shown when `showDownloadIcon` is true) |

## States

### Standard Profile (About Page)

```tsx
<ProfileCard
  name="Vicente Opaso"
  tagline="Product & Design System Leader. Bridging design and engineering."
  initials="VO"
  showLinks={true}
  showAvatar={true}
  showSocialIcons={false}
/>
```

Shows:

- Circular avatar with theme-based portrait
- Name as h1
- Multi-line tagline
- Mobile: "Read CV | Download CV" text links
- Desktop: Primary/secondary buttons

### CV Header Variant

```tsx
<ProfileCard
  name="Vicente Opaso"
  tagline="Product & Design System Leader."
  initials="VO"
  showLinks={false}
  showAvatar={false}
  showSocialIcons={true}
  showDownloadIcon={true}
  sectionLinks={[
    { href: "#experience", label: "Experience" },
    { href: "#education", label: "Education" },
    // ... more sections
  ]}
/>
```

Shows:

- No avatar
- Name with inline download button (desktop)
- CV section navigation links
- Social media icons with download icon

### Theme-Aware Portraits

The component automatically selects portraits based on the current theme:

- **Light theme**: Uses `portrait_light_01.png`, `portrait_light_02.png`, `portrait_light_03.png`
- **Dark theme**: Uses `portrait_dark_01.png`, `portrait_dark_02.png`, `portrait_dark_03.png`

One portrait is randomly selected on mount and changes when the theme switches.

## Accessibility

### ARIA Attributes

- Avatar uses `<Avatar.Root>` from Radix UI with proper semantic structure
- Image has descriptive `alt` text: `"Portrait of {name}"`
- Social links have `aria-label` for each platform
- Download button has `aria-label="Download CV (PDF)"`
- Section navigation wrapped in `<nav aria-label="CV sections">`

### Keyboard Navigation

- All interactive elements (links, buttons) are keyboard accessible
- Focus visible outline with ring styling: `focus-visible:ring-2 focus-visible:ring-sky-400`
- Tab order follows visual layout (left to right, top to bottom)

### Focus Management

- Focus indicators use high-contrast ring with offset
- Rounded full buttons have appropriate focus ring offset
- Social icon buttons maintain consistent focus styling

### Screen Reader Support

- Semantic HTML: `<h1>` for name, `<nav>` for section links
- Separators use `aria-hidden="true"` to hide decorative "|" from screen readers
- Icon-only buttons always have `aria-label`

## Responsive Behavior

### Mobile (< 640px)

- Vertical stack layout
- Avatar centered (144px × 144px)
- Text centered
- Simple text links ("Read CV | Download CV")
- Social icons stacked vertically

### Desktop (≥ 640px)

- Horizontal layout with flexbox
- Avatar left-aligned (192px × 192px)
- Text aligned based on `align` prop
- Button-style primary/secondary CTAs
- Avatar takes ~1/3 width, text takes ~2/3 width
- Social icons in horizontal row

## Design Tokens

The component uses CSS custom properties for theming:

```css
--text-primary      /* Name heading color */
--secondary         /* Tagline color */
--accent            /* Primary button background */
--accent-hover      /* Primary button hover state */
--bg-surface        /* Secondary button background */
--border-subtle     /* Button and icon borders */
--link-hover        /* Link hover color */
```

## Usage Examples

### About Page Profile

```tsx
<ProfileCard
  name={aboutData.name}
  tagline={aboutData.tagline}
  initials={aboutData.initials}
  align="left"
  showLinks={true}
  showAvatar={true}
  showSocialIcons={false}
/>
```

### CV Page Header

```tsx
<ProfileCard
  name={cvData.basics.name}
  tagline={cvData.basics.label}
  initials="VO"
  align="left"
  showLinks={false}
  showAvatar={false}
  showSocialIcons={true}
  showDownloadIcon={true}
  sectionLinks={[
    { href: "#experience", label: "Experience" },
    { href: "#education", label: "Education" },
    { href: "#skills", label: "Skills" },
    { href: "#languages", label: "Languages" },
    { href: "#interests", label: "Interests" },
    { href: "#publications", label: "Publications" },
    { href: "#references", label: "References" },
  ]}
/>
```

### Minimal Profile (No Actions)

```tsx
<ProfileCard
  name="Vicente Opaso"
  tagline="Design Systems Architect"
  initials="VO"
  showLinks={false}
  showAvatar={true}
  showSocialIcons={false}
/>
```

## Testing

**Test file:** `test/unit/profile-card.test.tsx`

The component is tested for:

- ✅ Renders with all props
- ✅ Shows avatar by default
- ✅ Hides avatar when `showAvatar={false}`
- ✅ Shows action links when `showLinks={true}`
- ✅ Hides action links when `showLinks={false}`
- ✅ Shows social icons when `showSocialIcons={true}`
- ✅ Handles image load errors with fallback initials
- ✅ Renders section links when provided
- ✅ Theme-based portrait selection
- ✅ Responsive layout classes applied correctly
- ✅ Accessibility attributes present

## Error Handling

The component gracefully handles:

1. **Image load failures**: Falls back to initials using Radix Avatar.Fallback
2. **Missing theme**: Defaults to dark theme if theme provider isn't mounted
3. **Empty portrait array**: Falls back to first item in array
4. **Multi-sentence taglines**: Automatically splits on periods and trims

## Implementation Notes

### Theme Provider Dependency

The component requires `next-themes` `ThemeProvider` to be present in the component tree. It uses `useTheme()` to access the current theme.

### Random Portrait Selection

Portrait selection happens on mount and theme change:

```tsx
useEffect(() => {
  if (!mounted) return;
  const list = displayTheme === "dark" ? DARK_PORTRAITS : LIGHT_PORTRAITS;
  if (list.length > 0) {
    const index = Math.floor(Math.random() * list.length);
    setPhotoIndex(index);
  }
}, [mounted, displayTheme]);
```

This provides visual variety while maintaining theme consistency.

### Tagline Formatting

The tagline is automatically split into multiple lines:

```tsx
const taglineLines = tagline
  .match(/[^.]+\.?/g)
  ?.map((line) => line.trim())
  .filter(Boolean) ?? [tagline];
```

Each sentence becomes a separate `<p>` tag for better typography.

## Related Components

- **Header** - Uses ProfileCard logic for branding (not directly, but similar patterns)
- **Avatar** - Radix UI Avatar primitive used internally
- **CV Page** - Consumes ProfileCard for header

## Related Documentation

- [Design System - Typography](../DESIGN_SYSTEM.md#typography)
- [Design System - Color Tokens](../DESIGN_SYSTEM.md#color-system)
- [Accessibility Guidelines](../ACCESSIBILITY.md)
- [CV Configuration](../../app/config/cv.ts)
