# Install REFORGE OS and Create Desktop Shortcut

## Quick Install

### Step 1: Build the Application

```powershell
cd apps/workshop-ui
npm install
npm run build
```

This will create the executable at:
- **Release**: `src-tauri/target/release/REFORGE OS.exe`
- **Debug**: `src-tauri/target/debug/REFORGE OS.exe`

### Step 2: Prepare the Icon

1. Save your logo image
2. Convert to `.ico` format (Windows icon format)
   - Use online converter or tools like IcoFX, ImageMagick
   - Recommended sizes: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16
3. Place the icon file at: `src-tauri/icons/icon.ico`

**Note**: For now, you can use the existing `icon.ico` file if available, or the script will use the executable's default icon.

### Step 3: Create Desktop Shortcut

Run the shortcut creation script:

```powershell
cd apps/workshop-ui
.\create-desktop-shortcut.ps1
```

This will:
- ✓ Create a desktop shortcut
- ✓ Create a Start Menu shortcut
- ✓ Use the icon file (or default icon)
- ✓ Set proper working directory

## Manual Installation (Alternative)

### Option 1: Build MSI Installer

Build the Windows installer:

```powershell
cd apps/workshop-ui
.\build-installer.ps1
```

The installer will be at:
`src-tauri/target/release/bundle/msi/REFORGE OS_3.0.0_x64_en-US.msi`

Run the `.msi` file to install with automatic shortcuts.

### Option 2: Manual Shortcut Creation

1. Right-click on `REFORGE OS.exe` (in `src-tauri/target/release/`)
2. Select "Create shortcut"
3. Drag the shortcut to Desktop
4. Right-click shortcut > Properties > Change Icon
5. Browse to your `icon.ico` file

## Icon Requirements

### Windows Icon Format (.ico)

- **Format**: .ico (Windows Icon)
- **Recommended sizes**: 
  - 256x256 (for modern displays)
  - 128x128
  - 64x64
  - 48x48
  - 32x32
  - 16x16 (for small icons)
- **Location**: `apps/workshop-ui/src-tauri/icons/icon.ico`

### Converting Image to .ico

**Online Tools:**
- https://convertio.co/png-ico/
- https://www.icoconverter.com/
- https://cloudconvert.com/png-to-ico

**Command Line (ImageMagick):**
```bash
magick convert logo.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

**Windows Tools:**
- IcoFX (free)
- Greenfish Icon Editor
- Axialis IconWorkshop

## Troubleshooting

### "Executable not found"
- Make sure you've built the app: `npm run build`
- Check that the executable exists in `src-tauri/target/release/`

### "Icon not found"
- The script will use the executable's default icon if icon file is missing
- Place your `icon.ico` file in `src-tauri/icons/` for best results

### "Cannot create shortcut"
- Run PowerShell as Administrator
- Check that you have write permissions to Desktop and Start Menu folders

### Shortcut created but doesn't work
- Make sure the executable path is correct
- Check that all required files are in the same directory
- Verify the executable runs when double-clicked directly

## Next Steps

After creating the shortcut:
1. Double-click the desktop shortcut to launch REFORGE OS
2. Pin to Taskbar: Right-click shortcut > Pin to taskbar
3. Pin to Start Menu: Right-click shortcut > Pin to Start

---

**For development**, use:
```powershell
npm run dev
```

This launches the app in development mode without creating shortcuts.
