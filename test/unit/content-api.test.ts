import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";

async function createGetHandler() {
  vi.resetModules();
  const mod = await import("../../app/api/content/[slug]/route");
  return mod.GET as (
    req: Request,
    ctx: { params: Promise<{ slug: string }> },
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
      { params: Promise.resolve({ slug: "not-allowed" }) },
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
      { params: Promise.resolve({ slug: "privacy-policy" }) },
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
        "---",
        "",
        "Body content here.",
      ].join("\n"),
    );

    const res = await GET(
      new Request("http://localhost/api/content/cookie-policy"),
      { params: Promise.resolve({ slug: "cookie-policy" }) },
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { title: string; body: string };
    expect(json.title).toBe("Cookie Policy");
    expect(json.body).toContain("Body content here.");
  });

  it("falls back to name then slug for the response title", async () => {
    const GET = await createGetHandler();

    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      ["---", "name: Friendly name", "---", "", "Body copy."].join("\n"),
    );

    const res = await GET(
      new Request("http://localhost/api/content/tech-stack"),
      { params: Promise.resolve({ slug: "tech-stack" }) },
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { title: string; body: string };
    expect(json.title).toBe("Friendly name");
    expect(json.body).toContain("Body copy.");
  });
});
