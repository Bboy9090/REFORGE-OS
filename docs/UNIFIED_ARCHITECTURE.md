# REFORGE OS — Unified Architecture Document
## Complete System Architecture Specification

**Date:** 2025-01-XX  
**Status:** UNIFIED ARCHITECTURE SPECIFICATION  
**Purpose:** Comprehensive architecture document combining all layers, services, and integrations

---

## 📐 ARCHITECTURE OVERVIEW

REFORGE OS is a **compliance-first, hardware-anchored platform** for device diagnostics, repair intelligence, and lawful recovery routing.

**Core Principle:** Analysis and routing, never execution of circumvention.

---

## 🏗️ THREE-LAYER ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│              LAYER 1: BOBBY'S WORKSHOP                  │
│                  (Public UI Layer)                      │
│  • Trust, Education, UX, Community                      │
│  • Device Analysis Dashboards                           │
│  • Legal Classifications                                │
│  • Compliance Reports                                   │
│  • Certification & Training                             │
│  • Theme: REFORGE Professional (dark blue-grey, gold)   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST API
                          ▼
┌─────────────────────────────────────────────────────────┐
│           LAYER 2: FORGEWORKS CORE                      │
│              (Compliance Spine)                         │
│  • Device Analysis Service                              │
│  • Ownership Verification                               │
│  • Legal Classification                                 │
│  • Audit Logging (Hash-chained)                         │
│  • Authority Routing                                    │
│  • Trapdoor API (Admin/Secret Rooms)                    │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Risk Inputs (One-Way)
                          ▼
┌─────────────────────────────────────────────────────────┐
│           LAYER 3: PANDORA CODEX                        │
│              (Internal Vault)                           │
│  • R&D Knowledge Base                                   │
│  • Risk Models                                          │
│  • Ecosystem Awareness                                  │
│  • Language Shaping Logic                               │
│  • NEVER SHIPS PUBLICLY                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🖥️ LAYER 1: BOBBY'S WORKSHOP (PUBLIC UI)

### Technology Stack
- **Framework:** Tauri + React + TypeScript
- **UI Library:** Tailwind CSS
- **State Management:** React Hooks / Context
- **Theme System:** REFORGE Professional Theme (CSS Variables)

### Components

#### Navigation Structure
```
App.tsx (Root)
├── Header (Logo, Title, Status)
├── Navigation Bar (27 tabs)
│   ├── Dashboard
│   ├── Device Analysis
│   ├── Compliance
│   ├── Legal Classification
│   ├── Certification
│   ├── Custodian Vault
│   ├── Operations
│   ├── Ownership
│   ├── Reports
│   ├── Settings
│   ├── Profile
│   └── ... (additional tabs)
└── Footer (Disclaimers)
```

#### Page Components (29 Total)

**Core Workflow:**
1. `DeviceOverview.tsx` - Device analysis interface
2. `ComplianceSummary.tsx` - Compliance reporting
3. `LegalClassification.tsx` - Legal classification
4. `CustodianVaultGate.tsx` - Interpretive review gate
5. `CertificationDashboard.tsx` - Certification status
6. `OpsDashboard.tsx` - Operations monitoring
7. `AuthorityRouting.tsx` - External authority pathways

**Data Management:**
8. `OwnershipAttestation.tsx` - Ownership document upload
9. `InterpretiveReview.tsx` - Full interpretive review UI
10. `ReportHistory.tsx` - Report history/archive viewer
11. `AuditLogTab.tsx` - Audit log viewer
12. `EvidenceBundleTab.tsx` - Evidence bundle generator

**Utility:**
13. `IntakeTab.tsx` - Case intake
14. `JobsTab.tsx` - Job management
15. `Settings.tsx` - Settings/preferences
16. `UserProfile.tsx` - User account management
17. `HelpViewer.tsx` - Help/documentation viewer
18. `NotificationsCenter.tsx` - Notifications/alerts center

**Advanced:**
19. `DeviceComparison.tsx` - Multi-device comparison
20. `BatchAnalysis.tsx` - Batch analysis interface
21. `CertificationExam.tsx` - Certification exam interface
22. `EcosystemAwareness.tsx` - Educational overview
23. `DeviceInsight.tsx` - Device state overview

**Technical:**
24. `ConsoleTab.tsx` - Console interface
25. `DevModeTab.tsx` - Developer mode
26. `DrivesTab.tsx` - Drive management
27. `ImagingTab.tsx` - Imaging interface
28. `DiagnosticsTab.tsx` - Diagnostics interface
29. `RecoveryTab.tsx` - Recovery interface

