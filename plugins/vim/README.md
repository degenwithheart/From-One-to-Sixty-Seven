# Vim — AI Plugin Configs

For classic Vim (8.2+) and those who prefer Vimscript over Lua.

## Supported Plugins

| Plugin | Repo | Install Method |
|---|---|---|
| `copilot.vim` | `github/copilot.vim` | Official Vim plugin |
| `codeium.vim` | `Exafunction/codeium.vim` | Free AI completions |
| `tabnine-vim` | `codota/tabnine-vim` | Tabnine for Vim |
| `vim-ai` | `madox2/vim-ai` | ChatGPT in Vim |

---

## vim-plug Installation

Add to your `~/.vimrc`:

```vim
call plug#begin()

" GitHub Copilot (requires Node.js)
Plug 'github/copilot.vim'

" Codeium (free alternative)
Plug 'Exafunction/codeium.vim', { 'branch': 'main' }

" vim-ai (OpenAI / custom endpoint)
Plug 'madox2/vim-ai'

call plug#end()
```

---

## Copilot Configuration

```vim
" ~/.vimrc

" Disable for certain filetypes
let g:copilot_filetypes = {
  \ 'markdown': v:false,
  \ 'text': v:false,
  \ }

" Use Tab for accept, Ctrl+] to dismiss
imap <silent><script><expr> <Tab> copilot#Accept("\<Tab>")
imap <silent> <C-]> <Plug>(copilot-dismiss)
imap <silent> <M-]> <Plug>(copilot-next)
imap <silent> <M-[> <Plug>(copilot-previous)

let g:copilot_no_tab_map = v:true
```

---

## vim-ai Configuration

```vim
" ~/.vimrc

" Set your API key (use an environment variable — never hardcode)
let g:vim_ai_token_file_path = '~/.config/openai.token'

" System prompt aligned with the engineering spec
let g:vim_ai_complete = {
  \ 'engine': 'complete',
  \ 'options': {
  \   'model': 'gpt-4o',
  \   'temperature': 0.1,
  \   'request_timeout': 30,
  \ },
  \ 'ui': {
  \   'paste_mode': 1,
  \ },
  \}

let g:vim_ai_chat = {
  \ 'options': {
  \   'model': 'gpt-4o',
  \   'temperature': 0.1,
  \   'initial_prompt': 'You are a conservative, verification-driven engineering collaborator. Before writing code: restate the goal, identify affected modules, declare assumptions. Change only what is required. End with a SUMMARY block.',
  \ },
  \}

" Keybindings
nnoremap <leader>ai :AIChat<CR>
vnoremap <leader>ai :AIChat<CR>
nnoremap <leader>ac :AIComplete<CR>
```

---

## Abbreviations for Spec Blocks

Add to `~/.vimrc` for quick spec block insertion:

```vim
" Expand 'specsum' to SUMMARY block
iabbrev specsum SUMMARY:<CR>- What changed: <CR>- Why: <CR>- Verified: <CR>- Assumptions: none<CR>- Risks: none

" Expand 'specass' to ASSUMPTIONS block
iabbrev specass ASSUMPTIONS:<CR>- <CR>- 

" Expand 'specsec' to SECURITY NOTE block
iabbrev specsec SECURITY NOTE:<CR>- Boundary affected: <CR>- Attack vectors considered: <CR>- Mitigations applied: 
```
