# Command Reference: /plan

Complete documentation for the phased implementation planning command.

---

## Overview

The `/plan` command generates a structured implementation plan before any code is written. It forces explicit consideration of goals, constraints, blast radius, and verification criteria.

**File:** `.claude/commands/plan.md`  
**Usage:** `/plan [task description]`  
**When to use:** Multi-file changes, new features, architectural decisions, complex refactors  
**Core principle:** Do not write code until the plan is confirmed

---

## Command Syntax

```
/plan "implement user authentication"           # Plan single feature
/plan "refactor payment module" --phases=3      # Specify phase count
/plan "add API rate limiting" --constraint="no new dependencies"
/plan --verbose                                 # Include detailed rationale
```

---

## Plan Protocol

The `/plan` command produces a structured plan with:

1. Goal restatement
2. Constraints identification
3. Blast radius analysis
4. Assumptions declaration
5. Phased implementation
6. Verification criteria per phase
7. Open questions

---

## Output Format

```
PLAN: [task name]
═══════════════════════════════════════════════════════

Goal:
  [Single-sentence restatement of what we're building]

Constraints:
  - [constraint 1]
  - [constraint 2]
  - [constraint 3]

Blast Radius:
  Files affected: [list or count]
  APIs affected: [list or "none"]
  Schema changes: [yes/no — describe if yes]
  Breaking changes: [yes/no — describe if yes]
  Dependencies: [new/updated/removed]

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
    - [step]
    Verify: [how to confirm]

  [repeat as needed]

Questions before proceeding:
  - [any ambiguities that need human input]

Estimated effort: [rough sizing]
═══════════════════════════════════════════════════════
```

---

## Plan Components Explained

### Goal

**Requirements:**
- Single sentence, specific and measurable
- Not how to do it, but what outcome is needed
- Verifiable success criteria implied

**Examples:**
```
✅ GOOD:
"Enable users to reset passwords via email with 24-hour expiry tokens"

❌ BAD:
"Add password reset functionality" (too vague)
"Implement secure token-based authentication with email integration" (describes how, not what)
```

---

### Constraints

**Categories to consider:**

```
Performance:
- Must complete in < 200ms
- Must handle 1000 concurrent users
- No blocking I/O in request path

Compatibility:
- Must work with existing auth system
- Must support both JWT and session auth
- Must not break mobile app API contract

Security:
- Tokens must expire in 24 hours
- All email must use existing SMTP service
- No plaintext storage

Operational:
- Must be deployable without downtime
- Must include rollback procedure
- Must work with existing monitoring

Resource:
- No new paid services
- Must use existing database
- Max 3 new dependencies
```

**Example:**
```
Constraints:
  - Must integrate with existing User model (no schema changes)
  - Must use SendGrid for email (existing SMTP provider)
  - Must handle 1000 password resets/hour at peak
  - Must include rate limiting (prevent abuse)
  - Must work with both web and mobile clients
```

---

### Blast Radius

**What to analyze:**

```
Files affected:
  - src/auth/password.py (new)
  - src/auth/routes.py (modify)
  - src/models/user.py (modify — add token field)
  - src/email/sender.py (modify — add template)
  - tests/auth/test_password.py (new)
  - tests/auth/test_routes.py (modify)

APIs affected:
  - POST /api/auth/forgot-password (new)
  - POST /api/auth/reset-password (new)
  - No breaking changes to existing endpoints

Schema changes:
  Yes — users table:
    - Add password_reset_token (string, nullable)
    - Add password_reset_expires (datetime, nullable)

Breaking changes:
  No — purely additive

Dependencies:
  - Add: cryptography (for secure token generation)
  - Update: None
  - Remove: None
```

**Analysis checklist:**
- [ ] Which modules import the changed code?
- [ ] Are there public APIs affected?
- [ ] Is there a database schema impact?
- [ ] Are serialized formats changing?
- [ ] Are there client-side impacts?
- [ ] What's the deployment order?

---

### Assumptions

**Required format:**
```
Assumptions:
  - Users have valid email addresses in database
  - Email delivery succeeds 99%+ of the time
  - Existing auth middleware can be reused
  - Token reset is acceptable UX (vs passwordless login)
```

**When to add assumptions:**
- Any interpretation of ambiguous requirements
- Dependencies on external systems
- UX/design decisions not explicitly specified
- Performance characteristics assumed
- Security model assumptions

---

### Phases

**Phase structure:**

