/**
 * Error logging utilities for client and server-side error tracking.
 *
 * This module provides a centralized way to log errors with context.
 * In production, these logs are captured by Vercel's logging infrastructure
 * and, when configured, forwarded to Sentry for aggregation and alerting.
 */

import * as Sentry from "@sentry/nextjs";

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an error with optional context information.
 *
 * @param error - The error to log
 * @param context - Additional context about where/when the error occurred
 */
export function logError(error: Error | unknown, context?: ErrorContext): void {
  const errorMessage =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Structure the log entry for better searchability in Vercel logs
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "error",
    message: errorMessage,
    stack: errorStack,
    ...context,
  };

  // Forward to Sentry for aggregation, grouping, and alerts (no-op if DSN/env not set)
  Sentry.withScope((scope) => {
    if (context?.component) {
      scope.setTag("component", context.component);
    }
    if (context?.action) {
      scope.setTag("action", context.action);
    }
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    if (context?.metadata) {
      scope.setContext("metadata", context.metadata as Record<string, unknown>);
    }
    scope.setExtra("timestamp", logEntry.timestamp);

    Sentry.captureException(
      error instanceof Error ? error : new Error(errorMessage),
    );
  });

  // Log to console (captured by Vercel in production)
  // eslint-disable-next-line no-console
  console.error("Application Error:", JSON.stringify(logEntry, null, 2));
}

/**
 * Log a warning with optional context information.
 *
 * @param message - The warning message
 * @param context - Additional context about where/when the warning occurred
 */
export function logWarning(message: string, context?: ErrorContext): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "warning",
    message,
    ...(context?.component && { component: context.component }),
    ...(context?.action && { action: context.action }),
    ...(context?.userId && { userId: context.userId }),
    ...(context?.metadata && { metadata: context.metadata }),
  };

  // eslint-disable-next-line no-console
  console.warn("Application Warning:", JSON.stringify(logEntry, null, 2));
}

/**
 * Extract error message from an unknown error value.
 *
 * @param error - The error value (could be Error, string, or unknown)
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}
