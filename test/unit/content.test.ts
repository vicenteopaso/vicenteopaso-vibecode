import fs from "fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadContentPage } from "@/lib/content";

describe("loadContentPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns validated frontmatter and body for a well-formed file", () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      ["---", "name: About", "title: About", "slug: about", "---", "", "Body."].join(
        "\n",
      ),
    );

    const { data, content } = loadContentPage("en", "about");

    expect(data).toMatchObject({ name: "About", title: "About", slug: "about" });
    expect(content).toContain("Body.");
  });

  it("normalizes a filesystem read failure to a repo-relative message with cause", () => {
    const enoent = Object.assign(
      new Error(
        "ENOENT: no such file or directory, open '/Users/someone/secret/path/content/en/missing.md'",
      ),
      { code: "ENOENT" },
    );
    vi.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw enoent;
    });

    let thrown: unknown;
    try {
      loadContentPage("en", "missing");
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    const error = thrown as Error;
    expect(error.message).toBe("Failed to read content file content/en/missing.md");
    expect(error.message).not.toContain("/Users/someone/secret/path");
    expect(error.cause).toBe(enoent);
  });

  it("throws a descriptive error when required frontmatter fields are missing", () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      ["---", "name: Only Name", "---", "", "Body."].join("\n"),
    );

    expect(() => loadContentPage("en", "tech-stack")).toThrow(
      "Invalid frontmatter in content/en/tech-stack.md:",
    );
  });
});
