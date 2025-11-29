import { expect, test } from "@playwright/test";

test.describe("CV Page Visual Regression", () => {
  test("renders CV page in light mode", async ({ page }) => {
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for CV heading to be visible
    await page.waitForSelector("h1", { state: "visible" });

    // Wait for references section to be fully rendered (includes dynamic height calculation)
    await page.waitForSelector("#references", { state: "visible" });
    await page.waitForSelector("footer", { state: "visible" });

    await expect(page).toHaveScreenshot("cv-light.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      mask: [page.locator("#references")], // Mask auto-rotating references carousel
    });
  });

  test("renders CV page in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for CV heading to be visible
    await page.waitForSelector("h1", { state: "visible" });

    // Wait for references section to be fully rendered (includes dynamic height calculation)
    await page.waitForSelector("#references", { state: "visible" });
    await page.waitForSelector("footer", { state: "visible" });

    await expect(page).toHaveScreenshot("cv-dark.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      mask: [page.locator("#references")], // Mask auto-rotating references carousel
    });
  });

  test("renders CV page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for CV heading to be visible
    await page.waitForSelector("h1", { state: "visible" });

    // Wait for references section to be fully rendered (includes dynamic height calculation)
    await page.waitForSelector("#references", { state: "visible" });
    await page.waitForSelector("footer", { state: "visible" });

    // Wait for page height to stabilize (ReferencesCarousel does dynamic height measurement)
    await page.waitForFunction(
      () => {
        // Wait until scrollHeight remains unchanged for 200ms
        interface WindowWithCheck extends Window {
          __lastScrollHeightCheck?: {
            height: number;
            stableSince: number;
          };
        }
        const w = window as WindowWithCheck;
        if (!w.__lastScrollHeightCheck) {
          w.__lastScrollHeightCheck = {
            height: document.documentElement.scrollHeight,
            stableSince: Date.now(),
          };
          return false;
        }
        const currentHeight = document.documentElement.scrollHeight;
        if (currentHeight !== w.__lastScrollHeightCheck.height) {
          w.__lastScrollHeightCheck.height = currentHeight;
          w.__lastScrollHeightCheck.stableSince = Date.now();
          return false;
        }
        return Date.now() - w.__lastScrollHeightCheck.stableSince > 200;
      },
      { timeout: 2000 },
    );

    await expect(page).toHaveScreenshot("cv-mobile.png", {
      fullPage: true,
      animations: "disabled",
      timeout: 15000,
      mask: [page.locator("#references")], // Mask auto-rotating references carousel
    });
  });
});
