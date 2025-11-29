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

// Wait for modal to be fully visible and stable
export async function waitForModalOpen(page: Page): Promise<void> {
  // Wait for the dialog to be visible
  await page.waitForSelector('[role="dialog"]', { state: "visible" });

  // Wait for backdrop overlay to be visible
  await page.waitForSelector('[data-state="open"]', { state: "visible" });

  // Wait for any animations to complete
  await page.evaluate(() => document.fonts.ready);
  await waitForStableHeight(page);
}

// Wait for modal to be fully closed
export async function waitForModalClose(page: Page): Promise<void> {
  // Wait for dialog to be hidden
  await page.waitForSelector('[role="dialog"]', {
    state: "hidden",
    timeout: 5000,
  });
}

// Wait for theme transition to complete
export async function waitForThemeTransition(page: Page): Promise<void> {
  // The theme provider uses disableTransitionOnChange, but we still wait for
  // the DOM to update and any re-renders to complete
  await page.evaluate(() => document.fonts.ready);
  await waitForStableHeight(page);
}

// Get the current theme class on html element
export async function getCurrentTheme(page: Page): Promise<string> {
  return page.evaluate(() => {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  });
}

// Mask for the contact dialog (excluding Turnstile widget which is dynamic)
export async function contactDialogMasks(page: Page): Promise<Locator[]> {
  return [
    page.locator(".cf-turnstile"), // Turnstile challenge container is dynamic
  ];
}
