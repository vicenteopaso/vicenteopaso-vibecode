# Visual Regression Testing Strategy

## Overview

This document outlines the visual regression testing strategy for the portfolio site. Since this project uses **markdown-based component documentation** instead of Storybook, we implement visual regression testing using **Playwright's built-in screenshot comparison** capabilities.

## Decision: Playwright Visual Comparisons

### Rationale

After evaluating the options:

1. **Chromatic** - Requires Storybook (not used in this project)
2. **Percy** - Requires additional paid service and integration
3. **Playwright Visual Comparisons** - ✅ **Selected**
   - Already integrated into the project
   - No additional dependencies or services
   - Native screenshot comparison with auto-updating baselines
   - Works with existing E2E test infrastructure
   - Free and open-source
   - Supports CI/CD workflows

### Benefits

- **Zero additional cost**: Uses existing Playwright infrastructure
- **Simple workflow**: Screenshots stored in git alongside tests
- **Developer-friendly**: Review diffs locally before committing
- **CI-ready**: Playwright built-in CI support for visual comparisons
- **Consistent with existing tools**: No new toolchain to learn

### Trade-offs

- **Manual baseline updates**: Requires git commits for baseline updates (vs. cloud-based approval)
- **Git storage**: Screenshots stored in repository (Playwright default behavior)
- **No web UI**: Review diffs in local Playwright HTML report (vs. cloud dashboard)

For a personal portfolio site with ~20 pages and a small team, these trade-offs are acceptable.

## Implementation Approach

### 1. Visual Snapshot Tests

Create targeted visual regression tests for critical UI surfaces:

#### Critical Pages

- Home page (root `/`) - Light, dark, and mobile viewport (375×667px)
- CV page (`/cv`) - Light, dark, and mobile viewport (375×667px)
- Policy pages (`/privacy-policy`, `/cookie-policy`, `/accessibility`) - Planned

#### Critical Components

- Navigation menu (light & dark themes)
- Profile card (multiple variants)
- Contact dialog
- Impact cards
- References carousel
- Footer

### 2. Test Organization

```
test/visual/
├── pages/
│   ├── home.visual.spec.ts          # ✅ Light, dark, mobile (375×667px) - About page at root
│   ├── cv.visual.spec.ts            # ✅ Light, dark, mobile (375×667px)
│   └── policies.visual.spec.ts      # 🔜 Planned
├── components/
│   ├── navigation.visual.spec.ts    # ✅ Light, dark, mobile, CV active state
│   ├── profile-card.visual.spec.ts  # ✅ Homepage and CV variants (light, dark, mobile)
│   ├── contact-dialog.visual.spec.ts # ✅ Light, dark, mobile
│   ├── impact-cards.visual.spec.ts  # ✅ Light, dark, mobile, single card
│   ├── references-carousel.visual.spec.ts # ✅ Light, dark, mobile, dots navigation
│   └── footer.visual.spec.ts        # ✅ Light, dark, mobile, CV page
└── themes/
    └── theme-switching.visual.spec.ts # 🔜 Planned
```

### 3. Baseline Management

Playwright stores screenshots in:

```
test/visual/*.visual.spec.ts-snapshots/
```

**Workflow:**

1. Run tests to generate baseline screenshots
2. Review baselines visually before committing
3. Commit baselines to git
4. Future test runs compare against committed baselines
5. When intentional changes occur, update baselines with `--update-snapshots`

### 4. CI Integration

Visual tests run in CI and fail on mismatches:

```yaml
# .github/workflows/visual-regression.yml
- name: Run visual regression tests
  run: pnpm test:visual

- name: Upload visual diff artifacts
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: visual-diffs
    path: test-results/
```

## Usage

### Running Visual Tests

```bash
# Run all visual tests
pnpm test:visual

# Run specific visual test
pnpm test:visual -- test/visual/pages/home.visual.spec.ts

# Update baselines after intentional changes
pnpm test:visual:update

# View HTML report with diffs
pnpm playwright show-report
```

