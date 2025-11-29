import { expect, test } from "@playwright/test";

import {
  freezeCarouselInteractions,
  waitForReferencesCarousel,
  waitForStableHeight,
} from "../utils";

test.describe("ReferencesCarousel Visual Regression", () => {
  test("renders references carousel in light mode", async ({ page }) => {
    await page.goto("/cv");
    await waitForReferencesCarousel(page);

    const referencesSection = page.locator("#references");
    await expect(referencesSection).toBeVisible();

    await expect(referencesSection).toHaveScreenshot(
      "references-carousel-light.png",
      {
        animations: "disabled",
        timeout: 15000,
      },
    );
  });

  test("renders references carousel in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cv");
    await waitForReferencesCarousel(page);

    const referencesSection = page.locator("#references");
    await expect(referencesSection).toBeVisible();

    await expect(referencesSection).toHaveScreenshot(
      "references-carousel-dark.png",
      {
        animations: "disabled",
        timeout: 15000,
      },
    );
  });

  test("renders references carousel on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/cv");
    await waitForReferencesCarousel(page);

    const referencesSection = page.locator("#references");
    await expect(referencesSection).toBeVisible();

    await expect(referencesSection).toHaveScreenshot(
      "references-carousel-mobile.png",
      {
        animations: "disabled",
        timeout: 15000,
      },
    );
  });

  test("carousel dots indicator displays correctly", async ({ page }) => {
    await page.goto("/cv");
    await waitForReferencesCarousel(page);

    const referencesSection = page.locator("#references");
    await expect(referencesSection).toBeVisible();

    // Ensure dots container exists and has buttons
    const dotsContainer = referencesSection.locator(
      ".flex.items-center.justify-center.gap-2",
    );
    await expect(dotsContainer).toBeVisible();

    // Take screenshot of just the dots area
    await expect(dotsContainer).toHaveScreenshot(
      "references-carousel-dots-light.png",
      {
        animations: "disabled",
        timeout: 15000,
      },
    );
  });

  test("carousel dots indicator in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cv");
    await waitForReferencesCarousel(page);

    const referencesSection = page.locator("#references");
    await expect(referencesSection).toBeVisible();

    const dotsContainer = referencesSection.locator(
      ".flex.items-center.justify-center.gap-2",
    );
    await expect(dotsContainer).toBeVisible();

    await expect(dotsContainer).toHaveScreenshot(
      "references-carousel-dots-dark.png",
      {
        animations: "disabled",
        timeout: 15000,
      },
    );
  });

  test("freezes carousel to prevent rotation during screenshot", async ({
    page,
  }) => {
    await page.goto("/cv");
    await waitForReferencesCarousel(page);

    // Freeze carousel interactions to ensure consistent screenshots
    await freezeCarouselInteractions(page, "#references");
    await waitForStableHeight(page);

    const referencesSection = page.locator("#references");
    await expect(referencesSection).toBeVisible();

    // Take two screenshots quickly to verify they match (carousel is frozen)
    const screenshot1 = await referencesSection.screenshot({
      animations: "disabled",
    });
    await page.waitForTimeout(100);
    const screenshot2 = await referencesSection.screenshot({
      animations: "disabled",
    });

    // Both screenshots should be identical since carousel is frozen
    expect(screenshot1).toEqual(screenshot2);
  });
});
