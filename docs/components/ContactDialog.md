# ContactDialog Component

## Overview

The `ContactDialog` component is a comprehensive contact form modal with Cloudflare Turnstile spam protection, form validation, and analytics tracking. It provides a secure way for users to send messages via Formspree.

**Location:** `app/components/ContactDialog.tsx`

**Usage:** Triggered from navigation menu and "Get in Touch" section

## Props

| Prop           | Type        | Default        | Description                                       |
| -------------- | ----------- | -------------- | ------------------------------------------------- |
| `triggerLabel` | `string`    | `"Contact me"` | Text label for default trigger button             |
| `trigger`      | `ReactNode` | `undefined`    | Custom trigger element (overrides default button) |
| `children`     | `ReactNode` | `undefined`    | Additional content to render inside the form      |

## Features

### Form Fields

1. **Email** (required)
   - Type: email input
   - Validation: Required, checked before submission
   - Error messages displayed inline

2. **Phone** (optional)
   - Type: tel input
   - No validation (optional field)

3. **Message** (required)
   - Type: textarea
   - Minimum height: 96px
   - Validation: Required, checked before submission
   - Error messages displayed inline

4. **Honeypot** (hidden)
   - Hidden field named "website"
   - Traps bots (legitimate users won't fill it)
   - Submitted to server for spam detection

### Spam Protection

- **Cloudflare Turnstile**: Challenge-response verification
- **Honeypot field**: Hidden trap for automated bots
- **Server-side validation**: Domain check, rate limiting (see `/api/contact`)
- **Token verification**: Server validates Turnstile token

### Form State Machine

The component uses a state machine for form submission:

```
idle → submitting → success → countdown → closed
         ↓
       error → idle
```

| State        | Description                      | UI Feedback                                 |
| ------------ | -------------------------------- | ------------------------------------------- |
| `idle`       | Form ready for input             | Submit button disabled until CAPTCHA        |
| `submitting` | Form data being sent             | "Sending..." button, all inputs disabled    |
| `success`    | Message sent successfully        | Green success message, form fields reset    |
| `countdown`  | Auto-close countdown in progress | Shows "Closing in X seconds" with countdown |
| `closed`     | Modal closed after countdown     | Modal returns to idle state on next open    |

### Success Flow (v2.0)

On successful submission:

1. Form fields are immediately reset (cleared)
2. All inputs and Send button are disabled
3. **Close button remains enabled throughout both `success` and `countdown` states** (user can dismiss immediately or wait for auto-close)
4. Success message is displayed
5. A 10-second countdown begins
6. Countdown is shown with "Closing in X seconds…" message
7. Modal auto-closes when countdown reaches zero (or user can close manually anytime)
8. Reopening the modal shows a fresh, enabled form

### Error Flow

On validation or server error:

- Form values are preserved (user doesn't lose data)
- Inputs remain enabled
- Turnstile is reset (new verification required)
- Error message displayed
- No countdown, modal stays open

## Accessibility

### ARIA Attributes

- `aria-required="true"` on required fields (email, message)
- `aria-invalid="true/false"` on fields with validation errors
- `aria-describedby` linking fields to error messages and status
- `role="status"` on status message container
- `aria-live="polite"` on status updates and countdown
- `aria-atomic="true"` on countdown for screen reader announcements
- `aria-hidden="true"` on honeypot field

### Keyboard Navigation

| Key           | Action                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Tab`         | Navigate between form fields                                                                                         |
| `Shift+Tab`   | Navigate backwards                                                                                                   |
| `Enter`       | From Email: Move to Phone field                                                                                      |
|               | From Phone: Move to Message field                                                                                    |
|               | From Message: Submit form (if all required fields are non-empty; "valid" here means non-empty, not HTML5 validation) |
| `Shift+Enter` | In Message field: Insert new line (textarea behavior)                                                                |
| `Escape`      | Close dialog                                                                                                         |

### Focus Management

- Focus moves into dialog when opened
- Focus trapped within dialog while open
- Returns to trigger element on close
- Visual focus indicators on all interactive elements
- Submit button remains focusable when disabled (for accessibility feedback)

### Screen Reader Support

- Form fields properly labeled with `<label>` elements
- Error messages associated with fields via `aria-describedby`
- Status updates announced via `aria-live="polite"`
- Countdown updates announced for assistive technology
- Turnstile help text conditionally rendered for context

## Form Validation

### Client-Side Validation

```typescript
// Email validation
if (!trimmedEmail) {
  setEmailError("Please provide an email address.");
}

// Message validation
if (!trimmedMessage) {
  setMessageError("Please provide a message.");
}

// Turnstile validation
if (!turnstileToken) {
  setError("Please complete the verification.");
}
```

### Server-Side Validation

The `/api/contact` route handler performs:

- Honeypot check (rejects if filled)
- Domain origin check
- Rate limiting (10 requests per 15 minutes per IP)
- Turnstile token verification with Cloudflare API
- Email format validation
- Message content sanitization

## Design Tokens

```css
--bg-surface        /* Modal background */
--bg-app            /* Input backgrounds */
--text-primary      /* Labels and input text */
--text-muted        /* Helper text */
--border-subtle     /* Input borders, dialog borders */
--accent            /* Submit button, focus rings */
--accent-hover      /* Button hover state */
```

## Usage Examples

### Default Trigger

```tsx
<ContactDialog />
```

### Custom Trigger Label

```tsx
<ContactDialog triggerLabel="Get in Touch" />
```

### Custom Trigger Element

```tsx
<ContactDialog
  trigger={<button className="custom-button">Contact Me</button>}
/>
```

### With Additional Content

```tsx
<ContactDialog>
  <p className="text-sm text-muted">I typically respond within 24 hours.</p>
</ContactDialog>
```

## Implementation Details

### Turnstile Integration

The component loads Cloudflare Turnstile dynamically:

```typescript
useEffect(() => {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const tryRenderTurnstile = () => {
    if (!turnstileContainerRef.current || !window.turnstile?.render) {
      return false;
    }

    window.turnstile.render(turnstileContainerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        setTurnstileToken(token);
        setIsChallengeVisible(true);
      },
      size: "flexible",
    });

    return true;
  };

  // Retry until Turnstile script loads
  const intervalId = setInterval(() => {
    if (tryRenderTurnstile()) {
      clearInterval(intervalId);
    }
  }, 200);
}, []);
```

### Form Submission Flow

1. User fills form and completes Turnstile
2. Client-side validation runs
3. Data sent to `/api/contact` as JSON
4. Server validates, verifies Turnstile, sends to Formspree
5. Success: Form clears, success message shown
6. Error: Turnstile resets, error message shown

### Error Recovery

- Turnstile automatically resets on submission error
- Form fields preserve values on error (user doesn't lose data)
- Specific field errors highlighted inline
- General errors shown in status area

## Analytics Integration

The modal tracks opens with Vercel Analytics:

```tsx
<Modal
  analyticsEventName="contact_open"
  analyticsMetadata={{ component: "ContactDialog" }}
