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

- Homepage (`/`)
- About page (`/about`)
- CV page (`/cv`)
- Policy pages (`/privacy-policy`, `/cookie-policy`, `/accessibility`)

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
│   ├── home.visual.spec.ts
│   ├── about.visual.spec.ts
│   ├── cv.visual.spec.ts
│   └── policies.visual.spec.ts
├── components/
│   ├── navigation.visual.spec.ts
│   ├── profile-card.visual.spec.ts
│   ├── contact-dialog.visual.spec.ts
│   └── footer.visual.spec.ts
└── themes/
    └── theme-switching.visual.spec.ts
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

```typescript
import { test, expect } from "@playwright/test";

test.describe("Homepage Visual Regression", () => {
  test("renders homepage correctly in light mode", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Take full page screenshot
    await expect(page).toHaveScreenshot("homepage-light.png", {
      fullPage: true,
      animations: "disabled", // Disable animations for consistency
    });
  });

  test("renders homepage correctly in dark mode", async ({ page }) => {
    await page.goto("/");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("homepage-dark.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
```

### Component-Level Visual Tests

```typescript
test("profile card - about page variant", async ({ page }) => {
  await page.goto("/about");

  // Target specific component
  const profileCard = page.locator('[data-testid="profile-card"]');
  await expect(profileCard).toBeVisible();

  // Screenshot just the component
  await expect(profileCard).toHaveScreenshot("profile-card-about.png", {
    animations: "disabled",
  });
});
```

## Best Practices

### 1. Disable Animations

Always disable animations for consistent screenshots:

```typescript
await expect(page).toHaveScreenshot("example.png", {
  animations: "disabled",
});
```

### 2. Wait for Content

Ensure all content is loaded before screenshot:

```typescript
await page.waitForLoadState("networkidle");
// Or wait for specific elements
await page.locator('[data-testid="critical-element"]').waitFor();
```

### 3. Handle Dynamic Content

Mask or exclude dynamic content (timestamps, random data):

```typescript
await expect(page).toHaveScreenshot("example.png", {
  mask: [page.locator(".timestamp"), page.locator(".random-quote")],
});
```

### 4. Use Descriptive Names

Name screenshots descriptively:

```typescript
// Good
"homepage-hero-section-dark-theme.png";

// Bad
"screenshot1.png";
```

### 5. Test Multiple Viewports

Test responsive design across viewports:

```typescript
test("homepage mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage-mobile.png");
});
```

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
   pnpm test:visual -- --update-snapshots
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
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
});
```

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

### Phase 1: Core Pages (Current)

- ✅ Homepage
- ✅ About page
- ✅ CV page

### Phase 2: Components (Planned)

- [ ] Navigation menu (light/dark)
- [ ] Profile card variants
- [ ] Contact dialog
- [ ] Modal variations
- [ ] Impact cards
- [ ] References carousel

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

**Last updated**: November 29, 2025  
**Status**: ✅ Strategy approved, implementation in progress  
**Owner**: Vicente Opaso
