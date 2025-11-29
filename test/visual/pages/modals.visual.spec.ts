import { expect, test } from "@playwright/test";

import { getModalLocator, waitForModal } from "../utils";

test.describe("Modal Variations Visual Regression", () => {
  test.describe("Contact Dialog", () => {
    test("renders contact dialog in light mode", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Click the Contact button in the navigation to open modal
      await page.click('button:has-text("Contact")');

      await waitForModal(page);

      await expect(getModalLocator(page)).toHaveScreenshot(
        "contact-dialog-light.png",
        {
          animations: "disabled",
          timeout: 15000,
        },
      );
    });

    test("renders contact dialog in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Click the Contact button in the navigation to open modal
      await page.click('button:has-text("Contact")');

      await waitForModal(page);

      await expect(getModalLocator(page)).toHaveScreenshot(
        "contact-dialog-dark.png",
        {
          animations: "disabled",
          timeout: 15000,
        },
      );
    });
  });

  test.describe("Privacy Policy Modal", () => {
    test("renders privacy policy modal in light mode", async ({ page }) => {
      await page.goto("/privacy-policy");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);

      // Take a viewport screenshot of the privacy policy page
      await expect(page).toHaveScreenshot("privacy-policy-light.png", {
        animations: "disabled",
        timeout: 15000,
      });
    });

    test("renders privacy policy modal in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/privacy-policy");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);

      // Take a viewport screenshot of the privacy policy page
      await expect(page).toHaveScreenshot("privacy-policy-dark.png", {
        animations: "disabled",
        timeout: 15000,
      });
    });
  });

  test.describe("Cookie Policy Modal", () => {
    test("renders cookie policy modal in light mode", async ({ page }) => {
      await page.goto("/cookie-policy");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);

      // Take a viewport screenshot of the cookie policy page
      await expect(page).toHaveScreenshot("cookie-policy-light.png", {
        animations: "disabled",
        timeout: 15000,
      });
    });

    test("renders cookie policy modal in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/cookie-policy");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);

      // Take a viewport screenshot of the cookie policy page
      await expect(page).toHaveScreenshot("cookie-policy-dark.png", {
        animations: "disabled",
        timeout: 15000,
      });
    });
  });

  test.describe("Tech Stack Modal", () => {
    test("renders tech stack modal in light mode", async ({ page }) => {
      await page.goto("/tech-stack");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);

      // Take a viewport screenshot of the tech stack page
      await expect(page).toHaveScreenshot("tech-stack-light.png", {
        animations: "disabled",
        timeout: 15000,
      });
    });

    test("renders tech stack modal in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/tech-stack");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);

      // Take a viewport screenshot of the tech stack page
      await expect(page).toHaveScreenshot("tech-stack-dark.png", {
        animations: "disabled",
        timeout: 15000,
      });
    });
  });

  test.describe("Modal Size Variations", () => {
    test("renders contact dialog on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Click the Contact button in the navigation to open modal
      await page.click('button:has-text("Contact")');

      await waitForModal(page);

      await expect(getModalLocator(page)).toHaveScreenshot(
        "contact-dialog-mobile.png",
        {
          animations: "disabled",
          timeout: 15000,
        },
      );
    });

    test("renders privacy policy on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/privacy-policy");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);

      await expect(page).toHaveScreenshot("privacy-policy-mobile.png", {
        animations: "disabled",
        timeout: 15000,
      });
    });
  });
});
