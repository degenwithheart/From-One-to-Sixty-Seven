# Installation Guide: Aider

Complete setup for Aider — AI pair programming in your terminal using From One to Sixty-Seven.

---

## Prerequisites

- Python 3.8+ installed
- OpenAI API key or Anthropic API key
- Git repository initialized
- Terminal (iTerm2, Terminal.app, Windows Terminal, etc.)

---

## Quick Setup (5 minutes)

### Step 1: Install Aider

```bash
# Via pip
pip install aider-chat

# Via pipx (recommended, isolated environment)
pip install pipx
pipx install aider-chat

# Via Homebrew (macOS)
brew install aider
```

### Step 2: Configure API Keys

```bash
# OpenAI
export OPENAI_API_KEY=your-key-here

# Or Anthropic (Claude)
export ANTHROPIC_API_KEY=your-key-here

# Add to ~/.zshrc or ~/.bashrc for persistence
echo 'export ANTHROPIC_API_KEY=your-key-here' >> ~/.zshrc
```

### Step 3: Copy Configuration

```bash
# Option A: CONVENTIONS.md (Aider native)
cp /path/to/From-One-to-Sixty-Seven/AIDER.md ~/CONVENTIONS.md

# Option B: System prompt
cp /path/to/From-One-to-Sixty-Seven/AGENTS.md ~/.aider-system-prompt.md
```

### Step 4: Start Aider with Spec

```bash
# Using CONVENTIONS.md
cd /path/to/your/project
aider --conventions ~/CONVENTIONS.md

# Or with system prompt
aider --system-prompt ~/.aider-system-prompt.md

# With specific model
aider --model claude-3-5-sonnet-20241022 --conventions ~/CONVENTIONS.md
```

### Step 5: Verify

In Aider, ask:
```
What rules are you following?
```

Should reference From One to Sixty-Seven spec.

---

## Detailed Setup

### Understanding Aider

Aider is a terminal-based AI pair programming tool that:
- Edits files in your local git repository
- Uses git for all changes (automatic commits)
- Works with multiple AI models (GPT-4, Claude, etc.)
- Supports voice input, unit test integration, and more

**Key features:**
- `/add` — Add files to context
- `/drop` — Remove files from context
- `/commit` — Commit changes
- `/undo` — Undo last change
- `/test` — Run tests

### Configuration File Options

**Option 1: CONVENTIONS.md (Recommended)**

Aider natively supports `CONVENTIONS.md` in repo root:

```bash
# Copy to project
cp /path/to/From-One-to-Sixty-Seven/AIDER.md /path/to/your/project/CONVENTIONS.md

# Or home directory
cp /path/to/From-One-to-Sixty-Seven/AIDER.md ~/CONVENTIONS.md
```

**Pros:**
- Native Aider support
- Auto-loaded when present
- Project-specific or global

**Cons:**
- File must be named exactly `CONVENTIONS.md`
- Only one conventions file

**Option 2: System Prompt**

Use any file as system prompt:

```bash
aider --system-prompt ~/.aider-system-prompt.md
```

**Pros:**
- Can use AGENTS.md, CLAUDE.md, etc.
- Multiple prompts for different contexts

**Cons:**
- Must specify on command line
- Not auto-loaded

**Option 3: Aider Config File**

```yaml
# ~/.aider.conf.yml
model: claude-3-5-sonnet-20241022
conventions: ~/CONVENTIONS.md
auto-commits: false
dirty-commits: false
```

### Aider Configuration File

Create `~/.aider.conf.yml`:

```yaml
# Model
model: claude-3-5-sonnet-20241022

# Conventions (spec)
conventions: ~/CONVENTIONS.md

# Git behavior
auto-commits: false
dirty-commits: false

# Output
pretty: true
stream: true

# Voice (optional)
voice-language: en

# Linting (optional)
lint-cmd: "python -m flake8"
```

**Auto-commits vs Dirty-commits:**
- `auto-commits: true` — Commit every AI change
- `auto-commits: false` — You commit manually
- `dirty-commits: false` — Don't commit if repo is dirty

### Environment Variables

```bash
# Add to ~/.zshrc or ~/.bashrc

# API Keys
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...

# Default model
export AIDER_MODEL=claude-3-5-sonnet-20241022

# Default conventions
export AIDER_CONVENTIONS=~/CONVENTIONS.md

# Disable auto-commits
export AIDER_AUTO_COMMITS=false
```

---

## Using Aider with the Spec

### Basic Workflow

