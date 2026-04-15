---
name: review
description: Performs a structured code review across six dimensions. Use when asked to review code or when quality check is needed.
argument-hint: [file path]
---

# Command: /review
# Usage: /review OR /review [file path]
#
# Performs a structured code review across six dimensions.

## Review Protocol

When invoked, analyze the specified file or current selection and output:

```
REVIEW: [filename]
─────────────────────────────────────────
Correctness:  [logic errors, off-by-ones, unhandled nulls, wrong assumptions]
Security:     [injection risks, secrets, unsafe ops, missing validation]
Performance:  [O(n²) loops, blocking I/O, memory leaks, unnecessary allocations]
Style:        [matches surrounding codebase? naming? patterns?]
Tests:        [what is covered? what edge cases are missing?]
Docs:         [public APIs documented? README updated if needed?]
─────────────────────────────────────────
Top 3 actions:
1. [highest priority fix]
2. [second priority]
3. [third priority]
```

## Rules

- Flag issues, do not silently fix them unless asked.
- Do not reformat or refactor during a review — report only.
- Distinguish between must-fix (correctness, security) and nice-to-have (style, docs).
