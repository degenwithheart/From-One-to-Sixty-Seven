# Getting Started with From One to Sixty-Seven

Complete onboarding guide for implementing the behavioral contract in your project.

---

## Quick Start (5 Minutes)

### Step 1: Choose Your LLM Assistant

| If you use... | Copy this file |
|---------------|----------------|
| Claude Code | `CLAUDE.md` |
| Cursor | `CURSOR.md` (or `.cursorrules`) |
| GitHub Copilot | `COPILOT.md` |
| ChatGPT / GPT-4 | `AGENTS.md` |
| Gemini | `GEMINI.md` |
| Aider | `AIDER.md` |
| VS Code with Continue | `AGENTS.md` + `plugins/vscode/continue-config.json` |

### Step 2: Install the Spec

```bash
# Clone the repository
git clone https://github.com/degenwithheart/From-One-to-Sixty-Seven.git

# Copy your LLM file to your project
cp From-One-to-Sixty-Seven/CLAUDE.md /path/to/your/project/

# Copy Claude skills (if using Claude Code)
cp -r From-One-to-Sixty-Seven/.claude /path/to/your/project/

# Copy Cursor rules (if using Cursor)
cp -r From-One-to-Sixty-Seven/.cursor /path/to/your/project/
```

### Step 3: Verify Installation

Start a new session with your AI assistant and ask:

> "What rules are you following for this project?"

**Expected response:** The assistant should reference the spec rules (e.g., "restating goals before coding," "minimal changes only," "verification checklists").

If the assistant doesn't mention the spec, check:
- File is in the correct location
- File is named correctly (case-sensitive)
- For Claude Code: Try `/plugins refresh` or restart Claude Code
- For Cursor: Check `.cursorrules` is at root or `.cursor/rules/` exists

---

## First Session Walkthrough

### Scenario: Adding a Feature

**Your request:** "Add email validation to the signup form"

**What you should see:**

1. **Goal Restatement**
   > "I need to add email validation to the signup form. Before I proceed, I want to confirm: should this reject invalid formats, or just check for presence? And what should the error message say?"

2. **Assumption Declaration** (if proceeding without clarification)
   > ```
   > ASSUMPTIONS:
   > - Email format validation should follow RFC 5322
   > - Error message should be user-friendly
   > - Existing validation logic should not be modified
   > ```

3. **Minimal Implementation**
   - Only the email validation function
   - No refactoring of unrelated code
   - No new abstractions

4. **Verification**
   > ```
   > I've added the validation. To verify:
   > - [ ] Test with valid email: user@example.com
   > - [ ] Test with invalid email: user@ (should fail)
   > - [ ] Test with empty email: "" (should fail)
   > - [ ] Check existing tests still pass
   > ```

5. **SUMMARY Block**
   > ```
   > SUMMARY:
   > - What changed: Added email validation function `validate_email()` to signup form
   > - Why: User story required email format validation
   > - Verified: 3 test cases pass, existing tests unchanged
   > - Assumptions: RFC 5322 format, user-friendly error messages
   > - Risks: None - change is additive and localized
   > ```

**What you should NOT see:**
- Immediate code changes without questions
- Refactoring of unrelated files
- New helper classes or utilities
- Missing verification step

---

## Stack Selection Guide

If your project uses specific technologies, append the relevant stack file:

| Project Type | Stack File | Why |
|--------------|------------|-----|
| Python backend | `stacks/python.md` | Type hints, async, error handling |
| TypeScript/React | `stacks/typescript.md` | Strict mode, React rules |
| Go microservices | `stacks/go.md` | Error handling, goroutines |
| Rust CLI | `stacks/rust.md` | Ownership, lifetimes |
| Java Spring | `stacks/java.md` | Spring Boot, null safety |
| Multi-stack monorepo | All relevant + `variants/MONOREPO.md` | Cross-stack coordination |

### How to Append Stack Rules

```bash
# Append Python rules to CLAUDE.md
cat From-One-to-Sixty-Seven/stacks/python.md >> your-project/CLAUDE.md

# Or keep separate and reference in session kickoff
cp From-One-to-Sixty-Seven/stacks/python.md your-project/STACK.md
```

---

## Variant Selection Guide

Choose an environment variant if your project has specific constraints:

### Default (Base Spec)
Use: `CLAUDE.md` or `AGENTS.md` directly
When: Most projects, general development

### Lean Startup
Use: `variants/LEAN_STARTUP.md`
When: Pre-launch, MVPs, rapid prototyping
Tradeoff: Speed over thoroughness (except security)

### Enterprise
Use: `variants/ENTERPRISE.md`
When: Regulated industries, finance, healthcare
Requirements: Schema change protocols, API versioning, audit trails

### Security-Hardened
Use: `variants/SECURITY_HARDENED.md`
When: Auth systems, payment processing, sensitive data
Requirements: Mandatory security review blocks, input validation, secrets management

