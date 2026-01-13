# Frontend Nodes & Backend Modules — Complete Map
## Bobby's Workshop 3.0 / REFORGE OS

**Status:** FINAL — All Connections Documented

---

## 🖥️ FRONTEND NODES (Complete List)

### Public Nodes (Always Visible)

| # | Node Name | File | API Connection | Elegant Wording |
|---|-----------|------|----------------|-----------------|
| 1 | **Device Overview** | `DeviceOverview.tsx` | `POST /api/v1/device/analyze`<br>`POST /api/v1/ownership/verify` | "Device State Overview"<br>"Observed Protection Layer" |
| 2 | **Legal Classification** | `LegalClassification.tsx` | `POST /api/v1/legal/classify` | "Jurisdictional Considerations"<br>"Permitted with Conditions" |
| 3 | **Compliance Summary** | `ComplianceSummary.tsx` | `POST /api/v1/compliance/summary`<br>`GET /api/v1/audit/export` | "Compliance Summary"<br>"This assessment documents analysis only" |
| 4 | **Report Export** | Embedded in ComplianceSummary | `GET /api/v1/audit/export`<br>Python: `POST /report/format` | "Generate Compliance Record"<br>"Export for records or third-party review" |

### Conditional Nodes (Gated)

| # | Node Name | File | Gate Requirements | API Connection | Elegant Wording |
|---|-----------|------|-------------------|----------------|-----------------|
| 5 | **Interpretive Review** | `CustodianVaultGate.tsx` | Ownership confidence ≥ 85<br>Role = Custodian<br>Acknowledgment accepted | `POST /api/v1/interpretive/review`<br>Header: `X-Ownership-Confidence` | "Interpretive Review Mode"<br>"Historical context provided for assessment only" |
| 6 | **Authority Routing** | Embedded in Interpretive Review | After classification | `GET /api/v1/route/authority` | "External Authorization Pathways"<br>"Recommended next lawful channel" |

### Admin/Ops Nodes (Hidden from Users)

| # | Node Name | File | Access Level | API Connection | Purpose |
|---|-----------|------|--------------|----------------|---------|
| 7 | **Operations Dashboard** | `OpsDashboard.tsx` | Admin | `GET /api/v1/ops/metrics` | Control tower for platform health |
| 8 | **Certification Console** | `CertificationDashboard.tsx` | Admin | `GET /api/v1/certification/status` | Technician certification management |
| 9 | **Audit Monitor** | `AuditLogTab.tsx` | Admin | `GET /api/v1/audit/events` | Immutable audit log viewer |

---

## 🧠 BACKEND MODULES (Complete List)

### Core Modules (ForgeWorks - Public)

| # | Module Name | Location | Purpose | API Endpoint | Feeds Into |
|---|-------------|----------|---------|--------------|------------|
| 1 | **device-analysis** | `services/device-analysis/` | Device state classification | `POST /api/v1/device/analyze` | Compliance Summary |
| 2 | **ownership-verification** | `services/ownership-verification/` | Confidence scoring | `POST /api/v1/ownership/verify` | Compliance Summary, Interpretive Review |
| 3 | **legal-classification** | `services/legal-classification/` | Jurisdiction-aware labels | `POST /api/v1/legal/classify` | Compliance Summary, Authority Routing |
| 4 | **audit-logging** | `services/audit-logging/` | Hash-chained logs | `GET /api/v1/audit/events`<br>`GET /api/v1/audit/export` | All operations |
| 5 | **authority-routing** | `services/authority-routing/` | OEM/carrier/court paths | `GET /api/v1/route/authority` | Interpretive Review |

### Internal Modules (Pandora Codex - NEVER SHIPS)

| # | Module Name | Location | Purpose | Feeds Into | Never Exposed To |
|---|-------------|----------|---------|------------|------------------|
| 6 | **capability-awareness** | `services/capability-awareness/` | Risk classification | Risk scoring, language shaping | Frontend, Public API |
| 7 | **tool-awareness** | `internal/pandora-codex/ecosystem-awareness/` | Ecosystem knowledge | Risk models, warnings | Frontend, Public API, Docs |
| 8 | **risk-models** | `internal/pandora-codex/risk-models/` | Risk algorithms | Classification engine | Frontend, Public API |

### Supporting Services

| # | Service Name | Location | Purpose | Port |
|---|--------------|----------|---------|------|
| 9 | **FastAPI Server** | `api/forgeworks_api.py` | HTTP bridge to Rust services | 8001 |
| 10 | **Python Worker** | `python/app/main.py` | Inspection, logs, PDF formatting | 8001 (or separate) |
| 11 | **Legacy API** | `api/main.py` | Cases, diagnostics, recovery | 8000 |

