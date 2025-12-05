# Modal Component

## Overview

The `Modal` component is a base dialog/modal primitive built on Radix UI Dialog. It provides a consistent, accessible modal implementation with size variants, analytics tracking, and mobile-friendly viewport sizing.

**Location:** `app/components/Modal.tsx`

**Usage:** Base component for all modal dialogs (ContactDialog, policy modals, etc.)

## Props

| Prop                 | Type                      | Default     | Description                                               |
| -------------------- | ------------------------- | ----------- | --------------------------------------------------------- |
| `trigger`            | `ReactNode`               | required    | Element that triggers the modal (typically a button)      |
| `children`           | `ReactNode`               | required    | Modal content to display                                  |
| `size`               | `"sm" \| "md" \| "lg"`    | `"md"`      | Modal width preset                                        |
| `analyticsEventName` | `string`                  | `undefined` | Optional Vercel Analytics event name to track modal opens |
| `analyticsMetadata`  | `AnalyticsMetadata`       | `undefined` | Optional metadata to send with the analytics event        |
| `open`               | `boolean`                 | `undefined` | Optional controlled open state                            |
| `onOpenChange`       | `(open: boolean) => void` | `undefined` | Optional callback when open state changes                 |
| `testId`             | `string`                  | `undefined` | Optional test ID for E2E testing (applies to Dialog.Content) |

### Size Presets

| Size | Width  | Max Width       | Use Case                            |
| ---- | ------ | --------------- | ----------------------------------- |
| `sm` | `92vw` | `28rem` (448px) | Small confirmations, alerts         |
| `md` | `92vw` | `36rem` (576px) | Standard dialogs, forms (default)   |
| `lg` | `94vw` | `48rem` (768px) | Long-form content, policy documents |

## States

### Closed (Default)

- Modal content not visible
- Trigger element visible and interactive
- No overlay

### Open

- Modal content centered on screen
- Semi-transparent black overlay (60% opacity with blur)
- Page content behind overlay remains visible but dimmed
- Focus trapped within modal
- Escape key closes modal

## Mobile UX (v2.0)

The modal component includes mobile-optimized features:

### Viewport Sizing

- Uses `max-h-[90dvh]` for dynamic viewport height units
- Works correctly on iOS Safari (accounts for address bar)
- Prevents content from being hidden behind mobile UI

### Scroll Behavior

- Modal content is scrollable with `overflow-y-auto overflow-x-hidden`
- Body scroll is locked when modal is open (via Radix Dialog)
- Keyboard opening on mobile doesn't break layout

### Body Scroll Lock

Radix Dialog automatically prevents background scrolling when the modal is open:

- Adds `data-scroll-locked` attribute to body
- Prevents touch scroll on body while modal is visible
- Restores scroll behavior when modal closes

## Controlled vs Uncontrolled

The modal supports both controlled and uncontrolled usage:

### Uncontrolled (Default)

```tsx
<Modal trigger={<button>Open</button>}>
  <p>Content</p>
</Modal>
```

### Controlled

```tsx
const [open, setOpen] = useState(false);

<Modal trigger={<button>Open</button>} open={open} onOpenChange={setOpen}>
  <p>Content</p>
</Modal>;
```

This is useful for:

- Programmatic opening/closing (e.g., after form submission)
- State synchronization with parent components
- Auto-close with countdown timers

## Accessibility

### ARIA Attributes

Built on Radix UI Dialog, which provides:

- `role="dialog"` on modal content
- `aria-modal="true"` to indicate modal state
- `aria-labelledby` / `aria-describedby` (when Dialog.Title and Dialog.Description are used)

### Keyboard Navigation

| Key               | Action                                     |
| ----------------- | ------------------------------------------ |
| `Enter` / `Space` | Open modal (when trigger is focused)       |
| `Escape`          | Close modal                                |
| `Tab`             | Cycle through focusable elements in modal  |
| `Shift+Tab`       | Cycle backwards through focusable elements |

### Focus Management

- **Focus trap**: Focus is contained within modal when open
- **Initial focus**: First focusable element receives focus on open
- **Return focus**: Returns focus to trigger element on close
- **Visual indicator**: `focus-visible:ring-2` with accent color ring

### Screen Reader Support

- Modal announces when opened
- Overlay click closes modal (optional via Radix Dialog props)
- Content properly labeled when using Dialog.Title

## Design Tokens

```css
--bg-surface          /* Modal background (with 95% opacity) */
--border-strong       /* Modal border */
--text-primary        /* Modal text color */
--accent              /* Focus ring color */
```

