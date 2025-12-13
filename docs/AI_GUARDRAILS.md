# AI Guardrails

This document defines explicit rules and patterns for AI-authored code changes in this repository. These guardrails ensure consistency with the project's architecture, quality standards, and governance principles.

## Purpose and Scope

AI tools (GitHub Copilot, Cursor, ChatGPT, etc.) assist with code generation, refactoring, and documentation. These guardrails:

- **Enforce consistency** with `sdd.yaml`, `docs/ENGINEERING_STANDARDS.md`, and other governance documents
- **Prevent regressions** in accessibility, SEO, performance, security, and error handling
- **Preserve critical behavior** in content parsing, i18n routing, and contact flow
- **Guide decision-making** when implementing new features or refactoring existing code

**Scope**: All AI-generated or AI-assisted code changes must comply with these rules. Human reviewers should verify compliance during code review.

---

## Must: Required Practices

These practices are **mandatory** for all code changes. Violations should be caught in code review or CI.

### 1. TypeScript and Type Safety

**Rule**: Use `import type` for type-only imports.

**Rationale**: Satisfies ESLint rule `@typescript-eslint/consistent-type-imports`, reduces bundle size, and clarifies intent.

**Good**:

```typescript
import type { NextRequest } from "next/server";
import type { Metadata } from "next";
import { NextResponse } from "next/server";
```

**Bad**:

```typescript
import { NextRequest, NextResponse } from "next/server"; // Mixes types and values
import { Metadata } from "next"; // Type-only import without 'type' keyword
```

---

### 2. Semantic HTML and Accessibility

**Rule**: Use semantic HTML elements, maintain heading hierarchy, and ensure keyboard navigation.

**Rationale**: Meets WCAG 2.1 AA standards, improves screen reader experience, and enhances SEO.

**Good**:

```tsx
<main id="main-content">
  <h1>Page Title</h1>
  <section aria-labelledby="section-heading">
    <h2 id="section-heading">Section Title</h2>
    <p>Content here...</p>
  </section>
</main>
```

**Bad**:

```tsx
<div className="main">
  {" "}
  {/* Should be <main> */}
  <div className="heading">Page Title</div> {/* Should be <h1> */}
  <div>
    <div className="subheading">Section</div> {/* Should be <h2> */}
  </div>
</div>
```

**Additional requirements**:

- All images must have `alt` text (or explicit `alt=""` for decorative images)
- Interactive elements must be keyboard accessible (focus visible, no traps)
- Use ARIA attributes sparingly and correctly
- Maintain sufficient color contrast (4.5:1 for body text)

---

### 3. Metadata and SEO

**Rule**: Export `metadata` objects in pages, use descriptive titles and descriptions, and maintain canonical URLs.

**Rationale**: Ensures proper indexing, social sharing, and search visibility. Aligns with `docs/SEO_GUIDE.md`.

**Good**:

```typescript
// app/[lang]/example/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Example Page | Vicente Opaso",
  description: "A clear, descriptive summary of this page's content.",
  openGraph: {
    title: "Example Page",
    description: "A clear, descriptive summary of this page's content.",
    url: "https://opa.so/en/example",
  },
};
```

**Bad**:

```typescript
// Missing metadata export
export default function ExamplePage() {
  return <div>Content</div>;
}
```

---

### 4. Error Handling

**Rule**: Use `ErrorBoundary` for component errors, `logError()` and `logWarning()` from `lib/error-logging` for all caught errors.

**Rationale**: Centralizes error tracking, integrates with Sentry, and provides structured logging for Vercel. Aligns with `docs/ERROR_HANDLING.md`.

**Good**:

```tsx
import { logError } from "@/lib/error-logging";

async function fetchData() {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logError(error, {
      component: "DataFetcher",
      action: "fetchData",
      metadata: { url: "/api/data" },
    });
    throw error; // Re-throw if caller should handle it
  }
}
```

**Bad**:

```typescript
async function fetchData() {
  try {
    const response = await fetch("/api/data");
    return await response.json();
  } catch (error) {
    console.error(error); // Should use logError()
  }
}
```

**Additional requirements**:

- Client-side errors must fail gracefully without exposing internal details
- Preserve user context (avoid losing form data on errors)
- Use `ErrorBoundary` wrapper for component trees that might throw

---

### 5. Server-Side Data Fetching

**Rule**: Fetch data in Server Components, API route handlers, or `getServerSideProps` (if using Pages Router). Avoid fetching in Client Components.

