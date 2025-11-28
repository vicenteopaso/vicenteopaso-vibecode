import * as Sentry from "@sentry/nextjs";

// Ensure the DSN is a public client key, not a secret auth token.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Basic check: Sentry public DSNs look like 'https://<publicKey>@o<orgId>.ingest.sentry.io/<projectId>'
// Secret auth tokens are much longer and do not belong in the client bundle.
function isLikelyPublicDSN(dsn: string | undefined): boolean {
  if (!dsn) return false;
  // Public DSNs have a key of 32 hex chars, no colons, and an '@' before the host.
  // Example: https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/1234567
  const publicDsnPattern =
    /^https:\/\/[0-9a-f]{32}@o\d+\.ingest\.sentry\.io\/\d+$/;
  return publicDsnPattern.test(dsn);
}

if (!dsn) {
  // No DSN provided; skip Sentry init.
  if (process.env.NODE_ENV !== "production") {
    // Only warn in non-prod to avoid leaking info in prod.
    // eslint-disable-next-line no-console
    console.warn(
      "[Sentry] No NEXT_PUBLIC_SENTRY_DSN provided; client-side error tracking is disabled.",
    );
  }
} else if (!isLikelyPublicDSN(dsn)) {
  // DSN does not look like a public client key; warn and skip Sentry init.
  // eslint-disable-next-line no-console
  console.warn(
    "[Sentry] The DSN provided in NEXT_PUBLIC_SENTRY_DSN does not look like a public client key. " +
      "Do not expose secret auth tokens in the client bundle. Sentry client initialization skipped.",
  );
} else {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    // Adjust these sample rates based on your traffic and quota.
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: (integrations) => [
      ...integrations,
      Sentry.replayIntegration(),
    ],
  });
}
