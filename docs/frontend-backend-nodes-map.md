# Frontend Nodes ↔ Backend Modules Map

## Complete Architecture Map

### Frontend Nodes (What Users See)

#### 1. Device Insight
**Frontend:** `apps/workshop-ui/src/pages/DeviceOverview.tsx`
**Backend:** `services/device-analysis/`
**API:** `POST /device/analyze`
**Output:** Device model, security state, capability class

#### 2. Ownership Confidence
**Frontend:** `apps/workshop-ui/src/pages/DeviceOverview.tsx` (section)
**Backend:** `services/ownership-verification/`
**API:** `POST /ownership/verify`
**Output:** Confidence score (0-100), missing evidence

#### 3. Legal Context
**Frontend:** `apps/workshop-ui/src/pages/LegalClassification.tsx`
**Backend:** `services/legal-classification/`
**API:** `POST /legal/classify`
**Output:** Jurisdiction, classification, rationale

#### 4. Compliance Summary
**Frontend:** `apps/workshop-ui/src/pages/ComplianceSummary.tsx`
**Backend:** All services (aggregated)
**API:** `GET /compliance/summary`
**Output:** Complete compliance report

#### 5. Interpretive Review (Custodian Vault)
**Frontend:** `apps/workshop-ui/src/pages/CustodianVaultGate.tsx`
**Backend:** `services/legal-classification/` + `internal/pandora-codex/` (context only)
**API:** `POST /interpretive/review`
**Output:** Risk framing, historical context, authority paths
**Gate:** Ownership confidence ≥ 85, Custodian role

#### 6. Authority Routing
**Frontend:** `apps/workshop-ui/src/pages/RecoveryTab.tsx` (section)
**Backend:** `services/authority-routing/`
**API:** `POST /route/authority`
**Output:** OEM/carrier/court pathways

#### 7. Report Export
**Frontend:** `apps/workshop-ui/src/pages/ComplianceSummary.tsx` (button)
**Backend:** `services/audit-logging/` (export)
**API:** `GET /audit/export`
**Output:** PDF with audit hash

#### 8. Certification Dashboard
**Frontend:** `apps/workshop-ui/src/pages/CertificationDashboard.tsx`
**Backend:** `services/certification/` (if exists)
**API:** `GET /certification/status`
**Output:** Technician level, requirements

#### 9. Operations Dashboard
**Frontend:** `apps/workshop-ui/src/pages/OpsDashboard.tsx`
**Backend:** `services/metrics/`
**API:** `GET /ops/metrics`
**Output:** Active units, audit coverage, escalations

---

## Backend Modules (What Actually Runs)

### Core Services (ForgeWorks)

#### device-analysis
**Purpose:** Classify device capability ceiling
**Input:** Device metadata
**Output:** Security state, capability class
**Language:** "Observation", "Classification", "Capability boundary"

#### ownership-verification
**Purpose:** Score attestations
**Input:** Attestation documents
**Output:** Confidence score (0-100)
**Key:** Confidence ≠ permission

#### legal-classification
**Purpose:** Jurisdiction-aware legal posture
**Input:** Device + region
**Output:** permitted / conditional / prohibited
**Rationale:** Human-readable explanation

#### audit-logging
**Purpose:** Immutable audit trail
**Input:** Event labels
**Output:** Hash-chained log entries
**Rule:** Append-only, no deletions

#### authority-routing
**Purpose:** Map outcomes → institutions
**Input:** Classification result
**Output:** OEM/carrier/court pathways
**Reframe:** "Routing" not "resolution"

---

## Internal Modules (Pandora Codex - Never Ships)

### risk-models
**Purpose:** Language shaping, risk scoring
**Access:** Internal only
**Exposure:** Never

### tool-awareness
**Purpose:** Understand ecosystem, adjust warnings
**Access:** Internal only
**Feeds:** Copy, gating logic, escalation thresholds
**Never Feeds:** Instructions, capabilities, automation

### ecosystem-awareness
**Purpose:** Historical context, risk modeling
**Files:**
- `ios-security-research.md`
- `ios-account-risk.md`
- `android-system-research.md`
- `android-account-risk.md`
- `github-projects.md`

---

## Data Flow (Safe Pattern)

```
Frontend Request
   ↓
Ownership Verification (gate)
   ↓
Device Analysis
   ↓
Legal Classification
   ↓
Audit Log (append)
   ↓
Authority Routing (if conditional/prohibited)
   ↓
Frontend Display / PDF Export
```

**Critical Rule:** Flow always ends in documentation or routing, never action.

---

## Hidden vs Non-Hidden

### Non-Hidden (Public)
- Device Insight
- Ownership Confidence
- Legal Context
- Compliance Summary
- Report Export

### Gated (Conditional)
- Interpretive Review (Custodian role)
- Authority Routing (detail view)

### Hidden (Internal)
- Pandora Codex
- Risk models
- Tool awareness
- Manufacturing scripts
- Firmware internals

**CI Rule:** Build fails if hidden modules are referenced in public code.
