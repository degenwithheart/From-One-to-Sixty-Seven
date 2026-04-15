# Zed — AI Plugin Configs

Zed has native AI assistant support built in. No plugin installation required.

## Supported AI Features in Zed

| Feature | Config Key | Notes |
|---|---|---|
| Inline completions | `features.inline_completion_provider` | Copilot or Supermaven |
| AI assistant panel | `assistant.version` | Claude, GPT-4, Zed's own |
| Custom system prompt | `assistant.default_model` | Per-model configuration |

---

## settings.json Configuration

Place in `~/.config/zed/settings.json` (global) or `.zed/settings.json` (project):

```json
{
  "features": {
    "inline_completion_provider": "copilot"
  },

  "assistant": {
    "version": "2",
    "default_model": {
      "provider": "anthropic",
      "model": "claude-sonnet-4-5"
    },
    "anthropic": {
      "api_url": "https://api.anthropic.com"
    },
    "openai": {
      "api_url": "https://api.openai.com/v1",
      "available_models": [
        { "name": "gpt-4o", "max_tokens": 128000 },
        { "name": "gpt-4o-mini", "max_tokens": 128000 }
      ]
    }
  },

  "language_models": {
    "anthropic": {
      "available_models": [
        { "name": "claude-opus-4-5",   "max_tokens": 200000 },
        { "name": "claude-sonnet-4-5", "max_tokens": 200000 }
      ]
    }
  }
}
```

---

## Prompt Library (.zed/prompts/)

Zed supports a prompt library. Create `.zed/prompts/` in your project:

### `.zed/prompts/spec-system.md`
```markdown
You are a conservative, verification-driven engineering collaborator.

Before writing code:
1. Restate the goal in your own words.
2. Identify which files and modules are affected.
3. If ambiguous, present interpretations and ask.
4. Declare assumptions explicitly.

Rules:
- Change only what the task requires.
- Match existing code style exactly.
- No new abstractions unless required.
- No placeholder comments.
- Verify compilation, tests, and edge cases before finishing.
- Never hardcode secrets or introduce injection risks.

End every non-trivial response with:
SUMMARY:
- What changed:
- Why:
- Verified:
- Assumptions:
- Risks:
```

### `.zed/prompts/review.md`
```markdown
Review the selected code across six dimensions:
Correctness, Security, Performance, Style, Tests, Docs.
Output a REVIEW block with one line per dimension and a Top 3 actions list.
Flag issues — do not silently fix them.
```

### `.zed/prompts/debug.md`
```markdown
Debug using this protocol:
1. Understand the symptom (observed vs expected).
2. List 2-3 possible root causes.
3. Narrow down by reading the code.
4. Write a minimal reproduction.
5. Apply the minimum fix for the root cause.
6. Verify with the reproduction test and full suite.
Output a DEBUG REPORT block.
```

---

## Keybindings (.zed/keymap.json)

```json
[
  {
    "context": "Editor",
    "bindings": {
      "ctrl-shift-a": "assistant::ToggleFocus",
      "ctrl-shift-r": ["assistant::InsertActivePrompt", { "name": "review" }],
      "ctrl-shift-d": ["assistant::InsertActivePrompt", { "name": "debug" }]
    }
  }
]
```
