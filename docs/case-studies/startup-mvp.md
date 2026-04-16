# Case Study: Startup MVP Development

How a pre-launch startup used the Lean Startup variant to move fast without breaking things.

---

## Background

**Company:** Fintech startup (stealth mode)  
**Team:** 3 founders (1 technical)  
**Stage:** Pre-launch, building MVP  
**Timeline:** 8 weeks to first customer pilot  
**Tech Stack:** Python/FastAPI, React, PostgreSQL

**Challenge:** Move fast enough to launch in 8 weeks while maintaining enough quality to not embarrass themselves with early customers.

---

## The Problem

The sole technical founder was using Claude Code to accelerate development. But problems emerged:

**Week 1 (No spec):**
- Generated 300-line refactors for simple tasks
- Added 5 unused utility functions "for later"
- Changed database schema 3 times without migrations
- Spent more time fixing AI mistakes than using AI output

**Symptoms:**
- "The AI keeps over-engineering simple features"
- "I have 6 different caching implementations"
- "Every fix breaks something else"
- "Code review is basically a rewrite"

The founder needed AI assistance to maintain velocity, but without the quality problems.

---

## The Solution

### Choosing the Lean Startup Variant

After reviewing the variants, the founder chose `variants/LEAN_STARTUP.md`:

**Why Lean Startup:**
- Relaxed non-critical rules for speed
- Kept security rules strict (fintech)
- Maintained core behavioral principles
- Designed for pre-launch/MVP phase

**Key differences from base spec:**
```markdown
## Relaxations for MVP Speed

- SUMMARY blocks optional for < 20 line changes
- Can skip detailed assumption declaration for obvious tasks
- Tests can be manual for simple UI changes
- "TODO" comments allowed with ticket reference

## Maintained Requirements

- Security rules unchanged (fintech)
- No hardcoded secrets
- No SQL injection vulnerabilities
- Input validation at boundaries
```

### Implementation

**Week 2:**
```bash
# Install Lean Startup variant
cp From-One-to-Sixty-Seven/variants/LEAN_STARTUP.md CLAUDE.md

# Add Python stack rules for type hints
cat From-One-to-Sixty-Seven/stacks/python.md >> CLAUDE.md

# Add fintech-specific rules
cat >> CLAUDE.md << 'EOF'

## Fintech-Specific Rules

- All financial calculations use Decimal, never float
- All transactions logged immutably
- All user actions have audit trail
- No production data in logs
EOF

# Commit
git add CLAUDE.md
git commit -m "Add Lean Startup spec for MVP phase"
```

**Configuration:**
```bash
# Claude skills for security
mkdir -p .claude/skills/security
cp From-One-to-Sixty-Seven/.claude/skills/security/SKILL.md \
   .claude/skills/security/
```

---

## The Results

### Week 3-4: Stabilization

**Immediate changes:**
- AI stopped over-engineering
- Changes became focused and minimal
- Database migrations appeared consistently
- Security rules enforced automatically

**Example: Payment processing feature**

**Before spec:**
```markdown
Task: Add payment processing

AI response:
- 500 lines across 8 files
- New abstraction layers: PaymentGateway, PaymentProcessor, 
  PaymentStrategy, PaymentRegistry
- Added support for 5 payment providers (only Stripe needed)
- Included features for: refunds, disputes, subscriptions, invoicing
- Time to clean up: 4 hours
```

**After spec:**
```markdown
Task: Add payment processing

AI response:
- 150 lines across 3 files
- Simple function: process_stripe_payment()
- Security block automatically included
- Input validation at API boundary
- SUMMARY: Clear explanation of changes
- Time to review: 15 minutes
- Time to clean up: 0 (production ready)
```

### Week 5-6: Acceleration

**Velocity metrics:**

| Metric | Before | After |
|--------|--------|-------|
| Features completed/week | 2-3 | 5-6 |
| Time fixing AI output | 40% | 5% |
| Code review time | 2 hours/PR | 20 min/PR |
| Rollbacks | 2/week | 0 |
| Security issues found | 1-2/week | 0 |

**Security benefits:**
- No SQL injection vulnerabilities introduced
- All API endpoints validated input
- Secrets properly externalized
- Audit trails on all financial actions

### Week 7-8: Launch Preparation

**Quality assurance:**
```markdown
- Security audit: Passed (no critical issues)
- Penetration test: No high-severity findings
- Code review: Minimal changes needed
- Performance: Acceptable for pilot load
```

**Customer pilot:**
- 5 beta customers onboarded
- 0 security incidents
- 1 minor bug found (fixed in 1 hour)
- Customers impressed with stability

---

## Key Wins

### 1. Maintained Security While Moving Fast

The security rules in Lean Startup variant prevented the common "move fast and break things" security problems:

```markdown
SECURITY NOTE automatically added for payment code:
- Boundary: Payment API
- Input validation: amount > 0, valid currency
- Secrets: Stripe key from env var
- Audit: All transactions logged
```

### 2. Eliminated Over-Engineering

The "minimal change" and "no new abstractions" rules kept code simple:

```python
# Before spec: Over-engineered
def process_payment(self, payment_request):
    strategy = PaymentStrategyFactory.get_strategy(
        payment_request.provider
    )
    processor = PaymentProcessor(strategy)
    result = processor.process(payment_request)
    return PaymentResultAdapter.adapt(result)

# After spec: Simple and clear
def process_stripe_payment(amount, currency, user_id):
    """Process payment via Stripe."""
    if amount <= 0:
        raise ValueError("Amount must be positive")
    
    stripe.api_key = os.environ["STRIPE_KEY"]
    
    try:
        charge = stripe.Charge.create(
            amount=int(amount * 100),
            currency=currency,
            customer=user_id
        )
        log_transaction(user_id, amount, currency, "success")
        return charge.id
    except stripe.error.CardError as e:
        log_transaction(user_id, amount, currency, "failed")
        raise PaymentError(str(e))
```

