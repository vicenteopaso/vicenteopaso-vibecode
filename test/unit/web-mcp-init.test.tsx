import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WebMcpInit } from "../../app/components/WebMcpInit";

type RegisteredTool = {
  name: string;
  execute: (input: unknown) => Promise<unknown> | unknown;
};

describe("WebMcpInit", () => {
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(globalThis, "fetch", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    if (globalThis.window) {
      delete (globalThis.window as Window & { __opaWebMcpRegistered?: boolean })
        .__opaWebMcpRegistered;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    Object.defineProperty(globalThis, "fetch", {
      value: originalFetch,
      writable: true,
      configurable: true,
    });
  });

  it("registers tools once and skips when already registered", async () => {
    const registered: RegisteredTool[] = [];
    const registerTool = vi.fn((tool) => {
      registered.push(tool);
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: { registerTool } },
      configurable: true,
    });

    render(<WebMcpInit />);
    expect(registerTool).toHaveBeenCalled();
    expect(
      (globalThis.window as Window & { __opaWebMcpRegistered?: boolean })
        .__opaWebMcpRegistered,
    ).toBe(true);
    const callCount = registerTool.mock.calls.length;

    render(<WebMcpInit />);
    expect(registerTool).toHaveBeenCalledTimes(callCount);
    expect(registered.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        "get_site_overview",
        "get_site_context",
        "get_content",
        "get_profile",
        "list_content_slugs",
      ]),
    );
  });

  it("retries registration until modelContext becomes available", () => {
    let modelContext: unknown = null;
    const registerTool = vi.fn();

    Object.defineProperty(globalThis, "navigator", {
      value: {
        get modelContext() {
          return modelContext;
        },
      },
      configurable: true,
    });

    render(<WebMcpInit />);
    expect(registerTool).not.toHaveBeenCalled();

    modelContext = { registerTool };
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(registerTool).toHaveBeenCalled();
  });

  it("handles invalid modelContext and cancels retries on unmount", () => {
    const registerTool = vi.fn();
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: { registerTool: "not-a-function" } },
      configurable: true,
    });

    const { unmount } = render(<WebMcpInit />);
    act(() => {
      vi.advanceTimersByTime(250 * 3);
    });
    expect(registerTool).not.toHaveBeenCalled();

    unmount();
    act(() => {
      vi.advanceTimersByTime(250 * 3);
    });
    expect(registerTool).not.toHaveBeenCalled();
  });

  it("stops retrying after max attempts when modelContext never becomes available", () => {
    const timerSpy = vi.spyOn(globalThis, "setTimeout");

    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: null },
      configurable: true,
    });

    render(<WebMcpInit />);

    act(() => {
      vi.advanceTimersByTime(250 * 20);
    });

    expect(timerSpy).toHaveBeenCalledTimes(9);
  });

  it("keeps retrying when navigator/modelContext are invalid guard values", () => {
    let modelContext: unknown = "invalid";
    const registerTool = vi.fn();

    Object.defineProperty(globalThis, "navigator", {
      value: {
        get modelContext() {
          return modelContext;
        },
      },
      configurable: true,
    });

    render(<WebMcpInit />);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(registerTool).not.toHaveBeenCalled();

    modelContext = { registerTool };
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(registerTool).toHaveBeenCalled();
  });

  it("retries when navigator is temporarily undefined", () => {
    let navigatorValue: unknown = undefined;
    const registerTool = vi.fn();

    Object.defineProperty(globalThis, "navigator", {
      get() {
        return navigatorValue;
      },
      configurable: true,
    });

    render(<WebMcpInit />);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(registerTool).not.toHaveBeenCalled();

    navigatorValue = { modelContext: { registerTool } };
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(registerTool).toHaveBeenCalled();
  });

  it("tool handlers return expected responses for success and error paths", async () => {
    const registered: RegisteredTool[] = [];
    const registerTool = vi.fn((tool) => {
      registered.push(tool);
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: { registerTool } },
      configurable: true,
    });

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "overview",
      })
      .mockResolvedValueOnce({
        ok: false,
        text: async () => "context",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hello: "world" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ name: "Vicente Opaso" }),
      });

    render(<WebMcpInit />);

    const tools = Object.fromEntries(
      registered.map((tool) => [tool.name, tool]),
    );

    const overview = (await tools.get_site_overview.execute(null)) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(overview.isError).toBe(false);
    expect(overview.content[0].text).toBe("overview");

    const context = (await tools.get_site_context.execute(null)) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(context.isError).toBe(true);
    expect(context.content[0].text).toBe("context");

    const invalidInput = (await tools.get_content.execute(null)) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(invalidInput.isError).toBe(true);
    expect(invalidInput.content[0].text).toContain("invalid input");

    const missingInput = (await tools.get_content.execute({ lang: "en" })) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(missingInput.isError).toBe(true);
    expect(missingInput.content[0].text).toContain("lang and slug");

    const okContent = (await tools.get_content.execute({
      lang: "en",
      slug: "about",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(okContent.isError).toBe(false);
    expect(okContent.content[0].text).toContain('"ok": true');

    const errorContent = (await tools.get_content.execute({
      lang: "es",
      slug: "privacy-policy",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(errorContent.isError).toBe(true);
    expect(errorContent.content[0].text).toContain('"ok": false');

    const missingProfileInput = (await tools.get_profile.execute({})) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(missingProfileInput.isError).toBe(true);
    expect(missingProfileInput.content[0].text).toContain("lang is required");

    const okProfile = (await tools.get_profile.execute({
      lang: "en",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(okProfile.isError).toBe(false);
    expect(okProfile.content[0].text).toContain('"name": "Vicente Opaso"');

    const list = tools.list_content_slugs.execute(null) as {
      content: { text: string }[];
    };
    expect(list.content[0].text).toContain("about");
    expect(list.content[0].text).toContain("privacy-policy");
  });

  it("tool handlers cover parse and network fallback branches", async () => {
    const registered: RegisteredTool[] = [];
    const registerTool = vi.fn((tool) => {
      registered.push(tool);
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: { registerTool } },
      configurable: true,
    });

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockRejectedValueOnce("overview-failed")
      .mockRejectedValueOnce(new Error("context-failed"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("bad-json");
        },
        text: async () => "raw-json-text",
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw "parse-string-error";
        },
        text: async () => {
          throw new Error("cannot-read-body");
        },
      })
      .mockRejectedValueOnce(new Error("network-down"))
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "profile-down" }),
      })
      .mockRejectedValueOnce("network-string-error");

    render(<WebMcpInit />);

    const tools = Object.fromEntries(
      registered.map((tool) => [tool.name, tool]),
    );

    const overview = (await tools.get_site_overview.execute(null)) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(overview.isError).toBe(true);
    expect(overview.content[0].text).toContain("Unknown network error.");

    const context = (await tools.get_site_context.execute(null)) as {
      isError?: boolean;
      content: { text: string }[];
    };
    expect(context.isError).toBe(true);
    expect(context.content[0].text).toContain("context-failed");

    const invalidJsonWithRawText = (await tools.get_content.execute({
      lang: "en",
      slug: "about",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(invalidJsonWithRawText.isError).toBe(true);
    expect(invalidJsonWithRawText.content[0].text).toContain(
      "Invalid JSON response.",
    );
    expect(invalidJsonWithRawText.content[0].text).toContain("raw-json-text");
    expect(invalidJsonWithRawText.content[0].text).toContain("bad-json");

    const invalidJsonWithoutRawText = (await tools.get_content.execute({
      lang: "es",
      slug: "about",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(invalidJsonWithoutRawText.isError).toBe(true);
    expect(invalidJsonWithoutRawText.content[0].text).toContain(
      "Unknown parse error.",
    );
    expect(invalidJsonWithoutRawText.content[0].text).toContain(
      '"rawText": ""',
    );

    const networkErrorObject = (await tools.get_content.execute({
      lang: "en",
      slug: "privacy-policy",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(networkErrorObject.isError).toBe(true);
    expect(networkErrorObject.content[0].text).toContain("Network error.");
    expect(networkErrorObject.content[0].text).toContain("network-down");

    const profileError = (await tools.get_profile.execute({
      lang: "es",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(profileError.isError).toBe(true);
    expect(profileError.content[0].text).toContain("profile-down");

    const networkErrorString = (await tools.get_content.execute({
      lang: "es",
      slug: "privacy-policy",
    })) as { isError?: boolean; content: { text: string }[] };
    expect(networkErrorString.isError).toBe(true);
    expect(networkErrorString.content[0].text).toContain(
      "Unknown network error.",
    );
  });
});
