import { expect, test } from "@playwright/test";

import {
  setThemeDark,
  setThemeLight,
  waitForHomepage,
  waitForStableHeight,
} from "../utils";

test.describe("Contact Dialog Visual Regression", () => {
  test("renders contact dialog in light mode", async ({ page }) => {
    await setThemeLight(page);
    await page.goto("/");
    await waitForHomepage(page);

    // Click the Contact button in the navigation to open the dialog
    await page.click('button:has-text("Contact")');

    // Wait for the dialog to be visible
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await waitForStableHeight(page);

    // Take screenshot of just the dialog
    await expect(dialog).toHaveScreenshot("contact-dialog-light.png", {
      animations: "disabled",
    });
  });

  test("renders contact dialog in dark mode", async ({ page }) => {
    await setThemeDark(page);
    await page.goto("/");
    await waitForHomepage(page);

    // Click the Contact button to open the dialog
    await page.click('button:has-text("Contact")');

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await waitForStableHeight(page);

    await expect(dialog).toHaveScreenshot("contact-dialog-dark.png", {
      animations: "disabled",
    });
  });

  test("renders contact dialog on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForHomepage(page);

    // Click the Contact button
    await page.click('button:has-text("Contact")');

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await waitForStableHeight(page);

    await expect(dialog).toHaveScreenshot("contact-dialog-mobile.png", {
      animations: "disabled",
    });
  });
});
