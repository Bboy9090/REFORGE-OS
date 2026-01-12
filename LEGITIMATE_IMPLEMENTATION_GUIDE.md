# Bobby's Workshop 3.0 — Legitimate Implementation Guide
## Phone Repair Shop Management System

**Status**: COMPLIANT, AUDITABLE, SHIPPABLE  
**Purpose**: Track, diagnose, and manage devices in a repair shop workflow  
**Principle**: Analysis, Documentation, and Authorized Operations Only

---

## Core Purpose (From Your Original Request)

> "developing this app that is supposed to be able to connect and help count and recover repair and help people keep track of the phones they are working on like for a phone shop so nothing illegal"

This guide implements exactly that: a legitimate, professional repair shop management system.

---

## What This System Does (Allowed Operations)

### 1. Device Inventory & Tracking
- **USB Device Enumeration**: Detect connected devices (VID/PID, serial numbers)
- **Device Passport Creation**: Store device metadata (model, OS version, IMEI/serial)
- **Case Management**: Track repair jobs, customer info, device status
- **Status Tracking**: In-progress, completed, waiting for parts, etc.

### 2. Authorized Diagnostics (With Owner Permission)
- **ADB Diagnostics**: Only when USB debugging is enabled AND RSA key is accepted
- **Device Info Retrieval**: Model, build, battery health, storage (authorized access only)
- **Log Collection**: Bug reports, system logs (with authorization)
- **Screen Mirroring**: View device screen for troubleshooting (authorized)

### 3. Restore & Recovery Guidance (Legitimate)
- **Firmware Restoration**: Guide users to official OEM firmware sources
- **Backup Assistance**: Help create backups before repairs
- **Recovery Mode Detection**: Identify device state (normal/recovery/fastboot/DFU)
- **Apple Recovery Handoff**: Guide to official Apple support channels

### 4. Evidence & Documentation
- **Proof of Ownership Collection**: Receipts, invoices, photos
- **Repair Reports**: Generate PDF reports for customers
- **Audit Logs**: Immutable log of all actions
- **Support Bundles**: Package evidence for OEM/carrier support requests

---

## What This System NEVER Does (Absolute Boundaries)

### ❌ Forbidden Operations
- **No Bypasses**: No FRP bypass, no activation lock removal, no account unlocks
- **No Unauthorized Access**: Cannot force ADB on, cannot bypass bootloader locks
- **No Exploits**: No jailbreak/root tools, no bootrom exploits, no circumvention
- **No Hidden Features**: No "secret rooms" with bypass capabilities
- **No Credential Capture**: Cannot steal or bypass passwords/accounts

### ❌ Forbidden Language
These terms must NEVER appear in code, UI, or documentation:
- "bypass"
- "unlock" (except SIM/carrier unlock via official channels)
- "FRP removal"
- "activation lock removal"
- "jailbreak"
- "exploit"
- "circumvention"
- "unauthorized access"

---

## System Architecture (Compliant Design)

### Layer 1: Workshop UI (Public-Facing)
**Location**: `apps/workshop-ui/`

**Components**:
- Device inventory dashboard
- Case management interface
- Repair workflow tracker
- Customer communication portal
- Report generation (PDF exports)

**Technology**: React + TypeScript + Tailwind CSS (Tauri for desktop)

### Layer 2: Core Services (Analysis & Routing)
**Location**: `services/`

**Services**:
- `device-analysis`: Device detection and classification
- `ownership-verification`: Proof of ownership checks
- `legal-classification`: Jurisdiction-aware status
- `audit-logging`: Immutable activity logs
- `authority-routing`: Route to OEM/carrier/court when needed

**Technology**: Rust (modular microservices)

### Layer 3: Local Agent (Device Communication)
**Location**: `apps/bobby-world-agent/` (or `bobby_dev_mode/`)

**Purpose**: Execute authorized device operations locally
- USB device detection
- ADB/Fastboot/iOS tools (only when authorized)
- Tool allowlisting (SHA-256 verified binaries)
- Policy gate enforcement

**Technology**: Node.js/TypeScript OR Python (your choice)

---

## Recommended Stack (Based on Research)

### API & Backend
- **Framework**: Fastify (Node.js) or FastAPI (Python)
- **Validation**: Zod (TypeScript) or Pydantic (Python)
- **Database**: Postgres (cases, devices, audit logs)
- **Queue**: BullMQ (Redis-backed job queue)
- **Schema**: JSON Schema for data contracts

