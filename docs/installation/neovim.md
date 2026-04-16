# Installation Guide: Neovim

Complete setup for Neovim using From One to Sixty-Seven with various AI plugins.

---

## Prerequisites

- Neovim 0.9+ installed
- Package manager (lazy.nvim, packer.nvim, or vim-plug)
- One of: CopilotChat.nvim, Avante.nvim, codecompanion.nvim, or Aider

---

## Quick Setup (5 minutes)

### Step 1: Choose Your Plugin

| Plugin | Provider | System Prompt Support | Best For |
|--------|----------|---------------------|----------|
| **CopilotChat.nvim** | GitHub Copilot | ✅ Yes | Copilot users |
| **Avante.nvim** | Multiple | ✅ Yes | Flexibility |
| **codecompanion.nvim** | Multiple | ✅ Yes | Features |
| **Aider** | Multiple | ✅ Yes | Terminal-based |

### Step 2: Install Plugin

**Using lazy.nvim:**
```lua
-- CopilotChat.nvim
{
  "CopilotC-Nvim/CopilotChat.nvim",
  dependencies = {
    "zbirenbaum/copilot.lua",
    "nvim-lua/plenary.nvim",
  },
  config = function()
    require("CopilotChat").setup({
      -- See detailed config below
    })
  end,
}

-- Avante.nvim
{
  "yetone/avante.nvim",
  event = "VeryLazy",
  config = function()
    require("avante").setup({
      -- See detailed config below
    })
  end,
  dependencies = {
    "nvim-tree/nvim-web-devicons",
    "stevearc/dressing.nvim",
    "nvim-lua/plenary.nvim",
    "MunifTanjim/nui.nvim",
  },
}

-- codecompanion.nvim
{
  "olimorris/codecompanion.nvim",
  dependencies = {
    "nvim-lua/plenary.nvim",
    "nvim-treesitter/nvim-treesitter",
  },
  config = function()
    require("codecompanion").setup({
      -- See detailed config below
    })
  end,
}
```

### Step 3: Copy Configuration

```bash
# Copy the spec for reference
cp /path/to/From-One-to-Sixty-Seven/AGENTS.md ~/.config/nvim/spec.md

# Or for Aider
cp /path/to/From-One-to-Sixty-Seven/AIDER.md ~/CONVENTIONS.md
```

### Step 4: Configure System Prompt

**For CopilotChat.nvim:**
```lua
require("CopilotChat").setup({
  system_prompt = table.concat(
    vim.fn.readfile(vim.fn.expand("~/.config/nvim/spec.md")),
    "\n"
  ),
})
```

**For Avante.nvim:**
```lua
require("avante").setup({
  system_prompt = table.concat(
    vim.fn.readfile(vim.fn.expand("~/.config/nvim/spec.md")),
    "\n"
  ),
})
```

**For codecompanion.nvim:**
```lua
require("codecompanion").setup({
  strategies = {
    chat = {
      adapter = "copilot",
    },
  },
  prompt_library = {
    ["From One to Sixty-Seven"] = {
      strategy = "chat",
      description = "Use engineering spec",
      prompts = {
        {
          role = "system",
          content = table.concat(
            vim.fn.readfile(vim.fn.expand("~/.config/nvim/spec.md")),
            "\n"
          ),
        },
      },
    },
  },
})
```

---

## Detailed Configurations

### CopilotChat.nvim

