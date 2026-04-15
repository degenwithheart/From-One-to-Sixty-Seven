# Stack: SQL
# Append to any root LLM spec file for SQL / database projects.

## Query Safety
- Parameterized queries only — never concatenate user input into SQL strings.
- No `SELECT *` in production code — enumerate columns explicitly.
- No queries inside loops — batch operations or use set-based SQL.

## Schema Changes
- Every migration must be reversible: always include a `down` migration.
- Never rename or drop a column in a single step — deprecate first, then remove in a later release.
- Adding a `NOT NULL` column requires a `DEFAULT` or a data backfill migration — never add without one.
- Index additions on large tables: use `CREATE INDEX CONCURRENTLY` (PostgreSQL) or equivalent non-locking syntax.

## Performance
- Explain slow queries with `EXPLAIN ANALYZE` (PostgreSQL) / `EXPLAIN FORMAT=JSON` (MySQL).
- All foreign keys must have corresponding indexes unless explicitly justified.
- Avoid `DISTINCT` as a fix for duplicates — fix the query logic instead.
- No correlated subqueries in `SELECT` lists where a `JOIN` would work.
- No functions on indexed columns in `WHERE` clauses — it prevents index use.

## Migrations (general)
- Migrations must be idempotent where the migration tool does not guarantee this.
- One logical change per migration file — no batching unrelated changes.
- Test the `down` migration in a local environment before committing.

## PostgreSQL Specific
- Use `BIGINT` / `BIGSERIAL` for new primary keys — not `INT` / `SERIAL`.
- Use `TIMESTAMPTZ` for all timestamps — not `TIMESTAMP`.
- Prefer `JSONB` over `JSON` for JSON columns.
- Use partial indexes where the `WHERE` clause is predictable and selective.

## MySQL / MariaDB Specific
- Use `InnoDB` engine for all tables.
- Use `DATETIME` or `TIMESTAMP` with explicit timezone handling.
- Prefer `VARCHAR(255)` over `TEXT` for indexed columns.

## Verification Checklist
- [ ] Migration applies cleanly from scratch
- [ ] Down migration applies cleanly
- [ ] No `SELECT *` in new queries
- [ ] Foreign keys have indexes
- [ ] No user input concatenated into query strings
- [ ] `EXPLAIN` reviewed for any new complex queries
