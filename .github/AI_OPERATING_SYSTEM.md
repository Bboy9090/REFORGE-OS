# GitHub × AI Operating System — Quick Start Guide

**Version:** 2.0  
**Date:** 2025-12-21  
**Status:** Active

## What Is This?

This repository now has a complete **GitHub × AI Operating System** that helps both human developers and AI agents work together effectively while maintaining code quality and production readiness.

## Core Philosophy

**Truth + Production**
- No placeholders or mocks in production code
- All features must work end-to-end
- Tests must actually run (no fake success)
- Small, focused PRs only

## Quick Navigation

### For Contributors

1. **Start Here:** [.github/copilot-instructions.md](.github/copilot-instructions.md) — Repository rules
2. **Agent Roles:** [AGENTS.md](../AGENTS.md) — Workflow and standards
3. **Before Coding:** Check `.github/instructions/` for path-specific rules

### For AI Agents

1. **Read First:**
   - `.github/copilot-instructions.md`
   - `AGENTS.md`
   - Relevant `.github/agents/*.agent.md` for your specialization

2. **Check Instructions:**
   - Look in `.github/instructions/` for file-pattern-specific rules

3. **Follow Workflow:**
   - Discover → Validate → Implement → Verify → Document

## What Changed?

### A) Enhanced Governance

**Updated Files:**
- `AGENTS.md` — Expanded from 26 to 230+ lines with comprehensive workflow, validation standards, and emergency procedures

### B) New Path-Specific Instructions

**Created Files:**
- `.github/instructions/api-runtime.instructions.md` — API error handling, validation, security
- `.github/instructions/prisma.instructions.md` — Database migration discipline, rollback planning
- `.github/instructions/rust.instructions.md` — Safe Rust, cargo fmt/clippy, error handling
- `.github/instructions/scripts-danger-zone.instructions.md` — Script safety, command allowlisting, audit logging

**Applies To:**
- `api-runtime.instructions.md` → `src/**/*.ts`, `server/**/*.ts`, `libs/**/*.ts`
- `prisma.instructions.md` → `**/prisma/**`, `**/*.prisma`
- `rust.instructions.md` → `crates/**/*`, `src-tauri/src/**/*.rs`
- `scripts-danger-zone.instructions.md` → `scripts/**/*`

### C) New Specialized Agents

**Created Agent Prompts:**
- `.github/agents/api-guardian.agent.md` — API contract validation, error handling
- `.github/agents/prisma-steward.agent.md` — Database schema evolution, migration safety
- `.github/agents/rust-forge.agent.md` — Safe Rust code, clippy compliance
- `.github/agents/automation-engineer.agent.md` — Script security, command injection prevention
- `.github/agents/security-guard.agent.md` — Security review, vulnerability detection
- `.github/agents/docs-onboarding.agent.md` — Documentation accuracy, onboarding quality

**Existing Agents (Already Present):**
- `audit-hunter.agent.md` — Find placeholders/mocks
- `ci-surgeon.agent.md` — Fix CI/CD issues
- `parity-enforcer.agent.md` — Ensure frontend parity with backend
- `release-captain.agent.md` — Enforce small PRs and quality gates

### D) Issue & PR Templates

**Created Templates:**
- `.github/ISSUE_TEMPLATE/bug_agent_ready.yml` — Structured bug reports with evidence
- `.github/ISSUE_TEMPLATE/feature_agent_ready.yml` — Feature requests with acceptance criteria
- `.github/ISSUE_TEMPLATE/ci_failure.yml` — CI/build failure tracking
- `.github/ISSUE_TEMPLATE/audit_plan.yml` — Systematic code audit planning
- `.github/PULL_REQUEST_TEMPLATE.md` — Comprehensive PR template requiring validation proof

### E) Enhanced CI Guardrails

**Updated File:**
- `.github/workflows/ci-guardrails.yml` — Now includes:
  - Block edits to generated artifacts (`dist/`, `build/`, `coverage/`, `target/release/`)
  - Placeholder detection (no TODOs in production code)
  - Path-filtered Node/TypeScript checks (lint, test, build)
  - Path-filtered Prisma schema validation
  - Path-filtered Rust checks (fmt, clippy, test, build)
  - Path-filtered Python checks

## How to Use This System

### Opening Issues

Use the structured issue templates:

1. **Bug Report** → `.github/ISSUE_TEMPLATE/bug_agent_ready.yml`
   - Provides: Steps to reproduce, evidence, environment details
   - Ensures: AI agents and humans have enough context

2. **Feature Request** → `.github/ISSUE_TEMPLATE/feature_agent_ready.yml`
   - Provides: Problem statement, acceptance criteria, user story
   - Ensures: Clear requirements, no vague requests

