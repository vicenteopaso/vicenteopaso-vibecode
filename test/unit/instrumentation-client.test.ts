import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Build a Sentry mock that captures init calls and exposes required client APIs.
function createSentryClientMock() {
  return {
    init: vi.fn(),
    replayIntegration: vi.fn(() => ({ name: "ReplayIntegrationMock" })),
    captureRouterTransitionStart: vi.fn(() => ({ type: "router-transition" })),
  };
}

type SentryClientMock = ReturnType<typeof createSentryClientMock>;
interface InitOptions {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  integrations: (integrations: { name: string }[]) => { name: string }[];
}

// Helper to import the client instrumentation fresh per test with new env.
async function importClientInstrumentation() {
  vi.resetModules();
  vi.mock("@sentry/nextjs", () => createSentryClientMock());
  return import("../../instrumentation-client");
}

describe("instrumentation-client Sentry init", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    delete process.env.VITEST;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  afterEach(() => {
    warnSpy.mockRestore();
    debugSpy.mockRestore();
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.VITEST;
  });

  it("exports onRouterTransitionStart hook", async () => {
    process.env = { ...process.env, NODE_ENV: "development" };
    const mod = await importClientInstrumentation();
    expect(mod.onRouterTransitionStart).toBeDefined();
    mod.onRouterTransitionStart("/from", "/to");
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.captureRouterTransitionStart).toHaveBeenCalled();
  });

  it("skips init and warns when NEXT_PUBLIC_SENTRY_DSN is missing (dev)", async () => {
    process.env = { ...process.env, NODE_ENV: "development" };
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    await importClientInstrumentation();
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.init).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("No NEXT_PUBLIC_SENTRY_DSN provided"),
    );
  });

  it("skips init and warns when DSN looks invalid", async () => {
    process.env = { ...process.env, NODE_ENV: "development" };
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://INVALID_DSN_NOT_PUBLIC";

    await importClientInstrumentation();
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.init).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("does not look like a public client key"),
    );
  });

  it("skips init silently in production when DSN missing (no leak)", async () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    await importClientInstrumentation();
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.init).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("initializes Sentry with valid public DSN and replay integration", async () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/9999999";
    process.env.SENTRY_ENVIRONMENT = "prod-env";

    await importClientInstrumentation();
    const sentry =
      (await import("@sentry/nextjs")) as unknown as SentryClientMock;
    expect(sentry.init).toHaveBeenCalledTimes(1);
    const initArg = sentry.init.mock.calls[0][0] as InitOptions;
    expect(initArg.dsn).toBe(process.env.NEXT_PUBLIC_SENTRY_DSN);
    expect(initArg.environment).toBe("prod-env");
    expect(initArg.tracesSampleRate).toBe(0.1);
    expect(initArg.replaysSessionSampleRate).toBe(0.1);
    expect(initArg.replaysOnErrorSampleRate).toBe(1.0);
    expect(typeof initArg.integrations).toBe("function");
    const resultIntegrations = initArg.integrations([{ name: "Existing" }]);
    const integrationNames = resultIntegrations.map((i) => i.name);
    expect(integrationNames).toContain("Existing");
    expect(integrationNames).toContain("ReplayIntegrationMock");
  });

  it("prints debug message when VITEST flag is set", async () => {
    process.env = { ...process.env, NODE_ENV: "test" };
    process.env.VITEST = "true";
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/9999999";

    await importClientInstrumentation();
    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining("Skipping client init in tests"),
    );
  });
});
