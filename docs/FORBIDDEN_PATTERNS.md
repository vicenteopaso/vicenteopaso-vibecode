# Forbidden APIs and Patterns

This document enumerates APIs, patterns, and practices that **must not** be used in this codebase. Each entry includes a rationale and recommended alternatives. These restrictions help maintain security, accessibility, performance, and code quality standards.

## Table of Contents

- [Security-Critical Patterns](#security-critical-patterns)
- [Type Safety Violations](#type-safety-violations)
- [React and Component Patterns](#react-and-component-patterns)
- [Styling and Design System](#styling-and-design-system)
- [Data Fetching](#data-fetching)
- [Error Handling](#error-handling)
- [Accessibility](#accessibility)
- [ESLint Enforcement](#eslint-enforcement)

---

## Security-Critical Patterns

### ❌ Bypassing Turnstile Verification

**Forbidden:**

- Removing or commenting out Turnstile verification in `/app/api/contact/route.ts`
- Skipping the `turnstileToken` validation
- Mocking or hardcoding successful verification responses
- Accepting requests without proper token verification

**Why:** Turnstile protects the contact form from spam and abuse. Bypassing it exposes the form to bot attacks and abuse.

**Alternative:**

- Always use the established Turnstile verification flow
- Test with valid tokens from Cloudflare's test keys
- If verification is genuinely failing, debug the token/secret configuration rather than removing checks

**Reference:**

- Implementation: `app/api/contact/route.ts` lines 91-112
- ESLint: No automatic enforcement (code review required)

---

### ❌ Bypassing Rate Limiting

**Forbidden:**

- Removing or disabling `checkRateLimitForKey()` in API routes
- Hardcoding `allowed: true` in rate limit checks
- Commenting out rate limit validation
- Increasing limits without justification and approval

**Why:** Rate limiting protects against abuse and DoS attacks. Even best-effort, in-memory rate limiting provides valuable protection.

**Alternative:**

- Maintain the existing rate limiting flow
- If testing requires higher limits, use environment-specific configuration
- Document any rate limit changes in PR descriptions with security justification

**Reference:**

- Implementation: `lib/rate-limit.ts`
- Usage: `app/api/contact/route.ts` lines 62-80
- ESLint: No automatic enforcement (code review required)

---

### ❌ Bypassing Honeypot Check

**Forbidden:**

- Removing the honeypot field check in `/app/api/contact/route.ts`
- Always forwarding submissions regardless of honeypot value
- Making the honeypot field visible or removing it from the form

**Why:** The honeypot field is a simple but effective bot trap. Bots that auto-fill forms will populate it, allowing us to silently reject spam.

**Alternative:**

- Maintain the honeypot check: if filled, return success without forwarding
- Keep the honeypot field hidden with proper CSS (e.g., `sr-only` or `position: absolute; left: -9999px`)

**Reference:**

- Implementation: `app/api/contact/route.ts` lines 49-52
- ESLint: No automatic enforcement (code review required)

---

### ❌ Hard-Coded Secrets and API Keys

**Forbidden:**

- Hard-coding API keys, tokens, or secrets directly in code
- Committing `.env` files with real secrets
- Using secrets in client-side code (except `NEXT_PUBLIC_*` for truly public keys)
- Logging secrets to console or error tracking

**Why:** Hard-coded secrets in source control are a critical security vulnerability. They can be discovered through git history and lead to unauthorized access.

**Alternative:**

- Use environment variables: `process.env.SECRET_NAME`
- Store secrets in Vercel environment variables (encrypted)
- Use `NEXT_PUBLIC_*` prefix only for genuinely public keys (e.g., analytics IDs, public Formspree key)
- Reference `.env.example` for required environment variables without exposing real values

**Reference:**

- Implementation: `app/api/contact/route.ts` lines 18-22
- Documentation: `docs/SECURITY_POLICY.md`
- SDD: `sdd.yaml` lines 89
- ESLint: Enforced by `eslint-plugin-security` (partially)

---

### ❌ Custom Sanitization Bypassing `lib/sanitize-html.ts`

**Forbidden:**

- Implementing custom HTML sanitization logic
- Using `dangerouslySetInnerHTML` without sanitization
- Bypassing the `sanitizeRichText()` function
- Allowing executable URL schemes (`javascript:`, `data:`, `vbscript:`) in links

**Why:** Inconsistent or weak sanitization can lead to XSS vulnerabilities. The centralized `sanitizeRichText()` function provides defense-in-depth protection.

**Alternative:**

- Always use `sanitizeRichText()` from `lib/sanitize-html.ts` before rendering HTML
- If additional tags/attributes are needed, update the central configuration rather than creating new sanitization logic
- Prefer React components over `dangerouslySetInnerHTML` when possible

**Reference:**

- Implementation: `lib/sanitize-html.ts`
- Usage: `app/[lang]/cv/page.tsx`, `app/components/ReferencesCarousel.tsx`
- ESLint: No automatic enforcement (code review required)

**Allowed usage example:**

```tsx
import { sanitizeRichText } from "@/lib/sanitize-html";

<div
  dangerouslySetInnerHTML={{
    __html: sanitizeRichText(untrustedHtml),
  }}
/>;
```

---

## Type Safety Violations

### ❌ The `any` Type

**Forbidden:**

- Using `any` as a type annotation
- Using `as any` type assertions without exceptional justification
- Disabling TypeScript checks with `// @ts-ignore` or `// @ts-expect-error` without comments explaining why

**Why:** The `any` type defeats TypeScript's type safety, hiding bugs and making refactoring dangerous. Strict typing catches errors at compile time.

**Alternative:**

- Use proper types: interfaces, type aliases, or generic constraints
- Use `unknown` for truly unknown values, then narrow with type guards
- Use `Record<string, unknown>` for arbitrary object shapes
- If you must disable a check, add a comment explaining why and link to an issue for proper resolution

**Reference:**

- TypeScript config: `tsconfig.json` (strict mode enabled)
- ESLint: Enforced as error by `@typescript-eslint/no-explicit-any`

**Example:**

```typescript
// ❌ Forbidden
const data: any = await response.json();

// ✅ Allowed
interface ResponseData {
  id: string;
  name: string;
}
const data = (await response.json()) as ResponseData;

// ✅ Or use Zod for runtime validation
const schema = z.object({ id: z.string(), name: z.string() });
const data = schema.parse(await response.json());
```

---

### ❌ Non-Null Assertions Without Validation

**Forbidden:**

- Using `!` (non-null assertion) when the value could genuinely be null/undefined
- Chaining multiple non-null assertions (e.g., `obj!.prop!.value!`)

**Why:** Non-null assertions bypass TypeScript's safety checks and can lead to runtime errors if the value is actually null/undefined.

**Alternative:**

- Use optional chaining: `obj?.prop?.value`
- Use nullish coalescing: `value ?? defaultValue`
- Validate the value with an `if` check before use
- Only use `!` when you have absolute certainty (e.g., after an explicit check)

**Reference:**

- TypeScript strict mode enforces `strictNullChecks`
- ESLint: Enforced as warning by `@typescript-eslint/no-non-null-assertion`

---

## React and Component Patterns

### ❌ Direct DOM Manipulation in React Components

**Forbidden:**

- Using `document.getElementById()`, `document.querySelector()`, etc. to manipulate DOM directly
- Setting `element.style.*` properties directly in component code
- Using `innerHTML` or `outerHTML` assignments
- Manipulating DOM outside of React's lifecycle (except in refs with `useEffect`)

**Why:** Direct DOM manipulation breaks React's virtual DOM reconciliation and can cause state inconsistencies, memory leaks, and accessibility issues.

**Alternative:**

- Use React state and props to drive UI changes
- Use `useRef` and the ref callback pattern for legitimate DOM access (e.g., focus management, third-party library integration)
- Use `useEffect` to coordinate with external libraries that require DOM access
- For styles, use Tailwind classes or CSS modules

**Reference:**

- Architecture: `docs/ARCHITECTURE.md`
- ESLint: No automatic enforcement (code review required)

**Example:**

```typescript
// ❌ Forbidden
function MyComponent() {
  const handleClick = () => {
    document.getElementById('myDiv')!.style.color = 'red';
  };
  return <div id="myDiv" onClick={handleClick}>Click me</div>;
}

// ✅ Allowed
function MyComponent() {
  const [isHighlighted, setIsHighlighted] = useState(false);
  return (
    <div
      className={isHighlighted ? 'text-red-600' : 'text-gray-900'}
      onClick={() => setIsHighlighted(true)}
    >
      Click me
    </div>
  );
}
```

---

### ❌ Shared Mutable State Across Routes

**Forbidden:**

- Creating global mutable objects or arrays that are shared across route boundaries
- Using module-level mutable state without careful consideration
- Sharing state between server and client components without proper serialization

**Why:** Shared mutable state can cause race conditions, memory leaks, and unpredictable behavior in server-side rendering and edge runtime environments.

**Alternative:**

- Use React Context for client-side shared state
- Use server components with props for server-side data passing
- Use URL state (query parameters, path segments) for shareable state
- For true global state, use a state management library or React Context with proper boundaries

**Reference:**

- SDD: `sdd.yaml` line 63 (architecture boundaries)
- Documentation: `docs/ARCHITECTURE.md`

---

### ❌ Bypassing Error Boundaries

**Forbidden:**

- Removing or disabling the `ErrorBoundary` component
- Catching errors and not logging them to `lib/error-logging.ts`
- Catching errors in components without providing user feedback

**Why:** Error boundaries provide graceful degradation and ensure errors are logged for debugging. Swallowing errors silently makes debugging impossible.

**Alternative:**

- Keep the `ErrorBoundary` wrapping main content
- Use `logError()` from `lib/error-logging.ts` for all caught errors
- Provide user-friendly error messages in the UI
- Use local error state for expected, recoverable errors (e.g., form validation)

**Reference:**

- Implementation: `app/components/ErrorBoundary.tsx`
- Logging utilities: `lib/error-logging.ts`
- Documentation: `docs/ERROR_HANDLING.md`
- SDD: `sdd.yaml` line 65

---

## Styling and Design System

### ❌ Inline Styles That Break Theme Variables

**Forbidden:**

- Using inline `style` prop with hard-coded colors, spacing, or other design tokens
- Using CSS-in-JS libraries that bypass the design system
- Defining custom CSS outside of design token variables

**Why:** Inline styles and hard-coded values break theme consistency (light/dark mode), reduce maintainability, and violate the design system.

**Alternative:**

- Use Tailwind utility classes that reference design tokens
- Use CSS custom properties (design tokens) defined in `styles/globals.css`
- For truly dynamic styles, use Tailwind's arbitrary values with theme function: `bg-[rgb(var(--accent))]`
- Update the design system tokens if new values are needed across the app

**Reference:**

- Design tokens: `styles/globals.css`
- Documentation: `docs/DESIGN_SYSTEM.md`
- SDD: `sdd.yaml` lines 22-23

**Example:**

```tsx
// ❌ Forbidden
<div style={{ color: '#b91c1c', padding: '16px' }}>Content</div>

// ✅ Allowed
<div className="text-accent p-4">Content</div>

// ✅ Allowed (when truly dynamic)
<div className="bg-[rgb(var(--accent))]">Content</div>
```

---

### ❌ Non-Zero Border Radius

**Forbidden:**

- Adding border radius (`rounded-*` classes or `border-radius` CSS) to UI elements without explicit approval
- Overriding the brutalist zero-radius design aesthetic

**Why:** The design system follows a brutalist aesthetic with zero border radius for consistency. Deviating from this weakens the visual identity.

**Alternative:**

- Use `rounded-none` explicitly if needed for clarity
- If border radius is truly required for a new component, propose it in the design system documentation first
- Avoid rounded corners unless there's a strong accessibility or usability reason

**Reference:**

- Design system philosophy: `docs/DESIGN_SYSTEM.md` line 19

---

### ❌ Using HTML Anchor Tags for Internal Navigation

**Forbidden:**

```tsx
<a href="/about">About</a>
```

**Why:** HTML anchor tags cause full page reloads, losing client-side navigation benefits, slower user experience, and don't prefetch pages.

**Alternative:**

- Use Next.js `Link` component for all internal navigation
- Reserve `<a>` tags for external links only

**Reference:**

- Next.js documentation on Link component
- Architecture: `docs/ARCHITECTURE.md`

**Example:**

```tsx
// ❌ Forbidden
<a href="/about">About</a>

// ✅ Allowed
import Link from "next/link";
<Link href="/about">About</Link>

// ✅ Allowed for external links
<a href="https://external-site.com" target="_blank" rel="noopener noreferrer">
  External Link
</a>
```

---

### ❌ Using HTML `<img>` Tags

**Forbidden:**

```tsx
<img src="/my-image.jpg" alt="Description" />
```

**Why:** HTML `img` tags don't provide automatic image optimization, responsive image generation, proper lazy loading, or Next.js image optimizations. This results in larger bundle sizes and slower page loads.

**Alternative:**

- Use Next.js `Image` component for all images
- Provides automatic optimization, responsive images, and lazy loading
- Exception: SVG icons imported as components, or external third-party images where optimization isn't possible

**Reference:**

- Next.js Image component documentation
- Architecture: `docs/ARCHITECTURE.md`

**Example:**

```tsx
// ❌ Forbidden
<img src="/my-image.jpg" alt="Description" />;

// ✅ Allowed
import Image from "next/image";
<Image
  src="/my-image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
/>;

// ✅ Allowed exception - SVG as component
import { IconName } from "@/components/icons";
<IconName className="w-6 h-6" />;
```

---

## Data Fetching

### ❌ Client-Side Data Fetching in Server Components

**Forbidden:**

- Using `fetch()`, `axios`, or other HTTP clients directly in client components for initial page data
- Using `useEffect` to fetch data on mount when server-side fetching is possible
- Fetching in client components when the same data could be fetched in server components or route handlers

**Why:** Client-side fetching hurts performance (extra round-trips), SEO (content not in initial HTML), and resilience (exposes errors to users). Next.js App Router prioritizes server-side data fetching.

**Alternative:**

- Fetch data in server components (default in App Router)
- Use server actions or route handlers for mutations
- Use client components only for interactivity, not data loading
- For client-side needs, use SWR or React Query with proper cache configuration

**Reference:**

- Architecture: `docs/ARCHITECTURE.md`
- SDD: `sdd.yaml` lines 47-48 (server-components-first)

**Example:**

```tsx
// ❌ Forbidden (client component)
"use client";
import { useEffect, useState } from "react";

function DataDisplay() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then(setData);
  }, []);
  return <div>{data?.title}</div>;
}

// ✅ Allowed (server component)
async function DataDisplay() {
  const response = await fetch("https://api.example.com/data", {
    next: { revalidate: 3600 },
  });
  const data = await response.json();
  return <div>{data.title}</div>;
}
```

---

## Error Handling

### ❌ Bypassing Centralized Error Logging

**Forbidden:**

- Using `console.error()` or `console.warn()` directly without also using `lib/error-logging.ts`
- Catching errors without logging them
- Logging errors that expose sensitive information (secrets, PII)

**Why:** Centralized logging ensures errors are consistently tracked, enriched with context, and forwarded to monitoring tools (Sentry, Vercel logs).

**Alternative:**

- Use `logError()` from `lib/error-logging.ts` for all application errors
- Use `logWarning()` for non-critical warnings
- Add context to error logs (component name, action, metadata)
- Sanitize error messages before displaying to users

**Reference:**

- Implementation: `lib/error-logging.ts`
- Documentation: `docs/ERROR_HANDLING.md`
- SDD: `sdd.yaml` line 56

**Example:**

```typescript
// ❌ Forbidden
try {
  await doSomething();
} catch (error) {
  console.error("Failed:", error);
}

// ✅ Allowed
import { logError } from "@/lib/error-logging";

try {
  await doSomething();
} catch (error) {
  logError(error, {
    component: "MyComponent",
    action: "doSomething",
    metadata: { userId: currentUser.id },
  });
}
```

---

### ❌ Exposing Internal Error Details to Users

**Forbidden:**

- Showing stack traces in user-facing error messages
- Displaying raw error objects in the UI
- Exposing internal paths, environment variables, or configuration in error messages

**Why:** Internal error details can reveal system architecture, dependencies, and potential vulnerabilities to attackers. User-facing errors should be sanitized and generic.

**Alternative:**

- Use generic, user-friendly error messages in the UI
- Log detailed errors server-side with `logError()`
- Use `getErrorMessage()` from `lib/error-logging.ts` to sanitize error messages
- Provide actionable guidance (e.g., "Please try again" or "Contact support")

**Reference:**

- Error utilities: `lib/error-logging.ts`
- Documentation: See the "User-Facing Error Messages" section in `docs/ERROR_HANDLING.md`

---

## Accessibility

### ❌ Disabling ESLint A11y Rules

**Forbidden:**

- Using `eslint-disable` for `jsx-a11y/*` rules without exceptional justification
- Removing or weakening accessibility linting rules
- Ignoring accessibility errors in CI

**Why:** Accessibility rules catch common issues that affect users with disabilities. Disabling them risks creating inaccessible interfaces.

**Alternative:**

- Fix the underlying accessibility issue
- If a rule is genuinely inapplicable, add a comment explaining why and link to WCAG guidance
- Consult `docs/ACCESSIBILITY.md` for patterns and solutions

**Reference:**

- ESLint config: `eslint.config.mjs` line 37
- Documentation: `docs/ACCESSIBILITY.md`
- SDD: `sdd.yaml` lines 68-75

---

### ❌ Removing or Hiding Skip Links

**Forbidden:**

- Removing the skip-to-content link
- Making skip links invisible to all users (they should be visible on focus)
- Removing keyboard focus indicators

**Why:** Skip links are essential for keyboard and screen reader users to navigate efficiently. Hiding them permanently excludes these users.

**Alternative:**

- Keep the skip link as the first focusable element
- Use CSS to hide it off-screen until focused: `sr-only focus:not-sr-only`
- Ensure focus indicators are visible on all interactive elements

**Reference:**

- Implementation: Check main layout for skip link
- Documentation: `docs/ACCESSIBILITY.md`

---

### ❌ Empty or Placeholder Alt Text on Meaningful Images

**Forbidden:**

- Using `alt=""` on images that convey information
- Using placeholder alt text like "image" or "photo"
- Omitting `alt` attribute entirely

**Why:** Screen reader users rely on alt text to understand image content. Poor or missing alt text creates information gaps.

**Alternative:**

- Provide descriptive alt text for meaningful images
- Use `alt=""` only for decorative images
- For complex images (charts, diagrams), consider longer descriptions via `aria-describedby`

**Reference:**

- Documentation: `docs/ACCESSIBILITY.md`
- ESLint: Enforced by `jsx-a11y/alt-text`

---

### ❌ Removing Document Title or Meta Viewport

**Forbidden:**

- Removing or omitting the `<title>` tag from pages
- Removing the viewport meta tag
- Using generic titles like "Page" or leaving title empty

**Why:** Titles are critical for SEO, browser tabs, and screen readers. The viewport meta tag ensures proper mobile rendering.

**Alternative:**

- Provide descriptive, unique titles for each page via Next.js `metadata` export
- Keep viewport meta tag (handled by Next.js by default)

**Reference:**

- Documentation: `docs/SEO_GUIDE.md`
- Automated checks: Lighthouse CI audits (see lines 91-93 in ENGINEERING_STANDARDS.md for enforcement details)

---

## ESLint Enforcement

### Forbidden Pattern Rules in `eslint.config.mjs`

The following ESLint rules help enforce these forbidden patterns:

#### Type Safety

- `@typescript-eslint/consistent-type-imports`: Enforced as error
- `@typescript-eslint/no-explicit-any`: Enforced as warning (planned upgrade to error)
- `@typescript-eslint/no-non-null-assertion`: Enforced as warning
- `@typescript-eslint/no-unused-vars`: Enforced as error (with exceptions for `_` prefix)

#### Security

- `security/detect-unsafe-regex`: Enforced as error
- `security/detect-buffer-noassert`: Enforced as error
- `security/detect-eval-with-expression`: Enforced as error
- `security/detect-disable-mustache-escape`: Enforced as error
- `security/detect-new-buffer`: Enforced as error
- `security/detect-no-csrf-before-method-override`: Enforced as error
- `security/detect-pseudoRandomBytes`: Enforced as error
- `security/detect-child-process`: Warning (allowed in scripts)
- `security/detect-possible-timing-attacks`: Warning
- `security/detect-non-literal-require`: Warning (disabled in scripts)

#### Import Organization

- `simple-import-sort/imports`: Enforced as error
- `simple-import-sort/exports`: Enforced as error

#### Accessibility

- All rules from `eslint-plugin-jsx-a11y` (recommended config)

#### Code Quality

- `no-console`: Enforced as warning (allows `warn`, `error`, `info`; disabled in scripts and config files)

### Adding New Rules

When adding ESLint rules to enforce patterns in this document:

1. Add the rule to `eslint.config.mjs` with appropriate severity
2. Document the rationale in this file
3. Link back to this document in code review comments
4. Update this section with the new rule

**Example process:**

```javascript
// In eslint.config.mjs
{
  rules: {
    // Prevent `any` type (upgrade from warning to error if desired)
    '@typescript-eslint/no-explicit-any': 'error',
  }
}
```

---

## Enforcement Strategy

### Code Review Checklist

When reviewing code, check for:

1. ✅ No bypassed security checks (Turnstile, rate limiting, honeypot)
2. ✅ No hard-coded secrets or API keys
3. ✅ HTML sanitization uses `sanitizeRichText()`
4. ✅ No `any` types without justification
5. ✅ No direct DOM manipulation in React components
6. ✅ Errors logged with `logError()` from `lib/error-logging.ts`
7. ✅ Styles use Tailwind classes or design tokens
8. ✅ Data fetching in server components where possible
9. ✅ Accessibility rules not disabled without justification
10. ✅ User-facing error messages are sanitized and generic

### Automated Checks

- **ESLint**: Runs in CI via `pnpm lint`
- **TypeScript**: Strict mode enforced via `pnpm typecheck`
- **Security audits**: `pnpm audit:security` checks dependencies
- **Accessibility audits**: `pnpm audit:a11y` and Lighthouse CI

### Documentation Updates

When adding new forbidden patterns:

1. Update this document with the pattern, rationale, and alternative
2. Add ESLint rule if applicable
3. Update relevant component documentation
4. Link from `CONTRIBUTING.md` or `ENGINEERING_STANDARDS.md` if needed

---

## Related Documentation

- [Engineering Standards](./ENGINEERING_STANDARDS.md) - High-level standards and principles
- [Architecture](./ARCHITECTURE.md) - System architecture and boundaries
- [Security Policy](./SECURITY_POLICY.md) - Security practices and reporting
- [Error Handling](./ERROR_HANDLING.md) - Error handling patterns and logging
- [Accessibility](./ACCESSIBILITY.md) - Accessibility standards and testing
- [Design System](./DESIGN_SYSTEM.md) - Design tokens and component guidelines
- [SEO Guide](./SEO_GUIDE.md) - SEO best practices

---

## Summary

This document serves as a quick reference for "what not to do" when contributing to this codebase. Following these guidelines helps maintain:

- **Security**: Protecting user data and preventing abuse
- **Accessibility**: Ensuring the site is usable by everyone
- **Performance**: Maintaining fast, efficient code
- **Maintainability**: Keeping the codebase consistent and predictable
- **Type Safety**: Catching errors at compile time

When in doubt, consult this document and the linked resources. If you encounter a pattern that should be forbidden but isn't listed here, please propose an addition via PR or issue.
