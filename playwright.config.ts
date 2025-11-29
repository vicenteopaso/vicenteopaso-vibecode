import { defineConfig } from "@playwright/test";

// Restrict Playwright to only run end-to-end tests under test/e2e.
// This avoids trying to load Vitest unit tests (which may use top-level await)
// with Playwright's require()-based loader.
//
// The base URL and dev server command are configurable so tests can
// either reuse an existing dev server or start one automatically.
const PORT = Number(process.env.PORT ?? 3000);
// Use localhost so the origin matches what Next.js expects in development.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./test/e2e",
  use: {
    baseURL: BASE_URL,
  },
  // Visual regression testing configuration
  expect: {
    toHaveScreenshot: {
      // Maximum allowed pixel difference
      maxDiffPixels: 100,
      // Threshold for pixel comparison (0-1, lower is stricter)
      threshold: 0.2,
      // Disable animations for consistent screenshots
      animations: "disabled" as const,
    },
  },
  // Reporter configuration
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? "pnpm dev",
        url: BASE_URL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      },
});
