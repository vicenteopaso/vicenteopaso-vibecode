import { expect, test } from "@playwright/test";

test("home page has title and navigation links", async ({ page }) => {
  await page.goto("/en", { waitUntil: "load" });

  await expect(page).toHaveTitle(/Vicente Opaso/);

  await expect(
    page.getByRole("link", { name: "CV", exact: true }),
  ).toBeVisible();

  // Contact is now a nav link (not a button) that scrolls to the inline contact section
  await expect(
    page.locator("header").getByRole("link", { name: "CONTACT", exact: true }),
  ).toBeVisible();
});
