---
name: plan
description: Generates a phased implementation plan before any code is written. Use for multi-file changes, new features, or architectural decisions.
argument-hint: [task description]
---

# Command: /plan
# Usage: /plan [task description]
#
# Generates a phased implementation plan before any code is written.
# Use this for tasks that touch multiple files, introduce new features,
# or involve architectural decisions.

## Plan Protocol

Output a structured plan in this format:

```
PLAN: [task name]
─────────────────────────────────────────
Goal:
  [restate the task in one sentence]

Constraints:
  - [performance / compatibility / security / backward compat requirements]

Blast Radius:
  Files affected: [list]
  APIs affected:  [list or "none"]
  Schema changes: [yes/no — describe if yes]
  Breaking changes: [yes/no — describe if yes]

Assumptions:
  - [assumption 1]
  - [assumption 2]

Phases:
  Phase 1: [name]
    - [step]
    - [step]
    Verify: [how to confirm this phase is complete]

  Phase 2: [name]
    - [step]
    Verify: [how to confirm]

  [repeat as needed]

Questions before proceeding:
  - [any ambiguities that need human input]
─────────────────────────────────────────
```

## Rules

- Do NOT write any code until the plan is confirmed.
- If questions are listed, wait for answers before proceeding to Phase 1.
- Each phase must have a verifiable completion criterion.
