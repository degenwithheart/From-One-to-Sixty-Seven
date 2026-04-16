# Installation Guide: Claude Code

Complete setup instructions for using From One to Sixty-Seven with Claude Code.

---

## Prerequisites

- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- A project repository (git initialized)
- Node.js 18+ (for Claude Code)

---

## Quick Setup (3 minutes)

### Step 1: Copy Configuration Files

```bash
# From the From One to Sixty-Seven repository
cp CLAUDE.md /path/to/your/project/
cp -r .claude /path/to/your/project/
```

### Step 2: Verify Installation

```bash
cd /path/to/your/project
claude

# In Claude Code, ask:
> What rules are you following for this project?

# Expected response:
# "I am following the From One to Sixty-Seven behavioral contract,
#  which includes: restating goals before coding, minimal changes,
#  assumption declaration, verification checklists, and SUMMARY blocks."
```

### Step 3: Test with a Simple Task

```
> Add a function to calculate the area of a circle

# You should see:
# 1. Goal restatement
# 2. Assumption declaration (e.g., "assuming radius is in meters")
# 3. Minimal implementation
# 4. Verification suggestion
# 5. SUMMARY block
```

---

## Detailed Setup

### Understanding the File Structure

```
your-project/
├── CLAUDE.md              # Main behavioral contract (REQUIRED)
├── .claude/
│   ├── skills/
│   │   ├── core-spec/
│   │   │   └── SKILL.md   # Core rules (auto-loaded)
│   │   ├── security/
│   │   │   └── SKILL.md   # Security rules (auto-loaded for auth/crypto files)
│   │   └── testing/
│   │       └── SKILL.md   # Testing rules (auto-loaded for test files)
│   └── commands/
│       ├── review.md      # /review command
│       ├── debug.md       # /debug command
│       └── plan.md        # /plan command
└── your-code...
```

### CLAUDE.md (Required)

This is the main behavioral contract. Claude Code reads this file automatically when you enter a project directory.

**Location:** Repository root (`./CLAUDE.md`)

**Verification:**
```bash
# Check file exists
ls -la CLAUDE.md

# Check it's readable
cat CLAUDE.md | head -20
```

### Skills (Optional but Recommended)

Skills are automatically loaded based on context:

| Skill | Activated When | Purpose |
|-------|---------------|---------|
| `core-spec` | Always | All 20 core rules |
| `security` | Files in `**/auth/**`, `**/crypto/**`, etc. | Security-hardened rules |
| `testing` | Files matching `**/*.test.*`, `**/tests/**` | Test-first rules |

**Installation:**
```bash
cp -r /path/to/From-One-to-Sixty-Seven/.claude/skills .claude/
```

**Verification:**
```bash
# Check skills loaded
claude /plugins list

# Should show:
# - core-spec
# - security
# - testing
```

### Commands (Optional but Powerful)

Commands provide structured workflows:

| Command | Purpose | Usage |
|---------|---------|-------|
| `/review` | Code review across 6 dimensions | `/review src/file.py` |
| `/debug` | Structured debugging protocol | `/debug "login fails"` |
| `/plan` | Phased implementation planning | `/plan "add auth"` |

**Installation:**
```bash
cp -r /path/to/From-One-to-Sixty-Seven/.claude/commands .claude/
```

**Verification:**
```bash
# List available commands
claude /commands list

# Test a command
claude /review
```

---

## Stack Integration

If your project uses specific technologies, append stack rules:

### Python Project
```bash
cat /path/to/From-One-to-Sixty-Seven/stacks/python.md >> CLAUDE.md
```

### TypeScript/React Project
```bash
cat /path/to/From-One-to-Sixty-Seven/stacks/typescript.md >> CLAUDE.md
```

### Go Project
```bash
cat /path/to/From-One-to-Sixty-Seven/stacks/go.md >> CLAUDE.md
```

### Multi-Stack Project
```bash
# Append all relevant stacks
cat /path/to/From-One-to-Sixty-Seven/stacks/python.md >> CLAUDE.md
cat /path/to/From-One-to-Sixty-Seven/stacks/typescript.md >> CLAUDE.md
```

---

## Variant Selection

Choose an environment variant if needed:

### Enterprise
```bash
cp /path/to/From-One-to-Sixty-Seven/variants/ENTERPRISE.md CLAUDE.md
# Or append to base:
cat /path/to/From-One-to-Sixty-Seven/variants/ENTERPRISE.md >> CLAUDE.md
```

### Security-Hardened
```bash
cp /path/to/From-One-to-Sixty-Seven/variants/SECURITY_HARDENED.md CLAUDE.md
```

### Test-First
```bash
cp /path/to/From-One-to-Sixty-Seven/variants/TEST_FIRST.md CLAUDE.md
```

### Lean Startup
```bash
cp /path/to/From-One-to-Sixty-Seven/variants/LEAN_STARTUP.md CLAUDE.md
```

### Monorepo
```bash
cp /path/to/From-One-to-Sixty-Seven/variants/MONOREPO.md CLAUDE.md
```

---

## Verification Checklist

After setup, verify everything works:

