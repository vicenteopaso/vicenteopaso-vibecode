# Forbidden Patterns

This document catalogs anti-patterns, prohibited changes, and dangerous practices that must never be introduced into this codebase, whether by human or AI contributors.

## Overview

This is a living document that captures lessons learned, security requirements, and architectural constraints. Violations of these patterns should be caught in code review and CI, but this document provides the "why" behind the rules.

## Security Anti-Patterns

### 1. Never Bypass Security Controls

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Bypassing Turnstile verification
export async function POST(request: Request) {
  const { email, message } = await request.json();
  // Skip Turnstile check and send directly
  await sendToFormspree({ email, message });
}

// ❌ FORBIDDEN: Removing rate limiting
export async function POST(request: Request) {
  // const rateLimit = getRateLimiter();
  // Commented out to "fix" 429 errors
  return handleContact(request);
}

// ❌ FORBIDDEN: Removing honeypot check
if (data.honeypot) {
  // return Response.json({ ok: true }); // Commented out
}
```

**Required:**

```typescript
// ✅ REQUIRED: Full security stack
export async function POST(request: Request) {
  const data = await request.json();

  // Honeypot check
  if (data.honeypot) {
    return Response.json({ ok: true }); // Silent success, no action
  }

  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitResult = await checkRateLimit(clientIP);
  if (!rateLimitResult.ok) {
    return new Response(rateLimitResult.error, {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  // Turnstile verification
  const turnstileResult = await verifyTurnstile(data.turnstileToken, clientIP);
  if (!turnstileResult.success) {
    return new Response("Verification failed", { status: 400 });
  }

  // Proceed with business logic
}
```

### 2. Never Hard-Code Secrets

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Hard-coded API keys
const FORMSPREE_KEY = "abc123def456";
const TURNSTILE_SECRET = "secret-key-here";

// ❌ FORBIDDEN: Secrets in frontend code
export const NEXT_PUBLIC_SECRET_KEY = "should-not-be-public";
```

**Required:**

```typescript
// ✅ REQUIRED: Environment variables
const FORMSPREE_KEY = process.env.FORMSPREE_API_KEY;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

// ✅ REQUIRED: Public-safe variables only
export const NEXT_PUBLIC_TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
```

### 3. Never Skip Input Validation

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Trusting user input
export async function POST(request: Request) {
  const data = await request.json(); // No validation
  await processData(data.email, data.message);
}

// ❌ FORBIDDEN: Weak validation
if (email.includes("@")) {
  // Not sufficient
  await sendEmail(email);
}
```

**Required:**

```typescript
// ✅ REQUIRED: Zod schema validation
import { z } from "zod";

const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10).max(5000),
  turnstileToken: z.string(),
  honeypot: z.string().optional(),
  domain: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = contactSchema.safeParse(body);

  if (!result.success) {
    return new Response("Invalid input", { status: 400 });
  }

  const data = result.data;
  // Proceed with validated data
}
```

### 4. Never Render Unsanitized HTML

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Raw HTML injection
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ❌ FORBIDDEN: Direct innerHTML
element.innerHTML = userData;

// ❌ FORBIDDEN: Trusting markdown content
<ReactMarkdown>{untrustedContent}</ReactMarkdown>
```

**Required:**

```typescript
// ✅ REQUIRED: Sanitize with whitelist
import { sanitizeHtml } from '@/lib/sanitize-html';

const safeHtml = sanitizeHtml(userContent);
<div dangerouslySetInnerHTML={{ __html: safeHtml }} />

// ✅ REQUIRED: Controlled markdown components
import { markdownComponents } from '@/lib/markdown-components';

<ReactMarkdown components={markdownComponents}>
  {trustedMarkdown}
</ReactMarkdown>
```

### 5. Never Expose Internal Errors

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Leaking stack traces
catch (error) {
  return Response.json({ error: error.message, stack: error.stack });
}

// ❌ FORBIDDEN: Exposing system details
catch (error) {
  return new Response(`Database connection to ${dbHost} failed`, { status: 500 });
}
```

**Required:**

```typescript
// ✅ REQUIRED: Generic user messages + structured logging
import { logError } from '@/lib/error-logging';

catch (error) {
  logError(error, { context: 'contact-form' });
  return new Response('An error occurred. Please try again.', { status: 500 });
}
```

## Accessibility Anti-Patterns

### 6. Never Break Keyboard Navigation

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Preventing tab navigation
<div onClick={handleClick} style={{ cursor: 'pointer' }}>
  Click me
</div>

// ❌ FORBIDDEN: Removing focus styles
button:focus { outline: none; } // Without visible alternative

// ❌ FORBIDDEN: Keyboard traps
<div onKeyDown={(e) => e.preventDefault()}>
```

**Required:**

```typescript
// ✅ REQUIRED: Semantic interactive elements
<button onClick={handleClick} className="focus:ring-2">
  Click me
</button>

// ✅ REQUIRED: Visible focus indicators
button:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}

// ✅ REQUIRED: Proper keyboard handling
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
```

### 7. Never Misuse ARIA

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Redundant ARIA
<button aria-label="Button">Click me</button>

// ❌ FORBIDDEN: Incorrect ARIA roles
<div role="button">Text</div> // Should be <button>

// ❌ FORBIDDEN: ARIA without keyboard support
<div role="link" aria-label="Link">
  Click
</div>
```

**Required:**

```typescript
// ✅ REQUIRED: Semantic HTML first
<button>Click me</button>

// ✅ REQUIRED: ARIA only when necessary
<button aria-label="Close dialog">
  <X /> {/* Icon without text */}
</button>

// ✅ REQUIRED: Complete ARIA patterns
<div
  role="link"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  aria-label="External resource"
>
```

### 8. Never Skip Alt Text

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Missing alt on meaningful images
<Image src="/profile.jpg" width={200} height={200} />

// ❌ FORBIDDEN: Generic alt text
<Image src="/diagram.png" alt="image" width={400} height={300} />
```

**Required:**

```typescript
// ✅ REQUIRED: Descriptive alt text
<Image
  src="/profile.jpg"
  alt="Vicente Opaso, Software Engineer"
  width={200}
  height={200}
/>

// ✅ REQUIRED: Empty alt for decorative images
<Image
  src="/decorative-pattern.svg"
  alt=""
  width={100}
  height={100}
  aria-hidden="true"
/>
```

## Architecture Anti-Patterns

### 9. Never Cross Architecture Boundaries

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Components importing API routes
// app/components/ContactForm.tsx
import { POST as handleContact } from "@/app/api/contact/route";

// ❌ FORBIDDEN: API routes importing components
// app/api/data/route.ts
import { DataCard } from "@/app/components/DataCard";

// ❌ FORBIDDEN: Direct filesystem access in components
export default function Page() {
  const data = fs.readFileSync("./content/about.md"); // Wrong layer
}
```

**Required:**

```typescript
// ✅ REQUIRED: Proper layer separation
// app/components/ContactForm.tsx
async function handleSubmit(data: ContactData) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ✅ REQUIRED: Server actions or API routes for data
// app/[lang]/page.tsx (Server Component)
export default async function Page({ params }: { params: { lang: string } }) {
  const content = await getContent(params.lang); // Helper in lib/
  return <AboutPage content={content} />;
}
```

### 10. Never Create Shared Mutable State

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Global mutable state
// lib/state.ts
export let currentUser = null; // Shared across requests

// ❌ FORBIDDEN: Module-level caching without keys
// lib/cache.ts
let cachedData = null;
export function getData() {
  if (!cachedData) {
    cachedData = fetchData();
  }
  return cachedData; // Same for all users
}
```

**Required:**

```typescript
// ✅ REQUIRED: Request-scoped data
// app/api/user/route.ts
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  const userData = await fetchUser(userId);
  return Response.json(userData);
}

// ✅ REQUIRED: Keyed caching
// lib/cache.ts
const cache = new Map<string, Data>();
export function getData(key: string) {
  if (!cache.has(key)) {
    cache.set(key, fetchData(key));
  }
  return cache.get(key);
}
```

### 11. Never Bypass Centralized Utilities

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Ad-hoc error logging
catch (error) {
  console.error('Something failed:', error);
}

// ❌ FORBIDDEN: Manual HTML sanitization
function cleanHtml(html: string) {
  return html.replace(/<script>/g, ''); // Incomplete
}

// ❌ FORBIDDEN: Duplicate SEO metadata
export const metadata = {
  title: 'My Page',
  description: 'A description',
  // Missing canonical, og tags, etc.
};
```

**Required:**

```typescript
// ✅ REQUIRED: Centralized error logging
import { logError } from '@/lib/error-logging';

catch (error) {
  logError(error, { context: 'api-route', userId });
}

// ✅ REQUIRED: Shared sanitization utility
import { sanitizeHtml } from '@/lib/sanitize-html';

const clean = sanitizeHtml(untrustedHtml);

// ✅ REQUIRED: SEO helper for metadata
import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'My Page',
  description: 'A description',
  path: '/my-page',
});
```

## Performance Anti-Patterns

### 12. Never Block the Main Thread

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Synchronous heavy computation in components
export default function Page() {
  const result = heavySync Calculation(); // Blocks rendering
  return <div>{result}</div>;
}

// ❌ FORBIDDEN: Large unoptimized images
<img src="/huge-photo.jpg" /> // No size, format optimization
```

