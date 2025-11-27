import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup-vitest.ts"],
    exclude: [
      ...configDefaults.exclude,
      "test/e2e/**",
      "next-sitemap.config.*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage/unit",
      exclude: [
        "test/**",
        "playwright.config.*",
        "next.config.*",
        "next-sitemap.config.*",
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
        // Static content and policy surfaces that are covered indirectly via E2E
        "app/api/content/**",
        "app/components/CookiePolicyModal.tsx",
        "app/components/PrivacyPolicyModal.tsx",
        "app/components/TechStackModal.tsx",
        "app/components/ImpactCards.tsx",
        "app/cookie-policy/**",
        "app/privacy-policy/**",
        "lib/analytics.*",
        "postcss.config.*",
        "vitest.config.*",
      ],
      thresholds: {
        // Adjust these to your desired minimum coverage percentages
        lines: 90,
        statements: 90,
        branches: 85,
        functions: 90,
      },
    },
  },
});