- [ ] `CLAUDE.md` exists in project root
- [ ] `.claude/skills/` directory exists (optional)
- [ ] `.claude/commands/` directory exists (optional)
- [ ] Claude Code recognizes the spec (ask "What rules are you following?")
- [ ] Test command produces goal restatement
- [ ] Test command produces assumption declaration
- [ ] Test command produces SUMMARY block
- [ ] `/review` command works (if installed)
- [ ] `/debug` command works (if installed)
- [ ] `/plan` command works (if installed)

---

## Session Templates

### Starting a Session

```markdown
Engineering spec active: From One to Sixty-Seven
Stack: [Python 3.12 / FastAPI / PostgreSQL]
Variant: [base / enterprise / security-hardened]

Task: [clear description]

Constraints:
- Must maintain backward compatibility
- No new dependencies without approval
- Must include tests
```

### Refreshing a Long Session

```markdown
Session refresh — From One to Sixty-Seven spec is active.

Remember:
- Think before coding
- Minimal changes only
- No hidden refactors
- Declare assumptions
- Verify before finishing
- End with SUMMARY

Current task: [restate]
```

### Quick Task

```markdown
Spec: From One to Sixty-Seven
Task: [brief description]
Go.
```

---

## Common Issues

### "Claude Code isn't reading CLAUDE.md"

**Check:**
1. File is in current directory (where you run `claude`)
2. File is named exactly `CLAUDE.md` (case-sensitive)
3. File is readable (`chmod 644 CLAUDE.md`)

**Fix:**
```bash
# Ensure you're in the right directory
pwd
ls CLAUDE.md

# If not found, copy it
cp /path/to/From-One-to-Sixty-Seven/CLAUDE.md .

# Refresh
claude /plugins refresh
```

### "Skills aren't loading"

**Check skills directory:**
```bash
ls -la .claude/skills/
# Should see: core-spec/, security/, testing/

ls -la .claude/skills/core-spec/
# Should see: SKILL.md
```

**Fix:**
```bash
# Re-copy skills
cp -r /path/to/From-One-to-Sixty-Seven/.claude/skills .claude/
claude /plugins refresh
```

### "Commands aren't recognized"

**Check commands directory:**
```bash
ls -la .claude/commands/
# Should see: review.md, debug.md, plan.md
```

**Fix:**
```bash
cp -r /path/to/From-One-to-Sixty-Seven/.claude/commands .claude/
```

### "Changes are still too large"

**Causes:**
- Context drift over long sessions
- Insufficient constraint reinforcement

**Solutions:**
1. Use session refresh prompt every 10-15 turns
2. Add explicit constraints to every request
3. Use `/plan` for complex tasks

See [Troubleshooting](../troubleshooting.md) for full details.

---

## Advanced Configuration

### Custom Skills

Create project-specific skills:

```bash
mkdir -p .claude/skills/my-project/
cat > .claude/skills/my-project/SKILL.md << 'EOF'
---
name: my-project
description: Project-specific rules for our codebase
---

# My Project Rules

## Architecture
- All API routes go in src/api/
- All business logic goes in src/services/
- All database access goes in src/repositories/
- Never call database from API layer directly

## Naming Conventions
- Use snake_case for Python
- Use PascalCase for classes
- Prefix private functions with underscore

## Testing
- Every service must have unit tests
- Every API endpoint must have integration tests
- Use pytest fixtures for database setup
EOF
```

### Local Overrides

Create personal overrides (not committed):

```bash
# CLAUDE.local.md (add to .gitignore)
cat > CLAUDE.local.md << 'EOF'
## Personal Preferences

I prefer:
- More verbose explanations for complex changes
- Type hints on all functions
- Docstrings in Google style
EOF
```

---

## Best Practices

### 1. Keep CLAUDE.md at Root

Claude Code looks for `CLAUDE.md` in the current directory. Don't put it in subdirectories.

### 2. Commit to Version Control

```bash
git add CLAUDE.md .claude/
git commit -m "Add From One to Sixty-Seven behavioral contract"
```

### 3. Use Skills for Modularity

Don't put everything in `CLAUDE.md`. Use skills for:
- Security rules (loaded for auth files)
- Testing rules (loaded for test files)
- Project-specific rules

### 4. Refresh Long Sessions

After 10-15 conversation turns, the LLM may drift from the spec. Use session refresh prompts.

### 5. Use Commands for Structure

For complex work, use:
- `/plan` before starting
- `/review` during implementation
- `/debug` when issues arise

---

## Integration with Development Workflow

### Pre-Commit

```bash
# Review your changes before committing
claude /review src/modified-file.py

# Address any issues found
```

### Code Review

```bash
# Generate initial review comments
claude /review src/new-feature.py

# Human reviewer adds context and approves
```

### Debugging

```bash
# Structured debugging session
claude /debug "error message or symptom"

# Follow the 6-step protocol
```

### Planning

```bash
# Create implementation plan
claude /plan "implement user authentication"

# Review plan, answer questions
# Implement phase by phase
```

---

## See Also

- [Getting Started](../getting-started.md)
- [Troubleshooting](../troubleshooting.md)
- [Review Command](../commands/review.md)
- [Debug Command](../commands/debug.md)
- [Plan Command](../commands/plan.md)
