import { expect, test } from "@playwright/test";

test.describe("footer links navigate to pages", () => {
  test("Cookie Policy link navigates correctly", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });

    const cookieLink = page.getByRole("link", {
      name: "Cookie Policy",
      exact: true,
    });
    await cookieLink.click();

    await expect(page).toHaveURL(/\/cookie-policy$/);
    await expect(
      page.getByRole("heading", { name: "Cookie Policy", exact: true }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Privacy Policy link navigates correctly", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });

    const privacyLink = page.getByRole("link", {
      name: "Privacy Policy",
      exact: true,
    });
    await privacyLink.click();

    await expect(page).toHaveURL(/\/privacy-policy$/);
    await expect(
      page.getByRole("heading", { name: "Privacy Policy", exact: true }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Tech Stack link navigates correctly", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });

    const techStackLink = page.getByRole("link", {
      name: "Tech Stack",
      exact: true,
    });
    await techStackLink.click();

    await expect(page).toHaveURL(/\/tech-stack$/);
    await expect(
      page.getByRole("heading", { name: "Tech Stack", exact: true }),
    ).toBeVisible({ timeout: 10000 });
  });
});

test("skip link appears on focus and targets main content", async ({
  page,
}) => {
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
    // Continue if networkidle times out
  });

  // Press Tab to focus the skip link
  await page.keyboard.press("Tab");

  // Wait for the skip link to become visible (it's hidden by default, shown on focus)
  const skipLink = page.getByRole("link", { name: /skip to main content/i });
  await expect(skipLink).toBeVisible({ timeout: 10000 });

  await skipLink.click({ force: true });
  await expect(page.locator("main#main-content")).toBeVisible();
});