**Full configuration:**
```lua
{
  "CopilotC-Nvim/CopilotChat.nvim",
  dependencies = {
    "zbirenbaum/copilot.lua",
    "nvim-lua/plenary.nvim",
  },
  config = function()
    -- Read spec file
    local spec_file = vim.fn.expand("~/.config/nvim/spec.md")
    local spec_content = table.concat(vim.fn.readfile(spec_file), "\n")

    require("CopilotChat").setup({
      system_prompt = spec_content,
      
      -- Show user prompts in chat
      show_user_selection = true,
      
      -- Window layout
      window = {
        layout = "vertical",  -- vertical, horizontal, float
        width = 0.5,
        height = 0.5,
      },
      
      -- Mappings
      mappings = {
        complete = {
          detail = "Use @<Tab> or /<Tab> for options.",
          insert = "<Tab>",
        },
        close = {
          normal = "q",
          insert = "<C-c>",
        },
        reset = {
          normal = "<C-l>",
          insert = "<C-l>",
        },
        submit_prompt = {
          normal = "<CR>",
          insert = "<C-s>",
        },
      },
      
      -- Prompts
      prompts = {
        -- Built-in prompts with spec context
        Explain = {
          prompt = "/COPILOT_EXPLAIN",
          mapping = "<leader>ce",
          description = "Explain selected code",
        },
        Review = {
          prompt = "/COPILOT_REVIEW",
          mapping = "<leader>cr",
          description = "Review selected code",
        },
        Fix = {
          prompt = "/COPILOT_FIX",
          mapping = "<leader>cf",
          description = "Fix issues in selected code",
        },
        Optimize = {
          prompt = "/COPILOT_OPTIMIZE",
          mapping = "<leader>co",
          description = "Optimize selected code",
        },
        Docs = {
          prompt = "/COPILOT_GENERATE",
          mapping = "<leader>cd",
          description = "Add documentation",
        },
        Tests = {
          prompt = "/COPILOT_TESTS",
          mapping = "<leader>ct",
          description = "Generate tests",
        },
        -- Custom spec prompts
        SpecReview = {
          prompt = "Review this code according to From One to Sixty-Seven spec. Check: correctness, security, performance, style, tests, docs. Output in REVIEW format.",
          mapping = "<leader>cR",
          description = "Spec-compliant review",
        },
        SpecDebug = {
          prompt = "Debug this following structured protocol: understand symptom, hypothesize (2-3 causes), investigate, reproduce, fix, verify.",
          mapping = "<leader>cD",
          description = "Structured debugging",
        },
      },
    })

    -- Keybindings
    vim.keymap.set("n", "<leader>cc", "<cmd>CopilotChat<cr>", { desc = "Open Copilot Chat" })
    vim.keymap.set("v", "<leader>cc", "<cmd>CopilotChat<cr>", { desc = "Open Copilot Chat with selection" })
    vim.keymap.set("n", "<leader>cq", function()
      local input = vim.fn.input("Quick Chat: ")
      if input ~= "" then
        require("CopilotChat").ask(input)
      end
    end, { desc = "Quick Copilot Chat" })
  end,
}
```

### Avante.nvim

**Full configuration:**
```lua
{
  "yetone/avante.nvim",
  event = "VeryLazy",
  lazy = false,
  version = false,
  config = function()
    -- Read spec file
    local spec_file = vim.fn.expand("~/.config/nvim/spec.md")
    local spec_content = table.concat(vim.fn.readfile(spec_file), "\n")

    require("avante").setup({
      provider = "claude",  -- or "openai", "azure"
      
      -- System prompt with spec
      system_prompt = spec_content,
      
      -- Claude configuration
      claude = {
        endpoint = "https://api.anthropic.com",
        model = "claude-3-5-sonnet-20241022",
        temperature = 0.1,
        max_tokens = 4096,
      },
      
      -- Behavior
      behaviour = {
        auto_suggestions = false,
        auto_set_highlight_group = true,
        auto_set_keymaps = true,
        auto_apply_diff_after_generation = false,
        support_paste_from_clipboard = false,
      },
      
      -- Mappings
      mappings = {
        diff = {
          ours = "co",
          theirs = "ct",
          all_theirs = "ca",
          both = "cb",
          cursor = "cc",
          next = "]x",
          prev = "[x",
        },
        suggestion = {
          accept = "<M-l>",
          next = "<M-]>",
          prev = "<M-[>",
          dismiss = "<C-]>",
        },
        jump = {
          next = "]]",
          prev = "[[",
        },
        submit = {
          normal = "<CR>",
          insert = "<C-s>",
        },
      },
      
      -- Hints
      hints = { enabled = true },
      
      -- Windows
      windows = {
        wrap = true,
        width = 30,
        sidebar_header = {
          align = "center",
          rounded = true,
        },
      },
      
      -- Highlights
      highlights = {
        diff = {
          current = "DiffText",
          incoming = "DiffAdd",
        },
      },
      
      -- Diff
      diff = {
        autojump = true,
        list_opener = "copen",
      },
    })
  end,
  build = "make",
  dependencies = {
    "stevearc/dressing.nvim",
    "nvim-lua/plenary.nvim",
    "MunifTanjim/nui.nvim",
    "hrsh7th/nvim-cmp",
    "nvim-tree/nvim-web-devicons",
    "zbirenbaum/copilot.lua",
    {
      "HakonHarnes/img-clip.nvim",
      event = "VeryLazy",
      opts = {
        default = {
          embed_image_as_base64 = false,
          prompt_for_file_name = false,
          drag_and_drop = {
            insert_mode = true,
          },
          use_absolute_path = true,
        },
      },
    },
    {
      "MeanderingProgrammer/render-markdown.nvim",
      opts = {
        file_types = { "markdown", "Avante" },
      },
      ft = { "markdown", "Avante" },
    },
  },
}
```

### codecompanion.nvim

