# JetBrains — AI Plugin Configs

Covers: IntelliJ IDEA, PyCharm, GoLand, RustRover, WebStorm, Rider, CLion, Android Studio.

## Supported Plugins

| Plugin | Marketplace ID | Notes |
|---|---|---|
| GitHub Copilot | `com.github.copilot` | Official JetBrains plugin |
| JetBrains AI Assistant | `com.intellij.ml.llm` | Built-in from JetBrains |
| Codeium | `com.codeium.intellij` | Free tier available |
| Tabnine | `com.tabnine.TabNine` | Enterprise AI |
| Amazon Q | `aws.toolkit` | Includes CodeWhisperer |
| Continue | `com.github.continue-dev.continue-intellij` | Open source, multi-model |

## Installation

### Via IDE Settings
1. Open `Settings / Preferences` → `Plugins` → `Marketplace`
2. Search for the plugin name above
3. Install and restart

### Via CLI (if using Toolbox or `idea` CLI)
```bash
# Install GitHub Copilot plugin
idea installPlugins com.github.copilot
```

## Configuring AI Behaviour

JetBrains AI plugins are configured via `Settings → Tools → [Plugin Name]`.

Key settings to configure for spec alignment:

### GitHub Copilot
- Enable: Yes
- Suggestions: Inline suggestions on
- Show suggestions in: All file types except Markdown and plain text

### JetBrains AI Assistant
- Code generation: Enabled
- Test generation: Enabled
- Commit message generation: Enabled (useful, low risk)
- In the AI chat: paste `templates/SYSTEM_PROMPT.md` as the system context

### Amazon Q / CodeWhisperer
- Workspace context: Enable for better project-aware suggestions
- Security scan: Enable — run on changed files

## Live Templates for Spec Blocks

Import `jetbrains/live-templates.xml` to get keyboard shortcuts for:
- `spec-sum` → SUMMARY block
- `spec-ass` → ASSUMPTIONS block
- `spec-sec` → SECURITY NOTE block
- `spec-plan` → PLAN block
- `spec-review` → REVIEW block

### Import Steps
1. `Settings → Editor → Live Templates`
2. Click the import icon (top right)
3. Select `plugins/jetbrains/live-templates.xml`
