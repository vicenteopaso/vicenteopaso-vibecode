import { expect, test } from "@playwright/test";

import {
  ensureTheme,
  getCurrentTheme,
  homepageMasks,
  toggleTheme,
  waitForStableHeight,
  waitForThemeSwitch,
  waitForThemeTestReady,
} from "../utils";

test.describe("Theme Switching Visual Regression", () => {
  test.describe("Homepage theme switching", () => {
    test("captures light mode before switching to dark", async ({ page }) => {
      // Start with light color scheme preference
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto("/");

      // Ensure we're in light mode (handles hydration)
      await ensureTheme(page, "light");

      // Capture light mode state
      await expect(page).toHaveScreenshot("theme-switch-homepage-light.png", {
        fullPage: true,
        animations: "disabled",
        mask: await homepageMasks(page),
      });
    });

    test("captures dark mode after switching from light", async ({ page }) => {
      // Start with light color scheme preference
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto("/");

      // Ensure we're in light mode first
      await ensureTheme(page, "light");

      // Toggle to dark mode
      await toggleTheme(page);
      await waitForThemeSwitch(page, "dark");

      // Verify theme switched
      const newTheme = await getCurrentTheme(page);
      expect(newTheme).toBe("dark");

      // Wait for stability after theme switch
      await waitForStableHeight(page);

      // Capture dark mode state after switch
      await expect(page).toHaveScreenshot(
        "theme-switch-homepage-light-to-dark.png",
        {
          fullPage: true,
          animations: "disabled",
          mask: await homepageMasks(page),
        },
      );
    });

    test("captures light mode after switching from dark", async ({ page }) => {
      // Start with dark color scheme preference
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/");

      // Ensure we're in dark mode first
      await ensureTheme(page, "dark");

      // Toggle to light mode
      await toggleTheme(page);
      await waitForThemeSwitch(page, "light");

      // Verify theme switched
      const newTheme = await getCurrentTheme(page);
      expect(newTheme).toBe("light");

      // Wait for stability after theme switch
      await waitForStableHeight(page);

      // Capture light mode state after switch
      await expect(page).toHaveScreenshot(
        "theme-switch-homepage-dark-to-light.png",
        {
          fullPage: true,
          animations: "disabled",
          mask: await homepageMasks(page),
        },
      );
    });

    test("captures state after multiple theme toggles", async ({ page }) => {
      // Start with light color scheme preference
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto("/");

      // Ensure we're in light mode first
      await ensureTheme(page, "light");

      // Toggle to dark
      await toggleTheme(page);
      await waitForThemeSwitch(page, "dark");

      // Toggle back to light
      await toggleTheme(page);
      await waitForThemeSwitch(page, "light");

      // Toggle to dark again
      await toggleTheme(page);
      await waitForThemeSwitch(page, "dark");

      // Verify final state is dark
      const finalTheme = await getCurrentTheme(page);
      expect(finalTheme).toBe("dark");

      // Wait for stability
      await waitForStableHeight(page);

      // Capture final state after multiple toggles
      await expect(page).toHaveScreenshot(
        "theme-switch-homepage-multi-toggle.png",
        {
          fullPage: true,
          animations: "disabled",
          mask: await homepageMasks(page),
        },
      );
    });
  });

  test.describe("Theme toggle button states", () => {
    test("shows sun icon in dark mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/");
      await ensureTheme(page, "dark");

      const themeToggle = page.locator(
        'button[aria-label="Toggle color theme"]',
      );
      await expect(themeToggle).toBeVisible();

      // Capture the toggle button in dark mode (shows sun icon)
      await expect(themeToggle).toHaveScreenshot("theme-toggle-dark-mode.png", {
        animations: "disabled",
      });
    });

    test("shows moon icon in light mode", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto("/");
      await ensureTheme(page, "light");

      const themeToggle = page.locator(
        'button[aria-label="Toggle color theme"]',
      );
      await expect(themeToggle).toBeVisible();

      // Capture the toggle button in light mode (shows moon icon)
      await expect(themeToggle).toHaveScreenshot(
        "theme-toggle-light-mode.png",
        {
          animations: "disabled",
        },
      );
    });

    test("toggle button icon changes after click", async ({ page }) => {
      // Start in light mode
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto("/");
      await ensureTheme(page, "light");

      // Toggle to dark mode
      await toggleTheme(page);
      await waitForThemeSwitch(page, "dark");

      const themeToggle = page.locator(
        'button[aria-label="Toggle color theme"]',
      );

      // Capture toggle button after switch (should show sun icon now)
      await expect(themeToggle).toHaveScreenshot(
        "theme-toggle-after-switch.png",
        {
          animations: "disabled",
        },
      );
    });
  });

  test.describe("Mobile viewport theme switching", () => {
    test("theme switching works on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto("/");
      await ensureTheme(page, "light");

      // Capture initial light mode on mobile
      await expect(page).toHaveScreenshot(
        "theme-switch-mobile-light-initial.png",
        {
          fullPage: true,
          animations: "disabled",
          mask: await homepageMasks(page),
        },
      );

      // Toggle to dark mode
      await toggleTheme(page);
      await waitForThemeSwitch(page, "dark");
      await waitForStableHeight(page);

      // Capture dark mode on mobile after switch
      await expect(page).toHaveScreenshot(
        "theme-switch-mobile-light-to-dark.png",
        {
          fullPage: true,
          animations: "disabled",
          mask: await homepageMasks(page),
        },
      );
    });
  });
});
