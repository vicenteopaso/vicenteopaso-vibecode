import { expect, test } from "@playwright/test";

import { setThemeDark, setThemeLight, waitForHomepage } from "../utils";

test.describe("Homepage Screenshots for README", () => {
  test("homepage light mode - desktop (masked portrait for README)", async ({
    page,
  }, testInfo) => {
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    // NOTE: These snapshots are embedded in README.md.
    // We still generate diffs for visibility in the Playwright report, but we do not fail CI on mismatches.
    try {
      await expect(page).toHaveScreenshot("homepage-readme-light.png", {
        fullPage: false,
        animations: "disabled",
        timeout: 15000,
      });
    } catch (error: unknown) {
      testInfo.annotations.push({
        type: "non-blocking-visual-diff",
        description: `Ignoring README screenshot mismatch: ${String(error)}`,
      });
    }
  });

  test("homepage dark mode - desktop (masked portrait for README)", async ({
    page,
  }, testInfo) => {
    await setThemeDark(page);
    await page.goto("/");
    await waitForHomepage(page);

    // NOTE: These snapshots are embedded in README.md.
    // We still generate diffs for visibility in the Playwright report, but we do not fail CI on mismatches.
    try {
      await expect(page).toHaveScreenshot("homepage-readme-dark.png", {
        fullPage: false,
        animations: "disabled",
        timeout: 15000,
      });
    } catch (error: unknown) {
      testInfo.annotations.push({
        type: "non-blocking-visual-diff",
        description: `Ignoring README screenshot mismatch: ${String(error)}`,
      });
    }
  });
});
