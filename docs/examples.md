# Examples: The Spec in Practice

Compliant vs non-compliant LLM responses side by side.

---

## Example 1: Bug Fix

**Request:** "The `calculate_discount` function returns wrong results for orders over £1000."

### Non-compliant
Returns a completely refactored function with new constants, renamed variables,
and a new `HIGH_VALUE_BONUS` dict that was never asked for. No test. No explanation.

### Compliant

> **Understanding:** The function produces incorrect output for orders above £1000.
> Before I fix it, I need to know: what should `calculate_discount(1500, "gold")` return,
> and what does it currently return? This pins the correct behaviour before I touch the code.
>
> **ASSUMPTIONS:** "Wrong results" means incorrect value, not a crash.
>
> *(After clarification)*
>
> ```python
> # Failing test first
> def test_gold_discount_on_high_value_order():
>     assert calculate_discount(1500, "gold") == 0.20
> ```
> Confirmed this fails. Now the fix: [minimal code change only]
>
> **SUMMARY:**
> - What changed: Added high-value bonus logic missing from the function
> - Why: Orders over £1000 weren't receiving the tier bonus
> - Verified: Failing test now passes; existing tests unchanged
> - Assumptions: Bonus thresholds confirmed before implementation
> - Risks: None — change is additive and localised

---

## Example 2: Ambiguous Feature Request

**Request:** "Add rate limiting to the API."

### Non-compliant
Immediately writes 200 lines: Redis-backed sliding window, configurable per-route limits,
Lua atomic scripts, `RateLimitConfig` dataclass, management endpoint.

### Compliant

> **Before implementing, I need to understand scope:**
>
> 1. Which endpoints? All, or specific ones (e.g. auth only)?
> 2. What limit? Requests per second/minute/hour?
> 3. Key: per IP, per user, per API key?
> 4. What happens when exceeded? 429? Queue? Shed?
> 5. Where does state live? In-memory, Redis, API gateway?
> 6. Is there existing middleware to plug into?
>
> **ASSUMPTIONS (proceeding if you confirm):**
> - Per-IP, all routes, 100 req/min, in-memory, 429 on exceed, no existing middleware.

---

## Example 3: Architecture Question

**Request:** "Should we use a message queue or direct HTTP between order and inventory service?"

### Non-compliant
Immediately recommends Kafka with a full implementation plan.

### Compliant

> **Option A: Direct HTTP**
> Simpler, tighter coupling, synchronous confirmation before order completes.
> Good when: order must confirm stock before accepting.
>
> **Option B: Message queue**
> Looser coupling, higher throughput, eventual consistency.
> Good when: high volume, tolerance for oversell, independent deployment cycles.
>
> **To recommend one I need:**
> 1. Can an order be accepted on an item that may be out of stock?
> 2. What's the expected order volume?
> 3. Do the services deploy and scale independently?
> 4. Is there an existing message broker in the stack?
>
> Without these, recommending one over the other is a silent assumption.

---

## Example 4: A Well-Formed SUMMARY Block

```
SUMMARY:
- What changed: Added input validation to `create_user` endpoint.
  Rejects requests missing `email` or `username`. Returns 422 with field-level errors.
- Why: Missing fields were reaching the DB layer and causing generic 500 errors.
- Verified: Three new tests added and passing — missing email, missing username, both missing.
  Existing passing tests unchanged. Manual curl test confirmed.
- Assumptions: Email format validation (RFC 5322) is out of scope — only presence checked.
  Confirm if format validation is also needed.
- Risks: None. Change is additive — valid requests are unaffected.
```
