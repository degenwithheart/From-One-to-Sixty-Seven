# Supported Tech Stacks

Language-specific engineering rules for 16+ tech stacks.

---

## Available Stack Files

| Stack | File | Installation |
|-------|------|--------------|
| **Python** | [`stacks/python.md`](../stacks/python.md) | `cat stacks/python.md >> CLAUDE.md` |
| **TypeScript / JavaScript** | [`stacks/typescript.md`](../stacks/typescript.md) | `cat stacks/typescript.md >> CLAUDE.md` |
| **Go** | [`stacks/go.md`](../stacks/go.md) | `cat stacks/go.md >> CLAUDE.md` |
| **Rust** | [`stacks/rust.md`](../stacks/rust.md) | `cat stacks/rust.md >> CLAUDE.md` |
| **Java** | [`stacks/java.md`](../stacks/java.md) | `cat stacks/java.md >> CLAUDE.md` |
| **Kotlin** | [`stacks/kotlin.md`](../stacks/kotlin.md) | `cat stacks/kotlin.md >> CLAUDE.md` |
| **C# / .NET** | [`stacks/csharp.md`](../stacks/csharp.md) | `cat stacks/csharp.md >> CLAUDE.md` |
| **Ruby** | [`stacks/ruby.md`](../stacks/ruby.md) | `cat stacks/ruby.md >> CLAUDE.md` |
| **PHP** | [`stacks/php.md`](../stacks/php.md) | `cat stacks/php.md >> CLAUDE.md` |
| **Swift** | [`stacks/swift.md`](../stacks/swift.md) | `cat stacks/swift.md >> CLAUDE.md` |
| **Dart / Flutter** | [`stacks/dart.md`](../stacks/dart.md) | `cat stacks/dart.md >> CLAUDE.md` |
| **C / C++** | [`stacks/cpp.md`](../stacks/cpp.md) | `cat stacks/cpp.md >> CLAUDE.md` |
| **SQL** | [`stacks/sql.md`](../stacks/sql.md) | `cat stacks/sql.md >> CLAUDE.md` |
| **Terraform** | [`stacks/terraform.md`](../stacks/terraform.md) | `cat stacks/terraform.md >> CLAUDE.md` |
| **Docker / Kubernetes** | [`stacks/docker.md`](../stacks/docker.md) | `cat stacks/docker.md >> CLAUDE.md` |
| **Shell / Bash** | [`stacks/shell.md`](../stacks/shell.md) | `cat stacks/shell.md >> CLAUDE.md` |

---

## How to Use Stack Files

### Single Stack

```bash
# For Python project
cat stacks/python.md >> CLAUDE.md
```

### Multiple Stacks

```bash
# Full-stack: Python backend + TypeScript frontend
cat stacks/python.md >> CLAUDE.md
cat stacks/typescript.md >> CLAUDE.md
```

### Monorepo

For large monorepos with multiple stacks:

```bash
# Use MONOREPO variant
cp variants/MONOREPO.md CLAUDE.md

# Then append relevant stacks
cat stacks/python.md >> CLAUDE.md
cat stacks/typescript.md >> CLAUDE.md
cat stacks/go.md >> CLAUDE.md
```

---

## Stack Deep Dives

Comprehensive guides for popular stacks:

| Stack | Deep Dive |
|-------|-----------|
| **Python** | [Python Guide →](./stacks/python-guide.md) |
| **TypeScript** | [TypeScript Guide →](./stacks/typescript-guide.md) |
| **Go** | [Go Guide →](./stacks/go-guide.md) |

---

## Stack-Specific Rules

Each stack file includes:

- **Type system rules** — Type hints, strict mode, generics
- **Error handling** — Exceptions, Result types, error propagation
- **Async patterns** — async/await, goroutines, concurrency
- **Testing conventions** — Framework-specific testing patterns
- **Package management** — Dependencies, virtual environments
- **Code organization** — Project structure, imports
- **Framework-specific** — Django, React, Flask, etc.

---

## Framework Templates

Pre-configured specs for popular frameworks:

| Framework | Template |
|-----------|----------|
| **Next.js 14** | [`templates/frameworks/nextjs-fullstack/`](../templates/frameworks/nextjs-fullstack/) |

More framework templates coming soon (see [ROADMAP](../ROADMAP.md)).

---

## Adding New Stacks

Want support for a new language or stack?

1. Create `stacks/[language].md`
2. Include: types, error handling, async, testing, packages, structure
3. Follow existing stack file format
4. Submit PR

See [Contributing](../CONTRIBUTING.md) for guidelines.
