import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@vercel/analytics/next", () => ({
  Analytics: () => <div data-testid="analytics" />,
}));

vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => <div data-testid="speed-insights" />,
}));

vi.mock("../../app/components/Header", () => ({
  Header: () => <header data-testid="header" />,
}));

vi.mock("../../app/components/Footer", () => ({
  Footer: () => <footer data-testid="footer" />,
}));

vi.mock("../../app/components/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

vi.mock("../../app/components/SeoJsonLd", () => ({
  SeoJsonLd: () => <div data-testid="seo-jsonld" />,
}));

import RootLayout from "../../app/layout";

describe("RootLayout", () => {
  it("wraps children in main content area and includes shell components", () => {
    render(
      <RootLayout>
        <div data-testid="child">Hello world</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("seo-jsonld")).toBeInTheDocument();
    expect(screen.getByTestId("analytics")).toBeInTheDocument();
    expect(screen.getByTestId("speed-insights")).toBeInTheDocument();

    const main = document.querySelector("main");
    expect(main).not.toBeNull();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
