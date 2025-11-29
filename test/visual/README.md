# Visual Regression Tests

This directory contains Playwright-based visual regression tests for the portfolio site.

## Structure

```
test/visual/
├── pages/              # Full-page screenshots
│   ├── home.visual.spec.ts
│   ├── about.visual.spec.ts
│   ├── cv.visual.spec.ts
│   └── policies.visual.spec.ts
├── components/         # Component-level screenshots
│   ├── navigation.visual.spec.ts
│   ├── profile-card.visual.spec.ts
│   └── footer.visual.spec.ts
└── themes/            # Theme-specific tests
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

## Writing Visual Tests

### Full Page Screenshot

```typescript
test("page renders correctly", async ({ page }) => {
  await page.goto("/page-url");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("page-name.png", {
    fullPage: true,
    animations: "disabled",
  });
});
```

### Component Screenshot

```typescript
test("component renders correctly", async ({ page }) => {
  await page.goto("/page-with-component");

  const component = page.locator('[data-testid="component-name"]');
  await expect(component).toBeVisible();

  await expect(component).toHaveScreenshot("component-name.png", {
    animations: "disabled",
  });
});
```

### Multiple Themes

```typescript
test("component in light mode", async ({ page }) => {
  await page.goto("/page");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("component-light.png", {
    animations: "disabled",
  });
});

test("component in dark mode", async ({ page }) => {
  await page.goto("/page");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("component-dark.png", {
    animations: "disabled",
  });
});
```

## Best Practices

1. **Disable animations**: Always use `animations: 'disabled'`
2. **Wait for content**: Use `waitForLoadState('networkidle')`
3. **Descriptive names**: Name screenshots clearly (e.g., `homepage-hero-dark.png`)
4. **Test both themes**: Test light and dark mode for all pages
5. **Mask dynamic content**: Use `mask` option for timestamps or random data

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
