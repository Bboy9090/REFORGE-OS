# REFORGE OS Deployment Guide

## Best Deployment Options

### Option 1: MSI Installer (Recommended for Windows)

**Best for:** Professional distribution, easy installation, Start Menu integration

**Steps:**

1. **Build the installer:**
   ```powershell
   cd apps/workshop-ui
   .\build-installer.ps1
   ```

2. **Output location:**
   - MSI: `src-tauri/target/release/bundle/msi/REFORGE OS_3.0.0_x64_en-US.msi`
   - EXE: `src-tauri/target/release/workshop-ui.exe`

3. **Distribution:**
   - Share the `.msi` file
   - Users double-click to install
   - App appears in Start Menu
   - Can be uninstalled via Control Panel

**Pros:**
- ✅ Professional installer
- ✅ Automatic shortcuts
- ✅ Easy uninstallation
- ✅ Windows integration

**Cons:**
- ⚠️ Backend API must be started separately (or use launcher)

---

### Option 2: Portable Executable with Auto-Launcher

**Best for:** Single-file distribution, no installation needed

**Steps:**

1. **Build executable:**
   ```powershell
   cd apps/workshop-ui
   npm run vite:build
   cd src-tauri
   cargo build --release
   ```

2. **Create launcher script:**
   - Use `start-reforge-os.ps1` to auto-start backend
   - Or bundle backend startup in the Tauri app

3. **Distribution:**
   - Share the entire `target/release/` folder
   - Or create a ZIP with executable + backend

**Pros:**
- ✅ No installation required
- ✅ Portable (can run from USB)
- ✅ Single folder distribution

**Cons:**
- ⚠️ Requires Python installed on user's system
- ⚠️ Manual backend startup

---

### Option 3: Bundled Standalone (Advanced)

**Best for:** Truly standalone, no dependencies

**Requirements:**
- Embed Python runtime
- Bundle backend API
- Single executable

**Implementation Options:**

#### A. PyInstaller + Tauri
- Use PyInstaller to create standalone Python executable
- Bundle with Tauri app
- Launch Python backend from Tauri

#### B. Deno/Node.js Backend
- Rewrite backend in Node.js/Deno
- Bundle with Tauri using Deno runtime
- Single executable

#### C. Rust Backend
- Rewrite FastAPI backend in Rust
- Compile into single binary
- Bundle with Tauri

**Pros:**
- ✅ Truly standalone
- ✅ No external dependencies
- ✅ Single executable

**Cons:**
- ⚠️ Requires significant refactoring
- ⚠️ Larger file size
- ⚠️ More complex build process

---

## Recommended Approach

### For Current Setup: **MSI Installer + Launcher Script**

1. **Build MSI installer:**
   ```powershell
   cd apps/workshop-ui
   .\build-installer.ps1
   ```

2. **Include launcher script in installer:**
   - Modify Tauri config to include `start-reforge-os.ps1`
   - Or create a Windows service for backend

3. **User experience:**
   - Install via MSI
   - Launch from Start Menu
   - Launcher auto-starts backend
   - App window opens

---

## Quick Deployment Steps

### Windows MSI Installer

```powershell
# 1. Build installer
cd apps/workshop-ui
.\build-installer.ps1

# 2. Test installer
# Run the MSI on a test system

# 3. Distribute
# Share: src-tauri/target/release/bundle/msi/REFORGE OS_3.0.0_x64_en-US.msi
```

### Portable Distribution

```powershell
# 1. Build executable
cd apps/workshop-ui
npm run vite:build
cd src-tauri
cargo build --release

# 2. Create distribution package
cd ..
mkdir REFORGE-OS-Portable
Copy-Item src-tauri\target\release\workshop-ui.exe REFORGE-OS-Portable\
Copy-Item ..\api REFORGE-OS-Portable\api -Recurse
Copy-Item start-reforge-os.ps1 REFORGE-OS-Portable\
Copy-Item README.md REFORGE-OS-Portable\

# 3. Create ZIP
Compress-Archive -Path REFORGE-OS-Portable -DestinationPath REFORGE-OS-Portable.zip
```

---

## Auto-Start Backend Solutions

### Solution 1: Launcher Script (Current)

**File:** `start-reforge-os.ps1`

- Starts backend API
- Launches frontend
- Works but requires manual execution

### Solution 2: Tauri Command (Recommended)

**Implementation:**
- Add backend startup to Tauri `main.rs`
- Start Python process on app launch
- Handle backend lifecycle

**Code:** See `src-tauri/src/launcher.rs`

### Solution 3: Windows Service

**For production:**
- Install backend as Windows service
- Auto-start on boot
- Managed by Windows Service Manager

---

## Distribution Checklist

- [ ] Build MSI installer
- [ ] Test on clean Windows system
- [ ] Verify backend auto-start (or provide instructions)
- [ ] Test all features
- [ ] Create user documentation
- [ ] Package installer in ZIP
- [ ] Create release notes
- [ ] Upload to distribution platform

---

## File Sizes

**Expected sizes:**
- MSI Installer: ~15-30 MB
- Portable EXE: ~10-20 MB
- With bundled Python: ~50-100 MB

---

## Next Steps

1. **Immediate:** Build MSI installer using `build-installer.ps1`
2. **Short-term:** Implement auto-launcher in Tauri app
3. **Long-term:** Consider bundling Python runtime or rewriting backend

---

**For more details, see:**
- `BUILD_STANDALONE.md` - Detailed build instructions
- `INSTALL_BUILD_LAUNCH.md` - Development setup
- `TROUBLESHOOTING.md` - Common issues
