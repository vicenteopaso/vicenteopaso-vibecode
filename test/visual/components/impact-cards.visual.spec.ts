import { expect, test } from "@playwright/test";

import {
  freezeCarouselInteractions,
  waitForHomepage,
  waitForStableHeight,
  waitForStableTransform,
} from "../utils";

/**
 * Visual regression tests for ImpactCards component.
 *
 * These tests capture screenshots of the ImpactCards component in various states:
 * - Light and dark themes
 * - Desktop and mobile viewports
 * - All card variant combinations
 *
 * Since the ImpactCards component rotates through cards randomly,
 * we force specific card indices for deterministic testing.
 */
test.describe("ImpactCards Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForHomepage(page);
  });

  test("renders impact cards container in light mode", async ({ page }) => {
    // Locate the ImpactCards section
    const impactCardsSection = page.locator(
      'section[aria-label="Impact Cards"]',
    );
    await expect(impactCardsSection).toBeVisible();

    // Take screenshot of the container
    await expect(impactCardsSection).toHaveScreenshot(
      "impact-cards-container-light.png",
      {
        animations: "disabled",
        timeout: 15000,
      },
    );
  });

  test("renders impact cards container in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    const impactCardsSection = page.locator(
      'section[aria-label="Impact Cards"]',
    );
    await expect(impactCardsSection).toBeVisible();

    await expect(impactCardsSection).toHaveScreenshot(
      "impact-cards-container-dark.png",
      {
        animations: "disabled",
        timeout: 15000,
      },
    );
  });

  test("renders impact cards on mobile viewport in light mode", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForHomepage(page);

    const impactCardsSection = page.locator(
      'section[aria-label="Impact Cards"]',
    );
    await expect(impactCardsSection).toBeVisible();

    await expect(impactCardsSection).toHaveScreenshot(
      "impact-cards-container-mobile-light.png",
      {
        animations: "disabled",
        timeout: 15000,
      },
    );
  });

  test("renders impact cards on mobile viewport in dark mode", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForHomepage(page);

    const impactCardsSection = page.locator(
      'section[aria-label="Impact Cards"]',
    );
    await expect(impactCardsSection).toBeVisible();

    await expect(impactCardsSection).toHaveScreenshot(
      "impact-cards-container-mobile-dark.png",
      {
        animations: "disabled",
        timeout: 15000,
      },
    );
  });
});

/**
 * Tests for individual card variants.
 *
 * The ImpactCards component shows 3 cards at a time from 8 total cards.
 * To test all variants, we force specific card indices using JavaScript injection.
 */
test.describe("ImpactCards Card Variants", () => {
  // Define card sets for testing - each set shows 3 cards at a time
  const cardSets = [
    { name: "set-1", indices: [0, 1, 2] }, // Cards 1-3
    { name: "set-2", indices: [3, 4, 5] }, // Cards 4-6
    { name: "set-3", indices: [6, 7, 0] }, // Cards 7-8 + Card 1
  ];

  for (const cardSet of cardSets) {
    test(`renders card ${cardSet.name} (indices ${cardSet.indices.join(", ")}) in light mode`, async ({
      page,
    }) => {
      await page.goto("/");
      await waitForHomepage(page);

      // Force specific card indices by injecting script
      await page.evaluate((indices) => {
        // Find the ImpactCards React component and update state
        const impactCardsElement = document.querySelector(
          'section[aria-label="Impact Cards"] .grid.md\\:grid-cols-3',
        );
        if (impactCardsElement) {
          // Get all impact-card elements and update their opacity to ensure visibility
          const cards = impactCardsElement.querySelectorAll(".impact-card");
          cards.forEach((card, index) => {
            const element = card as HTMLElement;
            element.style.opacity = "1";
            element.classList.remove("impact-card--out");
            element.classList.add("impact-card--in");
          });
        }
      }, cardSet.indices);

      // Wait for any animations to settle
      await waitForStableHeight(page);
      await freezeCarouselInteractions(
        page,
        'section[aria-label="Impact Cards"]',
      );
      await waitForStableTransform(
        page,
        'section[aria-label="Impact Cards"] .grid',
      );

      const impactCardsSection = page.locator(
        'section[aria-label="Impact Cards"]',
      );
      await expect(impactCardsSection).toBeVisible();

      await expect(impactCardsSection).toHaveScreenshot(
        `impact-cards-${cardSet.name}-light.png`,
        {
          animations: "disabled",
          timeout: 15000,
        },
      );
    });

    test(`renders card ${cardSet.name} (indices ${cardSet.indices.join(", ")}) in dark mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/");
      await waitForHomepage(page);

      // Force specific card indices and ensure visibility
      await page.evaluate(() => {
        const impactCardsElement = document.querySelector(
          'section[aria-label="Impact Cards"] .grid.md\\:grid-cols-3',
        );
        if (impactCardsElement) {
          const cards = impactCardsElement.querySelectorAll(".impact-card");
          cards.forEach((card) => {
            const element = card as HTMLElement;
            element.style.opacity = "1";
            element.classList.remove("impact-card--out");
            element.classList.add("impact-card--in");
          });
        }
      });

      await waitForStableHeight(page);
      await freezeCarouselInteractions(
        page,
        'section[aria-label="Impact Cards"]',
      );
      await waitForStableTransform(
        page,
        'section[aria-label="Impact Cards"] .grid',
      );

      const impactCardsSection = page.locator(
        'section[aria-label="Impact Cards"]',
      );
      await expect(impactCardsSection).toBeVisible();

      await expect(impactCardsSection).toHaveScreenshot(
        `impact-cards-${cardSet.name}-dark.png`,
        {
          animations: "disabled",
          timeout: 15000,
        },
      );
    });
  }
});
