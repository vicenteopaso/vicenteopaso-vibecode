import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { waitForStableHeight } from "../utils";

/**
 * Wait for footer to be fully loaded
 */
async function waitForFooter(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector("footer", { state: "visible" });
  await waitForStableHeight(page);
}

test.describe("Footer Visual Regression", () => {
  test("renders footer in light mode", async ({ page }) => {
    await page.goto("/");
    await waitForFooter(page);

    const footer = page.locator("footer");

    await expect(footer).toHaveScreenshot("footer-light.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders footer in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForFooter(page);

    const footer = page.locator("footer");

    await expect(footer).toHaveScreenshot("footer-dark.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders footer on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForFooter(page);

    const footer = page.locator("footer");

    await expect(footer).toHaveScreenshot("footer-mobile.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders footer on CV page", async ({ page }) => {
    await page.goto("/cv");
    await waitForFooter(page);

    const footer = page.locator("footer");

    await expect(footer).toHaveScreenshot("footer-cv-page.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });
});
