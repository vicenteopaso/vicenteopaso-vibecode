# Accessibility Guidelines

This project aims to be usable by as many people as possible.

## Principles

- Use semantic HTML elements (`header`, `main`, `nav`, `footer`, etc.).
- Ensure all interactive elements are keyboard accessible.
- Provide visible focus states.
- Maintain sufficient color contrast (WCAG AA minimum).

## Practices

- Use `eslint-plugin-jsx-a11y` to catch accessibility regressions.
- Test navigation with only the keyboard.
- Use descriptive alt text for images.

## Tooling

- Automated checks run in CI to flag obvious issues.
- A dedicated script (`scripts/audit-a11y.mjs`) is wired into the `accessibility.yml` GitHub Actions workflow as a basic but enforced audit. It scans for potential `<Image />` `alt` issues and exits with a non-zero status when it finds problems.
- Manual audits should be run on key user flows periodically; automated checks do not replace human testing.
