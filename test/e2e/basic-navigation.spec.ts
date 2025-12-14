import { expect, test } from "@playwright/test";

test("home page has title and navigation links", async ({ page }) => {
  await page.goto("/en", { waitUntil: "load" });

  await expect(page).toHaveTitle(/Vicente Opaso/);

  await expect(
    page.getByRole("link", { name: "CV", exact: true }),
  ).toBeVisible();

  const contactButton = page.getByRole("button", {
    name: "Contact",
    exact: true,
  });
  await expect(contactButton).toBeVisible();

  // Ensure page is scrolled to top and button is in view
  await page.evaluate(() => window.scrollTo(0, 0));
  await contactButton.scrollIntoViewIfNeeded();
  await contactButton.click();
});
