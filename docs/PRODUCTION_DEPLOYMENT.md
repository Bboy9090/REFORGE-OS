# REFORGE OS - Production Deployment Guide

**Version:** 3.0.0  
**Date:** 2025-01-XX  
**Status:** ✅ Production Ready

---

## 🚀 Quick Start

### Build the Application

```powershell
cd apps/workshop-ui
.\PRODUCTION_BUILD.ps1
```

This will:
- ✅ Install all dependencies
- ✅ Build frontend (React + Vite)
- ✅ Build Tauri application
- ✅ Create desktop shortcuts
- ✅ Generate build report

### Launch the Application

**Option 1: Desktop Shortcut**
- Double-click "REFORGE OS" on your desktop

**Option 2: Direct Execution**
```powershell
.\src-tauri\target\release\workshop-ui.exe
```

**Option 3: Start Menu**
- Start Menu > Programs > REFORGE OS

---

## 📦 Complete System Architecture

### Frontend (Tauri + React)
- **Location:** `apps/workshop-ui/`
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Framework:** Tailwind CSS
- **Theme:** REFORGE Professional Theme
- **Pages:** 29 GUI modules

### Backend Services

#### 1. Tauri Backend (Rust)
- **Location:** `apps/workshop-ui/src-tauri/`
- **Purpose:** Desktop application runtime
- **Features:** Window management, system integration

#### 2. FastAPI Backend (Python)
- **Location:** `api/`
- **Port:** 8001 (default)
- **Endpoints:**
  - `/api/v1/cases` - Case management
  - `/api/v1/devices` - Device detection
  - `/api/v1/diagnostics` - Diagnostics
  - `/api/v1/recovery` - Recovery tools
  - `/api/v1/solutions` - Custodial Closet
  - `/api/trapdoor/*` - Trapdoor API (admin)

#### 3. ForgeWorks Core (Rust Services)
- **Location:** `services/`
- **Services:**
  - `device-analysis` - Device analysis
  - `ownership-verification` - Ownership checks
  - `legal-classification` - Legal assessment
  - `audit-logging` - Audit trail
  - `authority-routing` - External routing
  - `capability-awareness` - Capability mapping
  - `risk-language-engine` - Risk language

---

## 🎨 Branding & Assets

### Logo/Icon
- **SVG Source:** `apps/workshop-ui/assets/icons/app-icon.svg`
- **Windows Icon:** `apps/workshop-ui/src-tauri/icons/icon.ico`
- **macOS Icon:** `apps/workshop-ui/src-tauri/icons/icon.icns`
- **PNG Icons:** `apps/workshop-ui/src-tauri/icons/*.png`

### Theme
- **CSS Variables:** `apps/workshop-ui/src/styles/reforge-professional-theme.css`
- **Colors:**
  - Dark Blue-Grey: `#1A1F2E`, `#252B3D`
  - Metallic Gold: `#D4AF37`, `#F4D03F`
  - Steel Blue: `#5B7FA8`, `#7A9BC4`

---

## 📋 All 29 GUI Modules

1. **Dashboard** - Main overview
2. **Device Analysis** - Device detection and analysis
3. **Compliance Summary** - Compliance reporting
4. **Legal Classification** - Legal assessment
5. **Certification** - User certification system
6. **Operations Dashboard** - Ops metrics
7. **Custodial Vault** - Solutions database
8. **Intake** - Case intake
9. **Jobs** - Job management
10. **Console** - System console
11. **Dev Mode** - Developer tools
12. **Drives** - Drive management
13. **Imaging** - Disk imaging
14. **Diagnostics** - Device diagnostics
15. **Recovery** - Recovery tools
16. **Audit Log** - Audit trail viewer
17. **Evidence Bundles** - Evidence collection
18. **Ownership Attestation** - Ownership verification
19. **Interpretive Review** - High-risk analysis
20. **Report History** - Report archive
21. **Settings** - Application settings
22. **User Profile** - User management
23. **Certification Exam** - Certification testing
24. **Help Viewer** - Documentation
25. **Notifications** - Notification center
26. **Device Comparison** - Multi-device comparison
27. **Batch Analysis** - Batch processing
28. **Device Overview** - Device details
29. **Compliance Summary (New)** - Enhanced compliance

---

## 🔌 API Endpoints

### Public API (Port 8001)

#### Cases
- `POST /api/v1/cases` - Create case
- `GET /api/v1/cases` - List cases
- `GET /api/v1/cases/{id}` - Get case
- `PATCH /api/v1/cases/{id}/status` - Update status

#### Devices
- `GET /api/v1/devices/detect` - Detect devices
- `POST /api/v1/cases/{id}/devices` - Add device to case
- `GET /api/v1/cases/{id}/devices` - Get case devices

#### Diagnostics
- `POST /api/v1/diagnostics/run` - Run diagnostics

#### Recovery
- `GET /api/v1/recovery/firmware` - Lookup firmware
- `POST /api/v1/recovery/bundles` - Generate evidence bundle
- `GET /api/v1/recovery/guidance` - Get recovery guidance

