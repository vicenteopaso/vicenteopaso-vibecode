"use client";

import { useEffect } from "react";

import { logError } from "../../lib/error-logging";

/**
 * Global error handler that captures unhandled errors and promise rejections.
 *
 * This component should be mounted once in the app layout to set up global
 * error listeners for the browser environment.
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      // Ignore cross-origin script errors (e.g., from Turnstile widget)
      // These appear as "Script error." with no filename/line info
      if (
        event.message === "Script error." &&
        !event.filename &&
        event.lineno === 0 &&
        event.colno === 0
      ) {
        return;
      }

      event.preventDefault(); // Prevent default browser error handling

      logError(event.error, {
        component: "GlobalErrorHandler",
        action: "window.onerror",
        metadata: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault(); // Prevent default browser warning

      logError(event.reason, {
        component: "GlobalErrorHandler",
        action: "unhandledrejection",
        metadata: {
          reason: String(event.reason),
        },
      });
    };

    // Register listeners
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  // This component doesn't render anything
  return null;
}