```
Phase N: [Descriptive Name]
  Prerequisites: [what must be done before]
  
  Steps:
    1. [Specific, verifiable action]
    2. [Specific, verifiable action]
    3. [Specific, verifiable action]
  
  Verification:
    - [ ] Criterion 1 (measurable)
    - [ ] Criterion 2 (measurable)
    - [ ] Criterion 3 (measurable)
  
  Rollback: [how to undo if needed]
```

**Phase principles:**
- Each phase must be independently verifiable
- Prefer smaller phases over monolithic implementation
- Include rollback plan for each phase
- No phase should take more than 1-2 days

**Example phases for password reset:**

```
Phase 1: Database Schema
  Steps:
    1. Create migration adding password_reset_token and password_reset_expires
    2. Run migration in staging
    3. Verify columns exist with correct types
  
  Verification:
    - [ ] Migration runs without errors
    - [ ] Columns visible in schema
    - [ ] Existing data unaffected
    - [ ] Rollback migration tested

Phase 2: Token Generation Service
  Steps:
    1. Create PasswordResetService class
    2. Implement generate_token(user) method
    3. Implement validate_token(token) method
    4. Write unit tests for service
  
  Verification:
    - [ ] Tests pass (token generation, validation, expiry)
    - [ ] Tokens are cryptographically secure
    - [ ] Expiry logic works correctly
    - [ ] Service has no external dependencies

Phase 3: Email Integration
  Steps:
    1. Create password reset email template
    2. Implement send_reset_email(user, token) function
    3. Integrate with existing email sender
    4. Test email delivery
  
  Verification:
    - [ ] Email renders correctly
    - [ ] Token link is valid
    - [ ] SendGrid API called correctly
    - [ ] Email queue handles failures

Phase 4: API Endpoints
  Steps:
    1. Implement POST /api/auth/forgot-password
    2. Implement POST /api/auth/reset-password
    3. Add rate limiting middleware
    4. Write integration tests
  
  Verification:
    - [ ] Endpoints return correct status codes
    - [ ] Rate limiting works (test with 10+ requests)
    - [ ] Error messages don't leak info
    - [ ] Integration tests pass

Phase 5: Integration & E2E
  Steps:
    1. Wire frontend to new endpoints
    2. Add "Forgot password?" link to login page
    3. Create password reset form page
    4. E2E test full flow
  
  Verification:
    - [ ] End-to-end flow works in staging
    - [ ] Mobile app can use endpoints
    - [ ] Analytics events fire correctly
    - [ ] No console errors
```

---

## Complete Example Plan

```
PLAN: Implement Password Reset via Email
═══════════════════════════════════════════════════════

Goal:
  Enable users to reset forgotten passwords via secure email 
  link with 24-hour expiry.

Constraints:
  - Must integrate with existing User model (no breaking schema changes)
  - Must use existing SendGrid SMTP service
  - Must handle 1000 resets/hour at peak load
  - Must include rate limiting (max 3 attempts per email/hour)
  - Must work with both web UI and mobile API
  - Must not introduce new paid dependencies

Blast Radius:
  Files affected:
    - src/auth/password_reset.py (new)
    - src/auth/routes.py (modify — add 2 endpoints)
    - src/models/user.py (modify — add 2 fields)
    - src/email/templates/password_reset.html (new)
    - src/email/sender.py (modify — add function)
    - src/middleware/rate_limit.py (modify)
    - tests/auth/test_password_reset.py (new)
    - tests/auth/test_routes.py (modify)
    - frontend/src/pages/ForgotPassword.jsx (new)
    - frontend/src/pages/ResetPassword.jsx (new)
  
  APIs affected:
    - POST /api/auth/forgot-password (new)
    - POST /api/auth/reset-password (new)
    - No breaking changes
  
  Schema changes:
    Yes — users table:
      - password_reset_token (VARCHAR(255), nullable, indexed)
      - password_reset_expires (TIMESTAMP, nullable)
  
  Breaking changes: No
  
  Dependencies:
    - Add: cryptography ^41.0.0 (token generation)
    - Update: None
    - Remove: None

Assumptions:
  - Users have valid, deliverable email addresses
  - 24-hour expiry is acceptable UX
  - Existing email service has capacity for password reset volume
  - Users will check spam folders if email not received
  - Rate limiting at application layer is sufficient

Phases:
  Phase 1: Database Migration
    - Create migration for password_reset_token and password_reset_expires
    - Add database index on token column
    - Run migration in staging environment
    - Test rollback procedure
    Verify:
      - [ ] Migration runs without errors
      - [ ] Columns created with correct types
      - [ ] Index exists
      - [ ] Rollback tested and works
    Rollback: Run down migration

  Phase 2: Core Service
    - Create PasswordResetService class
    - Implement secure token generation (cryptographically random)
    - Implement token validation with expiry check
    - Write comprehensive unit tests
    Verify:
      - [ ] All unit tests pass
      - [ ] Tokens are 32+ bytes random
      - [ ] Expiry validation works (test past, future, exact)
      - [ ] Token format is URL-safe
    Rollback: Delete service file (no external effects)

  Phase 3: Email Integration
    - Create HTML email template
    - Add plain text fallback
    - Implement email sending with token link
    - Test with SendGrid sandbox
    Verify:
      - [ ] Email renders correctly in major clients
      - [ ] Token link format: /reset-password?token=<token>
      - [ ] Link is valid and clickable
      - [ ] Template variables inject correctly
    Rollback: Remove template file

  Phase 4: API Implementation
    - Implement POST /api/auth/forgot-password endpoint
    - Implement POST /api/auth/reset-password endpoint
    - Add rate limiting (3 per hour per email)
    - Write integration tests
    Verify:
      - [ ] Forgot-password returns 202 (don't leak if email exists)
      - [ ] Reset-password validates token and updates password
      - [ ] Rate limiting blocks after 3 attempts
      - [ ] Integration tests pass
    Rollback: Comment out route registrations

  Phase 5: Frontend Integration
    - Create "Forgot password?" link on login page
    - Create forgot-password form page
    - Create reset-password form page
    - Add client-side validation
    Verify:
      - [ ] End-to-end flow works in staging
      - [ ] Form validation provides good UX
      - [ ] Error messages are helpful
      - [ ] Success path redirects to login
    Rollback: Revert frontend commits

Questions before proceeding:
  - Should we invalidate all existing sessions when password is reset?
  - Do we need audit logging for password resets (compliance)?
  - Is 24 hours the right expiry, or should it be shorter?

Estimated effort: 3-4 days (1 day per phase, 1 buffer day)
═══════════════════════════════════════════════════════
```

