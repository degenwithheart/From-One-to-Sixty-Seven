# From One to Sixty-Seven

> A production-grade behavioral contract for AI coding assistants — covering every major LLM, every major stack, and every major IDE.  
> By [Degen Serenade](https://github.com/degenwithheart)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Spec Version](https://img.shields.io/badge/spec-v2.0.0-blue.svg)](CHANGELOG.md)

---

## What Is This?

A **drop-in behavioral spec** that tells AI coding assistants how to reason, modify, and verify code in your project. Based on Andrej Karpathy's observations on LLM coding pitfalls, extended into a full multi-agent, multi-stack engineering standard.

### Inspired By

- [andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) — the `.claude/skills/` pattern
- [multica-ai/multica](https://github.com/multica-ai/multica) — the `CLAUDE.md` + `AGENTS.md` multi-agent pattern

---

## From One to Sixty-Seven

It started with [a tweet](https://x.com/karpathy/status/2015883857489522876).

Andrej Karpathy observed that AI coding assistants make silent assumptions, overcomplicate solutions, and charge ahead without verification. One developer, [Forrest Chang](https://github.com/forrestchang/andrej-karpathy-skills), turned these observations into a single `CLAUDE.md` file — a behavioral contract that made Claude Code more reliable.

**One file worked. But teams needed more.**

We don't use just one AI assistant. We write in multiple languages. We work in different IDEs with different compliance requirements. A single file couldn't cover the complexity of real-world software engineering.

So this project expanded:

| Stage | What Changed | Result |
|-------|--------------|--------|
| **One** | The original `CLAUDE.md` | ~100 lines for Claude |
| **Nine** | Added 8 more LLM files | Every major assistant covered |
| **Sixteen** | Created stack files | Python, TypeScript, Go, Rust, Java... |
| **Five** | Built environment variants | Enterprise, Security-Hardened, Test-First... |
| **Six** | Added Claude commands | `/review`, `/debug`, `/plan` workflows |
| **Three** | Cursor rule files | `.mdc` format for IDE integration |
| **Twenty+** | Plugin configurations | VS Code, JetBrains, Neovim, Vim, Zed |

**67 files. 4,500 lines.**

The core philosophy never changed: *think first, change surgically, verify always*. Only the scope expanded — from a single assistant to every assistant, from one language to sixteen, from individual use to team-wide deployment.

This is what happens when a good idea meets real-world complexity.

---

## Supported LLM Assistants

| Assistant | Config File | Config Directory | Notes |
|---|---|---|---|
| **Claude** (Anthropic) | [`CLAUDE.md`](CLAUDE.md) | [`.claude/`](.claude/) | Claude Code, claude.ai |
| **Cursor** | [`CURSOR.md`](CURSOR.md) | [`.cursor/rules/`](.cursor/rules/) | `.cursorrules` also supported |
| **GitHub Copilot** | [`COPILOT.md`](COPILOT.md) | [`.github/`](.github/) | Via `copilot-instructions.md` |
| **Gemini** (Google) | [`GEMINI.md`](GEMINI.md) | — | Gemini Code Assist, Gemini CLI |
| **GPT-4 / ChatGPT** | [`AGENTS.md`](AGENTS.md) | — | OpenAI Codex, ChatGPT, API |
| **Amazon Q / CodeWhisperer** | [`CODEWHISPERER.md`](CODEWHISPERER.md) | — | AWS Q Developer |
| **Codeium / Windsurf** | [`CODEIUM.md`](CODEIUM.md) | — | Windsurf editor, Codeium plugin |
| **Tabnine** | [`TABNINE.md`](TABNINE.md) | — | Enterprise AI assistant |
| **Aider** | [`AIDER.md`](AIDER.md) | — | CLI-first AI coding |
| **OpenCode** | [`AGENTS.md`](AGENTS.md) | — | ACP-compatible agent |

---

## Supported Tech Stacks

| Stack | File |
|---|---|
| Python | [`stacks/python.md`](stacks/python.md) |
| TypeScript / JavaScript | [`stacks/typescript.md`](stacks/typescript.md) |
| Go | [`stacks/go.md`](stacks/go.md) |
| Rust | [`stacks/rust.md`](stacks/rust.md) |
| Java | [`stacks/java.md`](stacks/java.md) |
| Kotlin | [`stacks/kotlin.md`](stacks/kotlin.md) |
| C# / .NET | [`stacks/csharp.md`](stacks/csharp.md) |
| Ruby | [`stacks/ruby.md`](stacks/ruby.md) |
| PHP | [`stacks/php.md`](stacks/php.md) |
| Swift | [`stacks/swift.md`](stacks/swift.md) |
| Dart / Flutter | [`stacks/dart.md`](stacks/dart.md) |
| C / C++ | [`stacks/cpp.md`](stacks/cpp.md) |
| SQL | [`stacks/sql.md`](stacks/sql.md) |
| Terraform | [`stacks/terraform.md`](stacks/terraform.md) |
| Docker / Kubernetes | [`stacks/docker.md`](stacks/docker.md) |
| Shell / Bash | [`stacks/shell.md`](stacks/shell.md) |

---

## Supported IDE Plugins

| IDE / Editor | Plugin Config |
|---|---|
| VS Code | [`plugins/vscode/`](plugins/vscode/) |
| JetBrains (IntelliJ, PyCharm, etc.) | [`plugins/jetbrains/`](plugins/jetbrains/) |
| Neovim | [`plugins/neovim/`](plugins/neovim/) |
| Vim | [`plugins/vim/`](plugins/vim/) |
| Zed | [`plugins/zed/`](plugins/zed/) |

---

## Quick Start

### 1. Pick your LLM and copy its spec file

```bash
# Claude / Claude Code
cp CLAUDE.md /your-project/CLAUDE.md

# Cursor
cp CURSOR.md /your-project/.cursorrules
cp -r .cursor/ /your-project/.cursor/

# GitHub Copilot
cp COPILOT.md /your-project/.github/copilot-instructions.md

# Aider
cp AIDER.md /your-project/CONVENTIONS.md
```

### 2. Add your stack addendum

```bash
# Example: Python project with Claude
cat stacks/python.md >> /your-project/CLAUDE.md
```

### 3. Copy IDE plugin configs

```bash
# VS Code
cp -r plugins/vscode/.vscode/ /your-project/.vscode/
```

### 4. Start a session with the kickoff template

See [`templates/SESSION_KICKOFF.md`](templates/SESSION_KICKOFF.md).

---

## Repository Structure

```
llm-engineering-spec/
│
├── # Root LLM spec files (one per assistant)
├── CLAUDE.md                    ← Anthropic Claude
├── AGENTS.md                    ← GPT-4, OpenCode, generic agents
├── GEMINI.md                    ← Google Gemini
├── COPILOT.md                   ← GitHub Copilot
├── CURSOR.md                    ← Cursor editor
├── CODEWHISPERER.md             ← Amazon Q / CodeWhisperer
├── CODEIUM.md                   ← Codeium / Windsurf
├── TABNINE.md                   ← Tabnine Enterprise
├── AIDER.md                     ← Aider CLI
│
├── # Agent config directories
├── .claude/
│   ├── skills/                  ← Claude Code skills (auto-loaded)
│   └── commands/                ← Claude Code slash commands
├── .cursor/
│   └── rules/                   ← Cursor rules (.mdc format)
├── .github/
│   └── copilot-instructions.md  ← GitHub Copilot instructions
│
├── # Tech stacks (16 stacks)
├── stacks/
│
├── # IDE plugin configs
├── plugins/
│   ├── vscode/
│   ├── jetbrains/
│   ├── neovim/
│   ├── vim/
│   └── zed/
│
├── # Spec variants
├── variants/
│   ├── ENTERPRISE.md
│   ├── LEAN_STARTUP.md
│   ├── SECURITY_HARDENED.md
│   ├── TEST_FIRST.md
│   └── MONOREPO.md
│
├── # Templates
├── templates/
│   ├── SESSION_KICKOFF.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── SYSTEM_PROMPT.md
│
└── # Docs
    └── docs/
        ├── philosophy.md
        ├── anti-patterns.md
        ├── examples.md
        └── llm-comparison.md
```

---

## The 20 Core Rules (Summary)

1. **State Understanding First** — Restate the goal before writing code
2. **Identify Blast Radius** — Map what a change affects
3. **Simplicity Is a Hard Requirement** — No over-abstraction
4. **Surgical Changes Only** — Minimize diff size
5. **No Hidden Refactors** — Separate refactor from feature
6. **Goal-Driven Execution** — Every change has a verifiable criterion
7. **Test-Oriented Thinking** — Tests before fixes
8. **Multi-Stack Awareness** — Respect language idioms
9. **Backward Compatibility Discipline** — Don't break public contracts
10. **Performance Awareness** — No accidental O(n²) or blocking I/O
11. **Security Constraints** — No injection, no secrets
12. **Large Refactor Protocol** — Phase it; verify each phase
13. **Deterministic Verification Checklist** — Confirm before finishing
14. **Documentation Rules** — Docs reflect actual behaviour
15. **Monorepo & Cross-Module Discipline** — Respect layering
16. **When to Ask for Human Guidance** — Don't guess on ambiguity
17. **Anti-Patterns to Avoid** — No speculative abstractions
18. **Explicit Assumption Declaration** — State ASSUMPTIONS block
19. **Output Discipline** — No fragments, no placeholders
20. **Final Sanity Statement** — What changed, why, what was verified

---

## Acknowledgments

Inspired by [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls and [forrestchang's single-file approach](https://github.com/forrestchang/andrej-karpathy-skills), expanded into a comprehensive, multi-LLM, multi-stack engineering specification.

---

## License

MIT — see [LICENSE](LICENSE).