### 3. Reduced Debugging Time

The structured approach caught issues early:

- Assumption declaration surfaced misunderstandings immediately
- Verification checklist prevented "it works on my machine"
- Minimal changes made bugs easier to locate

**Example:**
```markdown
AI: "Assumption: Payment webhooks come from Stripe IPs"

Founder: "Actually, we use Stripe's signature verification, not IP."

Result: Fixed before implementation, saving hours of debugging.
```

### 4. Scalable Foundation

The MVP code was actually production-quality:

```markdown
Post-launch (6 months later):
- Original MVP code still in production
- Minimal technical debt
- Easy to extend with new features
- No major refactors needed
```

---

## Lessons Learned

### What Worked

**1. Right Variant Selection**
- Lean Startup was perfect for MVP phase
- Security rules strict enough for fintech
- Speed optimizations genuinely helped

**2. Custom Rules for Domain**
- Fintech-specific rules caught financial calculation issues
- Decimal vs float rule prevented rounding errors
- Audit trail rule ensured compliance

**3. Gradual Relaxation**
- Started with base spec
- Switched to Lean Startup after measuring overhead
- Maintained security rigor throughout

### What Didn't Work (Initially)

**1. Trying to Use Full Enterprise Spec**
- Too much overhead for MVP phase
- Unnecessary for pre-launch
- Slowed down without adding value

**Fix:** Switched to Lean Startup variant

**2. Not Adding Domain-Specific Rules**
- Generic spec missed fintech concerns
- First draft had float arithmetic
- Could have caused real financial errors

**Fix:** Added custom fintech rules

**3. Forgetting to Refresh Sessions**
- Long sessions drifted from spec
- Started getting over-engineered solutions again
- Took time to realize why

**Fix:** Session refresh prompts every 10-15 exchanges

---

## The Numbers

### 8-Week Summary

| | Before Spec | After Spec |
|---|---|---|
| **Development** |
| Features completed | 10 | 25 |
| Lines of code | 8,000 | 4,500 |
| Files created | 120 | 65 |
| **Quality** |
| Critical bugs in production | 3 | 0 |
| Security issues | 2 | 0 |
| Rollbacks required | 8 | 0 |
| **Effort** |
| Time fixing AI mistakes | 40% | 5% |
| Code review time | 2 hrs/PR | 20 min/PR |
| Context switches | High | Low |
| **Outcome** |
| Launch date | Missed by 2 weeks | On time |
| Pilot customers | N/A | 5 |
| Customer feedback | N/A | Positive |

---

## Adoption Tips for Startups

### 1. Start with Base, Adjust as Needed

```bash
# Start conservative
cp From-One-to-Sixty-Seven/CLAUDE.md .

# Use for 1 week
# Measure overhead

# If too slow for your phase:
cp From-One-to-Sixty-Seven/variants/LEAN_STARTUP.md CLAUDE.md
# Keep your custom rules
```

### 2. Add Domain-Specific Rules Early

```bash
# After copying spec, immediately add:
cat >> CLAUDE.md << 'EOF'

## [Your Domain] Rules

- [critical rule 1]
- [critical rule 2]
EOF
```

### 3. Security is Non-Negotiable

Even in Lean Startup, security rules remain:
- No hardcoded secrets
- Input validation
- SQL injection prevention
- Proper error handling

### 4. Measure and Iterate

**Week 1 metrics:**
- Time spent fixing AI output
- Number of hidden refactors
- Code review time

**Adjust if:**
- Overhead > 20% of time
- Team frustration high

**Don't adjust:**
- Security rules
- Core behavioral principles

---

## Post-MVP: Transitioning to Production

### Month 3: Scaling Up

As the startup grew, they transitioned from Lean Startup to base spec:

```bash
# Switch to base spec
cp From-One-to-Sixty-Seven/CLAUDE.md .
# Keep custom fintech rules
cat >> CLAUDE.md << 'EOF'

## Fintech Rules (carried forward)
...
EOF
```

**Why:**
- Team larger, need more consistency
- More customers, quality matters more
- Technical debt becomes expensive

### Month 6: Team Onboarding

New developers got spec from day one:

```markdown
Onboarding checklist:
- [ ] Install Claude Code
- [ ] Verify spec is loaded
- [ ] Do test task
- [ ] Review with senior dev
```

### Year 1: Enterprise Preparation

As they approached enterprise customers:

```bash
# Switch to ENTERPRISE variant for compliance
cp From-One-to-Sixty-Seven/variants/ENTERPRISE.md CLAUDE.md
# Keep fintech rules
```

---

## Key Takeaways

1. **Right tool for the phase:** Lean Startup for MVP, stricter for production
2. **Security always matters:** Even moving fast, security rules stay
3. **Custom rules add value:** Domain-specific rules catch real issues
4. **Measure and adjust:** Don't stick with what isn't working
5. **Foundation matters:** Good MVP code becomes good production code

---

## See Also

- [Lean Startup Variant](../../variants/LEAN_STARTUP.md)
- [Migration Guide](../migration.md)
- [Best Practices](../best-practices.md)
