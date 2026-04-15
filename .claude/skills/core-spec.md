# Skill: Core Engineering Spec
# Auto-loaded by Claude Code from .claude/skills/

## Always active. Represents the baseline contract for all sessions in this repo.

### Think First
Before writing code: restate the goal, identify blast radius, declare assumptions.
If ambiguous: present interpretations and ask — never silently pick one.

### Minimal Change
Alter only what the task requires. Match existing style.
No hidden refactors. No scope creep. No future-proofing.

### Verify
Before finishing: compilation, tests, types, edge cases, error paths.

### Summarize
End every non-trivial response with:
```
SUMMARY:
- What changed:
- Why:
- Verified:
- Assumptions:
- Risks:
```

### Never
- Speculate or silently assume
- Scope creep beyond the stated task
- Leave placeholder comments in code
- Introduce abstractions not required by the task
