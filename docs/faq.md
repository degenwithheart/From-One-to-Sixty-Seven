# Frequently Asked Questions (FAQ)

Complete answers to common questions about From One to Sixty-Seven.

---

## General Questions

### Q: What is From One to Sixty-Seven?

**A:** From One to Sixty-Seven is a comprehensive behavioral contract for AI coding assistants. It started as a single file (like andrej-karpathy-skills) and expanded into 67 files covering 9 LLM assistants, 16 tech stacks, and 5 major IDEs.

The spec tells AI assistants how to:
- Reason before coding
- Make minimal, surgical changes
- Declare assumptions explicitly
- Verify before finishing
- End with a SUMMARY block

### Q: Why "From One to Sixty-Seven"?

**A:** The name represents the journey from a single file to comprehensive coverage:
- **One:** The original `CLAUDE.md` (~100 lines)
- **Nine:** LLM assistant files (Claude, Copilot, Cursor, Gemini, GPT-4, Aider, Codeium, Tabnine, CodeWhisperer)
- **Sixteen:** Tech stack files (Python, TypeScript, Go, Rust, Java, etc.)
- **Five:** Environment variants (Enterprise, Security-Hardened, Test-First, Lean Startup, Monorepo)
- **Twenty+:** Plugin configurations for 5 IDEs
- **Total:** 67 files, 4,500+ lines

### Q: Who should use this?

**A:**
- **Individual developers** who want more predictable AI assistance
- **Teams** who need consistent AI behavior across members
- **Organizations** with compliance/security requirements
- **Startups** who want to move fast without breaking things
- **Enterprises** who need audit trails and standardization

### Q: Is this overkill for small projects?

**A:** Use the appropriate variant:
- **Small/personal projects:** Use `CLAUDE.md` or `AGENTS.md` directly (the "one")
- **Team projects:** Add stack files
- **Production systems:** Use full spec with verification
- **Pre-launch MVPs:** Use `variants/LEAN_STARTUP.md` (relaxed rules)

You can always start small and expand.

---

## Setup & Installation

### Q: Which file should I use for my LLM assistant?

**A:**

| Assistant | File | Location |
|-----------|------|----------|
| Claude Code | `CLAUDE.md` | Repository root |
| Cursor | `CURSOR.md` or `.cursorrules` | Root or `.cursor/rules/` |
| GitHub Copilot | `COPILOT.md` | `.github/copilot-instructions.md` |
| ChatGPT / GPT-4 | `AGENTS.md` | Paste as system prompt |
| Gemini | `GEMINI.md` | Project instructions |
| Aider | `AIDER.md` | `CONVENTIONS.md` or system prompt |
| Codeium / Windsurf | `CODEIUM.md` | System prompt |
| Tabnine | `TABNINE.md` | System prompt |
| Amazon Q | `CODEWHISPERER.md` | System prompt |

### Q: Can I mix multiple LLM files?

**A:** Yes, but only if your team uses multiple assistants. For example:
- `CLAUDE.md` for Claude Code users
- `.cursorrules` for Cursor users
- `.github/copilot-instructions.md` for Copilot

Each assistant reads only its own file. They're independent.

### Q: Where should I put the files?

**A:**

**Claude Code:**
```
project/
├── CLAUDE.md              # Required - root only
├── .claude/               # Optional
│   ├── skills/            # Auto-loaded skills
│   └── commands/          # /review, /debug, /plan
└── ...
```

**Cursor:**
```
project/
├── .cursorrules           # Option A: Simple
└── .cursor/               # Option B: Advanced
    └── rules/
        ├── core.mdc
        ├── security.mdc
        └── testing.mdc
```

**GitHub Copilot:**
```
project/
└── .github/
    └── copilot-instructions.md
```

### Q: Do I need all 67 files?

**A:** No. Minimum viable setup:
- **1 file:** Your LLM assistant's main file (e.g., `CLAUDE.md`)
- **+1:** Your tech stack file (e.g., `stacks/python.md`)
- **+variants:** If you have specific needs (enterprise, security, etc.)

The full repository is a reference. Copy only what you need.

### Q: Should I commit these files to git?

**A:** Yes, with one exception:
- ✅ Commit: `CLAUDE.md`, `.cursorrules`, `.claude/`, `.cursor/`, `.github/copilot-instructions.md`
- ❌ Don't commit: `CLAUDE.local.md`, `.cursorrules.local` (personal overrides)

Add to `.gitignore`:
```
*.local.md
CLAUDE.local.md
.cursorrules.local
```

---

## Usage Questions

### Q: The LLM isn't following the spec. What should I check?

