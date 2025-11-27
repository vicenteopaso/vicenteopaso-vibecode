import { expect, test } from "@playwright/test";

test("footer policy and tech modals open and show content", async ({
  page,
}) => {
  await page.goto("/");

  await page
    .getByRole("button", { name: "Cookie Policy", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Cookie Policy", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  await page
    .getByRole("button", { name: "Privacy Policy", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Privacy Policy", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "Tech Stack", exact: true }).click();

  const techDialog = page.getByRole("dialog", { name: "Tech Stack" });
  await expect(
    techDialog.getByRole("heading", { name: "Tech Stack", exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();
});

test("cookie and privacy policy pages render main headings", async ({
  page,
}) => {
  await page.goto("/cookie-policy");
  await expect(
    page.getByRole("heading", { name: "Cookie Policy", exact: true }),
  ).toBeVisible();

  await page.goto("/privacy-policy");
  await expect(
    page.getByRole("heading", { name: "Privacy Policy", exact: true }),
  ).toBeVisible();
});

test("skip link appears on focus and targets main content", async ({
  page,
}) => {
  await page.goto("/");

  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: /skip to main content/i });
  await expect(skipLink).toBeVisible();

  await skipLink.click();
  await expect(page.locator("main#main-content")).toBeVisible();
});
