import { expect, test } from "@playwright/test";

test("home page has title and navigation links", async ({ page }) => {
  await page.goto("/en", { waitUntil: "load" });

  await expect(page).toHaveTitle(/Vicente Opaso/);

  await expect(
    page.getByRole("link", { name: "CV", exact: true }),
  ).toBeVisible();

  // Wait for the Contact button to be visible
  await expect(
    page.getByRole("button", { name: "Contact", exact: true }),
  ).toBeVisible();

  // Scroll to top, then re-query the button to ensure it is attached
  await page.evaluate(() => window.scrollTo(0, 0));
  const contactButton = page.getByRole("button", {
    name: "Contact",
    exact: true,
  });
  await contactButton.click();
});
