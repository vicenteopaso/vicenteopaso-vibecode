import "@testing-library/jest-dom/vitest";

// Suppress expected warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const message = String(args[0]);
    // Suppress known non-critical warnings
    if (
      message.includes("Turnstile site key is not configured") ||
      message.includes("Turnstile secret key is not configured") ||
      message.includes("Formspree endpoint is not configured") ||
      message.includes("is using a query string which is not configured") ||
      message.includes("Received `true` for a non-boolean attribute") ||
      message.includes("Received `false` for a non-boolean attribute") ||
      message.includes("Missing `Description`") ||
      message.includes("DialogContent` requires a `DialogTitle`") ||
      message.includes("validateDOMNesting") ||
      message.includes("not wrapped in act(") ||
      message.includes("Warning:")
    ) {
      return;
    }
    originalError(...args);
  };

  console.warn = (...args: unknown[]) => {
    const message = String(args[0]);
    if (
      message.includes("Turnstile") ||
      message.includes("Formspree") ||
      message.includes("query string") ||
      message.includes("non-boolean attribute") ||
      message.includes("Missing `Description`") ||
      message.includes("DialogTitle")
    ) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
