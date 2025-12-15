# Engineering Constitution

## Supremacy

In case of conflict, the following precedence applies:

1. `docs/CONSTITUTION.md`
2. `sdd.yaml`
3. ADRs (`docs/adr/`)
4. Other documentation
5. Code

Any artifact that violates this Constitution is invalid by definition.

## Immutable Invariants

The Constitution contains only stable invariants expressed as MUST / MUST NOT / NEVER statements. Each invariant is uniquely identified for machine and human reference.

CONSTITUTION-01: All changes (human or AI) MUST comply with this Constitution.
CONSTITUTION-02: The System Design & Development Spec (`sdd.yaml`) MUST remain machine-readable and MUST be kept consistent with the implementation.
CONSTITUTION-03: Architectural boundaries MUST be enforced. Cross-layer imports MUST NOT be introduced.
CONSTITUTION-04: UI code MUST NOT perform infrastructure concerns (e.g., filesystem access, environment secret access).
CONSTITUTION-05: Domain/content logic MUST be framework-agnostic where practical (pure helpers in `lib/` with tests).
CONSTITUTION-06: New architectural layers MUST NOT be introduced without an explicit ADR and corresponding SDD updates.
CONSTITUTION-07: Security controls MUST NOT be weakened.
CONSTITUTION-08: Secrets and credentials MUST NEVER be committed to the repository.
CONSTITUTION-09: Accessibility MUST NOT regress (WCAG 2.1 AA minimum).
CONSTITUTION-10: SEO-critical behavior MUST NOT regress (metadata, canonical URLs, structured data, performance budgets).
CONSTITUTION-11: All user-facing routes and user-visible text MUST be locale-aware.

# Normalized Rule Identifiers for Future Invariants

## Example (add new invariants below as needed)

CONSTITUTION-12: [Reserved for future invariant]
CONSTITUTION-13: [Reserved for future invariant]
