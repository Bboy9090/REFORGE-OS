# Bobby's Workshop 3.0 / REFORGE OS — Complete Infrastructure Map
## Exact Files, Nodes, Modules, and Connections

**Status:** FINAL ARCHITECTURE — Ready for Implementation

---

## 🏗️ THE THREE LAYERS (FINAL STRUCTURE)

```
Bobby's Workshop 3.0
│
├── Layer 1: Bobby's Workshop (Public UI/Brand)
│   └── apps/workshop-ui/
│
├── Layer 2: ForgeWorks Core (Compliance Spine/Backend)
│   └── services/ + api/
│
└── Layer 3: Pandora Codex (Internal R&D Vault)
    └── internal/pandora-codex/
```

---

## 📁 COMPLETE FILE TREE (CANONICAL)

```
bobbys-workshop-3.0/
│
├── README.md                          # Public platform overview
├── REPO_GENESIS.md                    # Constitution (authoritative)
├── CURSOR_RULES.md                    # AI agent instructions
├── CONTRIBUTING.md                    # Public contributor rules
├── SECURITY.md                        # Security policy
├── LICENSE                            # License file
│
├── docs/
│   ├── public/                        # Public documentation
│   │   ├── platform-overview.md
│   │   ├── legal-taxonomy.md
│   │   ├── public-vs-internal.md
│   │   ├── complete-tool-list-framing.md  # How tools are referenced
│   │   ├── ui-navigation-labels.md
│   │   ├── ui-microcopy-library.md
│   │   ├── glossary-tool-agnostic.md
│   │   └── regulator-qa-appendix.md
│   │
│   ├── enterprise/                    # Enterprise-only docs
│   │   ├── compliance-brief.md
│   │   └── regulator-briefing.md
│   │
│   └── internal/                      # Internal-only docs
│       └── pandora-boundary.md
│
├── apps/
│   ├── workshop-ui/                   # PUBLIC UI (Tauri + React)
│   │   ├── src/
│   │   │   ├── pages/                 # Frontend nodes
│   │   │   │   ├── DeviceOverview.tsx
│   │   │   │   ├── ComplianceSummary.tsx
│   │   │   │   ├── LegalClassification.tsx
│   │   │   │   ├── CustodianVaultGate.tsx
│   │   │   │   ├── CertificationDashboard.tsx
│   │   │   │   ├── OpsDashboard.tsx
│   │   │   │   ├── AuditLogTab.tsx
│   │   │   │   └── ExportReport.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── BackendHealthGate.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ErrorAlert.tsx
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   └── api-client.ts      # Frontend → Backend bridge
│   │   │   │
│   │   │   ├── styles/
│   │   │   │   ├── bronx-night-theme.css
│   │   │   │   └── design-system.css
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   └── languageGuard.ts   # Blocks forbidden terms
│   │   │   │
│   │   │   └── App.tsx
│   │   │
│   │   ├── assets/
│   │   │   ├── icons/
│   │   │   │   ├── app-icon.svg
│   │   │   │   ├── shield-analysis.svg
│   │   │   │   ├── vault-mark.svg
│   │   │   │   └── workshop-mark.svg
│   │   │   │
│   │   │   └── splash/
│   │   │       ├── splash-screen.html
│   │   │       └── splash-theme.css
│   │   │
│   │   ├── src-tauri/
│   │   │   ├── src/
│   │   │   │   ├── main.rs
│   │   │   │   └── launcher.rs        # Python auto-launcher
│   │   │   ├── tauri.conf.json
│   │   │   └── Cargo.toml
│   │   │
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── forgeworks-core/               # Admin/Enterprise UI (optional)
│       └── (similar structure)
│
├── services/                          # RUST — Core Logic (Backend Modules)
│   ├── device-analysis/
│   │   ├── src/
│   │   │   ├── lib.rs                 # Device analysis engine
│   │   │   └── classify.rs
│   │   └── Cargo.toml
│   │
│   ├── ownership-verification/
│   │   ├── src/
│   │   │   ├── lib.rs                 # Ownership confidence scoring
│   │   │   └── attestations.rs
│   │   └── Cargo.toml
│   │
│   ├── legal-classification/
│   │   ├── src/
│   │   │   ├── lib.rs                  # Jurisdiction-aware classification
│   │   │   └── jurisdiction-map/
│   │   └── Cargo.toml
│   │
│   ├── audit-logging/
│   │   ├── src/
│   │   │   ├── lib.rs                 # Hash-chained audit logs
│   │   │   └── hash-chain.rs
│   │   └── Cargo.toml
│   │
│   ├── authority-routing/
│   │   ├── src/
│   │   │   ├── lib.rs                 # OEM/carrier/court routing
│   │   │   └── pathways.rs
│   │   └── Cargo.toml
│   │
│   └── capability-awareness/          # INTERNAL — Risk modeling
│       ├── src/
│       │   └── lib.rs
│       └── capability_map.json       # Tool awareness (no execution)
│
├── api/                               # FASTAPI — HTTP Bridge
│   ├── main.py                        # Legacy API (cases, diagnostics)
│   └── forgeworks_api.py              # ForgeWorks Core API
│
├── python/                            # PYTHON WORKER (Bundled)
│   └── app/
│       ├── main.py                    # HTTP service entry
│       ├── health.py
│       ├── inspect.py                 # Device inspection (read-only)
│       ├── logs.py                    # Log collection
│       ├── report.py                  # PDF formatting
│       └── policy.py                  # Policy mirror (never escalates)
│
├── internal/
│   └── pandora-codex/                 # INTERNAL ONLY — NEVER SHIPS
│       ├── CHARTER.md                 # Internal rules
│       │
│       ├── ecosystem-awareness/       # Your tool list lives here
│       │   ├── ios-security-research.md
│       │   ├── ios-account-risk.md
│       │   ├── android-system-research.md
│       │   ├── android-account-risk.md
│       │   └── github-projects.md
│       │
│       ├── risk-models/               # Risk scoring algorithms
│       │   ├── volatility.ts
│       │   ├── legal-fragility.ts
│       │   └── abuse-potential.ts
│       │
│       └── interpretive-guides/       # Language shaping
│           ├── language-framing.md
│           └── escalation-patterns.md
│
├── governance/
│   ├── compliance-policy/
│   │   ├── allowed-actions.md
│   │   └── forbidden-actions.md
│   │
│   ├── language-guardrails/
│   │   ├── forbidden-terms.json       # ["bypass", "unlock", ...]
│   │   └── replacement-map.json
│   │
│   └── access-control/
│       ├── roles.ts
│       └── permission-matrix.ts
│
├── manufacturing/                     # Hardware (if applicable)
│   ├── bom/
│   ├── rfq/
│   ├── qa/
│   └── scripts/
│
└── .github/
    └── workflows/
        └── compliance-guard.yml      # CI guardrails
```

