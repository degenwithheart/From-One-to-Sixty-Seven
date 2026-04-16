# Configuration Reference

Complete reference for configuring From One to Sixty-Seven.

---

## YAML Frontmatter

Some spec files (especially Cursor `.mdc` files) use YAML frontmatter for metadata.

### Structure

```yaml
---
description: Human-readable description
globs: ["pattern1", "pattern2"]
alwaysApply: true|false
---

# Content follows
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `description` | Yes | What this rule covers |
| `globs` | No* | File patterns this applies to |
| `alwaysApply` | No* | Apply to all files regardless of globs |

*Either `globs` OR `alwaysApply: true` required for `.mdc` files

### Examples

**Always apply:**
```yaml
---
description: Core engineering rules for all AI interactions
globs: []
alwaysApply: true
---
```

**Apply to specific files:**
```yaml
---
description: Python-specific rules
globs: ["**/*.py", "**/scripts/**"]
alwaysApply: false
---
```

**Apply to auth-related files:**
```yaml
---
description: Security rules for authentication code
globs: [
  "**/auth/**",
  "**/login.*",
  "**/password.*",
  "**/middleware/auth*"
]
alwaysApply: false
---
```

---

## Glob Patterns

### Basic Patterns

| Pattern | Matches |
|---------|---------|
| `**/*` | All files |
| `**/*.py` | All Python files |
| `**/*.ts` | All TypeScript files |
| `**/*.test.*` | Test files |
| `**/tests/**` | All files in test directories |
| `**/auth/**` | All files in auth directories |
| `src/**/*.py` | Python files in src/ only |
| `*.md` | Markdown files in root only |

### Advanced Patterns

| Pattern | Matches |
|---------|---------|
| `**/*.{js,ts}` | JS or TS files |
| `**/*config*` | Files with "config" in name |
| `!**/node_modules/**` | Exclude node_modules |
| `**/!(test).py` | Python files except tests |

### Pattern Reference

| Symbol | Meaning |
|--------|---------|
| `*` | Match any characters except `/` |
| `**` | Match any characters including `/` (recursive) |
| `?` | Match single character |
| `[abc]` | Match any character in brackets |
| `{a,b}` | Match either pattern |
| `!` | Negate (exclude) |

---

## File Locations by Tool

### Claude Code

```
project/
├── CLAUDE.md                    # Required - root only
├── .claude/
│   ├── skills/
│   │   ├── core-spec/
│   │   │   └── SKILL.md        # Core rules (auto-loaded)
│   │   ├── security/
│   │   │   └── SKILL.md        # Security rules
│   │   └── testing/
│   │       └── SKILL.md        # Testing rules
│   └── commands/
│       ├── review.md           # /review command
│       ├── debug.md            # /debug command
│       └── plan.md             # /plan command
└── CLAUDE.local.md             # Personal overrides (not committed)
```

**Key rules:**
- `CLAUDE.md` must be at repo root
- `.claude/skills/` auto-loads based on context
- Skills activated by file patterns

### Cursor

**Option A: .cursorrules (Simple)**

```
project/
└── .cursorrules                # Single file at root
```

**Option B: .cursor/rules/*.mdc (Advanced)**

```
project/
└── .cursor/
    └── rules/
        ├── core.mdc            # Always apply
        ├── security.mdc        # Auth/crypto files
        └── testing.mdc         # Test files
```

**Key rules:**
- `.cursorrules` OR `.cursor/rules/` — choose one approach
- `.mdc` files require YAML frontmatter
- `.cursorrules` doesn't need frontmatter

### GitHub Copilot

```
project/
└── .github/
    └── copilot-instructions.md  # Copilot Chat reads this
```

**Key rules:**
- Must be at `.github/copilot-instructions.md`
- Only works in Copilot Chat (not completions)
- Keep concise (Copilot has context limits)

### Aider

```
project/
├── CONVENTIONS.md              # Aider native support
└── ...

# OR global
~/CONVENTIONS.md
```

**Key rules:**
- File must be named exactly `CONVENTIONS.md`
- Can be project-specific or in home directory
- Auto-loaded when present

### OpenCode / Generic

```
project/
└── AGENTS.md                   # Generic system prompt
```

**Key rules:**
- Paste content as system prompt
- Or reference in configuration
- Tool-agnostic format

---

## Configuration Files

### VS Code

```json
// .vscode/settings.json
{
  "editor.formatOnSave": false,
  "github.copilot.editor.enableAutoCompletions": false,
  "continue.enableTabAutocomplete": false,
  "python.analysis.typeCheckingMode": "strict"
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "github.copilot",
    "continue.continue",
    "codeium.codeium"
  ]
}
```

### JetBrains

**Live templates:**
```xml
<!-- .idea/live-templates/From_One_to_Sixty_Seven.xml -->
<templateSet group="From One to Sixty-Seven">
  <template name="spec-sum" value="SUMMARY:..." description="Spec: SUMMARY block">
    <!-- See plugins/jetbrains/live-templates.xml for full content -->
  </template>
