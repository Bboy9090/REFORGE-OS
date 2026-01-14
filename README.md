# REFORGE OS v3.0.0

> **Professional Device Repair & Analysis Platform**  
> Compliance-First • Analysis-Only • Production-Ready

[![Release](https://img.shields.io/badge/release-v3.0.0-blue)](https://github.com/Bboy9090/REFORGE-OS/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)]()

---

## 🎯 Overview

REFORGE OS is a unified platform integrating **Bobby's Workshop** (public-facing), **ForgeWorks** (compliance-first analysis core), and **Pandora Codex** (internal R&D vault). Built with governance-first principles, it provides device analysis, classification, and routing without execution or bypass capabilities.

### Three-Layer Architecture

1. **Bobby's Workshop** (Public UI)
   - Tauri/React/TypeScript frontend
   - User education and certification
   - Transparent, trust-building interface
   - 29 fully-themed pages

2. **ForgeWorks Core** (Compliance Spine)
   - Rust/FastAPI backend services
   - Device status evaluation
   - Ownership verification
   - Jurisdiction-aware legal classification
   - Immutable audit logging

3. **Pandora Codex** (Internal R&D)
   - Risk modeling and classification logic
   - Historical exploit understanding
   - NEVER exposed to public UI
   - Used only for risk assessment

---

## ✨ Features

### 🔐 Trapdoor API (Admin/Secret Room)
- 8 secure endpoints for privileged operations
- AES-256-GCM encrypted shadow logging
- Tamper detection via SHA-256 hashing
- API key authentication
- 90-day log retention

### 📚 Custodial Closet Solutions Database
- **18 comprehensive solutions** across all device types
- Linux, Windows, Mac, Android, iOS coverage
- Searchable, filterable database
- Step-by-step repair guides (analysis-only)

### 🎨 REFORGE Professional Theme
- Consistent theming across all 29 pages
- Steel blue accents on dark blue-grey surfaces
- Metallic gold highlights for premium feel
- Centralized CSS variable system

### 🔧 API Client
- Retry logic with exponential backoff
- Comprehensive error handling
- Full Trapdoor API integration
- Custodial Closet API integration

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ (for frontend)
- **Rust** stable (for Tauri backend)
- **Python** 3.10+ (for FastAPI backend)
- **Windows** 10+ (current build target)

### Installation

```powershell
# Clone repository
git clone https://github.com/Bboy9090/REFORGE-OS.git
cd REFORGE-OS

# Install frontend dependencies
cd apps/workshop-ui
npm install

# Build application
npm run build

# Run backend API (separate terminal)
cd ../../api
pip install -r requirements.txt
python main.py
```

### Development

```powershell
# Frontend development
cd apps/workshop-ui
npm run tauri dev

# Backend API
cd api
uvicorn main:app --reload --port 8001
```

---

## 📦 Production Build

```powershell
cd apps/workshop-ui
npm run build

# Executable location:
# src-tauri/target/release/workshop-ui.exe
```

### Create Desktop Shortcut

```powershell
.\create-shortcuts.ps1
```

---

## 🏗️ Architecture

### Backend Services

- **FastAPI Server** (`api/main.py`): Main API on port 8001
- **Trapdoor API** (`api/trapdoor_api.py`): Admin endpoints
- **Solutions Database** (`solutions/database.py`): JSON-based storage
- **Audit Logging**: Immutable, hash-chained activity trail

### Frontend Structure

- **React/TypeScript**: UI components
- **Tauri**: Desktop framework
- **Tailwind CSS**: Styling
- **REFORGE Theme**: Custom CSS variables

### Rust Services

- `device-analysis`: Capability classification
- `ownership-verification`: Confidence-based attestation
- `legal-classification`: Jurisdiction-aware labeling
- `audit-logging`: Immutable activity trail
- `authority-routing`: OEM/carrier/court pathways
- `capability-awareness`: Risk profiling
- `risk-language-engine`: UI language shaping

---

## 🔒 Security

- **API Key Authentication**: Trapdoor endpoints require X-API-Key header
- **Encrypted Shadow Logs**: AES-256-GCM encryption
- **Tamper Detection**: SHA-256 log integrity verification
- **Authorization Checks**: Required for high-risk workflows
- **Compliance-First**: Analysis-only, no execution endpoints

---

## 📖 Documentation

- [Architecture Overview](docs/UNIFIED_ARCHITECTURE.md)
- [Integration Plan](docs/MASTER_INTEGRATION_PLAN.md)
- [Backend Implementation](docs/BACKEND_IMPLEMENTATION_COMPLETE.md)
- [Release Notes](RELEASE_NOTES_v3.0.0.md)
- [Changelog](CHANGELOG.md)

---

## 🛠️ Development

### Project Structure

```
REFORGE-OS/
├── apps/
│   └── workshop-ui/          # Tauri/React frontend
├── services/                 # Rust microservices
├── api/                      # FastAPI backend
├── solutions/                # Solutions database
├── internal/                 # Pandora Codex (R&D)
├── docs/                     # Documentation
└── storage/                  # Data storage
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:
- [Tauri](https://tauri.app/) - Cross-platform desktop framework
- [React](https://react.dev/) - UI library
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [Rust](https://www.rust-lang.org/) - Systems programming language

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Bboy9090/REFORGE-OS/issues)
- **Releases**: [GitHub Releases](https://github.com/Bboy9090/REFORGE-OS/releases)

---

**Version**: 3.0.0  
**Status**: Production Ready ✅  
**Release Date**: January 2025

---

*Platform, Not Product.*
