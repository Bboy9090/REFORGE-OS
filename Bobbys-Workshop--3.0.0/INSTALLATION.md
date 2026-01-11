# 🚀 Bobby's Workshop - Installation Guide for End Users

## What is Bobby's Workshop?

Bobby's Workshop is a professional desktop application for device management, firmware flashing, and diagnostics for Android and iOS devices. This guide will help you install and run the application with no technical expertise required.

## 📥 Download

**[Download the latest release for your platform](../../releases/latest)**

- **Windows**: Download `Bobbys-Workshop-Setup.msi` or `Bobbys-Workshop-Setup.exe`
- **macOS**: Download `Bobbys-Workshop.dmg`
- **Linux**: Download `Bobbys-Workshop.AppImage` or `bobbys-workshop.deb`

## ✅ System Requirements

### Required Before Installation

**Node.js Runtime** (Required for full functionality)
- Download from: https://nodejs.org/
- Choose the LTS (Long Term Support) version
- Version 18 or higher required
- **Why?** The application backend runs on Node.js

### Operating System Requirements

**Windows:**
- Windows 10 or later (64-bit)
- Administrator access for installation
- ~300 MB free disk space

**macOS:**
- macOS 10.13 (High Sierra) or later
- ~350 MB free disk space
- May require "Open Anyway" for unsigned apps

**Linux:**
- Ubuntu 20.04+ / Debian 11+ / Fedora 35+ or equivalent
- ~300 MB free disk space
- GTK3 and WebKit2GTK libraries

### Optional (for device operations)

**Android Tools:**
- ADB (Android Debug Bridge)
- Fastboot
- Platform-specific drivers

**iOS Tools:**
- libimobiledevice
- ideviceinstaller
- iTunes (Windows only)

## 📦 Installation Instructions

### Windows Installation

#### Step 1: Install Node.js (Required)
1. Go to https://nodejs.org/
2. Download the LTS version (e.g., "20.11.0 LTS")
3. Run the installer, click "Next" through all prompts
4. Restart your computer after installation

#### Step 2: Install Bobby's Workshop
1. Double-click `Bobbys-Workshop-Setup.msi` or `Bobbys-Workshop-Setup.exe`
2. Accept the license agreement
3. Choose installation location (default recommended)
4. Click "Install"
5. Wait for installation to complete
6. Click "Finish"

