import { expect, test } from "@playwright/test";

import { waitForStableHeight } from "../utils";

// Wait for static policy page to be fully loaded and ready for screenshot
async function waitForPolicyPage(page: Parameters<typeof waitForStableHeight>[0]): Promise<void> {
  await page.waitForLoadState("networkidle");

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Wait for main heading to be visible
  await page.waitForSelector("h1", { state: "visible" });

  // Wait for footer to ensure full page is rendered
  await page.waitForSelector("footer", { state: "visible" });

  await waitForStableHeight(page);
}

test.describe("Technical Governance Page Visual Regression", () => {
  test("renders Technical Governance page in light mode", async ({ page }) => {
    await page.goto("/technical-governance");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("technical-governance-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders Technical Governance page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/technical-governance");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("technical-governance-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders Technical Governance page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/technical-governance");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("technical-governance-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});
