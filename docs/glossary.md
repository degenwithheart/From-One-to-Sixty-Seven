# Glossary

Comprehensive terminology reference for From One to Sixty-Seven.

---

## Core Concepts

### Behavioral Contract

A formal agreement between human and AI that defines expected behavior. Unlike "guidelines," a contract is enforceable through:
- Required output formats (SUMMARY blocks)
- Mandatory steps (assumption declaration)
- Verification requirements

**Example:** From One to Sixty-Seven is a behavioral contract for AI coding assistants.

---

### SUMMARY Block

Required output format at the end of every non-trivial task. Contains five fields:
- **What changed:** Specific description of changes made
- **Why:** Business or technical reason for the change
- **Verified:** How the change was confirmed to work
- **Assumptions:** Explicit list of assumptions made
- **Risks:** Potential issues or concerns

**Example:**
```markdown
SUMMARY:
- What changed: Added email validation to signup endpoint
- Why: User story required email format validation  
- Verified: 3 new tests pass, manual test confirms
- Assumptions: Email format follows RFC 5322
- Risks: None — change is additive
```

---

### ASSUMPTIONS Block

Explicit declaration of interpretations made when proceeding without full clarification. Required when:
- Task is ambiguous
- User says "proceed anyway"
- Multiple valid interpretations exist

**Example:**
```markdown
ASSUMPTIONS:
- "Update caching" means changing TTL to 5 minutes
- Cache applies to all GET endpoints
- Redis is available for distributed cache
```

---

### Blast Radius

The scope of impact for a proposed change. Includes:
- Files affected
- APIs modified
- Schema changes
- Breaking changes
- Dependencies added/removed

**Example:**
```markdown
Blast radius for "add password reset":
- Files: 4 modified, 2 new
- APIs: 2 new endpoints
- Schema: 2 new columns
- Breaking: None
- Dependencies: 1 new (cryptography)
```

---

### Silent Assumptions

Interpretations made without asking or declaring. Dangerous because:
- User doesn't know assumption was made
- May be wrong
- Can cause production issues

**Anti-pattern:** AP1 Silent Interpretation

**Example:**
```markdown
❌ BAD (silent assumption):
User: "Update the caching"
AI: Changes TTL to 300 seconds

✅ GOOD:
User: "Update the caching"
AI: "I see 3 possible interpretations... Which did you mean?"
```

---

## Anti-Patterns

### AP1: Silent Interpretation

Picking an interpretation without asking or declaring.

**Symptom:** AI proceeds without clarifying ambiguous request
**Fix:** Present 2-3 interpretations and ask user to choose

---

### AP2: Unnecessary Abstraction

Creating complex abstractions for simple needs.

**Symptom:** Factory classes, registries, builders for single use cases
**Fix:** Use functions and simple data structures; add abstractions only when needed

---

### AP3: Hidden Refactor

Refactoring unrelated code while making requested change.

**Symptom:** Diff includes variable renames, import reorganization, formatting changes
**Fix:** Separate refactoring from feature work; only change what's required

---

### AP4: Speculative Utility

Writing functions "for future use" that aren't needed now.

**Symptom:** `DateUtils` class with 10 methods when only one needed
**Fix:** YAGNI — You Aren't Gonna Need It; write what's needed, no more

---

### AP5: Unverified Fix

Fixing a bug without verifying the fix works.

**Symptom:** No test, no reproduction confirmation, no edge case check
**Fix:** Write failing test first, fix, verify test passes

---

### AP6: Hallucinated API

Using APIs or methods that don't exist.

**Symptom:** `s3.listAllBuckets()` when method is `s3.list_buckets()`
**Fix:** Verify APIs exist; declare version assumptions

---

### AP7: Context Drift

Gradual forgetting of constraints over a long session.

**Symptom:** Early rules violated after 15+ conversation turns
**Fix:** Session refresh prompt every 10-15 turns; restart session

---

### AP8: Confident Wrong Answer

Answering definitively when uncertain.

