# Security Policy

## Supported Versions

This is a personal site, but security is still taken seriously.

## Reporting a Vulnerability

If you discover a security issue:

- Do not open a public issue with exploit details.
- Instead, contact the maintainer privately (e.g., via the email listed on the contact page).

## Practices

- Dependencies should be kept up to date.
- Secrets are never committed to the repository.
- Environment variables are managed via `.env` files and Vercel project settings.
- Security-critical patterns that must be avoided are documented in [Forbidden APIs and Patterns](./FORBIDDEN_PATTERNS.md).
