import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { ContactInfo } from "../../app/components/ContactInfo";

describe("ContactInfo", () => {
  describe("inline variant", () => {
    it("renders contact information with inline styling", () => {
      render(<ContactInfo variant="inline" />);

      expect(screen.getByText(/Málaga, Spain/i)).toBeInTheDocument();
      expect(screen.getByText(/\+34 684 005 262/i)).toBeInTheDocument();
      expect(screen.getByText(/vicente@opa.so/i)).toBeInTheDocument();
    });

    it("has correct links", () => {
      render(<ContactInfo variant="inline" />);

      const locationLink = screen.getByRole("link", { name: /Málaga, Spain/i });
      expect(locationLink).toHaveAttribute(
        "href",
        "https://www.google.es/maps/@36.5965239,-4.5176446,16z",
      );
      expect(locationLink).toHaveAttribute("target", "_blank");
      expect(locationLink).toHaveAttribute("rel", "noreferrer");

      const phoneLink = screen.getByRole("link", {
        name: /\+34 684 005 262/i,
      });
      expect(phoneLink).toHaveAttribute("href", "tel:+34684005262");

      const emailLink = screen.getByRole("link", { name: /vicente@opa.so/i });
      expect(emailLink).toHaveAttribute("href", "mailto:vicente@opa.so");
    });

    it("uses default variant when none specified", () => {
      const { container } = render(<ContactInfo />);
      const div = container.firstChild as HTMLElement;

      expect(div).toHaveClass("mt-2");
      expect(div).toHaveClass("text-sm");
      expect(div).toHaveClass("text-[color:var(--text-primary)]");
    });
  });

  describe("dialog variant", () => {
    it("renders contact information with dialog styling", () => {
      render(<ContactInfo variant="dialog" />);

      expect(screen.getByText(/Málaga, Spain/i)).toBeInTheDocument();
      expect(screen.getByText(/\+34 684 005 262/i)).toBeInTheDocument();
      expect(screen.getByText(/vicente@opa.so/i)).toBeInTheDocument();
    });

    it("applies dialog-specific styling", () => {
      const { container } = render(<ContactInfo variant="dialog" />);
      const div = container.firstChild as HTMLElement;

      expect(div).toHaveClass("mt-4");
      expect(div).toHaveClass("border-t");
      expect(div).toHaveClass("border-[color:var(--border-subtle)]");
      expect(div).toHaveClass("pt-3");
      expect(div).toHaveClass("text-sm");
      expect(div).toHaveClass("text-[color:var(--text-muted)]");
    });
  });

  describe("accessibility", () => {
    it("hides decorative separators from screen readers", () => {
      const { container } = render(<ContactInfo />);
      const separators = container.querySelectorAll('[aria-hidden="true"]');

      expect(separators.length).toBe(2);
      separators.forEach((separator) => {
        expect(separator).toHaveAttribute("aria-hidden", "true");
      });
    });

    it("all links are keyboard accessible", () => {
      render(<ContactInfo />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);

      links.forEach((link) => {
        // Links should not have tabindex=-1 (should be focusable)
        expect(link).not.toHaveAttribute("tabindex", "-1");
      });
    });
  });

  describe("responsive behavior", () => {
    it("applies responsive flex classes", () => {
      const { container } = render(<ContactInfo />);
      const div = container.firstChild as HTMLElement;

      expect(div).toHaveClass("flex");
      expect(div).toHaveClass("flex-col");
      expect(div).toHaveClass("sm:flex-row");
      expect(div).toHaveClass("sm:flex-wrap");
    });

    it("applies responsive gap classes", () => {
      const { container } = render(<ContactInfo />);
      const div = container.firstChild as HTMLElement;

      expect(div).toHaveClass("gap-1");
      expect(div).toHaveClass("sm:gap-2");
    });
  });
});
