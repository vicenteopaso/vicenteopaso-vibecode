import { expect, test } from "@playwright/test";

import {
  freezeCarouselInteractions,
  setThemeDark,
  setThemeLight,
  waitForHomepage,
  waitForStableTransform,
} from "../utils";

test.describe("Impact Cards Visual Regression", () => {
  test("renders impact cards in light mode", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    const impactCards = page.locator('[data-testid="impact-cards"]');
    await expect(impactCards).toBeVisible();

    await expect(impactCards).toHaveScreenshot("impact-cards-light.png", {
      animations: "disabled",
    });
  });

  test("renders impact cards in dark mode", async ({ page }) => {
    await setThemeDark(page);
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
    await setThemeLight(page);
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
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    // Select the first visible impact card within the container
    const impactCardsContainer = page.locator('[data-testid="impact-cards"]');
    const impactCard = impactCardsContainer.locator(".impact-card").first();
    await expect(impactCard).toBeVisible();

    // Scroll the card into view and ensure it's in the viewport
    await impactCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Take a screenshot with proper clip to ensure we capture the element, not viewport
    await expect(impactCard).toHaveScreenshot("impact-card-single-light.png", {
      animations: "disabled",
    });
  });
});
