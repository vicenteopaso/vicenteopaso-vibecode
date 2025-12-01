import { render } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AnalyticsWrapper } from "../../app/components/AnalyticsWrapper";

// Mock the Vercel analytics packages
vi.mock("@vercel/analytics/next", () => ({
  Analytics: () => <div data-testid="analytics">Analytics</div>,
}));

vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => <div data-testid="speed-insights">SpeedInsights</div>,
}));

describe("AnalyticsWrapper", () => {
  beforeEach(() => {
    // Reset navigator mock before each test
    Object.defineProperty(window, "navigator", {
      value: {
        userAgent: "Mozilla/5.0",
        webdriver: false,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders analytics components in normal browser", () => {
    const { getByTestId } = render(<AnalyticsWrapper />);

    expect(getByTestId("analytics")).toBeInTheDocument();
    expect(getByTestId("speed-insights")).toBeInTheDocument();
  });

  it("does not render in headless Chrome", () => {
    Object.defineProperty(window, "navigator", {
      value: {
        userAgent: "HeadlessChrome/91.0.4472.124",
        webdriver: false,
      },
      writable: true,
      configurable: true,
    });

    const { queryByTestId } = render(<AnalyticsWrapper />);

    expect(queryByTestId("analytics")).not.toBeInTheDocument();
    expect(queryByTestId("speed-insights")).not.toBeInTheDocument();
  });

  it("does not render when webdriver is detected", () => {
    Object.defineProperty(window, "navigator", {
      value: {
        userAgent: "Mozilla/5.0",
        webdriver: true,
      },
      writable: true,
      configurable: true,
    });

    const { queryByTestId } = render(<AnalyticsWrapper />);

    expect(queryByTestId("analytics")).not.toBeInTheDocument();
    expect(queryByTestId("speed-insights")).not.toBeInTheDocument();
  });

  it("does not render when Playwright flag is set", () => {
    (window as Window & { __PLAYWRIGHT__?: boolean }).__PLAYWRIGHT__ = true;

    const { queryByTestId } = render(<AnalyticsWrapper />);

    expect(queryByTestId("analytics")).not.toBeInTheDocument();
    expect(queryByTestId("speed-insights")).not.toBeInTheDocument();

    // Clean up
    delete (window as Window & { __PLAYWRIGHT__?: boolean }).__PLAYWRIGHT__;
  });
});
