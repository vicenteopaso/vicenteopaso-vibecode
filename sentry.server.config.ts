import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  // Allow tuning via env var; default to 0.1 (10%) if not set or invalid
  // Use parseFloat and explicit isNaN check to handle empty string and 0 correctly
  tracesSampleRate: (() => {
    const parsedRate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "");
    return !isNaN(parsedRate) ? parsedRate : 0.1;
  })(),
  integrations: [Sentry.consoleIntegration()],
});
