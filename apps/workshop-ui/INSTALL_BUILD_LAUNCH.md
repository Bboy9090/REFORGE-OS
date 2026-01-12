# Install, Build & Launch REFORGE OS

## Quick Start

To install dependencies, build the app, and launch it:

```powershell
cd apps/workshop-ui

# Option 1: Use the script (recommended)
.\install-build-launch.ps1

# Option 2: Manual steps
npm install
npm run vite:build
cd src-tauri
cargo build --release
cd ..
# Then start backend API and launch the executable
```

---

## Step-by-Step Guide

### Step 1: Install Dependencies

```powershell
cd apps/workshop-ui
npm install
```

This installs all npm packages defined in `package.json`.

### Step 2: Build Frontend (Vite)

```powershell
npm run vite:build
```

This builds the React frontend and outputs to `dist/` directory.

### Step 3: Build Tauri App (Rust)

**Option A: Using npm script (may have issues):**
```powershell
npm run tauri:build
```

**Option B: Direct cargo build (recommended):**
```powershell
cd src-tauri
cargo build --release
cd ..
```

The executable will be at: `src-tauri/target/release/workshop-ui.exe`

### Step 4: Start Backend API

In a separate terminal:

```powershell
cd api
python -m uvicorn main:app --port 8001
```

Keep this terminal open - the backend needs to keep running.

### Step 5: Launch the App

**Option A: Desktop Shortcut (if created):**
- Double-click "REFORGE OS" desktop shortcut

**Option B: Direct Launch:**
```powershell
cd apps/workshop-ui
.\src-tauri\target\release\workshop-ui.exe
```

**Option C: Use Launcher Script:**
```powershell
cd apps/workshop-ui
.\start-reforge-os.ps1
```

---

## Troubleshooting

### Build Fails with "Input watch path" Error

If `npm run tauri:build` fails, use direct cargo build:
```powershell
cd src-tauri
cargo build --release
```

### Build Fails with "invalid character ' ' in crate name"

This was fixed in `Cargo.toml`. The binary name cannot have spaces. The `[[bin]]` section has been removed - Tauri handles the binary naming via `tauri.conf.json`.

### White Screen After Launch

The app requires the backend API to be running:

1. Start backend API:
   ```powershell
   cd api
   python -m uvicorn main:app --port 8001
   ```

2. Refresh or restart the app window

### Executable Not Found

After building, check:
- Location: `apps/workshop-ui/src-tauri/target/release/workshop-ui.exe`
- Make sure build completed successfully (check for errors)
- On Windows, the executable is `.exe`, on macOS it's in `.app` bundle

---

## Development Mode

For development with hot reload:

**Terminal 1 - Backend:**
```powershell
cd api
python -m uvicorn main:app --port 8001 --reload
```

**Terminal 2 - Frontend:**
```powershell
cd apps/workshop-ui
npm run dev
```

This starts Tauri in dev mode with hot reload enabled.

---

## Production Build Summary

After successful build:

- ✅ Frontend: `apps/workshop-ui/dist/`
- ✅ Executable: `apps/workshop-ui/src-tauri/target/release/workshop-ui.exe`
- ✅ Backend: `api/main.py` (must be running)

All three components are needed for the app to work:
1. **Backend API** (FastAPI on port 8001)
2. **Frontend Build** (React/Vite in `dist/`)
3. **Tauri Executable** (Rust binary)

---

**Note**: The app uses JSON files for storage (no database required).
