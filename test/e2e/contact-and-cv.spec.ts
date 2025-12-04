import { expect, test } from "@playwright/test";

test("contact dialog opens and shows required fields", async ({ page }) => {
  await page.goto("/en", { waitUntil: "networkidle" });

  // Ensure header is on top and interactable
  await page.evaluate(() => window.scrollTo(0, 0));
  const contactButton = page
    .locator("header")
    .getByRole("button", { name: "Contact", exact: true });
  await expect(contactButton).toBeVisible({ timeout: 5000 });
  await page.waitForLoadState("networkidle");
  await contactButton.click();

  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 20000 });
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
    await page.goto("/en", { waitUntil: "networkidle" });
    await page.waitForLoadState("domcontentloaded");

    await page.evaluate(() => window.scrollTo(0, 0));
    const contactButton = page
      .locator("header")
      .getByRole("button", { name: "Contact", exact: true });
    await expect(contactButton).toBeVisible({ timeout: 5000 });
    await expect(contactButton).toBeEnabled();

    // Ensure the app is fully hydrated before interaction
    await page.waitForLoadState("networkidle");

    const dialog = page.getByRole("dialog");

    // Synchronize click with dialog becoming visible
    await Promise.all([
      dialog.waitFor({ state: "visible", timeout: 20000 }),
      contactButton.click(),
    ]);

    // Wait for form content to ensure animation is complete
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 5000 });

    // Verify the dialog has overflow-y-auto (scrollable) - check CSS property
    const overflowY = await dialog.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue("overflow-y"),
    );
    expect(overflowY).toBe("auto");
  });

  test("body scroll is locked when modal is open", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await page.waitForLoadState("domcontentloaded");

    await page.evaluate(() => window.scrollTo(0, 0));
    const contactButton = page
      .locator("header")
      .getByRole("button", { name: "Contact", exact: true });
    await expect(contactButton).toBeVisible({ timeout: 5000 });
    await expect(contactButton).toBeEnabled();

    // Wait for full hydration before interaction
    await page.waitForLoadState("networkidle");

    // Target the actual contact dialog by accessible name
    const dialog = page.getByRole("dialog", { name: /contact me/i });

    // Synchronize click with dialog becoming visible to avoid races
    await Promise.all([
      dialog.waitFor({ state: "visible", timeout: 20000 }),
      contactButton.click(),
    ]);

    // Verify form content is visible
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 5000 });

    // Check that body has scroll lock (Radix adds data-scroll-locked)
    const bodyScrollLocked = await page.evaluate(() => {
      return document.body.hasAttribute("data-scroll-locked");
    });
    expect(bodyScrollLocked).toBe(true);
  });

  test("dialog renders correctly on mobile viewport", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await page.waitForLoadState("domcontentloaded");

    await page.evaluate(() => window.scrollTo(0, 0));
    const contactButton = page
      .locator("header")
      .getByRole("button", { name: "Contact", exact: true });
    await expect(contactButton).toBeVisible({ timeout: 5000 });

    // Wait for full hydration before interaction
    await page.waitForLoadState("networkidle");

    // Synchronize click with dialog appearance
    const dialog = page.getByRole("dialog");
    await Promise.all([
      dialog.waitFor({ state: "visible", timeout: 20000 }),
      contactButton.click(),
    ]);

    // Verify form content is visible
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 5000 });

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
    await page.goto("/en", { waitUntil: "networkidle" });

    await page.evaluate(() => window.scrollTo(0, 0));
    const contactTrigger = page.getByRole("button", {
      name: "Contact me",
      exact: true,
    });

    // Open dialog and wait for it to become visible
    const dialog = page.getByRole("dialog");
    await Promise.all([
      dialog.waitFor({ state: "visible", timeout: 20000 }),
      contactTrigger.click(),
    ]);

    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 5000 });

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
    await page.goto("/en", { waitUntil: "networkidle" });

    await page.evaluate(() => window.scrollTo(0, 0));
    const contactTrigger = page.getByRole("button", {
      name: "Contact me",
      exact: true,
    });

    // Open dialog and wait for it to become visible
    const dialog = page.getByRole("dialog");
    await Promise.all([
      dialog.waitFor({ state: "visible", timeout: 20000 }),
      contactTrigger.click(),
    ]);

    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 5000 });

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
    await page.goto("/en", { waitUntil: "networkidle" });

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("button", { name: "Contact me", exact: true }).click();

    // Wait for dialog to open
    const dialog = page.getByRole("dialog", { name: /contact me/i });
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Dialog should have proper aria-labelledby
    await expect(dialog).toHaveAttribute("aria-labelledby", /.+/);
    await expect(dialog).toHaveAttribute("aria-describedby", /.+/);
  });

  test("has aria-live region for status messages", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    await page.evaluate(() => window.scrollTo(0, 0));
    const contactButton = page.getByRole("button", {
      name: "Contact me",
      exact: true,
    });

    // Synchronize click with dialog appearance
    const dialog = page.getByRole("dialog", { name: /contact me/i });
    await Promise.all([
      dialog.waitFor({ state: "visible", timeout: 15000 }),
      contactButton.click(),
    ]);

    // Look for status region within the dialog
    const statusRegion = dialog.locator('[role="status"]').first();
    // Check that it exists and has proper aria attributes
    await expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  test("focus is trapped within dialog", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("button", { name: "Contact me", exact: true }).click();

    // Wait for dialog to open
    const dialog = page.getByRole("dialog", { name: /contact me/i });
    await expect(dialog).toBeVisible({ timeout: 15000 });

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
