# REFORGE OS — Launch Checklist
## Pre-Deployment Verification

**Date:** 2025-01-10  
**Target:** Production-Ready Release

---

## 🔒 COMPLIANCE VERIFICATION

### Language Guardrails
- [ ] Scan codebase for forbidden terms (bypass, unlock, jailbreak, root)
- [ ] Verify all UI copy uses approved language (analyze, interpret, classify, route)
- [ ] Check API endpoint names (no /execute, /bypass, /unlock)
- [ ] Verify all error messages are compliance-safe

### Pandora Codex Isolation
- [ ] Verify no Pandora Codex content in public code
- [ ] Check CI guardrails are active
- [ ] Verify internal/ directory is gitignored in public builds
- [ ] Test that Pandora references fail CI

### Audit Logging
- [ ] Verify all actions are logged
- [ ] Test audit hash chain integrity
- [ ] Verify audit export functionality
- [ ] Test immutable log enforcement

---

## 🧪 FUNCTIONAL TESTING

### Backend Services
- [ ] FastAPI server starts on port 8001
- [ ] Python worker starts on port 8001 (or configured port)
- [ ] Health endpoints respond correctly
- [ ] All ForgeWorks endpoints return valid responses
- [ ] Error handling works correctly

### Frontend
- [ ] App builds without errors
- [ ] All pages load without crashes
- [ ] API calls succeed (or fail gracefully)
- [ ] Loading states display correctly
- [ ] Error alerts show properly

### Integration
- [ ] DeviceOverview → device analysis works
- [ ] ComplianceSummary → generates report
- [ ] LegalClassification → returns classification
- [ ] CustodianVaultGate → gating works (≥85 confidence)
- [ ] CertificationDashboard → loads status
- [ ] OpsDashboard → loads metrics

### Tauri Integration
- [ ] App launches successfully
- [ ] Python worker auto-starts
- [ ] Health gate unlocks UI
- [ ] App shutdown kills Python worker

---

## 🎨 DESIGN VERIFICATION

### Theme Application
- [ ] Bronx Night theme applied to all pages
- [ ] Neon cyan/magenta accents visible
- [ ] Dark backgrounds consistent
- [ ] Animations work (fade, slide, pulse)
- [ ] Icons display correctly

### Icons & Assets
- [ ] App icon displays in system
- [ ] Splash screen shows on launch
- [ ] All SVG icons render correctly
- [ ] No broken image references

---

## 📦 DEPLOYMENT PREP

### Build
- [ ] Tauri app builds successfully
- [ ] No TypeScript errors
- [ ] No Rust compilation errors
- [ ] No Python syntax errors

### Packaging
- [ ] MSI installer builds (Windows)
- [ ] DMG installer builds (macOS)
- [ ] AppImage builds (Linux)
- [ ] Installers install correctly
- [ ] Desktop shortcuts created

### Signing
- [ ] Windows code signing (if applicable)
- [ ] macOS notarization (if applicable)
- [ ] Linux GPG signing (if applicable)

---

## 📚 DOCUMENTATION

### User Documentation
- [ ] README.md complete
- [ ] Quick start guide
- [ ] Troubleshooting guide
- [ ] FAQ section

### Developer Documentation
- [ ] API documentation
- [ ] Architecture overview
- [ ] Contributing guidelines
- [ ] Security policy

### Compliance Documentation
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Compliance disclaimers
- [ ] Regulator briefing materials

---

## 🚀 FINAL STEPS

### Pre-Launch
- [ ] Run full test suite
- [ ] Code review complete
- [ ] Security audit passed
- [ ] Performance testing done
- [ ] Browser compatibility checked

### Launch
- [ ] Deploy to staging
- [ ] Test on clean system
- [ ] Verify all features work
- [ ] Monitor for errors
- [ ] Collect user feedback

### Post-Launch
- [ ] Monitor error logs
- [ ] Track user metrics
- [ ] Gather feedback
- [ ] Plan first update

---

## ✅ SIGN-OFF

**Ready for Launch:** ☐  
**Signed by:** _______________  
**Date:** _______________

---

**This checklist must be completed before production deployment.**