#### Step 3: First Launch
1. Find "Bobby's Workshop" on your Desktop or Start Menu
2. Double-click to launch
3. The application window will open
4. Backend starts automatically (you'll see a brief initialization)
5. Ready to use!

**Troubleshooting Windows:**
- If you see "Windows protected your PC" warning:
  - Click "More info"
  - Click "Run anyway"
  - This happens because the app is not code-signed yet
- If the app says "Node.js not found":
  - Install Node.js (see Step 1)
  - Restart your computer
  - Try launching again

---

### macOS Installation

#### Step 1: Install Node.js (Required)
1. Go to https://nodejs.org/
2. Download the macOS installer
3. Run the .pkg file and follow prompts
4. Verify installation: Open Terminal and type `node --version`

#### Step 2: Install Bobby's Workshop
1. Double-click `Bobbys-Workshop.dmg`
2. Drag "Bobby's Workshop.app" to Applications folder
3. Eject the DMG

#### Step 3: First Launch
1. Open Applications folder
2. Find "Bobby's Workshop"
3. **Right-click** and select "Open" (first time only)
4. If prompted "Cannot be opened because developer cannot be verified":
   - Click "Cancel"
   - Go to System Preferences → Security & Privacy
   - Click "Open Anyway"
5. Click "Open" in the confirmation dialog
6. Application launches with backend auto-starting
7. Ready to use!

**Troubleshooting macOS:**
- If "Open Anyway" doesn't appear:
  - Run: `xattr -cr /Applications/Bobby\'s\ Workshop.app`
  - This removes the quarantine flag
- If Node.js not found:
  - Install from https://nodejs.org/
  - Or use Homebrew: `brew install node`
  - Restart Terminal and try again

---

### Linux Installation

#### Step 1: Install Node.js (Required)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nodejs npm
node --version  # Should show v18+
```

**Fedora:**
```bash
sudo dnf install nodejs npm
node --version  # Should show v18+
```

#### Step 2: Install Bobby's Workshop

**Option A: AppImage (Universal)**
```bash
chmod +x Bobbys-Workshop.AppImage
./Bobbys-Workshop.AppImage
```

**Option B: .deb Package (Ubuntu/Debian)**
```bash
sudo dpkg -i bobbys-workshop.deb
sudo apt-get install -f  # Fix dependencies if needed
```

**Option C: Build from Source**
```bash
# See DEVELOPER_SETUP.md
```

#### Step 3: First Launch
- Find "Bobby's Workshop" in Applications menu
- Or run from terminal: `bobbys-workshop`
- Backend auto-starts
- Ready to use!

**Troubleshooting Linux:**
- If GTK errors appear:
  ```bash
  sudo apt install libgtk-3-0 libwebkit2gtk-4.0-37
  ```
- If Node.js not found:
  - Use NodeSource repository for latest version
  - Or use `nvm` (Node Version Manager)

---

## 🎯 First Time Setup

After installation and first launch:

1. **Device Connection (Optional for now)**
   - You can explore the app without devices connected
   - To work with devices, install platform tools (see below)

2. **Platform Tools (For Device Operations)**
   - **Android**: Install Android Platform Tools (includes ADB)
     - Windows: Download SDK Platform Tools from Google
     - macOS: `brew install android-platform-tools`
     - Linux: `sudo apt install adb fastboot`
   
   - **iOS**: Install libimobiledevice
     - Windows: Use iTunes or download libimobiledevice
     - macOS: `brew install libimobiledevice`
     - Linux: `sudo apt install libimobiledevice-utils`

3. **Test the Application**
   - Open Bobby's Workshop
   - Check the status indicator (should show "Connected")
   - Navigate through different tabs
   - Connect a device to test detection

---

## 🔄 Updating

### Windows
1. Download new installer
2. Run it - will automatically update existing installation
3. No need to uninstall first

### macOS
1. Download new DMG
2. Drag new .app to Applications (replace existing)
3. Your settings are preserved

### Linux
1. Download new package/AppImage
2. Install over existing version
3. Settings preserved in `~/.config/bobbys-workshop/`

---

## 🗑️ Uninstallation

### Windows
- Control Panel → Programs → Uninstall a program
- Select "Bobby's Workshop" and click Uninstall
- Or use the uninstaller in Start Menu → Bobby's Workshop → Uninstall

### macOS
- Drag "Bobby's Workshop.app" from Applications to Trash
- Empty Trash
- Remove settings: `rm -rf ~/Library/Application\ Support/bobbys-workshop/`

### Linux
**If installed via .deb:**
```bash
sudo apt remove bobbys-workshop
```

**If using AppImage:**
```bash
rm Bobbys-Workshop.AppImage
```

**Remove settings:**
```bash
rm -rf ~/.config/bobbys-workshop/
```

---

## ❓ Common Issues

### "Backend server failed to start"
**Solution:**
1. Ensure Node.js is installed: `node --version`
2. Restart your computer
3. Check if port 3001 is already in use
4. Try closing other applications and relaunch

### "Cannot connect to backend"
**Solution:**
1. Check if the app is showing "Backend not running"
2. Restart the application
3. Check firewall isn't blocking localhost connections
4. View logs: [Menu] → About → View Logs

### Device not detected
**Solution:**
1. Install platform tools (ADB for Android, libimobiledevice for iOS)
2. Enable USB debugging on Android devices
3. Trust the computer on iOS devices
4. Try a different USB cable or port
5. Restart the device

### High CPU/Memory usage
**Solution:**
1. Close unused tabs in the application
2. Disconnect devices when not in use
3. Clear application cache: Settings → Advanced → Clear Cache
4. Restart the application

---

## 🆘 Getting Help

- **Documentation**: Check the in-app help (Help menu)
- **GitHub Issues**: https://github.com/Bboy9090/Bobbys-Workshop-/issues
- **Community**: Join discussions in GitHub Discussions
- **Logs**: Help us diagnose issues by sharing logs (Help → View Logs)

---

## 🔒 Privacy & Security

- Bobby's Workshop runs **100% locally** on your computer
- No data is sent to external servers
- Device operations require explicit user confirmation
- All sensitive operations are logged for audit
- You are in complete control

---

## 📝 Next Steps

After successful installation:
1. **Explore Features**: Check out the different tabs and panels
2. **Connect a Device**: Plug in an Android or iOS device to test
3. **Read Documentation**: Browse the Help menu for feature guides
4. **Stay Updated**: Check for updates regularly for new features

**Enjoy Bobby's Workshop!** 🎉
