# FOTS Vim Plugin

## Installation

### Using vim-plug
```vim
" Add to .vimrc or init.vim
Plug 'From-One-to-Sixty-Seven/fots-vim'
```

### Using Vundle
```vim
Plugin 'From-One-to-Sixty-Seven/fots-vim'
```

### Manual Installation
```bash
git clone https://github.com/From-One-to-Sixty-Seven/fots-vim.git ~/.vim/pack/plugins/start/fots-vim
```

## Features

### Snippets
Type trigger + `<Tab>` to expand:

| Trigger | Description |
|---------|-------------|
| `fotsum` | SUMMARY block |
| `fotass` | ASSUMPTIONS block |
| `fotsec` | SECURITY NOTE block |
| `fotent` | Enterprise summary |
| `fotrev` | Security review checklist |
| `fotsch` | Schema change documentation |
| `fotdep` | Dependency change doc |

### Commands

```vim
:FotsValidate          " Validate current file
:FotsCheck             " Run compliance check on all files
:FotsStatus            " Show FOTS installation status
:FotsInsertSummary     " Insert SUMMARY at cursor
:FotsInsertAssumptions " Insert ASSUMPTIONS at cursor
:FotsInsertSecurity    " Insert SECURITY NOTE at cursor
```

### Key Mappings

Default mappings (customizable):

```vim
nmap <leader>fs :FotsInsertSummary<CR>
nmap <leader>fa :FotsInsertAssumptions<CR>
nmap <leader>fx :FotsInsertSecurity<CR>
nmap <leader>fv :FotsValidate<CR>
```

### Syntax Highlighting

The plugin provides syntax highlighting for:
- SUMMARY blocks
- ASSUMPTIONS blocks
- SECURITY NOTE blocks
- TODO markers with priority levels

## Configuration

```vim
" ~/.vimrc

" Enable/disable features
g:fots_enable_snippets = 1
g:fots_enable_linting = 1
g:fots_enable_statusline = 1

" Custom snippets directory
g:fots_snippets_dir = '~/.config/fots/snippets'

" Validation rules
g:fots_rules = ['summary', 'assumptions', 'security', 'tests']

" Key mappings (disable defaults first)
let g:fots_no_default_mappings = 1
nmap <C-s> :FotsInsertSummary<CR>
nmap <C-a> :FotsInsertAssumptions<CR>
```

## Linting Integration

Works with ALE or Syntastic:

```vim
" ALE configuration
let g:ale_linters = {
\   'python': ['fots', 'flake8'],
\   'javascript': ['fots', 'eslint'],
\   'typescript': ['fots', 'tslint'],
\}

" Custom linting options
let g:ale_fots_options = '--rules summary,assumptions,security'
```

## Status Line Integration

```vim
" Show FOTS status in airline
let g:airline_section_x = '%{fots#status()}'

" Show FOTS status in lightline
let g:lightline = {
\   'component_function': {
\     'fots': 'fots#status',
\   },
\}
```

## Troubleshooting

### FOTS commands not found
Ensure plugin is loaded:
```vim
:scriptnames | grep fots
```

### Snippets not working
Check if snippet plugin is installed:
```vim
:echo exists('g:loaded_snips')
```

### Validation errors
Check FOTS installation:
```vim
:FotsStatus
```
