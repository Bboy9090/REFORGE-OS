# Building Standalone Installers for REFORGE OS

This guide explains how to build standalone installable applications for Windows and macOS.

---

## Prerequisites

### For Windows Builds
- Windows 10/11
- Rust toolchain installed
- Node.js and npm
- Visual Studio Build Tools (for Windows) or Windows SDK

### For macOS Builds
- macOS 10.13 or later
- Rust toolchain installed
- Node.js and npm
- Xcode Command Line Tools

---

## Installation Steps

### 1. Install Dependencies

```bash
cd apps/workshop-ui
npm install
```

### 2. Install Rust (if not already installed)

**Windows:**
Download and install from: https://www.rust-lang.org/tools/install

**macOS:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 3. Install Tauri CLI

```bash
npm install -g @tauri-apps/cli
```

Or use locally:
```bash
npx @tauri-apps/cli --version
```

---

## Building Standalone Apps

### Windows (MSI Installer)

```bash
cd apps/workshop-ui
npm run build
```

This will create:
- **MSI Installer**: `src-tauri/target/release/bundle/msi/REFORGE OS_3.0.0_x64_en-US.msi`
- **Portable EXE**: `src-tauri/target/release/REFORGE OS.exe`

**Distribution:**
- Share the `.msi` file for installation
- Users can double-click to install
- Application will appear in Start Menu and can be uninstalled via Control Panel

---

### macOS (DMG/App Bundle)

```bash
cd apps/workshop-ui
npm run build
```

This will create:
- **App Bundle**: `src-tauri/target/release/bundle/macos/REFORGE OS.app`
- **DMG Installer**: `src-tauri/target/release/bundle/dmg/REFORGE OS_3.0.0_x64.dmg` (if configured)

**Distribution:**
- Share the `.dmg` file for installation
- Users can drag the app to Applications folder
- Or share the `.app` bundle directly

**Note**: For distribution outside the App Store, you may need to code sign the application.

---

## Build Options

### Development Build (for testing)

```bash
npm run dev
```

This runs the app in development mode with hot reload.

### Production Build

```bash
npm run build
```

This creates optimized production builds with installers.

### Build Specific Platform

**Windows only:**
```bash
npm run tauri:build -- --target x86_64-pc-windows-msvc
```

**macOS only:**
```bash
npm run tauri:build -- --target x86_64-apple-darwin
# or for Apple Silicon:
npm run tauri:build -- --target aarch64-apple-darwin
```

---

## Output Locations

### Windows
- **MSI**: `src-tauri/target/release/bundle/msi/`
- **EXE**: `src-tauri/target/release/`
- **Portable**: `src-tauri/target/release/`

### macOS
- **DMG**: `src-tauri/target/release/bundle/dmg/`
- **App**: `src-tauri/target/release/bundle/macos/`

---

## Installation Instructions for End Users

### Windows

1. Download the `.msi` file
2. Double-click to run the installer
3. Follow the installation wizard
4. Launch "REFORGE OS" from Start Menu

### macOS

1. Download the `.dmg` file
2. Double-click to mount the disk image
3. Drag "REFORGE OS" to the Applications folder
4. Launch from Applications

**Note**: On macOS, users may need to:
- Right-click and select "Open" the first time (to bypass Gatekeeper)
- Or go to System Preferences > Security & Privacy > Allow the app

---

## Troubleshooting

### Windows Build Issues

**Error: "link.exe not found"**
- Install Visual Studio Build Tools
- Or install Windows SDK

**Error: "rustup not found"**
- Install Rust from https://rustup.rs
- Restart terminal after installation

### macOS Build Issues

**Error: "xcodebuild not found"**
- Install Xcode Command Line Tools:
  ```bash
  xcode-select --install
  ```

**Code Signing Warnings**
- For development, warnings are normal
- For distribution, you'll need an Apple Developer account and certificates

---

## Advanced: Customization

### Change App Name
Edit `src-tauri/tauri.conf.json`:
```json
{
  "package": {
    "productName": "Your App Name"
  }
}
```

### Change Version
Edit `src-tauri/tauri.conf.json`:
```json
{
  "package": {
    "version": "1.0.0"
  }
}
```

### Change Window Size
Edit `src-tauri/tauri.conf.json`:
```json
{
  "tauri": {
    "windows": [{
      "width": 1400,
      "height": 900
    }]
  }
}
```

---

## Distribution Checklist

- [ ] Build for target platform
- [ ] Test installer on clean system
- [ ] Verify all features work
- [ ] Check file sizes (optimize if needed)
- [ ] Code sign (for macOS distribution)
- [ ] Create release notes
- [ ] Package installer in zip for distribution

---

**For more information, see:**
- [Tauri Documentation](https://tauri.app/v1/guides/building/)
- [Tauri Bundling Guide](https://tauri.app/v1/guides/building/bundling/)
