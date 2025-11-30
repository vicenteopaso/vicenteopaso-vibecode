import { expect, test } from "@playwright/test";

test.describe("Contact Dialog", () => {
  test("opens and shows required fields on desktop", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Contact", exact: true }).click();

    await expect(page.getByRole("heading", { name: "Contact me" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel(/phone/i)).toBeVisible();
    await expect(page.getByLabel("Message")).toBeVisible();
    await expect(page.getByRole("button", { name: /send/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /close/i })).toBeVisible();
  });

  test("opens and shows required fields on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await page.getByRole("button", { name: "Contact", exact: true }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Contact me" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Message")).toBeVisible();
  });

  test("modal content is scrollable on mobile when content overflows", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 400 }); // Very small viewport
    await page.goto("/");

    await page.getByRole("button", { name: "Contact", exact: true }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Dialog should have overflow-y-auto class for scrolling
    await expect(dialog).toHaveCSS("overflow-y", "auto");
  });

  test("displays validation errors when submitting empty form", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Contact", exact: true }).click();
    
    // Submit form with empty fields
    await page.getByLabel("Email").click();
    await page.getByLabel("Email").blur();
    
    // The send button should be disabled until Turnstile completes
    // Since Turnstile isn't available in tests, we test validation by submitting form directly
    const form = page.locator('form');
    await form.evaluate((f: HTMLFormElement) => f.requestSubmit());

    // Check for validation errors
    await expect(page.getByText("Please provide an email address.")).toBeVisible();
    await expect(page.getByText("Please provide a message.")).toBeVisible();
  });

  test("preserves form values when validation fails", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Contact", exact: true }).click();
    
    // Fill in only email (leave message empty)
    await page.getByLabel("Email").fill("test@example.com");
    
    // Submit form
    const form = page.locator('form');
    await form.evaluate((f: HTMLFormElement) => f.requestSubmit());

    // Email value should be preserved
    await expect(page.getByLabel("Email")).toHaveValue("test@example.com");
  });

  test("has accessible aria-live region for status messages", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Contact", exact: true }).click();

    // Check for status region with aria-live
    const statusRegion = page.getByRole("status");
    await expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  test("marks inputs as aria-invalid when validation fails", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Contact", exact: true }).click();
    
    // Submit empty form
    const form = page.locator('form');
    await form.evaluate((f: HTMLFormElement) => f.requestSubmit());

    // Inputs should be marked as invalid
    await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Message")).toHaveAttribute("aria-invalid", "true");
  });

  test("has correct aria-required attributes", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Contact", exact: true }).click();

    await expect(page.getByLabel("Email")).toHaveAttribute("aria-required", "true");
    await expect(page.getByLabel("Message")).toHaveAttribute("aria-required", "true");
    // Phone should not be required
    await expect(page.getByLabel(/phone/i)).not.toHaveAttribute("aria-required", "true");
  });

  test("can close dialog with close button", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: /close/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("can close dialog with Escape key", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("focuses dialog content when opened", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Contact", exact: true }).click();
    
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    
    // Focus should be trapped inside the dialog - either on the dialog itself
    // or on one of its focusable elements (like the email input)
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
    
    // Verify the focused element is inside the dialog
    const dialogBounds = await dialog.boundingBox();
    const focusedBounds = await focusedElement.boundingBox();
    
    if (dialogBounds && focusedBounds) {
      expect(focusedBounds.x).toBeGreaterThanOrEqual(dialogBounds.x);
      expect(focusedBounds.y).toBeGreaterThanOrEqual(dialogBounds.y);
    }
  });
});

test.describe("CV Page", () => {
  test("renders experience section", async ({ page }) => {
    await page.goto("/cv");

    await expect(
      page.getByRole("heading", { name: /experience/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /skills/i })).toBeVisible();
  });
});
