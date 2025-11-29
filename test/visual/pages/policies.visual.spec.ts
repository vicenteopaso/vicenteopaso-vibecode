import { expect, test } from "@playwright/test";

import { waitForPolicyPage } from "../utils";

test.describe("Cookie Policy Page Visual Regression", () => {
  test("renders cookie policy page in light mode", async ({ page }) => {
    await page.goto("/cookie-policy");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("cookie-policy-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders cookie policy page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cookie-policy");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("cookie-policy-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders cookie policy page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/cookie-policy");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("cookie-policy-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});
