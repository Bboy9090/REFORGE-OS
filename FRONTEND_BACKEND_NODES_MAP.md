# Frontend Nodes ↔ Backend Modules — Complete Wiring Map
## Bobby's Workshop 3.0 / REFORGE OS

**Status:** FINAL — All Connections Defined

---

## 🖥️ FRONTEND NODES (What Users See)

### Public Nodes (Always Visible)

| Node | File | Purpose | Elegant Wording |
|------|------|---------|----------------|
| **Device Overview** | `DeviceOverview.tsx` | Device state analysis | "Device State Overview" |
| **Ownership Confidence** | Embedded in DeviceOverview | Ownership assessment | "Ownership Confidence Assessment" |
| **Legal Classification** | `LegalClassification.tsx` | Jurisdiction-aware status | "Jurisdictional Considerations" |
| **Compliance Summary** | `ComplianceSummary.tsx` | Complete compliance report | "Compliance Summary" |
| **Report Export** | Embedded in ComplianceSummary | PDF generation | "Generate Compliance Record" |

### Conditional Nodes (Gated)

| Node | File | Gate | Elegant Wording |
|------|------|------|----------------|
| **Interpretive Review** | `CustodianVaultGate.tsx` | Confidence ≥ 85 + Role | "Interpretive Review Mode" |
| **Authority Routing** | Embedded in Interpretive Review | After classification | "External Authorization Pathways" |

### Admin/Ops Nodes (Hidden from Users)

| Node | File | Access | Purpose |
|------|------|--------|---------|
| **Operations Dashboard** | `OpsDashboard.tsx` | Admin | Control tower |
| **Certification Console** | `CertificationDashboard.tsx` | Admin | Technician certification |
| **Audit Monitor** | `AuditLogTab.tsx` | Admin | Immutable log viewer |

---

## 🧠 BACKEND MODULES (What Actually Runs)

### Core Modules (ForgeWorks - Public)

| Module | Location | Purpose | API Endpoint |
|--------|----------|---------|--------------|
| **device-analysis** | `services/device-analysis/` | Device state classification | `POST /api/v1/device/analyze` |
| **ownership-verification** | `services/ownership-verification/` | Confidence scoring | `POST /api/v1/ownership/verify` |
| **legal-classification** | `services/legal-classification/` | Jurisdiction-aware labels | `POST /api/v1/legal/classify` |
| **audit-logging** | `services/audit-logging/` | Hash-chained logs | `GET /api/v1/audit/events` |
| **authority-routing** | `services/authority-routing/` | OEM/carrier/court paths | `GET /api/v1/route/authority` |

### Internal Modules (Pandora Codex - NEVER SHIPS)

| Module | Location | Purpose | Feeds Into |
|--------|----------|---------|------------|
| **capability-awareness** | `services/capability-awareness/` | Risk classification | Risk scoring, language shaping |
| **tool-awareness** | `internal/pandora-codex/ecosystem-awareness/` | Ecosystem knowledge | Risk models, warnings |
| **risk-models** | `internal/pandora-codex/risk-models/` | Risk algorithms | Classification engine |

---

## 🔗 COMPLETE WIRING DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (UI)                         │
│              apps/workshop-ui/src/                       │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP (api-client.ts)
                          ▼
┌─────────────────────────────────────────────────────────┐
│              API CLIENT (Bridge)                        │
│         apps/workshop-ui/src/lib/                        │
│              api-client.ts                              │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Requests
                          ▼
┌─────────────────────────────────────────────────────────┐
│              FASTAPI (HTTP Server)                       │
│                  api/forgeworks_api.py                  │
│                    Port 8001                            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Service Calls
                          ▼
┌─────────────────────────────────────────────────────────┐
│          RUST SERVICES (Core Logic)                      │
│                  services/                               │
│  ├── device-analysis/                                    │
│  ├── ownership-verification/                            │
│  ├── legal-classification/                              │
│  ├── audit-logging/                                     │
│  └── authority-routing/                                 │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Risk Inputs (One-Way)
                          ▼
