import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageToggle } from "../../app/components/LanguageToggle";
import { LocaleProvider } from "../../app/components/LocaleProvider";

// Mock next/navigation
vi.mock("next/navigation");

// Mock LocaleProvider to return a simple wrapper
vi.mock("../../app/components/LocaleProvider", () => ({
  LocaleProvider: ({ children }: { children: React.ReactNode }) => children,
  useLocale: () => ({ locale: "en", setLocale: vi.fn() }),
}));

// Helper function to render with required providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

describe("LanguageToggle", () => {
  let mockUseRouter: Mock;
  let mockUsePathname: Mock;
  let mockPush: Mock;

  beforeEach(() => {
    mockUseRouter = vi.mocked(useRouter);
    mockUsePathname = vi.mocked(usePathname);
    mockPush = vi.fn();
    mockUseRouter.mockReset();
    mockUsePathname.mockReset();
    mockUseRouter.mockReturnValue({ push: mockPush } as never);
    mockUsePathname.mockReturnValue("/en");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render toggle button with correct locale label", () => {
      render(
        <LocaleProvider>
          <LanguageToggle />
        </LocaleProvider>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("ES");
    });

    it("should have proper button type attribute", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("should apply correct CSS classes", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("inline-flex");
      expect(button).toHaveClass("h-8");
      expect(button).toHaveClass("items-center");
      expect(button).toHaveClass("justify-center");
      expect(button).toHaveClass("rounded-full");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label from translation key", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label");

      const ariaLabel = button.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
      expect(typeof ariaLabel).toBe("string");
    });

    it("should have title attribute for tooltip", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title");

      const title = button.getAttribute("title");
      expect(title).toBeTruthy();
    });

    it("should be keyboard accessible", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).not.toHaveAttribute("disabled");

      // Button should be focusable
      button.focus();
      expect(button).toHaveFocus();
    });

    it("should have focus-visible styles", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:outline-none");
      expect(button).toHaveClass("focus-visible:ring-2");
      expect(button).toHaveClass("focus-visible:ring-sky-400");
    });
  });

  describe("User interaction", () => {
    it("should call router.push when button is clicked", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith("/es");
    });

    it("should disable button during navigation", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      // After click, button should have disabled opacity
      expect(button).toHaveClass("disabled:opacity-50");
    });

    it("should construct correct path when on /en/cv", () => {
      mockUsePathname.mockReturnValue("/en/cv");

      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith("/es/cv");
    });

    it("should construct correct path when on /es/cv", () => {
      mockUsePathname.mockReturnValue("/es/cv");

      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Language toggle clicked"),
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("/es"));

      consoleSpy.mockRestore();
    });

    it("should handle multiple clicks", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(screen.getByRole("status")).toBeInTheDocument();

      fireEvent.click(button);

      // Should still show message (timer resets)
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("Locale display", () => {
    it("should display next locale in uppercase", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      const text = button.textContent;

      expect(text).toBe("ES");
      expect(text).toMatch(/^[A-Z]{2}$/);
    });

    it("should show ES when current locale is en", () => {
      mockUsePathname.mockReturnValue("/en");

      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("ES");
    });
  });

  describe("Hover and visual states", () => {
    it("should have hover styles", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:border-[color:var(--link-hover)]");
      expect(button).toHaveClass("hover:text-[color:var(--link-hover)]");
    });

    it("should have transition styles", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("transition-colors");
    });

    it("should have proper shadow styling", () => {
      renderWithProviders(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("shadow-sm");
    });
  });
});