**A:**
1. **File location:** Is it in the right place? (See installation guides)
2. **File name:** Exact case? (`CLAUDE.md` not `claude.md`)
3. **Readable:** File permissions allow reading?
4. **Loaded:** Ask "What rules are you following?"
5. **Context drift:** Long session? Refresh with spec reminder

See [Troubleshooting](./troubleshooting.md) for detailed diagnostics.

### Q: The spec is slowing down simple tasks. What should I do?

**A:**
1. Use **short mode** for trivial tasks:
   ```markdown
   Spec: From One to Sixty-Seven (short mode)
   Task: Fix typo in variable name
   ```

2. Use **Lean Startup variant** for MVP work:
   ```bash
   cp variants/LEAN_STARTUP.md CLAUDE.md
   ```

3. **Override explicitly** for one task:
   ```markdown
   Task: Fix typo.
   Override: Skip detailed SUMMARY, just fix it.
   ```

### Q: Can I customize the spec for my project?

**A:** Yes, several ways:

**Project-specific rules (append to main file):**
```markdown
## Project-Specific Rules

- All API routes go in src/api/
- Use existing error handling from src/utils/errors.py
- Never add dependencies without checking package.json first
```

**Personal overrides (not committed):**
```bash
# CLAUDE.local.md
cat >> CLAUDE.local.md << 'EOF'
## Personal Preferences

I prefer:
- Type hints on all functions
- More verbose explanations for complex changes
EOF
```

**Custom skills (Claude Code only):**
```bash
mkdir -p .claude/skills/my-project/
# Create SKILL.md with project rules
```

### Q: How do I handle multiple tech stacks?

**A:** Append relevant stack files:
```bash
# Python backend + TypeScript frontend
cat stacks/python.md >> CLAUDE.md
cat stacks/typescript.md >> CLAUDE.md

# Or use MONOREPO variant
cp variants/MONOREPO.md CLAUDE.md
```

### Q: What's the difference between variants?

**A:**

| Variant | Use When | Key Difference |
|---------|----------|----------------|
| **Base** | Most projects | Standard rules |
| **Lean Startup** | Pre-launch, MVPs | Relaxed rules, speed over thoroughness |
| **Enterprise** | Regulated industries | Schema change protocols, audit trails |
| **Security-Hardened** | Auth, payments | Mandatory security blocks, strict validation |
| **Test-First** | TDD teams | No code without tests, coverage requirements |
| **Monorepo** | Large multi-package repos | Package boundary discipline |

### Q: Which variant should I use?

**A:**
- **Default:** Base spec (`CLAUDE.md`)
- **Pre-launch/MVP:** Lean Startup
- **Finance/Healthcare:** Enterprise
- **Authentication/Payments:** Security-Hardened
- **TDD mandated:** Test-First
- **Large codebase:** Monorepo

You can also combine: Base + variant append.

---

## Commands & Features

### Q: What are the `/commands`?

**A:** Structured workflow commands (Claude Code only):

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/review` | 6-dimension code review | Before committing |
| `/debug` | Structured debugging | When investigating bugs |
| `/plan` | Phased implementation | Complex multi-file changes |

### Q: How do I use the commands?

**A:**
```bash
# Code review
claude /review src/auth.py

# Debugging
claude /debug "login fails with 500 error"

# Planning
claude /plan "implement user authentication"
```

### Q: Can I use commands with other assistants?

**A:** The `/command` syntax is Claude Code specific. For other assistants:
- **Cursor:** Use manual prompts with the same structure
- **Copilot:** Use Chat with explicit instructions
- **ChatGPT:** Paste command content as prompt

The protocols (review, debug, plan) work with any assistant.

### Q: What are "skills"?

**A:** Auto-loaded rule sets based on context (Claude Code only):

| Skill | Loaded When | Provides |
|-------|-------------|----------|
| `core-spec` | Always | All 20 core rules |
| `security` | Auth/crypto files | Security-hardened rules |
| `testing` | Test files | Test-first rules |

Skills are in `.claude/skills/[name]/SKILL.md`.

---

## Troubleshooting

### Q: SUMMARY blocks aren't appearing. Why?

**A:** Common causes:
1. **Not reinforced:** Add "End with SUMMARY block" to requests
2. **Task considered trivial:** Explicitly require SUMMARY for all changes
3. **Wrong format:** LLM produces "Summary:" instead of "SUMMARY:"
4. **Context window:** Long session, use refresh prompt

**Fix:**
```markdown
Task: [description]