---

## 🖥️ FRONTEND NODES (What Users See)

### Public Nodes (Always Visible)

**1. Device Overview** (`DeviceOverview.tsx`)
- **Purpose:** Calm authority, no fear
- **Shows:**
  - Device model & platform
  - Observed security posture
  - Capability class (read-only)
- **Elegant Wording:**
  - "Device State Overview"
  - "Observed Protection Layer"
  - "Recovery Feasibility: Under Review"
- **Backend Connection:**
  - `GET /api/v1/device/analyze` (ForgeWorks API)
  - `POST /api/v1/ownership/verify` (ForgeWorks API)

**2. Ownership Confidence** (`OwnershipConfidence.tsx` - embedded in DeviceOverview)
- **Purpose:** Shift responsibility to documentation
- **Shows:**
  - Attestation types submitted
  - Confidence score (0-100)
  - Missing evidence (phrased gently)
- **Elegant Wording:**
  - "Ownership Confidence Assessment"
  - "Additional documentation may be required"
  - "Confidence threshold not yet met"
- **Backend Connection:**
  - `POST /api/v1/ownership/verify` (ForgeWorks API)

**3. Legal Classification** (`LegalClassification.tsx`)
- **Purpose:** Make law navigable
- **Shows:**
  - Jurisdiction detected
  - Default legal posture
  - Conditional paths (high-level)
