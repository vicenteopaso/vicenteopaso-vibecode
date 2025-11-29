# GlobalErrorHandler Component

## Overview

A global error handler that captures unhandled JavaScript errors and promise rejections, logging them with structured context via the error logging utility.

**Location:** `app/components/GlobalErrorHandler.tsx`

**Usage:** Mounted once in root layout to capture browser-level errors

## Props

None - The component is self-contained.

## Features

### Error Capture

1. **Uncaught Errors** (`window.onerror`)
   - Captures errors not caught by try-catch or ErrorBoundary
   - Prevents default browser error handling
   - Logs with file, line, and column information

2. **Unhandled Promise Rejections** (`unhandledrejection`)
   - Captures promise rejections without `.catch()` handlers
   - Prevents default browser console warning
   - Logs rejection reason

### Structured Logging

All errors logged with:

- **Component**: "GlobalErrorHandler"
- **Action**: "window.onerror" or "unhandledrejection"
- **Metadata**: Error details (message, filename, line, column, reason)

Logs are sent to `logError()` from `lib/error-logging.ts`, which forwards to Sentry in production.

## Implementation

```typescript
useEffect(() => {
  const handleError = (event: ErrorEvent) => {
    event.preventDefault();
    logError(event.error, {
      component: "GlobalErrorHandler",
      action: "window.onerror",
      metadata: {
        /* error details */
      },
    });
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    logError(event.reason, {
      component: "GlobalErrorHandler",
      action: "unhandledrejection",
      metadata: { reason: String(event.reason) },
    });
  };

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  return () => {
    window.removeEventListener("error", handleError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  };
}, []);
```

## Error Flow

1. **Error occurs** in browser (uncaught error or unhandled rejection)
2. **Event listener triggered** (error or unhandledrejection)
3. **Default behavior prevented** (prevents console spam)
4. **Error logged** via `logError()` utility
5. **Sentry captures** (in production) with context and breadcrumbs
6. **Development**: Error logged to console with context

## Usage

### In Root Layout

```tsx
import { GlobalErrorHandler } from "./components/GlobalErrorHandler";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GlobalErrorHandler />
        {/* Rest of app */}
      </body>
    </html>
  );
}
```

### Important Notes

- **Mount once only**: Should be mounted at the root, not in multiple components
- **Client-side only**: Uses `useEffect` and browser APIs
- **Complement to ErrorBoundary**: Catches different types of errors
  - ErrorBoundary: React rendering errors
  - GlobalErrorHandler: Async errors, promise rejections, non-React errors

## Accessibility

No UI rendered - purely functional component for error tracking.

## Testing

**Test file:** `test/unit/global-error-handler.test.tsx`

- ✅ Registers error listeners on mount
- ✅ Captures uncaught errors
- ✅ Captures unhandled promise rejections
- ✅ Logs errors with correct context
- ✅ Prevents default error handling
- ✅ Cleans up listeners on unmount

**E2E tests:** `test/e2e/error-handling.spec.ts`

- ✅ Unhandled promise rejections captured
- ✅ Console errors logged (but don't crash app)

## Error Logging Integration

The component uses `logError()` from `lib/error-logging.ts`:

### Development

```typescript
console.error("[Error]", {
  component: "GlobalErrorHandler",
  action: "window.onerror",
  error: error.message,
  metadata: {
    /* context */
  },
});
```

### Production

- Sent to Sentry via `@sentry/nextjs`
- Includes error message, stack trace, breadcrumbs
- Tagged with component and action context
- Grouped by error type for easy triage

## Best Practices

1. **Don't suppress errors**: Log them, don't hide them
2. **Provide context**: Include action and metadata in logs
3. **Use with ErrorBoundary**: Covers different error types
4. **Monitor in production**: Check Sentry for error trends
5. **Test error scenarios**: Verify errors are captured correctly

## Related Components

- **[ErrorBoundary](./ErrorBoundary.md)** - Catches React rendering errors
- **[GlobalErrorPage](../../app/global-error.tsx)** - Root error UI

## Related Documentation

- [Error Logging](../../lib/error-logging.ts)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [Sentry Setup](../SENTRY_SETUP.md)
