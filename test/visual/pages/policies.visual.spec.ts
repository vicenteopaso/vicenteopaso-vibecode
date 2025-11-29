import { expect, test } from "@playwright/test";

import { waitForStableHeight } from "../utils";

// Helper to wait for a policy page to be fully loaded and ready for screenshot
async function waitForPolicyPage(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Wait for page heading to be visible
  await page.waitForSelector("h1", { state: "visible" });

  // Wait for footer to ensure full page is rendered
  await page.waitForSelector("footer", { state: "visible" });

  await waitForStableHeight(page);
}

test.describe("Accessibility Page Visual Regression", () => {
  test("renders accessibility page in light mode", async ({ page }) => {
    await page.goto("/accessibility");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("accessibility-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders accessibility page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/accessibility");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("accessibility-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders accessibility page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/accessibility");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("accessibility-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});