</templateSet>
```

**Import:** Settings → Editor → Live Templates → Import

### Continue.dev

```json
// ~/.continue/config.json
{
  "models": [
    {
      "title": "Claude with Spec",
      "provider": "anthropic",
      "model": "claude-3-sonnet-20240229",
      "systemMessage": "{{SYSTEM_PROMPT}}"
    }
  ],
  "systemPromptPath": "~/.continue/system-prompt.md"
}
```

### Neovim

```lua
-- CopilotChat.nvim
require("CopilotChat").setup({
  system_prompt = table.concat(
    vim.fn.readfile(vim.fn.expand("~/.config/nvim/spec.md")),
    "\n"
  ),
})

-- Avante.nvim
require("avante").setup({
  system_prompt = table.concat(
    vim.fn.readfile(vim.fn.expand("~/.config/nvim/spec.md")),
    "\n"
  ),
})
```

### Aider

```yaml
# ~/.aider.conf.yml
model: claude-3-5-sonnet-20241022
conventions: ~/CONVENTIONS.md
auto-commits: false
dirty-commits: false
```

---

## Environment Variables

### API Keys

```bash
# Required for cloud models
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GROQ_API_KEY=gsk_...
export COHERE_API_KEY=...
```

### Aider

```bash
# Default model
export AIDER_MODEL=claude-3-5-sonnet-20241022

# Default conventions
export AIDER_CONVENTIONS=~/CONVENTIONS.md

# Disable auto-commits
export AIDER_AUTO_COMMITS=false
```

### Continue.dev

```bash
# Config location (optional)
export CONTINUE_GLOBAL_DIR=~/.continue
```

---

## File Format Specifications

### Markdown Files (.md)

**Structure:**
```markdown
# Title

## Section 1
Content...

## Section 2
Content...

---

## Final Section

SUMMARY:
- What changed:
- Why:
- Verified:
- Assumptions:
- Risks:
```

**Requirements:**
- UTF-8 encoding
- LF line endings (Unix-style)
- Markdown syntax
- No byte order mark (BOM)

### MDC Files (.mdc)

**Structure:**
```yaml
---
description: Rule description
globs: ["**/*.py"]
alwaysApply: false
---

# Markdown content
## Rules
...
```

**Requirements:**
- Valid YAML frontmatter
- `---` delimiters
- Markdown after frontmatter
- UTF-8 encoding

### XML Files

**JetBrains live templates:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<templateSet group="From One to Sixty-Seven">
  <template name="spec-sum" value="..." description="...">
    <variable name="WHAT" expression="" defaultValue="" alwaysStopAt="true" />
  </template>
</templateSet>
```

**Requirements:**
- Valid XML syntax
- UTF-8 encoding
- Proper escaping in attribute values

---

## Customization

### Project-Specific Rules

**Append to base spec:**
```bash
# Project conventions
cat >> CLAUDE.md << 'EOF'

## Project-Specific Rules

### Architecture
- All API routes in src/api/
- All business logic in src/services/
- Never call database from API layer

### Naming
- Use snake_case for Python
- Prefix private functions with underscore
EOF
```

### Personal Overrides

**Create local file (not committed):**
```bash
# CLAUDE.local.md
cat > CLAUDE.local.md << 'EOF'
## Personal Preferences

I prefer:
- Type hints on all functions
- Detailed explanations for complex changes
- Google-style docstrings
EOF
```

**Add to .gitignore:**
```
*.local.md
CLAUDE.local.md
```

### Stack-Specific Additions

**Python project:**
```bash
cat stacks/python.md >> CLAUDE.md
```

**TypeScript project:**
```bash
cat stacks/typescript.md >> CLAUDE.md
```

**Multi-stack:**
```bash
cat stacks/python.md >> CLAUDE.md
cat stacks/typescript.md >> CLAUDE.md
```

### Variant Selection

**Replace base:**
```bash
cp variants/ENTERPRISE.md CLAUDE.md
```

**Append to base:**
```bash
cat variants/ENTERPRISE.md >> CLAUDE.md
```

---

## Skills Configuration (Claude Code)

### Auto-Activation Patterns

**core-spec:** Always loaded