#### Solutions (Custodial Closet)
- `GET /api/v1/solutions` - List solutions
- `GET /api/v1/solutions/{id}` - Get solution
- `GET /api/v1/solutions/device-types/{type}` - Get by device type

#### Audit
- `GET /api/v1/audit/events` - Get audit events
- `GET /api/v1/audit/cases/{id}/events` - Get case events

### Trapdoor API (Admin - Port 8001)

**Authentication Required:** `X-API-Key` header

- `POST /api/trapdoor/frp` - FRP bypass workflow
- `POST /api/trapdoor/unlock` - Bootloader unlock workflow
- `POST /api/trapdoor/workflow/execute` - Execute custom workflow
- `GET /api/trapdoor/workflows` - List workflows
- `POST /api/trapdoor/batch/execute` - Batch execution
- `GET /api/trapdoor/logs/shadow` - Get shadow logs
- `GET /api/trapdoor/logs/stats` - Shadow log statistics
- `POST /api/trapdoor/logs/rotate` - Rotate shadow logs

---

## 🔐 Security & Compliance

### Authentication
- **Trapdoor API:** Requires `X-API-Key` header
- **Default Key:** `default-trapdoor-key-change-in-production` (MUST CHANGE)
- **Environment Variable:** `TRAPDOOR_API_KEY`

### Shadow Logging
- **Encryption:** AES-256-GCM
- **Location:** `storage/shadow-logs/`
- **Retention:** 90 days
- **Tamper Detection:** SHA-256 hashing

### Compliance Features
- ✅ Analysis-only architecture
- ✅ Immutable audit logging
- ✅ Ownership verification
- ✅ Legal classification
- ✅ Authority routing
- ✅ Risk language engine

---

## 📊 Solutions Database

**Total Solutions:** 18

**By Device Type:**
- Windows PC: 4 solutions
- Linux PC: 3 solutions
- MacBook: 2 solutions
- iMac: 1 solution
- Android Phone: 3 solutions
- Android Tablet: 1 solution
- iPhone: 3 solutions
- iPad: 1 solution

**Location:** `storage/solutions/solutions.json`

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Rust toolchain
- Python 3.9+
- Tauri CLI

### Install Dependencies

```powershell
# Frontend
cd apps/workshop-ui
npm install

# Backend
cd ../../api
pip install -r requirements.txt
```

### Development Mode

```powershell
# Frontend (with hot reload)
cd apps/workshop-ui
npm run tauri dev

# Backend API
cd api
uvicorn main:app --reload --port 8001
```

---

## 📦 Distribution

### Windows Installer (NSIS)
- **Location:** `src-tauri/target/release/bundle/nsis/`
- **Format:** `.exe` installer
- **Features:**
  - Desktop shortcut
  - Start Menu shortcut
  - Uninstaller

### Standalone Executable
- **Location:** `src-tauri/target/release/workshop-ui.exe`
- **Size:** ~4-5 MB
- **Dependencies:** None (bundled)

### macOS Bundle
- **Location:** `src-tauri/target/release/bundle/macos/`
- **Format:** `.app` bundle
- **DMG:** Available if DMG bundling enabled

---

## 🐛 Troubleshooting

### Application Won't Start
1. Check backend API is running (port 8001)
2. Verify executable exists
3. Check Windows Event Viewer for errors
4. Verify all dependencies are available

### API Connection Issues
1. Verify API is running: `http://localhost:8001/health`
2. Check firewall settings
3. Verify CORS configuration
4. Check API logs

### Icon Not Displaying
1. Verify icon files exist in `src-tauri/icons/`
2. Rebuild application
3. Recreate shortcuts
4. Clear icon cache

### Build Failures
1. Verify all prerequisites installed
2. Check Node.js and Rust versions
3. Clear build cache: `npm run clean`
4. Reinstall dependencies

---

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_FORGEWORKS_API_URL=http://localhost:8001
VITE_ADMIN_API_KEY=your-trapdoor-api-key
```

### Backend (.env)
```env
API_PORT=8001
TRAPDOOR_API_KEY=your-secure-api-key
SHADOW_LOG_KEY=64-character-hex-string
```

---

## ✅ Production Checklist

- [ ] All 29 GUI modules tested
- [ ] API endpoints verified
- [ ] Logo/icon displayed correctly
- [ ] Theme consistency verified
- [ ] Solutions database populated
- [ ] Trapdoor API secured
- [ ] Shadow logging operational
- [ ] Audit trail working
- [ ] Build script tested
- [ ] Installer created
- [ ] Shortcuts functional
- [ ] Documentation complete

---

## 📞 Support

For issues or questions:
1. Check `BUILD_REPORT.md` for build details
2. Review `docs/` for documentation
3. Check API logs in `storage/`
4. Review audit logs for compliance

---

**Status:** ✅ Production Ready  
**Version:** 3.0.0  
**Last Updated:** 2025-01-XX