### Writing Visual Tests

**Always use shared utilities from `test/visual/utils.ts`:**

```typescript
import { test, expect } from "@playwright/test";
import { waitForHomepage, homepageMasks } from "../utils";

test.describe("Homepage Visual Regression", () => {
  test("renders homepage correctly in light mode", async ({ page }) => {
    await page.goto("/");
    await waitForHomepage(page); // Handles all setup: networkidle, fonts, elements, stability

    await expect(page).toHaveScreenshot("homepage-light.png", {
      fullPage: true,
      animations: "disabled",
      mask: await homepageMasks(page), // Excludes portrait + ImpactCards
    });
  });

  test("renders homepage correctly in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await waitForHomepage(page);

    await expect(page).toHaveScreenshot("homepage-dark.png", {
      fullPage: true,
      animations: "disabled",
      mask: await homepageMasks(page),
    });
  });

  test("renders homepage on mobile viewport", async ({ page }) => {
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

#### Page-Specific Wait Helpers

Use dedicated helper functions for each page type to avoid code duplication:

- **`waitForHomepage(page)`**: Waits for homepage to be fully loaded (network idle, fonts, portrait, ImpactCards, footer, stable height, frozen carousels)
- **`waitForCVPage(page)`**: Waits for CV page to be fully loaded (network idle, fonts, h1, references section, footer, stable height)

```typescript
// CV page example
import { test, expect } from "@playwright/test";
import { waitForCVPage, cvPageMasks } from "../utils";

test("renders CV page in light mode", async ({ page }) => {
  await page.goto("/cv");
  await waitForCVPage(page);

  await expect(page).toHaveScreenshot("cv-light.png", {
    fullPage: true,
    animations: "disabled",
    mask: await cvPageMasks(page),
  });
});
```

### Component-Level Visual Tests

```typescript
test("profile card - about page variant", async ({ page }) => {
  await page.goto("/");

  // Target specific component
  const profileCard = page.locator('[data-testid="profile-card"]');
  await expect(profileCard).toBeVisible();

  // Screenshot just the component (note: portrait is masked at page level)
  await expect(profileCard).toHaveScreenshot("profile-card-about.png", {
    animations: "disabled",
  });
});
```

## Best Practices

### 1. Use Page-Specific Wait Helpers

**Always use page-specific wait helpers from `test/visual/utils.ts` to avoid code duplication:**

```typescript
// ✅ GOOD: Page-specific wait helper (handles all setup)
import { waitForHomepage, waitForCVPage } from "../utils";
await waitForHomepage(page); // For homepage
await waitForCVPage(page); // For CV page

// ❌ BAD: Repeated inline setup (duplicates code across tests)
await page.waitForLoadState("networkidle");
await page.evaluate(() => document.fonts.ready);
await page.waitForSelector("h1", { state: "visible" });
// ... more setup ...
```

### 2. Use Shared Low-Level Utilities

For custom pages or components, use the low-level utilities:

```typescript
// ✅ GOOD: Shared utilities for custom pages
import { waitForStableHeight, freezeCarouselInteractions } from "../utils";
await waitForStableHeight(page);
await freezeCarouselInteractions(page, '[data-testid="impact-cards"]');

// ❌ BAD: Inline polling logic (duplicates code, harder to maintain)
await page.evaluate(() => {
  return new Promise<void>((resolve) => {
    let lastHeight = document.body.scrollHeight;
    // ... inline polling code ...
  });
});
```

### 3. Mask Dynamic Content

This site has dynamic content that requires masking:

**Dynamic content sources:**

- **ProfileCard**: `Math.random()` selects from 3 portrait images on mount
- **ImpactCards**: Auto-rotates cards every 7s with random selection
- **ReferencesCarousel**: Auto-rotates testimonials every 5s

**Solution**: Use Playwright's `mask` option with shared helper functions:

```typescript
// Homepage: Mask portrait + ImpactCards
await expect(page).toHaveScreenshot("homepage.png", {
  mask: await homepageMasks(page), // Returns [portrait, impact-cards]
});

