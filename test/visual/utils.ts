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

// Get the current theme from the document's root element
export async function getCurrentTheme(page: Page): Promise<string> {
  return page.evaluate(() => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) return "dark";
    if (html.classList.contains("light")) return "light";
    // next-themes may use data-theme attribute as well
    return html.getAttribute("data-theme") || "system";
  });
}

// Toggle the theme by clicking the theme toggle button
export async function toggleTheme(page: Page): Promise<void> {
  const themeToggle = page.locator('button[aria-label="Toggle color theme"]');
  await themeToggle.click();
}

// Wait for theme switch to complete by observing the root element class change
// Uses MutationObserver for reliable detection
export async function waitForThemeSwitch(
  page: Page,
  expectedTheme: "light" | "dark",
): Promise<void> {
  // Wait for the class to be applied to the HTML element
  // next-themes sets the class on <html> element
  await page.waitForFunction(
    (theme) => {
      const html = document.documentElement;
      return html.classList.contains(theme);
    },
    expectedTheme,
    { timeout: 10000 },
  );

  // Wait for any CSS custom properties and styles to be applied
  // This ensures colors and backgrounds have updated
  await page.evaluate(() => {
    // Force a reflow to ensure all styles are applied
    void document.body.offsetHeight;
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  });

  // Wait for fonts to ensure consistent rendering
  await page.evaluate(() => document.fonts.ready);
}

// Wait for page to be ready for theme switching tests
// This function waits for hydration to complete and the initial theme to be applied
export async function waitForThemeTestReady(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Wait for navigation menu to be visible (contains theme toggle)
  await page.waitForSelector('button[aria-label="Toggle color theme"]', {
    state: "visible",
  });

  // Wait for footer to ensure full page is rendered
  await page.waitForSelector("footer", { state: "visible" });

  // Wait for next-themes hydration to complete
  // The component sets mounted=true after useEffect runs
  // We detect this by checking if the theme class is present
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      return html.classList.contains("dark") || html.classList.contains("light");
    },
    undefined,
    { timeout: 10000 },
  );

  await waitForStableHeight(page);
}

// Ensure page is in a specific theme before testing
// This handles the case where system preference affects initial theme
export async function ensureTheme(
  page: Page,
  targetTheme: "light" | "dark",
): Promise<void> {
  await waitForThemeTestReady(page);

  const currentTheme = await getCurrentTheme(page);

  // If not in the target theme, toggle to get there
  if (currentTheme !== targetTheme) {
    await toggleTheme(page);
    await waitForThemeSwitch(page, targetTheme);
  }

  // Verify we're in the correct theme
  const finalTheme = await getCurrentTheme(page);
  if (finalTheme !== targetTheme) {
    throw new Error(
      `Failed to set theme to ${targetTheme}. Current theme: ${finalTheme}`,
    );
  }
}
