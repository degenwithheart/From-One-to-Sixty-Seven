# Migration Guide

How to adopt From One to Sixty-Seven in existing projects and teams.

---

## Migration Strategies

### Strategy 1: Greenfield (New Projects)

**Best for:** Starting fresh  
**Effort:** Low  
**Timeline:** Immediate

**Steps:**
1. Copy spec files before first commit
2. Include in initial project setup
3. Team uses from day one

**Advantage:** No legacy habits to overcome

---

### Strategy 2: Gradual Rollout (Existing Projects)

**Best for:** Active projects with team  
**Effort:** Medium  
**Timeline:** 2-4 weeks

**Phases:**

**Week 1: Awareness**
- Share Getting Started guide
- Demonstrate with examples
- No enforcement yet

**Week 2: Opt-In**
- Volunteers try spec
- Share experiences
- Refine custom rules

**Week 3: Default**
- Spec becomes default
- Education continues
- Gentle reminders

**Week 4: Enforced**
- PR template checks
- Team-wide compliance
- Measure effectiveness

---

### Strategy 3: Pilot Team

**Best for:** Large organizations  
**Effort:** Medium  
**Timeline:** 1-2 months

**Approach:**
1. Select 2-3 early adopters
2. Pilot team uses spec exclusively
3. Measure results vs control group
4. Refine based on feedback
5. Roll out to broader team

**Advantage:** Proof of concept with data

---

### Strategy 4: Big Bang

**Best for:** Small teams, urgent need  
**Effort:** High  
**Timeline:** 1 week

**Approach:**
- All team members switch simultaneously
- Intensive training week
- Immediate enforcement

**Risk:** Change fatigue, resistance  
**Mitigation:** Strong leadership support

---

## Project-Specific Migration

### Adding to Existing Codebase

**Step 1: Assess Current State**
```bash
# Check existing AI usage patterns
grep -r "TODO\|FIXME\|XXX" src/ | wc -l
# High count = cleanup needed

# Check test coverage
pytest --cov=src --cov-report=term-missing
# Low coverage = focus on testing rules

# Check for security issues
bandit -r src/
# Issues found = security variant needed
```

**Step 2: Choose Variant**

| Current State | Recommended Variant |
|---------------|-------------------|
| Fast-moving startup | LEAN_STARTUP |
| Production system | Base or ENTERPRISE |
| Security-critical | SECURITY_HARDENED |
| Low test coverage | TEST_FIRST |
| Large monorepo | MONOREPO |

**Step 3: Install Spec**
```bash
# Copy appropriate files
cp /path/to/From-One-to-Sixty-Seven/CLAUDE.md .
cp -r /path/to/From-One-to-Sixty-Seven/.claude .

# Add stack rules
cat /path/to/From-One-to-Sixty-Seven/stacks/python.md >> CLAUDE.md

# Commit
git add CLAUDE.md .claude/
git commit -m "Add From One to Sixty-Seven behavioral contract"
```

**Step 4: Team Onboarding**
- Share installation guide
- Pair programming sessions
- Answer questions

**Step 5: Monitor and Adjust**
- Track first week closely
- Address issues quickly
- Refine custom rules

---

## Team Migration

### Individual Developer Onboarding

**Day 1: Setup**
1. Install AI assistant
2. Copy spec files
3. Verify installation works
4. Do test task

**Day 2-3: Learning**
1. Use spec for real tasks
2. Make mistakes, learn from them
3. Ask questions
4. Get comfortable with workflow

**Day 4-5: Integration**
1. Use spec as default
2. Help others if needed
3. Provide feedback

### Team Onboarding Checklist

**Preparation:**
- [ ] Spec files added to repo
- [ ] Installation docs shared
- [ ] Team meeting scheduled
- [] Demo prepared

**Kickoff Meeting:**
- [ ] Explain why spec
- [ ] Demo installation
- [ ] Show example session
- [ ] Share success stories
- [ ] Q&A

