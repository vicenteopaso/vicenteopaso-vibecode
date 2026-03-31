import { describe, expect, it, vi } from "vitest";

async function createGetHandler() {
  vi.resetModules();
  const mod = await import("../../app/api/profile/route");
  return mod.GET as (req: Request) => Promise<Response>;
}

describe("app/api/profile GET", () => {
  it("redirects Spanish browsers to /api/profile/es", async () => {
    const GET = await createGetHandler();

    const res = await GET(
      new Request("http://localhost/api/profile", {
        headers: {
          "accept-language": "es-ES,es;q=0.9",
        },
      }),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/api/profile/es");
  });

  it("redirects non-Spanish browsers to /api/profile/en", async () => {
    const GET = await createGetHandler();

    const res = await GET(
      new Request("http://localhost/api/profile", {
        headers: {
          "accept-language": "en-US,en;q=0.9",
        },
      }),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/api/profile/en");
  });

  it("defaults to /api/profile/en when the header is missing", async () => {
    const GET = await createGetHandler();

    const res = await GET(new Request("http://localhost/api/profile"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/api/profile/en");
  });
});
