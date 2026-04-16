# Repository Structure

Complete guide to the From One to Sixty-Seven file organization.

---

## Overview

```
From-One-to-Sixty-Seven/
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
│   │   ├── core-spec/
│   │   ├── security/
│   │   └── testing/
│   └── commands/                ← Claude Code slash commands
│       ├── review.md
│       ├── debug.md
│       └── plan.md
├── .cursor/
│   └── rules/                   ← Cursor rules (.mdc format)
│       ├── core.mdc
│       ├── security.mdc
│       └── testing.mdc
├── .github/
│   ├── copilot-instructions.md  ← GitHub Copilot instructions
│   ├── workflows/               ← CI/CD workflows
│   └── ISSUE_TEMPLATE/          ← Issue templates
│
├── # Tech stacks (16 stacks)
├── stacks/
│   ├── python.md
│   ├── typescript.md
│   ├── go.md
│   ├── rust.md
│   ├── java.md
│   ├── kotlin.md
│   ├── csharp.md
│   ├── ruby.md
│   ├── php.md
│   ├── swift.md
│   ├── dart.md
│   ├── cpp.md
│   ├── sql.md
│   ├── terraform.md
│   ├── docker.md
│   └── shell.md
│
├── # IDE plugin configs
├── plugins/
│   ├── vscode/                  ← VS Code settings
│   ├── jetbrains/               ← IntelliJ/PyCharm live templates
│   ├── neovim/                  ← Neovim plugin configs
│   ├── vim/                     ← Vim configurations
│   └── zed/                     ← Zed editor settings
│
├── # Spec variants
├── variants/
│   ├── ENTERPRISE.md            ← Regulated industries
│   ├── LEAN_STARTUP.md          ← Pre-launch/MVP
│   ├── SECURITY_HARDENED.md     ← Auth/payment systems
│   ├── TEST_FIRST.md            ← TDD teams
│   └── MONOREPO.md              ← Large multi-package repos
│
├── # Framework templates
├── templates/
│   ├── frameworks/              ← Framework-specific specs
│   │   └── nextjs-fullstack/
│   ├── SESSION_KICKOFF.md       ← Session templates
│   ├── PULL_REQUEST_TEMPLATE.md ← PR template
│   └── SYSTEM_PROMPT.md         ← System prompt template
│
├── # Documentation
├── docs/                        ← Comprehensive documentation
│   ├── getting-started.md
│   ├── commands/
│   ├── installation/
│   ├── stacks/
│   ├── troubleshooting.md
│   ├── faq.md
│   └── ...
│
├── README.md                    ← Project overview
├── ROADMAP.md                   ← Development roadmap
├── CHANGELOG.md                 ← Version history
├── LICENSE                      ← MIT License
└── CONTRIBUTING.md              ← Contribution guidelines
```

---

## Root Spec Files

### What They Are
Each root `.md` file is a complete behavioral contract for a specific AI assistant.

### File Purpose

| File | Assistant | Size | Best For |
|------|-----------|------|----------|
| `CLAUDE.md` | Claude Code, claude.ai | ~3K tokens | Anthropic ecosystem |
| `AGENTS.md` | GPT-4, OpenCode, generic | ~1.5K tokens | OpenAI, ACP, APIs |
| `CURSOR.md` | Cursor IDE | ~2K tokens | Cursor users |
| `COPILOT.md` | GitHub Copilot | ~2K tokens | Copilot Chat |
| `GEMINI.md` | Google Gemini | ~2K tokens | Gemini users |
| `AIDER.md` | Aider CLI | ~2K tokens | Terminal-first |
| Others | Various | ~1.5-2K | Specific tools |

### How to Choose
1. Identify your primary AI assistant
2. Copy the corresponding file
3. Place in project root (or tool-specific location)

See [Supported LLM Assistants](./supported-llm-assistants.md) for details.

---

## Agent Config Directories

### `.claude/`

**Skills** (`.claude/skills/`)
- Auto-loaded based on context
- `core-spec/` — Always loaded
- `security/` — Loaded for auth/crypto files
- `testing/` — Loaded for test files

**Commands** (`.claude/commands/`)
- `/review` — 6-dimension code review
- `/debug` — Structured debugging
- `/plan` — Phased implementation

### `.cursor/`

**Rules** (`.cursor/rules/`)
- `.mdc` files with YAML frontmatter
- Conditional loading via globs
- `core.mdc` — Always apply
- `security.mdc` — Auth/crypto files
- `testing.mdc` — Test files