// CV page: Mask references carousel
await expect(page).toHaveScreenshot("cv.png", {
  mask: await cvPageMasks(page), // Returns [#references]
});
```

### 4. Disable Animations

Always disable animations for consistent screenshots:

```typescript
await expect(page).toHaveScreenshot("example.png", {
  animations: "disabled",
});
```

### 5. Wait for Content

Ensure all content is loaded before screenshot. **Prefer page-specific helpers:**

```typescript
// ✅ BEST: Use page-specific helper (encapsulates all waiting logic)
import { waitForHomepage, waitForCVPage } from "../utils";
await waitForHomepage(page);
await waitForCVPage(page);

// ✅ GOOD: Manual approach for custom pages
await page.waitForLoadState("networkidle");
await page.evaluate(() => document.fonts.ready);
await waitForStableHeight(page); // From test/visual/utils.ts
```

### 6. Use Descriptive Names

Name screenshots descriptively:

```typescript
// Good
"homepage-hero-section-dark-theme.png";

// Bad
"screenshot1.png";
```

### 7. Test Multiple Viewports

Test responsive design across viewports for comprehensive coverage. **Use page-specific helpers to reduce duplication:**

```typescript
import { waitForHomepage, homepageMasks } from "../utils";

// Desktop/default viewport (light mode)
test("homepage light mode", async ({ page }) => {
  await page.goto("/");
  await waitForHomepage(page);

  await expect(page).toHaveScreenshot("homepage-light.png", {
    fullPage: true,
    timeout: 15000,
    mask: await homepageMasks(page),
  });
});

// Desktop/default viewport (dark mode)
test("homepage dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await waitForHomepage(page);

  await expect(page).toHaveScreenshot("homepage-dark.png", {
    fullPage: true,
    timeout: 15000,
    mask: await homepageMasks(page),
  });
});

// Mobile viewport (iPhone SE dimensions)
test("homepage mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await waitForHomepage(page);

  await expect(page).toHaveScreenshot("homepage-mobile.png", {
    fullPage: true,
    timeout: 15000,
    mask: await homepageMasks(page),
  });
});
```

**Best practice**: All primary pages should include light mode, dark mode, and mobile viewport tests to ensure comprehensive responsive design coverage.

### Deterministic Waiting Patterns

**Always use deterministic waits instead of arbitrary timeouts** like `waitForTimeout()`. Hard-coded delays make tests slower and less reliable. **Page-specific helpers encapsulate these patterns:**

```typescript
// ✅ BEST: Page-specific helper (encapsulates all deterministic waits)
await waitForHomepage(page);
await waitForCVPage(page);

// ✅ GOOD: Wait for fonts to load
await page.evaluate(() => document.fonts.ready);

// ✅ GOOD: Wait for specific elements to be visible
await page.waitForSelector('img[alt*="Portrait"]', { state: "visible" });
await page.waitForSelector('[data-testid="carousel"]', { state: "visible" });

// ✅ GOOD: Wait for network to be idle
await page.waitForLoadState("networkidle");

// ✅ GOOD: Wait for specific network requests
await page.waitForResponse(
  (response) =>
    response.url().includes("/api/data") && response.status() === 200,
);

