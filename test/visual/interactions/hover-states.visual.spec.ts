import { expect, test } from "@playwright/test";

import { waitForHomepage, waitForCVPage } from "../utils";

test.describe("Hover States Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Use reduced motion to minimize animation-related flakiness
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("navigation CV link hover state", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Find the CV link
    const cvLink = page.getByRole("link", { name: "CV" });
    await expect(cvLink).toBeVisible();

    // Hover over the CV link
    await cvLink.hover();

    // Screenshot the navigation with hover state
    const nav = page.locator("header nav");
    await expect(nav).toHaveScreenshot("nav-cv-link-hover.png", {
      animations: "disabled",
    });
  });

  test("navigation Contact button hover state", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Find the Contact button in navigation
    const contactButton = page.getByRole("button", {
      name: "Contact",
      exact: true,
    });
    await expect(contactButton).toBeVisible();

    // Hover over the Contact button
    await contactButton.hover();

    // Screenshot the navigation with hover state
    const nav = page.locator("header nav");
    await expect(nav).toHaveScreenshot("nav-contact-button-hover.png", {
      animations: "disabled",
    });
  });

  test("theme toggle button hover state", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Find the theme toggle button
    const themeButton = page.getByRole("button", {
      name: "Toggle color theme",
    });
    await expect(themeButton).toBeVisible();

    // Hover over the theme toggle
    await themeButton.hover();

    // Screenshot the navigation with hover state
    const nav = page.locator("header nav");
    await expect(nav).toHaveScreenshot("nav-theme-toggle-hover.png", {
      animations: "disabled",
    });
  });

  test("logo link hover state", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cv");
    await waitForCVPage(page);

    // Find the logo link
    const logoLink = page.getByRole("link", { name: "Opaso logo" });
    await expect(logoLink).toBeVisible();

    // Hover over the logo
    await logoLink.hover();

    // Screenshot the header with hover state
    const header = page.locator("header");
    await expect(header).toHaveScreenshot("header-logo-hover.png", {
      animations: "disabled",
    });
  });

  test("Get in touch section link hover state", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Find the "Contact me" link in the Get in touch section
    const contactMeLink = page
      .locator("section")
      .filter({ hasText: "Get in touch" })
      .getByRole("button", { name: "Contact me" });
    await expect(contactMeLink).toBeVisible();

    // Hover over the link
    await contactMeLink.hover();

    // Screenshot the section with hover state
    const section = page.locator("section").filter({ hasText: "Get in touch" });
    await expect(section).toHaveScreenshot("get-in-touch-link-hover.png", {
      animations: "disabled",
    });
  });

  test("footer links hover state", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Find a footer link (e.g., Privacy Policy)
    const footerLink = page.getByRole("link", { name: "Privacy Policy" });
    await expect(footerLink).toBeVisible();

    // Hover over the link
    await footerLink.hover();

    // Screenshot the footer with hover state
    const footer = page.locator("footer");
    await expect(footer).toHaveScreenshot("footer-link-hover.png", {
      animations: "disabled",
    });
  });

  test("CV navigation link shows active state when on CV page", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cv");
    await waitForCVPage(page);

    // The CV link should have active styling (aria-current="page")
    const cvLink = page.getByRole("link", { name: "CV" });
    await expect(cvLink).toHaveAttribute("aria-current", "page");

    // Screenshot the navigation showing active state
    const nav = page.locator("header nav");
    await expect(nav).toHaveScreenshot("nav-cv-active-state.png", {
      animations: "disabled",
    });
  });

  test("hover states in light mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await waitForHomepage(page);

    // Hover over theme toggle
    const themeButton = page.getByRole("button", {
      name: "Toggle color theme",
    });
    await themeButton.hover();

    // Screenshot navigation in light mode with hover
    const nav = page.locator("header nav");
    await expect(nav).toHaveScreenshot("nav-hover-light-mode.png", {
      animations: "disabled",
    });
  });

  test("multiple navigation elements focused via keyboard", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Tab through navigation elements
    await page.keyboard.press("Tab"); // Skip link
    await page.keyboard.press("Tab"); // Logo
    await page.keyboard.press("Tab"); // CV link

    // CV link should be focused
    const cvLink = page.getByRole("link", { name: "CV" });
    await expect(cvLink).toBeFocused();

    // Screenshot showing focus state
    const nav = page.locator("header nav");
    await expect(nav).toHaveScreenshot("nav-cv-focus-state.png", {
      animations: "disabled",
    });
  });

  test("button focus ring visible for accessibility", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Tab to theme toggle button
    await page.keyboard.press("Tab"); // Skip link
    await page.keyboard.press("Tab"); // Logo
    await page.keyboard.press("Tab"); // CV link
    await page.keyboard.press("Tab"); // Contact button
    await page.keyboard.press("Tab"); // Theme toggle

    // Theme button should be focused
    const themeButton = page.getByRole("button", {
      name: "Toggle color theme",
    });
    await expect(themeButton).toBeFocused();

    // Screenshot showing focus ring
    await expect(themeButton).toHaveScreenshot("theme-button-focus-ring.png", {
      animations: "disabled",
    });
  });
});
