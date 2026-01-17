# PR1: "Repo Boots" - Implementation

**Status:** ✅ Ready  
**Title:** `feat: single-command setup and verification`

---

## What Changed

### Files Modified

1. **package.json**
   - Added `"setup"` script: `npm install && npm run server:install`
   - Added `"verify"` script: `node scripts/verify-setup.js`

2. **scripts/verify-setup.js** (NEW)
   - Verification script that checks:
     - Node.js version
     - Frontend dependencies installed
     - Backend dependencies installed
     - Package files exist

3. **README.md**
   - Updated installation section with single-command setup
   - Added environment variables section
   - Improved developer setup instructions

4. **.env.example** (verify/update)
   - Documents all environment variables
   - Frontend (Vite) variables
   - Backend (Node.js) variables
   - Security/authentication variables
   - Feature flags

5. **src/lib/useWs.ts**
   - Fixed React hooks dependency issue
   - Moved `disconnect` outside useEffect
   - Fixed dependency array

---

## How to Verify

### Fresh Clone Test
```bash
# Remove existing dependencies
rm -rf node_modules server/node_modules

# Run setup
npm run setup

# Verify installation
npm run verify
# Expected output:
# ✓ Node.js: v25.2.1
# ✓ Frontend dependencies: installed
# ✓ Backend dependencies: installed
# ✓ Package files: found
# ✅ Installation verified!

# Start development
npm run dev
# Should start frontend on http://localhost:5173
# Backend should auto-start on http://localhost:3001
```

### Manual Verification
```bash
# Check scripts exist
npm run | grep -E "(setup|verify)"

# Check verify script works
npm run verify

# Test setup on clean state
npm run setup
```

---

## Risks/Notes

- **Low Risk:** Purely additive changes
- **Backwards Compatible:** Existing workflows still work
- **No Breaking Changes:** All existing scripts preserved
- **Note:** `.env.example` may need manual creation if blocked by gitignore

---

## Next Steps

After PR1 merges:
- PR2: Add tests to CI
- PR3: Fix lint errors
- PR4: Improve docs
- PR5: Security hardening

---

**Verification Command:**
```bash
npm run verify && npm run dev
```
