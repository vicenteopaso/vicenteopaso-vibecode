import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock factory so that importing the Sentry config files does not perform any
// real network or SDK initialization work during tests. Vitest's Sentry
// integration expects a `getCurrentHub` export to exist on the mock.
function createSentryMock() {
  return {
    init: vi.fn(),
    getCurrentHub: vi.fn(() => ({
      getClient: () => null,
    })),
  };
}

vi.mock("@sentry/nextjs", () => createSentryMock());

// Helper to import the module fresh so it sees updated env vars between tests.
async function importInstrumentation() {
  // Ensure a fresh module instance for each test
  vi.resetModules();
  // Re-apply the Sentry mock after resetting modules
  vi.mock("@sentry/nextjs", () => createSentryMock());
  return import("../../instrumentation");
}

describe("instrumentation register()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });
  it("imports server Sentry config when NEXT_RUNTIME is nodejs", async () => {
    process.env.NEXT_RUNTIME = "nodejs";

    const { register } = await importInstrumentation();

    await expect(register()).resolves.not.toThrow();
  });

  it("imports edge Sentry config when NEXT_RUNTIME is edge", async () => {
    process.env.NEXT_RUNTIME = "edge";

    const { register } = await importInstrumentation();

    await expect(register()).resolves.not.toThrow();
  });

  it("is a no-op when NEXT_RUNTIME is not set", async () => {
    delete process.env.NEXT_RUNTIME;

    const { register } = await importInstrumentation();

    await expect(register()).resolves.not.toThrow();
  });
});