**Rationale**: Improves performance (no client-side waterfalls), enhances SEO (content is server-rendered), and reduces bundle size.

**Good**:

```tsx
// app/[lang]/posts/page.tsx (Server Component)
async function PostsPage() {
  const posts = await fetchPosts(); // Direct fetch in Server Component
  return (
    <div>
      {posts.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </div>
  );
}
```

**Bad**:

```tsx
"use client";
import { useEffect, useState } from "react";

function PostsPage() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then(setPosts); // Fetch in Client Component
  }, []);
  return (
    <div>
      {posts.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </div>
  );
}
```

---

### 6. Styling and Theming

**Rule**: Use Tailwind CSS utility classes and Radix UI primitives. Respect `next-themes` for light/dark mode. Avoid inline styles that break theming.

**Rationale**: Maintains consistency with the design system, ensures theme support, and follows `docs/DESIGN_SYSTEM.md`.

**Good**:

```tsx
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
  Click Me
</button>
```

**Bad**:

```tsx
<button
  style={{ backgroundColor: "#0070f3", color: "white", padding: "8px 16px" }}
>
  Click Me
</button>
```

---

### 7. Internationalization (i18n)

**Rule**: Use `lib/i18n` utilities for locale detection and translations. Read locale from `params.lang` in App Router pages. Never hardcode locale or language-specific content.

**Rationale**: Ensures all routes are locale-aware, supports English and Spanish, and follows `sdd.yaml` i18n-routing principles.

**Good**:

```tsx
// app/[lang]/example/page.tsx
import type { Locale } from "@/lib/i18n";

export default async function ExamplePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const content = await getContent(lang); // Load locale-specific content
  return <div>{content.title}</div>;
}
```

**Bad**:

```tsx
export default function ExamplePage() {
  const content = getContent("en"); // Hardcoded locale
  return <div>{content.title}</div>;
}
```

**Additional requirements**:

- All user-visible text must be i18n-aware (use UI string dictionaries in `i18n/[locale]/ui.json`)
- Links must include locale prefix: `/en/about`, not `/about`
- Metadata and OG images must accept `lang` param for translations

---

### 8. Content Parsing Semantics

**Rule**: Preserve CV JSON parsing behavior in `content/[locale]/cv.md`. Do not break existing error handling or validation.

**Rationale**: The CV page parses a JSON object from markdown at build time. Breaking this breaks the entire CV page.

**Good** (when modifying CV parsing):

```typescript
try {
  const cvData = JSON.parse(cvJsonString);
  // Validate structure
  if (!cvData.basics || !cvData.work) {
    throw new Error("Invalid CV structure");
  }
  return cvData;
} catch (error) {
  logError(error, { component: "CVParser", action: "parseCV" });
  return null; // Graceful fallback
}
```

**Bad**:

```typescript
const cvData = JSON.parse(cvJsonString); // No error handling or validation
```

---

### 9. Contact Flow Security

**Rule**: Preserve Turnstile verification, honeypot check, domain validation, and rate limiting in `/api/contact`.

**Rationale**: Protects against spam, CSRF, and abuse. Removing these checks opens the site to attacks. Aligns with `docs/SECURITY_POLICY.md`.

**Good** (when modifying contact route):

```typescript
// Validate Turnstile token
const turnstileResponse = await fetch(
  "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: TURNSTILE_SECRET_KEY,
      response: data.turnstileToken,
      remoteip: clientIp,
    }),
  },
);
const turnstileResult = await turnstileResponse.json();
if (!turnstileResult.success) {
  return NextResponse.json({ error: "Verification failed." }, { status: 400 });
}
```

**Bad**:

```typescript
// Commented out or removed Turnstile verification
// if (!data.turnstileToken) { ... }
await forwardToFormspree(data); // No verification
```

---

### 10. HTML Sanitization

**Rule**: Use `lib/sanitize-html.ts` for sanitizing user-generated or content-sourced HTML. Never use `dangerouslySetInnerHTML` without sanitization.

**Rationale**: Prevents XSS attacks. The CV references contain HTML strings that must be sanitized before rendering.

**Good**:

```tsx
import { sanitizeRichText } from "@/lib/sanitize-html";

function Reference({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }} />;
}
```

**Bad**:

```tsx
function Reference({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />; // No sanitization
}
```

---

## Avoid: Forbidden Patterns

These patterns are **prohibited**. They violate security, performance, or architecture principles.

