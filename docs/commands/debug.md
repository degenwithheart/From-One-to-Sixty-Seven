# Command Reference: /debug

Complete documentation for the structured debugging protocol.

---

## Overview

The `/debug` command provides a systematic debugging methodology that prevents "guess and patch" debugging. It forces root cause identification before any fix is applied.

**File:** `.claude/commands/debug.md`  
**Usage:** `/debug [description of the issue]`  
**When to use:** When investigating bugs, unexpected behavior, or system failures  
**Core principle:** Do not guess and patch — identify root cause first

---

## Command Syntax

```
/debug                                    # Debug current context
/debug "user login fails with 500 error" # Debug specific issue
/debug --selection                        # Debug selected code
/debug --verbose                          # Include full investigation steps
```

---

## Debug Protocol

The `/debug` command follows a 6-step protocol:

1. Understand the symptom
2. Hypothesize
3. Investigate
4. Reproduce
5. Fix
6. Verify

Each step has specific requirements and output formats.

---

## Step 1: Understand the Symptom

### What to Document

```
SYMPTOM ANALYSIS:
- Observed behavior: [what actually happens]
- Expected behavior: [what should happen]
- First occurrence: [when did it start?]
- Trigger: [what action causes it?]
- Scope: [who/what is affected?]
- Frequency: [always, intermittent, specific conditions?]
```

### Example

```
SYMPTOM ANALYSIS:
- Observed behavior: User login returns HTTP 500, generic error page
- Expected behavior: Successful login redirects to dashboard
- First occurrence: Started 2024-01-15 after deployment v2.3.0
- Trigger: Attempting login with valid credentials
- Scope: All users, all browsers, production only (staging works)
- Frequency: 100% of login attempts fail
```

### Key Questions

- What exactly is happening vs. what should happen?
- When did it start? What changed?
- Is it consistent or intermittent?
- Is it environment-specific?
- Who is affected (all users, specific roles, specific data)?

---

## Step 2: Hypothesize

### What to Document

```
HYPOTHESES (ranked by likelihood):
1. [Most likely cause] — Probability: High/Medium/Low
   Evidence for: [what suggests this]
   Evidence against: [what contradicts this]
   
2. [Second likely cause] — Probability: High/Medium/Low
   Evidence for: [what suggests this]
   Evidence against: [what contradicts this]
   
3. [Third possibility] — Probability: High/Medium/Low
   Evidence for: [what suggests this]
   Evidence against: [what contradicts this]
```

### Example

```
HYPOTHESES:
1. Database connection pool exhausted — Probability: High
   Evidence for: Production has 10x traffic, connection timeout in logs
   Evidence against: Error is 500 not 503, no connection error in trace
   
2. Recent migration broke user table schema — Probability: Medium
   Evidence for: Deployment v2.3.0 included migration, staging might not have run it
   Evidence against: Other user operations work fine
   
3. Environment variable missing (JWT secret) — Probability: Low
   Evidence for: 500 suggests internal error, auth-related
   Evidence against: Would expect "secret not found" in logs
```

### Rules

- Generate 2-3 hypotheses minimum
- Do not jump to the first plausible explanation
- Consider both technical and environmental causes
- Rank by probability based on evidence

---

## Step 3: Investigate

### What to Document

```
INVESTIGATION:

Log Analysis:
- Checked: [which log files, time range]
- Found: [relevant log entries]
- Not found: [expected entries that are missing]

Code Analysis:
- Read: [which files/functions]
- Key findings: [what the code does]
- Suspect areas: [lines/functions to focus on]

Data Analysis:
- Checked: [database, cache, files]
- State: [normal or anomalous]
- Anomalies: [unexpected data/state]

Environment Check:
- Variables: [key env vars checked]
- Services: [external services status]
- Recent changes: [deploys, config changes]
```

### Example