```bash
# 1. Enter project
cd ~/projects/myapp

# 2. Start aider with spec
aider --conventions ~/CONVENTIONS.md

# 3. Add relevant files
/add src/auth.py tests/test_auth.py

# 4. Request with context
> Add email validation to the signup function

# 5. Review AI output
# - Goal restatement?
# - Assumptions declared?
# - Minimal change?
# - SUMMARY block?

# 6. Accept or refine
/drop  # Clear context for next task

# 7. Exit
/exit
```

### Session Example

```bash
$ cd ~/projects/myapp
$ aider --conventions ~/CONVENTIONS.md --model claude-3-5-sonnet-20241022

Aider v0.50.0
Models: claude-3-5-sonnet-20241022 with diff edit format
Git repo: .git with 42 files
Repo-map: using 1024 tokens
Use /help to see in-chat commands, run with --help to see all other options

────────────────────────────────────────────────────────
> /add src/models/user.py src/api/auth.py tests/test_auth.py

Added src/models/user.py to the chat
Added src/api/auth.py to the chat
Added tests/test_auth.py to the chat

────────────────────────────────────────────────────────
> Add email validation to the signup endpoint

Goal restatement: Add email format validation to the user signup API endpoint 
that rejects malformed email addresses with a clear error response.

Assumptions:
- Email format follows RFC 5322
- Validation happens before database insertion
- Invalid emails return HTTP 400 with field-level error
- Existing valid signup flow remains unchanged

Please confirm these assumptions or provide corrections.

────────────────────────────────────────────────────────
> Yes, proceed

[AI makes minimal changes...]

SUMMARY:
- What changed: Added email validation to signup endpoint
  - Validates format using email-validator library
  - Returns 400 with field error for invalid emails
  - 47 lines changed in 2 files
- Why: User story required email format validation
- Verified: 3 new tests pass, existing tests unchanged
- Assumptions: RFC 5322 format, 400 response for invalid
- Risks: None — change is additive and localized

────────────────────────────────────────────────────────
> /commit

Commit e7f9d2a: Add email validation to signup endpoint

────────────────────────────────────────────────────────
> /exit
```

---

## Advanced Usage

### Model Selection

**Claude (Recommended for spec following):**
```bash
aider --model claude-3-5-sonnet-20241022
aider --model claude-3-opus-20240229  # More capable, expensive
```

**GPT-4:**
```bash
aider --model gpt-4
aider --model gpt-4-turbo
```

**Local models (via Ollama):**
```bash
aider --model ollama/llama2
```

### Multi-File Changes

```bash
# Add all relevant files
/add src/models/user.py src/api/auth.py src/services/email.py tests/test_auth.py

# Request complex change
> Implement password reset flow
> 
> Plan first: database migration, token service, email integration, API endpoints
```

### Voice Input

```bash
# Start with voice enabled
aider --voice --conventions ~/CONVENTIONS.md

# In session, press Ctrl+S to speak
```

### Test-Driven Development

```bash
# Add test file
/add tests/test_new_feature.py

# Request test first
> Write a test for the calculate_discount function
> It should test: normal case, edge case, error case

# After test passes, implement
/add src/calculator.py
> Implement calculate_discount to pass the test
```

### Git Integration

```bash
# See git status
/git status

# Commit manually
/commit

# Undo last AI change
/undo

# See diff
/diff

# Add all tracked files
/add .
```

---

## Stack Integration

### Python Projects

```bash
# Append Python stack rules
cat /path/to/From-One-to-Sixty-Seven/stacks/python.md >> ~/CONVENTIONS.md

# Use Python-specific settings
aider --lint-cmd "python -m flake8" --test-cmd "python -m pytest"
```

### JavaScript/TypeScript Projects

```bash
cat /path/to/From-One-to-Sixty-Seven/stacks/typescript.md >> ~/CONVENTIONS.md

aider --lint-cmd "npx eslint" --test-cmd "npm test"
```

### Go Projects

```bash
cat /path/to/From-One-to-Sixty-Seven/stacks/go.md >> ~/CONVENTIONS.md

aider --lint-cmd "go vet" --test-cmd "go test"
```

---

## Variant Selection

### Enterprise

```bash
# Use ENTERPRISE variant
cat /path/to/From-One-to-Sixty-Seven/variants/ENTERPRISE.md > ~/CONVENTIONS.md

# Add to project
aider --conventions ~/CONVENTIONS.md
```

### Security-Hardened

