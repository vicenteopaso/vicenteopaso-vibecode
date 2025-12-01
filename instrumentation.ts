import * as Sentry from "@sentry/nextjs";

/**
 * Next.js App Router instrumentation entrypoint.
 *
 * This is called automatically by Next.js on the server/edge runtimes and
 * is responsible for initializing Sentry for those environments.
 */
export async function register() {
  // Touch the Sentry import so bundlers and the Sentry Next.js integration
  // keep this module wired up, even though all concrete initialization
  // happens inside the environment-specific config files.
  void Sentry;

  // Ensure the Sentry SDK is loaded and initialized for the appropriate
  // runtime. The client-side configuration is handled via
  // `instrumentation-client.ts` and `withSentryConfig` in next.config.mjs.

  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Node.js (server) runtime
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime
    await import("./sentry.edge.config");
  }
}

/**
 * Hook to capture errors from nested React Server Components.
 * This is called automatically by Next.js when an error occurs during server rendering.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#errors-from-nested-react-server-components
 */
export const onRequestError = Sentry.captureRequestError;