---

## Plan Validation Rules

Before starting implementation, verify:

- [ ] Goal is specific and measurable
- [ ] All constraints are explicit
- [ ] Blast radius is fully understood
- [ ] Each phase has verifiable criteria
- [ ] Rollback plan exists for each phase
- [ ] Open questions are answered (or noted as risks)
- [ ] Estimated effort seems realistic

**If questions exist:** Answer them before Phase 1.

---

## When Plans Change

### Minor Adjustments
```
PLAN UPDATE (Phase 2):
- Added: Also need to handle expired token cleanup
- Reason: Tokens accumulate in database indefinitely
```

### Major Changes (restart plan)
```
PLAN REVISION: Schema change required
Original: Add fields to users table
New: Create separate password_resets table
Reason: User table is locked during peak hours, can't add columns
```

---

## Integration with Workflow

### Before Starting Work
```bash
claude /plan "implement feature X"
# Review plan, answer questions
# Confirm phases
```

### During Implementation
```bash
# After each phase
claude /review src/auth/password_reset.py

# If issues found, update plan
claude /plan "implement feature X --update-phase=3"
```

### Post-Implementation
```bash
# Compare actual vs planned
# Document learnings for next plan
```

---

## Anti-Patterns

### Monolithic Plan
```
❌ BAD:
Phase 1: Do everything
  - Migration
  - Backend
  - Frontend
  - Tests
  Verify: It works
```

### Vague Verification
```
❌ BAD:
Verify:
  - [ ] Works correctly
  - [ ] No bugs
```

### Missing Rollback
```
❌ BAD:
Phase 3: Deploy to production
  Verify: Site loads
  # What if it breaks? How do we undo?
```

### Unrealistic Phases
```
❌ BAD:
Phase 1: Implement entire authentication system
  # Too large — can't verify, can't rollback cleanly
```

---

## Live Templates

### JetBrains
Template: `spec-plan`
```
PLAN: ${TASK}
═══════════════════════════════════════════════════════
Goal:
  ${GOAL}

Constraints:
  - ${CONSTRAINT1}
  - ${CONSTRAINT2}

Blast Radius:
  Files affected: ${FILES}
  APIs affected: ${APIS}
  Schema changes: ${SCHEMA}
  Breaking changes: ${BREAKING}

Assumptions:
  - ${ASSUMPTION1}

Phases:
  Phase 1: ${PHASE1_NAME}
    - ${STEP1}
    - ${STEP2}
    Verify: ${VERIFY}

Questions:
  - ${QUESTION}
═══════════════════════════════════════════════════════
```

---

## See Also

- [Getting Started](../getting-started.md)
- [Review Command](./review.md)
- [Debug Command](./debug.md)
- [Troubleshooting](../troubleshooting.md)
