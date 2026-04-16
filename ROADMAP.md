# From One to Sixty-Seven — Roadmap

Strategic development plan for the project.

---

## Vision

Become the universal standard for AI coding assistant behavioral contracts — across all LLMs, all stacks, all IDEs, and all team sizes.

---

## Current State (v2.0.0)

**What we have:**
- ✅ 9 LLM assistant configuration files
- ✅ 16 tech stack specifications
- ✅ 5 environment variants
- ✅ 27 comprehensive documentation files (15K+ lines)
- ✅ Installation guides for 8 major tools
- ✅ Command system (review, debug, plan)
- ✅ Plugin configurations for 5 IDEs

**Gap:** Tooling and automation around the spec

---

## Phase 1: Tooling Foundation (Q1 2026)

### 1.1 CLI Tool: `fots` ⭐ PRIORITY

**Goal:** Command-line interface for spec management

**Features:**
```bash
# Initialize project with spec
fots init --stack=typescript --variant=lean-startup

# Generate configs for all tools
fots generate --claude --cursor --copilot --vscode

# Validate compliance
fots validate src/auth.ts

# Check for updates
fots update --check
fots update --apply

# Framework quickstart
fots template --framework=nextjs --output=./my-app
```

**Impact:** Reduces setup from 30 minutes to 30 seconds

**Effort:** Medium (2-3 weeks)

---

### 1.2 Framework-Specific Templates ⭐ PRIORITY

**Goal:** Pre-configured specs for popular frameworks

**Initial Templates:**
```
templates/frameworks/
├── nextjs-fullstack/          # Next.js 14 + Prisma + tRPC
│   ├── CLAUDE.md              # Framework-specific rules
│   ├── .cursorrules
│   ├── .github/copilot-instructions.md
│   └── README.md              # Setup instructions
│
├── django-rest/               # Django + DRF + PostgreSQL
├── fastapi-react/             # FastAPI + React + SQLAlchemy
├── remix-prisma/              # Remix + Prisma + TypeScript
├── laravel-vue/               # Laravel + Vue + MySQL
├── rails-react/               # Rails + React + PostgreSQL
└── astro-ssr/                 # Astro + SSR + Content Collections
```

**Next.js Template Contents:**
```markdown
# Next.js Specific Rules (append to base spec)

## Architecture
- Use App Router, not Pages Router (unless migrating)
- Server Components by default
- Client Components only for:
  - Browser APIs (localStorage, window)
  - Event handlers (onClick, onSubmit)
  - React hooks that need DOM (useEffect with refs)
- API routes in app/api/[route]/route.ts

## Performance
- Use Next.js Image component (not <img>)
- Use Next.js Script component for third-party scripts
- Use Next.js Link component for navigation
- Implement proper loading.tsx and error.tsx
- Use generateStaticParams for dynamic routes

## Data Fetching
- Fetch in Server Components when possible
- Use React Server Components for data
- Use SWR/React Query for Client Component data
- Implement proper caching strategies

## TypeScript
- Use typed route handlers
- Define params types: { params: { id: string } }
- Use Zod for API validation
```

**Impact:** 80% of users use common frameworks; reduces customization work

**Effort:** Low per template (2-3 days each)

---

### 1.3 VS Code Extension

**Goal:** Native IDE integration for spec compliance

**Features:**
- Status bar indicator (spec active/inactive)
- Command palette integration:
  - `FOTS: Validate Current File`
  - `FOTS: Insert SUMMARY Block`
  - `FOTS: Insert ASSUMPTIONS Block`
  - `FOTS: Check for Updates`
- Diagnostics panel:
  - Missing SUMMARY blocks
  - Missing assumption declarations
  - Potential hidden refactors (large diffs)
- Snippets:
  - `spec-sum` → SUMMARY block
  - `spec-ass` → ASSUMPTIONS block
  - `sec-note` → SECURITY NOTE block

**Impact:** Real-time feedback where developers work

**Effort:** Medium (3-4 weeks)

---

## Phase 2: Community & Ecosystem (Q2 2026)

### 2.1 Community Repository

**Goal:** Scale through community contributions

**Repository:** `From-One-to-Sixty-Seven-Community`

