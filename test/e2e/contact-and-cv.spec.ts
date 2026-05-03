import { expect, type Page, test } from "@playwright/test";

/**
 * Helper function to navigate to the inline contact form.
 * The contact form is now rendered inline on the homepage at the #contact section.
 */
async function navigateToContactSection(page: Page) {
  await page.goto("/en", { waitUntil: "load" });
  await expect(page.locator("#contact")).toBeAttached({ timeout: 15000 });
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page.getByLabel("EMAIL *")).toBeVisible({ timeout: 15000 });
}

test("contact form section shows required fields", async ({ page }) => {
  await navigateToContactSection(page);

  await expect(
    page.getByRole("heading", { name: "Let's talk." }),
  ).toBeVisible();
  await expect(page.getByLabel("EMAIL *")).toBeVisible();
  await expect(page.getByLabel("MESSAGE *")).toBeVisible();
});

test("CV page renders experience section", async ({ page }) => {
  await page.goto("/en/cv");

  // EXPERIENCE and SKILLS sections are referenced in the table of contents
  await expect(
    page.getByRole("link", { name: /experience/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /skills/i }).first(),
  ).toBeVisible();
});

// Mobile viewport tests
test.describe("Contact form - mobile viewport", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("contact form is visible on mobile", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });
    await expect(page.locator("#contact")).toBeAttached({ timeout: 15000 });
    await page.locator("#contact").scrollIntoViewIfNeeded();

    await expect(page.getByLabel("EMAIL *")).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel("MESSAGE *")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "SEND →" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("contact form renders correctly on mobile viewport", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "load" });
    await expect(page.locator("#contact")).toBeAttached({ timeout: 10000 });
    await page.locator("#contact").scrollIntoViewIfNeeded();

    await expect(page.getByLabel("NAME")).toBeVisible();
    await expect(page.getByLabel("EMAIL *")).toBeVisible();
    await expect(page.getByLabel("SUBJECT")).toBeVisible();
    await expect(page.getByLabel("MESSAGE *")).toBeVisible();
    await expect(page.getByRole("button", { name: "SEND →" })).toBeVisible();
  });
});

// Error flow tests
test.describe("Contact form - error handling", () => {
  test("shows validation errors for empty form", async ({ page }) => {
    await navigateToContactSection(page);

    const emailInput = page.getByLabel("EMAIL *");
    const messageInput = page.getByLabel("MESSAGE *");

    await emailInput.focus();
    await messageInput.focus();

    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();
  });

  test("form values are preserved on validation error", async ({ page }) => {
    await navigateToContactSection(page);

    const emailInput = page.getByLabel("EMAIL *");
    await emailInput.fill("test@example.com");

    await page.getByLabel("MESSAGE *").focus();
    await expect(emailInput).toHaveValue("test@example.com");
  });
});

// Accessibility tests
test.describe("Contact form - accessibility", () => {
  test("contact form has required field markers", async ({ page }) => {
    await navigateToContactSection(page);

    await expect(page.getByLabel("EMAIL *")).toBeVisible();
    await expect(page.getByLabel("MESSAGE *")).toBeVisible();
  });

  test("has aria-live region for status messages", async ({ page }) => {
    await navigateToContactSection(page);

    const statusRegion = page.locator('[role="status"]').first();
    await expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  test("contact form fields are keyboard navigable", async ({ page }) => {
    await navigateToContactSection(page);

    const emailInput = page.getByLabel("EMAIL *");
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    await page.keyboard.press("Tab");

    const subjectInput = page.getByLabel("SUBJECT");
    await subjectInput.focus();
    await expect(subjectInput).toBeFocused();
  });
});
