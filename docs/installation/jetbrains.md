# Installation Guide: JetBrains IDEs

Complete setup for IntelliJ IDEA, PyCharm, WebStorm, and other JetBrains IDEs using From One to Sixty-Seven.

---

## Prerequisites

- JetBrains IDE installed (IntelliJ IDEA, PyCharm, WebStorm, etc.)
- GitHub Copilot plugin OR Codeium plugin
- Project repository

---

## Quick Setup (3 minutes)

### Step 1: Install AI Assistant Plugin

**GitHub Copilot:**
1. Settings/Preferences → Plugins → Marketplace
2. Search "GitHub Copilot"
3. Install both:
   - GitHub Copilot
   - GitHub Copilot Chat (if available for your IDE)
4. Restart IDE
5. Sign in with GitHub account

**Codeium:**
1. Settings → Plugins → Marketplace
2. Search "Codeium"
3. Install "Codeium: AI Coding Autocomplete"
4. Restart IDE
5. Sign up at codeium.com

### Step 2: Copy Configuration

```bash
# Create .github directory
mkdir -p /path/to/your/project/.github

# Copy Copilot instructions
cp /path/to/From-One-to-Sixty-Seven/COPILOT.md \
   /path/to/your/project/.github/copilot-instructions.md
```

### Step 3: Import Live Templates

1. Settings → Editor → Live Templates
2. Click gear icon → Import
3. Select: `/path/to/From-One-to-Sixty-Seven/plugins/jetbrains/live-templates.xml`
4. Templates now available under "From One to Sixty-Seven" group

**Available templates:**
- `spec-sum` — SUMMARY block
- `spec-ass` — ASSUMPTIONS block
- `spec-sec` — SECURITY NOTE block
- `spec-plan` — PLAN block
- `spec-review` — REVIEW block

### Step 4: Verify

1. Open GitHub Copilot Chat (Tools → GitHub Copilot → Open Copilot Chat)
2. Ask: "What rules are you following?"
3. Should reference From One to Sixty-Seven

---

## Detailed Setup

### GitHub Copilot in JetBrains

**Copilot Chat availability:**
- IntelliJ IDEA 2023.2+ (Ultimate, Community)
- PyCharm 2023.2+
- WebStorm 2023.2+
- Rider 2023.2+
- GoLand 2023.2+
- RubyMine 2023.2+

**If Copilot Chat not available:** Use inline completions only (limited spec support)

### Configuration File Location

```
project/
├── .github/
│   └── copilot-instructions.md  # Copilot reads this
└── .idea/
    └── live-templates/         # Live templates stored here
```

### Copilot-instructions.md Setup

```bash
# Copy from spec repository
cp /path/to/From-One-to-Sixty-Seven/COPILOT.md \
   /path/to/your/project/.github/copilot-instructions.md

# Or use concise version for context limits
cat > /path/to/your/project/.github/copilot-instructions.md << 'EOF'
# From One to Sixty-Seven (Concise)

## Core Rules

1. **Restate goal** before coding
2. **Ask questions** if ambiguous
3. **Minimal changes** — no hidden refactors
4. **Declare assumptions** explicitly
5. **Verify** it works
6. **SUMMARY block** at end

## Security

No hardcoded secrets, SQL injection, or unsafe user input handling.

## Final Statement

SUMMARY:
- What changed:
- Why:
- Verified:
- Assumptions:
- Risks:
EOF
```

---

## Live Templates

### Template Reference

| Template | Expands To | Use Case |
|----------|-----------|----------|
| `spec-sum` | SUMMARY block with all fields | End of task |
| `spec-ass` | ASSUMPTIONS list | When proceeding without clarification |
| `spec-sec` | SECURITY NOTE block | Security-sensitive code |
| `spec-plan` | PLAN structure | Before complex implementation |
| `spec-review` | REVIEW format | Code review |

### Using Live Templates

**Typing expansion:**
```
spec-sum + Tab → Expands to SUMMARY block
```

**Content:**
```
SUMMARY:
- What changed: $WHAT$
- Why: $WHY$
- Verified: $VERIFIED$
- Assumptions: $ASSUMPTIONS$
- Risks: $RISKS$
```

**Variables:**
- Press Tab to move between fields
- Enter values
- Press Tab to jump to next field

### Customizing Templates

1. Settings → Editor → Live Templates
2. Find "From One to Sixty-Seven" group
3. Select template to edit
4. Modify template text or variables

**Add custom variable:**
```xml
<variable name="MY_VAR" expression="" defaultValue="" alwaysStopAt="true" />
```

---

## Stack Integration

### Python Projects

```bash
# Append Python rules
cat /path/to/From-One-to-Sixty-Seven/stacks/python.md >> \
    /path/to/your/project/.github/copilot-instructions.md
```

**IDE settings:**
1. Settings → Editor → Inspections
2. Enable:
   - PEP 8 coding style violation
   - Python → Type hinting
   - Python → Code compatibility

### Java/Kotlin Projects

```bash
cat /path/to/From-One-to-Sixty-Seven/stacks/java.md >> \
    /path/to/your/project/.github/copilot-instructions.md
```

**IDE settings:**
1. Settings → Editor → Inspections
2. Enable:
   - Java → Nullability problems
   - Java → Code style issues

