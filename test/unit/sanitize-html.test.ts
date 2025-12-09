import { describe, expect, it } from "vitest";

import { sanitizeRichText } from "../../lib/sanitize-html";
describe("sanitizeRichText", () => {
  it("returns empty string for falsy input", () => {
    expect(sanitizeRichText("" as string | undefined | null)).toBe("");
    expect(sanitizeRichText(undefined)).toBe("");
    expect(sanitizeRichText(null)).toBe("");
  });

  it("strips disallowed tags and keeps allowed basic markup", () => {
    const input =
      '<p>Hello <strong>world</strong></p><script>alert("xss")</script>';
    const output = sanitizeRichText(input);

    expect(output).toContain("<p>");
    expect(output).toContain("<strong>");
    expect(output).not.toContain("<script");
    expect(output).not.toContain("alert(");
  });

  it("removes javascript: URLs from anchors", () => {
    const input =
      '<a href="javascript:alert(1)">Click me</a><a href=" JavaScript:evil() ">Also bad</a>';
    const output = sanitizeRichText(input);

    expect(output.toLowerCase()).not.toContain("javascript:");
    // href should be dropped entirely when it is javascript:
    expect(output.toLowerCase()).not.toContain('href="javascript:');
  });

  it("removes data: URLs from anchors", () => {
    const input =
      '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Click</a>';
    const output = sanitizeRichText(input);

    expect(output.toLowerCase()).not.toContain('href="data:');
  });

  it("removes vbscript: URLs from anchors", () => {
    const input = `<a href="vbscript:msgbox('xss')">Click</a>`;
    const output = sanitizeRichText(input);

    expect(output.toLowerCase()).not.toContain('href="vbscript:');
  });

  it('adds rel="noopener noreferrer" for target _blank links', () => {
    const input = '<a href="https://example.com" target="_blank">Link</a>';
    const output = sanitizeRichText(input);

    expect(output).toContain('target="_blank"');
    expect(output).toMatch(/rel="noopener noreferrer"/);
  });

  it("preserves allowed attributes on span elements and strips styles", () => {
    const input =
      '<span aria-label="Test" style="color:red">Label</span><p style="color:blue">Text</p>';
    const output = sanitizeRichText(input);

    // aria-label on span is explicitly allowed
    expect(output).toContain('aria-label="Test"');
    // style attributes should be stripped globally
    expect(output).not.toContain("style=");
  });
});
