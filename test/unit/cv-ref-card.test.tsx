import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CvRefsGrid } from "../../app/components/CvRefCard";

const longText =
  "Vicente helped bring structure, clarity, and momentum to complex frontend work. ".repeat(
    5,
  );

const refs = [
  { name: "Ada Lovelace", role: "Staff Engineer", href: "https://example.com/ada", fullText: longText },
  { name: "Grace Hopper", role: "Architect", fullText: longText },
  { name: "Margaret Hamilton", role: "Director", fullText: longText },
  { name: "Katherine Johnson", role: "VP Engineering", fullText: longText },
];

describe("CvRefsGrid", () => {
  it("renders cards with the expected column and last-row layout branches", () => {
    render(<CvRefsGrid refs={refs} />);

    const cards = screen.getAllByRole("button");
    expect(cards).toHaveLength(4);

    expect(cards[0].getAttribute("style")).toContain(
      "border-right: 1px solid var(--v3-rule)",
    );
    expect(cards[0].getAttribute("style")).toContain(
      "border-bottom: 1px solid var(--v3-rule)",
    );
    expect(cards[0].style.opacity).toBe("1");
    // Card 1: right col (no right border), top row (has bottom border)
    expect(cards[1].getAttribute("style")).not.toContain(
      "border-right: 1px solid",
    );
    expect(cards[1].getAttribute("style")).toContain(
      "border-bottom: 1px solid var(--v3-rule)",
    );
    // Card 2: left col (has right border), last row (no bottom border)
    expect(cards[2].getAttribute("style")).toContain(
      "border-right: 1px solid var(--v3-rule)",
    );
    expect(cards[2].getAttribute("style")).not.toContain(
      "border-bottom: 1px solid",
    );
    // Card 3: right col + last row (no right or bottom border)
    expect(cards[3].getAttribute("style")).not.toContain(
      "border-right: 1px solid",
    );
    expect(cards[3].getAttribute("style")).not.toContain(
      "border-bottom: 1px solid",
    );

    const firstOverlay = cards[0].children[1] as HTMLElement;
    expect(firstOverlay).toHaveStyle({ top: "0px" });
    expect(firstOverlay).toHaveStyle({
      transform: "translateY(-6px) scale(0.99)",
    });

    const lastRowOverlay = cards[2].children[1] as HTMLElement;
    expect(lastRowOverlay).toHaveStyle({ bottom: "0px" });
    expect(lastRowOverlay).toHaveStyle({
      transform: "translateY(6px) scale(0.99)",
    });

    expect(cards[0]).toHaveTextContent("❝ REF · 01");
    expect(cards[0]).toHaveTextContent("Ada Lovelace");
    expect(cards[0]).toHaveTextContent("Staff Engineer");
    expect(cards[0]).toHaveTextContent("…");
  });

  it("expands on hover and focus, and dims sibling cards while active", () => {
    render(<CvRefsGrid refs={refs} />);

    const cards = screen.getAllByRole("button");
    const firstCard = cards[0];
    const secondCard = cards[1];

    fireEvent.mouseEnter(firstCard);
    expect(firstCard).toHaveAttribute("aria-expanded", "true");
    expect(firstCard).toHaveStyle({ zIndex: "10", opacity: "1" });
    expect(secondCard).toHaveStyle({ opacity: "0.35" });
    expect((firstCard.children[0] as HTMLElement).style.visibility).toBe(
      "hidden",
    );
    expect(firstCard.children[1] as HTMLElement).toHaveStyle({
      opacity: "1",
      transform: "translateY(0) scale(1)",
    });

    // Collapse happens when mouse leaves the grid, not individual cards
    fireEvent.mouseLeave(firstCard.closest('[class*="v3-cv-refs"]') ?? firstCard.parentElement!);
    expect(firstCard).toHaveAttribute("aria-expanded", "false");
    expect(secondCard).toHaveStyle({ opacity: "1" });

    fireEvent.focus(firstCard);
    expect(firstCard).toHaveAttribute("aria-expanded", "true");
    expect(secondCard).toHaveStyle({ opacity: "0.35" });

    fireEvent.blur(firstCard);
    expect(firstCard).toHaveAttribute("aria-expanded", "false");
    expect(secondCard).toHaveStyle({ opacity: "1" });
  });

  it("toggles expanded state on click, Enter, and Space", () => {
    render(<CvRefsGrid refs={refs} />);

    const card = screen.getAllByRole("button")[0];

    fireEvent.click(card);
    expect(card).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(card);
    expect(card).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(card, { key: "Enter" });
    expect(card).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(card, { key: " " });
    expect(card).toHaveAttribute("aria-expanded", "false");
  });


  it("renders referee name as a link when href is provided, and link click does not toggle card", () => {
    render(<CvRefsGrid refs={refs} />);

    // First ref has href — name should be a link
    const link = screen.getByRole("link", { name: "Ada Lovelace" });
    expect(link).toHaveAttribute("href", "https://example.com/ada");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");

    // Second ref has no href — name should be plain text, not a link
    expect(screen.queryByRole("link", { name: "Grace Hopper" })).toBeNull();

    // Clicking the link should not toggle the card (stopPropagation)
    const card = screen.getAllByRole("button")[0];
    expect(card).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(link);
    expect(card).toHaveAttribute("aria-expanded", "false");
  });
  it("ignores unrelated keyboard input", () => {
    render(<CvRefsGrid refs={refs} />);

    const card = screen.getAllByRole("button")[0];

    fireEvent.keyDown(card, { key: "Escape" });
    expect(card).toHaveAttribute("aria-expanded", "false");
    expect(card).toHaveStyle({ opacity: "1" });
  });
});
