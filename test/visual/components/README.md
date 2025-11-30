# Component Visual Regression Tests

This directory contains visual regression tests for individual UI components. Tests are organized by component and test each component in multiple themes and viewports.

## Test Files

| File                                 | Component          | Tests                                    |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| `navigation.visual.spec.ts`          | NavigationMenu     | Light, dark, mobile, CV active state     |
| `profile-card.visual.spec.ts`        | ProfileCard        | Homepage variant, CV variant (no avatar) |
| `contact-dialog.visual.spec.ts`      | ContactDialog      | Light, dark, mobile                      |
| `impact-cards.visual.spec.ts`        | ImpactCards        | Light, dark, mobile, single card         |
| `references-carousel.visual.spec.ts` | ReferencesCarousel | Light, dark, mobile, navigation dots     |
| `footer.visual.spec.ts`              | Footer             | Light, dark, mobile, CV page             |

## Running Tests

```bash
# Run all component visual tests
pnpm playwright test test/visual/components

# Run a specific component test
pnpm playwright test test/visual/components/navigation.visual.spec.ts

# Update baselines after intentional changes
pnpm playwright test test/visual/components --update-snapshots
```

## Patterns

All component tests follow these patterns:

1. **Page-specific wait helpers**: Use `waitForHomepage()` or `waitForCVPage()` from `../utils.ts`
2. **Shared low-level utilities**: Use `waitForStableHeight()`, `freezeCarouselInteractions()` for custom scenarios
3. **Theme testing**: Each component is tested in light mode, dark mode, and mobile viewport
4. **Masking dynamic content**: Use masks for randomly selected content (e.g., portrait images)

## Snapshot Naming Convention

Snapshots follow the pattern: `{component}-{variant}-{theme/viewport}-linux.png`

Examples:

- `navigation-light-linux.png`
- `profile-card-homepage-dark-linux.png`
- `contact-dialog-mobile-linux.png`

## Adding New Component Tests

1. Create a new file: `{component-name}.visual.spec.ts`
2. Import utilities from `../utils.ts`
3. Test at least:
   - Light mode (default viewport)
   - Dark mode (default viewport)
   - Mobile viewport (375×667px)
4. Run with `--update-snapshots` to generate baselines
5. Review baselines visually before committing