```bash
cat /path/to/From-One-to-Sixty-Seven/variants/SECURITY_HARDENED.md > ~/CONVENTIONS.md
```

### Lean Startup

```bash
cat /path/to/From-One-to-Sixty-Seven/variants/LEAN_STARTUP.md > ~/CONVENTIONS.md
```

---

## Best Practices

### 1. Always Use Conventions

```bash
# Good
aider --conventions ~/CONVENTIONS.md

# Bad (no spec)
aider
```

### 2. Add Relevant Files

```bash
# Good — only files that matter
/add src/auth.py tests/test_auth.py

# Bad — entire repo
/add .
```

### 3. Claude Over GPT-4

Claude follows instructions better:
```bash
aider --model claude-3-5-sonnet-20241022
```

### 4. Disable Auto-Commits for Review

```bash
aider --auto-commits false

# Manually review and commit
/commit
```

### 5. Use /undo Liberally

If AI goes off track:
```
/undo
```

### 6. Reset Context Between Tasks

```
/drop
```

### 7. Keep Sessions Focused

One major task per session. Start fresh for new tasks.

---

## Common Issues

### "Spec not being followed"

**Check:**
- Conventions file loaded: `cat ~/CONVENTIONS.md | head -5`
- Correct path in command
- File is readable

**Debug:**
```bash
# Check if file is read
aider --conventions ~/CONVENTIONS.md --verbose

# Ask explicitly
> What rules are you following?
```

### "Changes are too large"

**Fix:**
```
> Implement this in minimal steps.
> Don't refactor anything else.
> Only change what's required.
```

### "Token limit exceeded"

**Fix:**
```bash
# Use smaller context
/drop  # Clear added files
/add only-essential-file.py  # Add just what you need

# Or use concise conventions
cat /path/to/From-One-to-Sixty-Seven/AGENTS.md | head -50 > ~/CONVENTIONS-concise.md
aider --conventions ~/CONVENTIONS-concise.md
```

### "Not asking clarifying questions"

**Fix:**
```
> Before coding, list 2-3 different approaches and ask which to take.
```

---

## Integration with Workflow

### Daily Development

```bash
# Morning — start aider
aider --conventions ~/CONVENTIONS.md --model claude-3-5-sonnet-20241022

# Add files for today's work
/add src/feature.py tests/test_feature.py

# Work on features
> Implement user authentication

# Review AI output
# Check for spec compliance

# Commit and exit
/commit
/exit
```

### PR Review Workflow

```bash
# Aider generates code with spec
# Human reviews in GitHub
# PR template catches issues
# Merge
```

### Debugging

```bash
# Add relevant files
/add src/buggy.py tests/test_buggy.py logs/error.log

# Use debug approach
> Debug this issue following structured protocol:
> 1. Understand symptom
> 2. Hypothesize (2-3 causes)
> 3. Investigate
> 4. Reproduce
> 5. Fix
> 6. Verify
```

---

## Scripts and Aliases

### Shell Alias

```bash
# ~/.zshrc or ~/.bashrc

# Aider with spec
alias aider-spec='aider --conventions ~/CONVENTIONS.md --model claude-3-5-sonnet-20241022 --auto-commits false'

# Aider for specific stacks
alias aider-py='aider --conventions ~/CONVENTIONS.md --lint-cmd "python -m flake8" --test-cmd "python -m pytest"'
alias aider-js='aider --conventions ~/CONVENTIONS.md --lint-cmd "npx eslint" --test-cmd "npm test"'
```

### Project-Specific Script

```bash
#!/bin/bash
# ~/bin/aider-project

cd ~/projects/myapp || exit 1

aider \
  --conventions ~/CONVENTIONS.md \
  --model claude-3-5-sonnet-20241022 \
  --auto-commits false \
  --dirty-commits false \
  --lint-cmd "python -m flake8" \
  --test-cmd "python -m pytest" \
  "$@"
```

---

## Verification Checklist

- [ ] Aider installed (`aider --version`)
- [ ] API key configured (`echo $ANTHROPIC_API_KEY`)
- [ ] CONVENTIONS.md exists (`cat ~/CONVENTIONS.md`)
- [ ] Aider loads conventions (`aider --verbose`)
- [ ] Test produces goal restatement
- [ ] Test produces SUMMARY block

---

## See Also

- [Getting Started](../getting-started.md)
- [Troubleshooting](../troubleshooting.md)
- [Neovim Installation](./neovim.md)
- [Aider Documentation](https://aider.chat/)