**Contents:**
```
community/
├── stacks/                    # Additional languages
│   ├── elixir.md
│   ├── clojure.md
│   ├── scala.md
│   └── kotlin.md
│
├── variants/                  # Niche variants
│   ├── game-dev.md          # Unity/Unreal specific
│   ├── data-science.md      # Jupyter/ML specific
│   └── embedded.md          # IoT/embedded specific
│
├── case-studies/            # User submissions
│   ├── fintech-compliance.md
│   ├── healthtech-hipaa.md
│   └── ecommerce-scale.md
│
├── tools/                   # Third-party integrations
│   ├── vim-plugin.md
│   ├── emacs-package.md
│   └── sublime-text.md
│
└── templates/               # Community frameworks
    ├── flutter-firebase/
    └── unreal-engine/
```

**Governance:**
- Clear contribution guidelines
- Review process for submissions
- Credit to contributors
- Regular sync with main repo

**Impact:** Extends coverage beyond core team capacity

**Effort:** Low (setup) + ongoing community management

---

### 2.2 Interactive Documentation Site

**Goal:** Replace static Markdown with interactive web experience

**Features:**
- **Config Builder:** Web form → generates all config files
  - Select stack → shows compatible variants
  - Select tools → generates configs
  - Download as zip or copy individual files

- **Rule Explorer:**
  - Searchable rule database
  - Before/after examples
  - Related rules graph
  - Anti-pattern cross-references

- **Playground:**
  - Test prompts against spec rules
  - Compare different LLM responses
  - See how rules change output

- **Variant Comparison:**
  - Side-by-side comparison
  - Diff view of rule changes
  - Decision tree: "Which variant should I use?"

**Tech Stack:**
- Next.js 14 (App Router)
- MDX for content
- Tailwind CSS
- Vercel hosting

**URL:** `https://fromonetosixtyseven.dev`

**Impact:** Better UX than 15K lines of Markdown

**Effort:** High (6-8 weeks)

---

### 2.3 Compliance Testing Suite

**Goal:** Automated spec compliance verification

**GitHub Action:**
```yaml
# .github/workflows/spec-compliance.yml
- uses: degenwithheart/fots-compliance@v1
  with:
    spec-file: CLAUDE.md
    check-summaries: true
    check-assumptions: true
    check-minimal-changes: true
    fail-on-violation: true
```

**CLI Capabilities:**
```bash
# Check a file for compliance
fots check src/auth.py --rules=summary,assumptions

# Check PR diff
fots check --diff=HEAD~1 --format=github-annotations

# Generate report
fots report --output=compliance-report.md
```

**Checks:**
- SUMMARY block presence
- ASSUMPTIONS block when ambiguous
- Change size (flags > 200 line diffs)
- Security block for auth/crypto files
- Test coverage for new code

**Impact:** Enforces spec in CI/CD; enterprise adoption

**Effort:** High (6-8 weeks)

---

## Phase 3: Advanced Features (Q3 2026)

### 3.1 Multi-Agent Orchestration ⭐ VISIONARY

**Goal:** Spec for coordinating multiple AI assistants

**Use Case:** Complex tasks requiring specialized agents

**Structure:**
```
.orchestration/
├── coordinator.md           # Meta-spec for coordination
├── planner-agent.md         # High-level architecture
├── coder-agent.md           # Implementation
├── reviewer-agent.md        # Code review
├── tester-agent.md          # Test generation
├── security-agent.md        # Security audit
└── docs-agent.md            # Documentation
```

**Workflow:**
```
User Request
    ↓
[Planner Agent] → Creates implementation plan
    ↓
[Coder Agent] → Implements following plan
    ↓
[Reviewer Agent] → Reviews against spec
    ↓
[Tester Agent] → Generates tests
    ↓
[Security Agent] → Security audit
    ↓
[Docs Agent] → Updates documentation
    ↓
Final Output
```

**Integration with CrewAI, AutoGen, LangGraph**

**Impact:** Addresses complex multi-file changes; emerging pattern

**Effort:** Very High (3-4 months)

---

### 3.2 Universal Protocol ⭐ VISIONARY

**Goal:** Abstract spec into protocol-agnostic format

**Current Problem:** Each tool needs custom formatting

