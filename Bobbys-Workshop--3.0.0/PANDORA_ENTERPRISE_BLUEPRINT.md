# Pandora Codex — Enterprise Ultra Blueprint

## Mission Statement

Modular device-ops framework for lawful repair, diagnostics, and auditable shop workflows with a single truth: no fake success. If something can't be validated, return `manual_intervention_required` and record an audit.

## Prime Doctrine (non-negotiable)

1. **No fake outputs. No "simulated success".**
2. **All destructive actions require explicit typed confirmation, RBAC, and policy gates.**
3. **All runs must create structured audit logs** (command, args, stdout/stderr, exit codes, timestamp).
4. **Private tools must be local, allowlisted by SHA-256, and not auto-downloaded or persistent.**

## Enterprise Pillars

### P0: Truth

If it can't be verified, it can't be claimed. Every action produces evidence.

### P1: Safety

Destructive actions require: policy + role + confirmation + device state validation.

### P2: Audit

Every run creates an immutable record: who, what, when, why, result, artifacts, hashes.

### P3: Portability

Works on Windows/macOS/Linux. Offline-first for shops.

### P4: Extensibility

Plugins + capability registry. No monolith.

### P5: Compliance

Separation of public repo vs local vault. Strong language and guardrails.

## Architecture Components

### 1. Pandora UI (Desktop/Web)

- React + TypeScript
- Role-aware UI
- Offline queue
- Device dossiers
- Real-time monitoring

### 2. Pandora API (Core Services)

- Auth / RBAC
- Job orchestration
- Policy evaluation
- Artifact registry
- Device state management

### 3. Pandora Agent (Local Executor)

- Runs tools locally
- Device discovery
- Evidence capture
- Produces signed logs
- Tool health monitoring

### 4. BootForgeUSB (Rust Core + Python Binding)

- USB device enumeration with rusb/libusb
- Classification engine with confidence scores
- Tool confirmers (adb/fastboot/idevice_id)
- Evidence-based detection
- No claims beyond proven facts

### 5. Bobby Vault (Local Only)

- User-supplied tools (.pandora_private/)
- Hash allowlist
- Signed manifests
- No stealth, no background operations

## Repository Structure

```
pandora-codex/
├── apps/
│   ├── pandora-ui/                  # React/Tauri UI
│   ├── pandora-api/                 # FastAPI or Express
│   └── pandora-agent/               # Python agent
├── packages/
│   ├── pandora-core/                # Shared types, schemas
│   ├── pandora-plugin-sdk/          # Plugin API
│   ├── pandora-evidence/            # Signing + hashing
│   └── pandora-policy/              # Policy engine
├── libs/
│   └── bootforgeusb/                # Rust library + CLI
│       ├── Cargo.toml
│       ├── src/
│       │   ├── main.rs             # CLI wrapper
│       │   ├── lib.rs              # Public API + pyo3
│       │   ├── model.rs            # Types
│       │   ├── usb_scan.rs         # USB enumeration
│       │   ├── classify.rs         # Classification rules
│       │   └── tools/
│       │       ├── confirmers.rs   # Tool validators
│       │       ├── adb.rs
│       │       ├── fastboot.rs
│       │       └── ios.rs
│       └── README.md
├── runtime/
│   ├── manifests/
│   │   ├── tools.json              # Public capabilities
│   │   ├── workflows.json          # Job templates
│   │   ├── policies.json           # RBAC rules
│   │   └── device_profiles.json    # Vendor/model profiles
│   └── reports/                    # Audit logs
├── .pandora_private/               # Gitignored Bobby Vault
│   ├── tools/
│   ├── manifests/
│   │   └── tools.local.json        # Local tool registry
│   ├── scripts/
│   │   └── run_local_tool.py       # Hash-validated runner
│   └── logs/
├── scripts/
│   ├── arsenal-status.sh
│   ├── bootforge_bridge.py
│   └── check-*.js
├── docs/
│   ├── ENTERPRISE_STANDARD.md
│   ├── NO_ILLUSION_AUDIT.md
│   ├── SECURITY_MODEL.md
│   └── SHOP_PLAYBOOK.md
├── Makefile
└── VERSION
```

## Device Source of Truth Contract

BootForgeUSB provides this contract:

