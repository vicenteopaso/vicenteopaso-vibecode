import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { waitForStableHeight } from "../utils";

/**
 * Wait for navigation to be fully loaded and stable
 */
async function waitForNavigation(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);

  // Wait for navigation menu to be visible
  await page.waitForSelector("nav", { state: "visible" });

  // Wait for logo to be visible
  await page.waitForSelector('img[alt="Opaso logo"]', { state: "visible" });

  await waitForStableHeight(page);
}

test.describe("Navigation Menu Visual Regression", () => {
  test("renders navigation correctly in light mode", async ({ page }) => {
    await page.goto("/");
    await waitForNavigation(page);

    // Get the header/navigation element
    const header = page.locator("header");

    await expect(header).toHaveScreenshot("navigation-light.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders navigation correctly in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForNavigation(page);

    const header = page.locator("header");

    await expect(header).toHaveScreenshot("navigation-dark.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders navigation on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForNavigation(page);

    const header = page.locator("header");

    await expect(header).toHaveScreenshot("navigation-mobile.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders CV link as active on CV page", async ({ page }) => {
    await page.goto("/cv");
    await waitForNavigation(page);

    const header = page.locator("header");

    await expect(header).toHaveScreenshot("navigation-cv-active.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders CV link as active on CV page (dark mode)", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cv");
    await waitForNavigation(page);

    const header = page.locator("header");

    await expect(header).toHaveScreenshot("navigation-cv-active-dark.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });
});
