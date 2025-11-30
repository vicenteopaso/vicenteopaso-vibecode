# Visual Regression Tests

This directory contains Playwright-based visual regression tests for the portfolio site.

## Structure

```
test/visual/
├── pages/              # Full-page screenshots
│   ├── home.visual.spec.ts         # Homepage/About page at root (light, dark, mobile)
│   ├── cv.visual.spec.ts           # CV page (light, dark, mobile)
│   ├── hover-states.visual.spec.ts # Hover states for interactive elements
│   └── policies.visual.spec.ts     # Planned
├── components/         # Component-level screenshots (planned)
│   ├── navigation.visual.spec.ts
│   ├── profile-card.visual.spec.ts
│   └── footer.visual.spec.ts
└── themes/            # Theme-specific tests (planned)
    └── theme-switching.visual.spec.ts
```

## Running Tests

```bash
# Run all visual tests
pnpm test:visual

# Run specific test
pnpm test:visual -- test/visual/pages/home.visual.spec.ts

# Update baselines after intentional changes
pnpm test:visual:update

# View test report
pnpm playwright show-report
```

## Baseline Management

Baselines are stored in `*-snapshots/` directories next to test files.

### When to Update Baselines

- After intentional design changes
- When adding new components or pages
- After updating typography or colors
- When fixing visual bugs

### How to Update Baselines

1. Make your design changes
2. Run `pnpm test:visual:update`
3. Review all updated screenshots carefully
4. Commit updated baselines:
   ```bash
   git add test/visual/**/*-snapshots/
   git commit -m "test: update visual baselines for [reason]"
   ```

## Writing New Tests

### Basic Template

**Always use shared utilities from `utils.ts`:**

```typescript
import { expect, test } from "@playwright/test";
import {
  waitForHomepage, // or waitForCVPage for CV page
  homepageMasks, // or cvPageMasks for CV page
} from "../utils";

test.describe("Page Name Visual Regression", () => {
  test("renders page correctly in light mode", async ({ page }) => {
    await page.goto("/");
    await waitForHomepage(page); // Handles all setup: networkidle, fonts, elements, stability

    await expect(page).toHaveScreenshot("homepage-light.png", {
      fullPage: true,
      animations: "disabled",
      mask: await homepageMasks(page), // Mask dynamic content
    });
  });

  test("renders page correctly in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    await expect(page).toHaveScreenshot("homepage-dark.png", {
      fullPage: true,
      animations: "disabled",
      mask: await homepageMasks(page),
    });
  });

  test("renders page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForHomepage(page);

    await expect(page).toHaveScreenshot("homepage-mobile.png", {
      fullPage: true,
      animations: "disabled",
      mask: await homepageMasks(page),
    });
  });
});
```

### Page-Specific Wait Helpers

Use dedicated helper functions for each page type:

- **`waitForHomepage(page)`**: Waits for homepage to be fully loaded (network idle, fonts, portrait, ImpactCards, footer, stable height, frozen carousels)
- **`waitForCVPage(page)`**: Waits for CV page to be fully loaded (network idle, fonts, h1, references section, footer, stable height)
- **`waitForHoverStyles(locator)`**: Waits for hover styles to stabilize on an element after hovering

### Dynamic Content Handling

This site has dynamic content that requires masking:

- **ProfileCard**: `Math.random()` selects from 3 portrait images
- **ImpactCards**: Auto-rotates cards every 7s with random selection
- **ReferencesCarousel**: Auto-rotates testimonials every 5s

**Solution**: Use shared mask functions:

```typescript
// Homepage
mask: await homepageMasks(page), // Excludes portrait + ImpactCards

// CV page
mask: await cvPageMasks(page), // Excludes references carousel
```

```typescript
test("component in light mode", async ({ page }) => {
  await page.goto("/page");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("component-light.png", {
    animations: "disabled",
  });
});

test("component in dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/page");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("component-dark.png", {
    animations: "disabled",
  });
});
```

## Best Practices

1. **Use shared utilities**: Always prefer `utils.ts` helpers over inline waits or timeouts
2. **Mask dynamic content**: Use `homepageMasks()` or `cvPageMasks()` for areas with random/time-based changes
3. **Disable animations**: Always use `animations: 'disabled'`
4. **Wait for stability**: Use `waitForLoadState('networkidle')`, `document.fonts.ready`, `waitForStableHeight()`
5. **Descriptive names**: Name screenshots clearly (e.g., `homepage-light.png`, `cv-dark.png`)
6. **Test both themes**: Test light and dark mode for all pages
7. **Test mobile viewports**: Include 375×667 mobile tests
8. **Use reduced motion for hover tests**: Prefer `reducedMotion: 'reduce'` for predictable hover state testing

## Hover State Testing

For testing hover states of interactive elements:

```typescript
import { expect, test } from "@playwright/test";
import { waitForHomepage, waitForHoverStyles } from "../utils";

test.describe("Hover States", () => {
  test.beforeEach(async ({ page }) => {
    // Enable reduced motion for animation predictability
    await page.emulateMedia({ reducedMotion: "reduce" });
    // Set desktop viewport to ensure all elements are visible
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("button hover state", async ({ page }) => {
    await page.goto("/");
    await waitForHomepage(page);

    const button = page.locator('button[aria-label="My Button"]');
    await button.hover();
    await waitForHoverStyles(button);

    await expect(button).toHaveScreenshot("button-hover.png", {
      animations: "disabled",
    });
  });
});
```

Key points for hover state tests:
- **Reduced motion**: Use `reducedMotion: 'reduce'` to disable CSS transitions/animations
- **Desktop viewport**: Set viewport width ≥ 640px to show desktop-only elements
- **Wait for hover styles**: Use `waitForHoverStyles(locator)` for deterministic completion
- **Element screenshots**: Take screenshots of the hovered element, not the full page

## Troubleshooting

### Visual test fails with minor differences

**Solution 1**: Adjust tolerance in test:

```typescript
await expect(page).toHaveScreenshot("example.png", {
  maxDiffPixels: 200,
  threshold: 0.3,
});
```

**Solution 2**: Update baseline if change is intentional:

```bash
pnpm test:visual:update
```

### Font rendering differences across environments

Ensure consistent environment:

- Use same OS for local and CI
- Or run tests in Docker container
- Adjust `threshold` if minor differences are acceptable

## Related Documentation

- [Visual Regression Testing Guide](../../docs/VISUAL_REGRESSION_TESTING.md)
- [Testing Guide](../../docs/TESTING.md)
- [Playwright Documentation](https://playwright.dev/docs/test-snapshots)