- **Elegant Wording:**
  - "Jurisdictional Considerations"
  - "Permitted with Conditions"
  - "External authorization likely required"
- **Backend Connection:**
  - `POST /api/v1/legal/classify` (ForgeWorks API)

**4. Compliance Summary** (`ComplianceSummary.tsx`)
- **Purpose:** One-screen truth for users, shops, regulators
- **Shows:**
  - Device + ownership + legal result
  - Audit reference ID
  - Next lawful step (non-actionable)
- **Elegant Wording:**
  - "Compliance Summary"
  - "This assessment documents analysis only"
  - "No modification or circumvention performed"
- **Backend Connection:**
  - `POST /api/v1/compliance/summary` (ForgeWorks API)
  - `GET /api/v1/audit/export` (ForgeWorks API)

**5. Report Export** (`ExportReport.tsx` - embedded in ComplianceSummary)
- **Purpose:** Turn complexity into paperwork
- **Does:**
  - Exports PDF
  - Includes audit hash
  - Auto-includes disclaimers
- **Elegant Wording:**
  - "Generate Compliance Record"
  - "Export for records or third-party review"
- **Backend Connection:**
  - `POST /api/v1/audit/export` (ForgeWorks API)
  - Python worker: `POST /report/format` (PDF generation)

### Conditional Nodes (Gated)

**6. Interpretive Review** (`CustodianVaultGate.tsx`)
- **Purpose:** Handle edge cases without crossing lines
- **Visible Only If:**
  - Ownership confidence ≥ 85
  - User role = Custodian
  - Explicit acknowledgment accepted
- **Shows:**
  - Risk framing
  - Historical context (no steps)
  - Required authority paths
- **Elegant Wording:**
  - "Interpretive Review Mode"
  - "Historical context provided for assessment only"
  - "No procedural guidance is displayed"
- **Backend Connection:**
  - `POST /api/v1/interpretive/review` (ForgeWorks API)
  - Requires `X-Ownership-Confidence` header

**7. Authority Routing** (`AuthorityRouting.tsx` - embedded in Interpretive Review)
- **Purpose:** Replace "tools" with institutions
- **Shows:**
  - OEM contact path
  - Carrier escalation path
  - Court/executor path
- **Elegant Wording:**
  - "External Authorization Pathways"
  - "Recommended next lawful channel"
  - "Proceeding requires third-party approval"
- **Backend Connection:**
  - `GET /api/v1/route/authority` (ForgeWorks API)

### Admin/Ops Nodes (Hidden from Users)

**8. Operations Dashboard** (`OpsDashboard.tsx`)
- **Purpose:** Control tower for platform health
- **Shows:**
  - Active units
  - Audit coverage %
  - Compliance escalations
  - Manufacturing health
- **Backend Connection:**
  - `GET /api/v1/ops/metrics` (ForgeWorks API)

**9. Certification Console** (`CertificationDashboard.tsx`)
- **Purpose:** Technician certification management
- **Shows:**
  - Certification levels
  - Requirements
  - Status
- **Backend Connection:**
  - `GET /api/v1/certification/status` (ForgeWorks API)

**10. Audit Monitor** (`AuditLogTab.tsx`)
- **Purpose:** Immutable audit log viewer
- **Shows:**
  - All logged events
  - Hash chain integrity
  - Export capability
- **Backend Connection:**
  - `GET /api/v1/audit/events` (ForgeWorks API)

---

## 🧠 BACKEND MODULES (What Actually Runs)

### Core Modules (ForgeWorks - Public)

**1. device-analysis** (`services/device-analysis/`)
- **Does:**
  - Reads metadata (non-invasive)
  - Classifies protection level
  - Assigns capability ceiling
