import { test, expect } from "@playwright/test";

test("home page has title and navigation links", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Vicente Opaso/);

  await expect(
    page.getByRole("link", { name: "CV", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Contact", exact: true }),
  ).toBeVisible();
});