**Required:**

```typescript
// ✅ REQUIRED: Async computation or streaming
export default async function Page() {
  const result = await heavyAsyncCalculation(); // Non-blocking
  return <div>{result}</div>;
}

// ✅ REQUIRED: Next.js Image optimization
<Image
  src="/photo.jpg"
  width={800}
  height={600}
  alt="Description"
  loading="lazy"
  quality={85}
/>
```

### 13. Never Import Unused Dependencies

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Importing entire libraries for one function
import _ from "lodash"; // Pulls in all of lodash
const result = _.uniq(array);

// ❌ FORBIDDEN: Client-side imports of server libraries
("use client");
import fs from "fs"; // Won't work, bloats bundle
```

**Required:**

```typescript
// ✅ REQUIRED: Granular imports
import uniq from "lodash/uniq"; // Tree-shakeable

// ✅ REQUIRED: Appropriate module boundaries
// Server Component
import fs from "fs/promises"; // OK in server components

// Client Component
("use client");
import { useState } from "react"; // Client-appropriate
```

## Testing Anti-Patterns

### 14. Never Write Tests Just for Coverage

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Meaningless tests
test('component exists', () => {
  const wrapper = render(<MyComponent />);
  expect(wrapper).toBeTruthy(); // Useless assertion
});

// ❌ FORBIDDEN: Testing implementation details
test('state changes', () => {
  const { rerender } = render(<Counter />);
  expect(counter.state.count).toBe(0); // Internal state
});
```

