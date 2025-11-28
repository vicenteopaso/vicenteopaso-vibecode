/**
 * Next.js App Router instrumentation entrypoint.
 *
 * This is called automatically by Next.js on the server/edge runtimes and
 * is responsible for initializing Sentry for those environments.
 */
export async function register() {
  // Ensure the Sentry SDK is loaded and initialized for the appropriate
  // runtime. The client-side configuration is handled via
  // `sentry.client.config.ts` and `withSentryConfig` in next.config.mjs.

  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Node.js (server) runtime
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime
    await import("./sentry.edge.config");
  }
}
