import type { Locator, Page } from "@playwright/test";

/**
 * Wait for an element's hover styles to stabilize after hovering.
 * Checks that computed styles remain unchanged for consecutive checks.
 *
 * @param locator - The Playwright locator for the element
 * @param consecutive - Number of consecutive stable checks required (default: 3)
 * @param intervalMs - Interval between checks in milliseconds (default: 50)
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 5000)
 */
export async function waitForHoverStyles(
  locator: Locator,
  consecutive: number = 3,
  intervalMs: number = 50,
  timeoutMs: number = 5000,
): Promise<void> {
  await locator.evaluate(
    (el, args) => {
      const { consecutive, intervalMs, timeoutMs } = args as {
        consecutive: number;
        intervalMs: number;
        timeoutMs: number;
      };
      return new Promise<void>((resolve, reject) => {
        const getStyles = () => {
          const computed = getComputedStyle(el);
          return `${computed.color}|${computed.backgroundColor}|${computed.borderColor}|${computed.boxShadow}|${computed.transform}|${computed.opacity}`;
        };
        let lastStyles = getStyles();
        let stableCount = 0;
        const startTime = Date.now();
        const check = setInterval(() => {
          // Check for timeout
          if (Date.now() - startTime > timeoutMs) {
            clearInterval(check);
            reject(
              new Error(
                `Hover styles did not stabilize within ${timeoutMs}ms`,
              ),
            );
            return;
          }
          const currentStyles = getStyles();
          if (currentStyles === lastStyles) {
            stableCount++;
            if (stableCount >= consecutive) {
              clearInterval(check);
              resolve();
            }
          } else {
            stableCount = 0;
            lastStyles = currentStyles;
          }
        }, intervalMs);
      });
    },
    { consecutive, intervalMs, timeoutMs },
  );
}

// Wait until document height is stable for N consecutive checks
export async function waitForStableHeight(
  page: Page,
  consecutive: number = 3,
  intervalMs: number = 100,
): Promise<void> {
  await page.evaluate(
    (args) => {
      const { consecutive, intervalMs } = args as {
        consecutive: number;
        intervalMs: number;
      };
      return new Promise<void>((resolve) => {
        let lastHeight = document.body.scrollHeight;
        let stableCount = 0;
        const checkHeight = setInterval(() => {
          const currentHeight = document.body.scrollHeight;
          if (currentHeight === lastHeight) {
            stableCount++;
            if (stableCount >= consecutive) {
              clearInterval(checkHeight);
              resolve();
            }
          } else {
            stableCount = 0;
            lastHeight = currentHeight;
          }
        }, intervalMs);
      });
    },
    { consecutive, intervalMs },
  );
}

// Disable pointer events on carousels to prevent user-driven changes
export async function freezeCarouselInteractions(
  page: Page,
  selector: string,
): Promise<void> {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const buttons = el.querySelectorAll("button");
    buttons.forEach((btn) => (btn.style.pointerEvents = "none"));
  }, selector);
}

// Wait for a target element's transform to remain stable
export async function waitForStableTransform(
  page: Page,
  selector: string,
  consecutive: number = 3,
  intervalMs: number = 100,
): Promise<void> {
  await page.evaluate(
    (args) => {
      const { selector, consecutive, intervalMs } = args as {
        selector: string;
        consecutive: number;
        intervalMs: number;
      };
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) return;
      return new Promise<void>((resolve) => {
        let lastTransform = getComputedStyle(el).transform;
        let stableCount = 0;
        const check = setInterval(() => {
          const currentTransform = getComputedStyle(el).transform;
          if (currentTransform === lastTransform) {
            stableCount++;
            if (stableCount >= consecutive) {
              clearInterval(check);
              resolve();
            }
          } else {
            stableCount = 0;
            lastTransform = currentTransform;
          }
        }, intervalMs);
      });
    },
    { selector, consecutive, intervalMs },
  );
}

// Shared masks for pages
export async function homepageMasks(page: Page): Promise<Locator[]> {
  return [
    page.locator('img[alt*="Portrait"]'),
    page.locator('[data-testid="impact-cards"]'),
  ];
}

export async function cvPageMasks(page: Page): Promise<Locator[]> {
  return [page.locator("#references")];
}

// Wait for CV page to be fully loaded and ready for screenshot
export async function waitForCVPage(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Wait for CV heading to be visible
  await page.waitForSelector("h1", { state: "visible" });

  // Wait for references section to be fully rendered (includes dynamic height calculation)
  await page.waitForSelector("#references", { state: "visible" });
  await page.waitForSelector("footer", { state: "visible" });

  await waitForStableHeight(page);
}

// Wait for homepage to be fully loaded and ready for screenshot
export async function waitForHomepage(page: Page): Promise<void> {
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

  await waitForStableHeight(page);
  await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');
  await waitForStableTransform(page, '[data-testid="impact-cards"]');
}
