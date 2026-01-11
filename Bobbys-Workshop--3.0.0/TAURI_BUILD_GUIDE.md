# Bobby's Workshop - Standalone App Builder

## Overview

Bobby's Workshop can be built as a standalone wrapped application with all dependencies bundled using Tauri. This creates a native desktop app for Windows, macOS, and Linux with the backend server, frontend, and all tools integrated.

## Prerequisites

### System Requirements

**All Platforms:**
- Rust toolchain (v1.70+)
- Node.js (v18+)
- npm (v9+)

**Windows:**
```powershell
# Install via winget or download from rust-lang.org
winget install --id=Rustlang.Rustup -e

# Install Tauri CLI
cargo install tauri-cli
```

**macOS:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Xcode Command Line Tools
xcode-select --install

# Install Tauri CLI
cargo install tauri-cli
```

**Linux:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install system dependencies (Ubuntu/Debian)
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Install Tauri CLI
cargo install tauri-cli
```

## Building the Standalone App

### Development Mode (with hot reload)

```bash
# Start Tauri in dev mode
cargo tauri dev

# Or use npm script
npm run tauri:dev
```

This will:
1. Start the Vite dev server
2. Launch the Tauri app
3. Enable hot module replacement
4. Connect to the backend automatically

### Production Build

```bash
# Build for production
cargo tauri build

# Or use npm script
npm run tauri:build
```

This creates:
- **Windows**: `.msi` and `.exe` installers in `src-tauri/target/release/bundle/`
- **macOS**: `.dmg` and `.app` in `src-tauri/target/release/bundle/`
- **Linux**: `.deb`, `.AppImage` in `src-tauri/target/release/bundle/`

### One-Click Installer

The generated installers include:
✅ Frontend (React + Vite)
✅ Backend API (Node.js server embedded)
✅ WebSocket connections
✅ BootForge USB (Rust binary)
✅ All assets (CSS, images, audio)
✅ Configuration files

## Configuration

### Tauri Configuration (`src-tauri/tauri.conf.json`)

Key settings:
- **Product Name**: "Bobby's Workshop"
- **Identifier**: "com.bobbys.workshop"
- **Window Size**: 1400x900 (resizable)
- **Bundle Targets**: NSIS (Windows), MSI (Windows), DMG (macOS), DEB (Linux)

### Backend Server Integration

The backend server starts automatically when the app launches. Configuration in `src-tauri/src/main.rs`:

```rust
// Start Node.js backend server
let backend_server = Command::new("node")
    .arg("server/index.js")
    .spawn()
    .expect("Failed to start backend server");

// Start WebSocket server
let ws_server = Command::new("node")
    .arg("server/flash-ws.js")
    .spawn()
    .expect("Failed to start WebSocket server");
```

### Environment Variables

The app automatically configures:
- `VITE_API_URL`: Points to embedded backend (http://localhost:3001)
- `VITE_WS_URL`: Points to embedded WebSocket (ws://localhost:3001)

## Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "tauri:dev": "cargo tauri dev",
    "tauri:build": "cargo tauri build",
    "tauri:build:windows": "cargo tauri build --target x86_64-pc-windows-msvc",
    "tauri:build:macos": "cargo tauri build --target x86_64-apple-darwin",
    "tauri:build:linux": "cargo tauri build --target x86_64-unknown-linux-gnu"
  }
}
```

## Bundled Dependencies

The standalone app includes:

### Frontend
- All React components
- Workshop visual theme CSS
- Sound effects (boom bap beats, chimes)
- Icons and images

### Backend
- Node.js API server (Express)
- WebSocket servers (device events, correlation)
- BootForge USB (Rust binary)
- Python scripts (if needed)

### System Tools
- ADB and Fastboot binaries
- iOS device tools (libimobiledevice)
- BootForge CLI

### Configuration
- Default settings
- Audio atmosphere enabled
- Workshop theme active

## Installation Instructions for End Users

### Windows
1. Download `Bobbys-Workshop-Setup.exe`
2. Run the installer
3. Follow the installation wizard
4. Launch "Bobby's Workshop" from Start Menu

### macOS
1. Download `Bobbys-Workshop.dmg`
2. Open the DMG file
3. Drag "Bobby's Workshop" to Applications
4. Launch from Applications folder
5. Allow security exception if prompted

### Linux
1. Download `bobbys-workshop_1.0.0_amd64.deb` (Debian/Ubuntu)
   or `Bobbys-Workshop_1.0.0_amd64.AppImage` (Universal)
2. For DEB: `sudo dpkg -i bobbys-workshop_*.deb`
3. For AppImage: `chmod +x Bobbys-Workshop*.AppImage && ./Bobbys-Workshop*.AppImage`

## Features of Standalone App

✅ **No internet required** (after download)
✅ **Automatic updates** (via Tauri updater)
✅ **Native window controls**
✅ **System tray integration**
✅ **Auto-start backend services**
✅ **USB device access**
✅ **File system access** (for firmware files)
✅ **System notifications**
✅ **Hardware acceleration**

## Advanced Configuration

### Custom Backend Port

Edit `src-tauri/tauri.conf.json`:
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5000",
    "distDir": "../dist"
  }
}
```

### Bundle Additional Tools

Add to `src-tauri/Cargo.toml`:
```toml
[build-dependencies]
tauri-build = { version = "1.5", features = [] }

[dependencies]
tauri = { version = "1.5", features = ["shell-open", "system-tray"] }
```

### Code Signing (for distribution)

**Windows:**
```bash
cargo tauri build --target x86_64-pc-windows-msvc -- --sign
```

**macOS:**
```bash
# Set up Apple Developer certificate
export APPLE_CERTIFICATE="path/to/cert.p12"
export APPLE_CERTIFICATE_PASSWORD="password"
cargo tauri build --target x86_64-apple-darwin
```

## Troubleshooting

### Build Fails
- Ensure Rust toolchain is up to date: `rustup update`
- Clean build artifacts: `cargo clean`
- Reinstall dependencies: `npm install`

### Backend Not Starting
- Check `server/index.js` path is correct
- Verify Node.js is installed
- Check port 3001 is not in use

### USB Devices Not Detected
- Install system drivers (ADB, libimobiledevice)
- Run app with elevated permissions if needed
- Check USB debugging is enabled on devices

## Distribution

### File Sizes (Approximate)
- **Windows**: 80-120 MB (NSIS installer)
- **macOS**: 90-130 MB (DMG)
- **Linux**: 85-125 MB (AppImage)

### Checksums
Generate SHA256 checksums for distribution:
```bash
sha256sum Bobbys-Workshop-Setup.exe > checksums.txt
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Build Tauri App

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - run: npm install
      - run: cargo tauri build
      
      - uses: actions/upload-artifact@v3
        with:
          name: app-${{ matrix.os }}
          path: src-tauri/target/release/bundle/
```

## Security

- Backend server only listens on localhost
- No external network access without user permission
- File system access limited to app directory
- USB access requires system permissions

## License

Same as Bobby's Workshop (MIT License)

---

**Bobby's Workshop** - Standalone Desktop App
Built with Tauri • Production Ready • All-in-One Package 🚀
