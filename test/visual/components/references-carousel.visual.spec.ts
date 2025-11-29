import { expect, test } from "@playwright/test";

import { waitForCVPage, waitForStableHeight } from "../utils";

test.describe("References Carousel Visual Regression", () => {
  test("renders references section in light mode", async ({ page }) => {
    await page.goto("/cv");
    await waitForCVPage(page);

    // Get the references section
    const referencesSection = page.locator("#references");

    // Note: The carousel content is masked by cvPageMasks, but we test the section structure
    await expect(referencesSection).toHaveScreenshot("references-light.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders references section in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cv");
    await waitForCVPage(page);

    const referencesSection = page.locator("#references");

    await expect(referencesSection).toHaveScreenshot("references-dark.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders references section on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/cv");
    await waitForCVPage(page);

    const referencesSection = page.locator("#references");

    await expect(referencesSection).toHaveScreenshot("references-mobile.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders references carousel navigation indicators", async ({
    page,
  }) => {
    await page.goto("/cv");
    await waitForCVPage(page);

    // Focus on the carousel navigation dots/buttons
    const referencesSection = page.locator("#references");

    // Wait for navigation indicators to be visible
    await referencesSection
      .locator('button[aria-label*="Show reference"]')
      .first()
      .waitFor({ state: "visible" });

    await expect(referencesSection).toHaveScreenshot(
      "references-with-navigation.png",
      {
        animations: "disabled",
        timeout: 15000,
      },
    );
  });

  test("renders references carousel in tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector("#references", { state: "visible" });
    await waitForStableHeight(page);

    const referencesSection = page.locator("#references");

    await expect(referencesSection).toHaveScreenshot("references-tablet.png", {
      animations: "disabled",
      timeout: 15000,
    });
  });
});
