# Bundle Python Runtime for REFORGE OS

## Overview

This guide explains how to bundle the Python runtime into the Tauri app so it runs standalone without requiring Python to be installed on the user's system.

---

## Step 1: Download Python Embeddable Package

### Windows

1. Go to: https://www.python.org/downloads/windows/
2. Scroll to "Windows embeddable package (64-bit)"
3. Download the latest Python 3.x embeddable package
4. Example: `python-3.12.0-embed-amd64.zip`

### macOS

1. Go to: https://www.python.org/downloads/mac-osx/
2. Download Python framework or use Homebrew
3. For bundling, you may need to create a custom Python distribution

---

## Step 2: Extract and Prepare Python

### Windows

```powershell
# 1. Extract the zip file
Expand-Archive python-3.12.0-embed-amd64.zip -DestinationPath temp-python

# 2. Create resources directory structure
New-Item -ItemType Directory -Force -Path "apps\workshop-ui\src-tauri\resources\python"

# 3. Copy Python files
Copy-Item -Path "temp-python\*" -Destination "apps\workshop-ui\src-tauri\resources\python\" -Recurse

# 4. Copy your Python app code
Copy-Item -Path "python\app" -Destination "apps\workshop-ui\src-tauri\resources\python\app\" -Recurse
```

### Structure After Copying

```
apps/workshop-ui/src-tauri/resources/python/
├── python.exe (or python3 on macOS)
├── python312.dll (Windows)
├── python312.zip
├── vcruntime140.dll (Windows)
├── app/
│   ├── main.py
│   ├── health.py
│   ├── inspect.py
│   ├── logs.py
│   ├── report.py
│   └── policy.py
└── ... (other Python files)
```

---

## Step 3: Update Tauri Configuration

Edit `apps/workshop-ui/src-tauri/tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "resources": [
        "python/**"
      ]
    }
  }
}
```

This tells Tauri to include the Python directory in the app bundle.

---

## Step 4: Update Launcher Code (if needed)

The launcher code in `apps/workshop-ui/src-tauri/src/launcher.rs` should already handle this:

- It looks for Python in `resource_dir/python/`
- Falls back to system Python in dev mode
- Uses `python.exe` on Windows, `python3` on macOS/Linux

---

## Step 5: Test Locally

### Development Mode

```powershell
cd apps/workshop-ui
npm run dev
```

The app should:
1. Launch Python backend automatically
2. Show health check passing
3. Unlock UI

### Production Build

```powershell
cd apps/workshop-ui
npm run build
```

This creates the installer with bundled Python.

---

## Step 6: Verify Bundle Contents

After building, check:

**Windows:**
```
src-tauri/target/release/bundle/msi/REFORGE OS_3.0.0_x64_en-US.msi
```

**macOS:**
```
src-tauri/target/release/bundle/macos/REFORGE OS.app/Contents/Resources/python/
```

The Python runtime should be included in the bundle.

---

## Troubleshooting

### Python Not Found

**Error:** "Failed to launch Python backend"

**Solution:**
- Check Python path in launcher.rs
- Verify Python files are in `resources/python/`
- Check Tauri config includes resources

### Port Already in Use

**Error:** "Port already in use"

**Solution:**
- Python worker uses auto-assign port (0)
- Should pick random available port
- Check if another instance is running

### Health Check Fails

**Error:** "Backend unhealthy"

**Solution:**
- Check Python app code for errors
- Verify `main.py` is correct
- Check Python can import modules
- Look at Python process output

---

## File Sizes

**Expected sizes:**
- Python embeddable: ~10-15 MB
- Your Python app: ~100 KB
- Total bundle increase: ~15-20 MB

**Final app size:**
- Base Tauri app: ~10-20 MB
- With Python: ~25-40 MB
- Still reasonable for desktop app

---

## Alternative: PyInstaller (Not Recommended)

You could use PyInstaller to create a single Python executable, but:

**Cons:**
- Larger file size
- Harder to audit
- Slower startup
- Less transparent

**Recommendation:** Use embedded Python runtime (as described above).

---

## Next Steps

After bundling:

1. ✅ Test locally
2. ✅ Build installer
3. ✅ Test on clean system
4. ✅ Verify Python launches
5. ✅ Verify health check works
6. ✅ Verify UI unlocks

---

**Once Python is bundled, the app is truly standalone!** 🚀
