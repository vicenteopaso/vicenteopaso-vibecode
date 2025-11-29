import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { waitForStableHeight } from "../utils";

/**
 * Wait for a modal dialog to be fully rendered
 */
async function waitForModal(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);

  // Wait for the dialog content to be visible
  await page.waitForSelector('[role="dialog"]', { state: "visible" });

  // Wait for height to stabilize
  await waitForStableHeight(page);
}

test.describe("Modal Visual Regression", () => {
  test.describe("Contact Modal (via Modal component)", () => {
    test("renders modal overlay in light mode", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Open contact dialog to test the Modal component
      await page.click('button:has-text("Contact")');
      await waitForModal(page);

      // Take a screenshot of the entire page including overlay
      const turnstileMask = page.locator(".cf-turnstile");

      await expect(page).toHaveScreenshot("modal-overlay-light.png", {
        animations: "disabled",
        timeout: 15000,
        mask: [turnstileMask],
      });
    });

    test("renders modal overlay in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.click('button:has-text("Contact")');
      await waitForModal(page);

      const turnstileMask = page.locator(".cf-turnstile");

      await expect(page).toHaveScreenshot("modal-overlay-dark.png", {
        animations: "disabled",
        timeout: 15000,
        mask: [turnstileMask],
      });
    });

    test("renders modal on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.click('button:has-text("Contact")');
      await waitForModal(page);

      const turnstileMask = page.locator(".cf-turnstile");

      await expect(page).toHaveScreenshot("modal-overlay-mobile.png", {
        animations: "disabled",
        timeout: 15000,
        mask: [turnstileMask],
      });
    });
  });

  test.describe("Modal Size Variants", () => {
    // Contact dialog uses "md" size
    test("renders medium size modal", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.click('button:has-text("Contact")');
      await waitForModal(page);

      const dialog = page.locator('[role="dialog"]');
      const turnstileMask = page.locator(".cf-turnstile");

      await expect(dialog).toHaveScreenshot("modal-size-md.png", {
        animations: "disabled",
        timeout: 15000,
        mask: [turnstileMask],
      });
    });
  });
});
