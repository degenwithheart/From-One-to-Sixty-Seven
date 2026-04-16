# Best Practices

Real-world patterns and workflows for using From One to Sixty-Seven effectively.

---

## Session Management

### Start Sessions Right

**Full Context Session:**
```markdown
Engineering spec active: From One to Sixty-Seven
Stack: [Python 3.12 / FastAPI / PostgreSQL]
Variant: [base / enterprise / security-hardened]

Task: [clear description]

Constraints:
- Must maintain backward compatibility
- No new dependencies without approval
- Must include tests

Relevant files:
- src/auth/login.py
- src/models/user.py
- tests/test_auth.py
```

**Quick Session:**
```markdown
Spec: From One to Sixty-Seven
Stack: TypeScript/React
Task: [brief description]
Go.
```

### End Sessions Cleanly

**Always end with:**
1. Verification checklist completed
2. SUMMARY block delivered
3. Commit made (if applicable)
4. Context cleared (`/drop` in Claude Code/aider)

### Session Length

**Ideal:** 5-15 exchanges
**Maximum:** 20 exchanges (drift starts)
**Action:** Refresh or restart after 15 exchanges

### Session Refresh

Use every 10-15 turns:
```markdown
Reminder: From One to Sixty-Seven spec is active.

Rules still in force:
- Think before coding
- Minimal changes only
- No hidden refactors
- Declare assumptions
- Verify before finishing
- End with SUMMARY

Current task: [restate current task]
Constraints: [restate constraints]
```

---

## Task Sizing

### Break Down Large Tasks

**Too large:**
```markdown
❌ "Implement user authentication system"
```

**Appropriately sized:**
```markdown
✅ Phase 1: "Create database migration for users table"
✅ Phase 2: "Implement password hashing service"
✅ Phase 3: "Add login API endpoint"
✅ Phase 4: "Add session management"
```

### Use /plan for Complex Work

```bash
claude /plan "implement user authentication"

# Review plan
# Confirm phases
# Execute phase by phase
# /review after each phase
```

### Task Complexity Guidelines

| Complexity | Lines of Change | Files | Duration |
|------------|----------------|-------|----------|
| **Simple** | < 50 lines | 1-2 | < 30 min |
| **Medium** | 50-200 lines | 2-4 | 30-60 min |
| **Complex** | 200-500 lines | 4-8 | 1-2 hours |
| **Very Complex** | > 500 lines | 8+ | Use /plan |

---

## Constraint Enforcement

### Always Include Constraints

**Every request should specify:**
```markdown
Task: [description]

Constraints:
- Minimal change only
- No refactoring of unrelated code
- No new abstractions
- Match existing style
- End with SUMMARY
```

### Constraint Templates

**Bug fix:**
```markdown
Task: Fix the null check on line 42.

IMPORTANT: Do NOT:
- Refactor any other code
- Rename variables
- Reorganize imports
- Add comments except explaining the fix
- Change formatting

Only fix the null check. Nothing else.
```

**Feature:**
```markdown
Task: Add email validation to signup.

Constraints:
- Minimal implementation
- Reuse existing validation patterns
- Add tests for: valid, invalid, empty, None
- No new dependencies
```

**Refactor:**
```markdown
Task: Rename User.email to User.email_address.

Constraints:
- Update all references in codebase
- Maintain backward compatibility (alias property)
- Update tests
- Update documentation
- Migration path for existing data
```

---

## Verification Workflows

### Standard Verification Checklist

```markdown
Verification:
- [ ] Code compiles without errors/warnings
- [ ] Unit tests pass (new and existing)
- [ ] Integration tests pass
- [ ] Manual test confirms expected behavior
- [ ] Edge cases handled
- [ ] Error paths return safe results
- [ ] No placeholder comments
- [ ] SUMMARY block complete
```

### Before/After Testing

**Bug fixes:**
```markdown
1. Write failing test that demonstrates bug
2. Confirm test fails with current code
3. Fix the bug
4. Confirm test passes
5. Check existing tests still pass
```

