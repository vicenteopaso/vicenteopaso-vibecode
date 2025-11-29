import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { waitForStableHeight } from "../utils";

/**
 * Wait for the contact dialog to be fully rendered
 */
async function waitForContactDialog(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);

  // Wait for the dialog content to be visible
  await page.waitForSelector('[role="dialog"]', { state: "visible" });

  // Wait for the form to be visible
  await page.waitForSelector("form", { state: "visible" });

  // Wait for height to stabilize
  await waitForStableHeight(page);
}

test.describe("Contact Dialog Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page and open contact dialog
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
  });

  test("renders contact dialog in light mode", async ({ page }) => {
    // Click the Contact button in the navigation
    await page.click('button:has-text("Contact")');
    await waitForContactDialog(page);

    // Get the dialog content
    const dialog = page.locator('[role="dialog"]');

    // Mask the Turnstile widget since it's dynamic
    const turnstileMask = page.locator(".cf-turnstile");

    await expect(dialog).toHaveScreenshot("contact-dialog-light.png", {
      animations: "disabled",
      timeout: 15000,
      mask: [turnstileMask],
    });
  });

  test("renders contact dialog in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.click('button:has-text("Contact")');
    await waitForContactDialog(page);

    const dialog = page.locator('[role="dialog"]');
    const turnstileMask = page.locator(".cf-turnstile");

    await expect(dialog).toHaveScreenshot("contact-dialog-dark.png", {
      animations: "disabled",
      timeout: 15000,
      mask: [turnstileMask],
    });
  });

  test("renders contact dialog on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.click('button:has-text("Contact")');
    await waitForContactDialog(page);

    const dialog = page.locator('[role="dialog"]');
    const turnstileMask = page.locator(".cf-turnstile");

    await expect(dialog).toHaveScreenshot("contact-dialog-mobile.png", {
      animations: "disabled",
      timeout: 15000,
      mask: [turnstileMask],
    });
  });

  test("renders contact dialog with validation errors", async ({ page }) => {
    await page.click('button:has-text("Contact")');
    await waitForContactDialog(page);

    // Wait a bit for Turnstile to potentially render (even if incomplete)
    await page.waitForTimeout(500);

    // Try to click the Send button to trigger validation errors
    // Note: The button may be disabled if Turnstile token is not present
    const sendButton = page.locator('button[type="submit"]:has-text("Send")');

    // If button is disabled, we can still show the initial state
    // Otherwise, click to trigger validation
    const isDisabled = await sendButton.isDisabled();

    if (!isDisabled) {
      await sendButton.click();
      // Wait for error messages to appear
      await page.waitForSelector('[aria-live="polite"]', { state: "visible" });
    }

    const dialog = page.locator('[role="dialog"]');
    const turnstileMask = page.locator(".cf-turnstile");

    await expect(dialog).toHaveScreenshot("contact-dialog-validation.png", {
      animations: "disabled",
      timeout: 15000,
      mask: [turnstileMask],
    });
  });
});
