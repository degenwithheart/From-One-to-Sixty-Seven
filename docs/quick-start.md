# Quick Start

Get started with From One to Sixty-Seven in under 5 minutes.

---

## 1. Pick Your LLM and Copy Its Spec File

### Claude / Claude Code
```bash
cp CLAUDE.md /your-project/CLAUDE.md
```

### Cursor
```bash
cp CURSOR.md /your-project/.cursorrules
cp -r .cursor/ /your-project/.cursor/
```

### GitHub Copilot
```bash
cp COPILOT.md /your-project/.github/copilot-instructions.md
```

### Aider
```bash
cp AIDER.md /your-project/CONVENTIONS.md
```

### Other Assistants
See [Supported LLM Assistants](./supported-llm-assistants.md) for all options.

---

## 2. Add Your Stack Addendum

Append language-specific rules to your spec:

```bash
# Python project with Claude
cat stacks/python.md >> /your-project/CLAUDE.md

# TypeScript project with Cursor
cat stacks/typescript.md >> /your-project/.cursorrules

# Go project
cat stacks/go.md >> /your-project/CLAUDE.md
```

See [Supported Tech Stacks](./supported-tech-stacks.md) for all stacks.

---

## 3. Copy IDE Plugin Configs

### VS Code
```bash
cp -r plugins/vscode/.vscode/ /your-project/.vscode/
```

### JetBrains
Import live templates from `plugins/jetbrains/live-templates.xml`

### Neovim
See `plugins/neovim/README.md` for plugin-specific setup

See [Supported IDE Plugins](./supported-ide-plugins.md) for all editors.

---

## 4. Verify Installation

Ask your AI assistant:
```
What rules are you following for this project?
```

Should reference:
- Goal restatement
- Minimal changes
- Assumption declaration
- Verification checklist
- SUMMARY blocks

---

## 5. Start a Session

Use the session kickoff template:

```markdown
Engineering spec active: From One to Sixty-Seven
Stack: [Python 3.12 / FastAPI / PostgreSQL]
Task: [describe task]
```

See [`templates/SESSION_KICKOFF.md`](../templates/SESSION_KICKOFF.md) for full template.

---

## Next Steps

- [Getting Started](./getting-started.md) — Comprehensive onboarding
- [Installation Guides](./installation/) — Per-tool detailed setup
- [Examples](./examples.md) — Compliant vs non-compliant examples
