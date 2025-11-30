import { expect, test } from "@playwright/test";

import { waitForCVPage, waitForHomepage } from "../utils";

test.describe("Profile Card Visual Regression", () => {
  test.describe("Homepage Profile Card (with avatar)", () => {
    test("renders profile card in light mode", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      // Target the header section which contains the ProfileCard
      const profileSection = page.locator("header.section-card");
      await expect(profileSection).toBeVisible();

      // Mask the portrait image since it's randomly selected
      const portraitMask = page.locator('img[alt*="Portrait"]');

      await expect(profileSection).toHaveScreenshot(
        "profile-card-homepage-light.png",
        {
          animations: "disabled",
          mask: [portraitMask],
        },
      );
    });

    test("renders profile card in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/");
      await waitForHomepage(page);

      const profileSection = page.locator("header.section-card");
      await expect(profileSection).toBeVisible();

      const portraitMask = page.locator('img[alt*="Portrait"]');

      await expect(profileSection).toHaveScreenshot(
        "profile-card-homepage-dark.png",
        {
          animations: "disabled",
          mask: [portraitMask],
        },
      );
    });

    test("renders profile card on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await waitForHomepage(page);

      const profileSection = page.locator("header.section-card");
      await expect(profileSection).toBeVisible();

      const portraitMask = page.locator('img[alt*="Portrait"]');

      await expect(profileSection).toHaveScreenshot(
        "profile-card-homepage-mobile.png",
        {
          animations: "disabled",
          mask: [portraitMask],
        },
      );
    });
  });

  test.describe("CV Profile Card (without avatar)", () => {
    test("renders CV header profile card in light mode", async ({ page }) => {
      await page.goto("/cv");
      await waitForCVPage(page);

      // CV page has a header section-card with ProfileCard (no avatar)
      const profileSection = page.locator("header.section-card");
      await expect(profileSection).toBeVisible();

      await expect(profileSection).toHaveScreenshot(
        "profile-card-cv-light.png",
        {
          animations: "disabled",
        },
      );
    });

    test("renders CV header profile card in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/cv");
      await waitForCVPage(page);

      const profileSection = page.locator("header.section-card");
      await expect(profileSection).toBeVisible();

      await expect(profileSection).toHaveScreenshot("profile-card-cv-dark.png", {
        animations: "disabled",
      });
    });

    test("renders CV header profile card on mobile viewport", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/cv");
      await waitForCVPage(page);

      const profileSection = page.locator("header.section-card");
      await expect(profileSection).toBeVisible();

      await expect(profileSection).toHaveScreenshot(
        "profile-card-cv-mobile.png",
        {
          animations: "disabled",
        },
      );
    });
  });
});
