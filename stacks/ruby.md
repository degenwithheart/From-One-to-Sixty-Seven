# Stack: Ruby
# Append to any root LLM spec file for Ruby projects.

## Style
- Follow the existing style guide: RuboCop config, Shopify Ruby Style Guide, or project `.rubocop.yml`.
- No whole-file reformats — match surrounding code style.
- Prefer `frozen_string_literal: true` comment in new files if the project uses it.

## Error Handling
- No bare `rescue` — catch specific exception classes.
- Do not silence exceptions with `rescue nil` without a comment explaining why.
- Re-raise with context: `raise MyError, "context: #{original.message}"`.

## Blocks & Procs
- Use `do...end` for multi-line blocks, `{ }` for single-line blocks.
- Use `Symbol#to_proc` (`&:method_name`) for simple transformations.
- Do not store blocks in variables unless the use case requires a Proc or Lambda.

## ActiveRecord (Rails — if applicable)
- No N+1 queries — use `includes`, `preload`, or `eager_load`.
- No raw SQL string interpolation — use parameterized queries or Arel.
- Scopes must be chainable — never return nil from a scope.
- Callbacks: avoid `before_save` / `after_create` for complex business logic — use service objects.
- Migrations: always provide a `down` method. Do not drop columns without a deprecation period.

## Testing (RSpec / Minitest)
- RSpec: use `describe` / `context` / `it` with behaviour descriptions.
- No `let!` when `let` is sufficient.
- Factories (FactoryBot): build the minimum required data — no kitchen-sink factories.
- No `sleep` in tests — use proper async/retry mechanisms.

## Gems & Bundler
- Respect `Gemfile.lock` — do not add gems without updating it.
- No gems with known security advisories (check `bundle audit`).

## Verification Checklist
- [ ] `rubocop` passes
- [ ] `rspec` / `rake test` passes
- [ ] No bare `rescue`
- [ ] No N+1 queries (check with Bullet or query logs)
- [ ] Migrations are reversible
