# Pull Request

## Summary

<!-- Brief description of what this PR does (2-3 sentences) -->

## Type of Change

<!-- Check all that apply -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactoring (code improvement without changing functionality)
- [ ] Documentation update
- [ ] CI/CD or build changes
- [ ] Security fix
- [ ] Performance improvement

## Motivation and Context

<!-- Why is this change needed? What problem does it solve? -->
<!-- Link to related issues: Fixes #123, Closes #456 -->

## Changes Made

<!-- Detailed list of changes -->

-
-
-

## Validation

<!-- How did you verify this works? Provide evidence! -->

### Build

```bash
# Command used to build
npm run build

# Output (success/errors)

```

### Tests

```bash
# Command used to test
npm test

# Output (pass/fail)

```

### Manual Testing

<!-- Steps you took to manually verify -->

1.
2.
3.

**Result:** <!-- Describe what happened -->

### Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Risk Assessment

<!-- What could go wrong? How likely? -->

**Risk Level:** Low | Medium | High

**Potential Issues:**

-
-

**Affected Areas:**

-

## Rollback Plan

<!-- How to undo these changes if needed -->

**Rollback Steps:**

1. Revert commit: `git revert <SHA>`
2.
3.

**Rollback Complexity:** Simple | Moderate | Complex

## Truth-First Checklist

<!-- Ensure this PR follows Bobby's Workshop principles -->

- [ ] **No placeholders** — No TODO/FIXME/STUB/MOCK in production code
- [ ] **Tests pass** — Actually ran tests (not just claiming they pass)
- [ ] **Build succeeds** — Actually ran build (not just claiming it works)
- [ ] **No fake success** — All features work end-to-end (no mocked responses)
- [ ] **Platform tested** — Verified on relevant OS (Windows/macOS/Linux)
- [ ] **Error handling** — Explicit, actionable error messages (no silent failures)
- [ ] **No secrets** — No hardcoded API keys, passwords, or tokens
- [ ] **Focused scope** — Single intent, small PR (not 10 unrelated changes)

## Security Checklist

<!-- Required for code changes -->

- [ ] No secrets or credentials committed
- [ ] Input validation added where needed
- [ ] No SQL injection vulnerabilities
- [ ] No command injection (shell=True, eval, etc.)
- [ ] Logs don't expose sensitive data
- [ ] Dependencies checked for vulnerabilities (`npm audit`)

## Documentation

<!-- Has documentation been updated? -->

- [ ] README updated (if public API changed)
- [ ] API docs updated (if backend changed)
- [ ] Code comments added (for complex logic)
- [ ] CHANGELOG.md updated (if user-facing)
- [ ] Migration guide (if breaking change)

## Dependencies

<!-- Any new or updated dependencies? -->

**New Dependencies:**

-

**Updated Dependencies:**

-

**Removed Dependencies:**

-

<!-- If adding dependencies, ensure they're security-checked -->

- [ ] Dependencies scanned for vulnerabilities
- [ ] Licenses compatible with project

## Performance Impact

<!-- Does this affect performance? -->

- [ ] No performance impact expected
- [ ] Performance improved (provide metrics)
- [ ] Performance may be affected (describe)

**Benchmarks:** (if applicable)

```
Before:
After:
```

## Breaking Changes

<!-- Are there breaking changes? -->

- [ ] No breaking changes
- [ ] Breaking changes (describe below)

**Breaking Changes Description:**

**Migration Path:**

## Agent Review Guidance

<!-- Help AI agents review effectively -->

**Primary Agent:** <!-- Audit Hunter | CI Surgeon | Backend Integrity | Frontend Parity | Release Captain | Workshop Safety | Tooling Refiner | Automation Engineer | Security Guard | Docs Curator -->

**Focus Areas for Review:**

-
-

**Key Files Changed:**

-
-

**Testing Priority:**

- [ ] Critical path (auth, payments, data loss risk)
- [ ] High usage feature
- [ ] Edge case or error handling
- [ ] Low risk change

## Related Issues/PRs

<!-- Link related issues and PRs -->

- Fixes #
- Related to #
- Depends on #
- Blocks #

## Post-Merge Actions

<!-- Actions needed after merge -->

- [ ] Deploy to staging
- [ ] Run migrations
- [ ] Update environment variables
- [ ] Notify team/users
- [ ] Monitor error logs
- [ ] Update external documentation

## Additional Notes

<!-- Anything else reviewers should know -->

---

## Reviewer Checklist

<!-- For reviewers to verify -->

- [ ] Code follows project style and conventions
- [ ] Changes are focused and appropriate in scope
- [ ] Tests cover new/changed functionality
- [ ] Documentation is updated
- [ ] No obvious security vulnerabilities
- [ ] Error handling is robust
- [ ] Performance is acceptable
- [ ] PR description is accurate and complete
