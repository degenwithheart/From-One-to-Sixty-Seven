# Command Reference: /review

Complete documentation for the structured code review command.

---

## Overview

The `/review` command performs a systematic code review across six dimensions: correctness, security, performance, style, tests, and documentation. It flags issues without silently fixing them.

**File:** `.claude/commands/review.md`  
**Usage:** `/review` or `/review [file path]`  
**When to use:** Before committing, after significant changes, or when quality check is needed

---

## Command Syntax

```
/review                    # Review current file or selection
/review src/utils/auth.py  # Review specific file
/review --selection        # Review selected code only
```

---

## Review Protocol

When invoked, the assistant analyzes the specified file and outputs a structured review report.

### Output Format

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

---

## Review Dimensions Explained

### 1. Correctness

**What to check:**
- Logic errors (off-by-one, boundary conditions)
- Null/undefined handling
- Type safety violations
- Wrong assumptions about inputs
- Race conditions
- Error handling gaps

**Example findings:**
```
Correctness:
- Line 42: Potential null pointer dereference on `user.email`
- Line 58: Off-by-one error in loop boundary (should be < not <=)
- Line 73: Assumes list is non-empty without check
```

**Severity levels:**
- **Critical:** Crashes, data loss, security breach
- **High:** Logic errors affecting functionality
- **Medium:** Edge cases not handled
- **Low:** Style issues affecting correctness

### 2. Security

**What to check:**
- Injection vulnerabilities (SQL, command, XSS)
- Hardcoded secrets or credentials
- Unsafe deserialization
- Missing input validation
- Insecure file operations
- Weak cryptography
- Information leakage in errors

**Example findings:**
```
Security:
- Line 25: User input passed directly to shell command (command injection risk)
- Line 41: SQL query built with string concatenation (SQL injection)
- Line 67: Error message exposes internal path structure (information leakage)
```

**Mandatory security block:**
If security issues found, the review should include:
```
SECURITY REVIEW REQUIRED:
- Boundary affected: [auth/api/file system/etc]
- Attack vectors: [list]
- Mitigations needed: [list]
- Human review required: yes/no
```

### 3. Performance

**What to check:**
- Algorithmic complexity (O(n²) or worse)
- Blocking I/O in async contexts
- Memory leaks
- Unnecessary allocations
- N+1 queries
- Unbounded recursion
- Inefficient data structures

**Example findings:**
```
Performance:
- Line 34: O(n²) nested loop — consider hash map for O(n)
- Line 56: Database query in loop — use batch query or join
- Line 89: String concatenation in loop — use StringBuilder/list join
```

### 4. Style

**What to check:**
- Consistency with surrounding codebase
- Naming conventions
- Code organization
- Comment quality (not quantity)
- Function length and complexity
- Import ordering

**Example findings:**
```
Style:
- Line 23: Function name `getData` doesn't match codebase convention (should be `fetch_data`)
- Line 45: Mixed snake_case and camelCase in same scope
- Line 78: Function is 150 lines — consider breaking into smaller functions
- Line 91: Comment restates code ("increment counter") — remove or explain why
```

### 5. Tests

**What to check:**
- Coverage of happy path
- Edge cases (empty input, max values, nulls)
- Error paths
- Integration with existing code
- Test quality (deterministic, isolated)
- Missing test files for new code

**Example findings:**
```
Tests:
- Happy path: ✅ Covered in test_create_user_valid
- Edge cases: ⚠️ Missing — empty email, 1000-char email, unicode
- Error paths: ⚠️ Missing — duplicate email, invalid format
- Integration: ✅ Database cleanup handled
- Recommendation: Add parameterized tests for email validation edge cases
```

### 6. Documentation

**What to check:**
- Public API documentation
- README updates for new features
- Changelog entries
- Complex algorithm explanations
- TODO/FIXME comments (should be tracked, not forgotten)

**Example findings:**
```
Docs:
- Line 15: Public function `validate_email` lacks docstring
- README: No update for new validation feature
- Changelog: Entry needed for v2.1.0
- Line 88: Complex regex deserves explanation comment
```

---

## Rules for Reviewers

### Do
- Flag issues clearly with line numbers
- Distinguish must-fix from nice-to-have
- Suggest specific fixes when helpful
- Acknowledge good patterns explicitly
- Limit to top 3 priorities for actionability

### Don't
- Silently fix issues during review
- Reformat or refactor during review
- Report style issues as correctness issues
- Nitpick without value
- Review more than 500 lines at once (context window limits)

---

## Priority Classification

### Must Fix (Correctness, Security)
These must be fixed before merge:
- Logic errors
- Security vulnerabilities
- Crashes or exceptions
- Data corruption risks