### Theme System

**REFORGE Professional Theme:**
- **Surfaces:** Dark blue-grey palette
- **Primary Accent:** Metallic gold (`#D4AF37`)
- **Secondary Accent:** Metallic bronze (`#CD7F32`)
- **Tertiary Accent:** Steel blue (`#5B7FA8`)
- **Implementation:** CSS Variables in `reforge-professional-theme.css`

### API Integration

**API Client:** `apps/workshop-ui/src/services/api.ts`
- `ForgeWorksAPI` class
- All safe endpoints defined
- Type definitions complete
- Error handling
- Request/response interceptors

---

## 🧠 LAYER 2: FORGEWORKS CORE (COMPLIANCE SPINE)

### Technology Stack
- **Core Services:** Rust (microservices)
- **API Bridge:** FastAPI (Python)
- **Database:** SQLite (local) + Postgres (cloud)
- **Communication:** HTTP/REST + WebSocket

### Core Services

#### 1. Device Analysis Service
**Location:** `services/device-analysis/`  
**Purpose:** Device state classification  
**Functions:**
- Device metadata analysis
- Security state detection
- Capability class assignment
- Platform identification

**API:** `POST /api/v1/device/analyze`

#### 2. Ownership Verification Service
**Location:** `services/ownership-verification/`  
**Purpose:** Confidence scoring  
**Functions:**
- Attestation document analysis
- Confidence score calculation (0-100)
- Evidence type tracking
- Missing evidence identification

**API:** `POST /api/v1/ownership/verify`

#### 3. Legal Classification Service
**Location:** `services/legal-classification/`  
**Purpose:** Jurisdiction-aware classification  
**Functions:**
- Jurisdiction detection
- Legal posture assignment (permitted/conditional/prohibited)
- Rationale generation
- Risk assessment

**API:** `POST /api/v1/legal/classify`

#### 4. Audit Logging Service
**Location:** `services/audit-logging/`  
**Purpose:** Hash-chained logs  
**Functions:**
- Immutable log creation
- Hash chain maintenance
- Timestamped entries
- Export capabilities

**API:** 
- `GET /api/v1/audit/events`
- `GET /api/v1/audit/export`

#### 5. Authority Routing Service
**Location:** `services/authority-routing/`  
**Purpose:** OEM/carrier/court routing  
**Functions:**
- Pathway identification
- Documentation checklists
- Contact information
- Required authorizations

**API:** `GET /api/v1/route/authority`

#### 6. Capability Awareness Service (Internal)
**Location:** `services/capability-awareness/`  
**Purpose:** Risk classification (internal only)  
**Functions:**
- Device capability mapping
- Risk profile assignment
- Language tone selection
- Interpretive review triggers

**Never Exposes:** Tool names, instructions, binaries

#### 7. Risk Language Engine
**Location:** `services/risk-language-engine/`  
**Purpose:** Language shaping  
**Functions:**
- Elegant wording generation
- Compliance-safe language
- Warning level assignment
- User-facing copy creation

### Trapdoor API (Admin Architecture)

**Purpose:** Secure, auditable privileged operations

**Endpoints:**
- `POST /api/trapdoor/frp` - FRP bypass workflow
- `POST /api/trapdoor/unlock` - Bootloader unlock
- `POST /api/trapdoor/workflow/execute` - Custom workflows
- `GET /api/trapdoor/workflows` - List workflows
- `GET /api/trapdoor/logs/shadow` - Encrypted audit logs
- `POST /api/trapdoor/logs/rotate` - Log rotation
- `POST /api/trapdoor/batch/execute` - Batch operations

**Authentication:**
- Header: `X-API-Key: <admin-api-key>`
- Alternative: `X-Secret-Room-Passcode: <passcode>`
- Rate limiting
- Shadow logging

### Custodial Closet (Solutions Database)

**Purpose:** Solutions database for all device problems

**Coverage:**
- Computers (Windows, Linux)
- MacBooks & iMacs
- Android devices
- iOS devices

**Features:**
- Problem → Solution mapping
- Guided repair procedures
- Fix workflows
- Device-specific solutions

**Access:**
- Ownership confidence ≥ 85
- Interpretive/analysis mode
- Logged for compliance

### Python Worker

**Location:** `python/app/`  
**Purpose:** Inspection, logs, PDF formatting

**Endpoints:**
- `POST /inspect/basic` - Device inspection
- `POST /inspect/deep` - Deep inspection
- `POST /logs/collect` - Log collection
- `POST /report/format` - PDF formatting
- `GET /health` - Health check