**security:** Loaded for:
```
globs: [
  "**/auth/**",
  "**/authentication/**", 
  "**/crypto/**",
  "**/cryptography/**",
  "**/password/**",
  "**/login/**",
  "**/security/**",
  "**/encryption/**",
  "**/jwt/**",
  "**/oauth/**",
  "**/session/**",
  "**/permission/**",
  "**/authorization/**",
  "**/acl/**",
  "**/rbac/**",
  "**/*.auth.*",
  "**/*_auth_*",
  "**/middleware/auth*",
  "**/guards/**",
  "**/policies/**"
]
```

**testing:** Loaded for:
```
globs: [
  "**/*.test.*",
  "**/*.spec.*",
  "**/test_*",
  "**/tests/**",
  "**/__tests__/**",
  "**/testing/**",
  "**/test/**",
  "**/spec/**",
  "**/*_test.go",
  "**/*_tests.rs",
  "**/conftest.py",
  "**/pytest.ini",
  "**/jest.config.*",
  "**/vitest.config.*",
  "**/karma.conf.*",
  "**/playwright.config.*",
  "**/cypress.config.*",
  "**/test*.py",
  "**/Test*.java"
]
```

### Custom Skills

Create project-specific skill:

```bash
mkdir -p .claude/skills/my-project/
```

**SKILL.md:**
```markdown
---
name: my-project
description: Project-specific rules for our codebase
globs: ["**/*.py"]
---

# My Project Rules

## Architecture
- Service layer pattern required
- Repository pattern for DB access
- API layer never calls DB directly

## Testing
- 80% coverage minimum
- All public methods need tests
- Use pytest fixtures
```

---

## Verification Commands

### Check File Locations

```bash
# Claude Code
ls -la CLAUDE.md
ls -la .claude/skills/core-spec/SKILL.md

# Cursor
ls -la .cursorrules
# OR
ls -la .cursor/rules/

# Copilot
ls -la .github/copilot-instructions.md

# Aider
ls -la CONVENTIONS.md
ls -la ~/CONVENTIONS.md
```

### Check File Format

```bash
# YAML frontmatter (for .mdc)
head -10 .cursor/rules/core.mdc

# Markdown syntax
cat CLAUDE.md | head -20

# XML validity
xmllint --noout plugins/jetbrains/live-templates.xml
```

### Check Encoding

```bash
# Should show UTF-8
file -i CLAUDE.md

# Check for BOM
hexdump -C CLAUDE.md | head -1
# Should not start with EF BB BF
```

---

## Migration Between Tools

### Claude Code → Cursor

```bash
# Use CLAUDE.md content as .cursorrules
cp CLAUDE.md .cursorrules

# Or split into .mdc files
mkdir -p .cursor/rules
cat > .cursor/rules/core.mdc << 'EOF'
---
description: Core rules
globs: ["**/*"]
alwaysApply: true
---
[CLAUDE.md content]
EOF
```

### Cursor → Claude Code

```bash
# .cursorrules works as CLAUDE.md
cp .cursorrules CLAUDE.md

# Or merge .mdc files
cat .cursor/rules/*.mdc > CLAUDE.md
```

### Generic → Any Tool

```bash
# AGENTS.md works as:
cp AGENTS.md CLAUDE.md
# Or
cp AGENTS.md .cursorrules
# Or
cp AGENTS.md .github/copilot-instructions.md
# Or
cp AGENTS.md ~/CONVENTIONS.md
```

---

## Troubleshooting Config

### "File not found"

```bash
# Check exact path
pwd
ls -la CLAUDE.md

# Check case sensitivity
ls | grep -i claude
```

### "Frontmatter not parsing"

```bash
# Check YAML validity
head -10 file.mdc | yq

# Check delimiters
grep "^---" file.mdc | wc -l
# Should show 2 (start and end)
```

### "Globs not matching"

```bash
# Test glob pattern
find . -path "**/auth/**" -type f
find . -name "*.py" -type f
```

---

## Best Practices

### 1. Version Control

```bash
# Commit to git
git add CLAUDE.md .claude/ .cursor/ .github/
git commit -m "Add From One to Sixty-Seven behavioral contract"
```

### 2. Exclude Local Overrides

```bash
# .gitignore
*.local.md
CLAUDE.local.md
.cursorrules.local
```

### 3. Keep Backups

```bash
# Before major changes
cp CLAUDE.md CLAUDE.md.backup.$(date +%Y%m%d)
```

### 4. Document Customizations

```markdown
## Customizations

- Added project-specific rules [date]
- Using ENTERPRISE variant for compliance
- Appended Python stack rules
```

### 5. Test Configuration

```bash
# Verify after changes
claude /plugins refresh  # Claude Code
# Or restart Cursor
# Or reload VS Code window
```

---

## See Also

- [Getting Started](../getting-started.md)
- [Installation Guides](../installation/)
- [Troubleshooting](../troubleshooting.md)