**Full configuration:**
```lua
{
  "olimorris/codecompanion.nvim",
  dependencies = {
    "nvim-lua/plenary.nvim",
    "nvim-treesitter/nvim-treesitter",
    "hrsh7th/nvim-cmp",
    "nvim-telescope/telescope.nvim",
    { "stevearc/dressing.nvim", opts = {} },
  },
  config = function()
    -- Read spec file
    local spec_file = vim.fn.expand("~/.config/nvim/spec.md")
    local spec_content = table.concat(vim.fn.readfile(spec_file), "\n")

    require("codecompanion").setup({
      -- Adapters
      adapters = {
        copilot = function()
          return require("codecompanion.adapters").extend("copilot", {
            schema = {
              model = {
                default = "gpt-4",
              },
            },
          })
        end,
      },
      
      -- Strategies
      strategies = {
        chat = {
          adapter = "copilot",
          roles = {
            llm = "CodeCompanion",
            user = "Me",
          },
          keymaps = {
            send = {
              modes = { n = "<CR>", i = "<C-s>" },
            },
            close = {
              modes = { n = "q", i = "<C-c>" },
            },
          },
        },
        inline = {
          adapter = "copilot",
          keymaps = {
            accept_change = {
              modes = { n = "ga", i = "<C-a>" },
              description = "Accept change",
            },
            reject_change = {
              modes = { n = "gr", i = "<C-r>" },
              description = "Reject change",
            },
          },
        },
      },
      
      -- Prompt library with spec
      prompt_library = {
        ["From One to Sixty-Seven"] = {
          strategy = "chat",
          description = "Engineering spec compliance",
          opts = {
            index = 1,
            is_default = true,
            is_slash_cmd = false,
            auto_submit = false,
            short_name = "spec",
          },
          prompts = {
            {
              role = "system",
              content = spec_content,
              opts = {
                visible = false,
              },
            },
            {
              role = "user",
              content = function()
                return "I need you to help me with a coding task. Please follow the engineering spec provided above."
              end,
            },
          },
        },
        ["Review"] = {
          strategy = "chat",
          description = "Spec-compliant code review",
          opts = {
            index = 2,
            is_default = false,
            is_slash_cmd = true,
            short_name = "review",
            auto_submit = true,
          },
          prompts = {
            {
              role = "system",
              content = spec_content,
            },
            {
              role = "user",
              content = function(context)
                return "Review this code according to the spec. Check: correctness, security, performance, style, tests, docs. Output in REVIEW format.\n\n```" .. context.filetype .. "\n" .. context.lines .. "\n```"
              end,
              opts = {
                contains_code = true,
              },
            },
          },
        },
        ["Debug"] = {
          strategy = "chat",
          description = "Structured debugging",
          opts = {
            index = 3,
            is_default = false,
            is_slash_cmd = true,
            short_name = "debug",
            auto_submit = false,
          },
          prompts = {
            {
              role = "system",
              content = spec_content,
            },
            {
              role = "user",
              content = "Debug this issue following structured protocol: understand symptom, hypothesize, investigate, reproduce, fix, verify.",
            },
          },
        },
      },
      
      -- Display
      display = {
        chat = {
          show_settings = false,
          show_token_count = true,
          window = {
            layout = "vertical",
            position = "right",
            border = "single",
          },
        },
        diff = {
          enabled = true,
          close_chat_at = 240,
        },
      },
      
      -- Log
      log_level = "ERROR",
    })

    -- Keybindings
    vim.keymap.set("n", "<leader>ai", "<cmd>CodeCompanion<cr>", { desc = "CodeCompanion inline" })
    vim.keymap.set("n", "<leader>ac", "<cmd>CodeCompanionChat<cr>", { desc = "CodeCompanion chat" })
    vim.keymap.set("v", "<leader>ac", "<cmd>CodeCompanionChat<cr>", { desc = "CodeCompanion chat with selection" })
    vim.keymap.set("n", "<leader>at", "<cmd>CodeCompanionToggle<cr>", { desc = "Toggle CodeCompanion" })
    
    -- Expand 'cc' to 'CodeCompanion'
    vim.cmd([[cab cc CodeCompanion]])
  end,
}
```

---

## Aider Setup

Aider works differently — it's a terminal-based tool, not a Neovim plugin.

### Installation

```bash
# Install aider
pip install aider-chat

# Or with Homebrew
brew install aider
```

### Configuration

```bash
# Copy conventions
cp /path/to/From-One-to-Sixty-Seven/AIDER.md ~/CONVENTIONS.md

# Or use system prompt
cp /path/to/From-One-to-Sixty-Seven/AGENTS.md ~/.aider-system-prompt.md
```

### Usage with Aider

```bash
# Using CONVENTIONS.md (native)
aider --conventions ~/CONVENTIONS.md

# Using system prompt
aider --system-prompt ~/.aider-system-prompt.md

# With Claude
aider --model claude-3-5-sonnet-20241022 --conventions ~/CONVENTIONS.md
```

