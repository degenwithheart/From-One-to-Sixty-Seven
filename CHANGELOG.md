# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

---

## [2.0.0] — 2025-04-15

### Added

**LLM Assistant Files (9)**
- `CLAUDE.md` — Anthropic Claude / Claude Code
- `AGENTS.md` — OpenAI GPT-4, OpenCode, Codex CLI, generic agents
- `GEMINI.md` — Google Gemini Code Assist / CLI
- `COPILOT.md` — GitHub Copilot
- `CURSOR.md` — Cursor editor
- `CODEWHISPERER.md` — Amazon Q / CodeWhisperer
- `CODEIUM.md` — Codeium / Windsurf
- `TABNINE.md` — Tabnine Enterprise
- `AIDER.md` — Aider CLI

**Claude Code Integration**
- `.claude/skills/core-spec.md` — auto-loaded core rules
- `.claude/skills/security.md` — auto-loaded security rules
- `.claude/skills/testing.md` — auto-loaded testing rules
- `.claude/commands/review.md` — `/review` command
- `.claude/commands/debug.md` — `/debug` command
- `.claude/commands/plan.md` — `/plan` command

**Cursor Integration**
- `.cursor/rules/core.mdc` — always-active core rules
- `.cursor/rules/security.mdc` — file-glob activated security rules
- `.cursor/rules/testing.mdc` — file-glob activated testing rules

**GitHub Copilot Integration**
- `.github/copilot-instructions.md` — auto-read by Copilot Chat

**Tech Stacks (16)**
- Python, TypeScript, Go, Rust, Java, Kotlin, C#, Ruby, PHP, Swift, Dart, C/C++, SQL, Terraform, Docker/K8s, Shell/Bash

**IDE Plugin Configs (5 editors)**
- VS Code: `settings.json`, `extensions.json`, `continue-config.json`
- JetBrains: `README.md`, `live-templates.xml`
- Neovim: `README.md` with lazy.nvim config, LuaSnip snippets
- Vim: `README.md` with vim-plug config, abbreviations
- Zed: `README.md` with settings.json, prompt library, keybindings

**Variants (5)**
- `ENTERPRISE.md`, `LEAN_STARTUP.md`, `SECURITY_HARDENED.md`, `TEST_FIRST.md`, `MONOREPO.md`

**Templates (3)**
- `SESSION_KICKOFF.md` — full, short, and refresh versions
- `SYSTEM_PROMPT.md` — full and minimal API/chat system prompts
- `PULL_REQUEST_TEMPLATE.md` — with LLM spec checklist

**Docs (4)**
- `philosophy.md`, `anti-patterns.md`, `examples.md`, `llm-comparison.md`

**Repo Infrastructure**
- GitHub Actions markdown lint + link check workflow
- Bug report and spec improvement issue templates
- `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`, `.gitignore`
- `.markdownlint.json`, `.mlc-config.json`

---

## [1.0.0] — 2025-01-01

- Initial 20-rule core spec
- Claude-only, single `CLAUDE.md`