REQUIRED: End with complete SUMMARY block:
SUMMARY:
- What changed:
- Why:
- Verified:
- Assumptions:
- Risks:
```

### Q: The LLM is still over-engineering. What do I do?

**A:**
1. **Add explicit constraints:**
   ```markdown
   Do NOT:
   - Create new abstractions
   - Refactor unrelated code
   - Add "flexibility" not requested
   ```

2. **Use smaller requests:**
   ```markdown
   ❌ "Implement authentication"
   ✅ "Add password hashing function"
   ```

3. **Reference anti-patterns:**
   ```markdown
   Avoid: AP2 Unnecessary Abstraction, AP4 Speculative Utility
   ```

4. **Refresh session:**
   ```markdown
   Reminder: Minimal changes only. No hidden refactors.
   ```

### Q: Context drift is happening. How do I prevent it?

**A:**
1. **Session refresh every 10-15 turns:**
   ```markdown
   Reminder: From One to Sixty-Seven spec is active.
   Rules: restate, minimal, verify, SUMMARY.
   Current task: [restate]
   ```

2. **Task segmentation:** One major task per session

3. **Use `/plan`:** Structured planning reduces drift

See [Troubleshooting](./troubleshooting.md) → Session Management.

### Q: The LLM isn't asking clarifying questions. Why?

**A:**
1. **Prompt too directive:** "Add Redis rate limiting" assumes implementation
2. **Ambiguity not detected:** LLM doesn't see multiple interpretations
3. **Pattern matching:** LLM applies known pattern without thinking

**Fix:**
```markdown
Task: Add rate limiting to the API.

Before coding:
1. List ambiguous terms
2. Present 2-3 design options
3. Ask which approach to take
```

---

## Team & Organization

### Q: How do I get my team to use this?

**A:**
1. **Start with champions:** Get senior developers using it first
2. **Demonstrate value:** Show before/after diffs, bug reduction
3. **Gradual rollout:** Phase 1 = SUMMARY only, Phase 2 = full spec
4. **Enforcement (optional):** Git hooks, PR templates, CI checks
5. **Education:** Share Getting Started guide, examples

### Q: Should we customize for our team?

**A:** Yes, at two levels:

**Team-wide (committed):**
```markdown
## [Company] Engineering Standards

- All APIs must have OpenAPI specs
- All auth changes need security review
- Use existing logging from src/utils/logger.py
```

**Personal (not committed):**
```markdown
# CLAUDE.local.md
## My Preferences

- I prefer detailed explanations
- Always suggest type hints
```

### Q: How do we handle different preferences?

**A:**
- **Shared:** Base spec (committed, all use)
- **Team:** Project-specific rules (committed)
- **Individual:** `.local.md` files (not committed)

### Q: Can we enforce spec compliance?

**A:** Yes, several ways:

**Git hooks:**
```bash
# Check for SUMMARY in commits
if ! git diff --cached | grep -q "SUMMARY:"; then
    echo "Missing SUMMARY block"
    exit 1
fi
```

**PR template:** Use `templates/PULL_REQUEST_TEMPLATE.md`

**CI checks:** Automated compliance verification

**Code review:** Human reviewers check for spec adherence

---

## Technical Questions

### Q: What file format are the specs?

**A:** Markdown (`.md`) with optional YAML frontmatter:

```markdown
---
name: skill-name
description: What this provides
---

# Content
```

Cursor `.mdc` files require frontmatter. Claude Code skills use it optionally.

### Q: Do the specs work with local LLMs?

**A:** Yes, if the local LLM supports:
- System prompts / context injection
- Instruction following
- Sufficient context window

Test with your specific local model.

### Q: Can I use this with OpenAI API directly?

**A:** Yes:
```python
import openai

with open('AGENTS.md') as f:
    system_prompt = f.read()

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Add email validation..."}
    ]
)
```

### Q: How much context do the specs use?

**A:** Approximate token counts:
- `CLAUDE.md`: ~3,000 tokens
- `AGENTS.md`: ~1,500 tokens
- `stacks/python.md`: ~800 tokens
- `variants/ENTERPRISE.md`: ~1,200 tokens

Most LLMs have 128k-200k context windows, so specs are a small fraction.

### Q: Can I use multiple specs at once?

**A:** Yes, concatenate:
```bash
cat CLAUDE.md stacks/python.md variants/ENTERPRISE.md > COMBINED.md
```

Or load separately if your tool supports it.

---

## Comparison & Alternatives

### Q: How is this different from andrej-karpathy-skills?

**A:**

| | andrej-karpathy-skills | From One to Sixty-Seven |
|---|------------------------|-------------------------|
| **Files** | 1 | 67 |
| **LLMs** | Claude only | 9 assistants |
| **Stacks** | None | 16 |
| **Variants** | None | 5 |
| **IDEs** | Claude Code only | 5 ecosystems |
| **Size** | ~100 lines | 4,500+ lines |

Karpathy-skills is the excellent starting point. From One to Sixty-Seven expands it for team/enterprise use.

### Q: How is this different from cursor.directory?

**A:** Cursor.directory provides curated `.cursorrules` files for specific frameworks. From One to Sixty-Seven is a behavioral contract for engineering practices.

You can combine them:
```markdown
# .cursorrules