### Neovim Integration

**Terminal integration:**
```lua
-- Open aider in terminal
vim.keymap.set("n", "<leader>aa", function()
  vim.cmd("terminal aider --conventions ~/CONVENTIONS.md")
end, { desc = "Open Aider" })
```

**Floating terminal (toggleterm):**
```lua
{
  "akinsho/toggleterm.nvim",
  version = "*",
  config = function()
    require("toggleterm").setup({
      size = 20,
      open_mapping = [[<c-\>]],
      direction = "float",
    })

    -- Aider terminal
    local aider = require("toggleterm.terminal").Terminal:new({
      cmd = "aider --conventions ~/CONVENTIONS.md",
      dir = "git_dir",
      direction = "float",
      float_opts = {
        border = "curved",
      },
      on_open = function(term)
        vim.cmd("startinsert!")
      end,
    })

    vim.keymap.set("n", "<leader>aa", function()
      aider:toggle()
    end, { desc = "Toggle Aider" })
  end,
}
```

---

## Keybindings Reference

### CopilotChat.nvim

| Key | Action |
|-----|--------|
| `<leader>cc` | Open chat |
| `<leader>ce` | Explain code |
| `<leader>cr` | Review code |
| `<leader>cf` | Fix code |
| `<leader>co` | Optimize code |
| `<leader>cd` | Generate docs |
| `<leader>ct` | Generate tests |
| `<leader>cq` | Quick chat |
| `q` (in chat) | Close chat |
| `<C-l>` | Reset chat |

### Avante.nvim

| Key | Action |
|-----|--------|
| `<leader>aa` | Open Avante |
| `]]` | Jump to next suggestion |
| `[[` | Jump to prev suggestion |
| `co` | Accept ours (diff) |
| `ct` | Accept theirs (diff) |
| `ca` | Accept all theirs |
| `cb` | Accept both |
| `cc` | Accept cursor |
| `]x` | Next diff |
| `[x` | Prev diff |

### CodeCompanion.nvim

| Key | Action |
|-----|--------|
| `<leader>ai` | Inline edit |
| `<leader>ac` | Open chat |
| `<leader>at` | Toggle chat |
| `ga` | Accept change |
| `gr` | Reject change |
| `/review` | Review code |
| `/debug` | Debug issue |

---

## Verification

After setup:

- [ ] Plugin installed and loaded
- [ ] Spec file readable (`~/.config/nvim/spec.md`)
- [ ] System prompt configured
- [ ] Plugin recognizes spec (ask "What rules?")
- [ ] Test produces goal restatement
- [ ] Test produces SUMMARY block

---

## Common Issues

### "Spec not being followed"

**Check:**
- Spec file exists and is readable
- System prompt configured correctly
- Plugin reading file content

**Debug:**
```lua
-- Check file content
:lua print(table.concat(vim.fn.readfile(vim.fn.expand("~/.config/nvim/spec.md")), "\n"))

-- Check CopilotChat config
:lua print(require("CopilotChat").config.system_prompt)
```

### "Token limit exceeded"

**Fix:** Use concise spec version:
```bash
# Create concise version
head -50 /path/to/From-One-to-Sixty-Seven/AGENTS.md > ~/.config/nvim/spec-concise.md
```

### "Plugin not loading"

**Check:**
1. Plugin manager updated (`:Lazy sync` or `:PackerSync`)
2. Dependencies installed
3. No Lua errors in `:messages`

---

## Best Practices

### 1. Keep Spec Updated

```bash
# Add to shell startup (.zshrc, .bashrc)
update-spec() {
  cp /path/to/From-One-to-Sixty-Seven/AGENTS.md ~/.config/nvim/spec.md
}
```

### 2. Use Concise Spec for Large Files

If context limited, use only essential rules:
```lua
local essential_rules = [[
1. Restate goal before coding
2. Minimal changes only
3. Declare assumptions
4. Verify before finishing
5. End with SUMMARY
]]
```

### 3. Start New Sessions

After many exchanges:
- Reset chat (`<C-l>` in CopilotChat)
- Or close and reopen
- Re-state task and spec

### 4. Combine with FZF/Telescope

**Quick spec commands:**
```lua
-- With Telescope
vim.keymap.set("n", "<leader>as", function()
  require("telescope.builtin").find_files({
    prompt_title = "Spec Commands",
    search_dirs = { "~/.config/nvim" },
  })
end, { desc = "Spec files" })
```

---

## See Also

- [Getting Started](../getting-started.md)
- [Troubleshooting](../troubleshooting.md)
- [Aider Installation](./aider.md)
- [Plugin Documentation](https://github.com/CopilotC-Nvim/CopilotChat.nvim)