// ❌ BAD: Arbitrary timeout
await page.waitForTimeout(1000); // DON'T DO THIS
```

**Why deterministic waits are better**:

- Tests run as fast as possible (no waiting longer than necessary)
- Tests are more reliable (wait for actual conditions, not arbitrary time)
- Easier to debug failures (you know exactly what condition wasn't met)
- Better CI performance (faster test suite execution)

## Reviewing Changes

### Local Review

When visual tests fail locally:

1. Run `pnpm playwright show-report`
2. Click on failed test
3. View side-by-side comparison: Expected vs. Actual vs. Diff
4. Determine if change is intentional or a regression

### CI Review

When visual tests fail in CI:

1. Check PR comments for test failure
2. Download visual diff artifacts from CI
3. Review diffs locally
4. If intentional, update baselines:
   ```bash
   pnpm test:visual:update
   git add test/visual/**/*-snapshots/
   git commit -m "test: update visual baselines for [reason]"
   ```

## Configuration

### Playwright Configuration

In `playwright.config.ts`:

```typescript
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      // Maximum allowed pixel difference
      maxDiffPixels: 100,
      // Threshold for pixel comparison (0-1, lower is stricter)
      threshold: 0.2,
    },
  },
  // Generate HTML report with visual diffs
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  // Suppress Vercel Toolbar in screenshots
  use: {
    extraHTTPHeaders: {
      "x-vercel-skip-toolbar": "1",
    },
  },
});
```

### Third-Party Script Handling

Visual tests require deterministic screenshots without third-party overlays or indicators. This project handles analytics and monitoring scripts as follows:

#### Vercel Speed Insights Suppression

The `AnalyticsWrapper` component (`app/components/AnalyticsWrapper.tsx`) conditionally renders analytics based on environment detection:

```typescript
// Runtime detection prevents Speed Insights indicator in visual tests
const isTestEnvironment =
  (navigator as Navigator & { webdriver?: boolean }).webdriver === true ||
  (window as Window & { __PLAYWRIGHT__?: boolean }).__PLAYWRIGHT__ === true;

if (isTestEnvironment) {
  return null; // Skip analytics in test environments
}
```

The `__PLAYWRIGHT__` flag is set by test utilities (`test/visual/utils.ts`) in `setThemeLight()` and `setThemeDark()` functions via `page.addInitScript()`.

#### Vercel Toolbar Suppression

The Vercel Toolbar (separate from Speed Insights) is suppressed via HTTP header:

```typescript
// playwright.config.ts
use: {
  extraHTTPHeaders: {
    "x-vercel-skip-toolbar": "1",
  },
}
```

This dual-layer approach ensures clean screenshots without analytics overlays or toolbars during visual regression tests.

### Tolerance Configuration

Adjust tolerance based on surface criticality:

```typescript
// Strict for critical UI
await expect(page).toHaveScreenshot("navigation.png", {
  maxDiffPixels: 50,
  threshold: 0.1,
});

