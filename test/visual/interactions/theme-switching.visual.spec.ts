import { expect, test } from "@playwright/test";

import {
  getCurrentTheme,
  homepageMasks,
  waitForHomepage,
  waitForThemeTransition,
} from "../utils";

test.describe("Theme Switching Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Use reduced motion to minimize animation-related flakiness
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("captures theme toggle button in light mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await waitForHomepage(page);

    // Find the theme toggle button
    const themeButton = page.getByRole("button", {
      name: "Toggle color theme",
    });
    await expect(themeButton).toBeVisible();

    // Screenshot the navigation area containing the theme toggle
    const nav = page.locator("header nav");
    await expect(nav).toHaveScreenshot("theme-toggle-light.png", {
      animations: "disabled",
    });
  });

  test("captures theme toggle button in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Find the theme toggle button
    const themeButton = page.getByRole("button", {
      name: "Toggle color theme",
    });
    await expect(themeButton).toBeVisible();

    // Screenshot the navigation area containing the theme toggle
    const nav = page.locator("header nav");
    await expect(nav).toHaveScreenshot("theme-toggle-dark.png", {
      animations: "disabled",
    });
  });

  test("theme switches from dark to light correctly", async ({ page }) => {
    // Start in dark mode
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Verify starting in dark mode
    const initialTheme = await getCurrentTheme(page);
    expect(initialTheme).toBe("dark");

    // Click theme toggle
    const themeButton = page.getByRole("button", {
      name: "Toggle color theme",
    });
    await themeButton.click();

    // Wait for theme transition
    await waitForThemeTransition(page);

    // Verify theme changed
    const newTheme = await getCurrentTheme(page);
    expect(newTheme).toBe("light");

    // Screenshot after theme switch
    await expect(page).toHaveScreenshot("theme-after-switch-to-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      mask: await homepageMasks(page),
    });
  });

  test("theme switches from light to dark correctly", async ({ page }) => {
    // Start in light mode
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await waitForHomepage(page);

    // Verify starting in light mode
    const initialTheme = await getCurrentTheme(page);
    expect(initialTheme).toBe("light");

    // Click theme toggle
    const themeButton = page.getByRole("button", {
      name: "Toggle color theme",
    });
    await themeButton.click();

    // Wait for theme transition
    await waitForThemeTransition(page);

    // Verify theme changed
    const newTheme = await getCurrentTheme(page);
    expect(newTheme).toBe("dark");

    // Screenshot after theme switch
    await expect(page).toHaveScreenshot("theme-after-switch-to-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      mask: await homepageMasks(page),
    });
  });

  test("navigation maintains correct styling after theme switch", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    // Toggle theme twice to verify consistent state
    const themeButton = page.getByRole("button", {
      name: "Toggle color theme",
    });

    await themeButton.click();
    await waitForThemeTransition(page);
    await themeButton.click();
    await waitForThemeTransition(page);

    // Should be back in dark mode
    const finalTheme = await getCurrentTheme(page);
    expect(finalTheme).toBe("dark");

    // Screenshot header after round-trip
    const header = page.locator("header");
    await expect(header).toHaveScreenshot("header-after-theme-roundtrip.png", {
      animations: "disabled",
    });
  });
});