**Solution:** `spec.yaml` + adapters

```yaml
# spec.yaml
version: 2.1.0
name: From One to Sixty-Seven Core

rules:
  - id: "1.1"
    name: restate_goal
    category: communication
    priority: required
    description: "Always restate the goal before coding"
    rationale: "Ensures understanding and allows correction"
    triggers:
      - task_received
    output_format: |
      Goal: {restatement}
      
      Is this correct, or did I miss anything?
    
  - id: "2.1"
    name: minimal_change
    category: implementation
    priority: required
    description: "Change only what the task requires"
    constraints:
      - no_refactors
      - no_new_abstractions
      - match_existing_style

variants:
  lean-startup:
    extends: base
    relaxations:
      - rule: summary_block
        when: "change_size < 20 lines"
      - rule: assumption_declaration
        when: "task_is_obvious"
    
  enterprise:
    extends: base
    additions:
      - schema_change_protocol
      - api_versioning_rules
      - audit_trail_requirements

adapters:
  - name: claude_code
    format: markdown
    file_extension: .md
    location: CLAUDE.md
    frontmatter: false
    
  - name: cursor_mdc
    format: markdown_with_yaml_frontmatter
    file_extension: .mdc
    location: .cursor/rules/
    frontmatter_required: true
    
  - name: lsp
    format: json
    location: .fots/config.json
    protocol: language_server_protocol
```

**Benefits:**
- Any tool can implement the spec
- Single source of truth
- Versioned, migratable
- Machine-readable for automation

**Impact:** Future-proof; industry standard potential

**Effort:** Very High (4-6 months)

---

### 3.3 Local Model Optimization

**Goal:** Variants optimized for local/self-hosted LLMs

**Challenge:** Local models (Ollama, LM Studio) have smaller context windows

**Variants:**
```markdown
# variants/OLLAMA.md (Concise)

## Core Rules (Essential Only)

1. **Restate goal** before coding
2. **Minimal change** — no refactors
3. **Declare assumptions** if unclear
4. **Verify** it works
5. **SUMMARY** block at end

## Security (Always Required)
- No hardcoded secrets
- Validate all input
- No SQL injection
```

**Optimized for:**
- 4K-8K context windows
- Quantized models (Q4, Q5)
- CPU inference
- Privacy-conscious teams

**Impact:** Enables offline/self-hosted usage

**Effort:** Medium (create concise variants)

---

## Phase 4: Observability & Intelligence (Q4 2026)

### 4.1 Spec Effectiveness Analytics

**Goal:** Track and measure spec impact

**Opt-in Telemetry:**
```typescript
// fots.track() API
fots.track({
  event: 'summary_generated',
  duration_ms: 2500,
  model: 'claude-3-5-sonnet',
  compliance_score: 0.95,
  task_type: 'bug_fix',
  lines_changed: 15
});
```

**Dashboard Metrics:**
- Spec adoption rate across team
- Violation patterns (which rules most often broken)
- Time savings vs. before spec
- Quality metrics (bugs introduced, review time)
- LLM comparison (which models follow best)

**Privacy:**
- No code sent
- No PII collected
- Aggregate statistics only
- Self-hostable dashboard

**Impact:** Prove ROI; identify improvement opportunities

**Effort:** High (analytics infrastructure)

---

### 4.2 AI-Powered Spec Improvements

**Goal:** Use AI to improve the spec itself

**Process:**
1. Collect anonymized violation patterns
2. Identify common failure modes
3. Generate proposed rule improvements
4. Human review and approval
5. Versioned releases

**Example:**
```
Analysis: 40% of "hidden refactor" violations occur in files 
with > 500 lines.

Proposal: Add rule "For files > 500 lines, create separate 
refactor PR instead of including in feature PR."

Human review: Approved for v2.2.0
```

**Impact:** Self-improving specification

**Effort:** Medium (after analytics in place)

---

