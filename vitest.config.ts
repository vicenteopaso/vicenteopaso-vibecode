import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup-vitest.ts"],
    exclude: [...configDefaults.exclude, "test/e2e/**"],
  },
});
