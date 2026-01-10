# REFORGE OS - Shortcut Installation

## ✅ Shortcuts Created Successfully!

Desktop and Start Menu shortcuts have been created for REFORGE OS.

### Shortcut Locations:

1. **Desktop Shortcut:**
   - Location: `C:\Users\Bobby\Desktop\REFORGE OS.lnk`
   - Double-click to launch the application

2. **Start Menu Shortcut:**
   - Location: `Start Menu > Programs > REFORGE OS`
   - Or: `C:\Users\Bobby\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\REFORGE OS.lnk`
   - Accessible from Windows Start Menu

### How to Use:

1. **Launch from Desktop:**
   - Double-click "REFORGE OS" icon on your desktop
   - A PowerShell window will open and start the application

2. **Launch from Start Menu:**
   - Click Windows Start button
   - Type "REFORGE OS"
   - Click the "REFORGE OS" entry

### What Happens When You Launch:

- PowerShell window opens (you can minimize this)
- Application compiles and starts (first launch: 2-5 minutes)
- REFORGE OS window appears automatically
- Window title: "REFORGE OS - Professional Repair Platform"
- Size: 1200x800

### Recreating Shortcuts:

If you need to recreate the shortcuts, run:
```powershell
cd "C:\Users\Bobby\NEWFORGEl - Copy\apps\workshop-ui"
.\create-shortcuts.ps1
```

### Production Installer:

For a production installer with automatic shortcut creation:
1. Fix the Vite build configuration (Tauri API externalization)
2. Run `npm run build` to create an MSI installer
3. The MSI installer will create shortcuts automatically

### Notes:

- Current shortcuts launch via dev mode (`npm run dev`)
- First launch compiles Rust backend (takes 2-5 minutes)
- Subsequent launches are faster (~30 seconds)
- PowerShell window can be minimized once the app starts
