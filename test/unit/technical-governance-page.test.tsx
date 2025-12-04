import { render, screen } from "@testing-library/react";
import fs from "fs";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import TechnicalGovernancePage from "../../app/[lang]/technical-governance/page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TechnicalGovernancePage", () => {
  it("renders markdown-driven governance content with rich elements", () => {
    const raw = [
      "---",
      "title: Technical Governance",
      "description: How this project is governed.",
      "---",
      "## Principles",
      "We use SDD and documentation-first workflows.",
      "",
      "### Practices",
      "More detail.",
      "",
      "#### Minor heading",
      "Even more detail.",
      "",
      "- Design reviews",
      "- Architecture specs",
      "",
      "1. Discover",
      "2. Design",
      "",
      "---",
      "",
      "A [link](https://example.com) with **bold text** and `inline code`.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    const { container } = render(
      <TechnicalGovernancePage params={Promise.resolve({ lang: "en" })} />,
    );

    expect(
      screen.getByRole("heading", { name: /Technical Governance/i, level: 1 }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/how this project is governed\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We use SDD and documentation-first workflows\./i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Design reviews/i)).toBeInTheDocument();
    expect(screen.getByText(/Architecture specs/i)).toBeInTheDocument();

    // h2/h3/h4 mappings
    expect(
      screen.getByRole("heading", { name: /Principles/i, level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Practices/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Minor heading/i }),
    ).toBeInTheDocument();

    // Ordered list items
    expect(screen.getByText(/Discover/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Design/i).length).toBeGreaterThanOrEqual(1);

    // Horizontal rule rendered
    expect(container.querySelectorAll("hr").length).toBeGreaterThanOrEqual(1);

    // Link, strong, and code mappings
    const link = screen.getByRole("link", { name: /link/i });
    expect(link).toBeInTheDocument();
    expect(screen.getByText(/bold text/i).tagName.toLowerCase()).toBe("strong");
    expect(screen.getByText(/inline code/i).tagName.toLowerCase()).toBe("code");
  });

  it("falls back to default title when frontmatter title and name are missing", () => {
    const raw = [
      "---",
      // no title or name here
      "---",
      "## Section",
      "Content.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(
      <TechnicalGovernancePage params={Promise.resolve({ lang: "en" })} />,
    );

    expect(
      screen.getByRole("heading", { name: /Technical Governance/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Content\./i)).toBeInTheDocument();
  });
});
