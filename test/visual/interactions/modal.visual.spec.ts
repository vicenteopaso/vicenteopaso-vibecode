import { expect, test } from "@playwright/test";

import {
  contactDialogMasks,
  waitForHomepage,
  waitForModalClose,
  waitForModalOpen,
} from "../utils";

test.describe("Modal Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Use reduced motion to minimize animation-related flakiness
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("contact dialog open state in light mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog from navigation
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Verify dialog is visible
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Contact me" }),
    ).toBeVisible();

    // Screenshot the dialog
    await expect(page.getByRole("dialog")).toHaveScreenshot(
      "contact-dialog-open-light.png",
      {
        animations: "disabled",
        mask: await contactDialogMasks(page),
      },
    );
  });

  test("contact dialog open state in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog from navigation
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Verify dialog is visible
    await expect(page.getByRole("dialog")).toBeVisible();

    // Screenshot the dialog
    await expect(page.getByRole("dialog")).toHaveScreenshot(
      "contact-dialog-open-dark.png",
      {
        animations: "disabled",
        mask: await contactDialogMasks(page),
      },
    );
  });

  test("contact dialog with backdrop overlay", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Screenshot the full page showing dialog with backdrop
    await expect(page).toHaveScreenshot("contact-dialog-with-backdrop.png", {
      fullPage: true,
      animations: "disabled",
      mask: await contactDialogMasks(page),
    });
  });

  test("contact dialog close button visible and accessible", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Verify Close button is visible
    const closeButton = page.getByRole("button", { name: "Close" });
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toBeEnabled();

    // Close the dialog
    await closeButton.click();
    await waitForModalClose(page);

    // Verify dialog is closed
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("contact dialog form elements in correct state", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Verify form elements are present
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Phone (optional)")).toBeVisible();
    await expect(page.getByLabel("Message")).toBeVisible();

    // Verify send button is present (but disabled without Turnstile token)
    const sendButton = page.getByRole("button", { name: "Send" });
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled();

    // Screenshot the form
    const form = page.locator('form[novalidate]');
    await expect(form).toHaveScreenshot("contact-form-initial-state.png", {
      animations: "disabled",
      mask: await contactDialogMasks(page),
    });
  });

  test("contact dialog mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Screenshot dialog on mobile
    await expect(page.getByRole("dialog")).toHaveScreenshot(
      "contact-dialog-mobile.png",
      {
        animations: "disabled",
        mask: await contactDialogMasks(page),
      },
    );
  });
});
