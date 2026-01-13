# REFORGE OS — Unified Architecture Document
## Complete System Architecture & Design Specification

**Date:** 2025-01-10  
**Status:** AUTHORITATIVE ARCHITECTURE — Single Source of Truth  
**Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Three-Layer Architecture](#three-layer-architecture)
4. [Technical Stack](#technical-stack)
5. [Module Architecture](#module-architecture)
6. [Data Flow Architecture](#data-flow-architecture)
7. [API Architecture](#api-architecture)
8. [Security Architecture](#security-architecture)
9. [Compliance Architecture](#compliance-architecture)
10. [Theme & Design System](#theme--design-system)
11. [Deployment Architecture](#deployment-architecture)
12. [Integration Patterns](#integration-patterns)

---

## Executive Summary

REFORGE OS (Bobby's Workshop 3.0) is a compliance-first, ownership-respecting, audit-logged platform that analyzes, interprets, and routes lawful device recovery—without executing circumvention. The platform consists of three distinct layers: Bobby's Workshop (Public UI), ForgeWorks Core (Compliance Spine), and Pandora Codex (Internal R&D Vault).

**Core Principle:** Power is preserved as judgment, not action.

---

## System Overview

### Platform Identity

**Name:** REFORGE OS (Bobby's Workshop 3.0)  
**Brand:** Bobby's Workshop  
**Core:** ForgeWorks  
**Internal Vault:** Pandora Codex

### Core Mission

Provide analysis, interpretation, classification, documentation, and routing to authority—never execution, bypass, or circumvention.

### Key Capabilities

1. **Device Analysis** — Read-only device diagnostics and classification
2. **Ownership Verification** — Confidence scoring from documentation
3. **Legal Classification** — Jurisdiction-aware legal posture assessment
4. **Audit Logging** — Immutable, hash-chained activity logs
5. **Authority Routing** — External authorization pathway identification
6. **Compliance Reporting** — Branded PDF reports with audit trails

### System Constraints

- **Analysis-Only** — No execution of device modifications
- **Compliance-First** — All actions must be auditable and legal
- **Layer Separation** — Strict boundaries between public, core, and internal
- **Language Control** — Elegant, regulator-safe wording required

---

## Three-Layer Architecture

### Layer 1: Bobby's Workshop (Public UI/Brand)

**Purpose:** Trust, Education, UX, Community, Reports

**Location:** `apps/workshop-ui/`

**Technology Stack:**
- **Framework:** Tauri (Desktop Application)
- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS + Custom Theme (REFORGE Professional)
- **State Management:** React Hooks
- **Routing:** Component-based (App.tsx)

**Components:**
- 29 GUI modules (pages/components)
- Theme system (REFORGE Professional)
- API client layer
- Navigation system

**Key Features:**
- Device analysis dashboards
- Legal classification interfaces
- Compliance summary views
- Certification management
- Report generation
- Help/documentation system

**Access:** Public (all users)

**Boundaries:**
- ✅ May display analysis results
- ✅ May show legal classifications
- ✅ May generate compliance reports
- ❌ Never references Pandora Codex directly
- ❌ Never exposes internal knowledge

### Layer 2: ForgeWorks Core (Compliance Spine/Backend)

**Purpose:** Device analysis, ownership verification, legal classification, audit logging, authority routing

**Location:** `services/` (Rust) + `api/` (FastAPI bridge)

**Technology Stack:**
- **Services:** Rust (7 microservices)
- **API Bridge:** FastAPI (Python)
- **Database:** SQLite (local) + PostgreSQL (cloud)
- **Communication:** REST APIs + WebSocket

**Services:**
1. **device-analysis** — Device classification engine
2. **ownership-verification** — Ownership confidence scoring
3. **legal-classification** — Jurisdiction-aware classification
4. **audit-logging** — Hash-chained audit logs
5. **authority-routing** — OEM/carrier/court routing
6. **capability-awareness** — Risk modeling (internal interface)
7. **risk-language-engine** — Language shaping engine

**Key Features:**
- Device status evaluation
- Ownership verification
- Jurisdiction-aware legal classification
- Immutable audit logging
- External authority routing
- Compliance reporting

**Access:** Public + Enterprise

**Boundaries:**
- ✅ Performs analysis and classification
- ✅ Generates compliance reports
- ✅ Routes to external authorities
- ✅ Accesses Pandora Codex for risk modeling (one-way)
- ❌ Never executes device modifications
- ❌ Never exposes Pandora Codex content

### Layer 3: Pandora Codex (Internal R&D Vault)

**Purpose:** R&D knowledge vault, risk modeling, language shaping

**Location:** `internal/pandora-codex/`

**Technology Stack:**
- **Knowledge Base:** Markdown files
- **Risk Models:** Rust algorithms
- **Storage:** Internal-only (never ships)

**Components:**
- **ecosystem-awareness/** — Tool ecosystem knowledge
  - `ios-security-research.md`
  - `ios-account-risk.md`
  - `android-system-research.md`
  - `android-account-risk.md`
  - `github-projects.md`
- **risk-models/** — Risk scoring algorithms
- **interpretive-guides/** — Language shaping frameworks

**Key Features:**
- Historical knowledge base
- Risk classification logic
- Language shaping guidance
- Ecosystem awareness

**Access:** Internal Only (Enterprise/Research tier)

**Critical Rule:** NEVER SHIPS PUBLICLY

**Boundaries:**
- ✅ May inform risk scoring
- ✅ May shape language
- ✅ May influence classification
- ❌ Never surfaces instructions
- ❌ Never surfaces tools
- ❌ Never surfaces automation
- ❌ Never ships in public builds

---

## Technical Stack

### Frontend Stack

**Desktop Framework:**
- **Tauri 1.x** — Cross-platform desktop application framework
- **Rust Backend** — Native system integration

**Frontend Framework:**
- **React 18** — UI library
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **Custom Theme** — REFORGE Professional theme system

**Build Tools:**
- **Vite** — Build tool and dev server
- **Tauri CLI** — Desktop app bundling

### Backend Stack

**Service Layer:**
- **Rust** — Core microservices
- **Cargo** — Package management
- **7 Services** — Modular architecture

**API Layer:**
- **FastAPI** — Python API framework
- **REST APIs** — HTTP endpoints
- **WebSocket** — Real-time updates (planned)

**Data Layer:**
- **SQLite** — Local database
- **PostgreSQL** — Cloud database (optional)
- **JSON Files** — Configuration and storage

### Internal Stack

**Knowledge Base:**
- **Markdown** — Documentation format
- **Git** — Version control

**Risk Models:**
- **Rust** — Algorithm implementation
- **JSON** — Configuration files

---

## Module Architecture

### Frontend Modules (29 Total)

**Core Workflow Modules (13):**
1. DeviceOverview — Device analysis interface
2. ComplianceSummary — Compliance reporting
3. LegalClassification — Legal classification
4. CustodianVaultGate — Interpretive review gate
5. CertificationDashboard — Certification status
6. OpsDashboard — Operations monitoring
7. AuthorityRouting — External authority pathways
8. EcosystemAwareness — Educational overview
9. DeviceInsight — Device state overview
10. IntakeTab — Case intake
11. JobsTab — Job management
12. AuditLogTab — Audit log viewer
13. EvidenceBundleTab — Evidence bundle generator

**Extended Modules (10):**
14. OwnershipAttestation — Ownership document upload
15. InterpretiveReview — Full interpretive review UI
16. ReportHistory — Report history/archive viewer
17. Settings — Settings/preferences page
18. UserProfile — User account management
19. CertificationExam — Certification exam interface
20. HelpViewer — Help/documentation viewer
21. NotificationsCenter — Notifications/alerts center
22. DeviceComparison — Multi-device comparison view
23. BatchAnalysis — Batch analysis interface

**Utility Pages (6):**
24. ConsoleTab — Console interface
25. DevModeTab — Developer mode
26. DrivesTab — Drive management
27. ImagingTab — Imaging interface
28. DiagnosticsTab — Diagnostics interface
29. RecoveryTab — Recovery interface

### Backend Services (7 Total)

**Core Services:**
1. **device-analysis** — Device classification engine
   - Input: Device metadata
   - Output: DeviceProfile (model, platform, deviceClass, securityState, capabilityClass)
   - Language: "Observation", "Classification", "Capability boundary"

2. **ownership-verification** — Ownership confidence scoring
   - Input: Attestation documents
   - Output: OwnershipAttestation (confidence score 0-100)
   - Key: Confidence ≠ permission

3. **legal-classification** — Jurisdiction-aware classification
   - Input: Device + region
   - Output: LegalClassification (permitted/conditional/prohibited, rationale)
   - Feeds: Pandora Codex knowledge (classification logic only)

4. **audit-logging** — Hash-chained audit logs
   - Input: Event labels
   - Output: Immutable log entries with hash chain
   - Rule: Append-only, no deletions

5. **authority-routing** — External routing
   - Input: Classification result
   - Output: AuthorityRoute (OEM/carrier/court pathways)
   - Reframe: "Routing" not "resolution"

**Internal Services:**
6. **capability-awareness** — Risk modeling
   - Input: Device + OS + chip
   - Output: High-level risk categories
   - Feeds: Pandora Codex knowledge
   - Never: Tool names, instructions

7. **risk-language-engine** — Language shaping
   - Input: Device context + classification
   - Output: LanguageOutput (tone, warning_level, recommended_path, user_facing_copy)
   - Purpose: Elegant, regulator-safe wording

---

## Data Flow Architecture

### Standard Analysis Flow

```
User Action
    ↓
Frontend: User Interface (Bobby's Workshop)
    ↓
API Client: HTTP Request
    ↓
FastAPI: API Bridge
    ↓
Rust Service: Core Logic (ForgeWorks Core)
    ↓
[Optional] Pandora Codex: Risk Modeling (Internal)
    ↓
Rust Service: Returns Result
    ↓
FastAPI: JSON Response
    ↓
Frontend: Display Result
    ↓
User: Views Analysis
```

### Interpretive Review Flow (Gated)

```
User Action (Custodian Vault Access)
    ↓
Frontend: Checks Ownership Confidence (≥85)
    ↓
Frontend: Checks User Role (Custodian)
    ↓
Frontend: User Acknowledgment
    ↓
API Client: HTTP Request (with headers)
    ↓
FastAPI: Validates Gate Requirements
    ↓
Rust Service: legal-classification + Pandora Context
    ↓
Pandora Codex: Risk Models + Language Shaping
    ↓
Rust Service: Returns Interpretive Result
    ↓
FastAPI: JSON Response
    ↓
Frontend: Display Interpretive Review
    ↓
Audit Log: Log Access
```

### Compliance Report Generation Flow

```
User Action (Generate Report)
    ↓
Frontend: ComplianceSummary Component
    ↓
API Client: Aggregate Requests
    ↓
FastAPI: Aggregates All Services
    ↓
Rust Services: device-analysis + ownership + legal + audit
    ↓
Rust Service: Returns Complete Report
    ↓
Python Worker: PDF Generation
    ↓
FastAPI: Returns PDF
    ↓
Frontend: Downloads PDF
    ↓
Audit Log: Log Export
```

---

## API Architecture

### API Design Principles

1. **Analysis-Only** — No execution endpoints
2. **Safe Language** — Elegant, regulator-safe wording
3. **Compliance-First** — All actions auditable
4. **Layer Separation** — Clear boundaries

### ForgeWorks Core API (`/api/v1/`)

**Device Operations:**
- `POST /device/analyze` — Device analysis
- `POST /ownership/verify` — Ownership verification
- `POST /legal/classify` — Legal classification
- `POST /compliance/summary` — Compliance summary (aggregated)

**Interpretive Review:**
- `POST /interpretive/review` — Interpretive review (gated)

**Routing:**
- `GET /route/authority` — Authority routing

**Audit:**
- `GET /audit/events` — Audit log events
- `GET /audit/export` — Audit log export

**Operations:**
- `GET /certification/status` — Certification status
- `GET /ops/metrics` — Operations metrics

### API Request/Response Patterns

**Request Headers:**
- `Content-Type: application/json`
- `X-Ownership-Confidence: <score>` (for gated endpoints)
- `X-User-Role: <role>` (for gated endpoints)

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2025-01-10T00:00:00Z",
    "audit_reference": "audit_xxx"
  }
}
```

**Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

---

## Security Architecture

### Security Principles

1. **Defense in Depth** — Multiple security layers
2. **Least Privilege** — Minimal required access
3. **Audit Everything** — All actions logged
4. **Layer Isolation** — Strict boundaries

### Security Layers

**Frontend Security:**
- Input validation
- XSS prevention
- CSRF protection
- Secure API communication

**Backend Security:**
- API authentication (planned)
- Input sanitization
- Output encoding
- Secure storage

**Data Security:**
- Encryption at rest (planned)
- Encryption in transit (HTTPS)
- Secure credential storage
- Audit log integrity

### Access Control

**Public Access:**
- Device analysis
- Legal classification
- Compliance reports
- Basic features

**Gated Access:**
- Interpretive Review (ownership confidence ≥85, Custodian role)
- Operations Dashboard (admin role)
- Certification Console (admin role)

**Internal Access:**
- Pandora Codex (Enterprise/Research tier only)
- Risk models (internal only)
- Tool ecosystem knowledge (internal only)

---

## Compliance Architecture

### Compliance Principles

1. **Analysis-Only** — No execution capabilities
2. **Audit-Everything** — Immutable logs
3. **Language Control** — Elegant wording
4. **Legal Alignment** — Jurisdiction-aware

### Compliance Mechanisms

**Language Guardrails:**
- Forbidden term scanning
- Elegant wording library
- Automated compliance checks
- Manual review processes

**Audit Logging:**
- Hash-chained logs
- Immutable entries
- Timestamped events
- Exportable records

**Boundary Enforcement:**
- CI guardrails (Pandora Codex isolation)
- Code review processes
- Automated testing
- Manual verification

### Legal Classification

**Jurisdiction Awareness:**
- Geographic detection
- Regional legal rules
- Regulatory alignment
- Precedent mapping

**Classification Outputs:**
- `permitted` — No restrictions
- `conditional` — Conditions apply
- `prohibited` — Not permitted

---

## Theme & Design System

### REFORGE Professional Theme

**Color Palette:**
- **Surfaces:** Dark Blue-Grey (`#1A1F2E`, `#252B3D`, `#2D3447`, `#353C52`)
- **Primary Accent:** Metallic Gold (`#D4AF37`) — ForgeWorks
- **Secondary Accent:** Metallic Bronze (`#CD7F32`) — Custodian Vault
- **Text:** Soft Ash (`#E8EAED`, `#B8BDC6`, `#8B949E`)
- **States:** Success (`#4CAF50`), Warning (`#FF9800`), Error (`#F44336`)

**Typography:**
- **Headers:** Bold, gold accents
- **Body:** System sans-serif
- **Mono:** SF Mono, Monaco, Fira Code

**Components:**
- Cards, buttons, inputs, badges
- Glow effects, shadows, borders
- Animations (fade, slide, shimmer)

**Status:** ✅ Theme CSS defined, ⏳ Application pending to all components

---

## Deployment Architecture

### Local Deployment

**Desktop Application:**
- Tauri bundle (Windows/macOS/Linux)
- Embedded Python runtime (planned)
- Local SQLite database
- Offline capability

**Components:**
- Frontend (React bundle)
- Backend (Rust services + FastAPI)
- Database (SQLite)
- Configuration (JSON files)

### Cloud Deployment (Optional)

**Web Application:**
- Web frontend (React)
- Cloud API (FastAPI)
- Cloud database (PostgreSQL)
- Hardware-limited features

**Components:**
- Frontend (React web bundle)
- Backend (FastAPI on cloud)
- Database (PostgreSQL)
- Authentication (planned)

### Hybrid Deployment

**Combined:**
- Desktop for hardware operations
- Cloud for analytics and reporting
- Sync between platforms
- Unified user experience

---

## Integration Patterns

### Frontend-Backend Integration

**Pattern:**
- React components → API client → FastAPI → Rust services
- TypeScript types for type safety
- Error handling at each layer
- Loading states for UX

**Example:**
```typescript
// Frontend
const result = await ForgeWorksAPI.analyzeDevice(metadata);

// API Client
static async analyzeDevice(metadata: any): Promise<DeviceProfile> {
  const response = await fetch(`${API_BASE}/device/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  });
  return response.json();
}

// Backend (FastAPI)
@router.post("/device/analyze")
async def analyze_device(metadata: dict):
    result = device_analysis_service.analyze(metadata)
    return result

// Rust Service
pub fn analyze(metadata: &DeviceMetadata) -> DeviceProfile {
    // Analysis logic
}
```

### Pandora Codex Integration

**Pattern:**
- One-way flow: Pandora → ForgeWorks → Bobby's Workshop
- Risk models inform classification
- Language shaping informs wording
- Never direct exposure

**Example:**
```rust
// ForgeWorks Core
fn classify_device(device: &Device) -> Classification {
    // Accesses Pandora Codex risk models
    let risk = pandora_codex::assess_risk(device);
    let language = risk_language_engine::shape_language(risk);
    Classification { risk, language }
}

// Pandora Codex (Internal)
fn assess_risk(device: &Device) -> RiskProfile {
    // Uses internal knowledge (never exposed)
    // Returns high-level categories only
}
```

---

## Conclusion

This unified architecture document provides the complete system architecture and design specification for REFORGE OS. The platform is built on three distinct layers with strict boundaries, compliance-first design, and analysis-only capabilities.

**Status:** ARCHITECTURE COMPLETE ✅  
**Implementation Status:** 85% Complete  
**Next Phase:** Final polish and integration

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-10  
**Next Review:** After Priority 1-3 completion
