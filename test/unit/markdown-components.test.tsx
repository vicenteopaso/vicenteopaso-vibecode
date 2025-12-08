import { render, screen } from "@testing-library/react";
import ReactMarkdown from "react-markdown";
import { describe, expect, it } from "vitest";

import {
  aboutPageComponents,
  introComponents,
  markdownComponents,
} from "../../lib/markdown-components";

describe("markdownComponents", () => {
  it("renders core markdown elements with shared styling", () => {
    const markdown = [
      "## Heading Two",
      "",
      "### Heading Three",
      "",
      "#### Heading Four",
      "",
      "Regular paragraph text.",
      "",
      "- Item one",
      "- Item two",
      "",
      "1. First",
      "2. Second",
      "",
      "A [styled link](https://example.com) with **bold text** and `inline-code`.",
      "",
      "---",
    ].join("\n");

    const { container } = render(
      <ReactMarkdown components={markdownComponents}>{markdown}</ReactMarkdown>,
    );

    const h2 = screen.getByRole("heading", { level: 2, name: /Heading Two/i });
    expect(h2.tagName).toBe("H2");
    expect(h2).toHaveClass("text-2xl");

    const h3 = screen.getByRole("heading", {
      level: 3,
      name: /Heading Three/i,
    });
    expect(h3.tagName).toBe("H3");
    expect(h3).toHaveClass("text-xl");

    const h4 = screen.getByRole("heading", { level: 4, name: /Heading Four/i });
    expect(h4.tagName).toBe("H4");
    expect(h4).toHaveClass("text-lg");

    const paragraph = screen.getByText(/Regular paragraph text\./i);
    expect(paragraph.tagName).toBe("P");
    expect(paragraph).toHaveClass("text-sm");

    const unordered = container.querySelector("ul");
    expect(unordered).not.toBeNull();
    expect(unordered).toHaveClass("list-disc");

    const ordered = container.querySelector("ol");
    expect(ordered).not.toBeNull();
    expect(ordered).toHaveClass("list-decimal");

    const link = screen.getByRole("link", { name: /styled link/i });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveClass("underline");

    const strong = screen.getByText(/bold text/i);
    expect(strong.tagName).toBe("STRONG");
    expect(strong).toHaveClass("font-semibold");

    const code = screen.getByText("inline-code");
    expect(code.tagName).toBe("CODE");
    expect(code).toHaveClass("font-mono");

    const hr = container.querySelector("hr");
    expect(hr).not.toBeNull();
    expect(hr).toHaveClass("border-[color:var(--border-subtle)]");
  });
});

describe("aboutPageComponents", () => {
  it("maps markdown h3 to an h2 element with about-page styling", () => {
    const markdown = [
      "### About Section",
      "",
      "Some content.",
      "",
      "- Bullet",
      "",
      "1. First",
    ].join("\n");

    const { container } = render(
      <ReactMarkdown components={aboutPageComponents}>
        {markdown}
      </ReactMarkdown>,
    );

    const heading = screen.getByRole("heading", { name: /About Section/i });
    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveClass("text-xl");

    const unordered = container.querySelector("ul");
    expect(unordered).not.toBeNull();
    expect(unordered).toHaveClass("space-y-3");

    const ordered = container.querySelector("ol");
    expect(ordered).not.toBeNull();
    expect(ordered).toHaveClass("space-y-3");
  });
});

describe("introComponents", () => {
  it("uses larger typography for intro paragraphs and lists", () => {
    const markdown = [
      "Intro paragraph.",
      "",
      "- Item A",
      "- Item B",
      "",
      "1. First",
      "2. Second",
    ].join("\n");

    const { container } = render(
      <ReactMarkdown components={introComponents}>{markdown}</ReactMarkdown>,
    );

    const paragraph = screen.getByText(/Intro paragraph\./i);
    expect(paragraph.tagName).toBe("P");
    expect(paragraph).toHaveClass("text-base");

    const unordered = container.querySelector("ul");
    expect(unordered).not.toBeNull();
    expect(unordered).toHaveClass("text-base");

    const ordered = container.querySelector("ol");
    expect(ordered).not.toBeNull();
    expect(ordered).toHaveClass("text-base");
  });
});
