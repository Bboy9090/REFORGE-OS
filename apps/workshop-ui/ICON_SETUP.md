# Setting Up Your Logo as the App Icon

## Quick Setup

### Step 1: Convert Your Logo to .ico Format

Your logo needs to be converted to Windows `.ico` format with multiple sizes.

**Online Tools (Easiest):**
- https://convertio.co/png-ico/
- https://www.icoconverter.com/
- https://cloudconvert.com/png-to-ico

**Recommended Settings:**
- Format: ICO (Windows Icon)
- Include sizes: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16
- Save as: `icon.ico`

### Step 2: Replace the Icon File

1. Copy your converted `icon.ico` file
2. Navigate to: `apps/workshop-ui/src-tauri/icons/`
3. Replace the existing `icon.ico` file with your new one

### Step 3: Build the App

```powershell
cd apps/workshop-ui
npm run build
```

This will:
- Compile the Rust backend
- Build the React frontend
- Create the Windows executable
- Embed your icon in the executable

### Step 4: Create Desktop Shortcut

```powershell
.\create-shortcuts.ps1
```

Or use the production shortcut script:

```powershell
.\create-desktop-shortcut.ps1
```

This will create:
- Desktop shortcut with your logo
- Start Menu shortcut with your logo

## Icon Requirements

### Windows Icon Format (.ico)

- **Format**: .ico (Windows Icon)
- **Location**: `apps/workshop-ui/src-tauri/icons/icon.ico`
- **Recommended sizes**: 
  - 256x256 (for high-DPI displays)
  - 128x128
  - 64x64
  - 48x48
  - 32x32
  - 16x16 (for small icons)

### Icon Tips

- **Square aspect ratio**: Icons should be square (1:1)
- **Transparency**: PNG with transparency works best
- **Background**: Use transparent background or solid color
- **Size**: Start with at least 256x256 pixels
- **Format**: Convert to .ico with multiple sizes embedded

## Using ImageMagick (Advanced)

If you have ImageMagick installed:

```powershell
magick convert your-logo.png -define icon:auto-resize=256,128,64,48,32,16 apps/workshop-ui/src-tauri/icons/icon.ico
```

## Testing Your Icon

1. **Build the app** to embed the icon in the executable
2. **Check the executable** - Right-click `REFORGE OS.exe` > Properties > Change Icon
3. **Verify shortcuts** - Desktop and Start Menu shortcuts should show your logo

## Troubleshooting

### Icon doesn't appear in shortcuts
- Make sure you've built the app after replacing the icon
- Check that `icon.ico` is in `src-tauri/icons/` directory
- Verify the .ico file has multiple sizes embedded

### Icon looks blurry
- Make sure your source image is at least 256x256 pixels
- Include all recommended sizes in the .ico file
- Use a high-quality source image

### Shortcut doesn't work
- Make sure you've built the app: `npm run build`
- Check that the executable exists in `src-tauri/target/release/`
- Verify the shortcut script ran successfully

---

**Note**: The icon is embedded in the executable during build, so you must rebuild after changing the icon file.
