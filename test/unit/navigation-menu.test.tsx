import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NavigationMenu } from "../../app/components/NavigationMenu";

// JSDOM does not implement matchMedia; mock it for next-themes.
if (!window.matchMedia) {
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

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

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

let mockTheme: "light" | "dark" | undefined = "dark";
const setTheme = vi.fn();

vi.mock("next-themes", async () => {
  const actual = await vi.importActual("next-themes");
  return {
    ...actual,
    useTheme: () => ({ resolvedTheme: mockTheme, setTheme }),
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
    mockTheme = "dark";
    setTheme.mockClear();
  });

  it("renders CV link and Contact button", () => {
    renderWithTheme();

    expect(screen.getByRole("link", { name: "CV" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Contact" })).toBeInTheDocument();
  });

  it("renders theme toggle button with accessible label", () => {
    renderWithTheme();

    expect(
      screen.getByRole("button", { name: "Toggle color theme" }),
    ).toBeInTheDocument();
  });

  it("marks CV link as current when on /cv", () => {
    vi.mocked(usePathname).mockReturnValue("/cv");

    renderWithTheme();

    const cvLink = screen.getByRole("link", { name: "CV" });
    expect(cvLink).toHaveAttribute("aria-current", "page");
  });

  it("toggles theme from dark to light", () => {
    mockTheme = "dark";

    renderWithTheme();

    const toggle = screen.getByRole("button", { name: "Toggle color theme" });
    fireEvent.click(toggle);

    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("toggles theme from light to dark", () => {
    mockTheme = "light";

    renderWithTheme();

    const toggle = screen.getByRole("button", { name: "Toggle color theme" });
    fireEvent.click(toggle);

    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