### Test-First
Use: `variants/TEST_FIRST.md`
When: TDD teams, high coverage requirements
Requirements: No implementation without tests, Arrange-Act-Assert pattern

### Monorepo
Use: `variants/MONOREPO.md`
When: Large repos with multiple packages/teams
Requirements: Package boundary discipline, affected package tracking

### How to Apply Variants

```bash
# Replace base spec with variant
cp From-One-to-Sixty-Seven/variants/ENTERPRISE.md your-project/CLAUDE.md

# Or append variant on top of base
cat From-One-to-Sixty-Seven/variants/ENTERPRISE.md >> your-project/CLAUDE.md
```

---

## IDE Integration Setup

### VS Code

1. Install recommended extensions:
   ```bash
   cp From-One-to-Sixty-Seven/plugins/vscode/.vscode/extensions.json your-project/.vscode/
   ```

2. Copy settings:
   ```bash
   cp From-One-to-Sixty-Seven/plugins/vscode/.vscode/settings.json your-project/.vscode/
   ```

3. Install Continue plugin and copy config:
   ```bash
   cp From-One-to-Sixty-Seven/plugins/vscode/continue-config.json ~/.continue/config.json
   ```

### JetBrains (IntelliJ, PyCharm, etc.)

1. Import live templates:
   - Open Settings → Editor → Live Templates
   - Import `From-One-to-Sixty-Seven/plugins/jetbrains/live-templates.xml`
   - Templates available: `spec-sum`, `spec-ass`, `spec-sec`, `spec-plan`, `spec-review`

### Neovim

1. Copy configuration examples:
   ```bash
   cp -r From-One-to-Sixty-Seven/plugins/neovim/README.md your-project/
   ```

2. Follow plugin-specific setup for:
   - copilot.lua
   - CopilotChat.nvim
   - avante.nvim
   - codecompanion.nvim

### Cursor

Already covered in Step 2 (`.cursor/rules/`). Cursor reads `.cursorrules` or `.cursor/rules/*.mdc` automatically.

---

## Verification Checklist

After setup, verify the spec is active:

- [ ] LLM assistant restates goals before coding
- [ ] LLM asks clarifying questions when ambiguous
- [ ] Changes are minimal (no unrelated refactoring)
- [ ] Assumptions are declared explicitly
- [ ] SUMMARY block appears at end of non-trivial changes
- [ ] Verification checklist is presented
- [ ] No "TODO" or placeholder comments in generated code

If any check fails, see [Troubleshooting](./troubleshooting.md).

---

## Session Templates

Use these templates to start sessions correctly:

### Full Project Context
```markdown
Engineering spec active: From One to Sixty-Seven
Stack: [Python 3.12 / FastAPI / PostgreSQL]
Variant: [base / enterprise / security-hardened]
Task: [describe task]
Constraints: [list constraints]

Relevant files:
- src/auth/login.py
- tests/test_auth.py
```

### Quick Session
```markdown
Spec: From One to Sixty-Seven
Stack: [TypeScript/React]
Task: [brief task]
Rules: restate, minimal change, verify, SUMMARY
```

### Refresh (after 15+ turns)
```markdown
Reminder: From One to Sixty-Seven spec is active.
Rules still apply: minimal change, no hidden refactors, verify, SUMMARY.
Current task: [restate current task]
```

---

## Next Steps

1. **Learn the Commands**: See [Command Reference](./commands/)
2. **Deep Dive Your Stack**: See [Stack-Specific Guides](./stacks/)
3. **Solve Problems**: See [Troubleshooting](./troubleshooting.md)
4. **Understand Rules**: See [Rules Reference](./rules-reference.md)
5. **Best Practices**: See [Best Practices](./best-practices.md)

---

## Common First-Time Issues

### "The LLM isn't following the spec"

**Cause:** File not loaded, wrong location, or wrong filename

**Fix:**
- Claude Code: File must be named `CLAUDE.md` at repo root
- Cursor: File must be `.cursorrules` at root OR `.cursor/rules/*.mdc`
- Copilot: File must be `.github/copilot-instructions.md`
- AGENTS.md works for GPT-4, OpenCode as system prompt

### "The LLM is still over-engineering"

**Cause:** Context drift or insufficient reinforcement

**Fix:**
- Use session refresh prompt every 10-15 turns
- Explicitly state "minimal change only" at start
- Reference specific anti-patterns from `docs/anti-patterns.md`

### "SUMMARY blocks aren't appearing"

**Cause:** LLM doesn't understand the requirement is mandatory

**Fix:**
- Add "End with SUMMARY block" to your task description
- Use `spec-sum` live template (JetBrains) or copy SUMMARY format
- Reference Rule 20 in CLAUDE.md

---

## Support

- Issues: [GitHub Issues](https://github.com/degenwithheart/From-One-to-Sixty-Seven/issues)
- Discussions: [GitHub Discussions](https://github.com/degenwithheart/From-One-to-Sixty-Seven/discussions)
- Contributing: See [CONTRIBUTING.md](../CONTRIBUTING.md)
