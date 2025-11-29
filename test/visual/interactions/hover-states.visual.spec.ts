import { expect, test } from "@playwright/test";

import { prepareForHoverTest, waitForStableHeight } from "../utils";

/**
 * Visual Regression Tests: Hover States
 *
 * These tests capture hover states of interactive elements to ensure
 * consistent visual styling across components. Uses reduced motion
 * settings for animation predictability.
 */
test.describe("Hover States Visual Regression", () => {
  // Use reduced motion for all tests in this suite
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test.describe("Navigation Menu", () => {
    test("CV link hover state in light mode", async ({ page }) => {
      await page.goto("/");
      await prepareForHoverTest(page);

      const cvLink = page.getByRole("link", { name: "CV" });
      await cvLink.waitFor({ state: "visible" });
      await page.hover('a[href="/cv"]');
      await waitForStableHeight(page);

      // Screenshot of the navigation header with CV link hovered
      const header = page.locator("header");
      await expect(header).toHaveScreenshot("nav-cv-link-hover-light.png", {
        animations: "disabled",
      });
    });

    test("CV link hover state in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/");
      await prepareForHoverTest(page);

      const cvLink = page.getByRole("link", { name: "CV" });
      await cvLink.waitFor({ state: "visible" });
      await page.hover('a[href="/cv"]');
      await waitForStableHeight(page);

      const header = page.locator("header");
      await expect(header).toHaveScreenshot("nav-cv-link-hover-dark.png", {
        animations: "disabled",
      });
    });

    test("Contact button hover state in light mode", async ({ page }) => {
      await page.goto("/");
      await prepareForHoverTest(page);

      const contactButton = page.getByRole("button", { name: "Contact" });
      await contactButton.waitFor({ state: "visible" });
      await contactButton.hover();
      await waitForStableHeight(page);

      const header = page.locator("header");
      await expect(header).toHaveScreenshot(
        "nav-contact-button-hover-light.png",
        {
          animations: "disabled",
        },
      );
    });

    test("Contact button hover state in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/");
      await prepareForHoverTest(page);

      const contactButton = page.getByRole("button", { name: "Contact" });
      await contactButton.waitFor({ state: "visible" });
      await contactButton.hover();
      await waitForStableHeight(page);

      const header = page.locator("header");
      await expect(header).toHaveScreenshot(
        "nav-contact-button-hover-dark.png",
        {
          animations: "disabled",
        },
      );
    });

    test("Theme toggle button hover state in light mode", async ({ page }) => {
      await page.goto("/");
      await prepareForHoverTest(page);

      const themeToggle = page.getByRole("button", {
        name: "Toggle color theme",
      });
      await themeToggle.waitFor({ state: "visible" });
      await themeToggle.hover();
      await waitForStableHeight(page);

      const header = page.locator("header");
      await expect(header).toHaveScreenshot(
        "nav-theme-toggle-hover-light.png",
        {
          animations: "disabled",
        },
      );
    });

    test("Theme toggle button hover state in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/");
      await prepareForHoverTest(page);

      const themeToggle = page.getByRole("button", {
        name: "Toggle color theme",
      });
      await themeToggle.waitFor({ state: "visible" });
      await themeToggle.hover();
      await waitForStableHeight(page);

      const header = page.locator("header");
      await expect(header).toHaveScreenshot("nav-theme-toggle-hover-dark.png", {
        animations: "disabled",
      });
    });

    test("Logo hover state in light mode", async ({ page }) => {
      await page.goto("/cv"); // Navigate to CV page so home logo is not current page
      await prepareForHoverTest(page);

      const logo = page.locator('a[href="/"]');
      await logo.waitFor({ state: "visible" });
      await logo.hover();
      await waitForStableHeight(page);

      const header = page.locator("header");
      await expect(header).toHaveScreenshot("nav-logo-hover-light.png", {
        animations: "disabled",
      });
    });

    test("Logo hover state in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/cv"); // Navigate to CV page so home logo is not current page
      await prepareForHoverTest(page);

      const logo = page.locator('a[href="/"]');
      await logo.waitFor({ state: "visible" });
      await logo.hover();
      await waitForStableHeight(page);

      const header = page.locator("header");
      await expect(header).toHaveScreenshot("nav-logo-hover-dark.png", {
        animations: "disabled",
      });
    });
  });

  test.describe("Footer Links", () => {
    test("Privacy Policy link hover state in light mode", async ({ page }) => {
      await page.goto("/");
      await prepareForHoverTest(page);

      const privacyLink = page.getByRole("link", { name: "Privacy Policy" });
      await privacyLink.waitFor({ state: "visible" });
      await privacyLink.hover();
      await waitForStableHeight(page);

      const footer = page.locator("footer");
      await expect(footer).toHaveScreenshot("footer-privacy-hover-light.png", {
        animations: "disabled",
      });
    });

    test("Privacy Policy link hover state in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/");
      await prepareForHoverTest(page);

      const privacyLink = page.getByRole("link", { name: "Privacy Policy" });
      await privacyLink.waitFor({ state: "visible" });
      await privacyLink.hover();
      await waitForStableHeight(page);

      const footer = page.locator("footer");
      await expect(footer).toHaveScreenshot("footer-privacy-hover-dark.png", {
        animations: "disabled",
      });
    });

    test("Accessibility link hover state in light mode", async ({ page }) => {
      await page.goto("/");
      await prepareForHoverTest(page);

      const accessibilityLink = page.getByRole("link", {
        name: "Accessibility",
      });
      await accessibilityLink.waitFor({ state: "visible" });
      await accessibilityLink.hover();
      await waitForStableHeight(page);

      const footer = page.locator("footer");
      await expect(footer).toHaveScreenshot(
        "footer-accessibility-hover-light.png",
        {
          animations: "disabled",
        },
      );
    });

    test("Accessibility link hover state in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/");
      await prepareForHoverTest(page);

      const accessibilityLink = page.getByRole("link", {
        name: "Accessibility",
      });
      await accessibilityLink.waitFor({ state: "visible" });
      await accessibilityLink.hover();
      await waitForStableHeight(page);

      const footer = page.locator("footer");
      await expect(footer).toHaveScreenshot(
        "footer-accessibility-hover-dark.png",
        {
          animations: "disabled",
        },
      );
    });

    test("External link (Warp) hover state in light mode", async ({ page }) => {
      await page.goto("/");
      await prepareForHoverTest(page);

      const warpLink = page.getByRole("link", { name: "Warp" });
      await warpLink.waitFor({ state: "visible" });
      await warpLink.hover();
      await waitForStableHeight(page);

      const footer = page.locator("footer");
      await expect(footer).toHaveScreenshot("footer-warp-hover-light.png", {
        animations: "disabled",
      });
    });

    test("External link (Warp) hover state in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/");
      await prepareForHoverTest(page);

      const warpLink = page.getByRole("link", { name: "Warp" });
      await warpLink.waitFor({ state: "visible" });
      await warpLink.hover();
      await waitForStableHeight(page);

      const footer = page.locator("footer");
      await expect(footer).toHaveScreenshot("footer-warp-hover-dark.png", {
        animations: "disabled",
      });
    });
  });
});