// Relaxed for less critical UI
await expect(page).toHaveScreenshot("footer.png", {
  maxDiffPixels: 200,
  threshold: 0.3,
});
```

## Coverage Goals

### Phase 1: Core Pages (Complete)

- ✅ Homepage
- ✅ About page
- ✅ CV page

### Phase 2: Components (Complete)

- ✅ Navigation menu (light/dark/mobile + CV active state)
- ✅ Profile card variants (Homepage with avatar, CV without avatar)
- ✅ Contact dialog (light/dark/mobile)
- ✅ Impact cards (light/dark/mobile + single card)
- ✅ References carousel (light/dark/mobile + dots navigation)
- ✅ Footer (light/dark/mobile + CV page)

### Phase 3: Interactions (Future)

- [ ] Theme switching animation
- [ ] Modal open/close states
- [ ] Form validation states
- [ ] Hover states for interactive elements

## Maintenance

### Baseline Updates

Update baselines when:

- Intentional design changes are made
- New components or pages are added
- Typography or spacing is adjusted
- Theme colors are updated

**Process:**

1. Make design changes
2. Run `pnpm test:visual:update`
3. Review all updated screenshots carefully
4. Commit updated baselines with descriptive message
5. Link to related design change PR or issue

### GitHub Actions baseline update workflow (manual)

This repo includes a manual workflow for updating committed Playwright baselines:

- Workflow: `.github/workflows/update-visual-snapshots.yml` ("Update Playwright Visual Snapshots")
- What it does: checks out the selected branch, runs `pnpm test:visual:update`, commits snapshot changes, and pushes back to the same branch.

When you manually trigger it via the GitHub Actions UI:

1. Select the branch you want to update.
2. Optional: enable **Allow CI to run on PRs for the snapshot update commit**.
   - If enabled: the workflow commits **without** `[skip ci]`, and CI will trigger on the new commit (requires `PAT_WORKFLOW_TRIGGER` secret configured).
   - If disabled (default): it commits with `[skip ci]`, so the update will _not_ trigger CI even if the branch has an open PR.

**Setup requirements:**

To enable automatic CI triggering when the "Allow CI to run" option is enabled, configure a Personal Access Token (PAT):

1. Create a classic PAT (recommended) or fine-grained PAT at [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - For classic PAT: select `repo` and `workflow` scopes
   - For fine-grained PAT: grant repository access with `Contents: Read and write` and `Actions: Read and write` permissions
2. Add it as a repository secret named `PAT_WORKFLOW_TRIGGER` at Settings > Secrets and Variables > Actions
3. Without this secret, the workflow falls back to `GITHUB_TOKEN`, which cannot trigger other workflows due to GitHub Actions security restrictions.

Notes:

- When using `GITHUB_TOKEN` (fallback), commits from this workflow will not trigger CI even without `[skip ci]`, due to GitHub Actions security restrictions that prevent workflows from triggering other workflows.

**Exception (README snapshots):**

The tests in `test/visual/pages/homepage-readme.visual.spec.ts` generate the screenshots embedded in `README.md`. Those comparisons are intentionally **non-blocking**: diffs are still produced in the Playwright report, but mismatches do not fail CI.

### Cleanup

Periodically review and remove:

- Outdated baseline screenshots for removed features
- Duplicate or redundant visual tests
- Visual tests with excessive tolerance that don't catch regressions

## Limitations

### Current Limitations

1. **No automatic baseline approval workflow**: Requires manual git commits
2. **Limited diff visualization**: HTML report only (no cloud dashboard)
3. **Git repository size**: Screenshots add to repo size (mitigated by .gitattributes LFS if needed)
4. **Cross-platform differences**: Font rendering may differ across OS (use consistent CI environment)

### Mitigations

1. **Consistent CI environment**: Always run visual tests in same Docker container
2. **Git LFS**: Consider for large screenshot collections (not needed yet)
3. **Regular cleanup**: Remove outdated baselines
4. **Documentation**: Clear process for reviewing and approving changes

## Future Considerations

### Potential Upgrades

If the project grows and requires more sophisticated visual regression testing:

1. **Percy**: If budget allows and web UI for diff review is needed
2. **Chromatic**: If Storybook is added in the future
3. **Argos**: Open-source alternative with GitHub integration
4. **Lost Pixel**: Docker-based OSS visual regression tool

For now, Playwright's built-in visual comparison provides excellent coverage with zero additional cost.

## Related Documentation

- [Playwright Visual Comparisons Docs](https://playwright.dev/docs/test-snapshots)
- [Testing Guide](./TESTING.md)
- [E2E Testing](../test/e2e/README.md)
- [Component Documentation](./components/README.md)

## Questions & Answers

**Q: Why not use Chromatic?**  
A: Chromatic requires Storybook. This project uses markdown-based component documentation instead.

**Q: Why not use Percy?**  
A: Percy requires a paid service. Playwright's built-in visual comparison is free and sufficient for this project's scale.

**Q: How do I handle false positives from font rendering differences?**  
A: Run visual tests in a consistent CI environment (Docker container with fixed fonts). Adjust `threshold` and `maxDiffPixels` as needed.

**Q: What if screenshots make the git repo too large?**  
A: Enable Git LFS for `*.png` files in `test/visual/**/*-snapshots/`. Not needed yet for this project's scale.

**Q: Can I test component variations without Storybook?**  
A: Yes! Navigate to pages that render component variations, or create dedicated test pages for component isolation.

---

**Last updated**: December 19, 2025  
**Status**: ✅ Phase 2 complete - Component visual tests implemented  
**Owner**: Vicente Opaso
