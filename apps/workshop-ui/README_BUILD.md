# REFORGE OS - Production Build Guide

## Quick Start

### Windows
```powershell
cd apps/workshop-ui
.\build-production.ps1 -Platform windows
```

### macOS
```bash
cd apps/workshop-ui
chmod +x bundle-python-unix.sh create-dmg.sh
./build-production.ps1 -Platform macos
```

### Both Platforms
```powershell
.\build-production.ps1 -Platform all
```

## Build Process

1. **Bundle Python Runtime** - Downloads and bundles Python 3.11.7
2. **Install Dependencies** - Installs FastAPI, Uvicorn, etc.
3. **Build Frontend** - Compiles React/TypeScript
4. **Build Tauri** - Creates native app bundle
5. **Create Installers** - Generates NSIS (Windows) or DMG (macOS)

## Output Locations

- **Windows**: `src-tauri/target/release/bundle/nsis/REFORGE OS_3.0.0_x64-setup.exe`
- **macOS**: `src-tauri/target/release/bundle/dmg/REFORGE-OS-3.0.0.dmg`
- **macOS App**: `src-tauri/target/release/bundle/macos/REFORGE OS.app`

## Requirements

### Windows
- PowerShell 5.1+
- Visual Studio Build Tools (for Rust compilation)
- WiX Toolset (for NSIS installer)

### macOS
- Xcode Command Line Tools
- Python 3.11+ (for bundling)
- Rust toolchain

## Troubleshooting

### Python Backend Not Starting
- Check `src-tauri/resources/python` exists
- Verify `python/app/main.py` is copied
- Check Windows Firewall isn't blocking port 8001

### Build Fails
- Ensure all dependencies are installed
- Check Rust toolchain: `rustc --version`
- Verify Node.js: `node --version`
