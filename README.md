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

This is what happens when a good idea meets real-world complexity.

---

## At a Glance

- **9** LLM assistants supported (Claude, Cursor, Copilot, GPT-4, Gemini, etc.)
- **16** Tech stacks covered (Python, TypeScript, Go, Rust, Java, etc.)
- **5** Major IDEs with plugin configs (VS Code, JetBrains, Neovim, Vim, Zed)
- **5** Environment variants (Enterprise, Lean Startup, Security-Hardened, Test-First, Monorepo)
- **27** Documentation files covering everything
- **67** Total files, 4,500+ lines

---

## Quick Links

| I want to... | Go to... |
|--------------|----------|
| **Get started quickly** | [Quick Start](./docs/quick-start.md) |
| **Understand the spec** | [Getting Started](./docs/getting-started.md) |
| **Find my AI assistant** | [Supported LLM Assistants](./docs/supported-llm-assistants.md) |
| **Find my programming language** | [Supported Tech Stacks](./docs/supported-tech-stacks.md) |
| **Set up my IDE** | [Supported IDE Plugins](./docs/supported-ide-plugins.md) |
| **Understand the file layout** | [Repository Structure](./docs/repository-structure.md) |
| **Solve a problem** | [Troubleshooting](./docs/troubleshooting.md) |
| **See all 20 rules** | [Rules Reference](./docs/rules-reference.md) |
| **Have questions** | [FAQ](./docs/faq.md) |

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
