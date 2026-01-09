import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GlobalErrorHandler } from "../../app/components/GlobalErrorHandler";

// Mock the error logging module
vi.mock("../../lib/error-logging", () => ({
  logError: vi.fn(),
}));

import { logError } from "../../lib/error-logging";

describe("GlobalErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers error event listener on mount", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    render(<GlobalErrorHandler />);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "error",
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "unhandledrejection",
      expect.any(Function),
    );
  });

  it("removes error event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<GlobalErrorHandler />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "error",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "unhandledrejection",
      expect.any(Function),
    );
  });

  it("logs uncaught errors via window.onerror", () => {
    render(<GlobalErrorHandler />);

    const testError = new Error("Uncaught error");
    const errorEvent = new ErrorEvent("error", {
      error: testError,
      message: "Uncaught error",
      filename: "test.js",
      lineno: 10,
      colno: 5,
    });

    const preventDefaultSpy = vi.spyOn(errorEvent, "preventDefault");

    window.dispatchEvent(errorEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(testError, {
      component: "GlobalErrorHandler",
      action: "window.onerror",
      metadata: {
        message: "Uncaught error",
        filename: "test.js",
        lineno: 10,
        colno: 5,
      },
    });
  });

  it("logs errors with missing metadata fields", () => {
    render(<GlobalErrorHandler />);

    const testError = new Error("Error without location");
    // ErrorEvent converts undefined to default values (0 for numbers, "" for strings)
    const errorEvent = new ErrorEvent("error", {
      error: testError,
      message: "Error without location",
      filename: "",
      lineno: 0,
      colno: 0,
    });

    window.dispatchEvent(errorEvent);

    expect(logError).toHaveBeenCalledWith(testError, {
      component: "GlobalErrorHandler",
      action: "window.onerror",
      metadata: {
        message: "Error without location",
        filename: "",
        lineno: 0,
        colno: 0,
      },
    });
  });

  it("logs errors when error object is null", () => {
    render(<GlobalErrorHandler />);

    const errorEvent = new ErrorEvent("error", {
      error: null,
      message: "Error with null error object",
      filename: "test.js",
      lineno: 10,
      colno: 5,
    });

    window.dispatchEvent(errorEvent);

    expect(logError).toHaveBeenCalledWith(null, {
      component: "GlobalErrorHandler",
      action: "window.onerror",
      metadata: {
        message: "Error with null error object",
        filename: "test.js",
        lineno: 10,
        colno: 5,
      },
    });
  });

  it("ignores cross-origin script errors", () => {
    render(<GlobalErrorHandler />);

    const errorEvent = new ErrorEvent("error", {
      error: null,
      message: "Script error.",
      filename: "",
      lineno: 0,
      colno: 0,
    });

    window.dispatchEvent(errorEvent);

    expect(logError).not.toHaveBeenCalled();
  });

  it("does not ignore script errors with filename", () => {
    render(<GlobalErrorHandler />);

    const testError = new Error("Script error");
    const errorEvent = new ErrorEvent("error", {
      error: testError,
      message: "Script error.",
      filename: "test.js",
      lineno: 0,
      colno: 0,
    });

    window.dispatchEvent(errorEvent);

    expect(logError).toHaveBeenCalled();
  });

  it("does not ignore script errors with line number", () => {
    render(<GlobalErrorHandler />);

    const testError = new Error("Script error");
    const errorEvent = new ErrorEvent("error", {
      error: testError,
      message: "Script error.",
      filename: "",
      lineno: 10,
      colno: 0,
    });

    window.dispatchEvent(errorEvent);

    expect(logError).toHaveBeenCalled();
  });

  it("does not ignore script errors with column number", () => {
    render(<GlobalErrorHandler />);

    const testError = new Error("Script error");
    const errorEvent = new ErrorEvent("error", {
      error: testError,
      message: "Script error.",
      filename: "",
      lineno: 0,
      colno: 5,
    });

    window.dispatchEvent(errorEvent);

    expect(logError).toHaveBeenCalled();
  });

  it("logs unhandled promise rejections", async () => {
    render(<GlobalErrorHandler />);

    const rejectionReason = "Promise rejection reason";

    // Create a promise rejection that will be caught by our handler
    const rejectionPromise = Promise.reject(rejectionReason);

    // Dispatch the event manually instead of letting it bubble
    const rejectionEvent = new PromiseRejectionEvent("unhandledrejection", {
      promise: rejectionPromise,
      reason: rejectionReason,
    });

    const preventDefaultSpy = vi.spyOn(rejectionEvent, "preventDefault");

    window.dispatchEvent(rejectionEvent);

    // Clean up by catching the promise to avoid test pollution
    await rejectionPromise.catch(() => {});

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(rejectionReason, {
      component: "GlobalErrorHandler",
      action: "unhandledrejection",
      metadata: {
        reason: rejectionReason,
      },
    });
  });

  it("logs promise rejections with Error object as reason", async () => {
    render(<GlobalErrorHandler />);

    const rejectionError = new Error("Promise rejection error");
    const rejectionPromise = Promise.reject(rejectionError);

    const rejectionEvent = new PromiseRejectionEvent("unhandledrejection", {
      promise: rejectionPromise,
      reason: rejectionError,
    });

    window.dispatchEvent(rejectionEvent);

    await rejectionPromise.catch(() => {});

    expect(logError).toHaveBeenCalledWith(rejectionError, {
      component: "GlobalErrorHandler",
      action: "unhandledrejection",
      metadata: {
        reason: "Error: Promise rejection error",
      },
    });
  });

  it("logs promise rejections with null reason", async () => {
    render(<GlobalErrorHandler />);

    const rejectionPromise = Promise.reject(null);

    const rejectionEvent = new PromiseRejectionEvent("unhandledrejection", {
      promise: rejectionPromise,
      reason: null,
    });

    window.dispatchEvent(rejectionEvent);

    await rejectionPromise.catch(() => {});

    expect(logError).toHaveBeenCalledWith(null, {
      component: "GlobalErrorHandler",
      action: "unhandledrejection",
      metadata: {
        reason: "null",
      },
    });
  });

  it("logs promise rejections with number as reason", async () => {
    render(<GlobalErrorHandler />);

    const rejectionReason = 404;
    const rejectionPromise = Promise.reject(rejectionReason);

    const rejectionEvent = new PromiseRejectionEvent("unhandledrejection", {
      promise: rejectionPromise,
      reason: rejectionReason,
    });

    window.dispatchEvent(rejectionEvent);

    await rejectionPromise.catch(() => {});

    expect(logError).toHaveBeenCalledWith(404, {
      component: "GlobalErrorHandler",
      action: "unhandledrejection",
      metadata: {
        reason: "404",
      },
    });
  });

  it("logs promise rejections with object as reason", async () => {
    render(<GlobalErrorHandler />);

    const rejectionReason = { code: "ERR_FAILED", message: "Request failed" };
    const rejectionPromise = Promise.reject(rejectionReason);

    const rejectionEvent = new PromiseRejectionEvent("unhandledrejection", {
      promise: rejectionPromise,
      reason: rejectionReason,
    });

    window.dispatchEvent(rejectionEvent);

    await rejectionPromise.catch(() => {});

    expect(logError).toHaveBeenCalledWith(rejectionReason, {
      component: "GlobalErrorHandler",
      action: "unhandledrejection",
      metadata: {
        reason: "[object Object]",
      },
    });
  });

  it("does not render any visible content", () => {
    const { container } = render(<GlobalErrorHandler />);
    expect(container.firstChild).toBeNull();
  });
});
