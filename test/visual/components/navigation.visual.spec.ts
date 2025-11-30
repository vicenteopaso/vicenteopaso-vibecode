import { expect, test } from "@playwright/test";

import { waitForHomepage, waitForStableHeight } from "../utils";

test.describe("Navigation Menu Visual Regression", () => {
  test("renders navigation correctly in light mode", async ({ page }) => {
    await page.goto("/");
    await waitForHomepage(page);

    // Get the main navigation element (the header shell container)
    const nav = page.locator('nav[aria-label="Main"]');
    await expect(nav).toBeVisible();

    // Take a screenshot of just the navigation
    await expect(nav).toHaveScreenshot("navigation-light.png", {
      animations: "disabled",
    });
  });

  test("renders navigation correctly in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    const nav = page.locator('nav[aria-label="Main"]');
    await expect(nav).toBeVisible();

    await expect(nav).toHaveScreenshot("navigation-dark.png", {
      animations: "disabled",
    });
  });

  test("renders navigation with CV active state in light mode", async ({
    page,
  }) => {
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector("h1", { state: "visible" });
    await waitForStableHeight(page);

    const nav = page.locator('nav[aria-label="Main"]');
    await expect(nav).toBeVisible();

    await expect(nav).toHaveScreenshot("navigation-cv-active-light.png", {
      animations: "disabled",
    });
  });

  test("renders navigation with CV active state in dark mode", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector("h1", { state: "visible" });
    await waitForStableHeight(page);

    const nav = page.locator('nav[aria-label="Main"]');
    await expect(nav).toBeVisible();

    await expect(nav).toHaveScreenshot("navigation-cv-active-dark.png", {
      animations: "disabled",
    });
  });

  test("renders navigation on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForHomepage(page);

    const nav = page.locator('nav[aria-label="Main"]');
    await expect(nav).toBeVisible();

    await expect(nav).toHaveScreenshot("navigation-mobile.png", {
      animations: "disabled",
    });
  });
});
