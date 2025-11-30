import { expect, test } from "@playwright/test";

test("home page has title and navigation links", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page).toHaveTitle(/Vicente Opaso/);

  await expect(
    page.getByRole("link", { name: "CV", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Contact", exact: true }),
  ).toBeVisible();
  // Sanity: header is clickable
  await page.evaluate(() => window.scrollTo(0, 0));
  await page
    .getByRole("button", { name: "Contact", exact: true })
    .click({ force: true });
});