```json
{
  "device_uid": "usb:05ac:12a8:bus3:addr12",
  "platform_hint": "ios",
  "mode": "ios_dfu_likely",
  "confidence": 0.86,
  "evidence": {
    "usb": {
      "vid": "05ac",
      "pid": "12a8",
      "manufacturer": "Apple",
      "product": null,
      "serial": null,
      "bus": 3,
      "address": 12
    },
    "tools": {
      "adb": { "present": true, "seen": false, "raw": "" },
      "fastboot": { "present": true, "seen": false, "raw": "" },
      "idevice_id": { "present": false, "seen": false, "raw": "missing" }
    }
  },
  "notes": [
    "USB signature matches Apple DFU class pattern; confirm visually in Device Manager/System Information."
  ]
}
```

**Key principle: Never claims more than it can prove.**

## Policy Engine

### Policy Inputs

- User role (tech/admin/owner)
- Action risk level (low/medium/high/destructive)
- Device state (adb/fastboot/dfu/unknown)
- Evidence available (tool present, checksum present)
- Ticket/authorization attached

### Policy Outcomes

- `allow`
- `deny` with reason
- `allow_with_requirements`:
  - Typed confirmation
  - Supervisor approval
  - Additional evidence

## Evidence System

Every action produces an **Evidence Bundle**:

```
evidence_bundle_J-12345/
├── manifest.json
├── command_log.jsonl
├── stdout_tail.txt
├── stderr_tail.txt
├── artifacts/
│   ├── device_dossier.json
│   ├── screenshots/
│   └── reports/
└── hashes.txt
```

**Enterprise upgrade:**

- Sign the manifest (public key verification)
- Store hashes of artifacts
- Prevents tampering and disputes

## Job Orchestration Rules

- Deterministic
- Idempotent when possible
- Retries only for safe operations (detection, reads)
- Destructive ops never "auto retry" without user re-approval
- Concurrency limits (don't brick USB buses)
- Per-device locks (no two jobs hitting same device)

## Tool Health Dashboard

Shows:

- Tool installed? version? path?
- Last time it succeeded
- OS permission readiness (Windows driver state, udev rules on Linux)
- "Why this action is blocked" messages

Prevents 80% of "why didn't it work?" questions.

## Security Model

- No hidden persistence
- No stealth execution
- All local tools are opt-in and audited
- RBAC enforced before destructive ops
- Consent logging for customer devices

## Implementation Phases

### Phase 0 — Foundations (must)

- [ ] BootForgeUSB Rust core + Python binding
- [ ] Shared schemas (pandora-core)
- [ ] Tool registry (public + private overlay)
- [ ] Evidence bundle + hashing
- [ ] Smoke test workflows
- [ ] No-Illusion enforcement

### Phase 1 — MVP (ship)

- [ ] Device Dossier UI
- [ ] Tool Health Monitor
- [ ] Job Queue
- [ ] Reports export
- [ ] Basic policy gates

### Phase 2 — Pro

- [ ] Profiles per brand/chipset
- [ ] Automation for safe steps
- [ ] Team workflows
- [ ] Historical analytics

### Phase 3 — Enterprise

- [ ] Full policy engine + RBAC
- [ ] Signed plugins
- [ ] Signed evidence bundles
- [ ] Audit retention + export
- [ ] Compliance dashboard

## Current Status

**Existing Real-Time Flash Monitor:**

- ✅ WebUSB detection
- ✅ ADB/Fastboot detection (via backend API)
- ✅ Performance benchmarking
- ✅ Flash operations
- ✅ Automated testing
- ⚠️ Detection may include simulated data
- ⚠️ No evidence-based truth system
- ⚠️ No policy gates
- ⚠️ No audit logs

**Next Steps:**

1. Implement BootForgeUSB for real device detection
2. Add evidence bundles and audit logging
3. Implement policy engine
4. Add Bobby Vault for private tools
5. Create Device Dossier UI with confidence levels
6. Add job orchestration with safety gates

## Commands (Post-Implementation)

```bash
# BootForgeUSB
bootforgeusb scan --json
python3 -c "import bootforgeusb; print(bootforgeusb.scan())"

# Pandora Agent
pandora-agent detect
pandora-agent job run flash-recovery --device <uid>
pandora-agent vault list
pandora-agent audit export

# Development
make py-install
make py-lint
make py-test
npm run dev:pandora
npm run dev:pandora:api
npm run arsenal:status
```

---

**Built for Bobby Dev Arsenal. Enterprise-grade device operations with zero illusions.**
