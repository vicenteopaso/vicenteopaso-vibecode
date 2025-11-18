import type React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NavigationMenu } from "../../app/components/NavigationMenu";

// JSDOM does not implement matchMedia; mock it for next-themes.
if (!window.matchMedia) {
  // @ts-expect-error - we are defining it for the test environment only
  window.matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

vi.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({
      href,
      children,
      ...rest
    }: {
      href: string;
      children: React.ReactNode;
    }) => (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a href={href} {...rest}>
        {children}
      </a>
    ),
  };
});

vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: (props: { alt: string; src: string }) => {
      // Simple img shim for tests
      // eslint-disable-next-line @next/next/no-img-element
      return <img alt={props.alt} src={props.src} />;
    },
  };
});

vi.mock("next-themes", async () => {
  const actual = await vi.importActual("next-themes");
  return {
    ...actual,
    useTheme: () => ({ resolvedTheme: "dark", setTheme: vi.fn() }),
  };
});

function renderWithTheme() {
  return render(
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <NavigationMenu />
    </NextThemesProvider>,
  );
}

describe("NavigationMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders CV link and Contact button", () => {
    renderWithTheme();

    expect(
      screen.getByRole("link", { name: "CV", exact: true }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Contact", exact: true }),
    ).toBeInTheDocument();
  });

  it("renders theme toggle button with accessible label", () => {
    renderWithTheme();

    expect(
      screen.getByRole("button", { name: "Toggle color theme" }),
    ).toBeInTheDocument();
  });
});
