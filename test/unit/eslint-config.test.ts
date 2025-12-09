/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";

describe("eslint.config.mjs", () => {
  it("should be a valid configuration array", async () => {
    // @ts-expect-error - eslint.config.mjs doesn't have declaration file
    const eslintConfig = await import("../../eslint.config.mjs");
    const config = eslintConfig.default;

    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  });

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
        c.files?.some((f: string) => f.includes("scripts/**/*.mjs")) ?? false,
    );
    expect(scriptConfig).toBeDefined();
    expect(scriptConfig?.rules?.["security/detect-non-literal-require"]).toBe(
      "off",
    );
    expect(scriptConfig?.rules?.["security/detect-child-process"]).toBe("off");
    expect(scriptConfig?.rules?.["security/detect-unsafe-regex"]).toBe("off");
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
});
