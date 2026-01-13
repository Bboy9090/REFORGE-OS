# Quick Deployment Guide

## Fastest Way to Deploy

### Option 1: MSI Installer (Recommended)

```powershell
cd apps/workshop-ui
.\build-installer.ps1
```

**Output:** `src-tauri/target/release/bundle/msi/REFORGE OS_3.0.0_x64_en-US.msi`

**Distribution:**
- Share the MSI file
- Users double-click to install
- App appears in Start Menu

---

### Option 2: Portable Executable

```powershell
cd apps/workshop-ui
npm run vite:build
cd src-tauri
cargo build --release
```

**Output:** `src-tauri/target/release/workshop-ui.exe`

**Distribution:**
- Share the executable
- Users run directly (no installation)
- Backend must be started separately

---

### Option 3: Auto-Launching App

The app now includes auto-launcher that starts the backend automatically.

**Build:**
```powershell
cd apps/workshop-ui
npm run vite:build
cd src-tauri
cargo build --release
```

**Features:**
- ✅ Backend starts automatically
- ✅ No manual backend startup needed
- ✅ Single executable experience

---

## Which Option to Choose?

| Option | Best For | Pros | Cons |
|-------|----------|------|------|
| **MSI Installer** | Professional distribution | Easy install, Start Menu, uninstall | Requires installation |
| **Portable EXE** | Quick testing, USB drives | No install, portable | Manual backend startup |
| **Auto-Launcher** | Best user experience | Auto-starts backend | Requires Python on system |

---

## Quick Start

**For production deployment:**
```powershell
.\build-installer.ps1
```

**For development/testing:**
```powershell
npm run dev
```

**For portable distribution:**
```powershell
npm run vite:build
cd src-tauri
cargo build --release
```

---

See `DEPLOYMENT_GUIDE.md` for detailed information.