### 1. Bypassing Verification or Rate Limiting

**Pattern**: Commenting out or removing Turnstile, honeypot, domain checks, or rate limiting in `/api/contact`.

**Why forbidden**: Opens the site to spam, abuse, and CSRF attacks.

**Exception**: None. These checks are security-critical.

---

### 2. Using `any` Type

**Pattern**: Using TypeScript's `any` type instead of proper types.

**Why forbidden**: Defeats the purpose of TypeScript, hides type errors, and reduces code quality.

**Exception**: Very rare cases where a third-party library has incorrect types. Must be documented with a `// @ts-expect-error` comment explaining why.

**Example**:

```typescript
// Bad
function processData(data: any) {
  return data.someProperty;
}

// Good
interface DataType {
  someProperty: string;
}
function processData(data: DataType) {
  return data.someProperty;
}
```

---

### 3. Direct `console.*` Outside Structured Logging

**Pattern**: Using `console.log()`, `console.error()`, or `console.warn()` directly instead of `logError()` or `logWarning()`.

**Why forbidden**: Prevents integration with Sentry, loses context, and makes debugging harder.

**Exception**: Build scripts, config files, and non-production debugging (must be removed before commit via lint-staged).

**Example**:

```typescript
// Bad
try {
  await fetchData();
} catch (error) {
  console.error("Fetch failed:", error);
}

// Good
try {
  await fetchData();
} catch (error) {
  logError(error, { component: "DataFetcher", action: "fetchData" });
}
```

---

### 4. Direct DOM Manipulation

**Pattern**: Using `document.querySelector()`, `document.getElementById()`, or similar DOM APIs in React components.

**Why forbidden**: Breaks React's virtual DOM, causes hydration mismatches, and makes components hard to test.

**Exception**: Very rare cases like integrating third-party libraries that require DOM access (e.g., Turnstile widget). Must be wrapped in `useEffect` and documented.

**Example**:

```typescript
// Bad
function Component() {
  const button = document.querySelector("button");
  button.addEventListener("click", handleClick);
  return <button>Click</button>;
}

// Good
function Component() {
  return <button onClick={handleClick}>Click</button>;
}
```

---

### 5. Inline Styles That Break Theming

**Pattern**: Using `style` prop with hardcoded colors, fonts, or spacing values.

**Why forbidden**: Breaks light/dark theme support, creates inconsistency with the design system.

**Exception**: None for color values. Acceptable for truly dynamic layout values (e.g., `width: ${calculated}px` for dynamic sizing).

**Example**:

```tsx
// Bad
<div style={{ color: "#000", backgroundColor: "#fff" }}>Content</div>

// Good
<div className="text-foreground bg-background">Content</div>
```

---

### 6. Custom Sanitization

**Pattern**: Writing custom HTML sanitization logic instead of using `lib/sanitize-html.ts`.

**Why forbidden**: High risk of introducing XSS vulnerabilities. `lib/sanitize-html.ts` uses a battle-tested library with a conservative whitelist.

**Exception**: If the whitelist in `lib/sanitize-html.ts` needs expansion, modify that file (with security review) rather than creating a new sanitizer.

---

### 7. Hardcoded Secrets or Credentials

**Pattern**: Committing API keys, tokens, passwords, or other secrets to the repository.

**Why forbidden**: Security risk. Secrets should always be environment variables.

**Exception**: None. Use `.env.local` for local development and Vercel project settings for production.

**Example**:

```typescript
// Bad
const FORMSPREE_KEY = "xyzabc123";

// Good
const FORMSPREE_KEY = process.env.NEXT_PUBLIC_FORMSPREE_KEY;
```

---

### 8. Breaking Changes to Content Structure

**Pattern**: Changing `content/[locale]/about.md` or `content/[locale]/cv.md` frontmatter or body structure without updating parsers.

**Why forbidden**: Breaks the About and CV pages, which are the core of the site.

**Exception**: If refactoring is necessary, ensure feature parity and update all parsers, types, and error handling in the same PR.

---

## Exceptions: When Rules Can Be Bent

Exceptions to the above rules must be **rare, justified, and documented**. Always include a code comment explaining why the exception is necessary.

### Acceptable Exceptions

1. **Third-party library integration** that requires direct DOM access or violates patterns (e.g., Turnstile widget)
   - Must be wrapped in `useEffect` or similar lifecycle hook
   - Must include a comment explaining the library's requirements