- **Language Used Internally:**
  - "Observation"
  - "Classification"
  - "Capability boundary"
- **API Endpoint:**
  - `POST /api/v1/device/analyze` (FastAPI → Rust service)
- **Frontend Calls:**
  - `deviceAnalysisApi.analyze()` in `api-client.ts

**2. ownership-verification** (`services/ownership-verification/`)
- **Does:**
  - Scores attestations
  - Tracks evidence types
  - Produces confidence number
- **Key Idea:**
  - Confidence ≠ permission
- **API Endpoint:**
  - `POST /api/v1/ownership/verify` (FastAPI → Rust service)
- **Frontend Calls:**
  - `ownershipApi.verify()` in `api-client.ts`

**3. legal-classification** (`services/legal-classification/`)
- **Does:**
  - Loads jurisdiction map
  - Assigns legal posture
  - Attaches rationale text
- **Outputs:**
  - `permitted`
  - `conditional`
  - `prohibited`
  - (with human-readable explanation)
- **API Endpoint:**
  - `POST /api/v1/legal/classify` (FastAPI → Rust service)
- **Frontend Calls:**
  - `legalApi.classify()` in `api-client.ts`

**4. audit-logging** (`services/audit-logging/`)
- **Does:**
  - Hash-chained append-only logs
  - Timestamped events
  - Immutable references
- **This is your spine.**
- **API Endpoints:**
  - `POST /api/v1/audit/log` (internal)
  - `GET /api/v1/audit/events` (FastAPI)
  - `GET /api/v1/audit/export` (FastAPI)
- **Frontend Calls:**
  - `auditApi.getEvents()` in `api-client.ts`

**5. authority-routing** (`services/authority-routing/`)
- **Does:**
  - Maps outcomes → institutions
  - Generates documentation checklists
  - Never generates actions
- **Key Reframe:**
  - "Routing" instead of "resolution"
- **API Endpoint:**
  - `GET /api/v1/route/authority` (FastAPI → Rust service)
- **Frontend Calls:**
  - `routingApi.getAuthority()` in `api-client.ts`

### Internal Modules (Pandora Codex - NEVER SHIPS)

**6. capability-awareness** (`services/capability-awareness/`)
- **Purpose:**
  - Maps device + OS + chip → risk class
  - Adjusts language, warnings, gating thresholds
- **File:**
  - `capability_map.json` (references tool categories, not tools)
- **Feeds:**
  - Risk scoring
  - Language engine
  - Interpretive review triggers
- **Never Exposes:**
  - Tool names
  - Instructions
  - Binaries
- **How Your Tool List Is Used:**
  ```json
  {
    "hardware_research": {
      "description": "Historical study of boot-level protections",
      "risk": { "account": "high", "data": "high", "legal": "medium" },
      "ui_tone": "strict",
      "requires_interpretive_review": true
    }
  }
  ```

**7. risk-models** (`internal/pandora-codex/risk-models/`)
- **Used For:**
  - Language shaping
  - Risk scoring
  - Internal review only
- **Never Exposed:**
  - No APIs
  - No UI
  - No exports

**8. tool-awareness** (`internal/pandora-codex/ecosystem-awareness/`)
- **Purpose:**
  - Understand what exists in the world
  - Anticipate misuse
  - Adjust warnings and tone
- **Feeds:**
  - Copy
  - Gating logic
  - Escalation thresholds
- **Never Feeds:**
  - Instructions
  - Capabilities
  - Automation
- **Your Tool List Lives Here:**
  - `ios-security-research.md` (Palera1n, Dopamine, Checkra1n, etc.)
  - `ios-account-risk.md` (iRemoval Pro, Checkm8.info, Sliver, etc.)
  - `android-system-research.md` (Magisk, KernelSU, APatch, etc.)
  - `android-account-risk.md` (UnlockTool, SamFW, Chimera, etc.)
  - `github-projects.md` (topjohnwu/Magisk, palera1n/palera1n, etc.)

---

## 🔗 FRONTEND ↔ BACKEND CONNECTION MAP

### Flow Example: Device Analysis

```
User clicks "Analyze Device"
   ↓
