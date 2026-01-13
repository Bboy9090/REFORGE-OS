# Frontend ↔ Backend Integration Map

## Complete Node & Module Architecture

### Frontend Nodes (What Users See)

#### 1. Device Insight (`DeviceInsight.tsx`)
- **Purpose:** Calm authority, no fear, no power fantasy
- **Shows:** Device model, platform, security state, capability class, ownership confidence
- **Language:** "Device State Overview", "Observed Protection Layer", "Recovery Feasibility: Under Review"
- **Backend:** `device-analysis` → `capability-awareness` → `risk-language-engine`
- **API:** `POST /device/analyze` → `POST /language/shape`

#### 2. Ownership Confidence (`OwnershipConfidence.tsx`)
- **Purpose:** Shift responsibility from tool → user → documentation
- **Shows:** Attestation types, confidence score, missing evidence
- **Language:** "Ownership Confidence Assessment", "Additional documentation may be required"
- **Backend:** `ownership-verification`
- **API:** `POST /ownership/verify`

#### 3. Legal Context (`LegalClassification.tsx`)
- **Purpose:** Make law feel navigable, not adversarial
- **Shows:** Jurisdiction, default legal posture, conditional paths
- **Language:** "Jurisdictional Considerations", "Permitted with Conditions"
- **Backend:** `legal-classification`
- **API:** `POST /legal/classify`

#### 4. Compliance Summary (`ComplianceSummary.tsx`)
- **Purpose:** One-screen truth for users, shops, regulators
- **Shows:** Device + ownership + legal result, audit reference, next lawful step
- **Language:** "Compliance Summary", "This assessment documents analysis only"
- **Backend:** All services → `audit-logging`
- **API:** `POST /report/compliance`

#### 5. Report Export (`ExportReport.tsx`)
- **Purpose:** Turn complexity into paperwork (shield)
- **Does:** Exports PDF with audit hash and disclaimers
- **Language:** "Generate Compliance Record", "Export for records or third-party review"
- **Backend:** `audit-logging` → PDF generator
- **API:** `POST /report/compliance` → PDF render

#### 6. Interpretive Review (`CustodianVaultGate.tsx`)
- **Purpose:** Handle edge cases without crossing lines
- **Visible:** Only if ownership confidence ≥ threshold, user role = Custodian, acknowledgment accepted
- **Shows:** Risk framing, historical context (no steps), required authority paths
- **Language:** "Interpretive Review Mode", "Historical context provided for assessment only"
- **Backend:** `risk-language-engine` + `pandora-codex` (internal only)
- **API:** `POST /language/shape` (with elevated permissions)

#### 7. Authority Routing (`AuthorityRouting.tsx`)
- **Purpose:** Replace "tools" with institutions
- **Shows:** OEM contact path, carrier escalation, court/executor path
- **Language:** "External Authorization Pathways", "Recommended next lawful channel"
- **Backend:** `authority-routing`
- **API:** `POST /route/authority`

#### 8. Ecosystem Awareness (`EcosystemAwareness.tsx`)
- **Purpose:** Educational, high-level overview
- **Shows:** Security landscape categories, risk profiles (never tool names)
- **Language:** "Security Research Projects (Historical)", "Device State Alteration Software (Third-Party)"
- **Backend:** `capability-awareness` (high-level only)
- **API:** None (static educational content)

#### 9. Operations Dashboard (`OpsDashboard.tsx`)
- **Purpose:** Admin/ops monitoring
- **Shows:** Active units, audit coverage, escalations, manufacturing health
- **Backend:** `metrics` + `audit-logging`
- **API:** `GET /ops/metrics`

### Backend Modules (What Actually Runs)

#### Core Services (ForgeWorks)

##### device-analysis
- **Purpose:** Classify device capability ceiling
- **Input:** Device metadata
- **Output:** Security state, capability class
- **Language:** "Observation", "Classification", "Capability boundary"
- **Uses:** `capability-awareness` → `capability_map.json` + Pandora Codex awareness

