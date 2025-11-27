import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getErrorMessage, logError, logWarning } from "../../lib/error-logging";

describe("error-logging", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe("logError", () => {
    it("logs Error instances with stack trace", () => {
      const error = new Error("Test error message");
      logError(error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Application Error:",
        expect.stringContaining("Test error message"),
      );

      const logCall = consoleErrorSpy.mock.calls[0][1] as string;
      const logEntry = JSON.parse(logCall);

      expect(logEntry).toMatchObject({
        level: "error",
        message: "Test error message",
      });
      expect(logEntry.stack).toBeDefined();
      expect(logEntry.timestamp).toBeDefined();
    });

    it("logs non-Error values as strings", () => {
      logError("Simple string error");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logCall = consoleErrorSpy.mock.calls[0][1] as string;
      const logEntry = JSON.parse(logCall);

      expect(logEntry).toMatchObject({
        level: "error",
        message: "Simple string error",
      });
      expect(logEntry.stack).toBeUndefined();
    });

    it("includes context information in log entry", () => {
      const error = new Error("Context test");
      const context = {
        component: "TestComponent",
        action: "testAction",
        userId: "user123",
        metadata: { key: "value" },
      };

      logError(error, context);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logCall = consoleErrorSpy.mock.calls[0][1] as string;
      const logEntry = JSON.parse(logCall);

      expect(logEntry).toMatchObject({
        level: "error",
        message: "Context test",
        component: "TestComponent",
        action: "testAction",
        userId: "user123",
        metadata: { key: "value" },
      });
    });

    it("handles null/undefined errors gracefully", () => {
      logError(null);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logCall = consoleErrorSpy.mock.calls[0][1] as string;
      const logEntry = JSON.parse(logCall);

      expect(logEntry.message).toBe("Unknown error");
    });
  });

  describe("logWarning", () => {
    it("logs warning messages with context", () => {
      const context = {
        component: "WarningComponent",
        action: "warningAction",
      };

      logWarning("Test warning message", context);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Application Warning:",
        expect.stringContaining("Test warning message"),
      );

      const logCall = consoleWarnSpy.mock.calls[0][1] as string;
      const logEntry = JSON.parse(logCall);

      expect(logEntry).toMatchObject({
        level: "warning",
        message: "Test warning message",
        component: "WarningComponent",
        action: "warningAction",
      });
      expect(logEntry.timestamp).toBeDefined();
    });

    it("logs warnings without context", () => {
      logWarning("Simple warning");

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const logCall = consoleWarnSpy.mock.calls[0][1] as string;
      const logEntry = JSON.parse(logCall);

      expect(logEntry).toMatchObject({
        level: "warning",
        message: "Simple warning",
      });
    });
  });

  describe("getErrorMessage", () => {
    it("extracts message from Error instances", () => {
      const error = new Error("Error message");
      expect(getErrorMessage(error)).toBe("Error message");
    });

    it("returns string errors as-is", () => {
      expect(getErrorMessage("String error")).toBe("String error");
    });

    it("returns default message for unknown error types", () => {
      expect(getErrorMessage(null)).toBe("An unexpected error occurred");
      expect(getErrorMessage(undefined)).toBe("An unexpected error occurred");
      expect(getErrorMessage(123)).toBe("An unexpected error occurred");
      expect(getErrorMessage({})).toBe("An unexpected error occurred");
    });
  });
});
