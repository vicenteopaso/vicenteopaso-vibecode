import React from "react";
import fs from "fs";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

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
});
