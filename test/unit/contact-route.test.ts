import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { NextRequest } from "next/server";

interface MockRequestInit {
  json: () => Promise<unknown>;
  headers?: Headers;
}

async function createPostHandler() {
  // Reload module fresh for each test so env changes are picked up.
  vi.resetModules();
  const mod = await import("../../app/api/contact/route");
  return mod.POST as (req: NextRequest) => Promise<Response>;
}

function createRequest(body: unknown, headers?: Record<string, string>) {
  const h = new Headers(headers);
  const init: MockRequestInit = {
    json: async () => body,
    headers: h,
  };

  return init as unknown as NextRequest;
}

function mockFetchSequence(responses: Array<{ ok: boolean; body: unknown }>) {
  const fetchMock = vi.fn();
  responses.forEach((item) => {
    fetchMock.mockResolvedValueOnce({
      ok: item.ok,
      json: async () => item.body,
    } as Response);
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const basePayload = {
  email: "test@example.com",
  phone: "123",
  message: "Hello there",
  turnstileToken: "token-123",
  honeypot: "",
};

describe("app/api/contact/route POST", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    process.env.TURNSTILE_SECRET_KEY = "secret-key";
    process.env.NEXT_PUBLIC_FORMSPREE_KEY = "forms-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns 500 when Turnstile secret key is missing", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;

    const POST = await createPostHandler();
    const req = createRequest(basePayload);

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toMatch(/verification service is not configured/i);
  });

  it("returns 500 when Formspree endpoint is not configured", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret-key";
    delete process.env.NEXT_PUBLIC_FORMSPREE_KEY;

    const POST = await createPostHandler();
    const req = createRequest(basePayload);

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toMatch(/contact service is not configured/i);
  });

  it("returns early when honeypot is filled without calling external services", async () => {
    const POST = await createPostHandler();

    const req = createRequest({ ...basePayload, honeypot: "bot-field" });
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 400 on Turnstile verification failure", async () => {
    const POST = await createPostHandler();

    const fetchMock = mockFetchSequence([
      { ok: true, body: { success: false, "error-codes": ["bad-token"] } },
    ]);

    const req = createRequest(basePayload, {
      "x-forwarded-for": "203.0.113.1",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toMatch(/verification failed/i);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    );
  });

  it("forwards to Formspree on success", async () => {
    const POST = await createPostHandler();

    const fetchMock = mockFetchSequence([
      { ok: true, body: { success: true } },
      { ok: true, body: { ok: true } },
    ]);

    const req = createRequest(basePayload);

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain("https://formspree.io/f/");
  });

  it("returns 502 with Formspree error message when available", async () => {
    const POST = await createPostHandler();

    const fetchMock = mockFetchSequence([
      { ok: true, body: { success: true } },
      { ok: false, body: { error: "Bad things happened" } },
    ]);

    const req = createRequest(basePayload);

    const res = await POST(req);
    expect(res.status).toBe(502);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Bad things happened");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns 400 for invalid input (Zod error)", async () => {
    const POST = await createPostHandler();

    const invalidPayload = {
      ...basePayload,
      email: "not-an-email",
    };

    const req = createRequest(invalidPayload);

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error.toLowerCase()).toContain("valid email");
  });
});
