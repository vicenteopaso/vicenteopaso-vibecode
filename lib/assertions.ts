/**
 * Runtime assertions and guardrails to prevent silent failures.
 *
 * This module provides TypeScript-friendly assertion helpers that enforce
 * expected invariants and catch unreachable code paths at runtime.
 */

import { logError } from "./error-logging";

/**
 * Assert that a code path is unreachable (exhaustiveness check).
 *
 * This is useful in switch statements or conditional branches where TypeScript's
 * type narrowing should have eliminated all possibilities. If this function is
 * called, it means there's a runtime value that TypeScript didn't account for.
 *
 * @param value - The value that should be of type `never`
 * @param message - Optional custom error message
 * @throws {Error} Always throws an error when called
 *
 * @example
 * ```typescript
 * type Status = "pending" | "success" | "error";
 *
 * function handleStatus(status: Status) {
 *   switch (status) {
 *     case "pending":
 *       return "Loading...";
 *     case "success":
 *       return "Done!";
 *     case "error":
 *       return "Failed";
 *     default:
 *       // If Status type is extended but switch isn't updated, this will catch it
 *       return assertNever(status);
 *   }
 * }
 * ```
 */
export function assertNever(value: never, message?: string): never {
  const errorMessage =
    message ?? `Unexpected value reached assertNever: ${JSON.stringify(value)}`;
  const error = new Error(errorMessage);

  // Log with context for observability
  logError(error, {
    component: "assertions",
    action: "assertNever",
    metadata: { value },
  });

  throw error;
}

/**
 * Assert that a condition is true, throwing an error if it's false.
 *
 * This enforces critical invariants and preconditions in your code. Unlike
 * console.assert, this will always throw in production, ensuring bugs are
 * caught early rather than causing silent failures downstream.
 *
 * @param condition - The condition that must be true
 * @param message - Error message to throw if condition is false
 * @throws {Error} Throws an error if condition is false
 *
 * @example
 * ```typescript
 * function processUser(user: User | null) {
 *   invariant(user !== null, "User must be logged in to process");
 *   // TypeScript now knows user is non-null
 *   return user.name;
 * }
 *
 * function calculateDiscount(price: number, percentage: number) {
 *   invariant(price >= 0, "Price must be non-negative");
 *   invariant(percentage >= 0 && percentage <= 100, "Percentage must be 0-100");
 *   return price * (percentage / 100);
 * }
 * ```
 */
export function invariant(
  condition: boolean,
  message: string,
): asserts condition {
  if (!condition) {
    const error = new Error(`Invariant violation: ${message}`);

    // Log with context for observability
    logError(error, {
      component: "assertions",
      action: "invariant",
      metadata: { message },
    });

    throw error;
  }
}
