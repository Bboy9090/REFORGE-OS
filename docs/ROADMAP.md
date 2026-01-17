# Production Roadmap

**Goal:** Transform repository into production-grade, legendary status  
**Timeline:** 3 tiers, ~1 month total  
**Approach:** Small, safe PRs with clear acceptance criteria

---

## Tier 1: Quick Wins (1-2 days)

### QW1: Repo Boots ✅
**Scope:** Single command install + run  
**Effort:** 2-3 hours  
**Acceptance Criteria:**
- [ ] `npm run setup` installs all dependencies (frontend + backend)
- [ ] `npm run dev` starts both frontend and backend
- [ ] `npm run verify` confirms installation
- [ ] README updated with single-command setup

**Files Changed:**
- `package.json` - Add `setup`, `verify` scripts
- `README.md` - Update installation section
- `.env.example` - Create template

---

### QW2: Tests in CI ✅
**Scope:** Fix test harness + GitHub Actions  
**Effort:** 3-4 hours  
**Acceptance Criteria:**
- [ ] CI workflow runs all tests
- [ ] Backend server auto-starts for tests
- [ ] Tests pass in CI environment
- [ ] Test results visible in PR checks

**Files Changed:**
- `.github/workflows/ci.yml` - Add test step, server setup
- `package.json` - Add `test:ci` script
- `tests/setup.js` - Backend server helper

---

### QW3: Lint/Format ✅
**Scope:** Fix critical errors + enforce rules  
**Effort:** 4-6 hours  
**Acceptance Criteria:**
- [ ] `npm run lint` passes (0 errors)
- [ ] Pre-commit hook runs lint
- [ ] CI fails on lint errors (remove continue-on-error)
- [ ] Format script for code style

**Files Changed:**
- Fix 59 lint errors in `src/lib/useWs.ts`, hooks
- `.eslintrc.cjs` - Tune rules
- `.github/workflows/ci.yml` - Remove continue-on-error
- `package.json` - Add format script

---

### QW4: Docs ✅
**Scope:** README + env example + troubleshooting  
**Effort:** 2-3 hours  
**Acceptance Criteria:**
- [ ] README has clear setup instructions
- [ ] `.env.example` documents all variables
- [ ] `docs/TROUBLESHOOTING.md` created
- [ ] Entry points documented

**Files Changed:**
- `README.md` - Improve setup section
- `.env.example` - Create from codebase scan
- `docs/TROUBLESHOOTING.md` - Common issues
- `docs/DEVELOPMENT.md` - Dev workflow

---

### QW5: Security Fix ✅
**Scope:** Audit fix + basic hardening  
**Effort:** 1-2 hours  
**Acceptance Criteria:**
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] No secrets in codebase
- [ ] Environment variables documented
- [ ] Basic input validation in API

**Files Changed:**
- Run `npm audit fix`
- Add input validation middleware
- Security headers in Express
- `docs/SECURITY.md` - Security practices

---

## Tier 2: Stability (1 week)

### S1: Test Coverage
**Scope:** Backend tests + integration tests  
**Effort:** 2-3 days  
**Acceptance Criteria:**
- [ ] Server has test suite (50%+ coverage)
- [ ] Integration tests for API endpoints
- [ ] Test coverage report in CI
- [ ] Mock data for offline testing

**Files Changed:**
- `server/__tests__/` - Backend test suite
- `tests/integration/` - Expand integration tests
- `vitest.config.ts` - Coverage configuration
- `.github/workflows/ci.yml` - Coverage upload

---

### S2: Error Handling
**Scope:** Consistent error handling + logging  
**Effort:** 2-3 days  
**Acceptance Criteria:**
- [ ] Error boundaries in React
- [ ] API error responses standardized
- [ ] Logging middleware in backend
- [ ] Error tracking setup (optional)

**Files Changed:**
- `src/components/ErrorBoundary.tsx` - Improve
- `server/middleware/error-handler.js` - Create
- `server/middleware/logger.js` - Enhance
- Error types standardized

---

### S3: Type Safety
**Scope:** Remove --noCheck, fix type errors  
**Effort:** 2-3 days  
**Acceptance Criteria:**
- [ ] Build uses full TypeScript checking
- [ ] 0 type errors in build
- [ ] Strict mode enabled
- [ ] Type coverage report

**Files Changed:**
- `package.json` - Remove `--noCheck`
- Fix all TypeScript errors
- `tsconfig.json` - Enable strict checks
- Add missing type definitions

---

### S4: Performance
**Scope:** Bundle optimization + code splitting  
**Effort:** 2-3 days  
**Acceptance Criteria:**
- [ ] Bundle chunks < 300KB
- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] Performance budget in CI

