# Anti-Patterns Reference

The eight most common LLM engineering failures, with before/after examples.

---

## AP1: Silent Interpretation

**Request:** "Update the caching behaviour."

**Bad:** LLM changes TTL from 60s to 300s silently.

**Good:**
> I see two interpretations: (1) change the TTL duration, (2) add cache invalidation on write.
> Which did you mean? They have very different implications for consistency.

**Spec rule:** Rule 1.1 — present interpretations and ask. Never silently pick one.

---

## AP2: The Unnecessary Abstraction

**Request:** "Add an email field to the User model."

**Bad:** Returns a `FieldRegistry`, `ModelBuilder` interface, `UserBuilder`, and `FieldDescriptor` — plus the email field.

**Good:** One new field on the existing model. Nothing else.

**Spec rule:** Rule 2 — no new abstractions unless the task requires them.

---

## AP3: The Hidden Refactor

**Request:** "Fix the null check on line 42."

**Bad:** Fixed null check + renamed variables + reorganized imports + new utility helper.

**Good:** One fixed null check. Optional note: "I noticed the imports could be reorganized — want me to do that separately?"

**Spec rule:** Rule 3.2 — no hidden refactors. Separate refactor from feature.

---

## AP4: The Speculative Utility

**Request:** "Parse a date from this string."

**Bad:** A `DateUtils` class with `parseDate`, `formatDate`, `toISO`, `fromUnix`, `toRelative`, and `isWeekend` — "you might need these later."

**Good:** One `parse_date` function that does exactly what was asked.

**Spec rule:** Rule 14 — no speculative utility functions. YAGNI.

---

## AP5: The Unverified Fix

**Request:** "Fix the divide-by-zero error."

**Bad:** Guards the specific line — but introduces a different divide-by-zero two lines later.

**Good:** Identifies the root cause, writes a test for zero input, fixes it, confirms the test passes, checks adjacent logic.

**Spec rule:** Rule 10 — verification checklist. Rule 4 — reproduce with a test first.

---

## AP6: The Hallucinated API

**Request:** "Use the AWS SDK to list all S3 buckets."

**Bad:** Calls `s3.listAllBuckets()` — a method that does not exist.

**Good:** Uses the correct method with an explicit assumption note: "ASSUMPTION: using `s3.list_buckets()` from boto3 v1.x — please verify against your SDK version."

**Spec rule:** Rule 15 — declare assumptions. Rule 10 — verify types and imports.

---

## AP7: Context Drift

**Session start:** "Do not add any new dependencies."

**Turn 18:** LLM adds a new dependency without comment.

**Fix:** Use the session refresh prompt every 10-15 turns. State constraints again. The Final Sanity Statement at the end of each change also re-anchors constraints.

**Spec rule:** Rule 19 — self-correction loop. Templates: `SESSION_KICKOFF.md` refresh prompt.

---

## AP8: The Confident Wrong Answer

**Request:** "Is it safe to delete the `user_sessions` table?"

**Bad:** "Yes, it appears to only be written by the auth service and has no foreign key references." (Wrong — the analytics pipeline reads it nightly.)

**Good:** "I can only see what's in the files shared with me. Before deleting this table I'd recommend grepping all codebases and CI jobs for `user_sessions` references. I cannot safely confirm this without that search."

**Spec rule:** Rule 13 — ask for human guidance when business logic or cross-system impact is uncertain.
