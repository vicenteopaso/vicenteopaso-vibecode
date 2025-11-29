import { expect, test } from "@playwright/test";

test.describe("Homepage Visual Regression", () => {
  test("renders homepage correctly in light mode", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for profile image to be visible and loaded
    await page.waitForSelector('img[alt*="Portrait"]', { state: "visible" });

    // Wait for carousel container (ImpactCards) to be visible
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

    // Stop carousel rotation to ensure stable screenshot
    await page.evaluate(() => {
      const carousel = document.querySelector('[data-testid="impact-cards"]');
      if (carousel) {
        const buttons = carousel.querySelectorAll("button");
        buttons.forEach((btn) => (btn.style.pointerEvents = "none"));
      }
    });

    // Additional wait for carousel to settle
    await page.waitForTimeout(500);

    // Take full page screenshot
    await expect(page).toHaveScreenshot("homepage-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      maxDiffPixelRatio: 0.02, // Allow for ImpactCards carousel rotation
    });
  });

  test("renders homepage correctly in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for profile image to be visible and loaded
    await page.waitForSelector('img[alt*="Portrait"]', { state: "visible" });

    // Wait for carousel container (ImpactCards) to be visible
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

    // Stop carousel rotation to ensure stable screenshot
    await page.evaluate(() => {
      const carousel = document.querySelector('[data-testid="impact-cards"]');
      if (carousel) {
        const buttons = carousel.querySelectorAll("button");
        buttons.forEach((btn) => (btn.style.pointerEvents = "none"));
      }
    });

    // Additional wait for carousel to settle
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("homepage-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      maxDiffPixelRatio: 0.02, // Allow for ImpactCards carousel rotation
    });
  });

  test("renders homepage on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for profile image to be visible and loaded
    await page.waitForSelector('img[alt*="Portrait"]', { state: "visible" });

    // Wait for carousel container (ImpactCards) to be visible
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

    // Stop carousel rotation to ensure stable screenshot
    await page.evaluate(() => {
      const carousel = document.querySelector('[data-testid="impact-cards"]');
      if (carousel) {
        const buttons = carousel.querySelectorAll("button");
        buttons.forEach((btn) => (btn.style.pointerEvents = "none"));
      }
    });

    // Wait for carousel position to stabilize (deterministic wait)
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const carousel = document.querySelector('[data-testid="impact-cards"]');
        if (!carousel) return resolve(true);
        let lastTransform = getComputedStyle(carousel).transform;
        let stableCount = 0;
        const checkStable = setInterval(() => {
          const currentTransform = getComputedStyle(carousel).transform;
          if (currentTransform === lastTransform) {
            stableCount++;
            if (stableCount >= 3) {
              clearInterval(checkStable);
              resolve(true);
            }
          } else {
            stableCount = 0;
            lastTransform = currentTransform;
          }
        }, 100);
      });
    });

    await expect(page).toHaveScreenshot("homepage-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      maxDiffPixelRatio: 0.02, // Allow for ImpactCards carousel rotation
    });
  });
});
