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

    // Find the section containing impact cards
    // Based on the homepage structure, impact cards are in a section with ImpactCards component
    const impactSection = page.locator(
      'section[aria-label="Impact Cards"], section:has([data-testid="impact-cards"])',
    );

    // If specific section not found, look for the impact cards grid directly
    const impactCards = page.locator('[data-testid="impact-cards"]');
    const target = (await impactSection.count()) > 0 ? impactSection : impactCards;

    if ((await target.count()) === 0) {
      // Fallback: try to find the grid container for impact cards
      const gridFallback = page.locator(".grid.md\\:grid-cols-3").first();
      await expect(gridFallback).toBeVisible();

      await expect(gridFallback).toHaveScreenshot("impact-cards-light.png", {
        animations: "disabled",
      });
    } else {
      await expect(target.first()).toBeVisible();

      await expect(target.first()).toHaveScreenshot("impact-cards-light.png", {
        animations: "disabled",
      });
    }
  });

  test("renders impact cards in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    const impactSection = page.locator(
      'section[aria-label="Impact Cards"], section:has([data-testid="impact-cards"])',
    );
    const impactCards = page.locator('[data-testid="impact-cards"]');
    const target = (await impactSection.count()) > 0 ? impactSection : impactCards;

    if ((await target.count()) === 0) {
      const gridFallback = page.locator(".grid.md\\:grid-cols-3").first();
      await expect(gridFallback).toBeVisible();

      await expect(gridFallback).toHaveScreenshot("impact-cards-dark.png", {
        animations: "disabled",
      });
    } else {
      await expect(target.first()).toBeVisible();

      await expect(target.first()).toHaveScreenshot("impact-cards-dark.png", {
        animations: "disabled",
      });
    }
  });

  test("renders impact cards on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForHomepage(page);

    await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
    await waitForStableTransform(page, '[data-testid="impact-cards"]');

    const impactSection = page.locator(
      'section[aria-label="Impact Cards"], section:has([data-testid="impact-cards"])',
    );
    const impactCards = page.locator('[data-testid="impact-cards"]');
    const target = (await impactSection.count()) > 0 ? impactSection : impactCards;

    if ((await target.count()) === 0) {
      const gridFallback = page.locator(".grid.md\\:grid-cols-3").first();
      await expect(gridFallback).toBeVisible();

      await expect(gridFallback).toHaveScreenshot("impact-cards-mobile.png", {
        animations: "disabled",
      });
    } else {
      await expect(target.first()).toBeVisible();

      await expect(target.first()).toHaveScreenshot("impact-cards-mobile.png", {
        animations: "disabled",
      });
    }
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
