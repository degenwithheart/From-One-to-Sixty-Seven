# Installation Guide: GitHub Copilot

Complete setup instructions for using From One to Sixty-Seven with GitHub Copilot.

---

## Prerequisites

- GitHub Copilot subscription (Individual or Business)
- VS Code, JetBrains IDE, Vim/Neovim, or Azure Data Studio
- GitHub account with Copilot access

---

## Quick Setup (2 minutes)

### Step 1: Copy Configuration File

```bash
# From the From One to Sixty-Seven repository
cp /path/to/From-One-to-Sixty-Seven/COPILOT.md /path/to/your/project/.github/copilot-instructions.md
```

### Step 2: Verify Installation

1. Open your project in VS Code or JetBrains
2. Open GitHub Copilot Chat (Cmd/Ctrl + Shift + I in VS Code)
3. Ask: "What rules are you following for this project?"

**Expected response:** Should reference From One to Sixty-Seven spec rules.

### Step 3: Test with Simple Task

```
Add a function to validate email addresses

# You should see:
# 1. Goal restatement
# 2. Assumption questions or declarations
# 3. Minimal implementation
# 4. SUMMARY block
```

---

## Detailed Setup

### Understanding copilot-instructions.md

GitHub Copilot reads `.github/copilot-instructions.md` when you open Copilot Chat. The file provides behavioral guidance for AI-generated responses.

**Location:** `.github/copilot-instructions.md` (must be exact filename)

**Limitations:**
- Only works in Copilot Chat (not inline completions)
- Copilot has smaller context window than Claude Code
- May drift from instructions over long conversations
- Keep instructions concise (< 100 lines ideal)

### File Structure

```
your-project/
├── .github/
│   ├── copilot-instructions.md    # Main behavioral contract
│   └── copilot-workspace.md       # Optional: Workspace-level instructions
├── src/
└── ...
```

### Installation Methods

#### Method 1: Direct Copy (Recommended)

```bash
# Create .github directory if needed
mkdir -p /path/to/your/project/.github

# Copy the main file
cp /path/to/From-One-to-Sixty-Seven/COPILOT.md \
   /path/to/your/project/.github/copilot-instructions.md
```

#### Method 2: Concatenate with Custom Rules

```bash
# Base spec + your custom rules
cat /path/to/From-One-to-Sixty-Seven/COPILOT.md > \
    /path/to/your/project/.github/copilot-instructions.md

echo "" >> /path/to/your/project/.github/copilot-instructions.md
echo "## Project-Specific Rules" >> \
    /path/to/your/project/.github/copilot-instructions.md

cat >> /path/to/your/project/.github/copilot-instructions.md << 'EOF'

- Use TypeScript strict mode
- All API calls must have error handling
- Prefer functional components in React
EOF
```

#### Method 3: Concise Version (For Context Limits)

```bash
# Extract just the essential rules
cat > /path/to/your/project/.github/copilot-instructions.md << 'EOF'
# From One to Sixty-Seven (Concise)

## Core Rules

1. **Restate First:** Always restate the goal before coding
2. **Ask Questions:** If ambiguous, present 2-3 interpretations and ask
3. **Minimal Changes:** Only change what's required. No hidden refactors
4. **Declare Assumptions:** List assumptions explicitly before proceeding
5. **Verify:** Confirm code compiles, tests pass, edge cases handled
6. **SUMMARY Block:** End with: What changed, Why, Verified, Assumptions, Risks

## Security

Never hardcode secrets, log sensitive data, or build SQL via concatenation.

## Code Quality

- Match existing style exactly
- No placeholder comments
- No speculative utilities
- Simple over clever
EOF
```

---

## IDE-Specific Setup

### VS Code

**Enable Copilot Chat:**
1. Install GitHub Copilot extension
2. Install GitHub Copilot Chat extension
3. Sign in with GitHub account

**Open Copilot Chat:**
- `Cmd/Ctrl + Shift + I` — Inline chat
- `Cmd/Ctrl + Shift + P` → "GitHub Copilot: Open Chat" — Panel chat

**Verify Instructions Loaded:**
```
> What behavioral rules are you following?

Should mention: restate goals, minimal changes, SUMMARY blocks
```

