import { beforeEach, describe, expect, it, vi } from "vitest";

async function createGetHandler() {
  vi.resetModules();
  const mod = await import("../../app/api/rules/route");
  return mod.GET as (req: Request) => Promise<Response>;
}

describe("app/api/rules GET", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the checked-in rules config", async () => {
    const GET = await createGetHandler();

    const res = await GET(new Request("http://localhost/api/rules"));

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      version: number;
      matching: { min_match_score: number };
      linear: { default_team_key: string };
      operations: { timezone: string };
    };

    expect(json.version).toBe(1);
    expect(json.matching.min_match_score).toBe(0.8);
    expect(json.linear.default_team_key).toBe("JOB");
    expect(json.operations.timezone).toBe("Europe/Madrid");
  });

  it("returns 500 when rules loading fails", async () => {
    vi.doMock("../../lib/static-json", () => ({
      getRulesConfig: vi.fn(() => {
        throw new Error("rules-load-failed");
      }),
    }));

    const GET = await createGetHandler();

    const res = await GET(new Request("http://localhost/api/rules"));

    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Internal server error");
  });
});
