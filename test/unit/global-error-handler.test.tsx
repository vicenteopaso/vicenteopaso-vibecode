import { render } from "@testing-library/react";
import React from "react";
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

    window.dispatchEvent(errorEvent);

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

    window.dispatchEvent(rejectionEvent);

    // Clean up by catching the promise to avoid test pollution
    await rejectionPromise.catch(() => {});

    expect(logError).toHaveBeenCalledWith(rejectionReason, {
      component: "GlobalErrorHandler",
      action: "unhandledrejection",
      metadata: {
        reason: rejectionReason,
      },
    });
  });

  it("does not render any visible content", () => {
    const { container } = render(<GlobalErrorHandler />);
    expect(container.firstChild).toBeNull();
  });
});