**Features:**
```markdown
1. Define expected behavior
2. Write test for expected behavior
3. Implement feature
4. Confirm test passes
5. Add edge case tests
6. Verify all tests pass
```

### Automated Verification

**Git hooks:**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run tests
if ! python -m pytest -x; then
    echo "Tests failed. Commit aborted."
    exit 1
fi

# Check for SUMMARY in AI-generated files
# (custom logic for your workflow)
```

**CI/CD:**
```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: pytest

- name: Check formatting
  run: black --check .

- name: Lint
  run: flake8
```

---

## Multi-File Changes

### Coordinate Changes

**Identify all affected files:**
```markdown
Blast radius for "add email field":
- src/models/user.py (add field)
- src/schemas/user.py (add to schema)
- src/api/users.py (include in response)
- src/forms/signup.py (add validation)
- tests/test_models.py (update fixtures)
- tests/test_api.py (update assertions)
- docs/api.md (update API docs)
```

### Dependency Order

**Change order matters:**
```markdown
1. Database migration first
2. Model changes second
3. API changes third
4. Frontend changes last

Never deploy partial changes.
```

### Cross-File Consistency

**Checklist:**
- [ ] All imports updated
- [ ] All references updated
- [ ] Tests cover all changed files
- [ ] Documentation updated
- [ ] API contracts maintained

---

## Code Review Patterns

### Self-Review Before Submitting

```markdown
Before submitting, I reviewed:
- [ ] Goal matches request
- [ ] No unrelated changes
- [ ] Style matches codebase
- [ ] Tests included
- [ ] Assumptions declared
- [ ] SUMMARY complete
- [ ] No TODOs or placeholders
```

### Review AI-Generated Code

**Human reviewer checklist:**
```markdown
- [ ] AI followed spec rules
- [ ] Goal correctly interpreted
- [ ] Changes are minimal
- [ ] No hidden refactors
- [ ] Security considerations addressed
- [ ] Tests adequate
- [ ] SUMMARY accurate
```

### Using /review Command

```bash
# Before committing
claude /review src/modified-file.py

# Address issues found
# Then commit
```

---

## Team Coordination

### Shared Configuration

**Commit to version control:**
```bash
git add CLAUDE.md .claude/ .cursor/
git commit -m "Add shared From One to Sixty-Seven spec"
```

**Team onboarding:**
1. New dev clones repo
2. Spec already present
3. Dev follows installation guide
4. Pair with experienced dev first session

### Gradual Rollout

**Phase 1 (Week 1):** SUMMARY blocks only
```markdown
Focus: Everyone ends tasks with SUMMARY block
```

**Phase 2 (Week 2):** Add assumption declaration
```markdown
Focus: Declare assumptions for ambiguous tasks
```

**Phase 3 (Week 3):** Add minimal change enforcement
```markdown
Focus: Review diffs for hidden refactors
```

**Phase 4 (Week 4+):** Full spec compliance
```markdown
Focus: All rules, all the time
```

### Enforcement Options

**Option 1: Education (Recommended)**
- Demonstrate value
- Share examples
- Peer learning

**Option 2: PR Template**
```markdown
## AI Assistance Checklist
- [ ] AI restated goal before coding
- [ ] Assumptions declared (if ambiguous)
- [ ] Changes are minimal
- [ ] SUMMARY block present
```

**Option 3: Git Hooks**
```bash
# Check for SUMMARY in AI files
# (Implementation depends on how you track AI usage)
```

---

## Anti-Pattern Prevention

### Preventing Silent Assumptions

**Always:**
```markdown
Before coding, I'll present 2-3 interpretations of [ambiguous term].
Which did you mean?
```

### Preventing Over-Engineering

**Add to spec:**
```markdown
## Over-Engineering Prevention

Before adding any abstraction, answer:
1. Is this needed for the current task?
2. Would a senior engineer ask "why is this complicated?"
3. Can it be a simple function instead?

