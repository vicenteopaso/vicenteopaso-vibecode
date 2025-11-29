import { expect, test } from "@playwright/test";

import { waitForStaticPage } from "../utils";

test.describe("Privacy Policy Page Visual Regression", () => {
  test("renders privacy policy page in light mode", async ({ page }) => {
    await page.goto("/privacy-policy");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("privacy-policy-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders privacy policy page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/privacy-policy");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("privacy-policy-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders privacy policy page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/privacy-policy");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("privacy-policy-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});

test.describe("Cookie Policy Page Visual Regression", () => {
  test("renders cookie policy page in light mode", async ({ page }) => {
    await page.goto("/cookie-policy");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("cookie-policy-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders cookie policy page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cookie-policy");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("cookie-policy-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders cookie policy page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/cookie-policy");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("cookie-policy-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});

test.describe("Accessibility Page Visual Regression", () => {
  test("renders accessibility page in light mode", async ({ page }) => {
    await page.goto("/accessibility");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("accessibility-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders accessibility page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/accessibility");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("accessibility-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders accessibility page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/accessibility");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("accessibility-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});

test.describe("Tech Stack Page Visual Regression", () => {
  test("renders tech stack page in light mode", async ({ page }) => {
    await page.goto("/tech-stack");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("tech-stack-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders tech stack page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/tech-stack");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("tech-stack-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders tech stack page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/tech-stack");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("tech-stack-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});

test.describe("Technical Governance Page Visual Regression", () => {
  test("renders technical governance page in light mode", async ({ page }) => {
    await page.goto("/technical-governance");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("technical-governance-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders technical governance page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/technical-governance");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("technical-governance-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders technical governance page on mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/technical-governance");
    await waitForStaticPage(page);

    await expect(page).toHaveScreenshot("technical-governance-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});
