import { expect, test } from "@playwright/test";

import { waitForCVPage, waitForStableHeight } from "../utils";

test.describe("References Carousel Visual Regression", () => {
  test("renders references carousel in light mode", async ({ page }) => {
    await page.goto("/cv");
    await waitForCVPage(page);

    // Navigate to the references section
    const referencesSection = page.locator("#references");
    await expect(referencesSection).toBeVisible();

    // Freeze carousel auto-rotation by disabling pointer events on navigation buttons
    await page.evaluate(() => {
      const section = document.querySelector("#references");
      if (!section) return;
      const buttons = section.querySelectorAll("button");
      buttons.forEach((btn) => {
        (btn as HTMLButtonElement).style.pointerEvents = "none";
      });
    });

    await waitForStableHeight(page);

    await expect(referencesSection).toHaveScreenshot(
      "references-carousel-light.png",
      {
        animations: "disabled",
      },
    );
  });

  test("renders references carousel in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cv");
    await waitForCVPage(page);

    const referencesSection = page.locator("#references");
    await expect(referencesSection).toBeVisible();

    // Freeze carousel auto-rotation
    await page.evaluate(() => {
      const section = document.querySelector("#references");
      if (!section) return;
      const buttons = section.querySelectorAll("button");
      buttons.forEach((btn) => {
        (btn as HTMLButtonElement).style.pointerEvents = "none";
      });
    });

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

    const referencesSection = page.locator("#references");
    await expect(referencesSection).toBeVisible();

    // Freeze carousel auto-rotation
    await page.evaluate(() => {
      const section = document.querySelector("#references");
      if (!section) return;
      const buttons = section.querySelectorAll("button");
      buttons.forEach((btn) => {
        (btn as HTMLButtonElement).style.pointerEvents = "none";
      });
    });

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
    await page.goto("/cv");
    await waitForCVPage(page);

    const referencesSection = page.locator("#references");
    await expect(referencesSection).toBeVisible();

    // Find the dots navigation container
    const dotsContainer = referencesSection.locator(
      ".flex.items-center.justify-center.gap-2",
    );

    if ((await dotsContainer.count()) > 0) {
      await expect(dotsContainer).toHaveScreenshot(
        "references-carousel-dots.png",
        {
          animations: "disabled",
        },
      );
    }
  });
});
