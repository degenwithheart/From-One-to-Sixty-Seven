# Installation Guide: Cursor

Complete setup instructions for using From One to Sixty-Seven with Cursor IDE.

---

## Prerequisites

- Cursor IDE installed (https://cursor.sh)
- A project repository
- Basic understanding of Cursor's Composer and Chat features

---

## Quick Setup (2 minutes)

### Option A: .cursorrules (Simple)

```bash
# Copy the main spec
cp /path/to/From-One-to-Sixty-Seven/CURSOR.md /path/to/your/project/.cursorrules
```

### Option B: .cursor/rules/ (Advanced)

```bash
# Create directory structure
mkdir -p /path/to/your/project/.cursor/rules

# Copy rules
cp /path/to/From-One-to-Sixty-Seven/.cursor/rules/core.mdc /path/to/your/project/.cursor/rules/
cp /path/to/From-One-to-Sixty-Seven/.cursor/rules/security.mdc /path/to/your/project/.cursor/rules/
cp /path/to/From-One-to-Sixty-Seven/.cursor/rules/testing.mdc /path/to/your/project/.cursor/rules/
```

### Verification

1. Open your project in Cursor
2. Open Composer (Cmd/Ctrl + I)
3. Ask: "What rules are you following?"
4. Should reference From One to Sixty-Seven spec

---

## Detailed Setup

### Understanding .cursorrules

The `.cursorrules` file is a single file at your project root that Cursor reads automatically.

**Location:** Project root (`./.cursorrules`)

**Pros:**
- Simple setup
- One file to maintain
- Works immediately

**Cons:**
- Always applied (no conditional loading)
- Can become long
- No per-file-type customization

**Best for:** Small to medium projects, single-language projects

### Understanding .cursor/rules/*.mdc

The `.cursor/rules/` directory contains multiple `.mdc` files with YAML frontmatter.

**Location:** `.cursor/rules/*.mdc`

**File Structure:**
```yaml
---
description: Rule description
globs: ["**/*.py", "**/auth/**"]
alwaysApply: false
---

# Rules content
```

**Pros:**
- Conditional loading (by file type, path)
- Modular and organized
- Can have many specialized rules

**Cons:**
- More complex setup
- Requires understanding globs and frontmatter

**Best for:** Large projects, multi-language projects, complex codebases

---

## .cursorrules Setup

### Basic Installation

```bash
cp /path/to/From-One-to-Sixty-Seven/CURSOR.md /path/to/your/project/.cursorrules
```

### Customization

Add project-specific rules at the end:

```bash
cat >> /path/to/your/project/.cursorrules << 'EOF'

## Project-Specific Rules

### Architecture
- All API routes in src/api/
- All business logic in src/services/
- Never call database from API layer

### Naming
- Use snake_case for Python
- Use camelCase for JavaScript
- Prefix private with underscore
EOF
```

### Stack Integration

Append language-specific rules:

```bash
# Python project
cat /path/to/From-One-to-Sixty-Seven/stacks/python.md >> /path/to/your/project/.cursorrules

# TypeScript project
cat /path/to/From-One-to-Sixty-Seven/stacks/typescript.md >> /path/to/your/project/.cursorrules
```

---

## .cursor/rules/*.mdc Setup

### Directory Structure

```
your-project/
├── .cursor/
│   └── rules/
│       ├── core.mdc          # Always applies
│       ├── security.mdc      # Applies to auth/crypto files
│       └── testing.mdc       # Applies to test files
├── src/
└── ...
```

### Core Rule (Always Applies)

**File:** `.cursor/rules/core.mdc`

```yaml
---
description: Core engineering behavior rules for all AI interactions in Cursor
globs: ["**/*"]
alwaysApply: true
---

# Core Engineering Rules

## Before Writing Code

Always restate the goal before generating code. If the request is ambiguous,
present 2-3 interpretations and ask which is correct. Never silently pick one.

Identify which files and modules will be affected before making changes.

Declare assumptions explicitly:
```
ASSUMPTIONS:
- ...
```

## Code Changes

- Change only what the task requires. Nothing more.
- Match the existing code style, indentation, and patterns exactly.
- No new abstractions unless the task explicitly requires them.
- No refactoring of unrelated code.
- No future-proofing unless asked.
- No placeholder comments (`// TODO: implement`, `// fill this in`).

## Security

Never generate code that:
- Hardcodes secrets, API keys, or credentials
- Logs passwords, tokens, or PII
- Builds SQL queries via string concatenation
- Passes user input to shell commands without sanitisation
- Disables TLS certificate validation

## Verification

After any non-trivial change, confirm:
- [ ] Code compiles without errors
- [ ] Existing tests still pass
- [ ] Edge cases are handled
- [ ] Error paths return safe results

## Final Statement

End every significant code change with:
```
SUMMARY:
- What changed:
- Why:
- Verified:
- Assumptions:
- Risks:
```
```

### Security Rule (Conditional)

**File:** `.cursor/rules/security.mdc`

```yaml
---
description: Security rules for auth, crypto, and security-sensitive code
globs: ["**/auth/**", "**/crypto/**", "**/security/**", "**/login.*", "**/password.*", "**/*.auth.*", "**/middleware/auth*"]
alwaysApply: false
---

# Security-Hardened Rules

## Mandatory Security Block

When touching security-sensitive code, start with:

```
SECURITY NOTE:
- Boundary affected: [auth/api/file system/etc]
- Attack vectors: [list]
- Mitigations: [list]
```

## Input Validation

- All external input is untrusted
- Validate at boundary with allowlists
- Never pass raw input to SQL, shell, eval, deserializers

## Secrets

- Zero hardcoded secrets
- Use existing secrets management
- Never log secrets, not even partially

## Authentication

- Check auth at every layer
- Principle of least privilege
- Regenerate session ID on privilege change

## Error Handling

- No stack traces to end users
- Generic external messages, detailed internal logs
- Fail securely: default to deny
```

### Testing Rule (Conditional)

**File:** `.cursor/rules/testing.mdc`

```yaml
---
description: Testing rules for test files and TDD workflows
globs: ["**/*.test.*", "**/test_*", "**/tests/**", "**/*_test.*", "**/__tests__/**"]
alwaysApply: false
---

# Test-First Engineering Rules

## Bug Fix Protocol

1. Reproduce First: Write failing test that demonstrates the bug
2. Fix Minimally: Smallest change that makes test pass
3. Verify: Confirm test passes, no existing tests break
4. Edge Cases: Check adjacent logic for similar issues

## New Feature Protocol

1. Define Contract: Specify valid/invalid inputs/outputs
2. Write Tests: Happy path, edge cases, error paths
3. Implement: Code to make tests pass
4. Refactor: Clean up while tests green

## Test Quality Rules

- Tests must be deterministic
- No external state dependencies
- No timing-dependent tests
- Mock at appropriate boundaries

## Coverage Requirements

- Happy path: obvious case works
- Edge cases: boundaries, empties, max values
- Error paths: exceptions, failures, bad inputs
- Integration: works with rest of system

## Final Statement

Include in SUMMARY:
```
TESTING:
- Tests added: [count]
- Coverage: [scenarios covered]
- Framework: [pytest/jest/etc]
- All pass: yes/no
```
```

---

## Glob Pattern Reference

### Common Patterns

| Pattern | Matches |
|---------|---------|
| `**/*` | All files |
| `**/*.py` | All Python files |
| `**/*.ts` | All TypeScript files |
| `**/auth/**` | All files in auth directories |
| `**/tests/**` | All files in test directories |
| `**/*.test.*` | Test files (any language) |
| `**/api/**` | All files in API directories |
| `**/*config*` | Config files |

### Advanced Patterns

```yaml
# Multiple patterns
globs: ["**/*.py", "**/*.pyw"]

# Exclusions (not supported directly, structure directories to avoid)
# Instead, place rules in specific subdirectories

# Specific file
globs: ["src/config/database.yml"]

# Directory specific
globs: ["src/auth/**/*.py"]
```

---

## Variant Selection

### Enterprise

```bash
# Replace core.mdc content
cp /path/to/From-One-to-Sixty-Seven/variants/ENTERPRISE.md .cursorrules

# Or append to .cursorrules
cat /path/to/From-One-to-Sixty-Seven/variants/ENTERPRISE.md >> .cursorrules
```

### Security-Hardened

```bash
# For security.mdc, replace content:
cat /path/to/From-One-to-Sixty-Seven/variants/SECURITY_HARDENED.md > .cursor/rules/security.mdc
```

---

## Verification Checklist

After setup, verify everything works:

- [ ] `.cursorrules` or `.cursor/rules/` exists
- [ ] Cursor Composer recognizes the spec
- [ ] Test command produces goal restatement
- [ ] Test command produces SUMMARY block
- [ ] Security rule activates for auth files (if using .mdc)
- [ ] Testing rule activates for test files (if using .mdc)

---

## Cursor-Specific Features

### Composer Mode

Composer (Cmd/Ctrl + I) uses `.cursorrules` automatically.

**Best practices:**
- Start with goal restatement in your prompt
- For multi-file changes, use `/plan` equivalent manually
- Review generated code before accepting

### Chat Mode

Chat uses the same rules but may drift over long conversations.

**Best practices:**
- Refresh spec reference every 10-15 messages
- Use explicit constraints in prompts
- Request SUMMARY blocks explicitly

### Tab Completion

Tab completions don't follow `.cursorrules` as reliably.

**Recommendation:**
- Rely on Composer/Chat for spec-aligned behavior
- Use tab completion for quick, low-risk edits
- Review tab-completed code before accepting

---

## Common Issues

### "Rules not being applied"

**Check .cursorrules:**
```bash
# File exists at root?
ls -la .cursorrules

# File is readable?
cat .cursorrules | head -5
```

**Check .cursor/rules:**
```bash
# Directory structure correct?
ls -la .cursor/rules/

# Files have .mdc extension?
ls .cursor/rules/*.mdc

# Frontmatter valid?
head -5 .cursor/rules/core.mdc
```

**Fix:**
- Ensure `.cursorrules` is in project root (not subdirectory)
- Ensure `.mdc` files have valid YAML frontmatter
- Restart Cursor if rules changed

### "Changes are still too large in Composer"

**Cause:** Composer is designed for multi-file changes and may overreach.

**Solutions:**
1. Add explicit constraints in prompt
2. Use smaller, focused requests
3. Review before accepting
4. Add to `.cursorrules`:
```markdown
## Composer Constraints
- Never modify more than 3 files per request
- Always ask before creating new files
- Never refactor unrelated code
```

### "SUMMARY blocks not appearing"

**Fix - Add explicit requirement:**
```markdown
End your response with a complete SUMMARY block:

SUMMARY:
- What changed:
- Why:
- Verified:
- Assumptions:
- Risks:
```

---

## Best Practices

### 1. Use .cursorrules for Simplicity

Single file is easier to maintain. Only use `.cursor/rules/` if you need conditional loading.

### 2. Keep Rules Concise

Cursor has context limits. Very long `.cursorrules` may be truncated.

**Target:** Under 200 lines for `.cursorrules`

### 3. Use Comments for Organization

```markdown
## Section 1: Before Coding
...

## Section 2: During Coding
...

## Section 3: After Coding
...
```

### 4. Commit to Version Control

```bash
git add .cursorrules  # or .cursor/
git commit -m "Add From One to Sixty-Seven behavioral contract for Cursor"
```

### 5. Refresh Long Conversations

After 10-15 messages, restate the spec:
```markdown
Reminder: From One to Sixty-Seven spec is active.
Rules: minimal change, no hidden refactors, declare assumptions, SUMMARY.
Current task: [restate]
```

---

## Migration from .cursorrules to .mdc

If you outgrow `.cursorrules`:

```bash
# 1. Create directory structure
mkdir -p .cursor/rules

# 2. Split content
# Move core rules to core.mdc
# Move security rules to security.mdc
# Move testing rules to testing.mdc

# 3. Add frontmatter to each

# 4. Remove .cursorrules or keep as legacy
mv .cursorrules .cursorrules.backup

# 5. Test thoroughly
```

---

## See Also

- [Getting Started](../getting-started.md)
- [Troubleshooting](../troubleshooting.md)
- [Configuration Reference](../configuration.md)
