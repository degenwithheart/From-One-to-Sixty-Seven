---
name: debug
description: Structured debugging protocol. Use when investigating bugs or unexpected behavior. Do not guess and patch.
argument-hint: [description of the issue]
---

# Command: /debug
# Usage: /debug [description of the issue]
#
# Structured debugging protocol. Do not guess and patch.

## Debug Protocol

1. **Understand the symptom**
   - What is the observed behaviour?
   - What is the expected behaviour?
   - When did it start? What changed?

2. **Hypothesize**
   - List 2-3 possible root causes ranked by likelihood.
   - Do not jump to the first plausible explanation.

3. **Investigate**
   - Read the relevant code paths.
   - Narrow down which hypothesis is correct before writing any fix.

4. **Reproduce**
   - Write a minimal test or script that reliably triggers the bug.
   - Confirm it fails against current code.

5. **Fix**
   - Apply the minimum change that resolves the root cause.
   - Do not fix symptoms — fix causes.

6. **Verify**
   - Confirm the reproduction test now passes.
   - Run the full test suite for regressions.

## Output Format

```
DEBUG REPORT:
- Symptom:
- Root cause identified:
- Hypotheses ruled out:
- Reproduction: [test name or steps]
- Fix applied:
- Verified: yes/no
- Regressions: none / [list]
```
