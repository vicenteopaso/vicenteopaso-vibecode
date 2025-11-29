# Error Handling & Observability

This document describes how runtime errors are handled and monitored in this application.

## Table of Contents

- [Observability Stack](#observability-stack)
- [Error Handling Patterns](#error-handling-patterns)
- [Client-Side Errors](#client-side-errors)
- [Server-Side Errors](#server-side-errors)
- [Monitoring & Debugging](#monitoring--debugging)
- [When to Add Full Error Tracking](#when-to-add-full-error-tracking)

## Observability Stack

This site uses **Vercel's built-in observability** tools for monitoring and error visibility:

### Vercel Analytics

- **Package**: `@vercel/analytics`
- **Location**: `app/layout.tsx`
- **Provides**: Page views, user interactions, traffic patterns
- **Access**: Vercel Dashboard → Analytics tab

### Vercel Speed Insights

- **Package**: `@vercel/speed-insights`
- **Location**: `app/layout.tsx`
- **Provides**: Core Web Vitals (LCP, FID, CLS), performance metrics
- **Access**: Vercel Dashboard → Speed Insights tab

### Vercel Logs

- **Access**: Vercel Dashboard → Logs tab (or `vercel logs` CLI)
- **Captures**: All `console.error()`, `console.warn()`, `console.log()` from server-side code
- **Retention**: Varies by plan (7–30 days typical)
- **Use case**: Server errors, API route failures, uncaught exceptions in SSR/API

### Production Source Maps

- **Config**: `next.config.mjs` → `productionBrowserSourceMaps: true`
- **Benefit**: Stack traces in production show original TypeScript line numbers
- **Tradeoff**: Slightly larger bundle size, but critical for debugging

## Error Handling Patterns

### Design Philosophy

1. **Fail gracefully**: Show user-friendly messages, never expose stack traces or internal details
2. **Log server-side**: Use `console.error()` for server errors; Vercel captures these
3. **Handle client-side locally**: Use React state to manage UI errors (forms, modals, fetch failures)
4. **Validate inputs**: Use Zod schemas to catch bad data early (e.g., contact form)
5. **Preserve user context**: Avoid losing form data or user progress on errors

## Client-Side Errors

Client-side errors are handled with a **multi-layered approach**:

1. **React Error Boundaries** - Catch component rendering errors
2. **Global error listeners** - Capture unhandled errors and promise rejections
3. **Local error state** - Component-specific error handling for expected failures
4. **Structured logging** - All errors logged with context for debugging

### Error Boundary

**Location**: `app/components/ErrorBoundary.tsx`

A React Error Boundary wraps the main content area to catch component errors and display a fallback UI.

```typescript
<ErrorBoundary>
  <main id="main-content">
    {children}
  </main>
</ErrorBoundary>
```

**Features**:

- Catches errors during rendering, in lifecycle methods, and in constructors
- Displays user-friendly fallback UI with refresh option
- Logs errors to console (captured by Vercel logs in production)
- Supports custom fallback UI via `fallback` prop
- Supports custom error handling via `onError` callback

**Example usage with custom fallback**:

```typescript
<ErrorBoundary fallback={<CustomErrorUI />} onError={handleError}>
  <YourComponent />
</ErrorBoundary>
```

### Global Error Listeners

**Location**: `app/components/GlobalErrorHandler.tsx`

Captures unhandled errors and promise rejections globally.

```typescript
// Mounted in app/layout.tsx
<GlobalErrorHandler />
```

**What it catches**:

- Uncaught JavaScript errors (`window.onerror`)
- Unhandled promise rejections (`unhandledrejection` event)

**Behavior**:

- Prevents default browser error handling
- Logs errors with structured context (component, action, metadata)
- Errors are captured by Vercel logs in production

### Structured Error Logging

**Location**: `lib/error-logging.ts`

Centralized error logging utilities with context.

```typescript
import { logError, logWarning, getErrorMessage } from "@/lib/error-logging";

// Log an error with context
logError(error, {
  component: "ContactDialog",
  action: "submit",
  userId: "user-123",
  metadata: { attempt: 2 },
});

// Log a warning
logWarning("Rate limit approaching", {
  component: "RateLimiter",
  metadata: { remaining: 5 },
});

// Extract user-friendly error message
const message = getErrorMessage(error);
```

**Log format** (captured by Vercel):

```json
{
  "timestamp": "2025-11-27T10:30:00.000Z",
  "level": "error",
  "message": "Failed to submit form",
  "stack": "Error: Failed to submit form\n    at ...",
  "component": "ContactDialog",
  "action": "submit",
  "metadata": { "attempt": 2 }
}
```

### Common Patterns

#### Form Validation Errors

**Location**: `app/components/ContactDialog.tsx`

```typescript
// Zod schema validation
const contactSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  message: z.string().min(5, "Message cannot be empty, or so short."),
  // ...
});

// Display errors in UI state
const [emailError, setEmailError] = useState<string | null>(null);
```

#### Content Fetch Errors

**Locations**: `app/components/TechStackModal.tsx`, `app/components/PrivacyPolicyModal.tsx`

```typescript
const [error, setError] = useState<string | null>(null);

try {
  const response = await fetch("/api/content/tech-stack");
  if (!response.ok) {
    throw new Error("Failed to load tech stack.");
  }
  const data = await response.json();
  setContent(data.content);
} catch (err) {
  const message =
    err instanceof Error ? err.message : "Failed to load tech stack.";
  setError(message);
}
```

**UI Fallback**:

```typescript
{error ? (
  <p className="text-red-400">{error}</p>
) : (
  // Render content
)}
```

#### Image Load Errors

**Location**: `app/components/ProfileCard.tsx`

```typescript
const [hasImageError, setHasImageError] = useState(false);

<Image
  src="/assets/images/profile.jpg"
  onError={() => setHasImageError(true)}
  // ...
/>

{hasImageError && (
  <div className="fallback-initials">{initials}</div>
)}
```

### Sentry-Powered Client-Side Tracking

The following features now provide **full-stack error visibility** using Vercel + Sentry:

- ✅ **Error Boundary** – Catches React component errors and displays fallback UI.
- ✅ **Global error listeners** – Capture unhandled errors and promise rejections.
- ✅ **Structured error logging** – Centralized logging with context via `logError` / `logWarning`.
- ✅ **Error aggregation and grouping** – Sentry groups errors, de-duplicates noise, and surfaces top issues.
- ✅ **User session context/breadcrumbs** – Sentry scope tags, user context, and breadcrumbs add rich context around failures.
- ✅ **Session replay** – Sentry Replay records sampled sessions (`replaysSessionSampleRate` / `replaysOnErrorSampleRate`) when enabled in the Sentry project.
- ✅ **Client-side error alerts** – Sentry alerts can be configured in the Sentry UI (email/Slack/etc.) based on captured errors.

**Implementation**: Client-side error tracking is implemented using React Error Boundaries, global error listeners, and centralized logging utilities that both log to the console (for Vercel logs) and forward errors/warnings to Sentry.

**Why this approach?** For a low-traffic personal portfolio, Vercel logs remain a solid baseline, while Sentry adds aggregation, replay, and alerting with minimal code overhead. Sampling in `sentry.client.config.ts` keeps volume and cost under control.

#### Sentry production checklist

To ensure Sentry is fully active in production:

1. **Environment variables**
   - `SENTRY_DSN` and `SENTRY_ENVIRONMENT` set for server/edge (for `sentry.server.config.ts` and `sentry.edge.config.ts`).
   - `NEXT_PUBLIC_SENTRY_DSN` set with the public DSN for the client bundle (for `sentry.client.config.ts`).
2. **Sentry project settings**
   - Replay enabled with sampling consistent with the code:
     - `replaysSessionSampleRate: 0.1`
     - `replaysOnErrorSampleRate: 1.0`
   - Performance monitoring turned on so `tracesSampleRate: 0.1` is honored.
   - Alert rules created for your `production` environment (for example, notify on new issues or error rate spikes).
3. **Deployment**
   - Env vars configured for all relevant environments (Preview/Production).
   - A fresh deployment completed after changing env vars so Sentry picks up the configuration.

## Server-Side Errors

Server-side errors are logged with `console.error()` and captured by **Vercel Logs**.

### API Route Error Handling

**Location**: `app/api/contact/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    // ... validation, rate limiting, Turnstile verification, Formspree forwarding

    if (!TURNSTILE_SECRET_KEY) {
      console.error("Turnstile secret key is not configured.");
      return NextResponse.json(
        { error: "Verification service is not configured." },
        { status: 500 },
      );
    }

    // ... business logic

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Validation error: return 400 with first issue
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input." },
        { status: 400 },
      );
    }

    // Unexpected error: log server-side, return generic 500
    console.error("Error handling contact form submission", error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again in a moment." },
      { status: 500 },
    );
  }
}
```

### SSR/SSG Error Handling

**Locations**: `app/page.tsx`, `app/cv/page.tsx`

Both pages read markdown files from the filesystem at build/runtime:

```typescript
const filePath = path.join(process.cwd(), "content", "cv.md");
const fileContents = fs.readFileSync(filePath, "utf8");
const { data, content } = matter(fileContents);

let cv: CvJson | null = null;
try {
  cv = JSON.parse(content) as CvJson;
} catch {
  cv = null;
}

if (!cv) {
  return (
    <div className="section-card space-y-4">
      <h1>CV</h1>
      <p className="text-red-400">
        CV data could not be loaded. Please check that the JSON body in
        <code>content/cv.md</code> is valid.
      </p>
    </div>
  );
}
```

**Key behavior**:

- If JSON parsing fails, render a **user-friendly error** instead of crashing
- No `console.error()` here (intentional: invalid content is a build-time issue, not runtime)
- Build will succeed; page shows error message at runtime

### Environment Variable Validation

Missing environment variables are checked at runtime and logged:

```typescript
if (!TURNSTILE_SECRET_KEY) {
  console.error("Turnstile secret key is not configured.");
  return NextResponse.json(
    { error: "Verification service is not configured." },
    { status: 500 },
  );
}
```

**Note**: These logs appear in Vercel Logs, not in the client browser console.

## Monitoring & Debugging

### Where to Check for Errors

| Error Type             | Tool             | Access                            |
| ---------------------- | ---------------- | --------------------------------- |
| Server-side exceptions | Vercel Logs      | Dashboard → Logs tab              |
| API route errors       | Vercel Logs      | Search for `console.error`        |
| Client-side exceptions | Browser DevTools | Console tab (only visible to you) |
| Performance issues     | Speed Insights   | Dashboard → Speed Insights        |
| Traffic anomalies      | Analytics        | Dashboard → Analytics             |

### Debugging Workflow

1. **Reproduce locally**:

   ```bash
   pnpm dev
   # Open browser DevTools, trigger the error
   ```

2. **Check Vercel Logs** (for server errors):

   ```bash
   vercel logs --follow
   # Or: Vercel Dashboard → Project → Logs
   ```

3. **Inspect production source maps**:
   - Open browser DevTools in production
   - Error stack traces show original TypeScript file/line numbers (because `productionBrowserSourceMaps: true`)

4. **Review API responses** (for client fetch errors):
   - Network tab → filter by XHR/Fetch
   - Inspect response body for `{ error: "..." }` messages

### Testing Error States

Unit tests cover error scenarios:

- **Error Boundary**: `test/unit/error-boundary.test.tsx`
  - Component error catching, fallback UI rendering, custom fallback, onError callback
- **Error Logging**: `test/unit/error-logging.test.ts`
  - Structured logging, context handling, error message extraction
- **Global Error Handler**: `test/unit/global-error-handler.test.tsx`
  - Event listener registration, unhandled error capture, promise rejection handling
- **Contact route**: `test/unit/contact-route.test.ts`
  - Missing env vars, invalid Turnstile token, Formspree failure, Zod validation errors
- **CV page**: `test/unit/cv-page.test.tsx`
  - Invalid JSON fallback rendering
- **Contact dialog**: `test/unit/contact-dialog.test.tsx`
  - Client-side error handling (mocked fetch errors)

E2E tests validate user-facing errors:

- **Error Handling**: `test/e2e/error-handling.spec.ts`
  - Error boundary fallback, unhandled rejections, API errors, navigation recovery
- **Contact form**: `test/e2e/contact-and-cv.spec.ts`
  - Validation errors, rate limiting

## When to Add Full Error Tracking

Consider adding **Sentry** (or similar) if:

1. **Traffic scales significantly** (e.g., >10k users/month)
2. **Business-critical flows** (e.g., paid features, SaaS product)
3. **Complex client-side logic** with many error scenarios
4. **Team collaboration** requires shared error triage
5. **You need alerts** (e.g., Slack/email on critical errors)
6. **Session replay** would significantly speed up debugging

### How to Add Sentry (if needed)

1. **Install**:

   ```bash
   pnpm add @sentry/nextjs
   ```

2. **Configure**:

   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

   This creates `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, and updates `next.config.mjs`.

3. **Set environment variables**:

   ```env
   # Server and Edge runtime DSN (secret)
   SENTRY_DSN=https://...ingest.sentry.io/...

   # Client-side DSN (public, safe to expose)
   NEXT_PUBLIC_SENTRY_DSN=https://...ingest.sentry.io/...

   # Environment label (development | preview | production)
   SENTRY_ENVIRONMENT=production

   # For uploading source maps during build
   SENTRY_AUTH_TOKEN=sntrys_...
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=your-project-slug

   # Performance sampling rate (optional, defaults to 0.1)
   SENTRY_TRACES_SAMPLE_RATE=0.1
   ```

   For detailed instructions on obtaining these values, see [`docs/SENTRY_SETUP.md`](./SENTRY_SETUP.md).

4. **Update privacy policy**:
   - Add Sentry to `content/privacy-policy.md` (third-party data processor)
   - Explain what data is collected (IP, user agent, error traces)

5. **Configure sampling** (to control costs):

   ```typescript
   // sentry.client.config.ts
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 0.1, // 10% of transactions
     replaysSessionSampleRate: 0.1, // 10% of sessions
     replaysOnErrorSampleRate: 1.0, // 100% when error occurs
   });
   ```

6. **Test**:

   ```typescript
   // Trigger test error
   throw new Error("Test Sentry integration");
   ```

7. **Update docs**:
   - Add Sentry to this document
   - Update `README.md` and `ARCHITECTURE.md`

## Related Documentation

- [Privacy Policy](../content/privacy-policy.md) - Mentions Vercel logs and performance monitoring
- [Architecture](./ARCHITECTURE.md) - Overall system design
- [Security](./SECURITY_POLICY.md) - Security headers, CSP, and defense-in-depth

---

**Last updated**: 2025-11-27  
**Decision**: Use Vercel observability + Sentry (sampled traces/replay) as the default stack  
**Revisit when**: Traffic exceeds 10k users/month or complex features require adjusting Sentry sampling/alerting strategy
