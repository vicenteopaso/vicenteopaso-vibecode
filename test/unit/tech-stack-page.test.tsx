import { render, screen } from "@testing-library/react";
import fs from "fs";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import TechStackPage from "../../app/[lang]/tech-stack/page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TechStackPage", () => {
  it("renders markdown-driven tech stack content with rich elements", () => {
    const raw = [
      "---",
      "title: Tech Stack",
      "description: Full tech stack overview.",
      "---",
      "## Frameworks",
      "Using Next.js and React.",
      "",
      "### Tooling",
      "More detail.",
      "",
      "#### Minor heading",
      "Even more detail.",
      "",
      "- TypeScript",
      "- Tailwind CSS",
      "",
      "1. Step one",
      "2. Step two",
      "",
      "---",
      "",
      "A [link](https://example.com) with **bold text** and `inline code`.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    const { container } = render(
      <TechStackPage params={Promise.resolve({ lang: "en" })} />,
    );

    expect(
      screen.getByRole("heading", { name: /Tech Stack/i, level: 1 }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Full tech stack overview\./i)).toBeInTheDocument();
    expect(screen.getByText(/Using Next\.js and React\./i)).toBeInTheDocument();
    expect(screen.getByText(/TypeScript/i)).toBeInTheDocument();
    expect(screen.getByText(/Tailwind CSS/i)).toBeInTheDocument();

    // h2/h3/h4 mappings
    expect(
      screen.getByRole("heading", { name: /Frameworks/i, level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Tooling/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Minor heading/i }),
    ).toBeInTheDocument();

    // Ordered list items
    expect(screen.getByText(/Step one/i)).toBeInTheDocument();
    expect(screen.getByText(/Step two/i)).toBeInTheDocument();

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

    render(<TechStackPage params={Promise.resolve({ lang: "en" })} />);

    expect(
      screen.getByRole("heading", { name: /Tech Stack/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Content\./i)).toBeInTheDocument();
  });
});
