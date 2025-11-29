import { expect, test } from "@playwright/test";

import { waitForTechStackPage } from "../utils";

test.describe("Tech Stack Page Visual Regression", () => {
  test("renders tech stack page correctly in light mode", async ({ page }) => {
    await page.goto("/tech-stack");
    await waitForTechStackPage(page);

    await expect(page).toHaveScreenshot("tech-stack-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders tech stack page correctly in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/tech-stack");
    await waitForTechStackPage(page);

    await expect(page).toHaveScreenshot("tech-stack-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders tech stack page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/tech-stack");
    await waitForTechStackPage(page);

    await expect(page).toHaveScreenshot("tech-stack-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});
