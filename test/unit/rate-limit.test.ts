import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadModule() {
  vi.resetModules();

  const mod = await import("../../lib/rate-limit");
  return mod;
}

describe("lib/rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to the maximum number of requests in a window and then blocks", async () => {
    const { checkRateLimitForKey } = await loadModule();

    // First 5 requests should be allowed.
    for (let i = 0; i < 5; i += 1) {
      const result = checkRateLimitForKey("ip-1");
      expect(result.allowed).toBe(true);
    }

    // 6th request should be blocked.
    const blocked = checkRateLimitForKey("ip-1");
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("resets the window after the configured duration", async () => {
    const { checkRateLimitForKey } = await loadModule();

    // Exhaust the limit.
    for (let i = 0; i < 5; i += 1) {
      const result = checkRateLimitForKey("ip-2");
      expect(result.allowed).toBe(true);
    }

    const blocked = checkRateLimitForKey("ip-2");
    expect(blocked.allowed).toBe(false);

    // Advance time beyond the 1-minute window.
    vi.advanceTimersByTime(61_000);

    const afterWindow = checkRateLimitForKey("ip-2");
    expect(afterWindow.allowed).toBe(true);
  });
});