If yes to any, simplify.
```

### Preventing Hidden Refactors

**Explicit prohibition:**
```markdown
Do NOT refactor unrelated code. 
If you notice something to improve, note it separately.
I'll handle it in a dedicated refactor PR.
```

### Preventing Context Drift

**Session refresh:**
```markdown
# After 10 exchanges
Reminder: Spec rules still apply.
Current focus: [restate]
```

**New session:**
```markdown
# After 15 exchanges
Let me start a fresh session for clarity.

Spec: From One to Sixty-Seven
Task: [current subtask]
```

---

## Tool-Specific Patterns

### Claude Code Best Practices

1. **Use skills:** Let auto-loading work for you
2. **Use commands:** `/plan`, `/review`, `/debug` for structure
3. **Clear context:** `/drop` between unrelated tasks
4. **Use files:** Add relevant files, drop when done

### Cursor Best Practices

1. **Use .cursorrules for simple projects**
2. **Use .cursor/rules/*.mdc for complex projects**
3. **Prefer Composer Chat over inline completions**
4. **Keep rules concise** (context limits)

### Copilot Best Practices

1. **Use Copilot Chat, not just completions**
2. **Keep instructions concise**
3. **Start new chat threads frequently**
4. **Use PR template as safety net**

### Aider Best Practices

1. **Always use --conventions**
2. **Use Claude model for best instruction following**
3. **Disable auto-commits for review**
4. **Add only relevant files**

---

## Documentation Patterns

### Keeping Spec Documentation Updated

**When to update:**
- New team member joins
- New project started
- Spec version updated
- Custom rules added

**Where to document:**
- Project README (link to spec)
- Team wiki
- Onboarding docs

### Custom Rule Documentation

```markdown
## Project-Specific Additions

### Added: [date]
- Custom skill for API layer rules
- Reason: Maintain architecture boundaries

### Modified: [date]
- Relaxed test requirements for spike work
- Reason: Rapid prototyping phase
```

---

## Performance Optimization

### Speed vs Safety Tradeoffs

**Fast mode (spikes/MVPs):**
```markdown
Spec: From One to Sixty-Seven (short mode)
Task: [description]
Override: Skip detailed SUMMARY for trivial changes.
```

**Safe mode (production):**
```markdown
Full spec compliance required.
All 20 rules apply.
Verification mandatory.
```

### Context Management

**When context limited:**
1. Use concise spec version
2. Focus on essential rules only
3. Provide stack context in prompts
4. Start fresh sessions frequently

**Concise spec:**
```markdown
Core Rules:
1. Restate goal
2. Minimal change
3. Declare assumptions
4. Verify
5. SUMMARY
```

---

## Measurement and Improvement

### Tracking Spec Effectiveness

**Metrics to track:**
- Bugs introduced by AI changes
- Review time for AI-generated PRs
- Rollback rate of AI changes
- Team satisfaction with AI output

**Feedback loop:**
1. Note when spec prevents issue
2. Note when spec doesn't catch issue
3. Adjust spec accordingly
4. Share learnings with team

### Continuous Improvement

**Monthly review:**
- What's working?
- What's not working?
- What rules are often violated?
- What custom rules should be added?

**Quarterly spec update:**
- Pull latest From One to Sixty-Seven
- Update project configs
- Train team on changes

---

## Common Workflows

### Bug Fix Workflow

```markdown
1. User reports bug
2. Clarify and reproduce
3. /debug or structured debugging
4. Identify root cause
5. Write failing test
6. Fix minimally
7. Verify test passes
8. SUMMARY block
9. Commit
```

### Feature Workflow

```markdown
1. Request feature
2. Clarify requirements
3. /plan for complex features
4. Implement phase by phase
5. /review after each phase
6. Verify all tests pass
7. SUMMARY block
8. Commit
```

### Refactor Workflow

```markdown
1. Identify refactor need
2. /plan for large refactors
3. Isolate from feature work
4. Execute with minimal other changes
5. Comprehensive test verification
6. SUMMARY block
7. Commit separately from features
```

---

## See Also

- [Getting Started](./getting-started.md)
- [Examples](./examples.md)
- [Troubleshooting](./troubleshooting.md)
- [Migration Guide](./migration.md)
