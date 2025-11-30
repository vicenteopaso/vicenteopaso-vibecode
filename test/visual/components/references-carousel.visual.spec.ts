import { expect, test } from "@playwright/test";

import {
  freezeReferencesCarousel,
  REFERENCES_SECTION_SELECTOR,
  setThemeDark,
  setThemeLight,
  waitForCVPage,
  waitForStableHeight,
} from "../utils";

test.describe("References Carousel Visual Regression", () => {
  test("renders references carousel in light mode", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/cv");
    await waitForCVPage(page);

    const referencesSection = page.locator(REFERENCES_SECTION_SELECTOR);
    await expect(referencesSection).toBeVisible();

    await freezeReferencesCarousel(page);
    await waitForStableHeight(page);

    await expect(referencesSection).toHaveScreenshot(
      "references-carousel-light.png",
      {
        animations: "disabled",
      },
    );
  });

  test("renders references carousel in dark mode", async ({ page }) => {
    await setThemeDark(page);
    await page.goto("/cv");
    await waitForCVPage(page);

    const referencesSection = page.locator(REFERENCES_SECTION_SELECTOR);
    await expect(referencesSection).toBeVisible();

    await freezeReferencesCarousel(page);
    await waitForStableHeight(page);

    await expect(referencesSection).toHaveScreenshot(
      "references-carousel-dark.png",
      {
        animations: "disabled",
      },
    );
  });

  test("renders references carousel on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/cv");
    await waitForCVPage(page);

    const referencesSection = page.locator(REFERENCES_SECTION_SELECTOR);
    await expect(referencesSection).toBeVisible();

    await freezeReferencesCarousel(page);
    await waitForStableHeight(page);

    await expect(referencesSection).toHaveScreenshot(
      "references-carousel-mobile.png",
      {
        animations: "disabled",
      },
    );
  });
});

test.describe("References Carousel Navigation Visual Regression", () => {
  test("renders carousel indicator dots correctly", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/cv");
    await waitForCVPage(page);

    const referencesSection = page.locator(REFERENCES_SECTION_SELECTOR);
    await expect(referencesSection).toBeVisible();

    // Find the dots navigation container using data-testid for reliable selection
    const dotsContainer = referencesSection.locator(
      '[data-testid="references-carousel-dots"]',
    );

    await expect(dotsContainer).toBeVisible();
    await expect(dotsContainer).toHaveScreenshot(
      "references-carousel-dots.png",
      {
        animations: "disabled",
      },
    );
  });
});
