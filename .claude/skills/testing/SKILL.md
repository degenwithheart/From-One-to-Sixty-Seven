---
name: testing
description: Test-first engineering rules. Activated when writing tests, fixing bugs, or implementing features that require verification.
---

# Test-First Engineering Rules

## Core Principle: Verify Before Declaring Done

Every change must have verifiable success criteria.

## Bug Fix Protocol

1. **Reproduce First**: Write a failing test that demonstrates the bug
2. **Fix Minimally**: Make the smallest change that makes the test pass
3. **Verify**: Confirm the test passes and no existing tests break
4. **Edge Cases**: Check adjacent logic for similar issues

## New Feature Protocol

1. **Define Contract**: Specify valid and invalid inputs/outputs
2. **Write Tests**: Create tests for happy path, edge cases, and error paths
3. **Implement**: Write code to make tests pass
4. **Refactor**: Clean up while keeping tests green

## Test Coverage Requirements

- Happy path: the obvious case works
- Edge cases: boundaries, empties, max values
- Error paths: exceptions, failures, bad inputs
- Integration: does it work with the rest of the system?

## When Project Lacks Tests

If adding to an untested codebase:
- Add minimal tests for YOUR change
- Do not try to backfill the entire codebase
- Note test gaps in your SUMMARY

## Test Quality Rules

- Tests must be deterministic (same input = same output)
- No tests that depend on external state
- No tests that sleep/wait for timing
- Mock at appropriate boundaries — not everything

## Verification Checklist

- [ ] Failing test exists before fix (for bugs)
- [ ] Tests written before implementation (for features)
- [ ] All new tests pass
- [ ] Existing tests still pass
- [ ] Edge cases covered
- [ ] Error paths tested

## Testing Final Statement

Include in your SUMMARY:
```
TESTING:
- Tests added: [count] new tests
- Coverage: [what scenarios are covered]
- Test framework: [e.g., pytest, jest, go test]
- All tests pass: yes/no
```
