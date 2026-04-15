# LLM Comparison Guide

How the major AI coding assistants differ in behaviour, strengths, and where the spec helps most.

---

## At a Glance

| Assistant | Strengths | Common Failure Mode | Best Spec Files |
|---|---|---|---|
| Claude (Anthropic) | Long context, nuanced reasoning, follows complex instructions | Over-explains, can be verbose | `CLAUDE.md`, `.claude/skills/` |
| GPT-4o (OpenAI) | Fast, broad knowledge, good at code generation | Scope creep, confident when wrong | `AGENTS.md` as system prompt |
| Gemini 1.5 Pro (Google) | Excellent at long-document context, multi-modal | Less consistent code quality than Claude/GPT | `GEMINI.md` |
| GitHub Copilot | Tight IDE integration, fast completions, repo context | Completes without asking, silently assumes | `COPILOT.md`, `.github/copilot-instructions.md` |
| Cursor | Excellent project-wide context, Composer for multi-file | Can touch many files at once without clear scope | `CURSOR.md`, `.cursor/rules/` |
| Amazon Q / CodeWhisperer | Strong AWS service knowledge, security scanning | Limited outside AWS ecosystem | `CODEWHISPERER.md` |
| Codeium / Windsurf | Fast, free tier, good completions | Less instruction-following than Claude/GPT | `CODEIUM.md` |
| Tabnine | Privacy-first, local model option, enterprise | Weaker at complex multi-step reasoning | `TABNINE.md` |
| Aider | Excellent git integration, diffs are clean | CLI-only, setup overhead | `AIDER.md` |

---

## Instruction Following

How reliably does each assistant follow the spec rules?

| Assistant | System Prompt Adherence | Mid-Session Drift | Handles Ambiguity |
|---|---|---|---|
| Claude Sonnet/Opus | Excellent | Low drift | Asks questions reliably |
| GPT-4o | Good | Medium drift | Asks sometimes, assumes often |
| Gemini 1.5 Pro | Good | Medium drift | Asks sometimes |
| Copilot (Chat) | Moderate | Higher drift | Rarely asks |
| Cursor (Composer) | Moderate | Medium drift | Sometimes asks |
| Aider | Good (follows CONVENTIONS.md) | Low drift | Asks when confused |

**Implication:** For Claude and Aider, the spec works very well with minimal reinforcement.
For Copilot and Cursor, use the session refresh prompt every 10-15 turns.

---

## Context Window Usage

| Assistant | Context Window | Effective Use | Notes |
|---|---|---|---|
| Claude Opus/Sonnet | 200k tokens | Excellent | Reliably uses full context |
| GPT-4o | 128k tokens | Good | Can lose context after ~50k |
| Gemini 1.5 Pro | 1M tokens | Good | Best for large codebases |
| Copilot | ~4k (completion), ~32k (chat) | Limited | Repo indexing helps |
| Cursor | ~64k (Composer) | Good | Uses repo index + embeddings |

---

## Config File Locations by Tool

| Tool | Where to put the spec |
|---|---|
| Claude Code | `CLAUDE.md` at repo root; skills in `.claude/skills/` |
| Cursor | `.cursorrules` at root OR `.cursor/rules/*.mdc` |
| GitHub Copilot Chat | `.github/copilot-instructions.md` |
| Copilot Workspace | `.github/copilot-workspace.md` |
| Continue (VS Code/nvim) | `~/.continue/config.json` → `systemMessage` field |
| Avante.nvim | `system_prompt` in plugin opts |
| CopilotChat.nvim | `system_prompt` in plugin opts |
| Aider | `CONVENTIONS.md` or `--system-prompt` flag |
| OpenCode (ACP) | `AGENTS.md` at repo root |
| Gemini Code Assist | Project-level instructions in plugin settings |
| Amazon Q | `~/.aws/amazonq/system-prompt.md` (if supported) |

---

## Which Variant to Use

| Situation | Variant |
|---|---|
| Default / most projects | Base spec (`CLAUDE.md` / `AGENTS.md`) |
| Finance, healthcare, regulated industry | `variants/ENTERPRISE.md` |
| Pre-launch startup, MVP, spike work | `variants/LEAN_STARTUP.md` |
| Auth systems, payment processing | `variants/SECURITY_HARDENED.md` |
| TDD team, test coverage mandated | `variants/TEST_FIRST.md` |
| Large monorepo, multi-team | `variants/MONOREPO.md` |

---

## Tips by Assistant

### Claude (Claude Code)
- The `.claude/skills/` directory is auto-loaded — put granular rules there.
- Use `/plan` before large tasks, `/review` after changes, `/debug` for bugs.
- Claude follows multi-step instructions very reliably — the full spec works well.

### GPT-4o / ChatGPT
- Paste `templates/SYSTEM_PROMPT.md` at the start of every new conversation.
- Use the refresh prompt every 15 turns — GPT-4o drifts from instructions over time.
- Be explicit about what NOT to do, not just what to do.

### Cursor
- `.cursorrules` is read automatically for all Composer sessions.
- Use `.cursor/rules/*.mdc` with `globs` for file-type specific rules.
- In Composer: use `/plan` before multi-file operations.

### GitHub Copilot
- `copilot-instructions.md` is your main lever — keep it concise (Copilot reads less reliably with long instructions).
- Copilot completions don't follow instructions well — rely on Chat for spec-aligned behaviour.
- Use the PR template to audit AI-generated changes post-hoc.

### Aider
- Aider respects `CONVENTIONS.md` natively — point it there.
- Use `--model claude-sonnet-4-5` or `--model gpt-4o` for best instruction following.
- `--auto-commits` with `--dirty-diff` is useful for auditing AI changes.
