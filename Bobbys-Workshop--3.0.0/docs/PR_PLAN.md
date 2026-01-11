# PR Execution Plan

**Status:** Ready to execute  
**Order:** Sequential, small PRs

---

## PR1: "Repo Boots" 🎯

**Title:** `feat: single-command setup and verification`

**What Changed:**
- Add `setup` script to install all dependencies
- Add `verify` script to check installation
- Create `.env.example` template
- Update README with simplified setup

**Files Changed:**
- `package.json` - Add scripts
- `.env.example` - Create (NEW)
- `README.md` - Update installation section

**How to Verify:**
```bash
# Fresh clone test
rm -rf node_modules server/node_modules
npm run setup
npm run verify
npm run dev  # Should start both frontend (port 5173) and backend (port 3001)
```

**Risks/Notes:**
- None - purely additive
- Backwards compatible
- No breaking changes

---

## PR2: "Tests in CI" 🎯

**Title:** `fix: add test execution to CI workflow`

**What Changed:**
- Update `.github/workflows/ci.yml` to run tests
- Add `test:ci` script with backend server setup
- Remove `continue-on-error: true` from lint step
- Add test results summary

**Files Changed:**
- `.github/workflows/ci.yml` - Add test step
- `package.json` - Add `test:ci` script
- `tests/setup.js` - Backend server helper (NEW)

**How to Verify:**
```bash
npm run test:ci
# Check GitHub Actions - should show test results
```

**Risks/Notes:**
- May expose existing test failures (expected)
- Requires backend server running in CI
- Tests may need mocking for CI environment

---

## PR3: "Lint/Format" 🎯

**Title:** `fix: resolve lint errors and enforce formatting`

**What Changed:**
- Fix 59 lint errors in `src/lib/useWs.ts` and hooks
- Fix React hooks dependency issues
- Add format script
- Update ESLint config
- Remove `continue-on-error` from CI

**Files Changed:**
- `src/lib/useWs.ts` - Fix hook dependencies
- `src/hooks/*.ts` - Fix dependency arrays
- `.eslintrc.cjs` - Tune rules
- `.github/workflows/ci.yml` - Remove continue-on-error
- `package.json` - Add format scripts

**How to Verify:**
```bash
npm run lint  # Should pass (0 errors)
npm run format:check  # Should pass
```

**Risks/Notes:**
- May require refactoring some hooks
- Test thoroughly after changes
- Some warnings may remain (acceptable)

---

## PR4: "Docs" 🎯

**Title:** `docs: improve setup and troubleshooting guides`

**What Changed:**
- Update README with clear setup
- Create `.env.example` (if not in PR1)
- Create `docs/TROUBLESHOOTING.md`
- Create `docs/DEVELOPMENT.md`

**Files Changed:**
- `README.md` - Improve setup section
- `.env.example` - Document variables
- `docs/TROUBLESHOOTING.md` - NEW
- `docs/DEVELOPMENT.md` - NEW

**How to Verify:**
- README is clear for new developers
- `.env.example` matches actual usage
- Docs are accurate and helpful

**Risks/Notes:**
- None - documentation only

---

## PR5: "Hardening" 🎯

**Title:** `security: fix vulnerabilities and add validation`

**What Changed:**
- Run `npm audit fix`
- Add input validation middleware
- Add security headers
- Create `docs/SECURITY.md`

**Files Changed:**
- `package-lock.json` - Updated dependencies
- `server/middleware/validation.js` - NEW
- `server/index.js` - Add security headers
- `docs/SECURITY.md` - NEW

**How to Verify:**
```bash
npm audit  # Should show 0 vulnerabilities
# Test API with invalid input - should reject
```

**Risks/Notes:**
- Low risk - mostly additive
- May require testing API endpoints

---

## Execution Checklist

- [ ] PR1: Repo Boots
- [ ] PR2: Tests in CI
- [ ] PR3: Lint/Format
- [ ] PR4: Docs
- [ ] PR5: Hardening

---

**Next:** Execute PR1