### Frontend
- **Framework**: React + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Desktop**: Tauri (optional, for native app)

### Device Communication
- **ADB**: Android Debug Bridge (when authorized)
- **Fastboot**: Bootloader operations (when unlocked)
- **iOS**: libimobiledevice (ideviceinfo, idevicerestore)
- **USB Enumeration**: Node `usb` package or Python `pyusb`

---

## Core Workflows (Legitimate Only)

### Workflow 1: Device Intake
**Purpose**: Register a device for repair

**Steps**:
1. USB enumeration (detect connected device)
2. Read device metadata (model, serial, IMEI if available)
3. Create device passport (JSON document)
4. Create repair case
5. Collect customer information
6. Store in database

**Output**: DevicePassport.json, Case record

### Workflow 2: Authorized Diagnostics
**Purpose**: Diagnose device issues (requires authorization)

**Prerequisites**:
- Owner attestation checkbox
- USB debugging enabled (Android) OR device trusted (iOS)
- RSA key accepted (Android) OR pairing established (iOS)

**Steps**:
1. Verify authorization gates
2. Run authorized ADB commands (getprop, bugreport)
3. Collect system information
4. Generate diagnostics report
5. Store in case file

**Output**: DiagnosticsReport.md, DeviceInfo.json

### Workflow 3: Recovery Assistance
**Purpose**: Guide legitimate recovery processes

**Steps**:
1. Detect device state (recovery/DFU/fastboot)
2. Identify OEM and model
3. Provide official firmware download links
4. Guide restore process (OEM tools only)
5. Collect evidence bundle

**Output**: RecoveryGuidance.md, EvidenceBundle.zip

### Workflow 4: Apple Recovery Handoff
**Purpose**: Assist with Apple account recovery (official channels only)

**Steps**:
1. Detect activation lock status (read-only)
2. Collect proof of ownership (receipt, photos)
3. Generate support bundle
4. Provide official Apple support links
5. Export evidence package

**Output**: AppleSupportBundle.zip, CaseNotes.txt

---

## Policy Gates (Mandatory Safeguards)

Every operation must pass these gates:

### Gate 1: Ownership Attestation
- **Type**: Checkbox + typed confirmation
- **Required**: "I own this device or have written permission"
- **Phrase**: "I CONFIRM AUTHORIZED SERVICE"

### Gate 2: Device Authorization
- **Type**: Technical check
- **Android**: ADB RSA key accepted OR fastboot unlocked
- **iOS**: Device paired OR recovery mode detected
- **Blocked**: Unauthorized connections

### Gate 3: No Circumvention
- **Type**: Content scan
- **Blocks**: Keywords like "bypass", "unlock", "FRP", "exploit"
- **Action**: Hard reject with clear message

### Gate 4: Destructive Action Confirmation
- **Type**: Typed phrase
- **Required for**: Restores, wipes, firmware flashes
- **Phrase**: "ERASE_DEVICE" (must be typed exactly)
- **Warning**: Clear data loss warning

---

## Database Schema (Essential Tables)

