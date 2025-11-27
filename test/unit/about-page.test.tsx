import { render, screen } from "@testing-library/react";
import fs from "fs";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../app/components/ImpactCards", () => ({
  ImpactCards: ({ cards }: { cards: string[] }) => (
    <div data-testid="impact-cards" data-cards={JSON.stringify(cards)} />
  ),
}));

import AboutPage from "../../app/about/page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AboutPage", () => {
  it("renders profile card, markdown content, and Get in touch section", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "tagline: Engineering leader",
      "initials: VO",
      "slug: about",
      "---",
      "Hello world from about page.",
      "",
      "- Item 1",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<AboutPage />);

    expect(screen.getByText("Vicente Opaso")).toBeInTheDocument();
    expect(screen.getByText("Engineering leader")).toBeInTheDocument();

    expect(
      screen.getByText(/Hello world from about page/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Get in touch" }),
    ).toBeInTheDocument();
  });

  it("handles missing optional frontmatter gracefully", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "slug: about",
      "---",
      "About content without tagline or initials.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<AboutPage />);

    expect(screen.getByText("Vicente Opaso")).toBeInTheDocument();
    expect(
      screen.getByText(/About content without tagline or initials/i),
    ).toBeInTheDocument();
  });

  it("strips the Introduction heading and renders intro body only", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "tagline: Engineering leader",
      "initials: VO",
      "slug: about",
      "---",
      "### Introduction",
      "This is the introduction body.",
      "",
      "---",
      "### Another section",
      "- Bullet 1",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<AboutPage />);

    expect(
      screen.getByText(/This is the introduction body\./i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Introduction")).not.toBeInTheDocument();
  });

  it("parses an Impact Cards section into individual cards with a labelled section", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "tagline: Engineering leader",
      "initials: VO",
      "slug: about",
      "---",
      "### Introduction",
      "Intro copy.",
      "",
      "---",
      "### Impact Cards",
      "**Card One**",
      "First impact.",
      "",
      "---",
      "**Card Two**",
      "Second impact.",
      "",
      "---",
      "**Card Three**",
      "Third impact.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<AboutPage />);

    const impactSection = screen.getByRole("region", {
      name: /impact cards/i,
    });
    expect(impactSection).toBeInTheDocument();

    const impactCards = screen.getByTestId("impact-cards");
    const cardsProp = JSON.parse(
      impactCards.getAttribute("data-cards") ?? "[]",
    );

    expect(cardsProp).toHaveLength(3);
    expect(cardsProp[0]).toMatch(/Card One/);
    expect(cardsProp[1]).toMatch(/Card Two/);
    expect(cardsProp[2]).toMatch(/Card Three/);
  });

  it("renders social profile links with correct aria-labels", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "tagline: Engineering leader",
      "initials: VO",
      "slug: about",
      "---",
      "Hello world from about page.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<AboutPage />);

    const githubLinks = screen.getAllByRole("link", {
      name: /github profile/i,
    });
    const linkedinLinks = screen.getAllByRole("link", {
      name: /linkedin profile/i,
    });
    const xLinks = screen.getAllByRole("link", {
      name: /x \(twitter\) profile/i,
    });

    expect(githubLinks.length).toBeGreaterThanOrEqual(1);
    expect(linkedinLinks.length).toBeGreaterThanOrEqual(1);
    expect(xLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("handles sections without Introduction heading", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "slug: about",
      "---",
      "Direct content without introduction.",
      "",
      "---",
      "### Regular Section",
      "Section content.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<AboutPage />);

    expect(
      screen.getByText(/Direct content without introduction/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Regular Section" }),
    ).toBeInTheDocument();
  });

  it("supports legacy *** separators within a single Impact Cards block", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "slug: about",
      "---",
      "### Introduction",
      "Intro body.",
      "",
      "---",
      "### Impact Cards",
      "**Card A**\nContent A.",
      "***",
      "**Card B**\nContent B.",
      "***",
      "**Card C**\nContent C.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<AboutPage />);

    const impactSection = screen.getByRole("region", {
      name: /impact cards/i,
    });
    expect(impactSection).toBeInTheDocument();

    const impactCards = screen.getByTestId("impact-cards");
    const cardsProp = JSON.parse(
      impactCards.getAttribute("data-cards") ?? "[]",
    );

    expect(cardsProp).toHaveLength(3);
    expect(cardsProp[0]).toMatch(/Card A/);
    expect(cardsProp[1]).toMatch(/Card B/);
    expect(cardsProp[2]).toMatch(/Card C/);
  });

  it("collects subsequent non-heading sections as cards until the next heading", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "slug: about",
      "---",
      "### Introduction",
      "Intro body.",
      "",
      "---",
      "### Impact Cards",
      "**Card One**\nFirst.",
      "",
      "---",
      "**Card Two**\nSecond.",
      "",
      "---",
      "### A regular section",
      "This should not be part of the cards.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<AboutPage />);

    const impactCards = screen.getByTestId("impact-cards");
    const cardsProp = JSON.parse(
      impactCards.getAttribute("data-cards") ?? "[]",
    );

    expect(cardsProp).toHaveLength(2);
    expect(cardsProp[0]).toMatch(/Card One/);
    expect(cardsProp[1]).toMatch(/Card Two/);
  });

  it("renders a horizontal rule within a regular section using markdown ***", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "slug: about",
      "---",
      "### Regular Section",
      "Paragraph before.",
      "***",
      "Paragraph after.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    const { container } = render(<AboutPage />);

    // react-markdown should render an <hr> for *** inside the section
    const hrs = container.querySelectorAll("hr");
    expect(hrs.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Paragraph after\./i)).toBeInTheDocument();
  });

  it("renders ordered lists in intro and regular sections", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "slug: about",
      "---",
      "### Introduction",
      "1. One",
      "2. Two",
      "",
      "---",
      "### Regular Section",
      "1. Alpha",
      "2. Beta",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<AboutPage />);

    expect(screen.getByText(/One/i)).toBeInTheDocument();
    expect(screen.getByText(/Two/i)).toBeInTheDocument();
    expect(screen.getByText(/Alpha/i)).toBeInTheDocument();
    expect(screen.getByText(/Beta/i)).toBeInTheDocument();
  });

  it("renders horizontal rule using ___ in a regular section", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "slug: about",
      "---",
      "### Regular Section",
      "Paragraph before.",
      "___",
      "Paragraph after.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    const { container } = render(<AboutPage />);
    const hrs = container.querySelectorAll("hr");
    expect(hrs.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Paragraph after\./i)).toBeInTheDocument();
  });

  it("uses fallback empty string when name frontmatter is missing", () => {
    const raw = [
      "---",
      // name intentionally omitted
      "title: About",
      "tagline: Engineering leader",
      "initials: VO",
      "slug: about",
      "---",
      "### Regular Section",
      "Content present even without a name.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<AboutPage />);

    // Name should not render when missing; tagline still renders
    expect(screen.queryByText("Vicente Opaso")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Engineering leader/i).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByText(/Content present even without a name\./i),
    ).toBeInTheDocument();
  });

  it("does not render an intro section when content body is empty", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "tagline: Engineering leader",
      "initials: VO",
      "slug: about",
      "---",
      // No body content after frontmatter
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    const { container } = render(<AboutPage />);

    // There should be no intro section; only the Profile header and footer exist
    expect(container.querySelectorAll("section.space-y-4.py-3").length).toBe(0);
  });

  // Note: When the Impact Cards section has no card body, the UI still renders
  // a labelled region without cards. We rely on other tests to validate card
  // parsing behavior for coverage.
});
