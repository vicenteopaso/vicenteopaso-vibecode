import { expect, test } from "@playwright/test";

import { cvPageMasks, waitForStableHeight } from "../utils";

test.describe("CV Page Visual Regression", () => {
  test("renders CV page in light mode", async ({ page }) => {
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for CV heading to be visible
    await page.waitForSelector("h1", { state: "visible" });

    // Wait for references section to be fully rendered (includes dynamic height calculation)
    await page.waitForSelector("#references", { state: "visible" });
    await page.waitForSelector("footer", { state: "visible" });

    await waitForStableHeight(page);
    await expect(page).toHaveScreenshot("cv-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      mask: await cvPageMasks(page),
    });
  });

  test("renders CV page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for CV heading to be visible
    await page.waitForSelector("h1", { state: "visible" });

    // Wait for references section to be fully rendered (includes dynamic height calculation)
    await page.waitForSelector("#references", { state: "visible" });
    await page.waitForSelector("footer", { state: "visible" });

    await waitForStableHeight(page);
    await expect(page).toHaveScreenshot("cv-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      mask: await cvPageMasks(page),
    });
  });

  test("renders CV page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for CV heading to be visible
    await page.waitForSelector("h1", { state: "visible" });

    // Wait for references section to be fully rendered (includes dynamic height calculation)
    await page.waitForSelector("#references", { state: "visible" });
    await page.waitForSelector("footer", { state: "visible" });

    await waitForStableHeight(page);

    await expect(page).toHaveScreenshot("cv-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      mask: await cvPageMasks(page),
    });
  });
});
