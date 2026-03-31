import { beforeEach, describe, expect, it, vi } from "vitest";

async function createGetHandler() {
  vi.resetModules();
  const mod = await import("../../app/api/sources/route");
  return mod.GET;
}

describe("app/api/sources GET", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the checked-in sources config", async () => {
    const GET = await createGetHandler();

    const res = await GET(new Request("http://localhost/api/sources"));

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      version: number;
      mode: string;
      sources: Array<{
        id: string;
        type: string;
        url: string;
        enabled: boolean;
      }>;
    };

    expect(json.version).toBe(1);
    expect(json.mode).toBe("production");
    expect(json.sources.length).toBeGreaterThan(0);
    expect(json.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "remotive",
          type: "rss",
          url: "https://remotive.com/remote-jobs/feed",
          enabled: true,
        }),
      ]),
    );
  });

  it("returns 500 when sources loading fails", async () => {
    vi.doMock("../../lib/static-json", () => ({
      getSourcesConfig: vi.fn(() => {
        throw new Error("sources-load-failed");
      }),
    }));

    const GET = await createGetHandler();

    const res = await GET(new Request("http://localhost/api/sources"));

    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Internal server error");
  });
});