Frontend: DeviceOverview.tsx
   ↓
api-client.ts → deviceAnalysisApi.analyze()
   ↓
HTTP POST → http://localhost:8001/api/v1/device/analyze
   ↓
FastAPI: api/forgeworks_api.py
   ↓
Rust Service: services/device-analysis/src/lib.rs
   ↓
Returns: DeviceProfile (model, security_state, capability_class)
   ↓
FastAPI → JSON Response
   ↓
Frontend displays: "Device State Overview"
```

### Flow Example: Interpretive Review (Custodian Vault)

```
User enters Custodian Vault (gated)
   ↓
Frontend: CustodianVaultGate.tsx
   ↓
Checks: ownershipConfidence >= 85
   ↓
User acknowledges: "I understand interpretive limits"
   ↓
api-client.ts → interpretiveApi.review()
   ↓
HTTP POST → http://localhost:8001/api/v1/interpretive/review
   ↓
Header: X-Ownership-Confidence: 85
   ↓
FastAPI: api/forgeworks_api.py
   ↓
Rust Service: services/legal-classification/ (with Pandora context)
   ↓
Pandora Codex: internal/pandora-codex/ (informs risk scoring)
   ↓
Returns: Risk framing, historical context, authority paths
   ↓
Frontend displays: "Interpretive Review Mode - Analysis Only"
```

---

## 🎨 ELEGANT WORDING LIBRARY (Use These Exact Phrases)

### Device Analysis
- "Device State Overview"
- "Observed Protection Layer"
- "Recovery Feasibility: Under Review"
- "Capability Class: Userland-Only"

### Ownership
- "Ownership Confidence Assessment"
- "Additional documentation may be required"
- "Confidence threshold not yet met"
- "External authorization likely required"

### Legal
- "Jurisdictional Considerations"
- "Permitted with Conditions"
- "External authorization likely required"
- "This scenario requires third-party approval"

### Compliance
- "This assessment documents analysis only"
- "No modification or circumvention performed"
- "All activity logged for compliance"
- "Audit reference attached"

### Interpretive Review
- "Interpretive Review Mode"
- "Historical context provided for assessment only"
- "No procedural guidance is displayed"
- "External authorization may be required"

### Authority Routing
- "External Authorization Pathways"
- "Recommended next lawful channel"
- "Proceeding requires third-party approval"
- "OEM / Carrier / Court authorization required"

---

## 🔒 HIDDEN vs NON-HIDDEN (STRICT BOUNDARIES)

### NON-HIDDEN (Public / Shippable)
- `apps/workshop-ui/` - All UI code
- `services/device-analysis/` - Analysis logic
- `services/ownership-verification/` - Confidence scoring
- `services/legal-classification/` - Jurisdiction maps
- `services/audit-logging/` - Logging engine
- `services/authority-routing/` - Routing logic
- `api/forgeworks_api.py` - Public API
- `docs/public/` - Public documentation

### GATED (Enterprise / Permissioned)
- `apps/forgeworks-core/` - Admin UI
- `services/metrics/` - Operations dashboard
- `services/auth/` - SSO/OIDC
- `docs/enterprise/` - Enterprise docs

### HIDDEN (Internal / Never Ships)
- `internal/pandora-codex/` - R&D vault
- `services/capability-awareness/` - Tool awareness (internal only)
- `internal/pandora-codex/ecosystem-awareness/` - Your tool list
- `manufacturing/` - Hardware specs
- `firmware/` - Firmware internals

**CI Rule:** If Pandora Codex is referenced outside `/internal/`, build fails.

---

## 🧩 HOW YOUR TOOL LIST IS IMPLEMENTED (SAFELY)

### Your List → Platform Implementation

**iPhone Jailbreak Tools** → `internal/pandora-codex/ecosystem-awareness/ios-security-research.md`
- Framed as: "Historical security research projects"
- Used for: Risk classification, language shaping
- Never: Instructions, steps, binaries, links

**iPhone Bypass Software** → `internal/pandora-codex/ecosystem-awareness/ios-account-risk.md`
- Framed as: "Account-level risk vectors"
- Used for: Elevate warnings, require external authorization
- Never: Procedural guidance, tool recommendations

**Android Root Tools** → `internal/pandora-codex/ecosystem-awareness/android-system-research.md`
- Framed as: "System modification research"
- Used for: Risk classification, capability ceiling assessment
- Never: Execution paths, tool integration

**Android FRP Tools** → `internal/pandora-codex/ecosystem-awareness/android-account-risk.md`
- Framed as: "Professional unlocking research ecosystem"
- Used for: Risk scoring, routing requirements
- Never: Tool usage, procedural steps

**GitHub Projects** → `internal/pandora-codex/ecosystem-awareness/github-projects.md`
- Framed as: "Academic/research provenance"
- Used for: Ecosystem awareness, risk modeling
- Never: Links, binaries, version mapping

### How This Feeds Frontend (Indirectly)

**Device Analysis Output:**
```json
{
  "device_id": "dev_001",
  "capability_class": "Userland-Only",
  "risk_profile": "Medium",
  "recommendation": "External authorization likely required"
}
```

**Compliance Report Auto-Insert:**
```
Security Context:
Devices in this class have historically been subject to independent 
security research. Unauthorized modification may result in data loss, 
account restriction, or legal exposure.

