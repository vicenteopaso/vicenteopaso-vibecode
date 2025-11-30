import { expect, test } from "@playwright/test";

test("footer links navigate to pages", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
    // Continue if networkidle times out - page may have background requests
  });

  // Test Cookie Policy link navigates to page
  const cookieLink = page.getByRole("link", {
    name: "Cookie Policy",
    exact: true,
  });
  await expect(cookieLink).toBeVisible();
  await cookieLink.click();
  await page.waitForURL("**/cookie-policy");
  await expect(
    page.getByRole("heading", { name: "Cookie Policy", exact: true }),
  ).toBeVisible();

  // Navigate back and test Privacy Policy link
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
    // Continue if networkidle times out
  });
  const privacyLink = page.getByRole("link", {
    name: "Privacy Policy",
    exact: true,
  });
  await expect(privacyLink).toBeVisible();
  await Promise.all([
    page.waitForURL("**/privacy-policy"),
    privacyLink.click(),
  ]);
  await expect(
    page.getByRole("heading", { name: "Privacy Policy", exact: true }),
  ).toBeVisible();

  // Navigate back and test Tech Stack link
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {
    // Continue if networkidle times out - page may have background requests
  });
  const techStackLink = page.getByRole("link", {
    name: "Tech Stack",
    exact: true,
  });
  await expect(techStackLink).toBeVisible();
  await Promise.all([page.waitForURL("**/tech-stack"), techStackLink.click()]);
  await expect(
    page.getByRole("heading", { name: "Tech Stack", exact: true }),
  ).toBeVisible();
});

test("policy and tech stack pages render main headings", async ({ page }) => {
  await page.goto("/cookie-policy");
  await expect(
    page.getByRole("heading", { name: "Cookie Policy", exact: true }),
  ).toBeVisible();

  await page.goto("/privacy-policy");
  await expect(
    page.getByRole("heading", { name: "Privacy Policy", exact: true }),
  ).toBeVisible();

  await page.goto("/tech-stack");
  await expect(
    page.getByRole("heading", { name: "Tech Stack", exact: true }),
  ).toBeVisible();
});

test("skip link appears on focus and targets main content", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
    // Continue if networkidle times out
  });

  // Press Tab to focus the skip link
  await page.keyboard.press("Tab");

  // Wait for the skip link to become visible (it's hidden by default, shown on focus)
  const skipLink = page.getByRole("link", { name: /skip to main content/i });
  await expect(skipLink).toBeVisible({ timeout: 10000 });

  await skipLink.click();
  await expect(page.locator("main#main-content")).toBeVisible();
});
