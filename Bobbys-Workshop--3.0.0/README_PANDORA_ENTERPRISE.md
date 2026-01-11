# Pandora Codex - Enterprise Device Operations Framework

**Modular device-ops framework for lawful repair, diagnostics, and auditable shop workflows.**

> **Prime Doctrine:** No fake outputs. No simulated success. If something can't be validated, return `manual_intervention_required` and record an audit.

![Enterprise Grade](https://img.shields.io/badge/grade-enterprise-blue)
![No Illusions](https://img.shields.io/badge/truth-evidence--based-green)
![Audit Ready](https://img.shields.io/badge/audit-compliant-brightgreen)

## What is Pandora Codex?

Pandora Codex is transforming device operations with:

### Core Components

- **BootForgeUSB** (Rust + Python) - Evidence-based USB device detection with confidence scores and proof
- **Bobby Vault** - Secure local tool storage with SHA-256 validation and audit logging
- **Policy Engine** - RBAC gates ensuring the right person performs the right action
- **Audit System** - Immutable evidence bundles for every operation
- **Tool Registry** - Public capabilities + private tool overlay
- **Job Orchestration** - Safe, repeatable, auditable operation execution

### Current Implementation: Real-Time Flash Monitor

The current system includes a sophisticated flash performance monitoring system with:

- ✅ **Real-time Performance Monitoring** - Live metrics during firmware operations
- ✅ **Bottleneck Detection** - AI-powered identification of performance issues
- ✅ **Industry Benchmarking** - Compare against USB-IF, JEDEC standards
- ✅ **Automated Testing** - Validation of all optimization improvements
- ✅ **WebUSB Device Detection** - Browser-based USB device monitoring
- ✅ **ADB/Fastboot Integration** - Android device detection and operations
- ✅ **Batch Flashing** - Multi-partition firmware deployment
- ✅ **Device Analytics** - Connection history and health tracking

### Architectural Upgrade In Progress

The Enterprise Blueprint adds:

- 🚧 **BootForgeUSB Rust Core** - Replace simulated detection with real evidence
- 🚧 **Evidence Bundles** - Signed artifacts with hashes
- 🚧 **Policy Gates** - Prevent unauthorized destructive operations
- 🚧 **Confidence Scores** - Never claim 100% certainty without proof
- 🚧 **Manual Intervention Protocol** - Honest failure modes
- 🚧 **Tool Health Dashboard** - Real status, not fake success

## Quick Start

### Prerequisites

- **Node.js 18+** and npm/pnpm
- **Rust toolchain** (for BootForgeUSB)
- **libusb** development libraries
- Optional: **ADB/Fastboot** for Android device operations

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd pandora-codex

# Install all dependencies (Node + Rust check)
make install

# Or use npm directly
npm install
```

### Development

```bash
# Start the development server
make dev
# or
npm run dev

# Check Bobby Dev Arsenal status
make arsenal:status
# or
npm run arsenal:status

# Build BootForgeUSB (Rust)
make bootforge:build

# Scan USB devices with BootForgeUSB
make scan:devices
```

Visit `http://localhost:5173` to see the application.

## Architecture

```
pandora-codex/
├── apps/                           # Applications
│   └── (future: pandora-ui, pandora-api, pandora-agent)
├── libs/
│   └── bootforgeusb/              # Rust USB detection library
│       ├── src/
│       │   ├── main.rs            # CLI
│       │   ├── lib.rs             # Public API + pyo3 bindings
│       │   ├── model.rs           # Type definitions
│       │   ├── usb_scan.rs        # USB enumeration
│       │   ├── classify.rs        # Classification engine
│       │   └── tools/confirmers.rs # Tool validators
│       └── Cargo.toml
├── packages/
│   └── pandora-core/              # Shared TypeScript types
│       ├── src/
│       │   ├── devices.ts         # Device records & evidence
│       │   ├── jobs.ts            # Job orchestration types
│       │   ├── policy.ts          # Policy engine
│       │   └── tools.ts           # Tool registry types
│       └── package.json
├── runtime/
│   ├── manifests/
│   │   ├── tools.json            # Public tool registry
│   │   ├── policies.json         # RBAC rules
│   │   └── workflows.json        # Job templates
│   └── reports/                  # Audit logs (gitignored)
├── .pandora_private/             # Bobby Vault (gitignored)
│   ├── tools/                    # User-supplied binaries
│   ├── manifests/
│   │   └── tools.local.json      # Local tool registry
│   ├── scripts/
│   │   └── run_local_tool.py     # Hash-validated runner
│   └── logs/                     # Execution audit logs
├── src/                          # Current React UI
├── docs/
│   ├── NO_ILLUSION_AUDIT.md      # Truth and evidence standards
│   ├── SHOP_PLAYBOOK.md          # Real-world repair workflows
│   └── ENTERPRISE_STANDARD.md    # (coming soon)
├── Makefile                      # Unified build commands
└── PANDORA_ENTERPRISE_BLUEPRINT.md
```

## Documentation

### Getting Started

- [README_PANDORA.md](./README_PANDORA.md) - Feature overview and current capabilities
- [BOBBY_DEV_ARSENAL.md](./BOBBY_DEV_ARSENAL.md) - Development environment setup

### Enterprise Architecture

- [PANDORA_ENTERPRISE_BLUEPRINT.md](./PANDORA_ENTERPRISE_BLUEPRINT.md) - Complete architecture and philosophy
- [docs/NO_ILLUSION_AUDIT.md](./docs/NO_ILLUSION_AUDIT.md) - Truth-based detection standards
- [docs/SHOP_PLAYBOOK.md](./docs/SHOP_PLAYBOOK.md) - Real-world repair shop workflows

### Component Documentation

- [libs/bootforgeusb/README.md](./libs/bootforgeusb/README.md) - Rust device detection library
- [.pandora_private/README.md](./.pandora_private/README.md) - Bobby Vault local tools guide

### Existing Features

- [ADB_FASTBOOT_DETECTION.md](./ADB_FASTBOOT_DETECTION.md) - Android device detection
- [FASTBOOT_FLASHING.md](./FASTBOOT_FLASHING.md) - Firmware operations
- [PERFORMANCE_BENCHMARKING.md](./PERFORMANCE_BENCHMARKING.md) - Industry standards
- [AUTOMATED_TESTING.md](./AUTOMATED_TESTING.md) - Test suite

## Key Concepts

### No Illusion Standard

Pandora Codex never claims what it can't prove:

```typescript
// ❌ BAD: Fake confidence
{ connected: true, mode: "fastboot", confidence: 1.0 }

// ✅ GOOD: Evidence-based truth
{
  device_uid: "usb:18d1:4ee7:bus3:addr5",
  mode: "android_adb_confirmed",
  confidence: 0.92,
  evidence: {
    usb: { vid: "18d1", pid: "4ee7", /* ... */ },
    tools: {
      adb: { present: true, seen: true, raw: "ABC123 device" }
    }
  },
  notes: ["Confirmed via adb devices output"]
}
```

### Evidence Bundles

Every action produces auditable evidence:

```
evidence_bundle_J-12345/
├── manifest.json (signed)
├── command_log.jsonl
├── stdout_tail.txt
├── stderr_tail.txt
├── artifacts/
│   ├── device_dossier.json
│   └── screenshots/
└── hashes.txt
```

### Policy Gates

Destructive operations require explicit authorization:

```typescript
Policy Evaluation:
{
  action: "flash_partition",
  user_role: "tech",
  risk_level: "destructive",
  result: "deny",
  reason: "Requires admin role and typed confirmation"
}
```

## Commands Reference

### Make Commands

```bash
make help              # Show all available commands
make install           # Install all dependencies
make build             # Build all components
make test              # Run all tests
make dev               # Start development server
make arsenal:status    # Check tool health
make bootforge:build   # Build BootForgeUSB (Rust)
make scan:devices      # Scan USB devices
make check:tools       # Verify installed tools
make docs              # List key documentation
make clean             # Clean build artifacts
```

### NPM Scripts

```bash
npm run dev                    # Start Vite dev server
npm run build                  # Build production bundle
npm run arsenal:status         # Full environment snapshot
npm run check:rust             # Verify Rust toolchain
npm run check:android-tools    # Verify ADB/Fastboot
npm run server:start           # Start backend API
```

### BootForgeUSB CLI

```bash
# After building with `make bootforge:build`
./libs/bootforgeusb/target/release/bootforgeusb scan
./libs/bootforgeusb/target/release/bootforgeusb scan --json | jq
./libs/bootforgeusb/target/release/bootforgeusb version
```

### Bobby Vault

```bash
# Run local tool with hash validation
python3 .pandora_private/scripts/run_local_tool.py <tool_id> [args...]

# Example
python3 .pandora_private/scripts/run_local_tool.py heimdall flash --pit device.pit
```

## Roadmap

### Phase 0 - Foundations (In Progress)

- [x] Enterprise architecture documentation
- [x] BootForgeUSB Rust library structure
- [x] Pandora Core TypeScript schemas
- [x] Tool registry and policy manifests
- [x] Bobby Vault runner with SHA-256 validation
- [x] No-Illusion audit documentation
- [ ] BootForgeUSB Rust implementation complete
- [ ] Python binding (pyo3)
- [ ] Integration with existing UI

### Phase 1 - MVP

- [ ] Device Dossier UI with confidence display
- [ ] Tool Health Monitor dashboard
- [ ] Job Queue implementation
- [ ] Evidence bundle export
- [ ] Policy gate enforcement
- [ ] Replace simulated detection with BootForgeUSB

### Phase 2 - Pro

- [ ] Device profiles per brand/chipset
- [ ] Workflow automation for safe operations
- [ ] Team-based RBAC
- [ ] Historical analytics
- [ ] Signed evidence bundles

### Phase 3 - Enterprise

- [ ] Full policy engine with custom rules
- [ ] Signed plugin system
- [ ] Audit retention and export
- [ ] Compliance dashboard
- [ ] Multi-device orchestration

## Contributing

Pandora Codex follows the **No Illusion** standard. All contributions must:

1. ✅ Never fake detection or success
2. ✅ Include confidence scores when uncertain
3. ✅ Provide evidence for all claims
4. ✅ Create audit logs for actions
5. ✅ Follow RBAC and policy gates
6. ✅ Use conservative language ("likely" vs "confirmed")

See [PANDORA_ENTERPRISE_BLUEPRINT.md](./PANDORA_ENTERPRISE_BLUEPRINT.md) for architecture guidelines.

## Security

### What This Is

- ✅ Lawful device repair and diagnostics framework
- ✅ Audit-compliant evidence collection
- ✅ Safety gates for destructive operations
- ✅ Customer authorization workflow

### What This Is NOT

- ❌ Bypassing security without authorization
- ❌ FRP/iCloud removal without proof of ownership
- ❌ Theft or fraud enablement
- ❌ Hidden or stealth operations

**Use responsibly. Follow local laws. Verify ownership.**

## License

MIT License - See [LICENSE](./LICENSE) file for details.

The Spark Template files and resources from GitHub are licensed under the MIT license, Copyright GitHub, Inc.

## Support

- **Technical Issues:** Check documentation in `/docs`
- **Bug Reports:** File GitHub issues
- **Feature Requests:** Open discussions
- **Commercial Support:** Contact Pandora Codex Enterprise

---

**Part of the Bobby Dev Arsenal. Built for truth. Designed for transparency. Engineered for evidence.**

_Enterprise-grade device operations with zero illusions._
