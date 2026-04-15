# Philosophy: Why This Spec Exists

## The Problem

LLM coding assistants are genuinely useful. They write boilerplate fast, explain unfamiliar
code, suggest patterns, and accelerate routine work dramatically.

But they have specific failure modes that are dangerous in production:

**Silent assumptions.** An LLM asked to "fix the login bug" will silently choose an
interpretation and run with it. In a human engineer, silent assumptions surface in PR review.
In an LLM, they surface in production incidents.

**Scope creep.** LLMs are trained to be helpful, which biases them toward doing more than asked.
Ask to fix a function and you may get a refactored module. This produces diffs that are
hard to review and contain unintended side effects.

**Over-engineering.** LLMs have read every architecture blog ever written. They know about
factories, registries, strategy patterns, dependency injection, event buses, and plugin systems.
They will apply these patterns even to a 20-line function.

**Lack of verification.** An LLM produces code that looks correct. It will not, by default,
check whether it compiles, whether tests pass, or whether a regression was introduced.

**Context drift.** Over a long session, constraints stated early in a conversation have less
influence on later responses. A rule stated at turn 1 may be violated by turn 20.

---

## The Solution

This spec is a behavioral contract. It does not make LLMs smarter. It makes them more
predictable by:

1. Requiring explicit reasoning before any code is written
2. Constraining scope to the minimum required change
3. Mandating verification before a response is finalized
4. Requiring assumption declaration so hidden decisions are visible
5. Requiring a final statement of what changed, why, and what risks remain

The result is an LLM that behaves more like a cautious junior engineer under supervision
than a fast but unpredictable code generator.

---

## Why Rules, Not Guidelines

Guidelines are easy to skip. Rules with explicit required output formats are not.

LLMs are compliant by nature. If you tell them to produce a `SUMMARY:` block before
finishing, they will. If you tell them to declare assumptions, they will. The spec
exploits this compliance to enforce good engineering habits consistently.

---

## On Speed vs Safety

This spec consciously biases toward safety. In the short term: more back-and-forth,
smaller diffs, more questions asked before coding.

In the medium term: fewer regressions, cleaner PRs, less time debugging LLM-introduced bugs,
higher trust in AI-assisted output.

For teams where speed genuinely outweighs these concerns, the Lean Startup variant exists.
For anything running in production that matters, the default conservatism is correct.

---

## Credits

Inspired by:
- [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876)
  on LLM coding pitfalls (via [andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills))
- The `.claude/skills/` pattern and `AGENTS.md` multi-agent convention
  from [multica-ai/multica](https://github.com/multica-ai/multica)
