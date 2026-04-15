# Variant: MONOREPO
# For large monorepos with multiple teams, packages, and services.

## M1: Understand the Repo Map First

Before any change:
1. Identify which package/service/module owns the code.
2. Identify the package's public API (exported symbols, REST contract, event schema).
3. Identify downstream consumers — use `nx graph`, `turborepo`, `bazel query`, or grep.
4. Do not assume nothing depends on something — check.

## M2: Package Boundary Discipline

- Do not import internal (non-exported) symbols from another package.
- Do not create new cross-package imports without understanding the dependency graph.
- No circular dependencies between packages.
- To share code: move to `shared/` or `common/` by explicit decision, not convenience.

When creating new cross-package imports, state:
```
NEW DEPENDENCY: packages/auth → packages/core
Reason:
Direction is correct because:
```

## M3: Layering Rules

Typical layer order (do not violate):
```
app/presentation  →  service/use-case  →  domain  →  infra
```
No upward imports. No sideways imports that violate architecture.
If the repo has an architecture doc — read it before crossing layers.

## M4: Affected Package Scope

When changing a shared package, declare all affected packages:
```
AFFECTED PACKAGES:
- packages/core (changed)
- packages/auth (imports core — verify)
- packages/api  (imports core — verify)
```
Run tests for all affected packages, not just the changed one.

## M5: Build System

- Respect the build system (Nx, Turborepo, Bazel, Lerna).
- Run affected-only builds: `nx affected:test`, `turbo run test --filter=...`
- Do not modify shared build cache outputs directly.

## M6: Shared Configuration

Before modifying workspace-level config (`tsconfig.base.json`, root `eslint.config.js`,
root `package.json`): understand all inheriting packages and verify the change does not break any.
Shared config has the broadest blast radius in a monorepo.

## M7: Cross-Team Changes

- Do not merge changes to code owned by another team without their review.
- Tag the owning team in the PR.
- Prefer proposing the interface change and letting the owner implement.

## Monorepo Final Statement

```
MONOREPO SUMMARY:
- Packages changed:
- Packages affected downstream:
- New cross-package dependencies:
- Layering violations: none / [explain]
- Build system impact:
- Cross-team review needed: yes/no
```