┌─────────────────────────────────────────────────────────┐
│        PANDORA CODEX (Internal Only)                     │
│            internal/pandora-codex/                       │
│  ├── ecosystem-awareness/ (Your tool list)              │
│  ├── risk-models/                                        │
│  └── interpretive-guides/                               │
└─────────────────────────────────────────────────────────┘
                          │
                          │ (Never exposed)
                          │
                          ▼
                    [Sealed - Never Ships]
```

---

## 📡 API ENDPOINT → FRONTEND NODE MAPPING

| API Endpoint | Frontend Node | Backend Module | Elegant Wording |
|--------------|---------------|----------------|----------------|
| `POST /api/v1/device/analyze` | DeviceOverview | device-analysis | "Device State Overview" |
| `POST /api/v1/ownership/verify` | DeviceOverview | ownership-verification | "Ownership Confidence Assessment" |
| `POST /api/v1/legal/classify` | LegalClassification | legal-classification | "Jurisdictional Considerations" |
| `POST /api/v1/compliance/summary` | ComplianceSummary | All services | "Compliance Summary" |
| `POST /api/v1/interpretive/review` | CustodianVaultGate | legal-classification + Pandora | "Interpretive Review Mode" |
| `GET /api/v1/route/authority` | AuthorityRouting | authority-routing | "External Authorization Pathways" |
| `GET /api/v1/audit/events` | AuditLogTab | audit-logging | "Audit Trail" |
| `GET /api/v1/audit/export` | ExportReport | audit-logging + Python | "Generate Compliance Record" |
| `GET /api/v1/certification/status` | CertificationDashboard | certification | "Certification Dashboard" |
| `GET /api/v1/ops/metrics` | OpsDashboard | metrics | "Operations Control Tower" |

---

## 🎯 HOW YOUR TOOL LIST IS WIRED (SAFELY)

### Your Tool List → Internal Files

**iPhone Jailbreak Tools:**
- **File:** `internal/pandora-codex/ecosystem-awareness/ios-security-research.md`
- **Contains:** Palera1n, Dopamine, Checkra1n, Misaka26, Fugu15, etc.
- **Framed As:** "Historical security research projects"
- **Feeds Into:** Risk classification, language shaping
- **Never:** Instructions, steps, binaries, links

**iPhone Bypass Software:**
- **File:** `internal/pandora-codex/ecosystem-awareness/ios-account-risk.md`
- **Contains:** iRemoval Pro, Checkm8.info, Sliver, HFZ Activator, etc.
- **Framed As:** "Account-level risk vectors"
- **Feeds Into:** Warning elevation, external authorization requirements
- **Never:** Tool recommendations, procedural guidance

**Android Root Tools:**
- **File:** `internal/pandora-codex/ecosystem-awareness/android-system-research.md`
- **Contains:** Magisk, KernelSU, APatch, Odin, MTK Client, etc.
- **Framed As:** "System modification research"
- **Feeds Into:** Capability ceiling assessment, risk classification
- **Never:** Execution paths, tool integration

**Android FRP Tools:**
- **File:** `internal/pandora-codex/ecosystem-awareness/android-account-risk.md`
- **Contains:** UnlockTool, SamFW, Chimera, Octoplus, Z3X, etc.
- **Framed As:** "Professional unlocking research ecosystem"
- **Feeds Into:** Risk scoring, routing requirements
- **Never:** Tool usage, procedural steps

**GitHub Projects:**
- **File:** `internal/pandora-codex/ecosystem-awareness/github-projects.md`
- **Contains:** topjohnwu/Magisk, palera1n/palera1n, opa334/Dopamine, etc.
- **Framed As:** "Academic/research provenance"
- **Feeds Into:** Ecosystem awareness, risk modeling
- **Never:** Links, binaries, version mapping

### How This Feeds Frontend (Indirectly)

**Step 1:** Device analyzed
**Step 2:** Backend checks `capability_map.json` (informed by Pandora)
**Step 3:** Risk profile assigned (e.g., "hardware_research" → high risk)
**Step 4:** Language tone selected (e.g., "strict" tone)
**Step 5:** Frontend displays: "Device class has historical research exposure"
**Step 6:** Compliance report auto-inserts: "Security Context: Devices in this class have historically been subject to independent security research..."

**User Never Sees:**
- Tool names
- Instructions
- Links
- Steps

**User Only Sees:**
- Risk classifications
- Warnings
- Routing guidance
- Compliance language

---

## 🔒 HIDDEN vs NON-HIDDEN (STRICT BOUNDARIES)

### NON-HIDDEN (Public / Shippable)
```
apps/workshop-ui/              # All UI code
services/device-analysis/      # Analysis logic
services/ownership-verification/ # Confidence scoring
services/legal-classification/  # Jurisdiction maps
services/audit-logging/        # Logging engine
services/authority-routing/    # Routing logic
api/forgeworks_api.py          # Public API
docs/public/                   # Public documentation
```

### GATED (Enterprise / Permissioned)
```
apps/forgeworks-core/          # Admin UI
services/metrics/              # Operations dashboard
services/auth/                 # SSO/OIDC
docs/enterprise/               # Enterprise docs
```

### HIDDEN (Internal / Never Ships)
```
internal/pandora-codex/        # R&D vault
services/capability-awareness/ # Tool awareness (internal only)
internal/pandora-codex/ecosystem-awareness/ # Your tool list
manufacturing/                 # Hardware specs
firmware/                     # Firmware internals
```

**CI Rule:** If Pandora Codex is referenced outside `/internal/`, build fails.

---

## 🎨 ICONS & SPLASH (Exact Placement)

### Icons
**Location:** `apps/workshop-ui/assets/icons/`

**Files:**
- `app-icon.svg` → Main app icon (shield + circuit)
- `shield-analysis.svg` → Analysis icon
- `vault-mark.svg` → Custodian Vault icon
- `workshop-mark.svg` → Workshop mark

**Usage:**
```tsx
// In components
<img src="/assets/icons/shield-analysis.svg" alt="Analysis" />

