# Installation Guide: VS Code

Complete setup instructions for using From One to Sixty-Seven with VS Code.

---

## Prerequisites

- VS Code installed
- One or more AI assistant extensions:
  - GitHub Copilot + Copilot Chat
  - Continue.dev
  - Codeium
  - Tabnine
- Project repository

---

## Quick Setup (5 minutes)

### Step 1: Install AI Assistant Extension

Choose your assistant:

**GitHub Copilot:**
1. Extensions → Search "GitHub Copilot"
2. Install "GitHub Copilot" and "GitHub Copilot Chat"
3. Sign in with GitHub

**Continue.dev:**
1. Extensions → Search "Continue"
2. Install "Continue"
3. Configure with your API keys (OpenAI, Anthropic, etc.)

**Codeium:**
1. Extensions → Search "Codeium"
2. Install "Codeium: AI Coding Autocomplete"
3. Sign up at codeium.com

### Step 2: Copy Configuration

**For GitHub Copilot:**
```bash
mkdir -p /path/to/your/project/.github
cp /path/to/From-One-to-Sixty-Seven/COPILOT.md \
   /path/to/your/project/.github/copilot-instructions.md
```

**For Continue.dev:**
```bash
# Copy the system prompt file
cp /path/to/From-One-to-Sixty-Seven/AGENTS.md \
   ~/.continue/system-prompt.md
```

**For Codeium/Tabnine:**
```bash
# Copy as reference — you'll paste into extension settings
cp /path/to/From-One-to-Sixty-Seven/CODEIUM.md \
   /path/to/your/project/CODEIUM.md
```

### Step 3: VS Code Settings

```bash
# Copy recommended settings
cp /path/to/From-One-to-Sixty-Seven/plugins/vscode/.vscode/settings.json \
   /path/to/your/project/.vscode/settings.json

# Copy recommended extensions
cp /path/to/From-One-to-Sixty-Seven/plugins/vscode/.vscode/extensions.json \
   /path/to/your/project/.vscode/extensions.json
```

### Step 4: Verify

1. Open VS Code in your project
2. Open AI assistant chat (varies by extension)
3. Ask: "What rules are you following?"
4. Should reference From One to Sixty-Seven

---

## Detailed Setup by Extension

### GitHub Copilot

**Configuration file:**
```
project/
├── .github/
│   └── copilot-instructions.md  # Copilot reads this
└── .vscode/
    └── settings.json            # VS Code settings
```

**Setup steps:**
1. Copy `COPILOT.md` to `.github/copilot-instructions.md`
2. Restart VS Code
3. Open Copilot Chat (Ctrl/Cmd + Shift + I)
4. Test with a simple request

**Best practices:**
- Use Copilot Chat panel, not just inline completions
- Chat reads instructions; inline completions don't
- Start new chat threads frequently (drift happens)
- Keep instructions concise (Copilot has context limits)

**Copilot-specific settings:**
```json
{
  "github.copilot.editor.enableAutoCompletions": false,
  "github.copilot.enable": {
    "*": false,
    "plaintext": false,
    "markdown": false,
    "python": true,
    "typescript": true
  }
}
```

### Continue.dev

**What is Continue?** An open-source AI code assistant that works with multiple providers (OpenAI, Anthropic, Ollama, etc.).

**Configuration files:**
```
~/.continue/
├── config.json          # Main configuration
├── system-prompt.md     # Behavioral rules
└── config.py            # Optional Python config

project/
└── .vscode/
    └── settings.json    # VS Code integration
```

**Setup steps:**

1. **Install Continue extension**

2. **Copy system prompt:**
   ```bash
   cp /path/to/From-One-to-Sixty-Seven/AGENTS.md ~/.continue/system-prompt.md
   ```

