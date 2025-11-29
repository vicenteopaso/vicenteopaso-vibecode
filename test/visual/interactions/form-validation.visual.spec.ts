import { expect, test } from "@playwright/test";

import {
  contactDialogMasks,
  waitForHomepage,
  waitForModalOpen,
  waitForStableHeight,
} from "../utils";

test.describe("Form Validation Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Use reduced motion to minimize animation-related flakiness
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("email field shows error state when empty and form submitted", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Leave email empty but fill message
    await page.getByLabel("Message").fill("Test message content");

    // Submit form (will fail because no Turnstile token, but validation runs first)
    await page.getByRole("button", { name: "Send" }).click({ force: true });

    // Wait for validation state to render
    await waitForStableHeight(page);

    // Check for email error message
    await expect(page.locator("#contact-email-error")).toBeVisible();
    await expect(page.locator("#contact-email-error")).toContainText(
      "email address",
    );

    // Screenshot the form with email error
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveScreenshot("form-email-error-state.png", {
      animations: "disabled",
      mask: await contactDialogMasks(page),
    });
  });

  test("message field shows error state when empty and form submitted", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Fill email but leave message empty
    await page.getByLabel("Email").fill("test@example.com");

    // Submit form
    await page.getByRole("button", { name: "Send" }).click({ force: true });

    // Wait for validation state to render
    await waitForStableHeight(page);

    // Check for message error
    await expect(page.locator("#contact-message-error")).toBeVisible();
    await expect(page.locator("#contact-message-error")).toContainText(
      "message",
    );

    // Screenshot the form with message error
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveScreenshot("form-message-error-state.png", {
      animations: "disabled",
      mask: await contactDialogMasks(page),
    });
  });

  test("both fields show error when form submitted empty", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Submit form without filling anything
    await page.getByRole("button", { name: "Send" }).click({ force: true });

    // Wait for validation state to render
    await waitForStableHeight(page);

    // Both error messages should be visible
    await expect(page.locator("#contact-email-error")).toBeVisible();
    await expect(page.locator("#contact-message-error")).toBeVisible();

    // Screenshot both errors
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveScreenshot("form-both-fields-error-state.png", {
      animations: "disabled",
      mask: await contactDialogMasks(page),
    });
  });

  test("form status area shows general error message", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Submit form empty
    await page.getByRole("button", { name: "Send" }).click({ force: true });

    // Wait for validation state to render
    await waitForStableHeight(page);

    // Check for status area error
    const statusArea = page.locator("#contact-status");
    await expect(statusArea).toBeVisible();
    await expect(statusArea).toContainText(
      "Please fix the errors highlighted below",
    );

    // Screenshot the status area
    await expect(statusArea).toHaveScreenshot("form-status-error.png", {
      animations: "disabled",
    });
  });

  test("email field has correct aria-invalid attribute when error", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Submit form empty
    await page.getByRole("button", { name: "Send" }).click({ force: true });

    // Wait for validation
    await waitForStableHeight(page);

    // Verify aria-invalid is set correctly
    const emailInput = page.getByLabel("Email");
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");

    const messageInput = page.getByLabel("Message");
    await expect(messageInput).toHaveAttribute("aria-invalid", "true");
  });

  test("validation error styling in light mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await waitForHomepage(page);

    // Open contact dialog
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await waitForModalOpen(page);

    // Submit form empty
    await page.getByRole("button", { name: "Send" }).click({ force: true });

    // Wait for validation state to render
    await waitForStableHeight(page);

    // Screenshot form errors in light mode
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveScreenshot("form-validation-light-mode.png", {
      animations: "disabled",
      mask: await contactDialogMasks(page),
    });
  });
});
