# 🔨 Bobby's Workshop - Build Guide for Maintainers

## Overview

This guide is for maintainers who need to build Bobby's Workshop installers for distribution. The build process creates native desktop applications for Windows, macOS, and Linux.

## Prerequisites

### Required Tools (All Platforms)

1. **Node.js 18+**
   ```bash
   node --version  # Must be v18 or higher
   npm --version   # Must be v9 or higher
   ```

2. **Rust Toolchain**
   ```bash
   rustc --version  # Must be 1.70+ 
   cargo --version
   ```

3. **Tauri CLI**
   ```bash
   cargo install tauri-cli
   cargo tauri --version
   ```

### Platform-Specific Requirements

#### Windows

```powershell
# Install Rust
winget install Rustlang.Rustup

# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools

# Install WebView2 (usually pre-installed on Windows 10/11)
# If needed: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

# For MSI installer: Install WiX Toolset 3.x
# Download from: https://wixtoolset.org/releases/

# For NSIS installer: Install NSIS
winget install NSIS.NSIS
```

#### macOS

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node.js
brew install node

# For code signing (optional for local builds):
# - Apple Developer Account required
# - Valid Developer ID Application certificate
# - Valid Developer ID Installer certificate
```

#### Linux (Ubuntu/Debian)

```bash
# System dependencies
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libjavascriptcoregtk-4.0-dev \
    libsoup2.4-dev

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## Build Process

### Step 1: Prepare the Repository

```bash
# Clone repository
git clone https://github.com/Bboy9090/Bobbys-Workshop-.git
cd Bobbys-Workshop-

# Checkout release branch or tag
git checkout main  # or git checkout v1.0.0

# Clean any previous builds
rm -rf dist/ dist-ssr/ node_modules/ server/node_modules/
rm -rf src-tauri/target/
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Verify installations
npm list --depth=0
cd server && npm list --depth=0 && cd ..
```

### Step 3: Build Frontend

```bash
# Build optimized production frontend
npm run build

# Verify build output
ls -lh dist/
# Should see index.html, assets/, package.json, etc.
```

**Expected output:**
```
dist/
├── index.html
├── package.json
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
└── proxy.js
```

### Step 4: Build Tauri Application

#### Option A: Build for Current Platform

```bash
# Build for current platform (creates all available installers)
cargo tauri build

# Or use npm script
npm run tauri:build
```

#### Option B: Build for Specific Platform

```bash
# Windows (must be on Windows)
cargo tauri build --target x86_64-pc-windows-msvc

# macOS (must be on macOS)
cargo tauri build --target x86_64-apple-darwin
# OR for Apple Silicon:
cargo tauri build --target aarch64-apple-darwin

# Linux (must be on Linux)
cargo tauri build --target x86_64-unknown-linux-gnu
```

#### Option C: Use Build Scripts

```bash
# Universal build script (detects platform)
npm run build:standalone

# Platform-specific
npm run build:windows   # Windows only
npm run build:macos     # macOS only
```

### Step 5: Locate Build Artifacts

Build artifacts are in `src-tauri/target/release/bundle/`:

#### Windows
```
src-tauri/target/release/bundle/
├── msi/
│   └── Bobbys Workshop_1.0.0_x64_en-US.msi    (~80-100 MB)
└── nsis/
    └── Bobbys Workshop_1.0.0_x64-setup.exe    (~85-105 MB)
```

#### macOS
```
src-tauri/target/release/bundle/
├── dmg/
│   └── Bobbys Workshop_1.0.0_x64.dmg          (~90-110 MB)
└── macos/
    └── Bobbys Workshop.app/                    (~85-100 MB)
```

#### Linux
```
src-tauri/target/release/bundle/
├── deb/
│   └── bobbys-workshop_1.0.0_amd64.deb        (~70-90 MB)
└── appimage/
    └── bobbys-workshop_1.0.0_amd64.AppImage   (~80-100 MB)
```

### Step 6: Test Build Locally

#### Windows
```powershell
# Install MSI
msiexec /i "src-tauri\target\release\bundle\msi\Bobbys Workshop_1.0.0_x64_en-US.msi"

# Or double-click the .exe installer

# Launch and verify:
# - App opens without terminal
# - Backend starts automatically
# - Frontend loads and connects
```

#### macOS
```bash
# Mount DMG
open "src-tauri/target/release/bundle/dmg/Bobbys Workshop_1.0.0_x64.dmg"

# Drag to Applications and launch
open "/Applications/Bobbys Workshop.app"

# Verify:
# - App opens without terminal
# - Backend starts (check Activity Monitor for node process)
# - Frontend loads and connects
```

#### Linux
```bash
# Install .deb
sudo dpkg -i src-tauri/target/release/bundle/deb/bobbys-workshop_1.0.0_amd64.deb

# Or run AppImage directly
chmod +x src-tauri/target/release/bundle/appimage/bobbys-workshop_1.0.0_amd64.AppImage
./src-tauri/target/release/bundle/appimage/bobbys-workshop_1.0.0_amd64.AppImage

# Verify:
# - App opens without terminal
# - Backend starts (check with: ps aux | grep node)
# - Frontend loads and connects
```

