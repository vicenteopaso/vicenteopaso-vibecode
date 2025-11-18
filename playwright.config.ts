import { defineConfig } from "@playwright/test";

// Restrict Playwright to only run end-to-end tests under test/e2e.
// This avoids trying to load Vitest unit tests (which may use top-level await)
// with Playwright's require()-based loader.
export default defineConfig({
  testDir: "./test/e2e",
});
