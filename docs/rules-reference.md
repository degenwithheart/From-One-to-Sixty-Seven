# Rules Reference

Complete index of all behavioral rules in From One to Sixty-Seven.

---

## Core Rules (CLAUDE.md)

The base behavioral contract contains 20 rules organized into logical groups.

---

### Rule Group 1: Before Writing Code

#### Rule 1.1: Restate the Goal

**Rule:** Always restate the goal in your own words before writing code.

**When to apply:** Every task

**Why:** Ensures understanding and gives user chance to correct misinterpretation

**Compliant example:**
```markdown
Goal restatement: Add email validation to the signup endpoint that rejects 
malformed addresses before they reach the database layer.

This means:
1. Validate email format on signup request
2. Return 400 with field-level error if invalid
3. Don't create user record if validation fails

Is this correct, or did I miss anything?
```

**Violation:**
```markdown
# No restatement, immediately starts coding
Here's the implementation:
```python
def validate_email(email):
    ...
```
```

**Related rules:** 1.2, 2.1, 19

---

#### Rule 1.2: Present Interpretations

**Rule:** If the task is ambiguous, present 2-3 interpretations and ask which is correct. Never silently pick one.

**When to apply:** When request has multiple valid interpretations

**Why:** Silent assumptions cause production issues

**Compliant example:**
```markdown
Task: "Update the caching behavior"

Interpretations:
1. Change TTL from 60s to 300s (more aggressive caching)
2. Add cache invalidation on write (better consistency)
3. Implement multi-tier cache (performance optimization)

Which did you mean? (1) is simple config change, (2) adds complexity but 
improves consistency, (3) is significant architecture work.
```

**Violation:**
```markdown
Task: "Update the caching behavior"

# Silent choice
I'll change the TTL to 300 seconds.
```python
CACHE_TTL = 300  # Changed from 60
```
```

**Related rules:** 1.1, 15

---

#### Rule 1.3: Identify Affected Modules

**Rule:** Identify which files and modules will be affected before making changes.

**When to apply:** Multi-file changes, new features

**Why:** Prevents surprise blast radius, helps estimate effort

**Compliant example:**
```markdown
Blast radius for "add password reset":

Files to modify:
- src/auth/password.py (new service)
- src/auth/routes.py (2 new endpoints)
- src/models/user.py (2 new fields)
- src/email/sender.py (new function)

Tests needed:
- tests/auth/test_password.py (new)
- tests/auth/test_routes.py (modify)

APIs affected:
- POST /api/auth/forgot-password (new)
- POST /api/auth/reset-password (new)
```

**Related rules:** 5, 16

---

### Rule Group 2: Code Changes

#### Rule 2.1: Change Only What is Required

**Rule:** Change only what the task requires. Nothing more.

**When to apply:** Every change

**Why:** Smaller diffs are easier to review, test, and roll back

**Compliant example:**
```markdown
Task: "Fix the null check on line 42"

Change made (line 42 only):
```python
# Before
if user.email:

# After  
if user and user.email:
```

No other changes made to file.
```

**Violation:**
```markdown
Task: "Fix the null check on line 42"

# Also renamed variables, reorganized imports, added comments,
# extracted helper function, changed formatting
```

**Related rules:** 2.2, 2.3, 3

---

#### Rule 2.2: Match Existing Style

**Rule:** Match the existing code style, indentation, and patterns exactly.

**When to apply:** Every change in existing files

**Why:** Consistency reduces cognitive load, minimizes diff noise

**Compliant example:**
```markdown
# Existing code uses snake_case, 4-space indent, single quotes
# New code follows same conventions

def fetch_user(user_id):
    return db.query('SELECT * FROM users WHERE id = ?', user_id)
```

**Violation:**
```markdown
# Mixing camelCase in snake_case file
# Using 2-space indent when file uses 4
# Double quotes when file uses single
def fetchUser(userId):
    return db.query("SELECT * FROM users WHERE id = ?", userId)
```

**Related rules:** 2.1

---

#### Rule 2.3: No New Abstractions

