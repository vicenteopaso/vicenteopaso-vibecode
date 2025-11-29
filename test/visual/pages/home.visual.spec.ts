import { expect, test } from "@playwright/test";

import {
  freezeCarouselInteractions,
  homepageMasks,
  waitForStableHeight,
  waitForStableTransform,
} from "../utils";

test.describe("Homepage Visual Regression", () => {
  test("renders homepage correctly in light mode", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for profile image to be visible and loaded
    await page.waitForSelector('img[alt*="Portrait"]', { state: "visible" });

    // Wait for carousel container (ImpactCards) to be visible
    await page.waitForSelector('[data-testid="impact-cards"], .space-y-6', {
      state: "visible",
    });

    // Wait for footer to ensure full page is rendered
    await page.waitForSelector("footer", { state: "visible" });

    await waitForStableHeight(page);
    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

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
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for profile image to be visible and loaded
    await page.waitForSelector('img[alt*="Portrait"]', { state: "visible" });

    // Wait for carousel container (ImpactCards) to be visible
    await page.waitForSelector('[data-testid="impact-cards"], .space-y-6', {
      state: "visible",
    });

    // Wait for footer to ensure full page is rendered
    await page.waitForSelector("footer", { state: "visible" });

    await waitForStableHeight(page);
    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

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
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for profile image to be visible and loaded
    await page.waitForSelector('img[alt*="Portrait"]', { state: "visible" });

    // Wait for carousel container (ImpactCards) to be visible
    await page.waitForSelector('[data-testid="impact-cards"], .space-y-6', {
      state: "visible",
    });

    // Wait for footer to ensure full page is rendered
    await page.waitForSelector("footer", { state: "visible" });

    await waitForStableHeight(page);
    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    await expect(page).toHaveScreenshot("homepage-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      maxDiffPixelRatio: 0.02, // Allow for ImpactCards carousel rotation
      mask: await homepageMasks(page),
    });
  });
});
