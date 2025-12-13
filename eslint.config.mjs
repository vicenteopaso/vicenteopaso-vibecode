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
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
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
      // Detect hardcoded secrets and sensitive data
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/ghp_[a-zA-Z0-9]{36,}/]",
          message: "Potential GitHub Personal Access Token detected. Use environment variables instead.",
        },
        {
          selector: "Literal[value=/ghs_[a-zA-Z0-9]{36,}/]",
          message: "Potential GitHub OAuth Token detected. Use environment variables instead.",
        },
        {
          selector: "Literal[value=/sk-[a-zA-Z0-9]{20,}/]",
          message: "Potential OpenAI API Key detected. Use environment variables instead.",
        },
        {
          selector: "Literal[value=/AKIA[0-9A-Z]{16}/]",
          message: "Potential AWS Access Key ID detected. Use environment variables instead.",
        },
        {
          selector: "Literal[value=/xox[baprs]-[0-9a-zA-Z]{10,}/]",
          message: "Potential Slack token detected. Use environment variables instead.",
        },
        {
          selector: "Literal[value=/^[a-f0-9]{128,}$/]",
          message: "Very long hexadecimal string detected. If this is a secret, use environment variables.",
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.{js,mjs,ts}"],
    rules: {
      "security/detect-non-literal-require": "off",
      "security/detect-child-process": "off",
      "security/detect-non-literal-fs-filename": "off",
      "security/detect-non-literal-regexp": "off",
      "security/detect-unsafe-regex": "off",
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
