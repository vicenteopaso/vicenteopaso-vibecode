import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageToggle } from "../../app/components/LanguageToggle";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: vi.fn(() => ({ lang: "en" })),
}));

describe("LanguageToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Rendering", () => {
    it("should render toggle button with correct locale label", () => {
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("ES");
    });

    it("should have proper button type attribute", () => {
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("should apply correct CSS classes", () => {
      render(<LanguageToggle />);

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
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label");

      const ariaLabel = button.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
      expect(typeof ariaLabel).toBe("string");
    });

    it("should have title attribute for tooltip", () => {
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title");

      const title = button.getAttribute("title");
      expect(title).toBeTruthy();
    });

    it("should be keyboard accessible", () => {
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).not.toHaveAttribute("disabled");

      // Button should be focusable
      button.focus();
      expect(button).toHaveFocus();
    });

    it("should have focus-visible styles", () => {
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:outline-none");
      expect(button).toHaveClass("focus-visible:ring-2");
      expect(button).toHaveClass("focus-visible:ring-sky-400");
    });
  });

  describe("User interaction", () => {
    it("should call handler when button is clicked", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should show message with correct text when clicked", () => {
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      // Message should appear immediately
      const message = screen.getByRole("status");
      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent("Language switching to ES");
      expect(message).toHaveTextContent("Task 2");
    });

    it("should hide message after timeout", () => {
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      // Message should appear
      expect(screen.getByRole("status")).toBeInTheDocument();

      // Fast-forward time by 4 seconds with act
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      // Message should disappear
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("should log navigation intent when clicked", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Language toggle clicked"),
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("/es"));

      consoleSpy.mockRestore();
    });

    it("should handle multiple clicks", () => {
      render(<LanguageToggle />);

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
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      const text = button.textContent;

      expect(text).toBe("ES");
      expect(text).toMatch(/^[A-Z]{2}$/);
    });

    it("should show ES when current locale is en", async () => {
      const { useParams } = await import("next/navigation");
      vi.mocked(useParams).mockReturnValue({ lang: "en" });

      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("ES");
    });
  });

  describe("Hover and visual states", () => {
    it("should have hover styles", () => {
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:border-[color:var(--link-hover)]");
      expect(button).toHaveClass("hover:text-[color:var(--link-hover)]");
    });

    it("should have transition styles", () => {
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("transition-colors");
    });

    it("should have proper shadow styling", () => {
      render(<LanguageToggle />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("shadow-sm");
    });
  });
});
