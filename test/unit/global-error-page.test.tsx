import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import * as Sentry from "@sentry/nextjs";

import GlobalError from "../../app/global-error";

describe("GlobalError page", () => {
  it("reports the error to Sentry on mount", () => {
    const error = new Error("Global render failure");
    const reset = vi.fn();

    // Suppress hydration warning for <html> element in test environment
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<GlobalError error={error} reset={reset} />);

    consoleSpy.mockRestore();

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it("renders user-friendly title and message", () => {
    const error = new Error("Global render failure");

    render(<GlobalError error={error} reset={vi.fn()} />);

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /An unexpected error occurred while rendering this page\. Please try again\./i,
      ),
    ).toBeInTheDocument();
  });

  it("calls reset when the Try again button is clicked", () => {
    const error = new Error("Global render failure");
    const reset = vi.fn();

    render(<GlobalError error={error} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: /Try again/i }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("reloads the page when Reload is clicked", () => {
    const error = new Error("Global render failure");
    const reset = vi.fn();

    const originalLocation = window.location;
    const reloadMock = vi.fn();

    // Override window.location with a test-friendly object that has a
    // configurable reload method, without using `any`.
    const win = window as unknown as { location?: Location };
    delete win.location;
    Object.defineProperty(win, "location", {
      value: { ...originalLocation, reload: reloadMock },
      configurable: true,
    });

    render(<GlobalError error={error} reset={reset} />);

    fireEvent.click(screen.getByText(/Reload/i));

    expect(reloadMock).toHaveBeenCalledTimes(1);

    // Restore original location to avoid side effects on other tests
    Object.defineProperty(win, "location", {
      value: originalLocation,
      configurable: true,
    });
  });
});