Bobby's Workshop does not deploy or recommend third-party modification 
software.
```

---

## 📡 API ENDPOINT MAP (Complete)

### ForgeWorks Core API (`api/forgeworks_api.py` - Port 8001)

**Device Operations:**
- `POST /api/v1/device/analyze` → `services/device-analysis/`
- `POST /api/v1/ownership/verify` → `services/ownership-verification/`
- `POST /api/v1/legal/classify` → `services/legal-classification/`
- `POST /api/v1/compliance/summary` → All services (aggregated)
- `POST /api/v1/interpretive/review` → `services/legal-classification/` + Pandora context

**Routing & Authority:**
- `GET /api/v1/route/authority` → `services/authority-routing/`

**Audit:**
- `GET /api/v1/audit/events` → `services/audit-logging/`
- `GET /api/v1/audit/export` → `services/audit-logging/`

**Operations:**
- `GET /api/v1/certification/status` → Certification system
- `GET /api/v1/ops/metrics` → Metrics aggregator

### Python Worker API (`python/app/main.py` - Port 8001 or separate)

**Inspection (Read-Only):**
- `POST /inspect/basic` → `python/app/inspect.py`
- `POST /inspect/deep` → `python/app/inspect.py`

**Logs & Reports:**
- `POST /logs/collect` → `python/app/logs.py`
- `POST /report/format` → `python/app/report.py`

**Health:**
- `GET /health` → `python/app/health.py`

### Legacy API (`api/main.py` - Port 8000)

**Cases & Jobs:**
- `GET /api/cases` → Cases API
- `POST /api/cases` → Create case

**Diagnostics:**
- `GET /api/diagnostics/run` → Diagnostics API

**Recovery:**
- `GET /api/recovery/guidance` → Recovery API

---

## 🎯 FRONTEND NODE → BACKEND MODULE MAPPING

| Frontend Node | Backend Module | API Endpoint | Elegant Wording |
|--------------|----------------|--------------|-----------------|
| Device Overview | device-analysis | `/api/v1/device/analyze` | "Device State Overview" |
| Ownership Confidence | ownership-verification | `/api/v1/ownership/verify` | "Ownership Confidence Assessment" |
| Legal Classification | legal-classification | `/api/v1/legal/classify` | "Jurisdictional Considerations" |
| Compliance Summary | All services | `/api/v1/compliance/summary` | "Compliance Summary" |
| Interpretive Review | legal-classification + Pandora | `/api/v1/interpretive/review` | "Interpretive Review Mode" |
| Authority Routing | authority-routing | `/api/v1/route/authority` | "External Authorization Pathways" |
| Audit Log | audit-logging | `/api/v1/audit/events` | "Audit Trail" |
| Report Export | audit-logging + Python | `/api/v1/audit/export` | "Generate Compliance Record" |
| Certification | certification | `/api/v1/certification/status` | "Certification Dashboard" |
| Ops Dashboard | metrics | `/api/v1/ops/metrics` | "Operations Control Tower" |

---

## 🔐 HIDDEN MODULES (Internal Only)

### Pandora Codex Internal Structure

```
internal/pandora-codex/
├── CHARTER.md                         # Internal rules
│
├── ecosystem-awareness/               # YOUR TOOL LIST LIVES HERE
│   ├── ios-security-research.md      # Palera1n, Dopamine, Checkra1n, etc.
│   ├── ios-account-risk.md           # iRemoval Pro, Checkm8.info, Sliver, etc.
│   ├── android-system-research.md   # Magisk, KernelSU, APatch, etc.
│   ├── android-account-risk.md      # UnlockTool, SamFW, Chimera, etc.
│   └── github-projects.md            # topjohnwu/Magisk, palera1n/palera1n, etc.
│
├── risk-models/                       # Risk scoring algorithms
│   ├── volatility.ts                 # How fast things change
│   ├── legal-fragility.ts           # Enforcement sensitivity
│   └── abuse-potential.ts            # Misuse risk scoring
│
└── interpretive-guides/              # Language shaping
    ├── language-framing.md           # How to talk without instructing
    ├── escalation-patterns.md        # When to stop and route
    └── precedent-translation.md      # Turning history into warnings