3. **Configure Continue:**
   ```bash
   cat > ~/.continue/config.json << 'EOF'
   {
     "models": [
       {
         "title": "Claude with Spec",
         "provider": "anthropic",
         "model": "claude-3-sonnet-20240229",
         "systemMessage": "{{SYSTEM_PROMPT}}"
       },
       {
         "title": "GPT-4 with Spec", 
         "provider": "openai",
         "model": "gpt-4",
         "systemMessage": "{{SYSTEM_PROMPT}}"
       }
     ],
     "customCommands": [
       {
         "name": "review",
         "prompt": "Perform a comprehensive code review: check correctness, security, performance, style, tests, and docs. Output in REVIEW format with top 3 action items.",
         "description": "Review code for issues"
       },
       {
         "name": "debug",
         "prompt": "Debug this issue following structured protocol: understand symptom, hypothesize (2-3 causes), investigate, reproduce, fix minimally, verify.",
         "description": "Structured debugging"
       },
       {
         "name": "plan",
         "prompt": "Create implementation plan: restate goal, identify constraints, analyze blast radius, declare assumptions, break into phases with verification criteria.",
         "description": "Create implementation plan"
       }
     ]
   }
   EOF
   ```

4. **Add VS Code settings:**
   ```json
   {
     "continue.enableTabAutocomplete": false,
     "continue.telemetryEnabled": false
   }
   ```

**Continue-specific commands:**
- `Ctrl/Cmd + L` — Open Continue panel
- `Ctrl/Cmd + Shift + L` — Inline edit
- Type `/` for slash commands

### Codeium

**What is Codeium?** Free AI code completion and chat for 70+ languages/IDEs.

**Setup:**
1. Install Codeium extension
2. Sign up at codeium.com
3. Extension uses Codeium's models (not configurable)
4. Copy spec as reference for manual prompting

**Using the spec with Codeium:**
```bash
# Copy reference file
cp /path/to/From-One-to-Sixty-Seven/CODEIUM.md /path/to/your/project/
```

**Manual approach:**
```markdown
# In Codeium Chat, paste at start of session:

ENGINEERING SPEC ACTIVE:
1. Restate goal before coding
2. Minimal changes only  
3. Declare assumptions
4. Verify before finishing
5. End with SUMMARY block

Task: [your task]
```

### Tabnine

**What is Tabnine?** AI code completion with privacy focus, local model option.

**Setup:**
1. Install Tabnine extension
2. Sign in with Tabnine account
3. Configure in extension settings

**Using the spec:**
```bash
# Copy as reference
cp /path/to/From-One-to-Sixty-Seven/TABNINE.md /path/to/your/project/
```

Tabnine doesn't support system prompts well. Use manual approach similar to Codeium.

---

## VS Code Settings

### Recommended Settings.json

```json
{
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll": false
  },
  "github.copilot.editor.enableAutoCompletions": false,
  "continue.enableTabAutocomplete": false,
  "workbench.editor.enablePreview": false,
  "editor.minimap.enabled": false,
  "editor.renderWhitespace": "boundary",
  "editor.rulers": [80, 120],
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "git.enableSmartCommit": false,
  "git.confirmSync": true,
  "terminal.integrated.enablePersistentSessions": false
}
```

**Why these settings:**
- `formatOnSave: false` — Prevents auto-formatting that hides real diffs
- `enableAutoCompletions: false` — Prevents aggressive AI completion
- `enablePreview: false` — Files open in permanent tabs

### Recommended Extensions.json

```json
{
  "recommendations": [
    "github.copilot",
    "github.copilot-chat",
    "continue.continue",
    "codeium.codeium",
    "tabnine.tabnine-vscode",
    "eamodio.gitlens",
    "donjayamanne.githistory",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-vscode.vscode-typescript-next"
  ],
  "unwantedRecommendations": [
    "hookyqr.beautify",
    "dbaeumer.jshint"
  ]
}
```

---

## Stack Integration

### Python Projects

```bash
# Append Python rules to your assistant's spec
cat /path/to/From-One-to-Sixty-Seven/stacks/python.md >> \
    /path/to/your/project/.github/copilot-instructions.md
```

**Add VS Code Python settings:**
```json
{
  "python.analysis.typeCheckingMode": "strict",
  "python.analysis.autoImportCompletions": true,
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": false,
  "[python]": {
    "editor.formatOnSave": false
  }
}
```

### TypeScript/JavaScript Projects

```bash
cat /path/to/From-One-to-Sixty-Seven/stacks/typescript.md >> \
    /path/to/your/project/.github/copilot-instructions.md
```

**Add VS Code TypeScript settings:**
```json
{
  "typescript.preferences.strict": true,
  "typescript.suggest.autoImports": true,
  "javascript.preferences.strict": true,
  "editor.formatOnSave": false
}
```

