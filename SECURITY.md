# Security Policy

This policy covers vulnerabilities and security concerns for this personal website's repository.

## Automated Security Audits

This repository uses automated security audits to detect vulnerable dependencies:

- **Weekly scans**: Runs every Monday at 9 AM UTC via GitHub Actions
- **PR checks**: Automatically scans when `pnpm-lock.yaml` or `package.json` changes
- **Audit level**: Focuses on **high and critical** severity vulnerabilities
- **Issue tracking**: Automatically creates GitHub issues when vulnerabilities are detected in scheduled scans

To run security audits locally:

```bash
# Check for vulnerabilities (high and critical only)
pnpm audit:security

# Attempt to auto-fix vulnerabilities
pnpm audit:security:fix
```

**Note**: PRs with high or critical severity vulnerabilities will be blocked from merging until vulnerabilities are resolved or explicitly reviewed. Moderate and low severity vulnerabilities are reported but do not block merges.

## Reporting a Vulnerability

- Please report privately via email to: **vicente@opa.so** (preferred).
- Do **not** open public Issues or PRs for **new, undisclosed vulnerabilities**. GitHub Issues are available for general bugs and feature requests, but initial security reports should always go through private email.

When reporting, include (if possible):

- A clear description of the issue and its potential impact.
- Reproduction steps, affected URL(s), environment, and commit SHA.
- Any logs, screenshots, or proof-of-concept that can help triage.

## Disclosure & Response

- This is a personal project; there is **no formal SLA**. Best-effort acknowledgment and remediation will be made.
- Coordinated disclosure is appreciated. We may credit reporters on request after a fix is available.

## Scope & Notes

- In scope: vulnerabilities affecting this repository’s code and deployment.
- Out of scope: third-party platform issues (e.g., Vercel platform vulnerabilities) or unrelated services.
- Please do not include any sensitive information or secrets in your report.
