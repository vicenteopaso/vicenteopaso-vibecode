# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2026-02-02

### Added

- **Documentation**: Enhanced technical governance documentation with comprehensive guides for AI development, architecture decisions, and engineering standards
- **Constitution**: Added `docs/CONSTITUTION.md` as the supreme authority for all engineering decisions and patterns
- **SDD Schema**: Introduced structured system design documentation with `sdd.yaml` and `sdd.schema.json`

### Changed

- **Version**: Bumped package version from 1.0.1 to 1.2.2 to reflect accumulated governance and documentation improvements
- **Node Version**: Updated Node.js requirement to v24 LTS in `.nvmrc` and `package.json` engines
- **Dependencies**: Updated multiple dependencies including Next.js, React 19, Tailwind CSS v4, and other packages

### Documentation

- Added comprehensive AI governance documentation including AI_GUARDRAILS.md, FORBIDDEN_PATTERNS.md, and REVIEW_CHECKLIST.md
- Enhanced ARCHITECTURE.md with detailed system flows and boundaries
- Added ENGINEERING_STANDARDS.md for code quality and development practices
- Improved DEPLOYMENT.md with Vercel deployment guidelines
- Added ERROR_HANDLING.md for centralized error handling patterns
- Updated README.md with improved governance documentation structure

## [1.0.1] - 2025-12-12

### Changed

- **Dependencies**: Updated Next.js from 16.0.8 to 16.0.10 ([#211](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/211), [#213](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/213))
- **Node Version**: Updated Node.js requirement to v23.5.0 in `.nvmrc`
- **Internationalization**: Made Open Graph images locale-aware with translated badge, subtitle, and footer text for English and Spanish ([#205](https://github.com/vicenteopaso/vicenteopaso-vibecode/pull/205))

### Fixed

- Improved test reliability by refactoring page component tests and fixing markdown formatting

### Removed

- Deleted deprecated unit tests for accessibility, home, tech-stack, and technical governance pages to reduce maintenance overhead
- Removed ERROR_HANDLING_SUMMARY.md as error handling is now documented in the main documentation

### Documentation

- Updated CONTRIBUTING.md and README.md with improved clarity
- Enhanced SEO metadata handling documentation
- Added comprehensive CHANGELOG following Keep a Changelog format

## [1.0.0] - 2025-12-02

Initial public release. See [v1.0.0 release notes](https://github.com/vicenteopaso/vicenteopaso-vibecode/releases/tag/v1.0.0) for full changelog.

[1.2.2]: https://github.com/vicenteopaso/vicenteopaso-vibecode/compare/v1.0.1...v1.2.2
[1.0.1]: https://github.com/vicenteopaso/vicenteopaso-vibecode/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/vicenteopaso/vicenteopaso-vibecode/releases/tag/v1.0.0