## Build Verification Checklist

Before releasing, verify:

- [ ] **Frontend builds successfully** (`npm run build`)
- [ ] **No TypeScript errors** (build completes without warnings)
- [ ] **Tauri build completes** (no Rust compilation errors)
- [ ] **All installers created** (check bundle directory)
- [ ] **File sizes reasonable** (~80-110 MB per installer)
- [ ] **Test installation on clean VM/machine**
- [ ] **Backend auto-starts** (no manual `npm start` needed)
- [ ] **Frontend connects to backend** (check status indicator)
- [ ] **All main features work** (device detection, workflows, etc.)
- [ ] **App closes cleanly** (backend stops, no orphaned processes)
- [ ] **Uninstaller works** (app fully removed)

## Troubleshooting

### "cargo tauri build fails with linker errors"

**Solution:**
```bash
# Windows: Ensure Visual Studio Build Tools installed
# Linux: Install build-essential and required libraries
sudo apt install build-essential libssl-dev

# macOS: Ensure Xcode Command Line Tools installed
xcode-select --install
```

### "Frontend build fails"

**Solution:**
```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json dist/
npm install
npm run build
```

### "Backend doesn't start in bundled app"

**Solution:**
1. Verify `server/` directory is in bundle resources
2. Check `tauri.conf.json` includes `"../server/**/*"`
3. Verify server dependencies installed: `ls server/node_modules/`
4. Check backend logs in app's data directory

### "Node.js not found in bundled app"

**Expected behavior:** Node.js is NOT bundled (external dependency)
- User must have Node.js installed on their system
- Document this clearly in installation guide
- App shows clear error if Node.js missing

### "Bundle size too large (>200 MB)"

**Solution:**
```bash
# Check what's being bundled
du -sh src-tauri/target/release/bundle/*/

# Server node_modules might be large
# Consider excluding dev dependencies
cd server
npm prune --production
cd ..
```

## Code Signing (Optional but Recommended)

### Windows Code Signing

```powershell
# Obtain code signing certificate (.pfx file)
# Set environment variables
$env:TAURI_PRIVATE_KEY = "path/to/private.key"
$env:TAURI_KEY_PASSWORD = "your-password"

# Build with signing
cargo tauri build
```

### macOS Code Signing

```bash
# Obtain Apple Developer ID certificate
# Import to Keychain

# Set signing identity
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID)"

# Build with signing
cargo tauri build

# Notarize (required for distribution)
xcrun notarytool submit "src-tauri/target/release/bundle/dmg/Bobbys Workshop_1.0.0_x64.dmg" \
    --apple-id "your-email@example.com" \
    --team-id "TEAMID" \
    --password "app-specific-password"
```

## CI/CD Automation (Future)

Create GitHub Actions workflow:

```yaml
# .github/workflows/build-release.yml
name: Build Release
on:
  push:
    tags:
      - 'v*'
jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: dtolnay/rust-toolchain@stable
      - run: npm install
      - run: npm run build
      - run: cargo tauri build
      - uses: actions/upload-artifact@v3
        with:
          name: windows-installers
          path: src-tauri/target/release/bundle/
  
  # Similar jobs for macos and linux...
```

## Version Management

### Bumping Version

Before building a new release:

1. **Update version in `package.json`**
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. **Update version in `src-tauri/tauri.conf.json`**
   ```json
   {
     "package": {
       "version": "1.0.1"
     }
   }
   ```

3. **Update version in `src-tauri/Cargo.toml`**
   ```toml
   [package]
   version = "1.0.1"
   ```

4. **Create git tag**
   ```bash
   git tag -a v1.0.1 -m "Release v1.0.1"
   git push origin v1.0.1
   ```

## Build Times

Typical build times on different hardware:

- **Frontend (npm run build)**: 10-15 seconds
- **Tauri build (first time)**: 10-20 minutes (compiling Rust dependencies)
- **Tauri build (incremental)**: 2-5 minutes
- **Total (clean build)**: 15-25 minutes
- **Total (incremental)**: 3-6 minutes

## Release Checklist

Before publishing release:

- [ ] Version bumped in all files
- [ ] CHANGELOG.md updated
- [ ] All builds successful on all platforms
- [ ] All installers tested on clean machines
- [ ] Documentation updated (README, INSTALLATION.md)
- [ ] Git tag created and pushed
- [ ] GitHub Release created with installers attached
- [ ] Release notes written
- [ ] Community notified (Discord, Twitter, etc.)

## Support

If you encounter build issues:

1. Check this guide's troubleshooting section
2. Review Tauri documentation: https://tauri.app/
3. Check GitHub Issues for similar problems
4. Open new issue with:
   - Build environment details (OS, versions)
   - Complete error output
   - Steps to reproduce

---

**Happy Building!** 🚀
