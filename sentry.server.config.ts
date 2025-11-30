import * as Sentry from "@sentry/nextjs";

// Skip Sentry initialization during unit tests to avoid Next.js pages hooks.
if (process.env.NODE_ENV === "test" || process.env.VITEST) {
  // Do not initialize Sentry when running Vitest/JSDOM.
  // This prevents wrapping of /_document in non-Pages Router environments.
  // eslint-disable-next-line no-console
  if (process.env.VITEST)
    console.debug("[Sentry] Skipping server init in tests.");
} else {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    // Allow tuning via env var; default to 0.1 (10%) if not set or invalid
    // Use parseFloat and explicit isNaN check to handle empty string and 0 correctly
    tracesSampleRate: (() => {
      const parsedRate = parseFloat(
        process.env.SENTRY_TRACES_SAMPLE_RATE || "",
      );
      return !isNaN(parsedRate) ? parsedRate : 0.1;
    })(),
    // Use default server integrations; console capture is handled by our
    // structured logging and Vercel logs.
  });
}
