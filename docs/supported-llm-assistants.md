# Supported LLM Assistants

From One to Sixty-Seven works with every major AI coding assistant.

---

## Configuration Files

| Assistant | Config File | Config Directory | Notes |
|-----------|-------------|------------------|-------|
| **Claude** (Anthropic) | [`CLAUDE.md`](../CLAUDE.md) | [`.claude/`](../.claude/) | Claude Code, claude.ai |
| **Cursor** | [`CURSOR.md`](../CURSOR.md) | [`.cursor/rules/`](../.cursor/rules/) | `.cursorrules` also supported |
| **GitHub Copilot** | [`COPILOT.md`](../COPILOT.md) | [`.github/`](../.github/) | Via `copilot-instructions.md` |
| **Gemini** (Google) | [`GEMINI.md`](../GEMINI.md) | — | Gemini Code Assist, Gemini CLI |
| **GPT-4 / ChatGPT** | [`AGENTS.md`](../AGENTS.md) | — | OpenAI Codex, ChatGPT, API |
| **Amazon Q / CodeWhisperer** | [`CODEWHISPERER.md`](../CODEWHISPERER.md) | — | AWS Q Developer |
| **Codeium / Windsurf** | [`CODEIUM.md`](../CODEIUM.md) | — | Windsurf editor, Codeium plugin |
| **Tabnine** | [`TABNINE.md`](../TABNINE.md) | — | Enterprise AI assistant |
| **Aider** | [`AIDER.md`](../AIDER.md) | — | CLI-first AI coding |
| **OpenCode** | [`AGENTS.md`](../AGENTS.md) | — | ACP-compatible agent |

---

## Quick Setup by Assistant

### Claude Code
```bash
cp CLAUDE.md /your-project/CLAUDE.md
cp -r .claude/ /your-project/.claude/
```

File must be named exactly `CLAUDE.md` at repository root.

[Detailed Guide →](./installation/claude-code.md)

---

### Cursor

**Option A - `.cursorrules` (Simple):**
```bash
cp CURSOR.md /your-project/.cursorrules
```

**Option B - `.cursor/rules/` (Advanced):**
```bash
cp -r .cursor/rules/ /your-project/.cursor/
```

[Detailed Guide →](./installation/cursor.md)

---

### GitHub Copilot
```bash
cp COPILOT.md /your-project/.github/copilot-instructions.md
```

Works with Copilot Chat (VS Code, JetBrains). Inline completions don't follow instructions.

[Detailed Guide →](./installation/copilot.md)

---

### GPT-4 / ChatGPT

Paste [`AGENTS.md`](../AGENTS.md) content as system prompt:

```python
import openai

with open('AGENTS.md') as f:
    system_prompt = f.read()

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Your task here"}
    ]
)
```

[Generic Setup →](./installation/generic.md)

---

### Aider
```bash
cp AIDER.md /your-project/CONVENTIONS.md

# Or use as system prompt
cp AIDER.md ~/CONVENTIONS.md
aider --conventions ~/CONVENTIONS.md
```

Aider natively supports `CONVENTIONS.md`.

[Detailed Guide →](./installation/aider.md)

---

## Feature Comparison

| Assistant | System Prompt | Skills/Commands | Inline Completion |
|-----------|--------------|-----------------|-------------------|
| Claude Code | ✅ `CLAUDE.md` | ✅ Built-in | ❌ N/A |
| Cursor | ✅ `.cursorrules` | ❌ | ✅ |
| Copilot Chat | ✅ `copilot-instructions.md` | ❌ | ❌ |
| GPT-4 | ✅ Paste | ❌ | ❌ |
| Aider | ✅ `CONVENTIONS.md` | ✅ Built-in | ❌ |
| Codeium | ⚠️ Manual | ❌ | ✅ |

**Legend:**
- ✅ Fully supported
- ⚠️ Partial/manual setup
- ❌ Not available

---

## LLM Comparison

For detailed comparison of how each LLM follows the spec:

[LLM Comparison Guide →](./llm-comparison.md)

---

## Adding New Assistants

Want support for a new AI assistant?

1. Check if it supports system prompts/context
2. Create a new `.md` file at root
3. Follow the format of existing files
4. Submit PR with test results

See [Contributing](../CONTRIBUTING.md) for guidelines.