### Should Fix (Performance, Tests)
These should be fixed unless there's reason not to:
- Performance degradation
- Missing edge case tests
- Poor error handling

### Could Fix (Style, Docs)
These are optional:
- Style inconsistencies
- Missing comments
- Naming improvements

---

## Example Review Sessions

### Example 1: Python Function Review

**Code under review:**
```python
def process_orders(orders):
    results = []
    for order in orders:
        if order.total > 100:
            results.append(calculate_discount(order))
    return results
```

**Review output:**
```
REVIEW: orders.py
─────────────────────────────────────────
Correctness: 
- Line 4: No handling for orders=None (will crash with TypeError)
- Line 5: Magic number 100 — should be constant or parameter

Security: 
- ✅ No issues found

Performance: 
- Line 3: O(n) loop is acceptable for expected order volume
- Consider: If orders is a QuerySet, this fetches all — use iterator()

Style: 
- Line 1: Function name is clear
- Line 4: Magic number should be named (e.g., DISCOUNT_THRESHOLD)

Tests: 
- ⚠️ Missing: orders=None, orders=[], orders with total=100 (boundary)
- ⚠️ Missing: verify calculate_discount is called for qualifying orders

Docs: 
- Line 1: Docstring missing — what does "process" mean? Returns?
─────────────────────────────────────────
Top 3 actions:
1. Add null check for orders parameter (correctness)
2. Extract magic number to constant (style/maintainability)
3. Add docstring and boundary tests (docs/tests)
```

### Example 2: API Endpoint Review

**Review output:**
```
REVIEW: api/users.py
─────────────────────────────────────────
Correctness: 
- Line 23: Returns 200 on validation error — should be 400
- Line 45: Race condition — check-then-create pattern not atomic

Security: 
- Line 12: No rate limiting on signup endpoint (DoS risk)
- Line 34: Password logged in error message (security breach)
- CRITICAL: Line 56: SQL injection via f-string query

Performance: 
- Line 67: N+1 query in user list endpoint

Style: 
- Line 12: Function too long (120 lines)

Tests: 
- No tests for duplicate email handling
- No tests for SQL injection prevention

Docs: 
- API endpoint not documented in README
─────────────────────────────────────────
Top 3 actions:
1. FIX IMMEDIATELY: Replace f-string SQL with parameterized query (security)
2. FIX IMMEDIATELY: Remove password from error logging (security)
3. Add rate limiting and fix race condition (security/correctness)
```

---

## Integration with Workflow

### Pre-Commit Review
```bash
# Before committing, run review on changed files
claude /review src/auth.py
claude /review tests/test_auth.py
```

### PR Review Assistant
Use `/review` to generate initial review comments, then human reviewer adds context.

### Continuous Review
Run `/review` on files before they become large/complex.

---

## Live Templates

### JetBrains (IntelliJ, PyCharm)

Import `plugins/jetbrains/live-templates.xml` for `spec-review` template:

```
REVIEW: $FILE$
Correctness:  $CORRECTNESS$
Security:     $SECURITY$
Performance:  $PERFORMANCE$
Style:        $STYLE$
Tests:        $TESTS$
Docs:         $DOCS$
Top 3 actions:
1. $ACTION1$
2. $ACTION2$
3. $ACTION3$
```

### VS Code Snippet

Add to `.vscode/snippets.json`:
```json
{
  "Spec Review": {
    "prefix": "spec-review",
    "body": [
      "REVIEW: ${1:filename}",
      "─────────────────────────────────────────",
      "Correctness:  ${2:none found}",
      "Security:     ${3:none found}",
      "Performance:  ${4:none found}",
      "Style:        ${5:none found}",
      "Tests:        ${6:adequate}",
      "Docs:         ${7:adequate}",
      "─────────────────────────────────────────",
      "Top 3 actions:",
      "1. ${8:first}",
      "2. ${9:second}",
      "3. ${10:third}"
    ]
  }
}
```

---

## Troubleshooting

### "Review is too verbose"

Add constraint: `/review src/file.py --concise`

Or add to CLAUDE.md:
```markdown
## Review Output
Limit reviews to top 3 issues per dimension. Don't list every minor style issue.
```

### "Missing critical issues"

The LLM may not have full context. Provide:
- Related files that use this code
- Test files to check coverage
- Security context (auth boundaries, input sources)

### "False positives"

Clarify in your request:
```
/review src/file.py
Note: This is internal utility code, not public API. Ignore documentation requirements.
```

---

## Related Commands

- `/plan` — Generate implementation plan before coding
- `/debug` — Structured debugging protocol
- `/test` — (if defined) Generate or improve tests

---

## See Also

- [Getting Started](../getting-started.md)
- [Debug Command](./debug.md)
- [Plan Command](./plan.md)
- [Troubleshooting](../troubleshooting.md)