---

## 🔗 COMPLETE WIRING DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│              apps/workshop-ui/src/pages/                    │
│                                                              │
│  DeviceOverview ───────────────────────────────────────┐   │
│  ComplianceSummary ────────────────────────────────────┤   │
│  LegalClassification ──────────────────────────────────┤   │
│  CustodianVaultGate (gated) ──────────────────────────┤   │
│  CertificationDashboard (admin) ────────────────────────┤   │
│  OpsDashboard (admin) ─────────────────────────────────┤   │
│  AuditLogTab (admin) ───────────────────────────────────┤   │
└─────────────────────────────────────────────────────────┼───┘
                          │
                          │ HTTP (api-client.ts)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API CLIENT LAYER                          │
│         apps/workshop-ui/src/lib/api-client.ts              │
│                                                              │
│  deviceAnalysisApi.analyze() ────────────────────────────┐ │
│  ownershipApi.verify() ──────────────────────────────────┤ │
│  legalApi.classify() ─────────────────────────────────────┤ │
│  complianceApi.getSummary() ───────────────────────────────┤ │
│  interpretiveApi.review() (gated) ────────────────────────┤ │
│  routingApi.getAuthority() ───────────────────────────────┤ │
│  certificationApi.getStatus() ─────────────────────────────┤ │
│  opsApi.getMetrics() ────────────────────────────────────┤ │
└─────────────────────────────────────────────────────────────┼─┘
                          │
                          │ HTTP Requests
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI SERVER                           │
│              api/forgeworks_api.py                         │
│                    Port 8001                               │
│                                                              │
│  POST /api/v1/device/analyze ────────────────────────────┐ │
│  POST /api/v1/ownership/verify ──────────────────────────┤ │
│  POST /api/v1/legal/classify ────────────────────────────┤ │
│  POST /api/v1/compliance/summary ────────────────────────┤ │
│  POST /api/v1/interpretive/review (gated) ───────────────┤ │
│  GET  /api/v1/route/authority ────────────────────────────┤ │
│  GET  /api/v1/certification/status ──────────────────────┤ │
│  GET  /api/v1/ops/metrics ───────────────────────────────┤ │
│  GET  /api/v1/audit/events ─────────────────────────────┤ │
│  GET  /api/v1/audit/export ──────────────────────────────┤ │
└─────────────────────────────────────────────────────────────┼─┘
                          │
                          │ Service Calls (Future: Rust FFI)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              RUST SERVICES (Core Logic)                      │
│                  services/                                  │
│                                                              │
│  device-analysis/src/lib.rs ──────────────────────────────┐ │
│  ownership-verification/src/lib.rs ───────────────────────┤ │
│  legal-classification/src/lib.rs ────────────────────────┤ │
│  audit-logging/src/lib.rs ───────────────────────────────┤ │
│  authority-routing/src/lib.rs ────────────────────────────┤ │
└─────────────────────────────────────────────────────────────┼─┘
                          │
                          │ Risk Inputs (One-Way)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│        PANDORA CODEX (Internal Only)                        │
│            internal/pandora-codex/                          │
│                                                              │
│  ecosystem-awareness/ios-security-research.md ───────────┐ │
│  ecosystem-awareness/ios-account-risk.md ──────────────────┤ │
│  ecosystem-awareness/android-system-research.md ────────────┤ │
│  ecosystem-awareness/android-account-risk.md ──────────────┤ │
│  ecosystem-awareness/github-projects.md ───────────────────┤ │
│  risk-models/ (volatility, legal-fragility, abuse) ───────┤ │
│  capability-awareness/capability_map.json ──────────────────┤ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ (Never exposed)
                          │
                    [Sealed - Never Ships]
