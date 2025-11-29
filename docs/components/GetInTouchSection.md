# GetInTouchSection Component

## Overview

A call-to-action section that combines a heading, description text, contact dialog trigger, and contact information display.

**Location:** `app/components/GetInTouchSection.tsx`

**Usage:** Rendered on About page (root route `/`)

## Props

None - The component is self-contained.

## Features

- **Section heading**: "Get in touch"
- **Contact dialog trigger**: Inline "Contact me" link
- **Description text**: Brief invitation to connect
- **Contact information**: Phone, email, location

## Structure

```tsx
<section className="section-card">
  <div>
    <h2>Get in touch</h2>
    <ContactDialog trigger={...} />
  </div>
  <p>Interested in collaborating...</p>
  <ContactInfo variant="inline" />
</section>
```

## Styling

- Uses `section-card` utility class (defined in globals.css)
- `space-y-4` for vertical spacing (1rem between elements)
- Flexbox header with space-between for heading and trigger

## Accessibility

- Semantic `<section>` element
- Heading hierarchy maintained (`<h2>`)
- All interactive elements keyboard accessible
- Focus visible indicators on contact trigger

## Design Tokens

```css
--text-primary  /* Heading and body text */
--accent        /* Contact link default */
--accent-hover  /* Contact link hover */
```

## Usage

### On About Page

```tsx
import { GetInTouchSection } from "@/app/components/GetInTouchSection";

export default function AboutPage() {
  return (
    <main>
      {/* Other sections */}
      <GetInTouchSection />
    </main>
  );
}
```

## Testing

**Test file:** `test/unit/about-page.test.tsx`

- ✅ Renders section heading
- ✅ Renders contact dialog trigger
- ✅ Renders description text
- ✅ Renders contact information

## Related Components

- **[ContactDialog](./ContactDialog.md)** - Form modal
- **[ContactInfo](./ContactInfo.md)** - Contact details display
