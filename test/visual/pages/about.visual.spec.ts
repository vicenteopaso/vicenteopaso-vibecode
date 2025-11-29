import { expect, test } from "@playwright/test";

test.describe("About Page Visual Regression", () => {
  test("renders about page in light mode", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for profile image to be visible and loaded
    await page.waitForSelector('img[alt*="Portrait"]', { state: "visible" });

    // Wait for ImpactCards to be visible
    await page.waitForSelector('[data-testid="impact-cards"], .space-y-6', {
      state: "visible",
    });

    // Wait for footer to ensure full page is rendered
    await page.waitForSelector("footer", { state: "visible" });

    // Wait for page height to stabilize
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let lastHeight = document.body.scrollHeight;
        let stableCount = 0;
        const checkHeight = setInterval(() => {
          const currentHeight = document.body.scrollHeight;
          if (currentHeight === lastHeight) {
            stableCount++;
            if (stableCount >= 3) {
              clearInterval(checkHeight);
              resolve(true);
            }
          } else {
            stableCount = 0;
            lastHeight = currentHeight;
          }
        }, 100);
      });
    });

    await expect(page).toHaveScreenshot("about-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders about page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for profile image to be visible and loaded
    await page.waitForSelector('img[alt*="Portrait"]', { state: "visible" });

    // Wait for ImpactCards to be visible
    await page.waitForSelector('[data-testid="impact-cards"], .space-y-6', {
      state: "visible",
    });

    // Wait for footer to ensure full page is rendered
    await page.waitForSelector("footer", { state: "visible" });

    // Wait for page height to stabilize
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let lastHeight = document.body.scrollHeight;
        let stableCount = 0;
        const checkHeight = setInterval(() => {
          const currentHeight = document.body.scrollHeight;
          if (currentHeight === lastHeight) {
            stableCount++;
            if (stableCount >= 3) {
              clearInterval(checkHeight);
              resolve(true);
            }
          } else {
            stableCount = 0;
            lastHeight = currentHeight;
          }
        }, 100);
      });
    });

    await expect(page).toHaveScreenshot("about-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });

  test("renders about page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for profile image to be visible and loaded
    await page.waitForSelector('img[alt*="Portrait"]', { state: "visible" });

    // Wait for ImpactCards to be visible
    await page.waitForSelector('[data-testid="impact-cards"], .space-y-6', {
      state: "visible",
    });

    // Wait for footer to ensure full page is rendered
    await page.waitForSelector("footer", { state: "visible" });

    // Wait for page height to stabilize
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let lastHeight = document.body.scrollHeight;
        let stableCount = 0;
        const checkHeight = setInterval(() => {
          const currentHeight = document.body.scrollHeight;
          if (currentHeight === lastHeight) {
            stableCount++;
            if (stableCount >= 3) {
              clearInterval(checkHeight);
              resolve(true);
            }
          } else {
            stableCount = 0;
            lastHeight = currentHeight;
          }
        }, 100);
      });
    });

    await expect(page).toHaveScreenshot("about-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
    });
  });
});
