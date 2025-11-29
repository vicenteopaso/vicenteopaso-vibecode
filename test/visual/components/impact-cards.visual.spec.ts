import { expect, test } from "@playwright/test";

import {
  freezeCarouselInteractions,
  waitForHomepage,
  waitForStableHeight,
  waitForStableTransform,
} from "../utils";

test.describe("Impact Cards Visual Regression", () => {
  test("renders impact cards in light mode", async ({ page }) => {
    await page.goto("/");
    await waitForHomepage(page);

    // Get the impact cards container
    const impactCards = page.locator('[data-testid="impact-cards"]');

    // Ensure carousel is frozen
    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    // Note: We're masking the entire impact cards section due to random card rotation
    // but we still test the styling and layout
    await expect(impactCards).toHaveScreenshot("impact-cards-light.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders impact cards in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    const impactCards = page.locator('[data-testid="impact-cards"]');
    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    await expect(impactCards).toHaveScreenshot("impact-cards-dark.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders impact cards on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForHomepage(page);

    const impactCards = page.locator('[data-testid="impact-cards"]');
    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    await expect(impactCards).toHaveScreenshot("impact-cards-mobile.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders impact cards grid layout in tablet viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector('[data-testid="impact-cards"]', {
      state: "visible",
    });
    await waitForStableHeight(page);

    const impactCards = page.locator('[data-testid="impact-cards"]');
    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    await expect(impactCards).toHaveScreenshot("impact-cards-tablet.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });
});