## Prioritization Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| CLI Tool (`fots`) | ⭐⭐⭐⭐⭐ | Medium | **P0 - Start Now** |
| Next.js Template | ⭐⭐⭐⭐⭐ | Low | **P0 - Start Now** |
| VS Code Extension | ⭐⭐⭐⭐⭐ | Medium | **P1 - Next Sprint** |
| Community Repo | ⭐⭐⭐⭐ | Low | P1 |
| Interactive Docs | ⭐⭐⭐⭐ | High | P2 |
| Compliance Testing | ⭐⭐⭐⭐ | High | P2 |
| Universal Protocol | ⭐⭐⭐⭐⭐ | Very High | P3 - Vision |
| Multi-Agent | ⭐⭐⭐⭐ | Very High | P3 |
| Local Model Variants | ⭐⭐⭐ | Medium | P2 |
| Analytics | ⭐⭐⭐ | High | P3 |

---

## Quick Wins (This Week)

### 1. Create Next.js Template
```bash
mkdir -p templates/frameworks/nextjs-fullstack

# Copy base spec
cp CLAUDE.md templates/frameworks/nextjs-fullstack/

# Add Next.js rules
cat >> templates/frameworks/nextjs-fullstack/CLAUDE.md << 'EOF'

## Next.js 14 Specific Rules

### App Router (Required)
- Use App Router for all new code
- Place pages in app/ directory
- Use layout.tsx for shared UI
- Use loading.tsx for loading states
- Use error.tsx for error boundaries

### Server vs Client Components
- Server Components by default
- 'use client' directive only when:
  1. Using browser APIs (window, localStorage)
  2. Using React hooks that need DOM (useEffect with refs)
  3. Event handlers (onClick, onSubmit)
  4. Third-party components that need DOM

### Data Fetching
- Fetch in Server Components when possible
- Use fetch with { cache: 'no-store' } for dynamic data
- Use fetch with revalidate for ISR
- Use React Server Components for database queries

### API Routes
- Use Route Handlers in app/api/
- Type the Request: Request & { json(): Promise<T> }
- Validate with Zod
- Return typed Response

### Performance
- Always use next/image (not <img>)
- Always use next/link (not <a> for internal)
- Use next/script for third-party scripts
- Implement proper metadata for SEO
EOF

# Create supporting files
cat > templates/frameworks/nextjs-fullstack/.cursorrules << 'EOF'
# Next.js + Cursor

See CLAUDE.md for full spec. Additional rules:

- Prefer Server Components
- Use App Router patterns
- Implement loading.tsx for async routes
EOF

# README
cat > templates/frameworks/nextjs-fullstack/README.md << 'EOF'
# Next.js Full Stack Template

## Quick Start

```bash
# Copy files to your project
cp CLAUDE.md /your/project/
cp .cursorrules /your/project/  # If using Cursor
```

## Stack
- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Prisma ORM
- tRPC or REST API
- NextAuth.js or Clerk

## Architecture
- Server Components for data fetching
- Client Components for interactivity
- API routes for mutations
- Prisma for database
EOF
```

### 2. Update Main README
Add "Quick Start Templates" section with links to framework templates.

---

## Long-Term Vision (2027+)

### Industry Standard Status
- Spec referenced by AI companies in documentation
- Default template in major AI coding tools
- Taught in coding bootcamps
- Referenced in academic papers on AI-assisted development

### Advanced Orchestration
- Visual workflow builder for multi-agent systems
- Real-time collaboration between human and multiple AI agents
- Automatic task decomposition and assignment

### Universal Compatibility
- Every major IDE has native FOTS support
- Every major LLM has FOTS mode
- CI/CD systems have built-in FOTS compliance checks
- Code review tools highlight FOTS violations

---

## Contributing to Roadmap

**Propose new features:**
1. Open GitHub Discussion
2. Describe use case and impact
3. Community votes
4. Core team evaluates effort
5. Roadmap updated quarterly

**Track progress:**
- Milestones in GitHub
- Monthly updates in Discussions
- Release notes with each version

---

## Current Focus: Phase 1

**Immediate priorities (next 2 weeks):**

1. ✅ Create `fots` CLI prototype
2. ✅ Build Next.js template
3. ✅ Add 2 more framework templates (Django, FastAPI)
4. ⏳ Begin VS Code extension planning

**Definition of Done for Phase 1:**
- CLI tool installable via npm/pip
- 3 framework templates complete
- README updated with new quick-start paths

---

*Last updated: 2026-01-16*  
*Next review: 2026-02-01*
