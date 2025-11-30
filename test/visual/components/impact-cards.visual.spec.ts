import { expect, test } from "@playwright/test";

import {
  freezeCarouselInteractions,
  waitForHomepage,
  waitForStableTransform,
} from "../utils";

test.describe("Impact Cards Visual Regression", () => {
  test("renders impact cards in light mode", async ({ page }) => {
    await page.goto("/");
    await waitForHomepage(page);

    // Wait for ImpactCards to be stable
    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    // Find the impact cards container using data-testid for reliable selection
    const impactCards = page.locator('[data-testid="impact-cards"]');
    await expect(impactCards).toBeVisible();

    await expect(impactCards).toHaveScreenshot("impact-cards-light.png", {
      animations: "disabled",
    });
  });

  test("renders impact cards in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    const impactCards = page.locator('[data-testid="impact-cards"]');
    await expect(impactCards).toBeVisible();

    await expect(impactCards).toHaveScreenshot("impact-cards-dark.png", {
      animations: "disabled",
    });
  });

  test("renders impact cards on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForHomepage(page);

    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    const impactCards = page.locator('[data-testid="impact-cards"]');
    await expect(impactCards).toBeVisible();

    await expect(impactCards).toHaveScreenshot("impact-cards-mobile.png", {
      animations: "disabled",
    });
  });
});

test.describe("Impact Cards Individual Card Visual Regression", () => {
  test("renders single impact card style correctly", async ({ page }) => {
    await page.goto("/");
    await waitForHomepage(page);

    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    // Get the first visible impact card
    const impactCard = page.locator(".impact-card").first();
    await expect(impactCard).toBeVisible();

    await expect(impactCard).toHaveScreenshot("impact-card-single-light.png", {
      animations: "disabled",
    });
  });
});
