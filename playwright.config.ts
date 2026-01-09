import { defineConfig } from "@playwright/test";

// Playwright runs both E2E tests (test/e2e) and visual regression tests (test/visual).
// The testMatch pattern ensures we only load Playwright test files, not Vitest unit tests.
//
// The base URL and dev server command are configurable so tests can
// either reuse an existing dev server or start one automatically.
const PORT = Number(process.env.PORT ?? 3000);
// Use localhost so the origin matches what Next.js expects in development.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testMatch: /.*\.(spec|test)\.(ts|tsx)$/,
  testDir: "./test",
  testIgnore: ["**/test/unit/**"],
  timeout: 30000,
  use: {
    baseURL: BASE_URL,
    // Send header that disables Vercel Toolbar (per Vercel docs).
    // Note: This does NOT disable Speed Insights (different product), which we suppress
    // via runtime detection in `AnalyticsWrapper`.
    extraHTTPHeaders: {
      "x-vercel-skip-toolbar": "1",
    },
  },
  // Visual regression testing configuration
  expect: {
    toHaveScreenshot: {
      // Maximum allowed pixel difference (set low for effective regression; override per-test if needed)
      maxDiffPixels: 200,
      // Threshold for pixel comparison (0-1, lower is stricter)
      // Increased to handle carousel and animated content
      threshold: 0.5,
      // Disable animations for consistent screenshots
      animations: "disabled" as const,
    },
  },
  // Reporter configuration
  // Both E2E and visual tests (including those in test/visual/ that override testDir)
  // will share the same output location ("playwright-report"). The visual regression settings above
  // (lines 18-28) apply to both E2E tests (when they use screenshots) and dedicated visual tests.
  // If you need to separate reports by test type in the future, adjust the outputFolder accordingly.
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? "pnpm dev",
        url: BASE_URL,
        // Allow extra time for Next.js dev server cold start before visual tests
        timeout: 300_000,
        reuseExistingServer: !process.env.CI,
      },
});
