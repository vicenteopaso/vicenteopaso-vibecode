import { expect, test } from "@playwright/test";

import { waitForCVPage, waitForHomepage } from "../utils";

test.describe("Profile Card Visual Regression", () => {
  test.describe("About Page Variant (with avatar)", () => {
    test("renders profile card in light mode", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      // Get the profile card section (first section with the avatar)
      const profileSection = page.locator("section").first();

      // Mask the portrait image since it's randomly selected
      const portraitMask = page.locator('img[alt*="Portrait"]');

      await expect(profileSection).toHaveScreenshot("profile-card-about-light.png", {
        animations: "disabled",
        timeout: 15000,
        mask: [portraitMask],
      });
    });

    test("renders profile card in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/");
      await waitForHomepage(page);

      const profileSection = page.locator("section").first();
      const portraitMask = page.locator('img[alt*="Portrait"]');

      await expect(profileSection).toHaveScreenshot("profile-card-about-dark.png", {
        animations: "disabled",
        timeout: 15000,
        mask: [portraitMask],
      });
    });

    test("renders profile card on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await waitForHomepage(page);

      const profileSection = page.locator("section").first();
      const portraitMask = page.locator('img[alt*="Portrait"]');

      await expect(profileSection).toHaveScreenshot("profile-card-about-mobile.png", {
        animations: "disabled",
        timeout: 15000,
        mask: [portraitMask],
      });
    });
  });

  test.describe("CV Page Variant (without avatar)", () => {
    test("renders CV header profile card in light mode", async ({ page }) => {
      await page.goto("/cv");
      await waitForCVPage(page);

      // Get the CV header section (ProfileCard without avatar)
      const profileSection = page.locator("section").first();

      await expect(profileSection).toHaveScreenshot("profile-card-cv-light.png", {
        animations: "disabled",
        timeout: 15000,
      });
    });

    test("renders CV header profile card in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/cv");
      await waitForCVPage(page);

      const profileSection = page.locator("section").first();

      await expect(profileSection).toHaveScreenshot("profile-card-cv-dark.png", {
        animations: "disabled",
        timeout: 15000,
      });
    });

    test("renders CV header profile card on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/cv");
      await waitForCVPage(page);

      const profileSection = page.locator("section").first();

      await expect(profileSection).toHaveScreenshot("profile-card-cv-mobile.png", {
        animations: "disabled",
        timeout: 15000,
      });
    });
  });
});
