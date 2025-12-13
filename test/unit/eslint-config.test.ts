/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";

describe("eslint.config.mjs", () => {
  it("should be a valid configuration array", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  }, 10000); // 10 second timeout

  it("should include ignore patterns", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const ignoreConfig = config.find(
      (c: { ignores?: string[] }) => c.ignores !== undefined,
    );
    expect(ignoreConfig).toBeDefined();
    expect(ignoreConfig?.ignores).toEqual(
      expect.arrayContaining([
        "**/.next/**",
        "**/node_modules/**",
        "**/.contentlayer/**",
        "**/.turbo/**",
        "coverage/**",
        ".next-env.d.ts",
      ]),
    );
  });

  it("should include language options with global scopes", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const langConfig = config.find(
      (c: { languageOptions?: { globals?: Record<string, unknown> } }) =>
        c.languageOptions?.globals !== undefined,
    );
    expect(langConfig).toBeDefined();
    expect(langConfig?.languageOptions?.globals).toBeDefined();
  });

  it("should disable unused disable directives reporting", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const linterConfig = config.find(
      (c: { linterOptions?: { reportUnusedDisableDirectives?: boolean } }) =>
        c.linterOptions?.reportUnusedDisableDirectives !== undefined,
    );
    expect(linterConfig?.linterOptions?.reportUnusedDisableDirectives).toBe(
      false,
    );
  });

  it("should include TypeScript ESLint rules", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const tsConfig = config.find(
      (c: { rules?: Record<string, unknown> }) =>
        c.rules?.["@typescript-eslint/consistent-type-imports"] !== undefined,
    );
    expect(tsConfig).toBeDefined();
    expect(
      tsConfig?.rules?.["@typescript-eslint/consistent-type-imports"],
    ).toBe("error");
    expect(
      tsConfig?.rules?.["@typescript-eslint/explicit-function-return-type"],
    ).toBe("off");
  });

  it("should include security plugin rules", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const securityConfig = config.find(
      (c: { rules?: Record<string, unknown> }) =>
        c.rules?.["security/detect-unsafe-regex"] !== undefined,
    );
    expect(securityConfig).toBeDefined();
    expect(securityConfig?.rules?.["security/detect-unsafe-regex"]).toBe(
      "error",
    );
    expect(securityConfig?.rules?.["security/detect-child-process"]).toBe(
      "warn",
    );
  });

  it("should relax security rules for script and config files", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const scriptConfig = config.find(
      (c: { files?: string[] }) =>
        c.files?.includes("scripts/**/*.{js,mjs,ts}") ?? false,
    );
    expect(scriptConfig).toBeDefined();
    expect(scriptConfig?.files).toContain("scripts/**/*.{js,mjs,ts}");
    expect(scriptConfig?.files).toContain("*.config.{js,mjs,ts}");
    expect(scriptConfig?.rules?.["security/detect-non-literal-require"]).toBe(
      "off",
    );
    expect(scriptConfig?.rules?.["security/detect-child-process"]).toBe("off");
    expect(scriptConfig?.rules?.["security/detect-unsafe-regex"]).toBe("off");
    expect(scriptConfig?.rules?.["no-console"]).toBe("off");
    expect(scriptConfig?.rules?.["no-restricted-globals"]).toBe("off");
  });

  it("should disable triple-slash reference rule for next-env.d.ts", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const nextEnvConfig = config.find(
      (c: { files?: string[] }) => c.files?.includes("next-env.d.ts") ?? false,
    );
    expect(nextEnvConfig).toBeDefined();
    expect(
      nextEnvConfig?.rules?.["@typescript-eslint/triple-slash-reference"],
    ).toBe("off");
  });

  it("should include import sorting rules", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const sortConfig = config.find(
      (c: { rules?: Record<string, unknown> }) =>
        c.rules?.["simple-import-sort/imports"] !== undefined,
    );
    expect(sortConfig).toBeDefined();
    expect(sortConfig?.rules?.["simple-import-sort/imports"]).toBe("error");
    expect(sortConfig?.rules?.["simple-import-sort/exports"]).toBe("error");
  });

  it("should include prettier config for compatibility", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    // Prettier config is the last element
    const prettierConfig = config[config.length - 1];
    expect(prettierConfig).toBeDefined();
    // Prettier config object should exist (structure varies, just verify presence)
    expect(typeof prettierConfig).toBe("object");
  });

  it("should enforce AI guardrails: no-explicit-any", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const tsConfig = config.find(
      (c: { rules?: Record<string, unknown> }) =>
        c.rules?.["@typescript-eslint/no-explicit-any"] !== undefined,
    );
    expect(tsConfig).toBeDefined();
    expect(tsConfig?.rules?.["@typescript-eslint/no-explicit-any"]).toBe(
      "error",
    );
  });

  it("should enforce AI guardrails: no-console", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const consoleConfig = config.find(
      (c: { rules?: Record<string, unknown> }) =>
        c.rules?.["no-console"] === "error",
    );
    expect(consoleConfig).toBeDefined();
  });

  it("should enforce AI guardrails: no-restricted-globals for document/window", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const restrictedConfig = config.find(
      (c: { rules?: Record<string, unknown> }) =>
        Array.isArray(c.rules?.["no-restricted-globals"]) &&
        c.rules["no-restricted-globals"][0] === "error",
    );
    expect(restrictedConfig).toBeDefined();
    const restrictedGlobals = restrictedConfig?.rules?.[
      "no-restricted-globals"
    ] as unknown[];
    expect(restrictedGlobals.length).toBeGreaterThan(1);
  });

  it("should have test file overrides that disable guardrails", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const testConfig = config.find(
      (c: { files?: string[] }) =>
        c.files?.some((f: string) => f.includes("test/**/*.{ts,tsx}")) ?? false,
    );
    expect(testConfig).toBeDefined();
    expect(testConfig?.rules?.["no-console"]).toBe("off");
    expect(testConfig?.rules?.["no-restricted-globals"]).toBe("off");
    expect(testConfig?.rules?.["@typescript-eslint/no-explicit-any"]).toBe(
      "off",
    );
  });

  it("should have API route overrides for console.error", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const apiConfig = config.find(
      (c: { files?: string[] }) =>
        c.files?.includes("app/api/**/*.ts") ?? false,
    );
    expect(apiConfig).toBeDefined();
    expect(Array.isArray(apiConfig?.rules?.["no-console"])).toBe(true);
    const consoleRule = apiConfig?.rules?.["no-console"] as unknown[];
    expect(consoleRule[0]).toBe("error");
    expect((consoleRule[1] as { allow: string[] }).allow).toContain("error");
  });

  it("should have lib/error-logging.ts override for console", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const errorLoggingConfig = config.find(
      (c: { files?: string[] }) =>
        c.files?.includes("lib/error-logging.ts") ?? false,
    );
    expect(errorLoggingConfig).toBeDefined();
    expect(errorLoggingConfig?.rules?.["no-console"]).toBe("off");
  });

  it("should enforce AI guardrails: no-misused-promises", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const misusedPromisesConfig = config.find(
      (c: { rules?: Record<string, unknown> }) =>
        c.rules?.["@typescript-eslint/no-misused-promises"] !== undefined,
    );
    expect(misusedPromisesConfig).toBeDefined();
    const rule = misusedPromisesConfig?.rules?.[
      "@typescript-eslint/no-misused-promises"
    ] as unknown[];
    expect(rule[0]).toBe("error");
    expect(
      (rule[1] as { checksVoidReturn: { attributes: boolean } })
        .checksVoidReturn.attributes,
    ).toBe(false);
  });

  it("should enforce AI guardrails: no-restricted-syntax", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const restrictedSyntaxConfig = config.find(
      (c: { rules?: Record<string, unknown> }) =>
        Array.isArray(c.rules?.["no-restricted-syntax"]) &&
        c.rules["no-restricted-syntax"][0] === "error",
    );
    expect(restrictedSyntaxConfig).toBeDefined();
    const syntaxRules = restrictedSyntaxConfig?.rules?.[
      "no-restricted-syntax"
    ] as unknown[];
    expect(syntaxRules.length).toBeGreaterThan(1);
    // Verify it includes rules for 'any' type patterns
    const hasAnyTypeRule = syntaxRules.some(
      (rule: { selector?: string }) =>
        rule.selector?.includes("TSTypeReference") ||
        rule.selector?.includes("TSAnyKeyword"),
    );
    expect(hasAnyTypeRule).toBe(true);
  });

  it("should have Sentry instrumentation files override for console", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const sentryConfig = config.find(
      (c: { files?: string[] }) =>
        c.files?.includes("instrumentation.ts") ?? false,
    );
    expect(sentryConfig).toBeDefined();
    expect(sentryConfig?.files).toContain("instrumentation.ts");
    expect(sentryConfig?.files).toContain("instrumentation-client.ts");
    expect(sentryConfig?.files).toContain("sentry.*.config.ts");
    expect(sentryConfig?.rules?.["no-console"]).toBe("off");
  });

  it("should have specific component overrides for window access", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    const componentConfig = config.find(
      (c: { files?: string[] }) =>
        c.files?.includes("app/components/GlobalErrorHandler.tsx") ?? false,
    );
    expect(componentConfig).toBeDefined();
    expect(componentConfig?.rules?.["no-restricted-globals"]).toBe("off");
  });
});