### TypeScript/JavaScript Projects

```bash
cat /path/to/From-One-to-Sixty-Seven/stacks/typescript.md >> \
    /path/to/your/project/.github/copilot-instructions.md
```

**IDE settings:**
1. Settings → Languages & Frameworks → TypeScript
2. Set TypeScript version (use bundled or project version)
3. Enable strict mode checks

---

## Code Inspection Integration

### Enable Relevant Inspections

**All languages:**
1. Settings → Editor → Inspections
2. Enable:
   - General → Duplicated code
   - General → Error handling
   - Security → Hardcoded passwords
   - Security → SQL injection

**Python:**
1. Enable: PEP 8, Type checking, Docstring

**Java/Kotlin:**
1. Enable: Nullability, Resource management, Concurrency

**JavaScript/TypeScript:**
1. Enable: TypeScript validation, Unused symbols

### Custom Inspections

Add spec-specific checks:
1. Settings → Editor → Inspections
2. Click "+" → Add inspection
3. Define pattern to detect (e.g., missing SUMMARY comment)

---

## Keybindings

### Recommended Keymaps

**Copilot:**
```
Alt + \           # Accept Copilot completion
Alt + ]           # Next Copilot completion  
Alt + [           # Previous Copilot completion
Ctrl + Enter      # Open Copilot Chat
```

**Custom:**
1. Settings → Keymap
2. Search "Copilot" or "AI"
3. Assign shortcuts

### Live Template Shortcuts

```
spec-sum + Tab    # SUMMARY block
spec-ass + Tab    # ASSUMPTIONS block
spec-sec + Tab    # SECURITY NOTE block
```

---

## Verification

After setup:

- [ ] GitHub Copilot plugin installed
- [ ] Signed in to Copilot
- [ ] `.github/copilot-instructions.md` exists
- [ ] Copilot Chat recognizes the spec
- [ ] Live templates imported
- [ ] `spec-sum` expands correctly
- [ ] Test produces SUMMARY block

---

## Common Issues

### "Copilot Chat not available"

**Cause:** JetBrains IDE version too old, or Community Edition

**Solution:**
- Update to 2023.2+ (Ultimate recommended)
- Use inline completions only (limited)
- Consider VS Code for full Copilot Chat

### "Instructions not being followed"

**Check:**
- File at `.github/copilot-instructions.md`
- File committed to git
- Using Copilot Chat, not just completions

**Fix:**
```bash
# Ensure committed
git add .github/copilot-instructions.md
git commit -m "Add Copilot instructions"

# Use Chat panel
```

### "Live templates not expanding"

**Check:**
1. Settings → Editor → Live Templates
2. "From One to Sixty-Seven" group exists
3. Templates are enabled

**Fix:**
```
# Re-import templates
Settings → Editor → Live Templates
Gear icon → Import
Select live-templates.xml
```

### "Context drift in long sessions"

**Cause:** Copilot Chat may drift after many exchanges

**Solution:**
1. Start new chat thread
2. Re-state task and spec rules
3. Keep sessions focused

---

## Best Practices

### 1. Use Ultimate Edition

Copilot Chat requires paid JetBrains IDEs or recent versions.

### 2. Commit Instructions File

```bash
git add .github/copilot-instructions.md
git commit -m "Add From One to Sixty-Seven behavioral contract"
```

### 3. Use Live Templates

Speed up compliance:
- `spec-sum` for SUMMARY blocks
- `spec-ass` for assumptions
- `spec-sec` for security notes

### 4. IDE Inspections + Spec

Combine JetBrains inspections with spec rules:
- IDE catches syntax/type issues
- Spec catches behavioral issues

### 5. Start New Chat Threads

After 5-10 exchanges:
- Copilot may drift
- Start fresh conversation
- Re-state constraints

---

## Alternative: Codeium

If Copilot unavailable, use Codeium:

**Setup:**
1. Install Codeium plugin
2. Sign up at codeium.com
3. Copy spec as reference:
   ```bash
   cp /path/to/From-One-to-Sixty-Seven/CODEIUM.md /path/to/your/project/
   ```

**Usage:**
- Manual spec reference (paste into chat)
- Inline completions (limited spec support)

---

## Project Structure

```
project/
├── .github/
│   └── copilot-instructions.md      # Spec for Copilot
├── .idea/
│   └── live-templates/              # JetBrains templates
├── src/
└── ...
```

---

## Integration with Workflow

### Development Loop

1. **Open project** in JetBrains IDE
2. **Open Copilot Chat** (Tools → GitHub Copilot → Open Chat)
3. **Request with spec context:**
   ```
   Engineering spec: From One to Sixty-Seven
   Task: Add email validation
   Restate, ask questions, minimal change, SUMMARY.
   ```
4. **Review output:**
   - Goal restatement present?
   - Assumptions declared?
   - SUMMARY block included?
5. **Iterate if needed**
6. **Commit**

### Code Review

1. Generate code with Copilot + spec
2. Human reviews in IDE
3. Check PR template
4. Merge

---

## See Also

- [Getting Started](../getting-started.md)
- [Troubleshooting](../troubleshooting.md)
- [Copilot Installation](./copilot.md)