**Best Practices:**
- Use Panel Chat for complex tasks (more context)
- Use Inline Chat for quick questions
- Copilot Chat reads instructions; inline completions don't

### JetBrains (IntelliJ, PyCharm, etc.)

**Install Copilot Plugin:**
1. Settings → Plugins → Marketplace
2. Search "GitHub Copilot"
3. Install and restart

**Enable Copilot Chat:**
1. Tools → GitHub Copilot → Open Copilot Chat
2. Or use keyboard shortcut (configure in settings)

**Verify Instructions:**
- Copilot Chat should reference the spec
- May need to restart IDE after adding instructions file

### Vim/Neovim

**Using copilot.vim:**
```vim
" Instructions don't work with copilot.vim (completion only)
" Use CopilotChat.nvim for chat with instructions
```

**Using CopilotChat.nvim:**
```lua
-- Lua configuration
require('CopilotChat').setup({
  system_prompt = table.concat(
    vim.fn.readfile('.github/copilot-instructions.md'),
    '\n'
  )
})
```

---

## Stack Integration

Since Copilot has context limits, be selective about additional rules:

### Option 1: Append to Main File (Keep Under 100 Lines)

```bash
# Add only essential stack rules
cat >> /path/to/your/project/.github/copilot-instructions.md << 'EOF'

## Python-Specific Rules
- Use type hints on all function signatures
- Handle exceptions explicitly, no bare except
- Prefer pathlib over os.path
EOF
```

### Option 2: Reference External File

```bash
# In copilot-instructions.md, add:
echo "" >> /path/to/your/project/.github/copilot-instructions.md
echo "See stacks/python.md for language-specific rules" >> \
    /path/to/your/project/.github/copilot-instructions.md
```

Then manually provide stack context in prompts:
```
Task: Add function X
Stack: Python 3.11, FastAPI, SQLAlchemy
Follow Python rules: type hints, explicit exceptions, pathlib
```

### Option 3: Use PR Template for Post-Hoc Review

Since Copilot Chat may drift, use PR template to catch issues:
```bash
cp /path/to/From-One-to-Sixty-Seven/templates/PULL_REQUEST_TEMPLATE.md \
   /path/to/your/project/.github/PULL_REQUEST_TEMPLATE.md
```

---

## Variant Selection

### Concise Variants for Copilot

Copilot works better with shorter instructions. Consider these adaptations:

**Default (Full):**
- Use COPILOT.md as-is
- ~80 lines, should fit context

**Security-Hardened:**
```bash
# Add security section
cat >> /path/to/your/project/.github/copilot-instructions.md << 'EOF'

## Security (Mandatory for auth/crypto code)

SECURITY NOTE required when touching:
- Authentication, authorization
- Input validation
- Secret handling
- Database queries

Never:
- Hardcode secrets
- Log credentials
- Concatenate SQL
- Trust user input
EOF
```

**Enterprise:**
```bash
# Add enterprise section
cat >> /path/to/your/project/.github/copilot-instructions.md << 'EOF'

## Enterprise Compliance

- Schema changes need migration plan
- API changes need backward compatibility
- All changes need rollback plan
- Breaking changes need deprecation notice
EOF
```

---

## Verification Checklist

After setup, verify everything works:

- [ ] `.github/copilot-instructions.md` exists
- [ ] Copilot Chat recognizes the spec (ask "What rules?")
- [ ] Test produces goal restatement
- [ ] Test produces SUMMARY block
- [ ] Test asks questions for ambiguous requests

---

## Copilot-Specific Behaviors

### Copilot Chat vs Inline Completions

| Feature | Copilot Chat | Inline Completions |
|---------|--------------|-------------------|
| Reads instructions | ✅ Yes | ❌ No |
| Follows spec rules | ✅ Good | ⚠️ Limited |
| Asks questions | ✅ Can | ❌ No |
| SUMMARY blocks | ✅ Can | ❌ No |
| Best for | Complex tasks | Quick completions |

**Recommendation:**
- Use **Copilot Chat** for spec-aligned behavior
- Use **inline completions** only for low-risk, obvious code
- Always review inline-completed code before accepting