## Usage Examples

### Basic Modal

```tsx
<Modal trigger={<button>Open Modal</button>} size="md">
  <div>
    <h2>Modal Title</h2>
    <p>Modal content goes here.</p>
  </div>
</Modal>
```

### With Radix Dialog Components

```tsx
<Modal trigger={<button>Open Dialog</button>} size="lg">
  <Dialog.Title className="text-2xl font-bold">Important Notice</Dialog.Title>
  <Dialog.Description className="mt-2 text-sm text-[color:var(--text-muted)]">
    Please review the following information.
  </Dialog.Description>
  <div className="mt-4">{/* Content */}</div>
  <Dialog.Close asChild>
    <button className="mt-6">Close</button>
  </Dialog.Close>
</Modal>
```

### With Analytics Tracking

```tsx
<Modal
  trigger={<button>View Policy</button>}
  size="lg"
  analyticsEventName="privacy_policy_opened"
  analyticsMetadata={{ source: "footer" }}
>
  <PrivacyPolicyContent />
</Modal>
```

### Small Confirmation Dialog

```tsx
<Modal trigger={<button>Delete Item</button>} size="sm">
  <h3>Confirm Deletion</h3>
  <p>Are you sure you want to delete this item?</p>
  <div className="flex gap-2 mt-4">
    <button onClick={handleDelete}>Delete</button>
    <Dialog.Close asChild>
      <button>Cancel</button>
    </Dialog.Close>
  </div>
</Modal>
```

## Implementation Notes

### Analytics Integration

The modal automatically tracks open events when `analyticsEventName` is provided:

```tsx
<Dialog.Root
  onOpenChange={(open) => {
    if (open && analyticsEventName) {
      track(analyticsEventName, analyticsMetadata);
    }
  }}
>
```

This integrates with Vercel Analytics to track modal engagement.

### Backdrop Styling

The overlay uses a semi-transparent black background with backdrop blur:

```tsx
<Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
```

This provides good contrast while maintaining visual context of the page behind.

### Portal Rendering

The modal uses Radix UI Portal to render outside the DOM hierarchy:

```tsx
<Dialog.Portal>
  <Dialog.Overlay />
  <Dialog.Content />
</Dialog.Portal>
```

This ensures the modal appears above all other content and avoids z-index issues.

## Testing

**Test file:** `test/unit/modal.test.tsx`

The component is tested for:

- ✅ Renders trigger element
- ✅ Opens modal on trigger click
- ✅ Closes modal on Escape key
- ✅ Traps focus within modal
- ✅ Returns focus to trigger on close
- ✅ Applies correct size classes
- ✅ Tracks analytics events when configured
- ✅ Renders children content

## Common Patterns

### Close Button

Always include a way to close the modal:

```tsx
<Modal trigger={<button>Open</button>}>
  <div className="relative">
    <Dialog.Close asChild>
      <button className="absolute right-0 top-0" aria-label="Close modal">
        ×
      </button>
    </Dialog.Close>
    {/* Content */}
  </div>
</Modal>
```

### Form in Modal

```tsx
<Modal trigger={<button>Edit Profile</button>}>
  <Dialog.Title>Edit Profile</Dialog.Title>
  <form onSubmit={handleSubmit}>
    <input type="text" name="name" />
    <div className="flex gap-2 mt-4">
      <button type="submit">Save</button>
      <Dialog.Close asChild>
        <button type="button">Cancel</button>
      </Dialog.Close>
    </div>
  </form>
</Modal>
```

## Components Using Modal

- **ContactDialog** - Contact form modal with Turnstile
- **CookiePolicyModal** - Cookie policy content modal
- **PrivacyPolicyModal** - Privacy policy content modal
- **TechStackModal** - Tech stack information modal

## Related Documentation

- [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- [ContactDialog Component](./ContactDialog.md)
- [Design System - Modal Patterns](../DESIGN_SYSTEM.md)
- [Accessibility Guidelines](../ACCESSIBILITY.md)

## Best Practices

1. **Always provide a close mechanism**: Escape key + visual close button
2. **Use semantic HTML**: Dialog.Title for headings, proper heading hierarchy
3. **Test keyboard navigation**: Ensure Tab key works, focus trap functions
4. **Limit modal nesting**: Avoid modals within modals
5. **Consider mobile**: Ensure modals work well on small screens (92-94vw width helps)
6. **Track usage**: Use analytics props to understand modal engagement
7. **Provide context**: Use Dialog.Description for screen readers
