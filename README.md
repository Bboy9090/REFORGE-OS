# REFORGE OS

## Professional Repair, Diagnostics, and System Recovery Platform

**Version:** 3.0.0 Final Form  
**Status:** Production Ready

---

## Overview

REFORGE OS is a clean, enterprise-ready platform for diagnosing, recovering, and reviving systems across computers and devices. It is designed for repair shops, IT teams, and enterprises that need reliable, auditable workflows.

### Three-Layer Architecture

```
Layer 1: Bobby's Workshop (Public UI)
├── Technology: Tauri + React + TypeScript
├── Theme: Professional Dark + Metallic Gold/Bronze
└── Pages: 25+ professionally-styled pages

Layer 2: ForgeWorks Core (Compliance Spine)
├── Technology: FastAPI + Rust Services
├── Features: Device Analysis, Ownership, Legal Classification
└── API: Complete REST API

Layer 3: Pandora Codex (Internal Vault)
├── Technology: Markdown + TypeScript Risk Models
├── Access: CI-gated, never ships publicly
└── Purpose: Risk modeling and language framing
```

---

## Capabilities

- **System diagnostics** (Windows, macOS, Linux)
- **Android & iOS device state detection**
- **Boot repair and OS recovery**
- **OS installation and reinstallation**
- **Evidence and report generation**
- **Case and device tracking**
- **Immutable audit logging**
- **Bulk deployment and licensing**

---

## Key Features

### Device Analysis
- Read-only device state analysis
- Ownership confidence scoring
- Security state classification

### Compliance Reporting
- Complete compliance summaries
- PDF export with branding
- Audit trail verification

### Legal Classification
- Jurisdiction-aware status
- Risk level assessment
- Authority routing guidance

### Custodian Vault (Gated)
- Interpretive review mode
- Ownership confidence ≥ 85% required
- Analysis-only, no instructions

---

## Quick Start

### Development Mode

```bash
# Frontend (Tauri + React)
cd apps/workshop-ui
pnpm install
pnpm run dev

# Backend API (FastAPI)
cd api
python forgeworks_api.py
```

### Production Build

```bash
cd apps/workshop-ui
pnpm run build
```

---

## Supported Platforms

- **Windows PCs** - Full support
- **macOS** (Intel & Apple Silicon) - Full support
- **Linux workstations** - Full support
- **Android devices** (ADB/Fastboot) - Device analysis
- **iOS devices** - State detection

---

## Design Principles

- **Compliance-first** - All operations are legal and auditable
- **Fully auditable** - Complete audit trail of all activities
- **Analysis over automation** - Analyzes and routes, doesn't execute
- **Professional workflows** - Built for repair shop operations
- **Ownership respecting** - Verifies ownership before operations

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + TypeScript + Tailwind CSS |
| Desktop | Tauri (Rust + Web) |
| Backend | FastAPI (Python) |
| Services | Rust microservices |
| Database | SQLite (MVP), PostgreSQL (Production) |
| Theme | Professional Dark + Metallic Gold/Bronze |

---

## Project Structure

```
REFORGE-OS/
├── apps/
│   └── workshop-ui/          # Tauri/React frontend
│       ├── src/              # React components (25+ pages)
│       ├── src-tauri/        # Rust backend
│       └── assets/           # Icons, images
│
├── services/                  # Rust microservices
│   ├── device-analysis/
│   ├── ownership-verification/
│   ├── legal-classification/
│   └── audit-logging/
│
├── api/                       # FastAPI backend
│   ├── main.py               # Main API server
│   └── forgeworks_api.py     # ForgeWorks Core API
│
├── solutions/                # Solutions database
├── internal/                 # Internal R&D (Pandora Codex)
├── docs/                     # Documentation
└── workflows/                # Workflow definitions
```

---

## Architecture Flow

```
User Action (Frontend)
   ↓
API Client (HTTP)
   ↓
ForgeWorks API (FastAPI)
   ↓
Rust Services
   ↓
Python Worker (optional)
   ↓
Response → Frontend Display
```

---

## Compliance Posture

### Allowed Operations
- Analysis
- Classification
- Routing guidance
- Documentation

### Never Performed
- Execution
- Bypass instructions
- Tool automation
- Circumvention guidance

---

## Core Stack

```
REFORGE OS
    ↓
Phoenix Core
    ↓
libbootforge
    ↓
BootForge USB
    ↓
Hardware
```

### Components

- **BootForge USB** — Rust hardware & boot engine
- **libbootforge** — Cross-platform abstraction bridge
- **Phoenix Core** — State, policy, and Phoenix Key intelligence
- **Phoenix Key** — Physical recovery USB

---

## Phoenix Key

**Portable System Recovery & Revival USB**

Phoenix Key is a physical recovery USB that can be inserted into a computer or laptop at any system state to diagnose, recover, revive, or reinstall operating systems.

### Capabilities
- Independent boot into recovery environments
- System state detection and snapshotting
- Boot repair and revival
- OS installation/reinstallation

---

## Contributing

This is a professional repair platform. Contributions should maintain:

1. Compliance-first design
2. Non-invasive analysis approach
3. Professional UI/UX standards
4. Complete audit trail integration

---

## License

See LICENSE file for details.

---

*REFORGE OS 3.0.0 Final Form - The Legendary Professional Repair Platform*