```
INVESTIGATION:

Log Analysis:
- Checked: /var/log/app/error.log (last 24h), production.log
- Found: "KeyError: 'email' at /app/auth/login.py:42" (repeated 500+ times)
- Not found: No database connection errors, no recent schema change warnings

Code Analysis:
- Read: src/auth/login.py, src/models/user.py
- Key findings: Login expects user.email, but recent migration changed schema
- Suspect areas: Line 42 in login.py accesses user['email'] from dict

Data Analysis:
- Checked: users table schema in production vs staging
- State: PRODUCTION has 'email_address' column, STAGING has 'email' column
- Anomalies: Migration partially applied — code expects 'email', DB has 'email_address'

Environment Check:
- Variables: DATABASE_URL correct, no recent changes
- Services: Database healthy, no outages
- Recent changes: Migration 2024-01-14-add-user-fields.sql applied yesterday
```

### Investigation Techniques

**Log Analysis:**
```bash
# Search for errors
grep -i "error\|exception\|failed" /var/log/app/*.log | tail -100

# Find when issue started
grep "login" /var/log/app/access.log | grep "500" | head -5

# Correlate with deployments
grep "2024-01-15" /var/log/app/*.log | grep -i "deploy\|restart"
```

**Code Analysis:**
- Trace the execution path from entry point to error
- Check recent commits touching related code
- Review error handling paths

**Data/State Analysis:**
- Compare dev/staging/production state
- Check for partial migrations
- Verify configuration consistency

---

## Step 4: Reproduce

### What to Document

```
REPRODUCTION:

Test Case:
```python
# Minimal reproduction
def test_login_failure():
    # Setup
    user = create_user(email="test@example.com", password="password123")
    
    # Action
    response = login(email="test@example.com", password="password123")
    
    # Expected
    assert response.status_code == 302  # Redirect to dashboard
    
    # Actual
    assert response.status_code == 500  # Internal server error
```

Steps to Reproduce:
1. [step 1]
2. [step 2]
3. [step 3]

Confirmed: Yes/No — Failure is reproducible in [environment]
```

### Example

```
REPRODUCTION:

Test Case:
```python
def test_login_with_mismatched_schema():
    # Database has 'email_address' column
    # Code expects 'email' key
    user = User(email_address="test@example.com")  # DB insert
    user_dict = user.to_dict()  # Code converts to dict
    
    # This line fails: user_dict['email'] when key is 'email_address'
    assert 'email' in user_dict  # FAILS
```

Steps to Reproduce:
1. Ensure database has 'email_address' column (run migration 2024-01-14)
2. Attempt login with valid credentials
3. Observe 500 error with KeyError: 'email'

Confirmed: Yes — Reproduced in staging environment with production DB schema
```

### Reproduction Rules

- Create minimal test case that isolates the issue
- Reproduce in environment matching production (or production itself if safe)
- Document exact steps for anyone to follow
- Confirm reproduction before proceeding to fix

---

## Step 5: Fix

### What to Document

```
FIX APPLIED:

Root Cause: [single sentence explanation]

Changes Made:
- File: [path]
  Line: [line number]
  Before: [code before]
  After: [code after]
  Rationale: [why this fixes it]

Alternative Approaches Considered:
1. [alternative 1] — rejected because [reason]
2. [alternative 2] — rejected because [reason]

Rollback Plan: [how to undo if needed]
```

### Example

```
FIX APPLIED:

Root Cause: Migration renamed column 'email' to 'email_address' but 
            login.py code was not updated to use new column name.

Changes Made:
- File: src/models/user.py
  Line: 45
  Before: 
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,  # <-- This attribute doesn't exist
            ...
        }
  After:
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email_address,  # <-- Use correct column name
            ...
        }
  Rationale: Model property must match database schema after migration

Alternative Approaches Considered:
1. Revert migration — rejected because other features depend on new schema
2. Add backward-compatible property 'email' aliasing to 'email_address' — 
   rejected because it adds technical debt; better to fix usage points
3. Update all call sites to use 'email_address' — chosen; more explicit

Rollback Plan: 
- Revert commit [hash]
- Or: Add temporary 'email' property for backward compatibility
```

### Fix Rules

- Apply minimum change that resolves root cause
- Do not fix symptoms — fix causes
- Consider backward compatibility
- Document rollback plan
- Consider impact on related code

---

## Step 6: Verify

### What to Document