**Rule:** No new abstractions unless the task explicitly requires them.

**When to apply:** Simple tasks, single-purpose changes

**Why:** Premature abstraction adds complexity, makes code harder to understand

**Compliant example:**
```markdown
Task: "Add email field to User model"

Change:
```python
class User:
    def __init__(self, name, email=None):  # Added email parameter
        self.name = name
        self.email = email  # Added field
```
```

**Violation:**
```markdown
Task: "Add email field to User model"

# Created unnecessary abstractions
class FieldRegistry:
    pass

class UserBuilder:
    pass

class FieldDescriptor:
    pass
```

**Anti-pattern:** AP2 Unnecessary Abstraction

**Related rules:** 2.1, 14

---

#### Rule 2.4: No Hidden Refactors

**Rule:** Do not refactor unrelated code. If you notice something to improve, note it separately but don't include in the fix.

**When to apply:** Bug fixes in messy files

**Why:** Separates concerns, keeps PRs reviewable

**Compliant example:**
```markdown
Task: "Fix null check on line 42"

Change: Fixed null check on line 42.

Note: I noticed the imports could be reorganized and there's an unused 
variable on line 67. Want me to clean those up in a separate change?
```

**Violation:**
```markdown
# Fixed null check + reorganized imports + renamed variables + 
# removed unused code + reformatted entire file
```

**Anti-pattern:** AP3 Hidden Refactor

**Related rules:** 2.1, 3

---

#### Rule 2.5: No Future-Proofing

**Rule:** Do not write speculative code for requirements that don't exist yet.

**When to apply:** Feature implementation

