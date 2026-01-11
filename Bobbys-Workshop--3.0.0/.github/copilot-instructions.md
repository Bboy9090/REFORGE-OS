# Bobby's Workshop (Pandora Codex) — Copilot Repo Instructions

## Prime Directive: Truth + Production

- NO placeholders, NO mocks, NO stubs, NO fake success in production code.
- If it is visible/clickable/callable/documented, it MUST work end-to-end.
- Mocks are allowed ONLY inside tests.
- If something isn't ready: disable/hide OR gate behind EXPERIMENTAL (OFF by default).
- Never claim tests/builds/CI ran unless you actually ran them.

## Core Principles

- Truth-first: no placeholders, mocks, or fake success in production paths.
- Hide or gate unfinished features behind EXPERIMENTAL (off by default).
- Prefer small, single-intent PRs; avoid unrelated refactors.
- Do not commit generated artifacts (dist/, build/, _.exe, _.pkg, _.zip, _.tar.gz).
- Platform-specific behavior must be guarded (Windows/macOS/Linux).

## Validation Discipline

- Run real builds/tests; never claim green without execution.
- Discover commands from package.json scripts, README, BUILD_INSTRUCTIONS.md, and workflows.

## Security & Safety

- Never add bypass/circumvention features (account locks, IMEI alteration, ownership violations).
- Do not add secrets; only update .env.example-style files.
- Logs must be actionable without leaking secrets; prefer explicit errors over silent failures.

## AI Safety Guidelines

### Explicit Confirmation Required For:

- **Destructive operations**: file deletion, database drops, system-wide changes
- **System commands**: shell execution, process termination, network operations
- **Permission changes**: chmod, chown, access control modifications
- **Dependency updates**: major version bumps, breaking changes

### Prohibited Actions (No Exceptions):

- Uncontrolled system command execution
- Silent failures or fake success returns
- Bypassing security controls or authentication
- Executing untrusted code from external sources
- Modifying CI/CD to skip actual test execution

### Required Practices:

- Validate all external inputs before processing
- Use structured error messages with actionable context
- Log security-relevant events (without exposing secrets)
- Test all changes in isolation before integration
- Document assumptions and platform-specific behavior

## Team Roles

See [AGENTS.md](./AGENTS.md) for specialist roles:

1. Audit Hunter — find placeholders/mocks and classify.
2. CI Surgeon — make CI deterministic and fix test discovery.
3. Backend Integrity — API contracts, error handling, schema validation.
4. Frontend Parity — remove dead UI, wire real API calls, add smoke tests.
5. Release Captain — enforce small PRs and Definition of Done.
6. Workshop Safety — prevent risky operations and enforce safety boundaries.
7. Tooling Refiner — cleanup, structure, and reliability improvements.
8. Automation Engineer — CI + scripts maintenance and optimization.
9. Security Guard — secrets, logs, and permissions management.
10. Docs Curator — clarity and onboarding documentation.

## Build & Test Commands

```bash
npm run build         # Build the frontend
npm run test          # Run all tests
npm run lint          # Run ESLint
npm run dev           # Start development server
```

## Before Committing

- [ ] Tests pass
- [ ] Build succeeds
- [ ] No linting errors
- [ ] PR is small and focused
- [ ] No secrets committed
- [ ] CI guardrails pass
