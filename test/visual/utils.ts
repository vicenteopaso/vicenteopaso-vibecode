import type { Locator, Page } from "@playwright/test";

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
