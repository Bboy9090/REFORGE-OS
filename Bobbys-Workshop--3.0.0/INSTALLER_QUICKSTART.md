# 🚀 Quick Start - Standalone Installer

Want to try Bobby's Workshop without any setup? Download and install the standalone version!

## 📦 Download Installers

### Windows
- **MSI Installer** (Recommended for Enterprise)
  - Professional Windows Installer package
  - Silent install support for IT deployment
  - Automatic updates (when configured)
  - [Download: Bobby's Workshop v1.0.0 (MSI)](link-to-release)

- **NSIS Installer** (Recommended for Personal Use)
  - User-friendly setup wizard
  - Custom installation options
  - Desktop shortcut creation
  - [Download: Bobby's Workshop v1.0.0 (EXE)](link-to-release)

### macOS
- **DMG Installer** (Recommended)
  - Standard macOS disk image
  - Drag-and-drop installation
  - Code-signed and notarized
  - [Download: Bobby's Workshop v1.0.0 (DMG)](link-to-release)

- **APP Bundle** (Portable)
  - Standalone application bundle
  - Run from anywhere
  - No installation required
  - [Download: Bobby's Workshop v1.0.0 (APP)](link-to-release)

## 🎯 Installation Steps

### Windows Installation

1. **Download** the installer (MSI or EXE)
2. **Double-click** the downloaded file
3. **Follow** the installation wizard
4. **Install Node.js** if prompted (required for backend)
5. **Launch** from Desktop icon or Start Menu

**First Launch:**
- App window opens automatically
- Backend server starts in background
- All features ready to use!

### macOS Installation

1. **Download** the DMG file
2. **Open** the DMG
3. **Drag** Bobby's Workshop.app to Applications folder
4. **Open** Applications folder
5. **Right-click** Bobby's Workshop → Open (first time only)
6. **Install Node.js** if prompted (required for backend)

**First Launch:**
- App opens in native window
- Backend auto-starts
- Ready to manage devices!

## ⚙️ System Requirements

### Minimum Requirements
- **OS**: Windows 10/11 (64-bit) or macOS 10.13+
- **RAM**: 4 GB
- **Storage**: 500 MB free space
- **Node.js**: 18.0.0 or higher (auto-detected, install if missing)

### Recommended
- **OS**: Windows 11 or macOS 12+
- **RAM**: 8 GB or more
- **Storage**: 1 GB free space
- **Node.js**: 18.12.0 LTS or 20.x

## ✨ What's Included

The standalone installer includes **everything**:

✅ Complete frontend web interface  
✅ Backend API server (Express.js)  
✅ WebSocket services for real-time updates  
✅ All dependencies bundled  
✅ Device management tools  
✅ Workflow engine  
✅ Authorization system  
✅ Shadow logging  
✅ Desktop application (native window)  
✅ Auto-start on launch  

**No localhost, no building, no terminal commands!**

## 🔧 After Installation

### First-Time Setup

1. **Launch the app** from desktop icon
2. **Wait** for backend to start (~5 seconds)
3. **Optional**: Run the platform tools installer
   - Windows: Right-click PowerShell as Admin → Run `install.ps1`
   - macOS: Terminal → Run `./install.sh`
   - Installs: ADB, Fastboot, scrcpy, FFmpeg

### Daily Use

Just **double-click** the desktop icon!
- No need to open terminals
- No need to start servers manually
- Everything starts automatically

## 🛠️ Troubleshooting

### "Node.js not found" Error

**Solution**: Install Node.js
1. Download from: https://nodejs.org/
2. Install the LTS version
3. Restart Bobby's Workshop

### App Won't Start

**Windows:**
- Check Windows Defender didn't block it
- Right-click installer → "Run as Administrator"
- Disable antivirus temporarily during install

**macOS:**
- System Preferences → Security & Privacy
- Click "Open Anyway" if blocked
- Grant permissions when prompted

### Backend Connection Failed

1. Check if port 3001 is available
2. Close other apps using that port
3. Restart the application
4. Check firewall settings

### Need More Help?

- Read: [STANDALONE_INSTALLER_GUIDE.md](STANDALONE_INSTALLER_GUIDE.md)
- Check: [QUICK_START.md](QUICK_START.md)
- Open: GitHub Issue

## 🔄 Updates

### Manual Updates
1. Download new installer
2. Install over existing version
3. Your settings are preserved!

### Auto-Update (Coming Soon)
- Automatic update checks
- One-click update downloads
- Background installation

## 📊 Comparison

| Feature | Standalone Installer | Manual Setup |
|---------|---------------------|--------------|
| Installation Time | 2 minutes | 15-30 minutes |
| Technical Knowledge | None required | Developer level |
| Dependencies | Auto-installed | Manual install |
| Updates | One-click | Manual rebuild |
| Platform Support | Windows + macOS | All platforms |
| Desktop Integration | ✅ Yes | ❌ No |
| Backend Auto-Start | ✅ Yes | ❌ Manual |
| **Recommended For** | **Everyone** | Developers only |

## 🎉 Benefits

### For Users
- **No Setup Hassle** - Download, install, done!
- **Native Experience** - Real desktop app, not browser
- **Auto-Start Backend** - No manual server management
- **Desktop Integration** - Icons, notifications, shortcuts
- **Professional** - Looks and feels like commercial software

### For Developers
- **Easy Distribution** - Single file to share
- **Version Control** - Track installed versions
- **Update Management** - Push updates easily
- **Support Simplified** - Consistent installation experience

## 🔐 Security

- **Code Signed** - Verified publisher (when configured)
- **No Admin Required** - Installs to user directory
- **Sandboxed** - Isolated from system
- **Open Source** - Full transparency

## 📝 Building Your Own Installer

Want to build from source or customize?

### Quick Build
```bash
npm run build:standalone
```

### Platform-Specific
```bash
# Windows only
npm run build:windows

# macOS only
npm run build:macos
```

### Full Guide
See [STANDALONE_INSTALLER_GUIDE.md](STANDALONE_INSTALLER_GUIDE.md) for complete build instructions.

---

**Ready to get started? Download the installer above! 🚀**
