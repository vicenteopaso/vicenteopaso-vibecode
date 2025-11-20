import React from "react";
import fs from "fs";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