**First Week:**
- [ ] Daily check-ins
- [ ] Address blockers
- [ ] Collect feedback
- [ ] Adjust as needed

**First Month:**
- [ ] Weekly team sync on spec usage
- [ ] Measure effectiveness
- [ ] Refine custom rules
- [ ] Celebrate wins

---

## Retrofitting Team Workflows

### Code Review Changes

**Before:**
```markdown
Reviewers check:
- Code works
- Tests pass
- Style consistent
```

**After:**
```markdown
Reviewers check:
- Code works
- Tests pass
- Style consistent
- Spec compliance:
  - [ ] Goal correctly interpreted
  - [ ] Changes are minimal
  - [ ] Assumptions declared (if ambiguous)
  - [ ] SUMMARY block present
```

### PR Template Update

```markdown
## Changes
[description]

## From One to Sixty-Seven Checklist
- [ ] AI restated goal before coding
- [ ] Assumptions declared (if needed)
- [ ] Changes are minimal
- [ ] No hidden refactors
- [ ] Tests included
- [ ] SUMMARY block present

## Verification
- [ ] All tests pass
- [ ] Manual testing done
- [ ] Edge cases handled
```

### CI/CD Integration

```yaml
# .github/workflows/spec-compliance.yml
name: Spec Compliance

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Custom script to check AI-generated files
      - name: Check SUMMARY blocks
        run: |
          # Find AI-generated files (custom logic)
          # Check for SUMMARY blocks
          # Report violations
```

---

## Addressing Resistance

### Common Concerns

**"This slows me down"**
- Response: Use LEAN_STARTUP variant for MVP work
- Response: Short mode for trivial tasks
- Response: Long-term speed comes from fewer bugs

**"The AI doesn't follow it anyway"**
- Response: Check installation guide
- Response: May need tool-specific adjustments
- Response: Consider switching to better-following model (Claude)

**"Too bureaucratic"**
- Response: Skip non-critical rules for small tasks
- Response: SUMMARY blocks are optional for one-liners
- Response: Value is in predictability, not process

**"We already have code review"**
- Response: Spec catches issues before human review
- Response: Smaller diffs = faster review
- Response: Less time debugging AI bugs

### Building Support

**Champions:**
- Identify 1-2 enthusiastic early adopters
- Let them become advocates
- Share their success stories

**Demonstrate Value:**
- Before/after diff comparison
- Bug count reduction
- Review time metrics
- Developer satisfaction

**Leadership Support:**
- Get manager buy-in
- Include in team goals
- Allocate learning time

---

## Measuring Success

### Metrics to Track

**Quantitative:**
- Bugs introduced by AI changes (before/after)
- PR review time (before/after)
- Rollback rate of AI changes
- Test coverage change
- Time spent debugging

**Qualitative:**
- Developer confidence in AI output
- Reviewer satisfaction
- Time to onboard new devs
- Code maintainability

### Baseline Measurement

**Before migration:**
```bash
# Measure for 2 weeks
# Track:
- AI-generated bugs found in production
- Average PR review time
- Developer complaints about AI
- Time spent fixing AI mistakes
```

**After migration:**
```bash
# Measure for 2 weeks
# Compare to baseline
```

### Success Criteria

| Metric | Target |
|--------|--------|
| AI-introduced bugs | -50% |
| PR review time | -25% |
| Rollback rate | -75% |
| Developer confidence | +30% |

---

## Troubleshooting Migration Issues

### "Installation doesn't work"

**Check:**
- File locations correct?
- Permissions correct?
- Tool-specific requirements met?

**Solution:**
- Review installation guide
- Try fresh clone
- Check for conflicting configs

### "Team not adopting"

**Check:**
- Training adequate?
- Value clear?
- Enforcement appropriate?

**Solution:**
- Additional training
- Pair programming
- Gradual rollout instead of big bang

### "Spec doesn't fit our needs"

