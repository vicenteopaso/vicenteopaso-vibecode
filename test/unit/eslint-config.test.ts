/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const configPath = resolve(__dirname, "../../eslint.config.mjs");
const configText = readFileSync(configPath, "utf8");

describe("eslint.config.mjs (text-based checks)", () => {
  it("should include ignore patterns", () => {
    expect(configText).toMatch("**/.next/**");
    expect(configText).toMatch("**/node_modules/**");
    expect(configText).toMatch("**/.contentlayer/**");
    expect(configText).toMatch("**/.turbo/**");
    expect(configText).toMatch("coverage/**");
    expect(configText).toMatch(".next-env.d.ts");
  });

  it("should include language options with global scopes", () => {
    expect(configText).toMatch("languageOptions");
    expect(configText).toMatch("globals");
  });

  it("should disable unused disable directives reporting", () => {
    expect(configText).toMatch("reportUnusedDisableDirectives: false");
  });

  it("should include TypeScript ESLint rules", () => {
    expect(configText).toMatch("@typescript-eslint/consistent-type-imports");
    expect(configText).toMatch(
      "@typescript-eslint/explicit-function-return-type",
    );
  });

  it("should include security plugin rules", () => {
    expect(configText).toMatch("security/detect-unsafe-regex");
    expect(configText).toMatch("security/detect-child-process");
  });

  it("should relax security rules for script and config files", () => {
    expect(configText).toMatch("scripts/**/*.{js,mjs,ts}");
    expect(configText).toMatch("*.config.{js,mjs,ts}");
    expect(configText).toMatch("security/detect-non-literal-require");
    expect(configText).toMatch("security/detect-child-process");
    expect(configText).toMatch("security/detect-unsafe-regex");
    expect(configText).toMatch("no-console");
    expect(configText).toMatch("no-restricted-globals");
  });

  it("should disable triple-slash reference rule for next-env.d.ts", () => {
    expect(configText).toMatch("next-env.d.ts");
    expect(configText).toMatch("@typescript-eslint/triple-slash-reference");
  });

  it("should include import sorting rules", () => {
    expect(configText).toMatch("simple-import-sort/imports");
    expect(configText).toMatch("simple-import-sort/exports");
  });

  it("should include prettier config for compatibility", () => {
    expect(configText).toMatch("prettierConfig");
  });

  it("should enforce AI guardrails: no-explicit-any", () => {
    expect(configText).toMatch("@typescript-eslint/no-explicit-any");
  });

  it("should enforce AI guardrails: no-console", () => {
    expect(configText).toMatch("no-console");
  });

  it("should enforce AI guardrails: no-restricted-globals for document/window", () => {
    expect(configText).toMatch("no-restricted-globals");
    expect(configText).toMatch("document");
    expect(configText).toMatch("window");
  });

  it("should have test file overrides that disable guardrails", () => {
    expect(configText).toMatch("test/**/*.{ts,tsx}");
    expect(configText).toMatch("no-console");
    expect(configText).toMatch("no-restricted-globals");
    expect(configText).toMatch("@typescript-eslint/no-explicit-any");
  });

  it("should have API route overrides for console.error", () => {
    expect(configText).toMatch("app/api/**/*.ts");
    expect(configText).toMatch("no-console");
    expect(configText).toMatch("error");
  });

  it("should have lib/error-logging.ts override for console", () => {
    expect(configText).toMatch("lib/error-logging.ts");
    expect(configText).toMatch("no-console");
    expect(configText).toMatch("off");
  });

  it("should enforce AI guardrails: no-misused-promises", () => {
    expect(configText).toMatch("@typescript-eslint/no-misused-promises");
  });

  it("should enforce AI guardrails: no-restricted-syntax", () => {
    expect(configText).toMatch("no-restricted-syntax");
    expect(configText).toMatch("TSTypeReference");
    expect(configText).toMatch("TSAnyKeyword");
  });

  it("should have Sentry instrumentation files override for console", () => {
    expect(configText).toMatch("instrumentation.ts");
    expect(configText).toMatch("instrumentation-client.ts");
    expect(configText).toMatch("sentry.*.config.ts");
    expect(configText).toMatch("no-console");
    expect(configText).toMatch("off");
  });

  it("should have specific component overrides for window access", () => {
    expect(configText).toMatch("app/components/GlobalErrorHandler.tsx");
    expect(configText).toMatch("no-restricted-globals");
    expect(configText).toMatch("off");
  });
});
