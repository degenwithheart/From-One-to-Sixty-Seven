# Neovim — AI Plugin Configs

## Supported Plugins

| Plugin | Repo | Notes |
|---|---|---|
| `copilot.vim` | `github/copilot.vim` | Official GitHub Copilot |
| `copilot.lua` | `zbirenbaum/copilot.lua` | Lua rewrite, better integration |
| `CopilotChat.nvim` | `CopilotC-Nvim/CopilotChat.nvim` | Chat interface for Copilot |
| `avante.nvim` | `yetone/avante.nvim` | Claude/GPT/Gemini in Neovim |
| `codecompanion.nvim` | `olimorris/codecompanion.nvim` | Multi-model AI assistant |
| `codeium.vim` | `Exafunction/codeium.vim` | Codeium for Neovim |
| `tabnine-nvim` | `codota/tabnine-nvim` | Tabnine for Neovim |
| `llm.nvim` | `huggingface/llm.nvim` | HuggingFace inference |

---

## Lazy.nvim Configuration

Add to your Neovim config (e.g. `~/.config/nvim/lua/plugins/ai.lua`):

```lua
return {

  -- ── GitHub Copilot ─────────────────────────────────────────────────────
  {
    "zbirenbaum/copilot.lua",
    cmd = "Copilot",
    event = "InsertEnter",
    config = function()
      require("copilot").setup({
        suggestion = {
          enabled = true,
          auto_trigger = true,
          debounce = 75,
          keymap = {
            accept = "<Tab>",
            accept_word = "<C-Right>",
            next = "<M-]>",
            prev = "<M-[>",
            dismiss = "<C-]>",
          },
        },
        panel = { enabled = false },
        filetypes = {
          markdown = false,
          help = false,
          text = false,
        },
      })
    end,
  },

  -- ── CopilotChat ────────────────────────────────────────────────────────
  {
    "CopilotC-Nvim/CopilotChat.nvim",
    dependencies = { "zbirenbaum/copilot.lua", "nvim-lua/plenary.nvim" },
    opts = {
      system_prompt = [[
You are a conservative, verification-driven engineering collaborator.
Before writing code: restate the goal, identify affected modules, declare assumptions.
Change only what is required. Match existing code style exactly.
End every non-trivial response with:
SUMMARY:
- What changed:
- Why:
- Verified:
- Assumptions:
- Risks:
      ]],
      model = "gpt-4o",
      temperature = 0.1,
      show_help = true,
      prompts = {
        Review = {
          prompt = "Review this code for correctness, security, performance, style, tests, and docs. Output a REVIEW block.",
        },
        Debug = {
          prompt = "Debug using this protocol: understand symptom, hypothesize causes, reproduce with test, fix minimally, verify. Output a DEBUG REPORT block.",
        },
        Plan = {
          prompt = "Before any code: produce a phased PLAN block with goal, constraints, blast radius, assumptions, phases with verification criteria.",
        },
      },
    },
    keys = {
      { "<leader>cc", "<cmd>CopilotChat<cr>", desc = "Copilot Chat" },
      { "<leader>cr", "<cmd>CopilotChatReview<cr>", desc = "Copilot Review", mode = { "n", "v" } },
      { "<leader>cd", "<cmd>CopilotChatDebug<cr>", desc = "Copilot Debug", mode = { "n", "v" } },
      { "<leader>cp", "<cmd>CopilotChatPlan<cr>", desc = "Copilot Plan" },
    },
  },

  -- ── avante.nvim (Claude / GPT / Gemini) ───────────────────────────────
  {
    "yetone/avante.nvim",
    event = "VeryLazy",
    version = false,
    opts = {
      provider = "claude",   -- or "openai", "gemini", "copilot"
      claude = {
        endpoint = "https://api.anthropic.com",
        model = "claude-sonnet-4-5",
        temperature = 0.1,
        max_tokens = 4096,
      },
      system_prompt = [[
You are a conservative, verification-driven engineering collaborator.
Before writing code: restate the goal, identify blast radius, declare assumptions.
Minimal changes only. Match existing style. Verify before finishing.
End with a SUMMARY block.
      ]],
      behaviour = {
        auto_suggestions = false,  -- manual invocation preferred
        auto_set_highlight_group = true,
      },
    },
    build = "make",
    dependencies = {
      "nvim-treesitter/nvim-treesitter",
      "stevearc/dressing.nvim",
      "nvim-lua/plenary.nvim",
      "MunifTanjim/nui.nvim",
    },
    keys = {
      { "<leader>aa", "<cmd>AvanteAsk<cr>",    desc = "Avante Ask" },
      { "<leader>ae", "<cmd>AvanteEdit<cr>",   desc = "Avante Edit",    mode = "v" },
      { "<leader>ar", "<cmd>AvanteRefresh<cr>", desc = "Avante Refresh" },
    },
  },

}
```

---

## Snippet: Spec Blocks (LuaSnip)

Add to your LuaSnip snippets (e.g. `~/.config/nvim/snippets/all.lua`):

```lua
local ls = require("luasnip")
local s, t, i = ls.snippet, ls.text_node, ls.insert_node

ls.add_snippets("all", {
  s("spec-sum", {
    t({"SUMMARY:", "- What changed: "}), i(1, ""),
    t({"", "- Why: "}), i(2, ""),
    t({"", "- Verified: "}), i(3, ""),
    t({"", "- Assumptions: "}), i(4, "none"),
    t({"", "- Risks: "}), i(5, "none"),
  }),
  s("spec-ass", {
    t({"ASSUMPTIONS:", "- "}), i(1, ""),
    t({"", "- "}), i(2, ""),
  }),
  s("spec-sec", {
    t({"SECURITY NOTE:", "- Boundary affected: "}), i(1, ""),
    t({"", "- Attack vectors considered: "}), i(2, ""),
    t({"", "- Mitigations applied: "}), i(3, ""),
  }),
})
```
