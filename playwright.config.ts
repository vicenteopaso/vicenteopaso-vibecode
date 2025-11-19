import { defineConfig } from "@playwright/test";

// Restrict Playwright to only run end-to-end tests under test/e2e.
// This avoids trying to load Vitest unit tests (which may use top-level await)
// with Playwright's require()-based loader.
//
// The base URL and dev server command are configurable so tests can
// either reuse an existing dev server or start one automatically.
const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./test/e2e",
  use: {
    baseURL: BASE_URL,
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? "yarn dev",
        url: BASE_URL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      },
});