```

**How Pandora Feeds ForgeWorks (One-Way Only):**

```
Pandora Codex (internal)
   ↓ (risk models, language guidance ONLY)
ForgeWorks Core
   ↓ (reports, classifications ONLY)
Bobby's Workshop UI
```

**Never:**
- Pandora → Frontend (direct)
- Pandora → Public API
- Pandora → Documentation

---

## 🎨 ICONS & SPLASH (Where They Go)

### Icons
**Location:** `apps/workshop-ui/assets/icons/`

**Files:**
- `app-icon.svg` - Main app icon (shield + circuit pattern)
- `shield-analysis.svg` - Analysis icon
- `vault-mark.svg` - Custodian Vault icon
- `workshop-mark.svg` - Workshop mark

**Usage in Tauri:**
```json
// tauri.conf.json
{
  "tauri": {
    "bundle": {
      "icon": [
        "assets/icons/app-icon-32.png",
        "assets/icons/app-icon-128.png",
        "assets/icons/app-icon-256.png",
        "assets/icons/app-icon-512.png"
      ]
    }
  }
}
```

### Splash Screen
**Location:** `apps/workshop-ui/assets/splash/`

**Files:**
- `splash-screen.html` - HTML splash with animations
- `splash-theme.css` - Bronx Night theme

**Usage:**
- Tauri shows splash during backend health check
- Displays: "Bobby's Workshop 3.0 - Analysis • Classification • Lawful Routing"

---

## 🧪 PYTHON WORKER (Bundled, Auto-Launched)

### Structure
```
python/
└── app/
    ├── main.py              # HTTP server entry
    ├── health.py            # Health check
    ├── inspect.py           # Device inspection (read-only)
    ├── logs.py              # Log collection
    ├── report.py            # PDF formatting
    └── policy.py            # Policy mirror (never escalates)
```

### Auto-Launcher (Tauri)
**File:** `apps/workshop-ui/src-tauri/src/launcher.rs`

**What It Does:**
1. Spawns bundled Python binary on app start
2. Waits for `/health` endpoint
3. Unlocks UI when backend ready
4. Kills Python process on app exit

**Connection:**
- Frontend → Rust → Python (via HTTP localhost)
- Python never executes device changes
- Python only: inspects, collects logs, formats reports

---

## 🔗 COMPLETE DATA FLOW (End-to-End)

### Example: User Analyzes Device

```
1. User opens app
   ↓