// In Tauri config
{
  "bundle": {
    "icon": ["assets/icons/app-icon-*.png"]
  }
}
```

### Splash Screen
**Location:** `apps/workshop-ui/assets/splash/`

**Files:**
- `splash-screen.html` → HTML splash
- `splash-theme.css` → Bronx Night theme

**Usage:**
- Tauri shows during backend health check
- Displays: "Bobby's Workshop 3.0 - Analysis • Classification • Lawful Routing"

---

## 🧪 PYTHON WORKER (Bundled, Auto-Launched)

### Structure
```
python/app/
├── main.py        # HTTP server (port 8001 or auto)
├── health.py      # Health check
├── inspect.py     # Device inspection (read-only)
├── logs.py        # Log collection
├── report.py      # PDF formatting
└── policy.py      # Policy mirror (never escalates)
```

### Auto-Launcher
**File:** `apps/workshop-ui/src-tauri/src/launcher.rs`

**Flow:**
1. Tauri spawns bundled Python on app start
2. Waits for `/health` endpoint
3. Unlocks UI when ready
4. Kills Python on app exit

**Connection:**
- Frontend → Rust → Python (HTTP localhost)
- Python only: inspects, collects logs, formats reports
- Python never: executes device changes

---

## 📋 FINAL CHECKLIST

### Frontend Nodes
- [x] DeviceOverview
- [x] ComplianceSummary
- [x] LegalClassification
- [x] CustodianVaultGate
- [x] CertificationDashboard
- [x] OpsDashboard
- [x] AuditLogTab
- [x] Icons generated
- [x] Splash screen created
- [ ] PDF export wired
- [ ] Theme toggle
- [ ] Animations applied

### Backend Modules
- [x] device-analysis
- [x] ownership-verification
- [x] legal-classification
- [x] audit-logging
- [x] authority-routing
- [x] ForgeWorks API created
- [x] Python worker structured
- [ ] Rust services integrated (currently mocks)
- [ ] Python bundling in Tauri
- [ ] Auto-launcher implemented

### Internal (Pandora Codex)
- [x] Structure defined
- [x] Tool list files created
- [x] Risk models defined
- [ ] Language shaping engine
- [ ] CI isolation enforced

---

**This is your complete infrastructure. Every node, every module, every connection is mapped.**
