"use client";

import * as Sentry from "@sentry/nextjs";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the App Router.
 *
 * This component is used by Next.js to handle uncaught errors in the root
 * layout or template. It is also instrumented with Sentry so that React
 * render errors are reported.
 *
 * Note: global-error must define its own <html> and <body> tags since it
 * replaces the root layout when active.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Report the error to Sentry. The same error instance may be reused, but
    // this hook will only run when Next.js renders the global error boundary.
    Sentry.captureException(error);
  }, [error]);

  const title: ReactNode = "Something went wrong";
  const message: ReactNode =
    "An unexpected error occurred while rendering this page. Please try again.";

  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-[color:var(--bg-app)] text-[color:var(--text-primary)]">
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="section-card max-w-lg space-y-4 text-center">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-[color:var(--text-muted)]">{message}</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-full bg-[color:var(--accent)] px-4 py-1.5 text-sm font-semibold text-slate-50 shadow-md shadow-[color:var(--accent)]/30 transition hover:bg-[color:var(--accent-hover)] hover:shadow-lg hover:shadow-[color:var(--accent)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => {
                  // As a fallback, allow users to fully reload the app.
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
                className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-4 py-1.5 text-sm font-medium text-[color:var(--text-primary)] shadow-sm transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
