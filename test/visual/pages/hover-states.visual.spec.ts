import { expect, test } from "@playwright/test";

import {
  waitForCVPage,
  waitForHomepage,
  waitForHoverStyles,
} from "../utils";

/**
 * Visual regression tests for hover states of interactive elements.
 *
 * These tests capture the visual appearance of elements when hovered,
 * ensuring hover styles remain consistent across changes.
 *
 * The tests use reduced motion to ensure animation predictability and
 * deterministic completion by waiting for style stability.
 */
test.describe("Hover States Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Enable reduced motion for animation predictability
    await page.emulateMedia({ reducedMotion: "reduce" });
    // Set desktop viewport to ensure all elements are visible
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe("Navigation Elements", () => {
    test("CV link hover state", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      const cvLink = page.locator('nav a[href="/cv"]');
      await cvLink.hover();
      await waitForHoverStyles(cvLink);

      await expect(cvLink).toHaveScreenshot("nav-cv-link-hover.png", {
        animations: "disabled",
      });
    });

    test("Contact button hover state", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      // Use a more specific selector that works with querySelector
      const contactButton = page.locator("nav button").filter({ hasText: "Contact" });
      await contactButton.hover();
      await waitForHoverStyles(contactButton);

      await expect(contactButton).toHaveScreenshot("nav-contact-button-hover.png", {
        animations: "disabled",
      });
    });

    test("Theme toggle button hover state (light mode)", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      const themeToggle = page.locator('button[aria-label="Toggle color theme"]');
      await themeToggle.hover();
      await waitForHoverStyles(themeToggle);

      await expect(themeToggle).toHaveScreenshot("nav-theme-toggle-hover-light.png", {
        animations: "disabled",
      });
    });

    test("Theme toggle button hover state (dark mode)", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/");
      await waitForHomepage(page);

      const themeToggle = page.locator('button[aria-label="Toggle color theme"]');
      await themeToggle.hover();
      await waitForHoverStyles(themeToggle);

      await expect(themeToggle).toHaveScreenshot("nav-theme-toggle-hover-dark.png", {
        animations: "disabled",
      });
    });

    test("Logo hover state", async ({ page }) => {
      await page.goto("/cv");
      await waitForCVPage(page);

      const logo = page.locator('nav a[href="/"]');
      await logo.hover();
      await waitForHoverStyles(logo);

      await expect(logo).toHaveScreenshot("nav-logo-hover.png", {
        animations: "disabled",
      });
    });
  });

  test.describe("Homepage ProfileCard Buttons", () => {
    test("Read CV button hover state", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      // Desktop Read CV button with styled class (the one visible on sm and up)
      const readCvButton = page
        .locator('a[href="/cv"]')
        .filter({ hasText: "Read CV" })
        .and(page.locator(".rounded-full"));
      await readCvButton.hover();
      await waitForHoverStyles(readCvButton);

      await expect(readCvButton).toHaveScreenshot("profilecard-read-cv-hover.png", {
        animations: "disabled",
      });
    });

    test("Download CV button hover state", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      // Desktop Download CV button - the styled one with rounded-full class
      const downloadButton = page
        .locator("a[download]")
        .filter({ hasText: "Download CV" })
        .and(page.locator(".rounded-full"));
      await downloadButton.hover();
      await waitForHoverStyles(downloadButton);

      await expect(downloadButton).toHaveScreenshot("profilecard-download-cv-hover.png", {
        animations: "disabled",
      });
    });

    test("Social icon (GitHub) hover state on homepage", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      const githubLink = page.locator('a[aria-label="GitHub profile"]').first();
      await githubLink.hover();
      await waitForHoverStyles(githubLink);

      await expect(githubLink).toHaveScreenshot("profilecard-github-hover.png", {
        animations: "disabled",
      });
    });

    test("Social icon (LinkedIn) hover state on homepage", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      const linkedinLink = page.locator('a[aria-label="LinkedIn profile"]').first();
      await linkedinLink.hover();
      await waitForHoverStyles(linkedinLink);

      await expect(linkedinLink).toHaveScreenshot("profilecard-linkedin-hover.png", {
        animations: "disabled",
      });
    });

    test("Social icon (X/Twitter) hover state on homepage", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      const xLink = page.locator('a[aria-label="X (Twitter) profile"]').first();
      await xLink.hover();
      await waitForHoverStyles(xLink);

      await expect(xLink).toHaveScreenshot("profilecard-x-hover.png", {
        animations: "disabled",
      });
    });
  });

  test.describe("CV Page Elements", () => {
    test("Download CV button hover state on CV page", async ({ page }) => {
      await page.goto("/cv");
      await waitForCVPage(page);

      const downloadButton = page.locator('a[aria-label="Download CV (PDF)"]').first();
      await downloadButton.hover();
      await waitForHoverStyles(downloadButton);

      await expect(downloadButton).toHaveScreenshot("cv-download-button-hover.png", {
        animations: "disabled",
      });
    });

    test("Section link hover state on CV page", async ({ page }) => {
      await page.goto("/cv");
      await waitForCVPage(page);

      // First section link in the CV header
      const sectionLink = page.locator('nav[aria-label="CV sections"] a').first();
      await sectionLink.hover();
      await waitForHoverStyles(sectionLink);

      await expect(sectionLink).toHaveScreenshot("cv-section-link-hover.png", {
        animations: "disabled",
      });
    });

    test("GitHub icon hover state on CV page", async ({ page }) => {
      await page.goto("/cv");
      await waitForCVPage(page);

      const githubLink = page.locator('a[aria-label="GitHub profile"]').first();
      await githubLink.hover();
      await waitForHoverStyles(githubLink);

      await expect(githubLink).toHaveScreenshot("cv-github-hover.png", {
        animations: "disabled",
      });
    });
  });

  test.describe("Footer Links", () => {
    test("Privacy Policy link hover state", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      const privacyLink = page.locator('footer a[href="/privacy-policy"]');
      await privacyLink.hover();
      await waitForHoverStyles(privacyLink);

      await expect(privacyLink).toHaveScreenshot("footer-privacy-link-hover.png", {
        animations: "disabled",
      });
    });

    test("Cookie Policy link hover state", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      const cookieLink = page.locator('footer a[href="/cookie-policy"]');
      await cookieLink.hover();
      await waitForHoverStyles(cookieLink);

      await expect(cookieLink).toHaveScreenshot("footer-cookie-link-hover.png", {
        animations: "disabled",
      });
    });

    test("External link (Warp) hover state", async ({ page }) => {
      await page.goto("/");
      await waitForHomepage(page);

      const warpLink = page.locator('footer a[href="https://warp.dev"]');
      await warpLink.hover();
      await waitForHoverStyles(warpLink);

      await expect(warpLink).toHaveScreenshot("footer-warp-link-hover.png", {
        animations: "disabled",
      });
    });

    test("Footer links hover state in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/");
      await waitForHomepage(page);

      const privacyLink = page.locator('footer a[href="/privacy-policy"]');
      await privacyLink.hover();
      await waitForHoverStyles(privacyLink);

      await expect(privacyLink).toHaveScreenshot("footer-privacy-link-hover-dark.png", {
        animations: "disabled",
      });
    });
  });

  test.describe("Dark Mode Hover States", () => {
    test("Read CV button hover state (dark mode)", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/");
      await waitForHomepage(page);

      // Desktop Read CV button with styled class
      const readCvButton = page
        .locator('a[href="/cv"]')
        .filter({ hasText: "Read CV" })
        .and(page.locator(".rounded-full"));
      await readCvButton.hover();
      await waitForHoverStyles(readCvButton);

      await expect(readCvButton).toHaveScreenshot("profilecard-read-cv-hover-dark.png", {
        animations: "disabled",
      });
    });

    test("Download CV button hover state (dark mode)", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/");
      await waitForHomepage(page);

      // Desktop Download CV button with styled class
      const downloadButton = page
        .locator("a[download]")
        .filter({ hasText: "Download CV" })
        .and(page.locator(".rounded-full"));
      await downloadButton.hover();
      await waitForHoverStyles(downloadButton);

      await expect(downloadButton).toHaveScreenshot("profilecard-download-cv-hover-dark.png", {
        animations: "disabled",
      });
    });

    test("CV link hover state (dark mode)", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
      await page.goto("/");
      await waitForHomepage(page);

      const cvLink = page.locator('nav a[href="/cv"]');
      await cvLink.hover();
      await waitForHoverStyles(cvLink);

      await expect(cvLink).toHaveScreenshot("nav-cv-link-hover-dark.png", {
        animations: "disabled",
      });
    });
  });
});