2. **Performance optimization** that requires inline styles for dynamic layout calculations
   - Only for non-color values (e.g., `width`, `height`, `transform`)
   - Must not break theming

3. **Build scripts and config files** that need `console.log` or filesystem access
   - Limited to `scripts/` directory and config files
   - Must not run in production

4. **Temporary debugging** code during development
   - Must be removed before commit (enforced by lint-staged)
   - Use `// TODO: Remove before commit` comment

### Documentation Required

When making an exception, include:

- A code comment explaining **why** the exception is necessary
- A reference to the library, bug, or constraint that requires it
- A plan to remove the exception if possible

**Example**:

```tsx
"use client";
import { useEffect } from "react";

export function TurnstileWidget() {
  useEffect(() => {
    // Exception: Turnstile requires direct DOM manipulation for widget insertion.
    // This is the only way to integrate Cloudflare Turnstile with React.
    // See: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    document.head.appendChild(script);
  }, []);
  return <div className="cf-turnstile" />;
}
```

---

## Review Checklist for PR Authors

Before submitting a PR with AI-assisted changes, verify:

### Code Quality

- [ ] All `import type` statements used for type-only imports
- [ ] TypeScript strict mode satisfied (no `any`, no type errors)
- [ ] No `console.*` outside `lib/error-logging` (except scripts/config)
- [ ] ESLint passes (`pnpm lint`)
- [ ] Prettier formatting applied (`pnpm format:fix`)

### Accessibility

- [ ] Semantic HTML used (`<main>`, `<nav>`, `<h1>`-`<h6>`, etc.)
- [ ] Heading hierarchy maintained (single `<h1>`, logical `<h2>`-`<h6>` nesting)
- [ ] All images have `alt` text or explicit `alt=""`
- [ ] Keyboard navigation works (focus visible, no traps, logical tab order)
- [ ] ARIA attributes used sparingly and correctly

### SEO

- [ ] `metadata` export defined in new pages
- [ ] Title, description, and Open Graph tags provided
- [ ] Descriptive link text (avoid "click here")
- [ ] OG images locale-aware (accept `lang` param)

### Error Handling

- [ ] `logError()` or `logWarning()` used for all caught errors
- [ ] `ErrorBoundary` wraps component trees that might throw
- [ ] User-friendly error messages (no stack traces exposed)
- [ ] Form data preserved on errors

### Security

- [ ] No hardcoded secrets or credentials
- [ ] HTML sanitized before `dangerouslySetInnerHTML` (use `lib/sanitize-html.ts`)
- [ ] Turnstile, honeypot, rate limiting preserved in `/api/contact`
- [ ] No new XSS, CSRF, or injection vulnerabilities

### Internationalization

- [ ] Locale read from `params.lang` in App Router pages
- [ ] No hardcoded English-only content (use `i18n/[locale]/ui.json`)
- [ ] Links include locale prefix (`/en/about`, not `/about`)
- [ ] Content loaded based on locale (`content/[locale]/`)

### Styling

- [ ] Tailwind CSS used (no inline styles with colors)
- [ ] Light/dark theme support maintained (`next-themes`)
- [ ] Radix UI primitives used for interactive components

### Content

- [ ] CV JSON parsing semantics preserved (no breaking changes to `content/[locale]/cv.md`)
- [ ] About page markdown structure maintained (frontmatter + body sections)

### Testing

- [ ] Unit tests updated/added if behavior changed (`pnpm test`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] Visual regression baselines updated if UI changed (`pnpm test:visual:update`)

### Documentation

- [ ] `docs/` updated if architecture or patterns changed
- [ ] `README.md` updated if setup or commands changed
- [ ] `sdd.yaml` updated if principles or boundaries changed

---

## References

This document consolidates rules from:

- **`sdd.yaml`** — Authoritative source of truth for principles, boundaries, and CI expectations
- **`docs/ENGINEERING_STANDARDS.md`** — North-star engineering intent and quality standards
- **`docs/SECURITY_POLICY.md`** — Security practices and vulnerability reporting
- **`docs/ERROR_HANDLING.md`** — Error handling patterns and observability stack
- **`docs/SEO_GUIDE.md`** — SEO implementation and metadata best practices
- **`docs/ACCESSIBILITY.md`** — Accessibility strategy and WCAG compliance
- **`.github/copilot-instructions.md`** — High-level guidance for AI assistants

When in doubt, consult these documents. If a rule conflicts with this guide, `sdd.yaml` and `docs/ENGINEERING_STANDARDS.md` take precedence.
