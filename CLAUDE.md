# CLAUDE.md
# Behavioral Contract — Anthropic Claude (Claude Code)

> This file is automatically read by Claude Code and claude.ai projects.
> It governs how Claude must reason, modify, and verify code in this repository.
> Spec Version: 2.0.0

---

## 0. Operating Philosophy

Large systems fail from silent assumptions, over-engineering, incomplete changes,
undetected side effects, lack of verification, and context drift across files.
Claude is especially prone to these. This spec enforces explicit reasoning,
minimal surface area change, test-first thinking, and deterministic verification.

---

## 1. Think Before You Touch Code

### 1.1 State Understanding First
Before implementing anything:
1. Restate the goal in your own words.
2. List constraints (performance, compatibility, security, backwards support).
3. Identify impacted modules and unknowns.

If ambiguous: present 2-3 interpretations and ask. Never silently pick one.

### 1.2 Identify Blast Radius
For any non-trivial change, explicitly consider:
- Which modules import this?
- Does this affect public APIs, serialized formats, or database schema?
- Does it change runtime behaviour?

---

## 2. Simplicity Is a Hard Requirement

Do NOT introduce: new abstractions unless necessary, future-proofing, new frameworks,
refactors of unrelated code, or new patterns without justification.

Prefer: small functions, explicit logic, clear control flow, localized changes.

If a senior engineer would say "why is this so complicated?" — simplify it.

---

## 3. Surgical Changes Only

- Change only what is required.
- Do not reformat unrelated code, rename variables for style, or reorganize imports.
- Match existing code style.
- If refactoring: explain why, separate from feature change, keep behaviour identical.

---

## 4. Goal-Driven Execution

All changes must have verifiable success criteria.
- Bug fix: write a failing test first, fix it, confirm pass.
- New feature: define invalid and valid cases, write tests, make them pass.
- If the project lacks tests: add minimal tests for your change.

---

## 5. Multi-Stack Awareness

See `stacks/` directory for language-specific rules. Always:
- Follow the stack's idioms.
- Respect its package manager and linting rules.
- Do not mix paradigms improperly.

---

## 6. Backward Compatibility

Before modifying any interface: is it public? externally consumed? versioned? persisted?
If yes: avoid breaking changes. Add deprecation warnings instead of hard breaks.

---

## 7. Performance Awareness

Do not introduce: O(n²) loops, blocking I/O in async contexts, memory leaks,
unbounded recursion, or uncontrolled concurrency.

---

## 8. Security Constraints

Never introduce: hardcoded secrets, logging of sensitive data, unsafe deserialization,
SQL injection, command injection, or path traversal vulnerabilities.

---

## 9. Large Refactor Protocol

Break into phases. Explain the plan. Modify incrementally. Verify after each phase.
Never rewrite entire modules unless explicitly asked.

---

## 10. Verification Checklist

Before finishing any change, confirm:
- [ ] Compiles / parses without errors
- [ ] Tests pass
- [ ] Imports and types are correct
- [ ] Edge cases and error paths are handled
- [ ] Logging is appropriate
- [ ] Behaviour is deterministic

---

## 11. Documentation Rules

Update docstrings, README, API docs, and examples when adding functionality.
Documentation must reflect actual behaviour.

---

## 12. Monorepo Discipline

Respect layering. No improper cross-layer imports. No circular dependencies.
Ask before modifying cross-cutting modules.

---

## 13. When to Ask

Ask instead of guessing when: business logic is ambiguous, tradeoffs are unclear,
architecture is underspecified, or multiple valid designs exist.

---

## 14. Anti-Patterns

Do NOT: create speculative utility functions, introduce unnecessary config,
replace working code with trendy patterns, add helpers without need,
modify unrelated files, or hide complexity behind premature abstractions.

---

## 15. Explicit Assumption Declaration

```
ASSUMPTIONS:
- ...
- ...
```

---

## 16. Output Discipline

Provide complete functions, not fragments. Match indentation. No placeholder comments.
No pseudo-code unless explicitly requested.

---

## 17. Self-Correction Loop

Before finalizing: re-read the request, re-read your solution, check for scope creep,
over-engineering, missed edge cases, and unnecessary changes. Simplify.

---

## 18. Tradeoffs

This spec biases: caution over speed, stability over novelty, explicitness over
cleverness, maintainability over brevity.

---

## 19. Short vs Deep Mode

- Trivial tasks: minimal reasoning, surgical change.
- Architectural tasks: full protocol, explain reasoning.

---

## 20. Final Sanity Statement (Required)

```
SUMMARY:
- What changed:
- Why:
- What was verified:
- Assumptions made:
- Risks remaining:
```

---

## Claude Code Specific

Skills are in `.claude/skills/` and are loaded automatically.
Custom commands are in `.claude/commands/`.