---

## 🔐 LAYER 3: PANDORA CODEX (INTERNAL VAULT)

### Structure

```
internal/pandora-codex/
├── CHARTER.md
├── ecosystem-awareness/
│   ├── ios-security-research.md
│   ├── ios-account-risk.md
│   ├── android-system-research.md
│   ├── android-account-risk.md
│   └── github-projects.md
├── risk-models/
│   ├── volatility.ts
│   ├── legal-fragility.ts
│   └── abuse-potential.ts
└── interpretive-guides/
    ├── language-framing.md
    └── escalation-patterns.md
```

### Purpose
- R&D knowledge vault
- Risk modeling
- Language shaping
- Classification logic

### Rules
- ✅ May inform risk scoring
- ✅ May shape language
- ✅ May influence classification
- ❌ Never surfaces instructions
- ❌ Never surfaces tools
- ❌ Never surfaces automation
- ❌ NEVER SHIPS PUBLICLY

---

## 🔗 DATA FLOW ARCHITECTURE

### Example: Device Analysis Flow

```
User → DeviceOverview.tsx
  ↓
ForgeWorksAPI.analyzeDevice()
  ↓
POST /api/v1/device/analyze
  ↓
FastAPI: api/forgeworks_api.py
  ↓
Rust: services/device-analysis/src/lib.rs
  ↓
Returns: DeviceProfile
  ↓
Frontend displays: "Device State Overview"
```

### Example: Interpretive Review Flow

```
User → CustodianVaultGate.tsx
  ↓
Checks: ownershipConfidence >= 85
  ↓
User acknowledges
  ↓
ForgeWorksAPI.interpretiveReview()
  ↓
POST /api/v1/interpretive/review
  ↓
Header: X-Ownership-Confidence: 85
  ↓
FastAPI → Rust: services/legal-classification/
  ↓
Pandora Codex: Risk context (internal only)
  ↓
Returns: Risk framing, historical context, authority paths
  ↓
Frontend displays: "Interpretive Review Mode - Analysis Only"
```

### Example: Trapdoor Workflow Flow

```
Admin → Trapdoor UI
  ↓
TrapdoorAPI.executeWorkflow()
  ↓
POST /api/trapdoor/workflow/execute
  ↓
Header: X-API-Key: <admin-key>
  ↓
FastAPI: Admin middleware (authorization check)
  ↓
Workflow Engine: Execute workflow
  ↓
Shadow Logger: Encrypt and log operation
  ↓
Returns: Workflow results
  ↓
Frontend displays: Results with audit reference
```

---

## 🔒 SECURITY ARCHITECTURE

### Authentication & Authorization

**Public Endpoints:**
- Standard API key (optional)
- Rate limiting
- Basic validation

**Admin Endpoints (Trapdoor):**
- Admin API key required
- Role-based access control
- Operation allowlists
- Explicit authorization checks

**Shadow Logging:**
- AES-256-GCM encryption
- PBKDF2 key derivation (100,000 iterations)
- SHA-256 tamper detection
- 90-day retention (default)

### Compliance Rules

**Language Rules:**
- ✅ Use: Analyze, Interpret, Classify, Route
- ❌ Never: Bypass, Unlock, Jailbreak, Root

**API Rules:**
- ✅ Allowed: `/device/analyze`, `/ownership/verify`, `/legal/classify`
- ❌ Forbidden: `/execute`, `/bypass`, `/unlock`

**Pandora Codex Rules:**
- ✅ May inform risk scoring
- ❌ Never surfaces instructions/tools/automation

---

## 📊 DEPLOYMENT ARCHITECTURE

### Local Deployment
- Desktop application (Tauri)
- Local SQLite database
- Direct hardware access
- Offline capability

### Cloud Deployment (Optional)
- Web dashboard
- Cloud Postgres database
- API gateway
- Hardware-limited features

### Hybrid Deployment
- Desktop for hardware operations
- Cloud for analytics & reporting
- Sync between platforms

---

## 🎯 ARCHITECTURAL PRINCIPLES

1. **Hardware-First:** Hardware anchors trust and access
2. **Compliance-Embedded:** Legal checks in every layer
3. **Analysis-Only:** No execution of circumvention
4. **Audit-Everything:** Immutable logs for all actions
5. **Modular Design:** Services can evolve independently
6. **Clear Boundaries:** Public vs internal strictly enforced
7. **Theme Consistency:** Professional theme across all UI
8. **API-First:** All operations through defined APIs

---

**This is the unified architecture specification. All implementation follows this structure.**
