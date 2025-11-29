# ErrorBoundary Component

## Overview

React Error Boundary component that catches JavaScript errors in child components and displays a fallback UI instead of crashing the entire app.

**Location:** `app/components/ErrorBoundary.tsx`

## Props

| Prop       | Type                                           | Default   | Description                       |
| ---------- | ---------------------------------------------- | --------- | --------------------------------- |
| `children` | `ReactNode`                                    | required  | Child components to wrap          |
| `fallback` | `ReactNode`                                    | undefined | Custom fallback UI (optional)     |
| `onError`  | `(error: Error, errorInfo: ErrorInfo) => void` | undefined | Error callback handler (optional) |

## States

### Normal (No Error)

- Renders children normally
- Error boundary is invisible

### Error State

- Catches rendering errors in children
- Displays fallback UI
- Logs error details to console
- Calls `onError` callback if provided

## Default Fallback UI

When no custom fallback is provided:

- Red error message
- "Refresh page" button
- Maintains accessibility with proper contrast

## Accessibility

- Error message uses semantic text color
- Refresh button is keyboard accessible
- Focus visible indicators
- Appropriate ARIA roles maintained

## Usage Examples

### Basic Usage

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### With Custom Fallback

```tsx
<ErrorBoundary
  fallback={
    <div>
      <h2>Something went wrong</h2>
      <p>Please try again later.</p>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

### With Error Callback

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    logError(error, {
      component: "MyComponent",
      errorInfo: errorInfo.componentStack,
    });
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## Testing

**Test file:** `test/unit/error-boundary.test.tsx`

- ✅ Renders children when no error
- ✅ Catches errors in children
- ✅ Displays fallback UI on error
- ✅ Calls onError callback
- ✅ Custom fallback works
- ✅ Refresh button resets error

## Related

- [Error Handling Documentation](../ERROR_HANDLING.md)
- [GlobalErrorHandler Component](./GlobalErrorHandler.md)
