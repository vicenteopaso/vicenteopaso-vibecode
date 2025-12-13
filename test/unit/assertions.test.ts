import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { assertNever, invariant } from "../../lib/assertions";
import * as errorLogging from "../../lib/error-logging";

describe("assertions", () => {
  let logErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logErrorSpy = vi.spyOn(errorLogging, "logError").mockImplementation(() => {});
  });

  afterEach(() => {
    logErrorSpy.mockRestore();
  });

  describe("assertNever", () => {
    it("throws an error when called", () => {
      const unexpectedValue = "unexpected" as never;

      expect(() => assertNever(unexpectedValue)).toThrow(
        "Unexpected value reached assertNever",
      );
    });

    it("includes the unexpected value in the error message", () => {
      const unexpectedValue = { type: "unknown" } as never;

      expect(() => assertNever(unexpectedValue)).toThrow(
        JSON.stringify({ type: "unknown" }),
      );
    });

    it("uses custom message when provided", () => {
      const unexpectedValue = "value" as never;
      const customMessage = "Custom exhaustiveness error";

      expect(() => assertNever(unexpectedValue, customMessage)).toThrow(
        customMessage,
      );
    });

    it("logs the error with context", () => {
      const unexpectedValue = "test" as never;

      try {
        assertNever(unexpectedValue);
      } catch {
        // Expected to throw
      }

      expect(logErrorSpy).toHaveBeenCalledTimes(1);
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: "assertions",
          action: "assertNever",
          metadata: { value: unexpectedValue },
        }),
      );
    });

    it("works in exhaustiveness checking pattern", () => {
      type Status = "idle" | "loading" | "success";

      function handleStatus(status: Status): string {
        switch (status) {
          case "idle":
            return "Not started";
          case "loading":
            return "In progress";
          case "success":
            return "Complete";
          default:
            return assertNever(status);
        }
      }

      expect(handleStatus("idle")).toBe("Not started");
      expect(handleStatus("loading")).toBe("In progress");
      expect(handleStatus("success")).toBe("Complete");

      // If Status type is extended but switch isn't, this would catch it
      const unexpectedStatus = "error" as Status;
      expect(() => handleStatus(unexpectedStatus)).toThrow();
    });
  });

  describe("invariant", () => {
    it("does not throw when condition is true", () => {
      expect(() => invariant(true, "Should not throw")).not.toThrow();
      expect(() => invariant(1 === 1, "Math works")).not.toThrow();
      expect(() =>
        invariant("hello".length > 0, "String is not empty"),
      ).not.toThrow();
    });

    it("throws an error when condition is false", () => {
      expect(() => invariant(false, "Condition failed")).toThrow(
        "Invariant violation: Condition failed",
      );
    });

    it("includes the message in the error", () => {
      const message = "User must be authenticated";

      expect(() => invariant(false, message)).toThrow(
        `Invariant violation: ${message}`,
      );
    });

    it("logs the error with context when condition fails", () => {
      const message = "Value must be positive";

      try {
        invariant(false, message);
      } catch {
        // Expected to throw
      }

      expect(logErrorSpy).toHaveBeenCalledTimes(1);
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: "assertions",
          action: "invariant",
          metadata: { message },
        }),
      );
    });

    it("does not log when condition is true", () => {
      invariant(true, "This passes");

      expect(logErrorSpy).not.toHaveBeenCalled();
    });

    it("narrows types with asserts condition", () => {
      function processValue(value: string | null) {
        invariant(value !== null, "Value must not be null");
        // TypeScript now knows value is string, not string | null
        return value.toUpperCase();
      }

      expect(processValue("hello")).toBe("HELLO");
      expect(() => processValue(null)).toThrow("Value must not be null");
    });

    it("can check preconditions for functions", () => {
      function divide(a: number, b: number): number {
        invariant(b !== 0, "Cannot divide by zero");
        return a / b;
      }

      expect(divide(10, 2)).toBe(5);
      expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
    });

    it("can validate business logic constraints", () => {
      interface Product {
        price: number;
        discount: number;
      }

      function applyDiscount(product: Product): number {
        invariant(product.price >= 0, "Price must be non-negative");
        invariant(
          product.discount >= 0 && product.discount <= 100,
          "Discount must be between 0 and 100",
        );

        return product.price * (1 - product.discount / 100);
      }

      expect(applyDiscount({ price: 100, discount: 20 })).toBe(80);
      expect(() => applyDiscount({ price: -10, discount: 20 })).toThrow(
        "Price must be non-negative",
      );
      expect(() => applyDiscount({ price: 100, discount: 150 })).toThrow(
        "Discount must be between 0 and 100",
      );
    });
  });
});