```
VERIFICATION:

Reproduction Test:
- Status: [PASS/FAIL]
- Output: [test output or confirmation]

Regression Tests:
- Test suite: [which tests ran]
- Status: [PASS/FAIL/X% pass]
- New failures: [any]

Edge Cases Tested:
- [case 1]: [result]
- [case 2]: [result]

Production Verification:
- Deployed: [when]
- Monitoring: [metrics/logs checked]
- Status: [resolved/ongoing]
```

### Example

```
VERIFICATION:

Reproduction Test:
- Status: PASS
- Output: test_login_with_valid_credentials ... ok

Regression Tests:
- Test suite: pytest tests/auth/
- Status: PASS (47/47 tests)
- New failures: None

Edge Cases Tested:
- Login with new user: PASS
- Login with existing user (pre-migration): PASS
- Password reset flow (uses same model): PASS
- User registration: PASS

Production Verification:
- Deployed: 2024-01-16 10:30 UTC
- Monitoring: Login success rate metrics
- Status: 500 errors dropped to zero, login success rate 99.8%
```

### Verification Checklist

- [ ] Original reproduction case now passes
- [ ] All existing tests still pass
- [ ] No new test failures introduced
- [ ] Edge cases verified
- [ ] Production monitoring confirms resolution
- [ ] Rollback plan tested (if possible)

---

## Complete Debug Report Output

When `/debug` completes, it produces:

```
DEBUG REPORT:
═══════════════════════════════════════════════

SYMPTOM:
- Observed: User login fails with HTTP 500
- Expected: Successful login and redirect
- Started: 2024-01-15 after v2.3.0 deployment
- Frequency: 100% of attempts

ROOT CAUSE IDENTIFIED:
Migration partially applied — database column renamed from 'email' to 
'email_address' but model code still referenced old attribute name.

HYPOTHESES RULED OUT:
1. Database connection pool — no timeout errors found
2. Missing environment variables — JWT secret present and valid

REPRODUCTION:
- Test case: test_login_with_mismatched_schema
- Status: Confirmed in staging environment
- Steps: [documented above]

FIX APPLIED:
- File: src/models/user.py:45
- Change: Use self.email_address instead of self.email
- Type: Schema alignment fix

VERIFIED:
- Reproduction test: PASS
- Regression tests: 47/47 PASS
- Production: 500 errors resolved

REGRESSIONS:
- None identified

═══════════════════════════════════════════════
```

---

## Anti-Patterns to Avoid

### Guess and Patch
```python
# BAD: Applying fix without understanding cause
# "Maybe it's a cache issue?" -> Clear cache
# "Maybe restart will help?" -> Restart service
# "Maybe add a try-except?" -> Wrap in broad exception handler
```

### Fix the Symptom
```python
# BAD: Handling the error without fixing the cause
try:
    email = user['email']
except KeyError:
    email = None  # Hides the schema mismatch instead of fixing it
```

### Multiple Simultaneous Changes
```python
# BAD: Changing multiple things at once
# "I updated the model AND the controller AND added caching AND..."
# Can't tell which change fixed it
```

---

## Integration with Workflow

### During Active Development
```bash
# When bug reported
claude /debug "login fails with 500"

# Follow the protocol through to verification
```

### Post-Incident Review
Use completed debug reports as documentation for:
- Post-mortems
- Knowledge base articles
- Runbook updates
- Test case additions

### On-Call Handoff
```markdown
Debug in progress: /debug [incident-id]
Current step: Investigation
Findings so far: [link to partial debug report]
Next action: [what needs to happen]
```

---

## Live Templates

### JetBrains
Template: `spec-debug`
```
DEBUG: ${TITLE}
═══════════════════════════════════════════════
SYMPTOM:
- Observed: ${OBSERVED}
- Expected: ${EXPECTED}
- Started: ${WHEN}
- Frequency: ${FREQUENCY}

ROOT CAUSE: ${ROOT_CAUSE}

HYPOTHESES RULED OUT:
${RULED_OUT}

REPRODUCTION:
${REPRODUCTION}

FIX APPLIED:
${FIX}

VERIFIED: ${YES_NO}
REGRESSIONS: ${NONE_LIST}
═══════════════════════════════════════════════
```

---

## See Also

- [Getting Started](../getting-started.md)
- [Review Command](./review.md)
- [Plan Command](./plan.md)
- [Troubleshooting](../troubleshooting.md)
