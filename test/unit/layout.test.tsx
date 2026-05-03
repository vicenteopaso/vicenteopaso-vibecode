import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/font/google", () => ({
  Instrument_Serif: () => ({ variable: "font-instrument-serif" }),
  JetBrains_Mono: () => ({ variable: "font-jetbrains-mono" }),
}));

vi.mock("../../app/components/AnalyticsWrapper", () => ({
  AnalyticsWrapper: () => <div data-testid="analytics" />,
}));

vi.mock("../../app/components/BrutalistNav", () => ({
  BrutalistNav: () => <header data-testid="header" />,
}));

vi.mock("../../app/components/BrutalistFooter", () => ({
  BrutalistFooter: () => <footer data-testid="footer" />,
}));

vi.mock("../../app/components/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

vi.mock("../../app/components/LocaleProvider", () => ({
  LocaleProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="locale-provider">{children}</div>
  ),
}));

vi.mock("../../app/components/GlobalErrorHandler", () => ({
  GlobalErrorHandler: () => <div data-testid="global-error-handler" />,
}));

vi.mock("../../app/components/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock("../../app/components/SeoJsonLd", () => ({
  SeoJsonLd: () => <div data-testid="seo-jsonld" />,
}));

vi.mock("../../app/components/WebMcpInit", () => ({
  WebMcpInit: () => <div data-testid="webmcp-init" />,
}));

import RootLayout from "../../app/layout";

describe("RootLayout", () => {
  it("wraps children in main content area and includes shell components", () => {
    // Suppress hydration warning for <html> element in test environment
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <RootLayout>
        <div data-testid="child">Hello world</div>
      </RootLayout>,
    );

    consoleSpy.mockRestore();

    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("locale-provider")).toBeInTheDocument();
    expect(screen.getByTestId("global-error-handler")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    expect(screen.getByTestId("seo-jsonld")).toBeInTheDocument();
    expect(screen.getByTestId("webmcp-init")).toBeInTheDocument();
    expect(screen.getByTestId("analytics")).toBeInTheDocument();

    const main = document.querySelector("main");
    expect(main).not.toBeNull();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
