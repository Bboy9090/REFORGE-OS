# 🔥 Bobby's Workshop - Standalone Installer Guide

## Overview

Bobby's Workshop can be built as a **completely standalone application** with installers for both Windows and macOS. These installers include:

✅ **Complete Frontend** - React-based web UI with all components  
✅ **Backend Server** - Node.js Express API with all routes  
✅ **WebSocket Services** - Real-time device monitoring  
✅ **All Dependencies** - Bundled with the installer  
✅ **Native Desktop App** - Built with Tauri (Rust + WebView)  
✅ **One-Click Install** - No manual setup required  
✅ **Auto-Start Backend** - Backend starts automatically when app opens  
✅ **Desktop Icon** - Single click to launch the complete app  

## 🎯 What You Get

### Windows Installers
- **MSI Package** - Windows Installer for enterprise deployment
- **NSIS EXE** - Self-extracting installer with custom UI
- **Portable Mode** - Run without installation (optional)

### macOS Installers
- **DMG Image** - Standard macOS disk image installer
- **APP Bundle** - Standalone .app that can be dragged to Applications
- **Code Signed** - Ready for distribution (with valid certificate)

### All Platforms Include
- ✅ Frontend built and optimized
- ✅ Backend server with all APIs
- ✅ WebSocket server for real-time updates
- ✅ All npm dependencies bundled
- ✅ Configuration files and workflows
- ✅ Desktop shortcut creation
- ✅ Auto-launch on startup (optional)
- ✅ Uninstaller

## 📋 Prerequisites

### Required Software

#### Windows
```powershell
# 1. Node.js 18+ (for building)
winget install OpenJS.NodeJS

# 2. Rust toolchain
winget install Rustlang.Rustup

# 3. Tauri CLI
cargo install tauri-cli

# 4. NSIS (for .exe installer)
winget install NSIS.NSIS

# 5. WiX Toolset (for .msi installer)
# Download from: https://wixtoolset.org/
```

#### macOS
```bash
# 1. Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js 18+
brew install node

# 3. Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 4. Xcode Command Line Tools
xcode-select --install

# 5. Tauri CLI
cargo install tauri-cli
```

### Verify Installation

```bash
# Check all tools are installed
node --version      # Should be v18.0.0 or higher
npm --version       # Should be v9.0.0 or higher
rustc --version     # Should be 1.70.0 or higher
cargo --version     # Should be 1.70.0 or higher
cargo tauri --version  # Should be installed
```

## 🚀 Building the Installer

### Quick Build (Recommended)

```bash
# Clone the repository
git clone https://github.com/Bboy9090/Bobbys-Workshop-.git
cd Bobbys-Workshop-

# Run the unified build script
npm run build:standalone
```

This single command will:
1. ✅ Check prerequisites
2. ✅ Install all dependencies
3. ✅ Build the frontend
4. ✅ Build the Tauri application
5. ✅ Create platform-specific installers
6. ✅ Display build results

### Platform-Specific Builds

#### Windows Only
```bash
# Build Windows installers (MSI + NSIS)
npm run build:windows
```

#### macOS Only
```bash
# Build macOS installer (DMG + APP)
npm run build:macos
```

### Custom Build Options

```bash
# Skip dependency installation (if already installed)
node scripts/build-standalone.js --skip-deps

# Skip cleaning previous builds
node scripts/build-standalone.js --skip-clean

# Build for specific target
node scripts/build-standalone.js --target=x86_64-pc-windows-msvc
```

## 📦 Installer Locations

After building, installers will be in:

```
src-tauri/target/release/bundle/
├── msi/                          # Windows MSI installer
│   └── Bobby's Workshop_1.0.0_x64_en-US.msi
├── nsis/                         # Windows NSIS installer
│   └── Bobby's Workshop_1.0.0_x64-setup.exe
├── dmg/                          # macOS disk image
│   └── Bobby's Workshop_1.0.0_x64.dmg
└── macos/                        # macOS app bundle
    └── Bobby's Workshop.app
```

## 🎮 Using the Installer

### Windows Installation

**Option 1: MSI Installer (Recommended for Enterprise)**
1. Double-click `Bobby's Workshop_1.0.0_x64_en-US.msi`
2. Follow the installation wizard
3. Choose installation directory (default: `C:\Program Files\Bobby's Workshop`)
4. Click "Install"
5. Desktop shortcut created automatically

**Option 2: NSIS Installer (Recommended for Personal Use)**
1. Double-click `Bobby's Workshop_1.0.0_x64-setup.exe`
2. Choose installation type (All Users / Current User)
3. Select installation directory
4. Choose components (if applicable)
5. Install

**Running the App:**
- Double-click desktop icon "Bobby's Workshop"
- OR: Start Menu → Bobby's Workshop
- App opens automatically in a native window
- Backend starts automatically (no manual setup needed!)

### macOS Installation

**Option 1: DMG Installer (Recommended)**
1. Double-click `Bobby's Workshop_1.0.0_x64.dmg`
2. Drag "Bobby's Workshop.app" to Applications folder
3. Eject the DMG
4. Open Applications folder
5. Double-click "Bobby's Workshop"
6. If prompted about unidentified developer:
   - System Preferences → Security & Privacy
   - Click "Open Anyway"

