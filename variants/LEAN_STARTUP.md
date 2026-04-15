# Variant: LEAN_STARTUP
# For early-stage products where speed of learning > cost of rework.
# Base rules still apply — this file relaxes specific ones.

## Philosophy

The base spec biases toward caution. This variant biases toward speed and learning.
Appropriate when: pre-production, small team, throwaway spikes, or MVP discovery.

This does NOT mean skip verification. It means right-size it.

## Relaxed Rules

> **Note:** Rule numbers below reference the [CLAUDE.md](../CLAUDE.md) rule structure.

### Simplicity (Rule 2) — Relaxed
Light scaffolding acceptable if it unblocks parallel work and takes <30 min to remove.
Mark clearly: `// Scaffolding — remove when X is decided`

### Surgical Changes (Rule 3) — Relaxed
Minor readability improvements acceptable in the same file if they take <5 min.

### Large Refactor Protocol (Rule 9) — Relaxed
Can deliver in a single phase if scope is understood and `git revert` is a sufficient rollback.

### Verification Checklist (Rule 10) — Shortened
Minimum bar:
- [ ] Runs without crashing
- [ ] Happy path works
- [ ] Obvious error cases handled

Full checklist still required for: auth, payments, data mutations, production deployments.

## Rules That Do NOT Change

> **Note:** Rule numbers below reference the [CLAUDE.md](../CLAUDE.md) rule structure.

Regardless of iteration speed:
- **Security (CLAUDE.md Rule 8)**: No hardcoded secrets. No injection risks. Ever.
- **Assumptions (CLAUDE.md Rule 15)**: State them. Fast loops still break on hidden assumptions.
- **Ask for Guidance (CLAUDE.md Rule 13)**: Shipping the wrong thing is the slowest outcome.

## Lean Final Statement

```
LEAN SUMMARY:
- What changed:
- Happy path works: yes/no
- Shortcuts taken:
- Follow-up needed:
```