**Symptom:** "Yes, it's safe to delete that table" (when AI can't know cross-system impact)
**Fix:** State uncertainty; recommend verification steps

---

## Workflow Terms

### Context Drift

The phenomenon where LLMs gradually forget constraints stated earlier in a conversation.

**Cause:** Attention mechanisms favor recent context; long conversations dilute earlier instructions
**Solution:** Session refresh prompts, task segmentation

---

### Session Refresh

Prompt used to re-anchor LLM to spec rules after several conversation turns.

**Example:**
```markdown
Reminder: From One to Sixty-Seven spec is active.
Rules: restate, minimal change, verify, SUMMARY.
Current task: [restate]
```

---

### Goal Restatement

Required first step before coding: restating the task in your own words.

**Purpose:** Confirms understanding; gives user chance to correct
**Format:** "Goal: [restatement]. Is this correct?"

---

### Surgical Change

Minimal, focused modification that addresses exactly the task requirement.

**Characteristics:**
- Changes only specified lines
- No collateral modifications
- Matches existing patterns exactly
- Easy to review and rollback

---

### Minimal Change

Philosophy of changing only what is required, nothing more.

**Principle:** If a senior engineer would say "why did you change this?" — you changed too much
**Related:** Surgical change, hidden refactor (anti-pattern)

---

### Verification Checklist

Required confirmation steps after non-trivial changes.

**Standard items:**
- [ ] Code compiles without errors
- [ ] Existing tests still pass
- [ ] Edge cases handled
- [ ] Error paths return safe results
- [ ] No placeholder comments

---

### Phased Implementation

Breaking complex tasks into discrete, verifiable phases.

**Benefits:**
- Easier to review
- Safer deployment
- Clear rollback points
- Better collaboration

**Example phases:**
1. Database migration
2. Core service implementation
3. API endpoint
4. Frontend integration

---

### Blast Radius Analysis

Pre-change assessment of impact scope.

**Components:**
- Files affected
- APIs modified
- Schema changes
- Breaking changes
- Dependencies
- Rollback complexity

---

## Tool-Specific Terms

### Skills (Claude Code)

Auto-loaded rule sets based on context. Located in `.claude/skills/`.

**Built-in skills:**
- `core-spec` — Always loaded, 20 core rules
- `security` — Loaded for auth/crypto files
- `testing` — Loaded for test files

---

### Commands (Claude Code)

Structured workflow commands accessed via `/command`.

**Built-in commands:**
- `/review` — 6-dimension code review
- `/debug` — Structured debugging protocol
- `/plan` — Phased implementation planning

---

### System Prompt

Context provided to LLM at start of conversation defining behavior.

**Usage:**
- AGENTS.md for GPT-4/ChatGPT
- CLAUDE.md for Claude Code
- Pasted into Continue, Aider, etc.

---

### .cursorrules (Cursor)

Single file at project root defining rules for Cursor IDE.

**Alternative:** `.cursor/rules/*.mdc` for conditional rules

---

### .mdc Files (Cursor)

Cursor rule files with YAML frontmatter for conditional loading.

**Structure:**
```yaml
---
description: Rule description
globs: ["**/*.py"]
alwaysApply: false
---
```

---

### copilot-instructions.md

GitHub Copilot's configuration file.

**Location:** `.github/copilot-instructions.md`
**Limitation:** Only works in Copilot Chat, not inline completions

---

### CONVENTIONS.md (Aider)

Aider's native configuration file format.

**Alternative:** Use `AIDER.md` or `--system-prompt` flag

---

## Code Quality Terms

### YAGNI

You Aren't Gonna Need It. Principle of not implementing features until actually needed.

**Application:** No speculative utilities, no future-proofing, no premature abstraction

---

### Technical Debt

Code that works but has maintenance costs due to shortcuts or suboptimal design.

**Sources:**
- Speculative utilities never used
- Premature abstractions
- Hidden refactors
- TODO comments

---

### N+1 Query

Performance anti-pattern where N queries execute in a loop instead of 1 batch query.

**Example:**
```python
# Bad: N+1
for order in orders:
    print(order.user.name)  # Query per order

# Good: 1 query
orders = Order.objects.select_related('user').all()
```

---

### Unbounded Operation

Loop or recursion without limits on user-controlled data.

**Risk:** DoS via resource exhaustion
**Fix:** Add limits, pagination, timeouts

---

### Allowlist vs Denylist

**Allowlist:** Accept only known-good values (secure)
**Denylist:** Reject known-bad values (incomplete, bypassable)

**Rule:** Always use allowlists for validation

---

### Fail Secure vs Fail Safe

**Fail secure:** Default to most restrictive state on error
**Fail safe:** Default to safe/operational state

**Security:** Fail secure (default deny)
**Availability:** Fail safe (graceful degradation)

---

## Security Terms

### Trust Boundary

The point where untrusted data enters the system.

**Examples:**
- API endpoints
- File uploads
- User input forms
- External API responses

**Rule:** Validate at trust boundary with allowlists

---

### Injection Attack

Attack via untrusted data interpreted as code.

**Types:**
- SQL injection
- Command injection
- XSS (cross-site scripting)
- XXE (XML external entity)

**Prevention:** Parameterization, encoding, validation

---

### PII

Personally Identifiable Information. Data that can identify individuals.

**Examples:** Names, emails, SSNs, phone numbers, addresses
**Rule:** Never log PII; protect in storage and transit

---

### Secrets Management

Secure handling of credentials, API keys, tokens.

**Requirements:**
- Never hardcode
- Use environment variables or vaults
- Rotate regularly
- Audit access

---

## Testing Terms

### Happy Path

Default scenario where everything works correctly.

**Example:** Valid user input, database available, no exceptions
**Testing:** Verify expected output

---

### Edge Cases

Boundary conditions and unusual but valid inputs.

**Examples:**
- Empty input
- Maximum length
- Unicode characters
- Zero/nil values
- Very large numbers

---

### Error Paths

Scenarios where errors occur.

**Examples:**
- Invalid input
- Network failure
- Database unavailable
- Permission denied

---

### Regression Test

Test that verifies existing functionality still works after changes.

**Purpose:** Catches unintended side effects
**Requirement:** All must pass before delivery

---

### Failing Test First

TDD pattern: write test that fails (demonstrates bug), then fix code.

**Benefits:**
- Confirms understanding of bug
- Provides regression protection
- Defines "done"

---

## Development Terms

### Refactoring

Changing code structure without changing behavior.

**Rule:** Separate refactoring from feature work
**Anti-pattern:** Hidden refactor (AP3)

---

### Breaking Change

Modification that requires changes in dependent code.

**Examples:**
- API contract changes
- Database schema changes
- Function signature changes
- Behavior changes

**Requirement:** Breaking changes need migration path

---

### Backward Compatibility

New code works with old callers/data.

**Techniques:**
- Deprecation warnings
- Default parameters
- API versioning
- Gradual rollout

---

### Feature Flag

Runtime toggle for enabling/disabling features.

**Benefits:**
- Gradual rollout
- Easy rollback
- A/B testing
- Safe deployment

---

### Rollback Plan

Procedure to undo a change if issues occur.

**Components:**
- Steps to revert
- Data migration reversal
- Verification of rollback
- Communication plan

---

## LLM-Specific Terms

### Context Window

Amount of text LLM can consider at once.

**Sizes:**
- Claude: 200k tokens
- GPT-4: 128k tokens
- Copilot: ~4k (completion), ~32k (chat)
- Cursor: ~64k (Composer)

**Implication:** Long conversations may lose earlier context

---

### Temperature

LLM parameter controlling randomness/creativity.

**Values:**
- Low (0.0-0.3): Deterministic, focused
- Medium (0.4-0.7): Balanced
- High (0.8-1.0): Creative, random

**Coding:** Use low temperature for consistency

---

### System Prompt vs User Prompt

**System prompt:** Instructions defining behavior (spec)
**User prompt:** Specific task request

**Best practice:** Put rules in system prompt, tasks in user prompt

---

### Prompt Injection

Attack via malicious user input interpreted as instructions.

**Risk:** User input containing "ignore previous instructions"
**Mitigation:** Separate system/user prompts, input validation

---

### Token

Unit of text for LLM processing (word or subword piece).

**Context:**
- ~100 tokens = ~75 words (English)
- Pricing often per token
- Context windows measured in tokens

---

## Spec Variants

### Base Spec

Default rules suitable for most projects.

**Files:** `CLAUDE.md`, `AGENTS.md`, `COPILOT.md`, etc.
**Use:** General development

---

### Lean Startup

Relaxed rules for MVPs and rapid prototyping.

**Tradeoff:** Speed over thoroughness (except security)
**Use:** Pre-launch, experiments, spikes

---

### Enterprise

Enhanced rules for regulated environments.

**Additions:**
- Schema change protocols
- API versioning requirements
- Audit trails
- Four-eyes principle

**Use:** Finance, healthcare, compliance-heavy industries

---

### Security-Hardened

Strict rules for security-critical code.

**Additions:**
- Mandatory security blocks
- Input validation requirements
- Secrets management rules
- Security review gates

**Use:** Authentication, payments, sensitive data

---

### Test-First

TDD-enforcing rules for test-driven teams.

**Additions:**
- No implementation without tests
- Test coverage requirements
- Arrange-Act-Assert pattern

**Use:** TDD-mandated teams, high-coverage requirements

---

### Monorepo

Coordination rules for large multi-package repositories.

**Additions:**
- Package boundary discipline
- Cross-package change tracking
- Affected package identification

**Use:** Large repositories with multiple packages

---

## Acronyms

| Acronym | Meaning | Context |
|---------|---------|---------|
| **AI** | Artificial Intelligence | General |
| **API** | Application Programming Interface | Development |
| **CD** | Continuous Deployment | DevOps |
| **CI** | Continuous Integration | DevOps |
| **CLI** | Command Line Interface | Tools |
| **CRUD** | Create, Read, Update, Delete | API design |
| **DoS** | Denial of Service | Security |
| **HTTP** | HyperText Transfer Protocol | Web |
| **IDE** | Integrated Development Environment | Tools |
| **JWT** | JSON Web Token | Authentication |
| **LLM** | Large Language Model | AI context |
| **MVP** | Minimum Viable Product | Product |
| **ORM** | Object-Relational Mapping | Database |
| **PII** | Personally Identifiable Information | Security |
| **PII** | Public / Private / Internal (Go) | Go code |
| **PR** | Pull Request | Development |
| **RFC** | Request for Comments / Request For Comments | Standards |
| **SQL** | Structured Query Language | Database |
| **SSH** | Secure Shell | DevOps |
| **SSL/TLS** | Secure Sockets Layer / Transport Layer Security | Security |
| **TDD** | Test-Driven Development | Methodology |
| **TTL** | Time To Live | Caching |
| **UI** | User Interface | Frontend |
| **UX** | User Experience | Design |
| **XXE** | XML External Entity | Security |
| **YAGNI** | You Aren't Gonna Need It | Principle |

---

## See Also

- [Rules Reference](../rules-reference.md)
- [Anti-Patterns](../anti-patterns.md)
- [FAQ](../faq.md)