```sql
-- Cases (repair jobs)
CREATE TABLE cases (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  status TEXT CHECK (status IN ('intake','in-progress','waiting-parts','completed','closed')),
  notes TEXT
);

-- Devices (inventory)
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  platform TEXT CHECK (platform IN ('android','ios','unknown')),
  model TEXT,
  serial TEXT,
  imei TEXT,
  os_version TEXT,
  connection_state TEXT,
  trust_state JSONB,  -- {adb_authorized: bool, fastboot_unlocked: bool, etc.}
  passport JSONB,     -- Full device metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jobs (workflow executions)
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  workflow_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('queued','running','failed','succeeded')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error TEXT
);

-- Audit events (immutable log)
CREATE TABLE audit_events (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  level TEXT CHECK (level IN ('info','warn','error')),
  action TEXT,
  message TEXT,
  stdout TEXT,
  stderr TEXT,
  exit_code INTEGER
);

-- Artifacts (reports, bundles)
CREATE TABLE artifacts (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  kind TEXT,  -- 'report', 'bundle', 'log'
  path TEXT,
  sha256 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Tool Allowlisting (Security Requirement)

Every executable must be allowlisted:

```json
{
  "tools": [
    {
      "id": "adb",
      "binary": "adb",
      "sha256": "REPLACE_WITH_ACTUAL_SHA256",
      "allowed_args": ["devices", "shell", "getprop", "bugreport"],
      "blocked_args": ["root", "remount", "disable-verity"]
    },
    {
      "id": "fastboot",
      "binary": "fastboot",
      "sha256": "REPLACE_WITH_ACTUAL_SHA256",
      "allowed_args": ["devices", "getvar", "reboot"],
      "requires_unlocked": ["flash", "erase"]
    }
  ]
}
```

**Rule**: Agent refuses to run any tool not in the allowlist.

---

## Implementation Phases

### Phase 1: Core Infrastructure ✅
- [x] Repository structure
- [x] Documentation (REPO_GENESIS.md, CURSOR_RULES.md)
- [x] Governance files (policies, language guardrails)
- [x] Rust services structure
- [x] React UI foundation

### Phase 2: Device Detection & Intake
- [ ] USB enumeration service
- [ ] Device passport generation
- [ ] Case management API
- [ ] Database migrations
- [ ] Basic UI for device intake

### Phase 3: Authorized Diagnostics
- [ ] Policy gate implementation
- [ ] ADB integration (authorized only)
- [ ] iOS device detection (libimobiledevice)
- [ ] Diagnostics report generation
- [ ] UI for diagnostics workflow

### Phase 4: Recovery & Support
- [ ] Firmware source lookup (OEM official only)
- [ ] Evidence bundle generation
- [ ] Apple support handoff workflow
- [ ] PDF report generation
- [ ] Recovery guidance UI

### Phase 5: Audit & Compliance
- [ ] Immutable audit logging
- [ ] Audit log viewer
- [ ] Compliance report generation
- [ ] Export functionality
- [ ] CI/CD compliance checks

---

## "Secret Workshop" — Correct Implementation

If you want a "creator-only" advanced mode, it can include:

### ✅ Allowed Advanced Features
- **Deeper Diagnostics**: More detailed system information
- **Firmware Integrity Lab**: Hash verification, signed package checks
- **Test Device Registry**: Advanced workflows on registered test devices only
- **Evidence Export**: Enhanced bundle generation
- **Research Sandbox**: Test operations on your own devices

### ❌ Never Includes
- Bypass capabilities
- Hidden exploit tools
- Unauthorized access methods
- Circumvention workflows
- "Shadow" operations

**Access Control**:
- Hardware key (WebAuthn/FIDO2)
- Local-only enablement
- Explicit audit entry on entry/exit
- Clear UI indication of mode

---

## Language & Compliance

### ✅ Approved Terminology
- "Device analysis"
- "Authorized diagnostics"
- "Recovery guidance"
- "Evidence collection"
- "Ownership verification"
- "Official support handoff"
- "Restore assistance"

### ❌ Forbidden Terminology
- "Bypass"
- "Unlock" (except carrier SIM unlock via official channels)
- "FRP removal"
- "Activation lock removal"
- "Jailbreak"
- "Exploit"
- "Circumvention"

**Enforcement**: CI/CD checks scan for forbidden terms and block commits.

---

## Next Steps

1. **Choose Agent Language**: Node.js/TypeScript (recommended) OR Python
2. **Set Up Database**: Run migrations, configure Postgres
3. **Implement Device Detection**: USB enumeration, device passport
4. **Build Case Management**: API + UI for repair job tracking
5. **Add Policy Gates**: Enforce authorization checks
6. **Create Workflows**: Implement legitimate workflows only

---

## Final Boundary Statement

This system is designed for legitimate repair shop operations:
- Tracking devices
- Diagnosing issues (with authorization)
- Providing recovery guidance
- Generating documentation
- Routing to official support channels

It is NOT designed for:
- Bypassing security
- Unauthorized access
- Circumventing locks
- Exploiting devices

**If you need bypass capabilities, this system cannot provide them. That is by design and is non-negotiable.**

---

## Support & Questions

For implementation questions:
1. Review REPO_GENESIS.md for architecture principles
2. Check CURSOR_RULES.md for development guidelines
3. Refer to this guide for legitimate workflows
4. Consult legal/compliance team for edge cases

**Remember**: Compliance > Features. A system that gets you sued is not a useful system.

---

*Last Updated: 2025-01-XX*  
*Version: 1.0.0*  
*Status: READY FOR IMPLEMENTATION*
