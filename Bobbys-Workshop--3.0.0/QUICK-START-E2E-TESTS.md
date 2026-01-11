# 🚀 Quick Start: Running E2E Tests

## Fast Track (3 Commands)

### 1️⃣ Install Playwright Browsers (First Time Only)
```bash
npx playwright install chromium
```

### 2️⃣ Start Dev Server (Terminal 1)
```bash
npm run dev
```
Wait until you see: `Local: http://localhost:5000/`

### 3️⃣ Run E2E Tests (Terminal 2)
```bash
npm run test:e2e
```

**That's it!** Tests will run automatically.

---

## 🎯 What Gets Tested

- ✅ Application loading and initialization
- ✅ Authentication flow (Phoenix Key)
- ✅ Sonic Codex workflows (upload, transcribe, export)
- ✅ Ghost Codex workflows (shred, canary, persona)
- ✅ Pandora Codex workflows (hardware, DFU, jailbreak)
- ✅ Mobile responsiveness (phone, tablet)

---

## 📊 View Results

After tests complete, view the HTML report:
```bash
npm run test:e2e:report
```

This opens a detailed report with:
- Test results
- Screenshots on failure
- Video recordings
- Test traces

---

## 🔧 Alternative: Automated Script

**Windows:**
```powershell
.\scripts\run-e2e-tests.ps1
```

**Linux/macOS:**
```bash
chmod +x scripts/run-e2e-tests.sh
./scripts/run-e2e-tests.sh
```

---

## 💡 Pro Tips

### Interactive Mode (Best for Debugging)
```bash
npm run test:e2e:ui
```
Opens Playwright's interactive UI - perfect for debugging!

### See Browser While Testing
```bash
npm run test:e2e:headed
```

### Debug Single Test
```bash
npx playwright test tests/e2e/01-authentication.spec.ts --debug
```

---

## ❓ Troubleshooting

**"ECONNREFUSED" Error?**
→ Make sure dev server is running: `npm run dev`

**"playwright: command not found"?**
→ Install browsers: `npx playwright install`

**Tests timeout?**
→ Check if dev server is responsive: `curl http://localhost:5000`

**Browser not found?**
→ Install browsers: `npx playwright install chromium`

---

## 📚 Full Documentation

For detailed instructions, see:
- `RUN-E2E-TESTS.md` - Complete guide
- `tests/e2e/README.md` - Test suite documentation

---

**Happy Testing! 🎉**
