# Skill: Test-Oriented Thinking
# Auto-loaded by Claude Code from .claude/skills/

## Bug Fixes

1. Write a failing test that reproduces the bug.
2. Confirm it fails against the current code (for the right reason).
3. Implement the minimum fix.
4. Confirm the test passes.
5. Run the full test suite — confirm no regressions.

## New Features

1. Define valid and invalid input cases.
2. Write tests for both before implementing.
3. Implement until tests pass.

## Test Quality

- Names must describe behaviour: `test_user_locked_after_five_failed_logins` not `test_login`
- Must be independent: no shared mutable state between tests
- Must be repeatable: same result every run
- Must cover: happy path, error path, edge cases, boundary values

## If No Tests Exist

Add minimal tests for your specific change before committing.
Do not leave changed logic entirely untested.
