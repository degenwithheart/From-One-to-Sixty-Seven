# Supported IDE Plugins

IDE-specific configurations for seamless spec integration.

---

## Available IDE Configurations

| IDE / Editor | Plugin Config | Installation |
|--------------|---------------|--------------|
| **VS Code** | [`plugins/vscode/`](../plugins/vscode/) | Copy `.vscode/` settings |
| **JetBrains** (IntelliJ, PyCharm, WebStorm, etc.) | [`plugins/jetbrains/`](../plugins/jetbrains/) | Import live templates |
| **Neovim** | [`plugins/neovim/`](../plugins/neovim/) | Configure with Lua |
| **Vim** | [`plugins/vim/`](../plugins/vim/) | Vimscript configs |
| **Zed** | [`plugins/zed/`](../plugins/zed/) | Zed configuration |

---

## VS Code

### Quick Setup
```bash
cp -r plugins/vscode/.vscode/ /your-project/.vscode/
```

### What's Included
- **settings.json** — Copilot, Codeium, Tabnine settings
- **extensions.json** — Recommended extensions
- **continue-config.json** — Continue.dev configuration

### Features
- Copilot Chat settings
- Codeium/Tabnine configuration
- Editor settings to minimize diffs
- Format-on-save disabled (spec requirement)

[Detailed Guide →](./installation/vscode.md)

---

## JetBrains (IntelliJ IDEA, PyCharm, WebStorm, etc.)

### Quick Setup
1. Open Settings → Editor → Live Templates
2. Import `plugins/jetbrains/live-templates.xml`
3. Templates available under "From One to Sixty-Seven" group

### Available Templates
| Template | Expands To |
|----------|----------|
| `spec-sum` | SUMMARY block |
| `spec-ass` | ASSUMPTIONS block |
| `spec-sec` | SECURITY NOTE block |
| `spec-plan` | PLAN structure |
| `spec-review` | REVIEW format |

[Detailed Guide →](./installation/jetbrains.md)

---

## Neovim

### Supported Plugins
- **CopilotChat.nvim** — GitHub Copilot integration
- **avante.nvim** — Multi-provider AI assistant
- **codecompanion.nvim** — AI coding companion
- **Aider** — CLI tool with terminal integration

### Quick Setup (Lazy.nvim)
```lua
-- CopilotChat with spec
{
  "CopilotC-Nvim/CopilotChat.nvim",
  config = function()
    require("CopilotChat").setup({
      system_prompt = table.concat(
        vim.fn.readfile("AGENTS.md"), "\n"
      )
    })
  end
}
```

[Detailed Guide →](./installation/neovim.md)

---

## Vim

### Classic Vim Support
```vim
" Read AGENTS.md as system prompt
" Use with Copilot.vim or other AI plugins
```

See `plugins/vim/README.md` for configuration.

---

## Zed

### Configuration
Zed uses inline assistant configuration:

Copy `plugins/zed/README.md` settings to your Zed config.

---

## Feature Comparison

| IDE | Live Templates | Settings Preset | AI Assistant Integration |
|-----|----------------|-------------------|------------------------|
| **VS Code** | ✅ Snippets | ✅ `.vscode/` | Excellent |
| **JetBrains** | ✅ Live Templates | ⚠️ Manual | Good |
| **Neovim** | ✅ Lua snippets | ⚠️ Manual | Excellent |
| **Vim** | ⚠️ Manual | ❌ | Limited |
| **Zed** | ⚠️ Manual | ⚠️ Manual | Good |

---

## Recommended IDE Setup by Use Case

### Full IDE Experience
**VS Code** or **JetBrains** + GitHub Copilot or Cursor

### Terminal-Based Development
**Neovim** + CopilotChat.nvim or Aider

### Quick Edits
**Zed** or **VS Code** + Codeium

---

## Adding New IDE Support

Want support for a new editor?

1. Create `plugins/[editor]/` directory
2. Add configuration files
3. Include README with setup instructions
4. Submit PR

See [Contributing](../CONTRIBUTING.md) for guidelines.