**Required:**

```typescript
// ✅ REQUIRED: Test behavior and contracts
test('increments count when button clicked', async () => {
  const { getByRole } = render(<Counter />);
  const button = getByRole('button', { name: /increment/i });

  await userEvent.click(button);

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});

// ✅ REQUIRED: Test user-facing behavior
test('submits form with valid data', async () => {
  const onSubmit = vi.fn();
  render(<ContactForm onSubmit={onSubmit} />);

  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/message/i), 'Hello world');
  await userEvent.click(screen.getByRole('button', { name: /send/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    message: 'Hello world',
  });
});
```

### 15. Never Disable Tests Instead of Fixing Them

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Skipping flaky tests
test.skip("sometimes fails", () => {
  // Don't hide problems
  // Test code
});

// ❌ FORBIDDEN: Commenting out failing tests
// test('broken feature', () => {
//   expect(brokenFunction()).toBe(true);
// });
```

**Required:**

```typescript
// ✅ REQUIRED: Fix flaky tests with proper waits
test('loads data', async () => {
  render(<DataComponent />);

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText(/data loaded/i)).toBeInTheDocument();
  });
});

// ✅ REQUIRED: Fix or document failures, update code
test('feature works as expected', () => {
  const result = fixedFunction();
  expect(result).toBe(true);
});
```

## Documentation Anti-Patterns

### 16. Never Let Documentation Drift

**Prohibited:**

```typescript
// ❌ FORBIDDEN: Outdated comments
/**
 * Sends email via SendGrid
 * @deprecated Use Mailgun instead
 */
async function sendEmail() {
  // Actually using Formspree now
  await formspree.send();
}

// ❌ FORBIDDEN: Incorrect README
// README: "Run `npm start`"
// Actual: Project uses pnpm
```

**Required:**

```typescript
// ✅ REQUIRED: Accurate documentation
/**
 * Sends contact form data to Formspree
 * @see app/api/contact/route.ts
 */
async function sendContactEmail(data: ContactData) {
  await formspree.send(data);
}

// ✅ REQUIRED: Up-to-date README
// README: "Run `pnpm dev`"
// package.json: "dev": "next dev"
```

## Enforcement

### How These Patterns Are Prevented

1. **Code Review**
   - Human reviewers check for forbidden patterns
   - PR template includes checklist items
   - Security-sensitive changes require extra scrutiny

2. **Linting**
   - ESLint rules catch many anti-patterns
   - `eslint-plugin-security` detects unsafe patterns
   - `eslint-plugin-jsx-a11y` enforces accessibility

3. **Type System**
   - TypeScript strict mode prevents many bugs
   - Zod schemas enforce runtime validation
   - Type imports prevent bundling mistakes

4. **CI Checks**
   - Unit tests catch logic errors
   - E2E tests validate user flows
   - Security scans detect vulnerabilities
   - Lighthouse enforces performance budgets

### Reporting New Forbidden Patterns

If you discover a new anti-pattern:

1. Document it in this file with:
   - Why it's forbidden
   - Example of the problem
   - Correct alternative
2. Add linting rules if possible
3. Update review checklist if needed
4. Consider adding CI checks

## Related Documentation

- [AI Guardrails](./AI_GUARDRAILS.md) — Constraints for AI-assisted development
- [Review Checklist](./REVIEW_CHECKLIST.md) — Pre-merge validation
- [Engineering Standards](./ENGINEERING_STANDARDS.md) — Quality bar
- [Security Policy](./SECURITY_POLICY.md) — Security practices
- [Architecture](./ARCHITECTURE.md) — System boundaries

**Last updated**: December 13, 2024
