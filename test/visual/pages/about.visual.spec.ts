import { expect, test } from "@playwright/test";

test.describe("About Page Visual Regression", () => {
  test("renders about page in light mode", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("about-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders about page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/about");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("about-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders about page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/about");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("about-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});