>
```

This helps track engagement with the contact form.

## Testing

**Test file:** `test/unit/contact-dialog.test.tsx`

- ✅ Renders trigger button with default label
- ✅ Renders custom trigger element
- ✅ Opens modal on trigger click
- ✅ Shows form fields (email, phone, message)
- ✅ Validates required fields
- ✅ Shows inline error messages
- ✅ Disables submit without Turnstile token
- ✅ Handles successful submission
- ✅ Handles submission errors
- ✅ Resets Turnstile on error

**E2E tests:** `test/e2e/contact-and-cv.spec.ts`

- ✅ Contact dialog opens and shows required fields
- ✅ Form validation works
- ✅ API error handling displays user-friendly messages

## Environment Variables

### Required

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<your-cloudflare-turnstile-site-key>
```

### API Route Variables

The `/api/contact` route also requires:

```bash
TURNSTILE_SECRET_KEY=<your-cloudflare-secret-key>
FORMSPREE_ENDPOINT=<your-formspree-endpoint>
```

See `.env.example` for details on obtaining these values.

## Security Considerations

1. **Turnstile verification**: Prevents automated bot submissions
2. **Honeypot field**: Catches simpler bots that auto-fill forms
3. **Server-side validation**: Never trust client-side validation alone
4. **Rate limiting**: Prevents abuse (10 requests per 15 minutes)
5. **Domain check**: Only accepts submissions from known origin
6. **Token reset on error**: Forces new challenge after failed attempt
7. **No sensitive data exposure**: Errors don't reveal system internals

## Common Patterns

### Embedding in Navigation

```tsx
<nav>
  <Link href="/cv">CV</Link>
  <ContactDialog />
</nav>
```

### Call-to-Action Section

```tsx
<section>
  <h2>Ready to collaborate?</h2>
  <p>Let's discuss your project</p>
  <ContactDialog triggerLabel="Start a conversation" />
</section>
```

## Related Components

- **[Modal](./Modal.md)** - Base modal component used internally
- **[ContactInfo](./ContactInfo.md)** - Contact information display
- **[GetInTouchSection](./GetInTouchSection.md)** - CTA section with contact dialog

## Related Documentation

- [Contact API Route](/app/api/contact/route.ts)
- [Error Handling](../ERROR_HANDLING.md)
- [Rate Limiting](../../lib/rate-limit.ts)
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Formspree Documentation](https://formspree.io/docs)

## Best Practices

1. **Always validate server-side**: Client validation is for UX only
2. **Provide clear feedback**: Show specific errors for each field
3. **Don't lose user data**: Preserve form values on error
4. **Reset gracefully**: Clear form only on successful submission
5. **Monitor failures**: Log errors for debugging (without exposing details to users)
6. **Test accessibility**: Verify with keyboard-only and screen reader navigation
7. **Rate limit properly**: Balance security with legitimate user needs