```

---

## 🎯 HOW YOUR TOOL LIST IS WIRED (Step-by-Step)

### Step 1: Tool List Stored (Internal Only)
**Location:** `internal/pandora-codex/ecosystem-awareness/`

**Files:**
- `ios-security-research.md` → Palera1n, Dopamine, Checkra1n, etc.
- `ios-account-risk.md` → iRemoval Pro, Checkm8.info, Sliver, etc.
- `android-system-research.md` → Magisk, KernelSU, APatch, etc.
- `android-account-risk.md` → UnlockTool, SamFW, Chimera, etc.
- `github-projects.md` → topjohnwu/Magisk, palera1n/palera1n, etc.

### Step 2: Capability Map (Internal Logic)
**Location:** `services/capability-awareness/capability_map.json`

**Contains:**
```json
{
  "hardware_research": {
    "risk": { "account": "high", "data": "high" },
    "ui_tone": "strict",
    "requires_interpretive_review": true
  }
}
```

**Feeds:** Risk scoring, language selection

### Step 3: Risk Classification (Backend)
**Location:** `services/legal-classification/src/lib.rs`

**Process:**
1. Device analyzed → Platform detected
2. Backend checks capability_map.json
3. Risk profile assigned (informed by Pandora knowledge)
4. Language tone selected
5. Classification returned

### Step 4: Frontend Display (Public)
**Location:** `apps/workshop-ui/src/pages/ComplianceSummary.tsx`

**User Sees:**
- "Security Context: Devices in this class have historically been subject to independent security research."
- "Unauthorized modification may result in data loss, account restriction, or legal exposure."
- "Bobby's Workshop does not deploy or recommend third-party modification software."

**User Never Sees:**
- Tool names
- Instructions
- Links
- Steps

---

## 🔐 HIDDEN vs NON-HIDDEN (Final Boundaries)

### NON-HIDDEN (Public / Shippable)
```
✅ apps/workshop-ui/              # All UI code
✅ services/device-analysis/       # Analysis logic
✅ services/ownership-verification/ # Confidence scoring
✅ services/legal-classification/  # Jurisdiction maps
✅ services/audit-logging/        # Logging engine
✅ services/authority-routing/     # Routing logic
✅ api/forgeworks_api.py          # Public API
✅ docs/public/                   # Public documentation
✅ assets/icons/                  # Icons
✅ assets/splash/                 # Splash screens
```

### GATED (Enterprise / Permissioned)
```
🔒 apps/forgeworks-core/          # Admin UI
🔒 services/metrics/              # Operations dashboard
🔒 services/auth/                 # SSO/OIDC
🔒 docs/enterprise/               # Enterprise docs
```

### HIDDEN (Internal / Never Ships)
```
🚫 internal/pandora-codex/        # R&D vault
🚫 services/capability-awareness/ # Tool awareness (internal only)
🚫 internal/pandora-codex/ecosystem-awareness/ # Your tool list
🚫 manufacturing/                 # Hardware specs
🚫 firmware/                      # Firmware internals
```

**CI Enforcement:**
- `.github/workflows/compliance-guard.yml` blocks Pandora references outside `/internal/`
- Language guardrails block forbidden terms
- Build fails if boundaries violated

---

## 🎨 ELEGANT WORDING BY NODE

### Device Overview
- ✅ "Device State Overview"
- ✅ "Observed Protection Layer"
- ✅ "Recovery Feasibility: Under Review"
- ✅ "Capability Class: Userland-Only"
- ❌ "Unlockable"
- ❌ "Hackable"
- ❌ "Breakable"

### Ownership Confidence
- ✅ "Ownership Confidence Assessment"
- ✅ "Additional documentation may be required"
- ✅ "Confidence threshold not yet met"
- ✅ "External authorization likely required"
- ❌ "Ownership verified" (too strong)
- ❌ "Device unlocked" (never)

### Legal Classification
- ✅ "Jurisdictional Considerations"
- ✅ "Permitted with Conditions"
- ✅ "External authorization likely required"
- ✅ "This scenario requires third-party authorization"
- ❌ "Legal bypass"
- ❌ "Allowed to unlock"

### Interpretive Review
- ✅ "Interpretive Review Mode"
- ✅ "Historical context provided for assessment only"
- ✅ "No procedural guidance is displayed"
- ✅ "External authorization may be required"
- ❌ "Bypass mode"
- ❌ "Expert tools"
- ❌ "Secret room"

### Authority Routing
- ✅ "External Authorization Pathways"
- ✅ "Recommended next lawful channel"
- ✅ "Proceeding requires third-party approval"
- ✅ "OEM / Carrier / Court authorization required"
- ❌ "Tool recommendations"
- ❌ "Bypass options"

---

## 📋 FINAL IMPLEMENTATION STATUS

### ✅ Completed
- [x] Frontend nodes defined
- [x] Backend modules structured
- [x] API client wired
- [x] Icons generated
- [x] Splash screen created
- [x] Theme system (Bronx Night)
- [x] Pandora Codex structure
- [x] Tool list files created
- [x] Language guardrails
- [x] CI compliance guard

### ⏳ In Progress
- [ ] PDF export wired with branding
- [ ] Theme toggle (dark/light)
- [ ] Safe animations applied
- [ ] Rust services integrated (currently mocks)
- [ ] Python bundling in Tauri
- [ ] Auto-launcher fully implemented

### 📋 Remaining
- [ ] End-to-end testing
- [ ] Final polish
- [ ] App Store submission
- [ ] Windows installer

---

**This is your complete infrastructure map. Every node, every module, every connection, every elegant phrase is documented.**