**Files Changed:**
- `vite.config.ts` - Optimize chunks
- `src/` - Add lazy loading
- Bundle analysis setup
- Performance monitoring

---

### S5: CI/CD Hardening
**Scope:** Complete CI pipeline + release workflow  
**Effort:** 1-2 days  
**Acceptance Criteria:**
- [ ] Full CI pipeline (build + test + lint)
- [ ] Release workflow (semantic versioning)
- [ ] Artifact uploads
- [ ] Deployment automation (optional)

**Files Changed:**
- `.github/workflows/ci.yml` - Complete pipeline
- `.github/workflows/release.yml` - Create
- `CHANGELOG.md` - Create
- Version management

---

## Tier 3: Growth (1 month)

### G1: Developer Experience
**Scope:** Scripts, tooling, DX improvements  
**Effort:** 1 week  
**Acceptance Criteria:**
- [ ] Pre-commit hooks (lint + format)
- [ ] VS Code workspace settings
- [ ] Debug configurations
- [ ] Development documentation

---

### G2: Monitoring & Observability
**Scope:** Logging, metrics, health checks  
**Effort:** 1 week  
**Acceptance Criteria:**
- [ ] Structured logging
- [ ] Health check endpoints
- [ ] Metrics collection
- [ ] Error tracking integration

---

### G3: Documentation Site
**Scope:** Comprehensive docs + API reference  
**Effort:** 1 week  
**Acceptance Criteria:**
- [ ] API documentation
- [ ] Component storybook (optional)
- [ ] Architecture diagrams
- [ ] Contributing guide

---

### G4: Security Hardening
**Scope:** Advanced security measures  
**Effort:** 1 week  
**Acceptance Criteria:**
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] CORS configuration
- [ ] Security headers
- [ ] Dependency scanning in CI

---

### G5: Scalability Prep
**Scope:** Architecture improvements  
**Effort:** 1 week  
**Acceptance Criteria:**
- [ ] Database abstraction (if needed)
- [ ] Caching layer
- [ ] Configuration management
- [ ] Multi-environment support

---

## PR Execution Plan

### PR1: "Repo Boots" 🎯
**Title:** `feat: single-command setup and verification`  
**Scope:**
- Add `npm run setup` script
- Add `npm run verify` script
- Create `.env.example`
- Update README installation

**Verification:**
```bash
rm -rf node_modules server/node_modules
npm run setup
npm run verify
npm run dev  # Should start both frontend and backend
```

**Risks:** None - additive only

---

### PR2: "Tests in CI" 🎯
**Title:** `fix: add test execution to CI workflow`  
**Scope:**
- Update `.github/workflows/ci.yml`
- Add `test:ci` script with backend setup
- Remove `continue-on-error` from lint
- Add test results summary

**Verification:**
```bash
# Simulate CI locally
npm run test:ci
# Check GitHub Actions run
```

**Risks:** May expose test failures - expected

---

### PR3: "Lint/Format" 🎯
**Title:** `fix: resolve lint errors and enforce formatting`  
**Scope:**
- Fix 59 lint errors (useWs.ts, hooks)
- Add format script
- Update ESLint config
- Add pre-commit hook (optional)

**Verification:**
```bash
npm run lint  # Should pass
npm run format:check  # Should pass
```

**Risks:** May require refactoring - test thoroughly

---

### PR4: "Docs" 🎯
**Title:** `docs: improve setup and troubleshooting guides`  
**Scope:**
- Update README
- Create `.env.example`
- Create `docs/TROUBLESHOOTING.md`
- Create `docs/DEVELOPMENT.md`

**Verification:**
- README is clear for new developers
- `.env.example` matches actual usage
- Docs are accurate

**Risks:** None

---

### PR5: "Hardening" 🎯
**Title:** `security: fix vulnerabilities and add validation`  
**Scope:**
- Run `npm audit fix`
- Add input validation middleware
- Add security headers
- Create `docs/SECURITY.md`

**Verification:**
```bash
npm audit  # Should show 0 vulnerabilities
# Test API with invalid input
```

**Risks:** Low - mostly additive

---

## Success Metrics

### Definition of Done
- [ ] Fresh clone → `npm run setup && npm run dev` works
- [ ] All tests pass in CI
- [ ] Lint passes (0 errors)
- [ ] Security audit clean
- [ ] Clear documentation
- [ ] CI/CD pipeline complete

### Legendary Status Checklist
- ✅ Repo boots with one command
- ✅ Tests run locally and in CI
- ✅ Lint/format enforced
- ✅ Clear README + setup
- ✅ Error handling is sane
- ✅ No secret leaks
- ✅ Repo has roadmap
- ✅ Release process defined

---

**Next:** Execute PR1 - "Repo Boots"
