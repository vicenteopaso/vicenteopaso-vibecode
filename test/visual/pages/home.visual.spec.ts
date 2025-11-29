import { expect, test } from "@playwright/test";

import { homepageMasks, waitForHomepage } from "../utils";

test.describe("Homepage Visual Regression", () => {
  test("renders homepage correctly in light mode", async ({ page }) => {
    await page.goto("/");
    await waitForHomepage(page);

    // Take full page screenshot
    await expect(page).toHaveScreenshot("homepage-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      maxDiffPixelRatio: 0.02, // Allow for ImpactCards carousel rotation
      mask: await homepageMasks(page),
    });
  });

  test("renders homepage correctly in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    await expect(page).toHaveScreenshot("homepage-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      maxDiffPixelRatio: 0.02, // Allow for ImpactCards carousel rotation
      mask: await homepageMasks(page),
    });
  });

  test("renders homepage on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForHomepage(page);

    await expect(page).toHaveScreenshot("homepage-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      maxDiffPixelRatio: 0.02, // Allow for ImpactCards carousel rotation
      mask: await homepageMasks(page),
    });
  });
});