### Context Limit Considerations

Copilot has smaller context than Claude Code:
- Keep `copilot-instructions.md` under 100 lines
- Use concise variants
- Provide stack context in prompts, not in instructions
- Refresh context by starting new chat threads

### Drift Management

Copilot may drift from instructions over long conversations:

**Solutions:**
1. **New chat thread** every 5-10 exchanges
2. **Explicit reinforcement:**
   ```
   Reminder: Follow From One to Sixty-Seven spec.
   Rules: minimal change, no refactoring, SUMMARY block.
   ```
3. **Short requests:** Break work into small chunks

---

## Common Issues

### "Copilot isn't following the spec"

**Check:**
1. File location: Must be `.github/copilot-instructions.md`
2. File committed: Copilot may not see uncommitted files
3. Using Chat not completions: Instructions only work in Chat

**Fix:**
```bash
# Ensure file is committed
git add .github/copilot-instructions.md
git commit -m "Add Copilot instructions"

# Use Chat, not just inline completions
```

### "Changes are still too large"

**Cause:** Copilot Chat may over-deliver

**Fix:**
```markdown
Task: Fix the null check.

Constraints:
- Only fix the null check
- Do not refactor anything else
- Do not add comments except explaining the fix
- Minimal change only
```

### "SUMMARY blocks missing"

**Fix:**
```markdown
Task: Add email validation.

REQUIRED: End with SUMMARY block in this exact format:

SUMMARY:
- What changed:
- Why:
- Verified:
- Assumptions:
- Risks:
```

### "Not asking clarifying questions"

**Fix:**
```markdown
Task: Add rate limiting.

Before coding:
1. List 2-3 different approaches
2. Ask which to implement
3. Wait for my confirmation
```

---

## Best Practices

### 1. Keep Instructions Concise

```markdown
# Good: ~80 lines
- Core rules (restate, minimal, verify, SUMMARY)
- Security rules
- Project-specific basics

# Too long: 200+ lines
- Copilot may truncate or ignore
```

### 2. Use Chat for Important Tasks

For anything requiring spec compliance:
- Open Copilot Chat panel
- Provide full context
- Explicitly request spec rules

### 3. Use PR Template for Safety Net

Since Copilot may drift, use PR template to catch issues:
```bash
cp templates/PULL_REQUEST_TEMPLATE.md .github/
```

### 4. Combine with Human Review

Copilot + spec reduces issues, but doesn't eliminate them:
- Always review AI-generated code
- Use spec as guide for human review too
- Check PR template compliance

### 5. Start New Chats Frequently

After 5-10 exchanges, context drifts:
- Start new chat thread
- Re-state task and constraints
- Reference spec explicitly

---

## Integration with Workflow

### Pre-Commit

```bash
# Generate code with Copilot Chat
# Review manually
# Check against PR template
```

### PR Review

1. Copilot generates code
2. Human reviews using spec as guide
3. PR template catches compliance issues
4. Fix any issues found

### Debugging

```bash
# Copilot doesn't have /debug command
# Use manual structured approach:
```

```markdown
Debug this issue: [description]

Follow structured debugging:
1. Understand symptom
2. Hypothesize (list 2-3 causes)
3. Investigate (logs, code, data)
4. Reproduce (test case)
5. Fix (minimal change)
6. Verify (tests pass)

Report findings in this format.
```

---

## Alternative: Using AGENTS.md

If Copilot's context limits are too restrictive, use `AGENTS.md` as system prompt with other tools:

**Continue.dev:**
```json
// ~/.continue/config.json
{
  "models": [{
    "title": "GPT-4 with Spec",
    "provider": "openai",
    "model": "gpt-4",
    "systemMessage": "[paste AGENTS.md content]"
  }]
}
```

**CopilotChat.nvim:**
```lua
require('CopilotChat').setup({
  system_prompt = [AGENTS.md content]
})
```

---

## See Also

- [Getting Started](../getting-started.md)
- [Troubleshooting](../troubleshooting.md)
- [Examples](../examples.md)
- [VS Code Installation](./vscode.md)
- [JetBrains Installation](./jetbrains.md)
