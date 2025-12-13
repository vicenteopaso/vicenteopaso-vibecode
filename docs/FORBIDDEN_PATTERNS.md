# Forbidden Patterns

This document catalogs patterns that are explicitly forbidden in this codebase to maintain code quality, accessibility, security, and maintainability. These patterns are enforced via ESLint rules configured in `eslint.config.mjs`.

## Table of Contents

- [TypeScript Patterns](#typescript-patterns)
- [Console Usage](#console-usage)
- [DOM Manipulation](#dom-manipulation)
- [React & Next.js Patterns](#react--nextjs-patterns)
- [Security Patterns](#security-patterns)

---

## TypeScript Patterns

### ❌ Using `any` Type

**Forbidden:**

```typescript
function process(data: any) { ... }
const result: any = getValue();
const forced = value as any;
```

**Rationale:**

- Defeats TypeScript's type safety
- Prevents compile-time error detection
- Makes code harder to maintain and refactor
- Can hide runtime errors

**Allowed Exception:**
Only when interfacing with untyped third-party libraries or when type information is genuinely unknowable. Must be accompanied by an ESLint disable comment with justification:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- third-party library lacks types
const legacyAPI: any = require("untyped-legacy-lib");
```

**Preferred Alternative:**

```typescript
// Use unknown for values that need runtime checking
function process(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript now knows data is a string
    return data.toUpperCase();
  }
}

// Use generics for flexible but type-safe code
function getValue<T>(key: string): T | undefined { ... }

// Define proper types or interfaces
interface ApiResponse {
  status: number;
  data: Record<string, unknown>;
}
```

---

## Console Usage

### ❌ Direct Console Statements

**Forbidden in production code:**

```typescript
console.log("Debug info");
console.info("User logged in");
console.warn("Deprecation warning");
console.debug("Verbose output");
```

**Rationale:**

- Console statements leak to production builds
- Harder to control logging levels
- Cannot be aggregated or monitored
- May expose sensitive information

**Allowed Exceptions:**

1. **In `lib/error-logging.ts`**: Console statements are allowed here as this is the centralized logging utility
2. **In test files**: Console usage is allowed in `test/**` files for debugging tests
3. **In scripts**: Console usage is allowed in `scripts/**` for build/utility scripts

**Preferred Alternative:**

```typescript
import { logError, logWarning } from "@/lib/error-logging";

// For errors
logError(error, {
  component: "ContactDialog",
  action: "form-submission",
  metadata: { userId: user.id },
});

// For warnings
logWarning("Deprecated feature used", {
  component: "FeatureX",
  action: "feature-call",
});
```

**ESLint Configuration:**

```javascript
'no-console': ['error', {
  allow: [] // No console allowed by default
}]
```

---

## DOM Manipulation

### ❌ Direct DOM Access in React Components

**Forbidden in React components:**

```typescript
// In a React component
document.querySelector(".my-class")?.innerHTML = html;
document.getElementById("element").style.color = "red";
window.scrollTo(0, 0);
```

**Rationale:**

- Bypasses React's virtual DOM
- Can cause reconciliation issues
- Harder to test
- Breaks React's unidirectional data flow
- Can introduce XSS vulnerabilities via innerHTML

**Allowed Exceptions:**

1. **Test utilities**: In `test/**` files for test setup and assertions
2. **Vetted utilities**: In specific utility files like `test/visual/utils.ts` where DOM manipulation is the explicit purpose
3. **Event handlers**: Global event listeners (e.g., `window.addEventListener`) in effects are allowed when properly managed
4. **Third-party integration**: When integrating with libraries that require direct DOM access (e.g., Turnstile widget)

**Preferred Alternative:**

```typescript
// Use React refs
const elementRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (elementRef.current) {
    elementRef.current.style.color = 'red';
  }
}, []);

// Use React state and props
const [scrollPosition, setScrollPosition] = useState(0);

// Use React's dangerouslySetInnerHTML only after sanitization
import sanitizeHtml from 'sanitize-html';

const cleanHtml = sanitizeHtml(userProvidedHtml);
<div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
```

---

## React & Next.js Patterns

### ❌ Using `fetch` in Client Components

**Forbidden in client components:**

```typescript
'use client';

export function MyComponent() {
  useEffect(() => {
    fetch('/external-api/data').then(...);
  }, []);
}
```

**Rationale:**

- Makes client bundle larger
- Exposes API details to client
- Harder to implement proper error handling and retry logic
- Can leak API keys or sensitive URLs
- Bypasses Next.js data fetching optimizations

**Allowed Exceptions:**

1. **Route handlers API**: Fetching from internal Next.js route handlers (`/api/**`) is allowed for form submissions and client-triggered actions
2. **Test files**: fetch mocking in tests is allowed

**Preferred Alternative:**

```typescript
// For data fetching - use Server Components or Server Actions
async function MyServerComponent() {
  const data = await fetchData(); // Direct data fetching in server component
  return <div>{data}</div>;
}

// For forms - use Server Actions
'use server';
export async function submitForm(formData: FormData) {
  // Server-side processing
}

// For client interactions - use internal API routes
'use client';
export function MyComponent() {
  const handleSubmit = async () => {
    // OK: calling internal API route
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };
}
```

### ❌ HTML Anchor Tags for Internal Navigation

**Forbidden:**

```tsx
<a href="/about">About</a>
```

**Rationale:**

- Causes full page reload
- Loses client-side navigation benefits
- Slower user experience
- Doesn't prefetch pages

**Preferred Alternative:**

```tsx
import Link from "next/link";

<Link href="/about">About</Link>;
```

### ❌ HTML `<img>` Tags

**Forbidden:**

```tsx
<img src="/my-image.jpg" alt="Description" />
```

**Rationale:**

- No automatic image optimization
- No responsive image generation
- Larger bundle sizes
- Slower page loads

**Allowed Exceptions:**

1. External images from third-party domains where next/image doesn't apply
2. SVG icons imported as components

**Preferred Alternative:**

```tsx
import Image from "next/image";

<Image
  src="/my-image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
/>;
```

### ❌ Missing Metadata Exports

**Discouraged in `app/[lang]/**/page.tsx`:\*\*

```tsx
// page.tsx without metadata export
export default function Page() {
  return <div>Content</div>;
}
```

**Rationale:**

- Missing page metadata hurts SEO
- Inconsistent social media previews
- Poor search engine indexing

**Preferred Alternative:**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description for SEO",
};

export default function Page() {
  return <div>Content</div>;
}
```

---

## Security Patterns

### ❌ Misused Promises in Event Handlers

**Forbidden:**

```tsx
<button
  onClick={async () => {
    await someAsyncOperation();
  }}
>
  Click me
</button>
```

**Rationale:**

- Unhandled promise rejections
- React doesn't handle async event handlers
- Silent errors
- Hard to debug

**Preferred Alternative:**

```tsx
<button
  onClick={() => {
    void (async () => {
      try {
        await someAsyncOperation();
      } catch (error) {
        logError(error, { component: "MyComponent", action: "button-click" });
      }
    })();
  }}
>
  Click me
</button>;

// Or use a named handler
const handleClick = useCallback(() => {
  void (async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      logError(error, { component: "MyComponent", action: "button-click" });
    }
  })();
}, []);

<button onClick={handleClick}>Click me</button>;
```

---

## Summary

These forbidden patterns are enforced through:

- ESLint rules in `eslint.config.mjs`
- Pre-commit hooks via Husky and lint-staged
- CI/CD checks in GitHub Actions

For justifiable exceptions, use ESLint disable comments with clear rationale:

```typescript
// eslint-disable-next-line rule-name -- Justification for why this is necessary
const exception = code;
```

See [AI_GUARDRAILS.md](./AI_GUARDRAILS.md) for more information about how these patterns support safe AI-assisted development.