##### ownership-verification
- **Purpose:** Score attestations
- **Input:** Attestation documents
- **Output:** Confidence score (0-100)
- **Key:** Confidence ≠ permission
- **Gates:** Everything else

##### legal-classification
- **Purpose:** Jurisdiction-aware legal posture
- **Input:** Device + region
- **Output:** permitted / conditional / prohibited
- **Rationale:** Human-readable explanation
- **Uses:** Jurisdiction maps (us.json, eu.json, etc.)

##### audit-logging
- **Purpose:** Immutable audit trail
- **Input:** Event labels
- **Output:** Hash-chained log entries
- **Rule:** Append-only, no deletions
- **Exports:** Regulator/enterprise bundles

##### authority-routing
- **Purpose:** Map outcomes → institutions
- **Input:** Classification result
- **Output:** OEM/carrier/court pathways
- **Reframe:** "Routing" not "resolution"
- **Never:** Replaces authority

##### capability-awareness
- **Purpose:** Classify research categories
- **Input:** Device class + platform
- **Output:** Risk profile, UI tone, gating requirements
- **Uses:** `capability_map.json` + Pandora Codex context (internal)
- **Feeds:** `risk-language-engine`

##### risk-language-engine
- **Purpose:** Shape UI copy, warnings, routing language
- **Input:** Device context + capability classification
- **Output:** Tone, warning level, recommended path, user-facing copy, compliance disclaimer
- **Never:** Exposes tool names, steps, execution paths
- **Feeds:** All frontend nodes

### Internal Modules (Pandora Codex - Never Ships)

##### ecosystem-awareness
- **Files:**
  - `ios-security-research.md` - All iOS jailbreak tools (Palera1n, Dopamine, Misaka26, Checkra1n, Fugu15/14, Unc0ver, Taurine, Odyssey, Chimera)
  - `ios-account-risk.md` - iOS bypass software (iRemoval Pro, Checkm8.info, Sliver, MinaCris, Tenorshare 4uKey, AnyUnlock, iMyFone, PassFab, Dr.Fone)
  - `android-system-research.md` - Android root tools (Magisk, KernelSU, APatch, Odin, SP Flash Tool, MiFlash Tool, MTK Client, QFIL, KingRoot, KingoRoot, Framaroot)
  - `android-account-risk.md` - Android FRP tools (UnlockTool, SamFW Tool, Chimera Tool, Octoplus Box, Z3X, Miracle Box, Hydra Tool, EFT Pro Dongle, FRP Hijacker, Technocare)
  - `github-projects.md` - Notable repos (topjohnwu/Magisk, tiann/KernelSU, palera1n/palera1n, opa334/Dopamine, straight-tamago/misaka26, bsway/APatch, pinauten/Fugu15)
- **Purpose:** Risk modeling, language shaping
- **Never:** Instructions, steps, binaries, links

##### risk-models
- **Purpose:** Language shaping, risk scoring
- **Access:** Internal only
- **Exposure:** Never

### Data Flow (Safe Pattern)

```
User Action (Frontend)
   ↓
Frontend API Call (ForgeWorksAPI)
   ↓
Backend Service (device-analysis)
   ↓
Capability Awareness (classify)
   ↓
Risk Language Engine (shape language)
   ↓
Audit Logging (append-only)
   ↓
Legal Classification (if needed)
   ↓
Authority Routing (if conditional/prohibited)
   ↓
Frontend Display / PDF Export
```

**Critical Rule:** Flow always ends in documentation or routing, never action.

### Forbidden Endpoints (Never Implement)

- `/execute`
- `/apply`
- `/tool`
- `/bypass`
- `/unlock`
- `/jailbreak`
- `/root`

These routes do not exist and should cause CI/build failures if referenced.

### Language Rules (Legal Armor)

#### Always Use
- Analyze
- Interpret
- Classify
- Route
- External authorization required
- Logged for compliance

#### Never Use
- Bypass
- Unlock
- Jailbreak
- Root
- Apply exploit
- Works on

Language is part of the security model.
