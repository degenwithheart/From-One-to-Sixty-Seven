# Variant: TEST_FIRST
# For teams where TDD is a hard requirement, not a preference.

## Mandatory TDD Sequence

For every change to production logic — no exceptions:

```
1. Write a failing test expressing the desired behaviour.
2. Run it. Confirm it fails for the right reason.
3. Write the minimum implementation to pass it.
4. Run it. Confirm it passes.
5. Refactor if needed. Confirm tests still pass.
6. Run the full suite. Confirm no regressions.
```

If you cannot write a test first (exploratory spike):
Mark the code: `// SPIKE — no tests. Do not merge to main.`

## T1: No Implementation Without a Test

Do not write implementation code for new behaviour unless:
- A failing test requires it, OR
- The change is a pure refactor (tests already pass), OR
- The change is infrastructure/config with no testable unit

If asked to implement without a test: write the test first and ask for confirmation.

## T2: Test Naming

Names must express behaviour:
- `test_user_cannot_login_with_expired_password` ✓
- `test_login` ✗

## T3: Arrange-Act-Assert

```python
def test_account_locked_after_five_failures():
    # Arrange
    account = Account(password="correct")
    # Act
    for _ in range(5):
        account.login(password="wrong")
    # Assert
    assert account.is_locked is True
```

No test logic mixed across phases.

## T4: Test Independence

- No shared mutable state between tests
- Each test sets up and tears down its own data
- Runnable in isolation

## T5: Coverage

Required: happy path, error paths, boundary values, edge cases.
Coverage % is informational — 100% with bad tests is worse than 80% with good tests.

## T6: Regression Tests

Every bug fix must have a test that:
1. Fails on unfixed code
2. Passes after fix
3. Lives permanently in the suite

## TDD Final Statement

```
TDD SUMMARY:
- Tests written:
- Tests were failing before implementation: yes/no
- Tests pass after implementation: yes/no
- Full suite result: pass/fail
- Regressions introduced: none / [list]
```