---

## Keybindings

### Recommended Keybindings.json

```json
[
  {
    "key": "ctrl+shift+a",
    "command": "github.copilot.generate",
    "when": "editorTextFocus"
  },
  {
    "key": "ctrl+shift+r",
    "command": "continue.focusContinueInput",
    "when": "editorTextFocus"
  },
  {
    "key": "ctrl+shift+d",
    "command": "workbench.view.debug"
  },
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.terminal.focus"
  }
]
```

---

## Using Multiple Assistants

You can use multiple AI assistants in the same project:

```
project/
├── .github/
│   └── copilot-instructions.md      # For Copilot
├── .vscode/
│   └── settings.json                  # For VS Code + Continue
└── AGENTS.md                          # For manual/paste use
```

**Workflow:**
1. Use **Copilot Chat** for quick questions
2. Use **Continue** for complex tasks with full spec
3. Use **Claude Code** (terminal) for multi-file changes

---

## Verification

After setup, verify everything works:

- [ ] AI assistant extension installed and active
- [ ] Configuration file in correct location
- [ ] Assistant recognizes the spec (ask "What rules?")
- [ ] Test produces goal restatement
- [ ] Test produces SUMMARY block
- [ ] VS Code settings applied (check settings.json)

---

## Common Issues

### "Copilot not reading instructions"

**Check:**
- File is at `.github/copilot-instructions.md`
- File is committed to git
- Using Copilot Chat, not just inline completions

**Fix:**
```bash
# Ensure committed
git add .github/copilot-instructions.md
git commit -m "Add Copilot instructions"

# Use Chat panel, not inline
```

### "Continue not using system prompt"

**Check:**
- File is at `~/.continue/system-prompt.md`
- Config.json references `{{SYSTEM_PROMPT}}`

**Fix:**
```bash
# Check file exists
cat ~/.continue/system-prompt.md | head -5

# Restart Continue extension
# Check Continue output panel for errors
```

### "Too many conflicting suggestions"

**Fix - Disable conflicting extensions:**
```json
{
  "github.copilot.editor.enableAutoCompletions": false,
  "continue.enableTabAutocomplete": false,
  "codeium.enableAutocomplete": false
}
```

Use Chat interfaces instead of inline completions for spec alignment.

---

## Best Practices

### 1. Use Chat Over Completions

For spec-aligned behavior:
- ✅ Copilot Chat panel
- ✅ Continue panel  
- ❌ Inline completions (don't follow instructions)

### 2. Start Fresh Sessions

After 5-10 chat exchanges:
- Start new conversation
- Re-state task and constraints
- Reference spec explicitly

### 3. Configure Settings Per Workspace

Use workspace settings (`.vscode/settings.json`) not user settings:
- Project-specific
- Committed to git
- Shared with team

### 4. Disable Auto-Formatting

```json
{
  "editor.formatOnSave": false,
  "[python]": {
    "editor.formatOnSave": false
  }
}
```

Manual formatting shows real diffs in PRs.

---

## Integration with Workflow

### Development Loop

```bash
# 1. Open VS Code in project
code .

# 2. Open AI assistant chat
# Copilot: Cmd/Ctrl + Shift + I
# Continue: Cmd/Ctrl + L

# 3. Request with spec context
"From One to Sixty-Seven spec active.
Task: Add email validation.
Restate goal, ask if unclear, minimal change, SUMMARY."

# 4. Review output
# Check for goal restatement
# Check for assumption declaration
# Check for SUMMARY block

# 5. Iterate if needed

# 6. Commit with meaningful message
```

### PR Review

1. AI generates code with spec
2. Human reviews in VS Code
3. Check PR template compliance
4. Merge

---

## Alternative: Continue as Primary

If you want one consistent experience:

1. **Install Continue** as primary assistant
2. **Configure with AGENTS.md** as system prompt
3. **Use Continue for all AI interactions**
4. **Copilot only for completions** (with instructions ignored)

This gives you:
- Full spec compliance via Continue
- Fast completions via Copilot
- Single consistent behavior

---

## See Also

- [Getting Started](../getting-started.md)
- [Troubleshooting](../troubleshooting.md)
- [Copilot Installation](./copilot.md)
- [Continue Documentation](https://continue.dev/docs/)
