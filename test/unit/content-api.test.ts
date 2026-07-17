import fs from "fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function createGetHandler() {
  vi.resetModules();
  const mod = await import("../../app/api/content/[[...parts]]/route");
  return mod.GET as (
    req: Request,
    ctx: { params: Promise<{ parts?: string[] }> },
  ) => Promise<Response>;
}

describe("app/api/content/[slug] GET", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns 404 for slugs not in the allow list", async () => {
    const GET = await createGetHandler();

    const res = await GET(
      new Request("http://localhost/api/content/not-allowed"),
      { params: Promise.resolve({ parts: ["not-allowed"] }) },
    );

    expect(res.status).toBe(404);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Not found");
  });

  it("returns 404 when an allowed slug file does not exist", async () => {
    const GET = await createGetHandler();

    const existsSpy = vi.spyOn(fs, "existsSync").mockReturnValue(false);

    const res = await GET(
      new Request("http://localhost/api/content/privacy-policy"),
      { params: Promise.resolve({ parts: ["privacy-policy"] }) },
    );

    expect(existsSpy).toHaveBeenCalled();
    expect(res.status).toBe(404);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Not found");
  });

  it("returns JSON content with title from frontmatter.title", async () => {
    const GET = await createGetHandler();

    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      [
        "---",
        "title: Cookie Policy",
        "name: Not used",
        "slug: cookie-policy",
        "---",
        "",
        "Body content here.",
      ].join("\n"),
    );

    const res = await GET(
      new Request("http://localhost/api/content/cookie-policy"),
      { params: Promise.resolve({ parts: ["cookie-policy"] }) },
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { title: string; body: string };
    expect(json.title).toBe("Cookie Policy");
    expect(json.body).toContain("Body content here.");
  });

  it("returns 500 when frontmatter is missing required fields", async () => {
    const GET = await createGetHandler();

    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      // Missing required `title` and `slug` — the schema should reject this
      // the same way Contentlayer's required-field validation used to.
      ["---", "name: Friendly name", "---", "", "Body copy."].join("\n"),
    );

    const res = await GET(
      new Request("http://localhost/api/content/tech-stack"),
      { params: Promise.resolve({ parts: ["tech-stack"] }) },
    );

    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Internal server error");
  });
});

describe("app/api/content/[lang]/[slug] GET", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns 404 for invalid locales", async () => {
    const GET = await createGetHandler();

    const res = await GET(
      new Request("http://localhost/api/content/pt/tech-stack"),
      { params: Promise.resolve({ parts: ["pt", "tech-stack"] }) },
    );

    expect(res.status).toBe(404);
  });

  it("uses the locale to resolve content files", async () => {
    const GET = await createGetHandler();

    const existsSpy = vi.spyOn(fs, "existsSync").mockReturnValue(true);
    const readSpy = vi
      .spyOn(fs, "readFileSync")
      .mockReturnValue(
        [
          "---",
          "title: Tech Stack",
          "name: Tech Stack",
          "slug: tech-stack",
          "---",
          "",
          "Contenido en español.",
        ].join("\n"),
      );

    const res = await GET(
      new Request("http://localhost/api/content/es/tech-stack"),
      { params: Promise.resolve({ parts: ["es", "tech-stack"] }) },
    );

    expect(res.status).toBe(200);
    expect(existsSpy).toHaveBeenCalled();
    expect(readSpy).toHaveBeenCalled();
    const json = (await res.json()) as { title: string; body: string };
    expect(json.title).toBe("Tech Stack");
    expect(json.body).toContain("Contenido en español.");
  });
});
