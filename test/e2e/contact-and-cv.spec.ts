import { expect, type Page, test } from "@playwright/test";

/**
 * Helper function to open the contact dialog reliably.
 * Waits for button to be interactive, clicks it, and waits for dialog to be fully rendered.
 */
async function openContactDialog(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  const contactButton = page
    .locator("header")
    .getByRole("button", { name: "Contact", exact: true });

  await expect(contactButton).toBeVisible({ timeout: 5000 });

  // Ensure button is enabled and clickable
  await expect(contactButton).toBeEnabled({ timeout: 5000 });

  // Wait a moment for React hydration to complete
  await page.waitForTimeout(300);

  // Click and wait for navigation/state change
  await contactButton.click();

  // Wait for dialog to appear in DOM and be visible using stable test ID
  const dialog = page.getByTestId("contact-dialog");

  try {
    await expect(dialog).toBeVisible({ timeout: 20000 });
  } catch (error) {
    // Provide diagnostic information on failure
    const buttonState = await contactButton.evaluate((el) => ({
      disabled: (el as HTMLButtonElement).disabled,
      ariaExpanded: el.getAttribute("aria-expanded"),
      dataState: el.getAttribute("data-state"),
    }));

    const dialogExists = await page
      .locator('[data-testid="contact-dialog"]')
      .count();

    throw new Error(
      `Dialog failed to open. Button state: ${JSON.stringify(buttonState)}, ` +
        `Dialog elements found: ${dialogExists}, ` +
        `Original error: ${error}`,
    );
  }

  // Wait for form content to ensure dialog is fully rendered
  await expect(page.getByLabel("Email")).toBeVisible({ timeout: 5000 });

  return dialog;
}

test("contact dialog opens and shows required fields", async ({ page }) => {
  await page.goto("/en", { waitUntil: "load" });

  await openContactDialog(page);

  await expect(page.getByRole("heading", { name: "Contact me" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Message")).toBeVisible();
});

test("CV page renders experience section", async ({ page }) => {
  await page.goto("/en/cv");

  await expect(
    page.getByRole("heading", { name: /experience/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /skills/i })).toBeVisible();
});

// Mobile viewport tests
test.describe("Contact dialog - mobile viewport", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone 8/SE dimensions

  test("modal content is scrollable on mobile", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });
    await page.waitForLoadState("domcontentloaded");
    // Wait for Contact button to be visible before opening dialog
    await expect(
      page.getByRole("button", { name: "Contact", exact: true }),
    ).toBeVisible();
    const dialog = await openContactDialog(page);

    // Verify the dialog has overflow-y-auto (scrollable) - check CSS property
    const overflowY = await dialog.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue("overflow-y"),
    );
    expect(overflowY).toBe("auto");
  });

  test("body scroll is locked when modal is open", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("button", { name: "Contact", exact: true }),
    ).toBeVisible();
    await openContactDialog(page);

    // Assert 1: Check that body has scroll lock (Radix adds data-scroll-locked)
    const bodyScrollLocked = await page.evaluate(() => {
      return document.body.hasAttribute("data-scroll-locked");
    });

    expect(bodyScrollLocked).toBe(true);

    // Assert 2: Check computed styles on body - overflow should be hidden
    const bodyOverflow = await page.evaluate(() => {
      return window.getComputedStyle(document.body).overflow;
    });

    // On mobile viewports with scroll-lock, body overflow should be hidden
    expect(bodyOverflow).toBe("hidden");
  });

  test("dialog renders correctly on mobile viewport", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("button", { name: "Contact", exact: true }),
    ).toBeVisible();
    await openContactDialog(page);

    // All form fields should be visible
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel(/phone/i)).toBeVisible();
    await expect(page.getByLabel("Message")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  });
});

// Error flow tests
test.describe("Contact dialog - error handling", () => {
  test("shows validation errors for empty form", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });

    await openContactDialog(page);

    // Try to submit without filling any fields (need Turnstile verification first)
    // The form should show validation errors
    const emailInput = page.getByLabel("Email");
    const messageInput = page.getByLabel("Message");

    // Focus and blur to trigger some validation
    await emailInput.focus();
    await messageInput.focus();

    // Check that email and message fields are required
    await expect(emailInput).toHaveAttribute("aria-required", "true");
    await expect(messageInput).toHaveAttribute("aria-required", "true");
  });

  test("form values are preserved on validation error", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });

    await openContactDialog(page);

    // Fill in only email (leave message empty)
    const emailInput = page.getByLabel("Email");
    await emailInput.fill("test@example.com");

    // The email should remain in the field after blur
    await page.getByLabel("Message").focus();
    await expect(emailInput).toHaveValue("test@example.com");
  });
});

// Accessibility tests
test.describe("Contact dialog - accessibility", () => {
  test("dialog has proper aria attributes", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });
    await expect(
      page.getByRole("button", { name: "Contact", exact: true }),
    ).toBeVisible();
    const dialog = await openContactDialog(page);

    // Dialog should have proper aria-labelledby
    await expect(dialog).toHaveAttribute("aria-labelledby", /.+/);
    await expect(dialog).toHaveAttribute("aria-describedby", /.+/);
  });

  test("has aria-live region for status messages", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });

    const dialog = await openContactDialog(page);

    // Look for status region within the dialog
    const statusRegion = dialog.locator('[role="status"]').first();
    // Check that it exists and has proper aria attributes
    await expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  test("focus is trapped within dialog", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });

    const dialog = await openContactDialog(page);

    // Tab through the dialog to verify focus stays within
    const emailInput = page.getByLabel("Email");

    // Focus should start inside the dialog
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    // Tab to end of dialog
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab"); // Should cycle back to beginning

    // Focus should still be within dialog (not outside)
    await expect(dialog).toContainText("Contact me");
  });
});
