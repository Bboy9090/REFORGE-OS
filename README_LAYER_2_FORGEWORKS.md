# ForgeWorks Core (Layer 2 — Compliance Spine)

**Purpose:** Device status evaluation, Ownership verification, Legal classification, Audit logging, External authority routing

---

## What This Layer Is

ForgeWorks Core is the compliance-first analysis engine that powers REFORGE OS. It provides:

- Device status evaluation
- Ownership verification
- Jurisdiction-aware legal classification
- Immutable audit logging
- External authority routing (OEMs, carriers, courts)

**Key Principle:** ForgeWorks never does. ForgeWorks decides and documents.

---

## Technology Stack

- **Core Services:** Rust microservices
- **API Bridge:** FastAPI (Python)
- **Python Worker:** Stateless HTTP service
- **Database:** SQLite (local) / Postgres (cloud)

---

## Service Architecture

### device-analysis
- **Input:** Device metadata
- **Output:** Security state, capability class
- **Language:** "Observation", "Classification"

### ownership-verification
- **Input:** Attestation documents
- **Output:** Confidence score (0-100)
- **Key:** Confidence ≠ permission

### legal-classification
- **Input:** Device + region
- **Output:** permitted / conditional / prohibited
- **Rationale:** Human-readable explanation

### audit-logging
- **Input:** Event labels
- **Output:** Hash-chained log entries
- **Rule:** Append-only, immutable

### authority-routing
- **Input:** Classification result
- **Output:** OEM/carrier/court pathways
- **Reframe:** "Routing" not "resolution"

---

## API Endpoints

### Allowed
- `/api/v1/device/analyze`
- `/api/v1/ownership/verify`
- `/api/v1/legal/classify`
- `/api/v1/route/authority`
- `/api/v1/audit/log`
- `/api/v1/compliance/summary`
- `/api/v1/interpretive/review` (gated)

### Forbidden (Never Implement)
- `/execute`
- `/bypass`
- `/unlock`
- `/root`
- `/jailbreak`

---

## Compliance Rules

✅ **Always:**
- Analyze over action
- Interpret over execution
- Route to authority over bypass
- Ownership, consent, jurisdiction first

❌ **Never:**
- Execute bypass, jailbreak, root, unlock
- Provide exploit instructions
- Automate circumvention
- Link to executable tools

---

## Status

✅ **Core services implemented**  
✅ **API endpoints complete**  
✅ **Python worker ready**  
⏳ **Rust service integration pending**

---

**This is the compliance spine. It never executes. It only analyzes and routes.**