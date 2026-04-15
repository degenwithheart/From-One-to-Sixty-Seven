# Stack: TypeScript / JavaScript
# Append to any root LLM spec file for TypeScript/JavaScript projects.

## Type Safety
- Respect `strict` mode — never disable strict flags.
- No `any` unless genuinely necessary. Prefer `unknown` + type narrowing.
- No `as T` casts unless provably safe. Never `as unknown as T`.
- No `!` non-null assertions unless the null case is truly impossible.
- Use `satisfies` for object literal validation where appropriate.

## Null & Undefined
- Distinguish `null` (intentional absence) from `undefined` (not set).
- Use `?.` and `??` — not `||` for null checks (it catches falsies, not just nulls).

## Async / Promises
- Always `await` or `.catch()` promises that can reject.
- Never fire-and-forget without explicit error handling.
- Do not mix `.then()` chains and `async/await` in the same function.

## Imports
- Named imports preferred over default imports.
- No barrel exports of everything — be explicit.
- No `require()` in TypeScript files unless interoperating with CJS.
- Respect path aliases defined in `tsconfig.json`.

## React (if applicable)
- Define a `Props` type or interface for every component — no `any` props.
- Never mutate state directly.
- `useCallback`/`useMemo` only with a measured performance reason.
- List keys must be stable and unique — never array index.

## Node.js (if applicable)
- No synchronous fs methods (`readFileSync`) in request handlers.
- Validate `process.env` variables at startup, not at call site.

## Formatting & Linting
- Respect `eslint` and `prettier` configs.
- No inline `// eslint-disable` without a comment explaining why.
- No whole-file reformats — keep diffs clean.

## Verification Checklist
- [ ] `tsc --noEmit` passes
- [ ] ESLint passes
- [ ] Tests pass
- [ ] No `any` without justification
- [ ] No unhandled promises
- [ ] No inline eslint-disable without explanation