**Option 2: Direct APP Bundle**
1. Copy `Bobby's Workshop.app` anywhere
2. Double-click to launch

**Running the App:**
- Applications → Bobby's Workshop
- Backend starts automatically when app opens
- No terminal or command line needed!

## 🔧 What's Bundled

### Frontend (dist/)
- React 19+ web application
- All UI components (Radix UI, Phosphor Icons)
- Tailwind CSS styles
- All static assets (images, fonts, audio)
- Service worker (if enabled)

### Backend (server/)
- Express.js API server
- WebSocket servers (device events, correlation, analytics)
- Authorization triggers API
- Trapdoor API (Bobby's Secret Workshop)
- Device detection services
- Firmware library
- Workflow engine
- Shadow logging system

### Dependencies
- All npm packages (bundled as node_modules)
- Node.js runtime (user must have Node.js installed separately*)
- Platform tools (adb, fastboot) - User installs separately via install script

\* **Note:** Node.js must be installed on the user's machine for the backend to run. The app will check and provide clear instructions if Node.js is missing.

## 🎯 First Launch Experience

When a user installs and runs Bobby's Workshop for the first time:

1. **App Window Opens** - Native desktop window with embedded browser
2. **Backend Auto-Starts** - Node.js server starts automatically in background
3. **Connection Handshake** - Frontend connects to backend on localhost:3001
4. **WebSocket Established** - Real-time device monitoring activated
5. **Ready to Use** - All features available immediately!

### If Node.js Not Installed

If Node.js is not detected on the system:
1. Error dialog appears with clear message
2. Direct link to https://nodejs.org/ provided
3. Instructions to install and restart app
4. User can still browse UI but features require backend

## 🔒 Security Considerations

### Code Signing

**Windows:**
- Sign the installer with a valid Authenticode certificate
- Required for avoiding "Unknown Publisher" warnings
- Use `signtool.exe` from Windows SDK

**macOS:**
- Sign with Apple Developer ID certificate
- Notarize the app with Apple
- Required for Gatekeeper approval

### Permissions

The app requests minimal permissions:
- File system access (for device operations)
- Network access (localhost only for backend)
- USB access (for device detection)

## 🛠️ Troubleshooting

### Build Fails

**Error: "Rust not found"**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Error: "Tauri CLI not found"**
```bash
cargo install tauri-cli
```

**Error: "Frontend build failed"**
```bash
# Clean and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Installer Fails

**Windows: "NSIS not found"**
- Install NSIS from: https://nsis.sourceforge.io/
- Add to PATH: `C:\Program Files (x86)\NSIS`

**macOS: "Code signing failed"**
- Skip signing for development: `export APPLE_SIGNING_IDENTITY=""`
- For distribution, get Apple Developer ID certificate

### App Won't Start

**"Node.js not found"**
- Install Node.js 18+ from https://nodejs.org/
- Restart the app after installation

**"Backend server failed to start"**
- Check if port 3001 is already in use
- Close other applications using that port
- Or set custom port in config

## 📊 Build Statistics

Typical build times and sizes:

**Build Time:**
- Clean build: ~5-10 minutes
- Incremental build: ~2-3 minutes

**Package Sizes:**
- Windows MSI: ~80-100 MB
- Windows NSIS EXE: ~85-105 MB
- macOS DMG: ~90-110 MB
- macOS APP: ~85-100 MB

**Installed Size:**
- Windows: ~200-250 MB
- macOS: ~220-270 MB

## 🎉 Distribution

### Hosting Options

1. **GitHub Releases** (Recommended)
   - Upload installers as release assets
   - Users download directly from GitHub
   - Automatic update checks possible

2. **Cloud Storage**
   - Google Drive, Dropbox, OneDrive
   - Share public download links

3. **Self-Hosted Server**
   - Host on your own web server
   - Full control over distribution

### Update Strategy

**Manual Updates:**
- Users download new installer
- Install over existing version
- Settings and data preserved

**Auto-Update (Future):**
- Tauri supports auto-update mechanism
- Check for updates on app launch
- Download and install in background

## 📝 Build Configuration

### Customization

Edit `src-tauri/tauri.conf.json` to customize:
- App name and version
- Window size and title
- Bundle identifier
- Icon files
- Installer options
- Resources to bundle
- Security policies

### Environment Variables

Set these during build for customization:
```bash
export TAURI_PRIVATE_KEY="<your-key>"      # For auto-updates
export TAURI_KEY_PASSWORD="<password>"      # Key password
export APPLE_SIGNING_IDENTITY="<identity>" # macOS signing
export WINDOWS_CERTIFICATE="<cert.pfx>"    # Windows signing
```

## 🤝 Support

Need help with building or distribution?

1. Check the troubleshooting section above
2. Review Tauri documentation: https://tauri.app/
3. Open an issue on GitHub
4. Contact the development team

## 📜 License

MIT License - See LICENSE file for details

---

**Built with Tauri** - The secure, fast, and lightweight desktop app framework

**Happy Building! 🚀**
