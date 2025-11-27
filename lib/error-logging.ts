/**
 * Error logging utilities for client and server-side error tracking.
 *
 * This module provides a centralized way to log errors with context.
 * In production, these logs are captured by Vercel's logging infrastructure.
 */

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

  // Log to console (captured by Vercel in production)
  // eslint-disable-next-line no-console
  console.error("Application Error:", JSON.stringify(logEntry, null, 2));
}

/**
 * Log a warning with optional context information.
 *
 * @param message - The warning message
 * @param context - Additional context about the warning
 */
export function logWarning(message: string, context?: ErrorContext): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "warning",
    message,
    ...context,
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
