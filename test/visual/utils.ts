import type { Locator, Page } from "@playwright/test";

// Shared selectors for visual tests
export const PORTRAIT_SELECTOR = 'img[alt*="Portrait"]';
export const REFERENCES_SECTION_SELECTOR = "#references";

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

// Freeze references carousel buttons to prevent auto-rotation during screenshots
export async function freezeReferencesCarousel(page: Page): Promise<void> {
  await page.evaluate((selector) => {
    const section = document.querySelector(selector);
    if (!section) return;
    const buttons = section.querySelectorAll("button");
    buttons.forEach((btn) => {
      (btn as HTMLButtonElement).style.pointerEvents = "none";
    });
  }, REFERENCES_SECTION_SELECTOR);
}

// Get portrait mask locator for visual tests
export function getPortraitMask(page: Page): Locator {
  return page.locator(PORTRAIT_SELECTOR);
}

// Shared masks for pages
export async function homepageMasks(page: Page): Promise<Locator[]> {
  return [
    page.locator(PORTRAIT_SELECTOR),
    page.locator('[data-testid="impact-cards"]'),
  ];
}

export async function cvPageMasks(page: Page): Promise<Locator[]> {
  return [page.locator(REFERENCES_SECTION_SELECTOR)];
}

// Wait for CV page to be fully loaded and ready for screenshot
export async function waitForCVPage(page: Page): Promise<void> {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
    // Continue if networkidle times out
  });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Wait for CV heading to be visible
  await page.waitForSelector("h1", { state: "visible" });

  // Wait for references section to be fully rendered (includes dynamic height calculation)
  await page.waitForSelector(REFERENCES_SECTION_SELECTOR, { state: "visible" });
  await page.waitForSelector("footer", { state: "visible" });

  await waitForStableHeight(page);
}

// Wait for homepage to be fully loaded and ready for screenshot
export async function waitForHomepage(page: Page): Promise<void> {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
    // Continue if networkidle times out
  });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Wait for profile image to be visible and loaded
  await page.waitForSelector(PORTRAIT_SELECTOR, { state: "visible" });

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
