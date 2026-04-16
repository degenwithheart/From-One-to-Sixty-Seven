# Troubleshooting Guide

Complete problem-solving reference for common spec implementation issues.

---

## Quick Diagnostic Table

| Symptom | Likely Cause | Solution Section |
|---------|-------------|------------------|
| "LLM isn't following the spec" | File location/name wrong | [Setup Issues](#setup-issues) |
| "Changes are still too large" | Context drift or insufficient reinforcement | [Scope Control](#scope-control-issues) |
| "Not asking clarifying questions" | Ambiguity not detected or prompt too directive | [Question Generation](#question-generation-issues) |
| "SUMMARY blocks missing" | Not reinforced as mandatory | [SUMMARY Block Issues](#summary-block-issues) |
| "Context drift over long sessions" | Natural LLM behavior | [Session Management](#session-management) |
| "Spec slowing down simple tasks" | Over-application | [Speed vs Safety](#speed-vs-safety-tradeoffs) |
| "Anti-patterns still appearing" | Incomplete spec adoption | [Anti-Pattern Persistence](#anti-pattern-persistence) |
| "Team members ignoring spec" | Lack of enforcement or understanding | [Adoption Issues](#adoption-issues) |

---

## Setup Issues

### "The LLM isn't following the spec at all"

**Symptoms:**
- Assistant doesn't restate goals
- Makes immediate code changes
- No assumption declarations
- No SUMMARY blocks
- Changes are large and unfocused

**Root Causes & Solutions:**

#### Cause 1: Wrong File Location

**Claude Code:**
```bash
# WRONG
~/projects/myapp/docs/CLAUDE.md
~/CLAUDE.md  # Home directory, not project

# CORRECT
~/projects/myapp/CLAUDE.md  # Repository root
```

**Cursor:**
```bash
# Option A: .cursorrules at root
~/projects/myapp/.cursorrules

# Option B: .cursor/rules/ directory
~/projects/myapp/.cursor/rules/core.mdc
~/projects/myapp/.cursor/rules/security.mdc
```

**GitHub Copilot:**
```bash
# WRONG
.github/copilot.md
.github/instructions.md

# CORRECT
.github/copilot-instructions.md
```

**Verification:**
```bash
# Check file exists in correct location
ls -la CLAUDE.md  # Should show in project root
ls -la .cursorrules  # For Cursor
ls -la .github/copilot-instructions.md  # For Copilot
```

#### Cause 2: Wrong Filename

**Case-sensitive filesystems (Linux, macOS):**
```bash
# WRONG
claude.md
Claude.md
CLAUDE.MD

# CORRECT
CLAUDE.md  # Exactly this
```

#### Cause 3: File Not Loaded (Claude Code)

**Solution:**
```bash
# Refresh plugins
claude /plugins refresh

# Or restart Claude Code
exit
claude  # Re-enter project directory
```

**Verify loaded:**
```
> What rules are you following for this project?

I am following the From One to Sixty-Seven behavioral contract, which includes:
- Restating goals before coding
- Minimal surgical changes only
- Declaring assumptions explicitly
- Providing SUMMARY blocks
- Verification checklists
```

#### Cause 4: File Permissions

```bash
# Check permissions
ls -l CLAUDE.md

# Should be readable (644 or similar)
# Fix if needed:
chmod 644 CLAUDE.md
```

#### Cause 5: Git Ignore Issues

```bash
# Check if file is ignored
git check-ignore CLAUDE.md

# If ignored, add to .gitignore with exception:
# .gitignore:
CLAUDE.local.md  # Ignore local overrides
!CLAUDE.md       # But keep main file
```

---

## Scope Control Issues

### "Changes are still too large"

**Symptoms:**
- Assistant refactors unrelated code
- Adds new abstractions not requested
- "Improves" existing code while fixing bugs
- Diffs are hundreds of lines for simple tasks

**Root Causes & Solutions:**

#### Cause 1: Context Drift

**Problem:** Over a long session, the LLM forgets constraints.

**Solution - Session Refresh:**
```markdown
Reminder: From One to Sixty-Seven spec is active for this session.

Rules still in force:
- Minimal changes only
- No hidden refactors
- Declare assumptions
- Verify before finishing
- End with SUMMARY

Current task: [restate current task]
Constraints: [restate constraints]
```

**Prevention:**
- Refresh every 10-15 turns
- Keep sessions focused (1 task per session)
- Start fresh sessions for new tasks

#### Cause 2: Insufficient Constraint Reinforcement

**Problem:** Request didn't explicitly state constraints.

**Solution - Add to every request:**
```markdown
Task: [description]

Constraints:
- Minimal change only
- No refactoring of unrelated code
- No new abstractions
- Match existing style exactly
- End with SUMMARY block
```

#### Cause 3: LLM Interpretation of "Improve"

**Problem:** LLM thinks it's being helpful by improving code.

**Solution - Explicit prohibition:**
```markdown
Task: Fix the null check on line 42.

IMPORTANT: Do NOT:
- Refactor any other code
- Rename variables
- Reorganize imports
- Add comments except to explain the fix
- Change formatting

Only fix the null check. Nothing else.
```

#### Cause 4: Spec Not Comprehensive

**Problem:** Base spec covers general principles but not specific boundaries.

**Solution - Add project-specific rules to CLAUDE.md:**
```markdown
## Project-Specific Constraints

For this codebase:
- Never modify files in `src/legacy/` unless explicitly asked
- Don't add dependencies without checking package.json first
- Keep functions under 50 lines
- Use existing error handling patterns from src/utils/errors.py
```

---

## Question Generation Issues

### "Not asking clarifying questions"

**Symptoms:**
- Assistant silently picks interpretation
- No ambiguity detection
- Proceeds with assumptions unstated
- "I'll assume you mean..." without asking

**Root Causes & Solutions:**

#### Cause 1: Prompt Too Directive

**Problem:**
```markdown
❌ BAD:
Add rate limiting to the API using Redis.

# LLM assumes:
- Redis is available
- Rate limit is per IP
- Limit is 100 requests/minute
- Returns 429 on exceed
```

**Solution - Open-ended request:**
```markdown
✅ GOOD:
We need rate limiting for the API.

Please:
1. Identify what needs clarification before implementing
2. Present 2-3 design options with tradeoffs
3. Ask which approach to take

Don't write code yet — let's design first.
```

#### Cause 2: Ambiguity Not Detected

**Problem:** LLM doesn't recognize ambiguous requirements.

**Solution - Force ambiguity detection:**
```markdown
Task: Update the user profile endpoint.

Before coding, list:
1. All ambiguous terms in this request
2. Multiple interpretations possible
3. Which interpretation you're choosing (and why)
4. What questions you have
```

#### Cause 3: Pattern Matching Over Understanding

**Problem:** LLM recognizes "update endpoint" pattern and applies standard solution.

**Solution - Break the pattern:**
```markdown
Task: Update the user profile endpoint.

This is NOT a standard CRUD update. Consider:
- Which fields are allowed to change?
- Are there approval workflows?
- Do we need audit logging?
- Are there validation rules from external systems?

List all assumptions you're making, then ask which are correct.
```

---

## SUMMARY Block Issues

### "SUMMARY blocks not appearing"

**Symptoms:**
- Assistant finishes without SUMMARY
- Partial SUMMARY (missing fields)
- SUMMARY in wrong format
- "Summary:" instead of "SUMMARY:"

**Root Causes & Solutions:**

#### Cause 1: Not Reinforced as Mandatory

**Solution - Add to request:**
```markdown
Task: [description]

REQUIRED: End your response with a complete SUMMARY block:

SUMMARY:
- What changed:
- Why:
- Verified:
- Assumptions:
- Risks:

Do not omit any field.
```

#### Cause 2: Task Considered "Trivial"

**Problem:** LLM thinks small changes don't need SUMMARY.

**Solution - Explicit requirement:**
```markdown
Even for this small change, provide a complete SUMMARY block.
The SUMMARY is mandatory for all changes, regardless of size.
```

#### Cause 3: Wrong Format

**Problem:**
```markdown
❌ BAD:
Summary:
I fixed the bug.

❌ BAD:
SUMMARY
What changed: Fixed bug
Why: It was broken

✅ CORRECT:
SUMMARY:
- What changed: Fixed null pointer in login function
- Why: User reported crashes on empty email field
- Verified: Tested with null, empty, and valid email
- Assumptions: Email field can be null (schema allows it)
- Risks: None - change is defensive only
```

**Solution - Provide template:**
```markdown
Use this exact format:

SUMMARY:
- What changed: [specific change]
- Why: [business/technical reason]
- Verified: [how you confirmed it works]
- Assumptions: [what you assumed]
- Risks: [what could go wrong]
```

#### Cause 4: Context Window Pressure

**Problem:** Long conversation, LLM cuts off SUMMARY to save tokens.

**Solution - Request SUMMARY first:**
```markdown
Before showing me the code, provide your SUMMARY block.
Then show the code changes.
```

Or use session refresh to clear context.

---

## Session Management

### "Context drift over long sessions"

**Symptoms:**
- Early constraints forgotten
- Style inconsistencies emerge
- Spec rules gradually ignored
- Changes get larger as session progresses

**Solutions:**

#### Solution 1: Session Refresh Prompt

Use every 10-15 turns:
```markdown
Session refresh — From One to Sixty-Seven spec is still active.

Remember:
- Think before coding
- Minimal changes only
- No hidden refactors
- Declare assumptions
- Verify before finishing
- End with SUMMARY

Current task: [restate]
Constraints: [restate]
```

#### Solution 2: Task Segmentation

Break work into separate sessions:
```markdown
Session 1: Design and planning
Session 2: Phase 1 implementation
Session 3: Phase 2 implementation
Session 4: Review and testing
```

#### Solution 3: Constraint Re-statement

Before every significant request:
```markdown
Task: [description]

Following From One to Sixty-Seven:
- Minimal change only
- No refactoring
- Match existing style
- Declare assumptions
- Verify and SUMMARY
```

#### Solution 4: Use /plan Command

For complex tasks, structured planning reduces drift:
```markdown
/plan "implement feature X"
# Review plan
# Implement phase by phase
# Use /review after each phase
```

---

## Speed vs Safety Tradeoffs

### "Spec slowing down simple tasks"

**Symptoms:**
- Long reasoning for one-line changes
- Excessive questions for obvious tasks
- SUMMARY blocks for trivial fixes
- Session feels bureaucratic

**Solutions:**

#### Solution 1: Short Mode

Use minimal spec for trivial tasks:
```markdown
Engineering spec active. Short mode.
Task: Fix typo in variable name.
Rules: minimal change only, match style.
```

#### Solution 2: Use Lean Startup Variant

For pre-launch/MVP work:
```bash
cp variants/LEAN_STARTUP.md CLAUDE.md
```

This variant relaxes non-critical rules while keeping security constraints.

#### Solution 3: Bypass Rules Explicitly

When you want speed over rigor:
```markdown
Task: Fix typo.

Override: For this trivial change, skip:
- Goal restatement
- Assumption declaration
- Detailed SUMMARY (one line is fine)

Just fix it.
```

#### Solution 4: Template Shortcuts

Use abbreviated session kickoff:
```markdown
Spec: From One to Sixty-Seven (short)
Stack: Python
Task: [brief]
Go.
```

---

## Anti-Pattern Persistence

### "Anti-patterns still appearing despite spec"

**Common persistent anti-patterns:**

#### AP1: Silent Interpretation Still Happening

**Symptom:** LLM picks interpretation without asking.

**Solution - Force explicit choice:**
```markdown
Task: Update the caching behavior.

Before proceeding, you MUST:
1. Identify at least 2 different interpretations of "update caching"
2. List pros/cons of each
3. State which you'd choose and why
4. Ask me to confirm or choose differently

Do not proceed until I confirm the interpretation.
```

#### AP2: Unnecessary Abstractions

**Symptom:** Factory classes for single functions.

**Solution - Add to spec:**
```markdown
## Anti-Abstraction Rule

For this codebase:
- No factory classes
- No builder patterns for simple objects
- No registries with single entries
- If it can be a function, make it a function
- If a senior engineer would ask "why is this complicated?" — simplify it
```

#### AP3: Hidden Refactors

**Symptom:** Unrelated code changed alongside requested changes.

**Solution - Pre-commit check:**
```markdown
Before finalizing, check your diff:
- Are all changed lines related to the task?
- Did you modify any files not mentioned?
- Did you rename any variables?
- Did you reorganize imports?

If yes to any, REVERT those changes. Only keep task-related changes.
```

#### AP4: Speculative Utilities

**Symptom:** "You might need these later" functions.

**Solution - YAGNI enforcement:**
```markdown
## YAGNI Principle

Do not implement:
- Functions for hypothetical future use
- Abstractions for single use cases
- Configuration options not requested
- "Extensible" designs without concrete extension need

If it's not needed for THIS task, don't add it.
```

---

## Adoption Issues

### "Team members ignoring spec"

**Symptoms:**
- Some team members don't use spec
- Inconsistent code quality across team
- PRs from some members lack SUMMARY blocks
- "This takes too long" objections

**Solutions:**

#### Solution 1: Mandatory Enforcement

**Git hook to check PR template:**
```bash
# .github/hooks/pre-commit
if ! grep -q "SUMMARY:" "$1"; then
    echo "ERROR: Missing SUMMARY block. See From One to Sixty-Seven spec."
    exit 1
fi
```

#### Solution 2: CI/CD Integration

Add spec compliance check to CI:
```yaml
# .github/workflows/spec-compliance.yml
- name: Check SUMMARY blocks
  run: |
    for file in $(git diff --name-only HEAD~1); do
      if [[ $file == *.py ]]; then
        # Check if AI-generated and missing SUMMARY
        # Add your check logic
      fi
    done
```

#### Solution 3: Education

- Share [Getting Started](./getting-started.md)
- Demonstrate time saved from fewer bugs
- Show before/after diffs
- Calculate bug reduction metrics

#### Solution 4: Gradual Rollout

Start with subset of rules:
```markdown
Phase 1 (Weeks 1-2): Only SUMMARY blocks required
Phase 2 (Weeks 3-4): Add assumption declaration
Phase 3 (Weeks 5-6): Add minimal change enforcement
Phase 4 (Weeks 7+): Full spec compliance
```

#### Solution 5: Lead by Example

Ensure senior team members consistently use spec. Junior members follow leadership.

---

## Tool-Specific Issues

### Claude Code Issues

#### Skills Not Loading
```bash
# Check skills directory structure
ls -la .claude/skills/
# Should see: core-spec/, security/, testing/

# Check skill files
ls -la .claude/skills/core-spec/
# Should see: SKILL.md

# Refresh
claude /plugins refresh
```

#### Commands Not Recognized
```bash
# Check commands exist
ls -la .claude/commands/
# Should see: review.md, debug.md, plan.md

# Try explicit path
claude /.claude/commands/review.md
```

### Cursor Issues

#### Rules Not Applied
```bash
# Check .cursorrules exists
ls -la .cursorrules

# OR check .cursor/rules/
ls -la .cursor/rules/
# Should see: core.mdc, security.mdc, testing.mdc

# Check frontmatter in .mdc files
head -5 .cursor/rules/core.mdc
# Should show: ---, description:, globs:, alwaysApply:, ---
```

#### Composer vs Chat
- `.cursorrules` applies to Composer
- Chat uses different context — restate spec in chat

### GitHub Copilot Issues

#### Instructions Not Read
```bash
# Check correct filename
ls -la .github/copilot-instructions.md

# Check it's committed
git ls-files | grep copilot-instructions

# Copilot has context limits — keep instructions concise
wc -l .github/copilot-instructions.md
# Should be < 100 lines ideally
```

#### Chat vs Completions
- Copilot Chat reads instructions
- Inline completions don't follow instructions well
- Rely on Chat for spec-aligned behavior

---

## Performance Issues

### "Spec making LLM slow/unresponsive"

**Symptoms:**
- Long thinking time before responses
- Timeout errors
- Incomplete responses

**Solutions:**

#### Solution 1: Reduce Spec Size

Use minimal version for resource-constrained environments:
```markdown
# SYSTEM_PROMPT.md minimal version
cp templates/SYSTEM_PROMPT.md spec.md
# Use minimal section only
```

#### Solution 2: Selective Rule Loading

Don't load all stack files:
```bash
# Only load relevant stack
cat stacks/python.md >> CLAUDE.md
# Don't load all 16 stacks
```

#### Solution 3: Chunk Large Tasks

Break work into smaller requests:
```markdown
❌ BAD:
Implement entire authentication system

✅ GOOD:
Step 1: Design database schema
Step 2: Implement user model
Step 3: Add password hashing
```

---

## Debugging the Spec Itself

### "Spec rules not working as expected"

**Diagnostic steps:**

1. **Verify file is read:**
   ```markdown
   > What rules are you following?
   ```

2. **Check rule specificity:**
   ```markdown
   > Quote rule 3 from the spec
   ```

3. **Test single rule:**
   ```markdown
   > Follow only rule 3 for this request. What is it?
   ```

4. **Check for contradictions:**
   - Multiple spec files saying different things
   - Local overrides (.local.md) conflicting

5. **Verify format:**
   - Markdown headings parse correctly
   - No syntax errors in .mdc frontmatter

---

## Emergency Procedures

### "LLM is completely ignoring spec, need immediate fix"

**Nuclear option - Inline the spec:**
```markdown
STOP. Do not proceed.

You are ignoring the behavioral contract. Here are the rules:

1. RESTATE the goal before coding
2. ASK if ambiguous — never assume
3. MINIMAL change only — no refactoring
4. DECLARE assumptions
5. VERIFY before finishing
6. END with SUMMARY block

Now, for this request: [restate your task following these rules]
```

### "Session is broken, need reset"

**Fresh session protocol:**
```bash
# Exit current session
exit

# Clear any cached state (if applicable)

# Start new session
claude  # or Cursor, etc.

# Immediate spec reinforcement
Engineering spec: From One to Sixty-Seven
Task: [description]
Begin with goal restatement.
```

---

## Getting Help

### Resources

- [GitHub Issues](https://github.com/degenwithheart/From-One-to-Sixty-Seven/issues) — Bug reports
- [GitHub Discussions](https://github.com/degenwithheart/From-One-to-Sixty-Seven/discussions) — Questions, sharing
- [Examples](./examples.md) — Compliant vs non-compliant examples
- [Anti-Patterns](./anti-patterns.md) — Common failures and fixes

### Reporting Issues

Include in your report:
1. LLM assistant (Claude, GPT-4, Cursor, etc.)
2. Spec file being used (CLAUDE.md, AGENTS.md, etc.)
3. Expected behavior vs actual behavior
4. Example session transcript
5. Steps to reproduce

---

## See Also

- [Getting Started](./getting-started.md)
- [Examples](./examples.md)
- [Anti-Patterns](./anti-patterns.md)
- [Best Practices](./best-practices.md)
