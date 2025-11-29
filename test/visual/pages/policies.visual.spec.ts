import { expect, test } from "@playwright/test";

import { waitForPolicyPage } from "../utils";

test.describe("Privacy Policy Page Visual Regression", () => {
  test("renders privacy policy page in light mode", async ({ page }) => {
    await page.goto("/privacy-policy");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("privacy-policy-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders privacy policy page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/privacy-policy");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("privacy-policy-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders privacy policy page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/privacy-policy");
    await waitForPolicyPage(page);

    await expect(page).toHaveScreenshot("privacy-policy-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});