### `.github/`

**Copilot Instructions**
- `copilot-instructions.md` — Copilot Chat reads this
- Only works in Chat (not completions)

---

## Stacks Directory

### What It Contains
16 language-specific rule files:

- `python.md` — Python type hints, async, error handling
- `typescript.md` — TS strict mode, React, Node.js
- `go.md` — Go error handling, context, interfaces
- `rust.md` — Rust ownership, lifetimes, async
- And 12 more...

### How to Use
Append to your main spec file:
```bash
cat stacks/python.md >> CLAUDE.md
```

See [Supported Tech Stacks](./supported-tech-stacks.md) for details.

---

## Variants Directory

### What They Are
Environment-specific modifications to the base spec.

### Available Variants

| Variant | Use Case | Key Difference |
|---------|----------|----------------|
| `ENTERPRISE.md` | Regulated industries | Schema change protocols, audit trails |
| `LEAN_STARTUP.md` | Pre-launch/MVP | Relaxed rules, speed over thoroughness |
| `SECURITY_HARDENED.md` | Auth/payments | Mandatory security blocks |
| `TEST_FIRST.md` | TDD teams | No code without tests |
| `MONOREPO.md` | Large repos | Package boundary discipline |

### How to Use
Replace or append to base spec:
```bash
# Replace
cp variants/ENTERPRISE.md CLAUDE.md

# Append
cat variants/SECURITY_HARDENED.md >> CLAUDE.md
```

---

## Plugins Directory

### What It Contains
IDE/editor specific configurations.

### Structure
```
plugins/
├── vscode/
│   ├── .vscode/
│   │   ├── settings.json
│   │   └── extensions.json
│   └── README.md
├── jetbrains/
│   ├── live-templates.xml
│   └── README.md
├── neovim/
│   └── README.md
├── vim/
│   └── README.md
└── zed/
    └── README.md
```

### How to Use
Copy to your project:
```bash
cp -r plugins/vscode/.vscode/ /your-project/.vscode/
```

See [Supported IDE Plugins](./supported-ide-plugins.md) for details.

---

## Templates Directory

### What It Contains
Reusable templates for various workflows.

### Framework Templates
```
templates/frameworks/
└── nextjs-fullstack/
    ├── CLAUDE.md          ← Next.js specific spec
    ├── .cursorrules       ← Cursor rules
    └── README.md          ← Setup guide
```

### Session Templates
- `SESSION_KICKOFF.md` — Start AI sessions correctly
- `PULL_REQUEST_TEMPLATE.md` — PR template with spec checklist
- `SYSTEM_PROMPT.md` — System prompt template

---

## Docs Directory

### What It Contains
Comprehensive documentation (27 files, 15K+ lines).

### Structure
```
docs/
├── getting-started.md         ← Start here
├── commands/                  ← Command reference
│   ├── review.md
│   ├── debug.md
│   └── plan.md
├── installation/              ← Per-tool setup
│   ├── claude-code.md
│   ├── cursor.md
│   └── ...
├── troubleshooting.md         ← Problem solving
├── rules-reference.md       ← 20 rules indexed
├── configuration.md         ← Config reference
├── faq.md                   ← Common questions
├── best-practices.md        ← Real-world patterns
├── migration.md             ← Adoption guide
├── glossary.md              ← Terminology
└── ...
```

---

## Key Files at Root

| File | Purpose |
|------|---------|
| `README.md` | Project overview, quick links |
| `ROADMAP.md` | Development roadmap |
| `CHANGELOG.md` | Version history |
| `LICENSE` | MIT License |
| `CONTRIBUTING.md` | How to contribute |
| `package.json` | Project metadata (node) |

---

## Using This Repository

### As Reference
Browse files, copy what you need.

### As Template
Clone, customize for your organization.

### As Dependency
Track upstream, pull updates:
```bash
git remote add upstream https://github.com/degenwithheart/From-One-to-Sixty-Seven.git
git pull upstream main
```

---

## Navigation Tips

### New User?
Start with [Getting Started](./getting-started.md)

### Specific Tool?
See [Installation Guides](./installation/)

### Specific Language?
See [Tech Stacks](./supported-tech-stacks.md)

### Problem?
See [Troubleshooting](./troubleshooting.md)

### Questions?
See [FAQ](./faq.md)
