import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import prettierConfig from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import security from "eslint-plugin-security";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

const ignores = [
  "**/.next/**",
  "**/node_modules/**",
  "**/.contentlayer/**",
  "**/.turbo/**",
  "coverage/**",
  ".next-env.d.ts",
];

export default [
  {
    ignores,
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  nextPlugin.configs["core-web-vitals"],
  jsxA11y.flatConfigs.recommended,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      security,
    },
    rules: {
      // Type safety rules (see docs/FORBIDDEN_PATTERNS.md)
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn", // Upgrade to error in future
      "@typescript-eslint/no-non-null-assertion": "warn",
      
      // Import organization
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      
      // Unused variables
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      
      // Security rules (see docs/FORBIDDEN_PATTERNS.md for rationale)
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-new-buffer": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-non-literal-require": "warn",
      "security/detect-pseudoRandomBytes": "error",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "off",
      
      // Console usage (prefer centralized logging from lib/error-logging)
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    },
  },
  {
    // Scripts, config files, and observability setup are exempt from some rules
    files: ["scripts/**/*.mjs", "*.config.{js,mjs,ts}", "instrumentation*.ts", "sentry.*.config.ts"],
    rules: {
      "security/detect-non-literal-require": "off",
      "security/detect-child-process": "off",
      "security/detect-non-literal-fs-filename": "off",
      "security/detect-non-literal-regexp": "off",
      "security/detect-unsafe-regex": "off",
      "no-console": "off", // Scripts and instrumentation setup require console for diagnostics
    },
  },
  {
    files: ["next-env.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
  prettierConfig,
];
