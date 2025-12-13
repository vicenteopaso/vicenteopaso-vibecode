# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for this project.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## When to Create an ADR

Create an ADR when:

- Making changes to the core architecture (e.g., switching frameworks, adding major dependencies)
- Introducing new patterns that affect multiple parts of the codebase
- Making decisions that have long-term implications for the project
- Implementing features that require architectural trade-offs

PRs labeled with `architecture-change` **must** link to an ADR.

## ADR Format

Use the template in `adr-template.md` to create new ADRs.

ADRs should be numbered sequentially:

- `0001-choose-nextjs-app-router.md`
- `0002-adopt-tailwind-v4.md`
- `0003-implement-ai-guardrails.md`

## ADR Lifecycle

1. **Proposed** - Initial draft under review
2. **Accepted** - Decision has been approved and implemented
3. **Deprecated** - Decision is no longer relevant
4. **Superseded** - Replaced by a newer ADR (reference the new ADR number)

## Resources

- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) by Michael Nygard
- [ADR GitHub Organization](https://adr.github.io/)
