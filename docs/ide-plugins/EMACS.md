# FOTS Emacs Package

## Installation

### Using MELPA
```elisp
;; Add to init.el or .emacs
(use-package fots
  :ensure t
  :config
  (global-fots-mode 1))
```

### Using straight.el
```elisp
(straight-use-package
 '(fots :type git :host github
        :repo "From-One-to-Sixty-Seven/fots-emacs"))
```

### Manual Installation
```bash
git clone https://github.com/From-One-to-Sixty-Seven/fots-emacs.git ~/.emacs.d/site-lisp/fots
```

```elisp
(add-to-list 'load-path "~/.emacs.d/site-lisp/fots")
(require 'fots)
(global-fots-mode 1)
```

## Features

### Snippets (YASnippet)

| Key | Description |
|-----|-------------|
| `fots-sum` | SUMMARY block |
| `fots-ass` | ASSUMPTIONS block |
| `fots-sec` | SECURITY NOTE block |
| `fots-ent` | Enterprise summary |
| `fots-rev` | Security review |

### Commands

```elisp
M-x fots-insert-summary      ;; Insert SUMMARY block
M-x fots-insert-assumptions  ;; Insert ASSUMPTIONS block
M-x fots-insert-security     ;; Insert SECURITY NOTE
M-x fots-validate-file       ;; Validate current file
M-x fots-check-project       ;; Check entire project
M-x fots-status              ;; Show FOTS status
M-x fots-show-doc            ;; Show documentation
```

### Key Bindings

Default prefix: `C-c f`

| Binding | Command |
|---------|---------|
| `C-c f s` | Insert SUMMARY |
| `C-c f a` | Insert ASSUMPTIONS |
| `C-c f x` | Insert SECURITY NOTE |
| `C-c f v` | Validate file |
| `C-c f c` | Check project |
| `C-c f i` | Show FOTS status |

## Configuration

```elisp
;; init.el

;; Enable FOTS globally
(global-fots-mode 1)

;; Or enable only for specific modes
(add-hook 'python-mode-hook 'fots-mode)
(add-hook 'typescript-mode-hook 'fots-mode)

;; Customization
(setq fots-enable-flycheck t)
(setq fots-rules '("summary" "assumptions" "security" "tests"))
(setq fots-snippet-directory "~/.config/fots/snippets")

;; Custom key bindings
(define-key fots-mode-map (kbd "C-c s") 'fots-insert-summary)
(define-key fots-mode-map (kbd "C-c a") 'fots-insert-assumptions)
```

## Flycheck Integration

```elisp
;; Enable FOTS linting with flycheck
(require 'flycheck-fots)
(add-hook 'prog-mode-hook 'flycheck-mode)
```

## Company Mode Integration

```elisp
;; Add FOTS completion backend
(add-to-list 'company-backends 'company-fots)
```

## Modeline Integration

```elisp
;; Show FOTS status in modeline
(setq fots-show-in-modeline t)

;; Or use with doom-modeline
(doom-modeline-def-segment fots
  "FOTS compliance status."
  (when (fots-project-p)
    (let ((status (fots-get-status)))
      (concat
       " "
       (propertize
        (format "FOTS:%s" (car status))
        'face (if (cdr status) 'success 'warning))))))

(add-to-list 'doom-modeline-segments 'fots)
```

## Org Mode Integration

```elisp
;; Export FOTS compliance reports to Org
(require 'fots-org)

;; Generate report as Org table
M-x fots-generate-org-report
```

## Troubleshooting

### Package not loading
```elisp
;; Check load path
(add-to-list 'load-path (expand-file-name "~/.emacs.d/site-lisp/fots"))
(require 'fots)
```

### Snippets not expanding
Ensure YASnippet is installed:
```elisp
(use-package yasnippet
  :ensure t
  :config
  (yas-global-mode 1))
```

### Validation not working
Check FOTS CLI installation:
```elisp
M-x fots-check-installation
```
