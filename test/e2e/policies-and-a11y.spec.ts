import { expect, test } from "@playwright/test";

test("footer links navigate to pages", async ({ page }) => {
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
    // Continue if networkidle times out - page may have background requests
  });

  // Test Cookie Policy link navigates to page
  const cookieLink = page.getByRole("link", {
    name: "Cookie Policy",
    exact: true,
  });
  await expect(cookieLink).toBeVisible();
  await Promise.all([page.waitForURL("**/cookie-policy"), cookieLink.click()]);
  await page.waitForLoadState("domcontentloaded");
  await expect(
    page.getByRole("heading", { name: /Cookie Policy/i }),
  ).toBeVisible({ timeout: 10000 });

  // Navigate back and test Privacy Policy link
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
    // Continue if networkidle times out
  });
  const privacyLink = page.getByRole("link", {
    name: "Privacy Policy",
    exact: true,
  });
  await expect(privacyLink).toBeVisible();

  await Promise.all([
    page.waitForURL(/privacy-policy/, { waitUntil: "domcontentloaded" }),
    privacyLink.click(),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
    // Continue if networkidle times out - page may have background requests
  });
  await expect(page).toHaveURL(/\/privacy-policy/);
  await expect(
    page.getByRole("heading", { name: "Privacy Policy", exact: true }),
  ).toBeVisible({ timeout: 10000 });

  // Navigate back and test Tech Stack link
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {
    // Continue if networkidle times out - page may have background requests
  });
  const techStackLink = page.getByRole("link", {
    name: "Tech Stack",
    exact: true,
  });
  await expect(techStackLink).toBeVisible();

  // Synchronize click with page navigation and hydration
  await Promise.all([
    page.waitForURL(/tech-stack/, { waitUntil: "networkidle" }),
    techStackLink.click(),
  ]);

  await expect(
    page.getByRole("heading", { name: "Tech Stack", exact: true }),
  ).toBeVisible({ timeout: 10000 });
});

test("policy and tech stack pages render main headings", async ({ page }) => {
  await page.goto("/en/cookie-policy");
  await expect(
    page.getByRole("heading", { name: "Cookie Policy", exact: true }),
  ).toBeVisible();

  await page.goto("/en/privacy-policy");
  await expect(
    page.getByRole("heading", { name: "Privacy Policy", exact: true }),
  ).toBeVisible();

  await page.goto("/en/tech-stack");
  await expect(
    page.getByRole("heading", { name: "Tech Stack", exact: true }),
  ).toBeVisible();
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
