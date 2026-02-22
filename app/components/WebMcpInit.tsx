"use client";

import { useEffect } from "react";

import { CONTENT_SLUGS } from "@/lib/content-slugs";

type ToolInputSchema = {
  type: "object";
  properties?: Record<string, { type: string; description?: string }>;
  required?: string[];
  additionalProperties?: boolean;
};

type ToolRegistration = {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  execute: (input: unknown) => Promise<unknown> | unknown;
};

type ModelContext = {
  registerTool: (tool: ToolRegistration) => void;
};

type ModelContextNavigator = Navigator & { modelContext?: unknown };

const MCP_REGISTRATION_FLAG = "__opaWebMcpRegistered";

function getModelContext(): ModelContext | null {
  if (typeof navigator === "undefined") {
    return null;
  }

  const modelContext = (navigator as ModelContextNavigator).modelContext;
  if (!modelContext || typeof modelContext !== "object") {
    return null;
  }

  const context = modelContext as ModelContext;
  if (typeof context.registerTool !== "function") {
    return null;
  }

  return context;
}

function registerTools(modelContext: ModelContext) {
  const fetchText = async (path: string) => {
    try {
      const response = await fetch(path);
      const text = await response.text();
      return { ok: response.ok, status: response.status, text };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown network error.";
      return {
        ok: false,
        status: null,
        text: `Error fetching ${path}: ${message}`,
      };
    }
  };

  const fetchJson = async (path: string) => {
    try {
      const response = await fetch(path);
      const rawText = await response.text();

      let data: unknown;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        return {
          ok: false,
          status: response.status,
          data: {
            error: "Invalid JSON response.",
            rawText,
            parseError:
              parseError instanceof Error
                ? parseError.message
                : "Unknown parse error.",
          },
        };
      }

      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown network error.";
      return {
        ok: false,
        status: null,
        data: { error: "Network error.", message },
      };
    }
  };

  modelContext.registerTool({
    name: "get_site_overview",
    description: "Return the short AI overview for this site (/llms.txt).",
    inputSchema: { type: "object", additionalProperties: false },
    execute: async () => {
      const result = await fetchText("/llms.txt");
      return {
        content: [{ type: "text", text: result.text }],
        isError: !result.ok,
      };
    },
  });

  modelContext.registerTool({
    name: "get_site_context",
    description: "Return the full AI context for this site (/llms-full.txt).",
    inputSchema: { type: "object", additionalProperties: false },
    execute: async () => {
      const result = await fetchText("/llms-full.txt");
      return {
        content: [{ type: "text", text: result.text }],
        isError: !result.ok,
      };
    },
  });

  modelContext.registerTool({
    name: "get_content",
    description:
      "Fetch localized markdown content from /api/content/{lang}/{slug}.",
    inputSchema: {
      type: "object",
      properties: {
        lang: { type: "string", description: "Locale code (en or es)." },
        slug: {
          type: "string",
          description: `Allowed slugs: ${CONTENT_SLUGS.join(", ")}.`,
        },
      },
      required: ["lang", "slug"],
      additionalProperties: false,
    },
    execute: async (input) => {
      if (!input || typeof input !== "object") {
        return {
          content: [{ type: "text", text: "Error: invalid input." }],
          isError: true,
        };
      }

      const { lang, slug } = input as { lang?: string; slug?: string };
      if (!lang || !slug) {
        return {
          content: [
            { type: "text", text: "Error: lang and slug are required." },
          ],
          isError: true,
        };
      }

      const result = await fetchJson(`/api/content/${lang}/${slug}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { ok: result.ok, status: result.status, data: result.data },
              null,
              2,
            ),
          },
        ],
        isError: !result.ok,
      };
    },
  });

  modelContext.registerTool({
    name: "list_content_slugs",
    description: "List available markdown content slugs for this site.",
    inputSchema: { type: "object", additionalProperties: false },
    execute: () => ({
      content: [{ type: "text", text: CONTENT_SLUGS.join(", ") }],
    }),
  });
}
export function WebMcpInit() {
  useEffect(() => {
    const globalScope = globalThis as typeof globalThis & {
      window?: Window;
    };
    const browserWindow = globalScope.window;

    if (!browserWindow) {
      return;
    }

    const globalWindow = browserWindow as Window & {
      [MCP_REGISTRATION_FLAG]?: boolean;
    };

    if (globalWindow[MCP_REGISTRATION_FLAG]) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10;
    const delayMs = 250;

    const tryRegister = () => {
      if (cancelled) {
        return;
      }

      const modelContext = getModelContext();
      if (modelContext) {
        registerTools(modelContext);
        globalWindow[MCP_REGISTRATION_FLAG] = true;
        return;
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        const scheduleTimeout = globalScope.setTimeout ?? setTimeout;
        scheduleTimeout(tryRegister, delayMs);
      }
    };

    tryRegister();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