## From One to Sixty-Seven (behavioral)
[spec content]

## React Best Practices (from cursor.directory)
[react-specific content]
```

### Q: Should I use this or Conventional Commits / Semantic Versioning?

**A:** They're complementary:
- **This spec:** How AI writes code
- **Conventional Commits:** How humans write commit messages
- **SemVer:** How you version releases

Use all three.

---

## Maintenance

### Q: How do I update the spec?

**A:**
```bash
# Pull latest
cd From-One-to-Sixty-Seven
git pull origin main

# Re-copy files
cp CLAUDE.md /path/to/your/project/
cp -r .claude /path/to/your/project/
```

Or use git submodule:
```bash
git submodule add https://github.com/degenwithheart/From-One-to-Sixty-Seven.git spec
cp spec/CLAUDE.md .
```

### Q: How often should I update?

**A:**
- **Major releases:** When announced (breaking changes)
- **Minor updates:** Monthly check
- **Bug fixes:** As needed

Subscribe to releases on GitHub.

### Q: Can I contribute improvements?

**A:** Yes! See [CONTRIBUTING.md](../CONTRIBUTING.md):
1. Fork the repository
2. Create a branch
3. Make changes
4. Submit PR with SUMMARY block

### Q: What if I find a bug in the spec?

**A:**
1. Check if it's a known issue (GitHub Issues)
2. File a bug report using `.github/ISSUE_TEMPLATE/bug_report.yml`
3. Include: LLM used, task, expected vs actual behavior

---

## Philosophy

### Q: Why "behavioral contract" and not "best practices"?

**A:** "Best practices" are suggestions. "Behavioral contract" is enforceable.

The spec uses:
- Required output formats (SUMMARY blocks)
- Mandatory steps (assumption declaration)
- Verification checklists

These are rules, not guidelines.

### Q: Why bias toward safety over speed?

**A:** Because AI-generated bugs are expensive:
- Harder to spot in review (code looks correct)
- Scope creep creates large diffs
- Silent assumptions cause production issues

The spec trades some speed for predictability and safety.

### Q: Can I relax the rules?

**A:** Yes, use appropriate variant:
- **Lean Startup:** For MVPs where speed matters
- **Personal override:** For one-off tasks
- **Short mode:** For trivial changes

The default conservatism is correct for production code.

### Q: Isn't this too bureaucratic?

**A:** For trivial tasks, yes. For production code, no.

The spec is designed to be:
- **Light** for simple tasks (short mode)
- **Thorough** for complex tasks (full protocol)
- **Flexible** via variants

You control the level of rigor.

---

## Getting Help

### Q: Where can I get help?

**A:**
- **Documentation:** This docs/ directory
- **Issues:** GitHub Issues for bugs
- **Discussions:** GitHub Discussions for questions
- **Examples:** docs/examples.md for compliant/non-compliant comparisons
- **Troubleshooting:** docs/troubleshooting.md for problems

### Q: How do I report a bug?

**A:** Use the bug report template:
1. Go to GitHub Issues
2. Click "New Issue"
3. Select "Bug Report"
4. Fill in: Rule affected, LLM used, task description, bad outcome, expected outcome

### Q: Can I request a new feature?

**A:** Yes:
1. Check existing issues/PRs
2. File a feature request
3. Describe the use case
4. Consider contributing a PR

---

## Quick Reference

### One-Line Answers

| Question | Answer |
|----------|--------|
| Which file? | Match your LLM assistant |
| Where? | Repository root (or tool-specific) |
| All 67 files? | No, just what you need |
| Commit to git? | Yes (except .local files) |
| Too slow? | Use Lean Startup variant or short mode |
| Not working? | Check location, name, permissions |
| Team adoption? | Start with champions, demonstrate value |
| Update how? | Git pull and re-copy |
| Help where? | GitHub Issues/Discussions |

### Essential Links

- **Home:** https://github.com/degenwithheart/From-One-to-Sixty-Seven
- **Getting Started:** docs/getting-started.md
- **Troubleshooting:** docs/troubleshooting.md
- **Examples:** docs/examples.md
- **Contributing:** CONTRIBUTING.md

---

## See Also

- [Getting Started](./getting-started.md)
- [Troubleshooting](./troubleshooting.md)
- [Examples](./examples.md)
- [Glossary](./glossary.md)
