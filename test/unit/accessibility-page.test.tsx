import { render, screen } from "@testing-library/react";
import fs from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import AccessibilityPage from "../../app/[lang]/accessibility/page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AccessibilityPage", () => {
  it.skip("reads markdown from accessibility.md and renders heading and rich content", () => {
    const raw = [
      "---",
      "title: Accessibility",
      "description: Accessibility description frontmatter.",
      "---",
      "## Commitment",
      "We aim to meet WCAG 2.1 AA.",
      "",
      "### Subheading",
      "More detail.",
      "",
      "#### Minor heading",
      "Even more detail.",
      "",
      "- Keyboard navigable",
      "- Screen reader friendly",
      "",
      "1. Ordered one",
      "2. Ordered two",
      "",
      "---",
      "",
      "A [link](https://example.com) with **bold text** and `inline code`.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    const { container } = render(
      <AccessibilityPage params={Promise.resolve({ lang: "en" })} />,
    );

    expect(
      screen.getByRole("heading", { name: /Accessibility/i, level: 1 }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Accessibility description frontmatter\./i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/We aim to meet WCAG 2.1 AA\./i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Keyboard navigable/i)).toBeInTheDocument();
    expect(screen.getByText(/Screen reader friendly/i)).toBeInTheDocument();

    // Ensure h3 and h4 mappings are used
    expect(
      screen.getByRole("heading", { name: /Subheading/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Minor heading/i }),
    ).toBeInTheDocument();

    // Ordered list items
    expect(screen.getByText(/Ordered one/i)).toBeInTheDocument();
    expect(screen.getByText(/Ordered two/i)).toBeInTheDocument();

    // Horizontal rule rendered
    expect(container.querySelectorAll("hr").length).toBeGreaterThanOrEqual(1);

    // Link, strong, and code mappings
    const link = screen.getByRole("link", { name: /link/i });
    expect(link).toBeInTheDocument();
    expect(screen.getByText(/bold text/i).tagName.toLowerCase()).toBe("strong");
    expect(screen.getByText(/inline code/i).tagName.toLowerCase()).toBe("code");
  });

  it.skip("falls back to default title when frontmatter title and name are missing", () => {
    const raw = [
      "---",
      // no title or name here on purpose
      "---",
      "## Section",
      "Content.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<AccessibilityPage params={Promise.resolve({ lang: "en" })} />);

    expect(
      screen.getByRole("heading", { name: /Accessibility Statement/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Content\./i)).toBeInTheDocument();
  });
});