**Why:** YAGNI (You Aren't Gonna Need It) — unused code is technical debt

**Compliant example:**
```markdown
Task: "Parse a date from this string"

Implementation:
```python
def parse_date(date_string):
    """Parse ISO 8601 date string to datetime."""
    return datetime.fromisoformat(date_string)
```
```

**Violation:**
```markdown
Task: "Parse a date from this string"

# Speculative utilities "for future use"
class DateUtils:
    @staticmethod
    def parse_date(s): ...
    @staticmethod
    def format_date(d): ...
    @staticmethod
    def to_iso(d): ...
    @staticmethod
    def from_unix(ts): ...
    @staticmethod
    def to_relative(d): ...
    @staticmethod
    def is_weekend(d): ...
```

**Anti-pattern:** AP4 Speculative Utility

**Related rules:** 14

---

### Rule Group 3: Simplicity

#### Rule 3: Favor Boring Code

**Rule:** Prefer simple, explicit, "boring" code over clever, implicit solutions.

**When to apply:** Every implementation decision

**Why:** Boring code is readable, debuggable, maintainable

**Compliant example:**
```python
# Explicit, readable
if user is None:
    return None
if not user.is_active:
    return None
return user.email
```

**Violation:**
```python
# Clever, hard to read
return (user and user.is_active and user.email) or None
```

**Related rules:** 2.3, 17

---

#### Rule 3.1: No Nested Ternaries

**Rule:** No nested ternary operators. Use if-statements.

**When to apply:** Conditional logic

**Why:** Nested ternaries are hard to read, easy to break

**Compliant example:**
```python
if user.is_admin:
    discount = 0.25
elif user.is_member:
    discount = 0.15
else:
    discount = 0.0
```

**Violation:**
```python
discount = 0.25 if user.is_admin else (0.15 if user.is_member else 0.0)
```

**Related rules:** 3

---

### Rule Group 4: Testing

#### Rule 4: Test First for Bug Fixes

**Rule:** When fixing a bug, write a failing test that reproduces it before touching the fix.

**When to apply:** All bug fixes

**Why:** Confirms understanding of bug, prevents regression, enables TDD

**Compliant example:**
```markdown
Bug: calculate_discount returns wrong value for orders over £1000

Step 1: Write failing test
```python
def test_high_value_discount():
    assert calculate_discount(1500, "gold") == 0.20  # FAILS
```

Step 2: Confirm test fails with current code

Step 3: Fix the bug

Step 4: Confirm test passes

Step 5: Check existing tests still pass
```

**Violation:**
```markdown
Bug: calculate_discount returns wrong value

# Immediate fix without test
# May not actually reproduce the bug
# No regression protection
```

**Anti-pattern:** AP5 Unverified Fix

**Related rules:** 4.1, 10

---

#### Rule 4.1: Three Test Types

**Rule:** Every significant change needs tests for: happy path, edge cases, error paths.

**When to apply:** New features, significant changes

**Why:** Ensures robustness, documents behavior

**Compliant example:**
```python
# Happy path
def test_valid_email_accepted():
    assert validate_email("user@example.com") is True

# Edge cases
def test_empty_email_rejected():
    assert validate_email("") is False

def test_very_long_email():
    assert validate_email("a" * 250 + "@example.com") is False

# Error paths  
def test_none_email_rejected():
    assert validate_email(None) is False

def test_no_at_symbol_rejected():
    assert validate_email("notanemail") is False
```

**Related rules:** 4, 10

---

### Rule Group 5: Communication

#### Rule 5: Declare Assumptions

**Rule:** Always declare assumptions explicitly in an `ASSUMPTIONS:` block.

**When to apply:** Proceeding without full clarification

**Why:** Makes hidden decisions visible, allows correction

**Compliant example:**
```markdown
Task: "Add caching to the API"

ASSUMPTIONS:
- Redis is available (we'll use it for distributed cache)
- Cache TTL should be 5 minutes (configurable later)
- Cache all GET endpoints except /health
- Invalidate on POST/PUT/DELETE to same resource

Please confirm these assumptions before I proceed.
```

**Violation:**
```markdown
# No assumption declaration
# Silent decisions made
```

**Anti-pattern:** AP1 Silent Interpretation

**Related rules:** 1.2, 15

---

#### Rule 5.1: Mandatory for Ambiguity

**Rule:** If the task is ambiguous and you proceed without clarification, the `ASSUMPTIONS:` block is mandatory.

**When to apply:** Ambiguous tasks where user said "proceed anyway"

**Why:** Documents the interpretation chosen

**Related rules:** 5, 1.2

---

### Rule Group 6: Security

#### Rule 6: No Secrets in Code

**Rule:** Never hardcode secrets, API keys, passwords, or credentials in code.

**When to apply:** Every code change

**Why:** Security breach risk, credentials in git history

**Compliant example:**
```python
# Environment variable
api_key = os.environ.get("API_KEY")
if not api_key:
    raise ValueError("API_KEY environment variable required")
```

**Violation:**
```python
# Hardcoded secret
api_key = "sk-live-1234567890abcdef"
```

**Related rules:** 6.1, 6.2, 6.3

---

#### Rule 6.1: No Secret Logging

**Rule:** Never log passwords, tokens, API keys, or PII even partially.

**When to apply:** Logging, error handling

**Why:** Log files are often less protected than code

**Compliant example:**
```python
# Log safe data only
logger.info(f"User {user_id} logged in")  # Safe

# Don't log:
# - Passwords
# - API keys
# - Full credit card numbers
# - SSNs
# - Session tokens
```

**Violation:**
```python
logger.info(f"User login attempt: email={email}, password={password}")
```

**Related rules:** 6

---

#### Rule 6.2: No SQL Concatenation

**Rule:** Never build SQL queries via string concatenation or interpolation.

**When to apply:** Database queries

**Why:** SQL injection vulnerability

**Compliant example:**
```python
# Parameterized query
cursor.execute("SELECT * FROM users WHERE email = ?", (email,))

# ORM
User.objects.filter(email=email)
```

**Violation:**
```python
# SQL injection risk
query = f"SELECT * FROM users WHERE email = '{email}'"
cursor.execute(query)
```

**Related rules:** 6

---

#### Rule 6.3: Validate All Input

**Rule:** Validate all external input at the trust boundary with allowlists, not denylists.

**When to apply:** API endpoints, file uploads, user input

**Why:** Prevent injection, malformed data, abuse

**Compliant example:**
```python
# Allowlist validation
ALLOWED_SORT_FIELDS = ["name", "created_at", "updated_at"]
sort_by = request.args.get("sort", "created_at")
if sort_by not in ALLOWED_SORT_FIELDS:
    raise ValueError(f"Invalid sort field: {sort_by}")
```

**Violation:**
```python
# Denylist (incomplete)
if "DROP" not in user_input:  # Can bypass with dRoP, etc.
    process(user_input)
```

**Related rules:** 6

---

### Rule Group 7: Error Handling

#### Rule 7: Handle All Error Paths

**Rule:** Every code path must handle errors gracefully. No silent failures.

**When to apply:** Every function with external calls, I/O, user input

**Why:** Silent failures are hardest to debug

**Compliant example:**
```python
def fetch_user(user_id):
    try:
        user = db.get_user(user_id)
        if not user:
            return None  # Explicit not found
        return user
    except DatabaseError as e:
        logger.error(f"Database error fetching user {user_id}: {e}")
        raise  # Re-raise for caller to handle
```

**Violation:**
```python
def fetch_user(user_id):
    return db.get_user(user_id)  # May raise, may return None silently
```

**Related rules:** 7.1, 7.2

---

#### Rule 7.1: Fail Loudly

**Rule:** Fail loudly in development, fail gracefully in production. Never fail silently.

**When to apply:** Error handling design

**Why:** Silent failures go unnoticed, loud failures get fixed

**Compliant example:**
```python
# Development: Raise with full details
if not user:
    raise UserNotFoundError(f"User {user_id} not found")

# Production: Return safe default
if not user:
    return {"error": "User not found", "user_id": user_id}
```

**Violation:**
```python
# Silent failure
if not user:
    return None  # Caller may not check, leading to bugs
```

**Related rules:** 7

---

#### Rule 7.2: Error Messages

**Rule:** Error messages should help the user, not blame them. Include what happened, why, and how to fix.

**When to apply:** User-facing errors

**Why:** Good error messages reduce support burden

**Compliant example:**
```json
{
  "error": "Invalid email format",
  "field": "email",
  "value": "not-an-email",
  "message": "Please provide a valid email address (e.g., user@example.com)"
}
```

**Violation:**
```json
{
  "error": "Bad Request"
}
```

**Related rules:** 7

---

### Rule Group 8: Performance

#### Rule 8: No N+1 Queries

**Rule:** Detect and eliminate N+1 database queries. Use joins, batched queries, or data loaders.

**When to apply:** Database access patterns

**Why:** N+1 queries cause severe performance degradation

**Compliant example:**
```python
# Bad: N+1
for order in orders:
    print(order.user.name)  # Query per order

# Good: Join
orders = Order.objects.select_related('user').all()
for order in orders:
    print(order.user.name)  # No additional query
```

**Related rules:** 8.1

---

#### Rule 8.1: No Unbounded Loops

**Rule:** No unbounded loops or recursion on user-controlled data.

**When to apply:** Loops, recursion

**Why:** Prevents DoS via resource exhaustion

**Compliant example:**
```python
# Bounded
MAX_ITEMS = 1000
for item in items[:MAX_ITEMS]:
    process(item)

# Or with early exit
for i, item in enumerate(items):
    if i >= MAX_ITEMS:
        logger.warning(f"Truncated processing at {MAX_ITEMS} items")
        break
    process(item)
```

**Violation:**
```python
# Unbounded
for item in user_provided_list:  # Could be millions
    process(item)
```

**Related rules:** 8

---

### Rule Group 9: Documentation

#### Rule 9: Document Public APIs

**Rule:** Every public function, class, and module needs a docstring or comment explaining what it does.

**When to apply:** Public interfaces

**Why:** Code is read more than written

**Compliant example:**
```python
def calculate_discount(order_total, customer_tier):
    """
    Calculate discount percentage based on order total and customer tier.
    
    Args:
        order_total: Decimal, total order value
        customer_tier: str, one of "bronze", "silver", "gold", "platinum"
    
    Returns:
        Decimal: Discount rate (e.g., 0.15 for 15%)
    
    Raises:
        ValueError: If customer_tier is invalid
    """
```

**Violation:**
```python
def calculate_discount(a, b):
    # No docstring, unclear what a and b are
    ...
```

**Related rules:** None

---

#### Rule 9.1: No Redundant Comments

**Rule:** Comments should explain why, not what. No "increment counter" comments.

**When to apply:** Every comment

**Why:** Redundant comments clutter code, get out of sync

**Compliant example:**
```python
# Compensate for edge case where timezone differs
# between order creation and payment processing
adjusted_time = order_time + timedelta(hours=1)
```

**Violation:**
```python
# Increment counter by 1
counter += 1  # Redundant - code says this
```

**Related rules:** 9

---

### Rule Group 10: Verification

#### Rule 10: Verification Checklist

**Rule:** After any non-trivial change, confirm it compiles, tests pass, edge cases handled.

**When to apply:** After coding, before finishing

**Why:** Catches issues before they reach review/production

**Compliant example:**
```markdown
I've added the email validation.

Verification:
- [ ] Code compiles without warnings
- [ ] Unit tests pass (3 new tests added)
- [ ] Integration tests pass
- [ ] Edge cases tested: empty, None, too long, no @
- [ ] Manual test in staging confirms behavior
```

**Violation:**
```markdown
Here's the code. Done.
```

**Related rules:** 10.1, 4, 4.1

---

#### Rule 10.1: Verification Before SUMMARY

**Rule:** Verification comes before the SUMMARY block, not after.

**When to apply:** Every task ending

**Why:** Verification informs SUMMARY content

**Compliant example:**
```markdown
[Code and explanation]

Verification:
- [x] Tests pass
- [x] Edge cases handled

SUMMARY:
- What changed: ...
- Verified: All tests pass (as confirmed above)
```

**Related rules:** 10, 20

---

### Rule Group 11: Dependencies

#### Rule 11: Minimize Dependencies

**Rule:** Add dependencies only when the benefit clearly outweighs the cost.

**When to apply:** Adding libraries, packages

**Why:** Dependencies are liability (security, maintenance, complexity)

**Compliant example:**
```markdown
Task: Parse JSON

Decision: Use built-in `json` module.

Rationale:
- Built-in is sufficient
- No external dependency needed
- Standard library is well-maintained
```

**Violation:**
```markdown
Task: Parse JSON

Action: Add ujson, simplejson, orjson, and 3 wrapper libraries

Rationale: "Just in case we need the performance"
```

**Related rules:** 11.1

---

#### Rule 11.1: Check Existing Dependencies First

**Rule:** Before adding a new dependency, check if an existing one already provides the functionality.

**When to apply:** Every dependency addition

**Why:** Prevents dependency bloat, version conflicts

**Compliant example:**
```bash
# Check package.json first
grep -i "date" package.json

# If date-fns already present, use it instead of adding moment.js
```

**Related rules:** 11

---

### Rule Group 12: Tool Usage

#### Rule 12: Use Tools Judiciously

**Rule:** Use the right tool for the job. Don't use a chainsaw when scissors will do.

**When to apply:** Tool selection

**Why:** Over-engineering with complex tools adds cost

**Compliant example:**
```markdown
Task: Cache API responses for 5 minutes

Decision: Use simple in-memory dict with TTL.

Rationale:
- Single server, no distributed need
- 5 minute TTL, no persistence need
- Redis would be overkill
```

**Violation:**
```markdown
Task: Cache API responses

Decision: Deploy Redis cluster with Sentinel for HA, 
persistence to disk, LRU eviction policy.

Rationale: "We might need to scale later"
```

**Related rules:** 3, 11

---

### Rule Group 13: Human Guidance

#### Rule 13: Ask for Human Guidance

**Rule:** When business logic is unclear or cross-system impact is uncertain, ask for human guidance rather than guessing.

**When to apply:** Uncertain requirements, business rules

**Why:** AI lacks business context, guesses can be expensive

**Compliant example:**
```markdown
Question: "Should we delete old user sessions after password reset?"

I can see two interpretations:
1. Delete sessions (forces re-login on all devices)
2. Keep sessions (user stays logged in on other devices)

Security usually favors (1), UX usually favors (2).

Which is the requirement for this project?
```

**Violation:**
```markdown
# Silent decision
I'll delete the sessions. "Seems more secure."
```

**Anti-pattern:** AP8 Confident Wrong Answer

**Related rules:** 1.2, 5

---

### Rule Group 14: Utilities

#### Rule 14: No Speculative Utilities

**Rule:** Don't write utility functions for hypothetical future use. YAGNI.

**When to apply:** Helper functions, utilities

**Why:** Unused code is technical debt

**Compliant example:**
```markdown
Task: "Parse date string"

Code:
```python
def parse_date(date_string):
    """Parse ISO 8601 date."""
    return datetime.fromisoformat(date_string)
```
```

**Violation:**
```markdown
class DateUtils:
    @staticmethod
    def parse_date(s): ...
    @staticmethod  
    def format_date(d): ...  # Not needed
    @staticmethod
    def to_iso(d): ...       # Not needed
    @staticmethod
    def from_unix(ts): ...   # Not needed
```

**Anti-pattern:** AP4 Speculative Utility

**Related rules:** 2.5, 3

---

### Rule Group 15: Hallucination Prevention

#### Rule 15: Verify API and Imports

**Rule:** Verify that APIs, imports, and external calls you suggest actually exist.

**When to apply:** Using external libraries, APIs

**Why:** LLMs can hallucinate APIs that don't exist

**Compliant example:**
```markdown
Using boto3 S3 client (verified exists in boto3 1.28+):

```python
s3 = boto3.client('s3')
response = s3.list_buckets()  # Verified method
```

ASSUMPTION: boto3 version 1.28+. Please verify if using older version.
```

**Violation:**
```python
# Hallucinated method
s3.listAllBuckets()  # Doesn't exist
```

**Anti-pattern:** AP6 Hallucinated API

**Related rules:** 15.1

---

#### Rule 15.1: Declare API Version Assumptions

**Rule:** When using external APIs, declare version assumptions.

**When to apply:** External library usage

**Why:** APIs change between versions

**Compliant example:**
```markdown
ASSUMPTION: Using Django 4.2+ syntax.
If using Django 3.x, this import path may differ.
```

**Related rules:** 15

---

### Rule Group 16: Multi-File Changes

#### Rule 16: Coordinate Changes

**Rule:** When changing multiple files, ensure changes are coordinated and consistent.

**When to apply:** Multi-file PRs, refactors

**Why:** Prevents partial states, broken builds

**Compliant example:**
```markdown
Files changed:
1. models/user.py — added email field
2. serializers/user.py — added email to serialization
3. api/users.py — added email to API response
4. tests/test_users.py — added email to test fixtures

All coordinated: adding email field throughout stack.
```

**Violation:**
```markdown
# Changed model but not serializer
# API returns old schema, breaking clients
```

**Related rules:** 16.1

---

#### Rule 16.1: Update All References

**Rule:** When renaming or removing, update all references including tests, docs, and comments.

**When to apply:** Renames, deletions

**Why:** Prevents broken references

**Compliant example:**
```bash
# Search for all references
grep -r "old_function_name" --include="*.py" .

# Update all found occurrences
```

**Related rules:** 16

---

### Rule Group 17: Readability

#### Rule 17: Optimize for Readability

**Rule:** Code is read 10x more than written. Optimize for the reader.

**When to apply:** Every line of code

**Why:** Readable code is maintainable code

**Compliant example:**
```python
# Clear intent
def calculate_monthly_revenue(orders):
    return sum(order.total for order in orders if order.is_paid)
```

**Violation:**
```python
# Clever but hard to read
calc_rev = lambda o: sum(x.t for x in o if x.p)
```

**Related rules:** 3, 17.1

---

#### Rule 17.1: Name Things Well

**Rule:** Variable and function names should reveal intent. `i`, `j`, `k` are rarely sufficient.

**When to apply:** Naming everything

**Why:** Good names reduce need for comments

**Compliant example:**
```python
for user in users:
    if user.is_active:
        process_active_user(user)
```

**Violation:**
```python
for x in l:
    if x.a:
        f(x)
```

**Related rules:** 17

---

### Rule Group 18: Completeness

#### Rule 18: No TODO Comments

**Rule:** No `// TODO`, `// FIXME`, or placeholder comments in delivered code. If something needs fixing, fix it or ticket it.

**When to apply:** Before committing

**Why:** TODOs accumulate and are forgotten

**Compliant example:**
```markdown
# Option 1: Fix now
[complete implementation]

# Option 2: Ticket it
Implementation complete. Noted edge case for future:
Issue #123: Handle timezone edge case in date parsing
```

**Violation:**
```python
def parse_date(date_string):
    # TODO: Handle timezones
    return datetime.fromisoformat(date_string)
```

**Related rules:** None

---

### Rule Group 19: Self-Correction

#### Rule 19: Self-Correction Loop

**Rule:** Review your own output against the spec rules before finishing. Fix violations.

**When to apply:** Before finishing any task

**Why:** Catches mistakes before human review

**Compliant example:**
```markdown
[proposed solution]

Self-review against spec:
- ✅ Goal restated
- ✅ Assumptions declared
- ✅ Minimal change
- ✅ Security considered
- ✅ Tests included
- ✅ SUMMARY present

Proceeding with delivery.
```

**Related rules:** 19.1

---

#### Rule 19.1: Final Sanity Statement

**Rule:** Before finishing, verify against the original constraints and the spec rules one final time.

**When to apply:** Every task completion

**Why:** Catches drift from original intent

**Compliant example:**
```markdown
Final check:
- Original task: Fix null check on line 42
- What I did: Fixed null check on line 42
- No hidden refactors: ✅ Verified
- Tests added: ✅ 1 test for the fix
- SUMMARY: ✅ Below

Delivering now.
```

**Related rules:** 19, 20

---

### Rule Group 20: Summary

#### Rule 20: SUMMARY Block

**Rule:** End every significant code change with a SUMMARY block.

**When to apply:** Every non-trivial task

**Why:** Documents what happened, why, and what's left

**Compliant example:**
```markdown
SUMMARY:
- What changed: Added email validation to signup endpoint
  - Rejects malformed emails with 400 error
  - Returns field-level error message
- Why: User story required email format validation
- Verified: 
  - 3 new unit tests pass
  - Integration tests pass
  - Manual test in staging confirms
- Assumptions:
  - Email format follows RFC 5322
  - Max length 254 characters acceptable
- Risks: None — change is additive and localized
```

**Violation:**
```markdown
# No SUMMARY
Done.
```

**Related rules:** 20.1

---

#### Rule 20.1: SUMMARY Format

**Rule:** SUMMARY must include: What changed, Why, Verified, Assumptions, Risks.

**When to apply:** Every SUMMARY block

**Why:** Standard format ensures nothing is missed

**Required fields:**
- **What changed:** Specific description of changes
- **Why:** Business/technical reason
- **Verified:** How you confirmed it works
- **Assumptions:** What you assumed
- **Risks:** What could go wrong

**Related rules:** 20

---

## Rule Index by Category

### Communication
| Rule | Description |
|------|-------------|
| 1.1 | Restate the goal |
| 1.2 | Present interpretations |
| 5 | Declare assumptions |
| 5.1 | Mandatory for ambiguity |
| 13 | Ask for human guidance |
| 20 | SUMMARY block |
| 20.1 | SUMMARY format |

### Code Quality
| Rule | Description |
|------|-------------|
| 2.1 | Change only what is required |
| 2.2 | Match existing style |
| 2.3 | No new abstractions |
| 2.4 | No hidden refactors |
| 2.5 | No future-proofing |
| 3 | Favor boring code |
| 3.1 | No nested ternaries |
| 14 | No speculative utilities |
| 17 | Optimize for readability |
| 17.1 | Name things well |
| 18 | No TODO comments |

### Testing
| Rule | Description |
|------|-------------|
| 4 | Test first for bug fixes |
| 4.1 | Three test types |
| 10 | Verification checklist |
| 10.1 | Verification before SUMMARY |

### Security
| Rule | Description |
|------|-------------|
| 6 | No secrets in code |
| 6.1 | No secret logging |
| 6.2 | No SQL concatenation |
| 6.3 | Validate all input |

### Error Handling
| Rule | Description |
|------|-------------|
| 7 | Handle all error paths |
| 7.1 | Fail loudly |
| 7.2 | Error messages |

### Performance
| Rule | Description |
|------|-------------|
| 8 | No N+1 queries |
| 8.1 | No unbounded loops |

### Documentation
| Rule | Description |
|------|-------------|
| 9 | Document public APIs |
| 9.1 | No redundant comments |

### Dependencies
| Rule | Description |
|------|-------------|
| 11 | Minimize dependencies |
| 11.1 | Check existing first |
| 12 | Use tools judiciously |

### Multi-File
| Rule | Description |
|------|-------------|
| 1.3 | Identify affected modules |
| 16 | Coordinate changes |
| 16.1 | Update all references |

### Self-Correction
| Rule | Description |
|------|-------------|
| 15 | Verify API and imports |
| 15.1 | Declare API versions |
| 19 | Self-correction loop |
| 19.1 | Final sanity statement |

---

## Rule Relationships

```
                    ┌─────────────┐
                    │   Goal      │
                    │ Restatement │
                    │   (1.1)     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │Ambiguity│  │  Plan   │  │ Assumptions│
        │(1.2, 5) │  │ (1.3)   │  │   (5)     │
        └────┬────┘  └────┬────┘  └────┬────┘
             │            │            │
             └────────────┼────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Code      │
                   │  Change     │
                   │  (2.x, 3)   │
                   └──────┬──────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
       ┌─────────┐  ┌─────────┐  ┌─────────┐
       │ Testing │  │ Security│  │   Docs  │
       │(4, 10)  │  │  (6.x)  │  │  (9.x)  │
       └────┬────┘  └────┬────┘  └────┬────┘
             │            │            │
             └────────────┼────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │Verification │
                   │  (10, 19)   │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   SUMMARY   │
                   │   (20)      │
                   └─────────────┘
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                    FROM ONE TO SIXTY-SEVEN                   │
│                      Rule Quick Reference                    │
├─────────────────────────────────────────────────────────────┤
│ BEFORE CODING                                                │
│ 1. Restate goal (1.1)                                       │
│ 2. If ambiguous, present options (1.2, 5)                    │
│ 3. Identify affected files (1.3)                            │
├─────────────────────────────────────────────────────────────┤
│ WHILE CODING                                                │
│ 4. Minimal change only (2.1)                                │
│ 5. Match existing style (2.2)                               │
│ 6. No new abstractions (2.3)                                │
│ 7. No hidden refactors (2.4)                                │
│ 8. Favor boring code (3)                                     │
├─────────────────────────────────────────────────────────────┤
│ SECURITY & ERRORS                                           │
│ 9. No secrets in code (6)                                   │
│ 10. Validate all input (6.3)                                 │
│ 11. Handle all errors (7)                                    │
├─────────────────────────────────────────────────────────────┤
│ TESTING                                                     │
│ 12. Test first for bugs (4)                                  │
│ 13. Happy path + edge cases + errors (4.1)                  │
├─────────────────────────────────────────────────────────────┤
│ FINISHING                                                   │
│ 14. Verify it works (10)                                     │
│ 15. Self-review against rules (19)                         │
│ 16. End with SUMMARY (20)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## See Also

- [CLAUDE.md](../CLAUDE.md) — Complete base spec with all rules
- [AGENTS.md](../AGENTS.md) — Alternative format for other LLMs
- [Examples](./examples.md) — Compliant vs non-compliant examples
- [Anti-Patterns](./anti-patterns.md) — Common failures and fixes
