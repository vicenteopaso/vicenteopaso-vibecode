import { test, expect } from "@playwright/test";

test("contact dialog opens and shows required fields", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  await page.getByRole("button", { name: "Contact", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Contact me" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Message")).toBeVisible();
});

test("CV page renders experience section", async ({ page }) => {
  await page.goto("http://localhost:3000/cv");

  await expect(
    page.getByRole("heading", { name: /experience/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /skills/i })).toBeVisible();
});