3. **CI Failure** → `.github/ISSUE_TEMPLATE/ci_failure.yml`
   - Provides: Workflow details, error logs, reproduction steps
   - Ensures: Fast diagnosis and resolution

4. **Audit Plan** → `.github/ISSUE_TEMPLATE/audit_plan.yml`
   - Provides: Scope, criteria, methodology, deliverables
   - Ensures: Systematic code quality improvements

### Creating PRs

Follow the PR template (`.github/PULL_REQUEST_TEMPLATE.md`):

**Required Sections:**
- Summary and motivation
- Changes made (bulleted list)
- **Validation proof** (actual command output showing tests/build/lint ran)
- Truth-First Checklist (no placeholders, no fake success, tests actually ran)
- Risk assessment and rollback plan

**Example Validation:**
```bash
# Tests
$ npm test
✓ Device scanning tests (5 tests)
✓ API integration tests (12 tests)
Tests: 17 passed, 0 failed

# Build
$ npm run build
✓ Built in 4.2s

# Lint
$ npm run lint
✓ No errors found
```

### For Developers

**Before Making Changes:**

1. Check if there's a specialized agent for your task:
   - API changes → Use/consult `api-guardian.agent.md`
   - Database changes → Use/consult `prisma-steward.agent.md`
   - Rust code → Use/consult `rust-forge.agent.md`
   - Scripts → Use/consult `automation-engineer.agent.md`
   - Security-sensitive → Use/consult `security-guard.agent.md`

2. Check path-specific instructions:
   - Editing API files? → Read `.github/instructions/api-runtime.instructions.md`
   - Changing Prisma schema? → Read `.github/instructions/prisma.instructions.md`
   - Writing Rust? → Read `.github/instructions/rust.instructions.md`
   - Adding scripts? → Read `.github/instructions/scripts-danger-zone.instructions.md`

3. Run tests BEFORE making changes (establish baseline)

4. Make minimal, focused changes

5. Validate your changes (run tests, build, lint)

6. Provide proof in PR description

### For AI Agents

**Workflow:**

1. **Read Governance First:**
   - `.github/copilot-instructions.md`
   - `AGENTS.md`
   - Your specialized agent prompt (if applicable)

2. **Check Path-Specific Rules:**
   - Before modifying files, check `.github/instructions/` for applicable rules

3. **Follow Standard Flow:**
   - Discovery → Validation → Implementation → Verification → Documentation

4. **Provide Proof:**
   - Run commands and show output
   - Don't claim tests passed unless you actually ran them
   - Show timestamps to prove recency

5. **Small PRs Only:**
   - One focused change per PR
   - Don't mix unrelated changes

## CI/CD Guardrails

The enhanced CI pipeline ensures:

### 1. No Generated Artifacts Edited
Blocks changes to:
- `dist/`, `build/`, `out/`
- `coverage/`
- `target/release/`
- `node_modules/`

**Why:** These are generated by build processes, not manually edited.

### 2. No Placeholders in Production
Scans for keywords:
- `TODO`, `FIXME`, `HACK`, `STUB`, `MOCK`, `PLACEHOLDER`
- `COMING SOON`, `dummy data`, `fake success`

**Why:** Production code must be complete, not placeholder-filled.

### 3. Path-Filtered Checks

**Node/TypeScript (runs if .ts/.js/.json changed):**
- Install dependencies
- Run linter
- Run tests (required)
- Run build

**Prisma (runs if .prisma files changed):**
- Validate schema syntax
- Check for migration conflicts

**Rust (runs if .rs/Cargo.* changed):**
- `cargo fmt --check` (code formatting)
- `cargo clippy` (linter, zero warnings)
- `cargo test` (run tests)
- `cargo build --release` (build succeeds)

**Python (runs if .py files changed):**
- Install dependencies
- Run pytest (if tests exist)

## Common Workflows

### Workflow 1: Bug Fix

1. Create bug report using template
2. Reproduce bug locally
3. Write failing test (proves bug exists)
4. Fix bug
5. Verify test now passes
6. Run full test suite
7. Create PR with validation proof
8. CI runs automatically
9. Merge when approved and CI green

### Workflow 2: New Feature

1. Create feature request using template
2. Get approval/discussion
3. Write tests for new feature (TDD)
4. Implement feature
5. Verify tests pass
6. Update documentation
7. Create PR with validation proof
8. CI runs automatically
9. Merge when approved and CI green

### Workflow 3: Database Schema Change

1. Read `.github/instructions/prisma.instructions.md`
2. Plan migration (3-step if removing columns)
3. Update Prisma schema
4. Generate migration with descriptive name
5. Review generated SQL
6. Test on local dev database
7. Document rollback plan
8. Create PR with validation proof
9. Prisma CI validation runs
10. Merge when approved

