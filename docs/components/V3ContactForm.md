# V3ContactForm

Inline contact form for the v3 brutalist homepage. Renders at the `#contact` section with a Cloudflare Turnstile challenge, four visible fields, and a hidden honeypot.

**File**: `app/components/V3ContactForm.tsx`

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| NAME | text | No | Prepended to message as `NAME: <value>` |
| EMAIL | email | Yes | HTML5 + Zod validation |
| SUBJECT | text | No | Prepended to message as `SUBJECT: <value>` |
| MESSAGE | textarea | Yes | Min 5 chars, max 2000 chars |
| `website` | hidden | — | Honeypot — bots fill it; humans never see it |

## Form States

| State | UI |
| --- | --- |
| `idle` | Normal editable form |
| `submitting` | All inputs + button disabled |
| `success` | Success card with countdown and reset button |
| `error` | Inline error; inputs re-enabled; Turnstile reset |

## Client Validation

Mirrors the server Zod schema in `/api/contact/route.ts`:

- Email: required + native `<input type="email">` validity
- Message: required, min 5 chars (`form.messageRequired`), max 2000 chars (`form.messageTooLong`)

## Payload to `/api/contact`

```json
{
  "email": "user@example.com",
  "message": "NAME: Alice\n\nSUBJECT: Hello\n\nMessage text",
  "honeypot": "",
  "turnstileToken": "<cf-token>"
}
```

## Accessibility

- Email and message labels show inline error text (e.g. `EMAIL — Email is required.`)
- Message `<textarea>` has `required`, `aria-required`, `aria-invalid`, `aria-describedby`
- Success countdown region: `role="status"` + `aria-live="polite"`

## Testing

- **E2E**: `test/e2e/contact-and-cv.spec.ts` — required fields, mobile, error handling, a11y
