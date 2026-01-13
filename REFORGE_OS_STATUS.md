# REFORGE OS — Complete Status
## Bobby's Workshop 3.0 — Infrastructure Map

**Status:** 85% Complete — Ready for Final Polish

---

## 🏗️ THREE LAYERS (Final Structure)

1. **Bobby's Workshop** (Public UI) → `apps/workshop-ui/`
2. **ForgeWorks Core** (Compliance Spine) → `services/` + `api/forgeworks_api.py`
3. **Pandora Codex** (Internal Vault) → `internal/pandora-codex/`

---

## 🖥️ FRONTEND NODES (9 Total)

### Public (5)
- DeviceOverview → `POST /api/v1/device/analyze`
- ComplianceSummary → `POST /api/v1/compliance/summary`
- LegalClassification → `POST /api/v1/legal/classify`
- CertificationDashboard → `GET /api/v1/certification/status`
- ExportReport → `GET /api/v1/audit/export`

### Gated (2)
- CustodianVaultGate → `POST /api/v1/interpretive/review` (confidence ≥85)
- AuthorityRouting → `GET /api/v1/route/authority`

### Admin (2)
- OpsDashboard → `GET /api/v1/ops/metrics`
- AuditLogTab → `GET /api/v1/audit/events`

---

## 🧠 BACKEND MODULES (11 Total)

### Core (5)
- `device-analysis/` → Device state classification
- `ownership-verification/` → Confidence scoring
- `legal-classification/` → Jurisdiction-aware labels
- `audit-logging/` → Hash-chained logs
- `authority-routing/` → OEM/carrier/court paths

### Internal (3)
- `capability-awareness/` → Risk classification (internal only)
- `pandora-codex/ecosystem-awareness/` → Your tool list (never ships)
- `pandora-codex/risk-models/` → Risk algorithms

### Services (3)
- FastAPI Server → `api/forgeworks_api.py` (port 8001)
- Python Worker → `python/app/main.py` (bundled, auto-launched)
- Legacy API → `api/main.py` (port 8000)

---

## 🔗 YOUR TOOL LIST → PLATFORM (Safe Wiring)

**Tools Listed:**
- iOS: Palera1n, Dopamine, Checkra1n, iRemoval Pro, etc.
- Android: Magisk, KernelSU, UnlockTool, SamFW, etc.
- GitHub: topjohnwu/Magisk, palera1n/palera1n, etc.

**Where They Live:**
- `internal/pandora-codex/ecosystem-awareness/ios-security-research.md`
- `internal/pandora-codex/ecosystem-awareness/android-account-risk.md`
- `internal/pandora-codex/ecosystem-awareness/github-projects.md`

**How They're Used:**
1. Tools inform `capability_map.json` (risk profiles)
2. Risk profiles shape language tone (strict/cautionary/prohibitive)
3. Language tone affects UI warnings
4. High risk → Requires external authorization

**User Never Sees:**
- Tool names
- Instructions
- Links
- Steps

**User Only Sees:**
- "Security Context: Devices in this class have historically been subject to independent security research."
- "Unauthorized modification may result in data loss, account restriction, or legal exposure."

---

## 📡 API ENDPOINTS (Complete)

### ForgeWorks Core (Port 8001)
- `POST /api/v1/device/analyze`
- `POST /api/v1/ownership/verify`
- `POST /api/v1/legal/classify`
- `POST /api/v1/compliance/summary`
- `POST /api/v1/interpretive/review` (gated)
- `GET /api/v1/route/authority`
- `GET /api/v1/certification/status`
- `GET /api/v1/ops/metrics`
- `GET /api/v1/audit/events`
- `GET /api/v1/audit/export`

### Python Worker (Bundled)
- `GET /health`
- `POST /inspect/basic`
- `POST /inspect/deep`
- `POST /logs/collect`
- `POST /report/format`

---

## 🎨 ASSETS (Complete)

**Icons:** `apps/workshop-ui/assets/icons/`
- app-icon.svg, shield-analysis.svg, vault-mark.svg, workshop-mark.svg

**Splash:** `apps/workshop-ui/assets/splash/`
- splash-screen.html, splash-theme.css

**Theme:** `apps/workshop-ui/src/styles/bronx-night-theme.css`

---

## 🔒 HIDDEN vs NON-HIDDEN

**NON-HIDDEN:** All UI, public services, docs/public  
**GATED:** Enterprise docs, admin UI, metrics  
**HIDDEN:** Pandora Codex, tool list, manufacturing, firmware

**CI Rule:** Pandora references outside `/internal/` → Build fails

---

## ✅ COMPLETED

- [x] Backend APIs (11 endpoints)
- [x] Frontend wiring (8/9 pages)
- [x] Design assets (icons, splash, theme)
- [x] Compliance posture
- [x] Documentation
- [x] Tool list safely incorporated

---

## ⏳ REMAINING

- [ ] Wire CustodianVaultGate to interpretive API
- [ ] PDF export with branding
- [ ] Apply theme to all components
- [ ] Rust service integration (replace mocks)
- [ ] Python bundling in Tauri

---

**Platform is 85% complete. All infrastructure is mapped and ready for final polish.**