**Check:**
- Right variant selected?
- Custom rules added?
- Stack rules included?

**Solution:**
- Add project-specific rules
- Customize for workflow
- Share customizations upstream

---

## Gradual Adoption Patterns

### By Rule

**Phase 1:** SUMMARY blocks only
- Easiest to adopt
- Immediate visibility
- Builds habit

**Phase 2:** Assumption declaration
- Catches misinterpretations
- Improves communication

**Phase 3:** Minimal changes
- Reduces review burden
- Catches hidden refactors

**Phase 4:** Full spec
- All rules active

### By Tool

**Phase 1:** One AI assistant
- Get spec working with primary tool
- Perfect the workflow

**Phase 2:** Additional assistants
- Expand to other tools
- Share configs

### By Project

**Phase 1:** Greenfield project
- No legacy code
- Clean adoption

**Phase 2:** Active project
- Learn from greenfield
- Apply lessons

**Phase 3:** Legacy project
- Gradual adoption
- Focus on new code

---

## Rollback Plan

### If Adoption Fails

**Decision point:** After 1 month

**Criteria for rollback:**
- Team productivity significantly decreased
- Developer satisfaction very low
- More issues than before
- No improvement path visible

**Rollback steps:**
1. Remove spec files from repo
2. Revert to previous workflow
3. Post-mortem: what went wrong?
4. Document lessons learned

**Partial rollback:**
- Keep parts that worked
- Remove parts that didn't
- Iterate on approach

---

## Special Cases

### Legacy Codebases

**Challenge:** Years of accumulated patterns

**Approach:**
1. Apply spec to new code only
2. Gradually update old code
3. Don't try to fix everything at once
4. Focus on safety rules (security, errors)

### Multi-Language Projects

**Challenge:** Different stacks in one repo

**Approach:**
1. Use MONOREPO variant
2. Add all relevant stack files
3. Use .mdc conditional loading (Cursor)
4. Separate specs by directory if needed

### Remote Teams

**Challenge:** Asynchronous communication

**Approach:**
1. Document heavily
2. Use async-friendly tools
3. Spec ensures consistency across time zones
4. SUMMARY blocks help with context

---

## Checklist: Full Migration

### Week 1: Planning
- [ ] Choose migration strategy
- [ ] Select appropriate variant
- [ ] Identify pilot team/champions
- [ ] Schedule kickoff meeting
- [ ] Prepare training materials

### Week 2: Installation
- [ ] Install spec in repository
- [ ] Team installs AI assistants
- [ ] Team copies config files
- [ ] Verify installations work
- [ ] Do test tasks

### Week 3: Training
- [ ] Kickoff meeting
- [ ] Pair programming sessions
- [ ] Daily check-ins
- [ ] Address issues
- [ ] Collect feedback

### Week 4: Adoption
- [ ] Spec becomes default
- [ ] Monitor compliance
- [ ] Refine custom rules
- [ ] Measure effectiveness
- [ ] Celebrate wins

### Month 2: Optimization
- [ ] Review metrics
- [ ] Adjust approach
- [ ] Expand to other projects
- [ ] Share learnings
- [ ] Plan ongoing training

---

## Quick Start for Small Teams

**Day 1:**
```bash
# 1. Add spec to repo
cp From-One-to-Sixty-Seven/CLAUDE.md .
cp -r From-One-to-Sixty-Seven/.claude .
git add CLAUDE.md .claude/
git commit -m "Add behavioral contract"

# 2. Share with team
# Send link to installation guide

# 3. Try it yourself
claude /plan "test feature"
```

**Day 2-7:**
- Team sets up individually
- Uses spec for real work
- Asks questions in Slack/Teams

**Week 2:**
- Retrospective on adoption
- Adjust as needed
- Full adoption

---

## See Also

- [Getting Started](./getting-started.md)
- [Best Practices](./best-practices.md)
- [Troubleshooting](./troubleshooting.md)
- [Installation Guides](./installation/)
