import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup-vitest.ts"],
    exclude: [...configDefaults.exclude, "test/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage/unit",
      exclude: [
        "test/**",
        "playwright.config.*",
        "next.config.*",
        "tailwind.config.*",
        "contentlayer.config.*",
        "**/*.d.ts",
        // Build artifacts and generated content
        ".next/**",
        ".contentlayer/**",
        "coverage/**",
        // Project scripts and tooling
        "scripts/**",
        // Low-value or infra files that we don't track coverage for
        "app/config/**",
        "app/cv/opengraph-image.*",
        "app/components/Header.tsx",
        "app/components/Footer.tsx",
        "app/components/ThemeProvider.tsx",
        "lib/analytics.*",
        "postcss.config.*",
        "vitest.config.*",
      ],
      thresholds: {
        // Adjust these to your desired minimum coverage percentages
        lines: 80,
        statements: 80,
        branches: 80,
        functions: 80,
      },
    },
  },
});
