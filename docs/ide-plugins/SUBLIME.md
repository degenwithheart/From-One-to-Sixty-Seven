# FOTS Sublime Text Plugin

## Installation

### Via Package Control

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Package Control: Install Package"
3. Search for "FOTS"
4. Press Enter

### Manual Installation

```bash
# macOS
cd ~/Library/Application\ Support/Sublime\ Text/Packages/
git clone https://github.com/From-One-to-Sixty-Seven/fots-sublime.git FOTS

# Linux
cd ~/.config/sublime-text/Packages/
git clone https://github.com/From-One-to-Sixty-Seven/fots-sublime.git FOTS

# Windows
cd "%APPDATA%\Sublime Text\Packages"
git clone https://github.com/From-One-to-Sixty-Seven/fots-sublime.git FOTS
```

## Features

### Snippets

Type prefix + `Tab`:

| Prefix | Description |
|--------|-------------|
| `fots-sum` | SUMMARY block |
| `fots-ass` | ASSUMPTIONS block |
| `fots-sec` | SECURITY NOTE block |
| `fots-ent` | Enterprise summary |
| `fots-rev` | Security review |
| `fots-sch` | Schema change |
| `fots-dep` | Dependency change |

### Commands

Open Command Palette (`Ctrl+Shift+P`) and type:

- `FOTS: Insert Summary`
- `FOTS: Insert Assumptions`
- `FOTS: Insert Security Note`
- `FOTS: Validate Current File`
- `FOTS: Check Project Compliance`
- `FOTS: Show Status`
- `FOTS: Generate Report`

### Key Bindings

Default bindings:

| OS | Key | Action |
|----|-----|--------|
| All | `Ctrl+Shift+S` | Insert SUMMARY |
| All | `Ctrl+Shift+A` | Insert ASSUMPTIONS |
| All | `Ctrl+Shift+X` | Insert SECURITY NOTE |
| All | `Ctrl+Shift+V` | Validate file |
| All | `Ctrl+Shift+C` | Check project |

### Sidebar Integration

Right-click in sidebar:
- `FOTS: Validate File`
- `FOTS: Check This Folder`

## Configuration

### Settings

Open Preferences → Package Settings → FOTS → Settings:

```json
{
    "enabled": true,
    "rules": ["summary", "assumptions", "security", "tests"],
    "max_change_size": 200,
    "enable_snippets": true,
    "enable_linting": true,
    "enable_status_bar": true,
    "snippet_directory": "~/.config/fots/snippets",
    "custom_snippets": {
        "mycompany": "My company-specific template"
    }
}
```

### Key Bindings

Open Preferences → Package Settings → FOTS → Key Bindings:

```json
[
    {
        "keys": ["ctrl+alt+s"],
        "command": "fots_insert_summary"
    },
    {
        "keys": ["ctrl+alt+a"],
        "command": "fots_insert_assumptions"
    },
    {
        "keys": ["ctrl+alt+shift+v"],
        "command": "fots_validate"
    }
]
```

### Project Settings

Add to your `.sublime-project`:

```json
{
    "settings": {
        "FOTS": {
            "enabled": true,
            "rules": ["summary", "assumptions"],
            "exclude_patterns": ["*.min.js", "vendor/*"]
        }
    }
}
```

## SublimeLinter Integration

```json
// SublimeLinter settings
{
    "linters": {
        "fots": {
            "executable": "fots",
            "args": ["check", "--ci"],
            "selector": "source.python, source.js, source.ts",
            "disable": false,
            "excludes": ["*/node_modules/*"]
        }
    }
}
```

## Build System

Create a build system for FOTS validation:

```json
// Tools → Build System → New Build System...
{
    "cmd": ["fots", "check", "--files", "$file"],
    "selector": "source.python, source.js, source.ts",
    "working_dir": "$project_path",
    "file_regex": "^(.+):([0-9]+):(.+)$",
    "variants": [
        {
            "name": "Check Project",
            "cmd": ["fots", "check"]
        },
        {
            "name": "Generate Report",
            "cmd": ["fots", "report", "--format", "html"]
        }
    ]
}
```

## Troubleshooting

### Plugin not appearing
1. Check Package Control is installed
2. Restart Sublime Text after installation
3. View → Show Console for errors

### Snippets not working
1. Check Tools → Snippets menu
2. Verify scope matches (source.python, etc.)
3. Try without other snippet packages

### Validation errors
Check FOTS CLI is available:
```bash
which fots
fots --version
```

## Status Bar

The status bar shows:
- ✓ - All checks passed
- ⚠ - Warnings present
- ✗ - Errors found
- ? - FOTS not configured

Click status for detailed report.