2. Tauri launches Python backend
   ↓
3. BackendHealthGate checks /health
   ↓
4. UI unlocks
   ↓
5. User enters device metadata
   ↓
6. Frontend: DeviceOverview.tsx
   ↓
7. api-client.ts → POST /api/v1/device/analyze
   ↓
8. FastAPI: api/forgeworks_api.py
   ↓
9. Rust: services/device-analysis/src/lib.rs
   ↓
10. Returns: DeviceProfile
   ↓
11. Frontend displays: "Device State Overview"
   ↓
12. User clicks "View Compliance Summary"
   ↓
13. Frontend: ComplianceSummary.tsx
   ↓
14. api-client.ts → POST /api/v1/compliance/summary
   ↓
15. FastAPI aggregates: device + ownership + legal
   ↓
16. Returns: Complete compliance report
   ↓
17. Frontend displays: "Compliance Summary"
   ↓
18. User clicks "Export PDF"
   ↓
19. Frontend → POST /api/v1/audit/export
   ↓
20. FastAPI → Python: POST /report/format
   ↓
21. Python generates branded PDF
   ↓
22. Returns PDF to frontend
   ↓
23. User downloads: "Compliance_Report_2025-01-10.pdf"
```

---

## 🎯 ELEGANT WORDING BY CONTEXT

### Device Analysis
- ✅ "Device State Overview"
- ✅ "Observed Protection Layer"
- ✅ "Capability Class: Userland-Only"
- ❌ "Unlockable"
- ❌ "Hackable"
- ❌ "Breakable"

### Ownership
- ✅ "Ownership Confidence Assessment"
- ✅ "Additional documentation may be required"
- ✅ "Confidence threshold not yet met"
- ❌ "Ownership verified" (too strong)
- ❌ "Device unlocked" (never)

### Legal
- ✅ "Jurisdictional Considerations"
- ✅ "Permitted with Conditions"
- ✅ "External authorization likely required"
- ❌ "Legal bypass"
- ❌ "Allowed to unlock"

### Interpretive Review
- ✅ "Interpretive Review Mode"
- ✅ "Historical context provided for assessment only"
- ✅ "No procedural guidance is displayed"
- ❌ "Bypass mode"
- ❌ "Expert tools"

---

## 🔒 FINAL BOUNDARY RULES

### What Ships (Public)
- Analysis results
- Classifications
- Reports
- Routing guidance
- Audit logs
- Education
- Certification

### What Never Ships (Internal)
- Exploit chains
- Bypass workflows
- Tool instructions
- Automation
- Pandora Codex content
- Tool binaries
- Step-by-step guides

### What's Gated (Enterprise)
- Interpretive Review (requires confidence + role)
- Operations Dashboard (admin only)
- Certification Console (admin only)
- Advanced metrics (enterprise only)

---

## 📋 IMPLEMENTATION CHECKLIST

### Frontend
- [x] DeviceOverview wired to API
- [x] ComplianceSummary wired to API
- [x] LegalClassification wired to API
- [x] CustodianVaultGate gated properly
- [x] CertificationDashboard wired
- [x] OpsDashboard wired
- [x] Icons generated
- [x] Splash screen created
- [x] Theme system (Bronx Night)
- [ ] PDF export wired with branding
- [ ] Theme toggle (dark/light)
- [ ] Safe animations applied

### Backend
- [x] ForgeWorks API created
- [x] Python worker structured
- [x] Rust services defined
- [ ] Rust services integrated (currently mocks)
- [ ] Python bundling in Tauri
- [ ] Auto-launcher implemented

### Internal
- [x] Pandora Codex structure defined
- [ ] Tool list files created (ecosystem-awareness/)
- [ ] Risk models implemented
- [ ] Language shaping engine

### Governance
- [x] Language guardrails defined
- [x] CI compliance guard created
- [x] Public vs internal boundaries locked
- [ ] Pandora isolation enforced in CI

---

**This is your complete infrastructure map. Every file, every connection, every boundary is defined.**
