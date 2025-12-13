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
      // TypeScript guardrails
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      
      // Security rules (see docs/FORBIDDEN_PATTERNS.md for rationale)

      // Import sorting
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Console guardrails - no console allowed in production code
      "no-console": "error",

      // DOM access guardrails - restrict document/window in React components
      "no-restricted-globals": [
        "error",
        {
          name: "document",
          message:
            "Avoid direct DOM access in React components. Use refs or state. See docs/FORBIDDEN_PATTERNS.md",
        },
        {
          name: "window",
          message:
            "Avoid direct window access in React components. Use refs or state. See docs/FORBIDDEN_PATTERNS.md",
        },
      ],

      // Banned syntax patterns
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSTypeReference[typeName.name='any']",
          message:
            "Don't use 'any' type. Use 'unknown' with type guards or define proper types. See docs/FORBIDDEN_PATTERNS.md",
        },
        {
          selector: "TSAsExpression > TSAnyKeyword",
          message:
            "Don't cast to 'any'. Use proper type assertions or type guards. See docs/FORBIDDEN_PATTERNS.md",
        },
      ],

      // Security rules
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
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Type-aware TypeScript rule (requires type information)
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.{js,mjs,ts}", "*.config.{js,mjs,ts}"],
    rules: {
      // Scripts and config files can use console for CLI output
      "no-console": "off",
      // Scripts need direct Node.js APIs
      "security/detect-non-literal-require": "off",
      "security/detect-child-process": "off",
      "security/detect-non-literal-fs-filename": "off",
      "security/detect-non-literal-regexp": "off",
      "security/detect-unsafe-regex": "off",
      "no-console": "off", // Scripts and instrumentation setup require console for diagnostics
      // Scripts may need DOM types for build tooling
      "no-restricted-globals": "off",
    },
  },
  {
    files: ["test/**/*.{ts,tsx}", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      // Tests can use console for debugging
      "no-console": "off",
      // Tests need DOM access for assertions
      "no-restricted-globals": "off",
      // Tests may use 'any' for mocking and test utilities
      "@typescript-eslint/no-explicit-any": "off",
      "no-restricted-syntax": "off",
    },
  },
  {
    files: ["app/api/**/*.ts"],
    rules: {
      // API routes can use console.error for server-side logging
      "no-console": ["error", { allow: ["error"] }],
    },
  },
  {
    files: ["lib/error-logging.ts"],
    rules: {
      // Error logging utility needs console access
      "no-console": "off",
    },
  },
  {
    files: [
      "instrumentation.ts",
      "instrumentation-client.ts",
      "sentry.*.config.ts",
    ],
    rules: {
      // Sentry instrumentation files need console for debug output
      "no-console": "off",
    },
  },
  {
    files: ["next-env.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
  {
    files: [
      "app/components/GlobalErrorHandler.tsx",
      "app/components/ImpactCards.tsx",
      "app/components/ReferencesCarousel.tsx",
      "app/components/ContactDialog.tsx",
      "app/components/AnalyticsWrapper.tsx",
      "app/global-error.tsx",
      "app/components/ErrorBoundary.tsx",
    ],
    rules: {
      // These components legitimately need window access for:
      // - Global error handlers (window.addEventListener)
      // - Browser API checks (window.ResizeObserver)
      // - Third-party library integration (window.turnstile)
      // - Error recovery (window.location.reload)
      "no-restricted-globals": "off",
    },
  },
  prettierConfig,
];