### Workflow 4: Audit for Placeholders

1. Create audit plan using template
2. Run automated scan:
   ```bash
   rg -n "TODO|FIXME|MOCK" --glob "!tests/**" .
   ```
3. Review findings manually
4. Create issues for each finding
5. Fix Critical/High priority immediately
6. Track Medium/Low in backlog

## Troubleshooting

### CI Failing: "Placeholders found in non-test code"

**Fix:**
1. Check CI logs for file/line numbers
2. Either fix the placeholder (implement the feature)
3. Or gate behind feature flag: `if (!EXPERIMENTAL_FEATURE) throw new Error(...)`

### CI Failing: "No test script defined"

**Fix:**
Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

### CI Failing: "Changes detected in dist/"

**Fix:**
Don't edit `dist/` directly. Edit source code and rebuild:
```bash
npm run build  # Regenerates dist/
```

### PR Rejected: "No validation proof"

**Fix:**
Actually run tests/build/lint and paste output in PR description:
```markdown
## Validation

\`\`\`bash
$ npm test
# ... paste actual output ...

$ npm run build
# ... paste actual output ...

$ npm run lint
# ... paste actual output ...
\`\`\`
```

## Benefits

### For Teams

1. **Consistent Quality** — AI and humans follow same standards
2. **Faster Reviews** — Structured templates provide all needed info
3. **Fewer Bugs** — CI catches issues early
4. **Better Onboarding** — Clear documentation and guidelines
5. **Safer Changes** — Rollback plans and risk assessments required

### For AI Agents

1. **Clear Instructions** — Know exactly what's expected
2. **Specialized Roles** — Agents can specialize in domains
3. **Validation Standards** — Clear criteria for "done"
4. **Feedback Loop** — CI provides immediate feedback
5. **Context Preservation** — Templates ensure critical info captured

### For Contributors

1. **Less Guesswork** — Clear rules and examples
2. **Faster Development** — Know what's required upfront
3. **Better Collaboration** — Structured communication
4. **Learning Resource** — Instructions teach best practices
5. **Protection** — CI prevents accidental mistakes

## File Structure Reference

```
.github/
├── copilot-instructions.md       # Repository-wide rules
├── ISSUE_TEMPLATE/
│   ├── bug_agent_ready.yml       # Bug report template
│   ├── feature_agent_ready.yml   # Feature request template
│   ├── ci_failure.yml            # CI failure template
│   └── audit_plan.yml            # Audit planning template
├── PULL_REQUEST_TEMPLATE.md      # PR template
├── agents/                       # Specialized agent prompts
│   ├── api-guardian.agent.md
│   ├── prisma-steward.agent.md
│   ├── rust-forge.agent.md
│   ├── automation-engineer.agent.md
│   ├── security-guard.agent.md
│   ├── docs-onboarding.agent.md
│   ├── audit-hunter.agent.md
│   ├── ci-surgeon.agent.md
│   ├── parity-enforcer.agent.md
│   └── release-captain.agent.md
├── instructions/                 # Path-specific rules
│   ├── api-runtime.instructions.md
│   ├── prisma.instructions.md
│   ├── rust.instructions.md
│   ├── scripts-danger-zone.instructions.md
│   ├── runtime.instructions.md
│   ├── tests.instructions.md
│   ├── build.instructions.md
│   └── agent-prompts.instructions.md
└── workflows/
    └── ci-guardrails.yml         # Enhanced CI pipeline

AGENTS.md                         # Agent workflow and standards
```

## Next Steps

### Immediate

1. **Familiarize yourself** with the new templates and instructions
2. **Try opening an issue** using the new templates
3. **Create a test PR** to see the new PR template

### Soon

1. **Audit existing code** for placeholders (use audit_plan template)
2. **Update team docs** to reference this new system
3. **Train team members** on the new workflows

### Ongoing

1. **Use the templates** for all issues and PRs
2. **Follow the instructions** when modifying code
3. **Provide feedback** on what works and what doesn't
4. **Iterate and improve** based on real usage

## Questions?

- **Found a bug in the system?** Open an issue using the bug template
- **Want to improve the system?** Open an issue using the feature template
- **CI not working as expected?** Open an issue using the ci_failure template
- **Need a new agent or instruction?** Open an issue with your proposal

## Credits

**System Version:** 2.0  
**Implementation Date:** 2025-12-21  
**Philosophy:** Truth + Production — No fake success, ever.

---

**Remember:** This system exists to help, not hinder. If something doesn't make sense or seems overly restrictive, open an issue and let's discuss how to improve it.
