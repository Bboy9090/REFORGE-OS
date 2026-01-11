# 🧱 Bobby's Workshop — LEGENDARY Implementation Plan

**Goal:** One-click install. No building. Desktop icons. Backend + frontend fused. macOS / Windows / Linux standalone apps. Production-ready.

---

## PHASE 0 — Define "DONE" (Non-Negotiable)

The app is **DONE** only when all of this is true:

✅ User downloads installer  
✅ Clicks Install  
✅ Gets desktop icon  
✅ Double-click opens app  
✅ Backend starts automatically  
✅ Frontend connects to backend  
✅ No terminal, no npm, no node install  
✅ Works offline (local services)  
✅ Logs + health check built in  

**If any of those are missing → not done**

---

## PHASE 1 — Lock the Architecture (Stop the Bleeding)

### 1.1 Canonical Stack (FREEZE THIS)

**Frontend:** React + Vite  
**Backend:** Node.js (Express)  
**Desktop Shell:** Tauri (preferred)  
**Build System:** GitHub Actions  
**Installer:**
- Windows → .exe (NSIS or MSI via Tauri)
- macOS → .dmg + .app (via Tauri)
- Linux → .AppImage or .deb (via Tauri)

**No more experiments. This is the spine.**

### 1.2 Current State Analysis

**What Exists:**
- ✅ Tauri initialized (`src-tauri/`)
- ✅ Backend in `server/` directory
- ✅ Frontend in `src/` directory
- ✅ Vite build system
- ✅ Express backend server

**What's Missing:**
- ❌ Backend embedded in Tauri bundle
- ❌ Auto-start backend on app launch
- ❌ Backend lifecycle management (start/stop)
- ❌ Single-file backend executable
- ❌ Production build pipeline
- ❌ Installer generation
- ❌ Desktop icon and shortcuts

---

## PHASE 2 — Convert Backend into an Embedded Service

### 2.1 Problem Today

Your backend runs like a dev server:
- Requires Node.js installed
- Requires `npm install`
- Requires `npm run server:start`
- Runs separately from frontend
- No lifecycle management

### 2.2 Fix: Bundle Backend with Tauri

**Current State:**
- ✅ Backend lifecycle management exists in `src-tauri/src/main.rs` (`start_backend_server`, `stop_backend_server`)
- ✅ Backend already attempts to load from resource directory
- ❌ Still requires Node.js to be installed separately
- ❌ Backend not bundled as executable

**Actions:**

**Option A: Bundle Node.js Runtime (Recommended for v1)**

1. **Bundle Node.js with Tauri resources:**
   - Download Node.js binaries for each platform (Windows/macOS/Linux)
   - Include in `src-tauri/bundle/resources/`
   - Update Rust code to use bundled Node.js

2. **Bundle server code:**
   - Copy `server/` directory to `src-tauri/bundle/resources/server/`
   - Include all dependencies (node_modules or bundled)

**Option B: Compile Backend to Executable (Future v2)**

1. **Use `pkg` to create single executable:**
   ```bash
   pkg server/index.js --targets node18-win-x64,node18-macos-x64,node18-linux-x64 --output-path src-tauri/bundle/resources/
   ```

2. **Update Rust to use executable:**
   ```rust
   let backend_exe = resource_dir.join("backend");
   Command::new(&backend_exe)
       .arg("--port")
       .arg("0")
       .spawn()?;
   ```

**Recommendation:** Start with Option A (simpler, faster), migrate to Option B later (smaller bundle size).

3. **Backend Requirements:**
   - Listen on `127.0.0.1:PORT` (not `0.0.0.0`)
   - Port auto-assigned or locked via config
   - `/health` endpoint (already exists ✅)
   - Structured logs to `~/BobbysWorkshop/logs`
   - Graceful shutdown on app exit
   - No CLI assumptions
   - No environment variable reliance (except for optional config)

### 2.3 Backend Port Management

**Strategy:**
- Try port 3001 (default)
- If busy, try 3002, 3003, etc. (up to 3010)
- Store port in Tauri store/config
- Frontend reads port from Tauri store

---

## PHASE 3 — Tauri Integration (This Is the Missing Link)

### 3.1 Current Tauri Setup

**What Exists:**
- ✅ `src-tauri/tauri.conf.json` - Basic config
- ✅ `src-tauri/src/main.rs` - Rust entry point
- ✅ `src-tauri/Cargo.toml` - Rust dependencies
- ✅ Tauri commands defined

**What's Missing:**
- ❌ Backend startup on app init
- ❌ Backend shutdown on app exit
- ❌ Port management
- ❌ Backend health monitoring

### 3.2 Tauri Configuration Updates

**Update `src-tauri/tauri.conf.json`:**
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": ["app", "dmg", "msi", "appimage", "deb"],
      "identifier": "com.bobby.workshop",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "resources": [],
      "copyright": "",
      "category": "DeveloperTool",
      "shortDescription": "Bobby's Workshop - Device Flashing & Diagnostics",
      "longDescription": "Professional device flashing and diagnostics tool"
    },
    "security": {
      "csp": null
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "Bobby's Workshop",
        "width": 1400,
        "height": 900,
        "minWidth": 800,
        "minHeight": 600
      }
    ],
    "systemTray": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true,
      "menuOnLeftClick": false
    }
  }
}
```

### 3.3 Rust Backend Management

**Add to `src-tauri/src/main.rs`:**

```rust
use tauri::{Manager, State};
use std::sync::{Arc, Mutex};
use std::process::{Child, Command};
use std::path::PathBuf;

struct BackendState {
    process: Arc<Mutex<Option<Child>>>,
    port: Arc<Mutex<Option<u16>>>,
}

#[tauri::command]
async fn start_backend(state: State<'_, BackendState>) -> Result<u16, String> {
    let mut process = state.process.lock().unwrap();
    
    if process.is_some() {
        return Err("Backend already running".to_string());
    }
    
    // Get backend executable path (bundled with app)
    let backend_path = get_backend_executable_path()?;
    
    // Start backend process
    let child = Command::new(&backend_path)
        .arg("--port")
        .arg("0") // Auto-assign port
        .arg("--host")
        .arg("127.0.0.1")
        .spawn()
        .map_err(|e| format!("Failed to start backend: {}", e))?;
    
    *process = Some(child);
    
    // Wait for backend to start and read port from stdout/log
    let port = wait_for_backend_port().await?;
    
    let mut port_state = state.port.lock().unwrap();
    *port_state = Some(port);
    
    Ok(port)
}

#[tauri::command]
async fn stop_backend(state: State<'_, BackendState>) -> Result<(), String> {
    let mut process = state.process.lock().unwrap();
    
    if let Some(mut child) = process.take() {
        child.kill().map_err(|e| format!("Failed to stop backend: {}", e))?;
        child.wait().ok();
    }
    
    let mut port = state.port.lock().unwrap();
    *port = None;
    
    Ok(())
}

#[tauri::command]
async fn get_backend_port(state: State<'_, BackendState>) -> Result<Option<u16>, String> {
    let port = state.port.lock().unwrap();
    Ok(*port)
}

fn get_backend_executable_path() -> Result<PathBuf, String> {
    // In production: bundled executable
    // In dev: node server/index.js
    if cfg!(dev) {
        Ok(PathBuf::from("node"))
    } else {
        // Get resource path for bundled backend
        let exe_path = std::env::current_exe()
            .map_err(|e| format!("Failed to get executable path: {}", e))?;
        let exe_dir = exe_path.parent()
            .ok_or("Failed to get executable directory")?;
        Ok(exe_dir.join("backend").join("server"))
    }
}

fn main() {
    tauri::Builder::default()
        .manage(BackendState {
            process: Arc::new(Mutex::new(None)),
            port: Arc::new(Mutex::new(None)),
        })
        .setup(|app| {
            // Start backend on app startup
            let app_handle = app.handle();
            let state = app.state::<BackendState>();
            
            // Start backend in background
            tauri::async_runtime::spawn(async move {
                if let Ok(port) = start_backend(state).await {
                    println!("Backend started on port {}", port);
                    app_handle.emit_all("backend-started", port).ok();
                }
            });
            
            Ok(())
        })
        .on_window_event(|event| {
            // Stop backend on app close
            if let tauri::WindowEvent::CloseRequested { .. } = event.event() {
                // Stop backend
            }
        })
        .invoke_handler(tauri::generate_handler![
            start_backend,
            stop_backend,
            get_backend_port
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 3.4 Frontend ↔ Backend Contract

**Update `src/lib/apiConfig.ts`:**

```typescript
// Get backend port from Tauri
let API_PORT = 3001; // default

if (window.__TAURI__) {
  // In Tauri app, get port from Rust
  const { invoke } = await import('@tauri-apps/api/core');
  const port = await invoke<number>('get_backend_port');
  if (port) {
    API_PORT = port;
  }
}

export const API_CONFIG = {
  BASE_URL: `http://127.0.0.1:${API_PORT}`,
  // ... rest
};
```

---

## PHASE 4 — Production Builds (No "npm run dev" Ever Again)

### 4.1 Frontend Build

**Already exists:**
```json
"build": "tsc -b --noCheck && vite build"
```

**Output:** Static assets in `dist/`

### 4.2 Backend Compilation

**Options:**

**Option A: Bundle with `pkg` (Simplest)**
```json
"build:backend": "pkg server/index.js --targets node18-win-x64,node18-macos-x64,node18-linux-x64 --output-path dist/backend"
```

**Option B: Bundle with `esbuild` (Lighter)**
```json
"build:backend": "esbuild server/index.js --bundle --platform=node --target=node18 --outfile=dist/backend/server --external:*.node"
```

**Option C: Keep as Node.js (Bundle Node.js runtime)**
- Bundle Node.js runtime with backend
- Use Tauri's resource bundling
- Larger but more compatible

**Recommendation:** Option A (pkg) for v1, Option B (esbuild) for v2

### 4.3 Tauri Bundle Configuration

**Update `src-tauri/Cargo.toml`:**

```toml
[build-dependencies]
tauri-bundle = { version = "1.5", features = ["msi", "appimage", "deb"] }
```

**Build commands:**

```json
"tauri:build": "npm run build && npm run build:backend && cargo tauri build",
"tauri:build:windows": "cargo tauri build --target x86_64-pc-windows-msvc",
"tauri:build:macos": "cargo tauri build --target x86_64-apple-darwin",
"tauri:build:linux": "cargo tauri build --target x86_64-unknown-linux-gnu"
```

### 4.4 Build Outputs

**After `npm run tauri:build`:**

**Windows:**
- `src-tauri/target/release/bobbys-workshop.exe`
- `src-tauri/target/release/bundle/msi/bobbys-workshop_1.0.0_x64_en-US.msi`

**macOS:**
- `src-tauri/target/release/bundle/macos/BobbysWorkshop.app`
- `src-tauri/target/release/bundle/dmg/BobbysWorkshop_1.0.0_x64.dmg`

**Linux:**
- `src-tauri/target/release/bundle/appimage/bobbys-workshop_1.0.0_amd64.AppImage`
- `src-tauri/target/release/bundle/deb/bobbys-workshop_1.0.0_amd64.deb`

---

## PHASE 5 — Installers & Polish (Professional Grade)

### 5.1 Required Polish

**App Icon:**
- ✅ Already have assets in `src-tauri/icons/`
- Ensure all sizes present (32x32, 128x128, 256x256, 512x512, icns, ico)

**Desktop Shortcut:**
- ✅ Handled by Tauri bundle
- Ensure `tauri.conf.json` bundle config is correct

**Start Menu Entry:**
- ✅ Handled by Tauri bundle (Windows/macOS)

**Logs Folder:**
```rust
// In Rust code
let log_dir = dirs::data_dir()
    .unwrap()
    .join("BobbysWorkshop")
    .join("logs");
std::fs::create_dir_all(&log_dir)?;
```

**Backend Logs:**
```javascript
// server/index.js
import { app } from '@tauri-apps/api/path';
const logDir = await app.logDir();
const logFile = path.join(logDir, 'backend.log');
// Use winston or similar for structured logging
```

### 5.2 Optional but Recommended

**Crash Reporter:**
- Use Tauri's built-in crash reporting
- Or integrate Sentry

**First-Run Wizard:**
- Check if config exists
- Show setup wizard if first run
- Store config in Tauri store

**Backend Status UI Badge:**
```typescript
// Frontend component
const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected'>('disconnected');

useEffect(() => {
  const checkHealth = async () => {
    try {
      const response = await fetch('http://127.0.0.1:${port}/api/health');
      setBackendStatus(response.ok ? 'connected' : 'disconnected');
    } catch {
      setBackendStatus('disconnected');
    }
  };
  
  const interval = setInterval(checkHealth, 5000);
  return () => clearInterval(interval);
}, [port]);
```

---

## PHASE 6 — CI/CD (One Button Legendary)

### 6.1 GitHub Actions Pipeline

**Create `.github/workflows/build-release.yml`:**

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        include:
          - platform: 'windows-latest'
            target: 'x86_64-pc-windows-msvc'
            artifact: '*.msi'
          - platform: 'macos-latest'
            target: 'x86_64-apple-darwin'
            artifact: '*.dmg'
          - platform: 'ubuntu-latest'
            target: 'x86_64-unknown-linux-gnu'
            artifact: '*.AppImage'

    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm ci
          cd server && npm ci
      
      - name: Build frontend
        run: npm run build
      
      - name: Build backend
        run: npm run build:backend
      
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}
      
      - name: Build Tauri
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          projectPath: .
          tagName: ${{ github.ref_name }}
          releaseName: 'Bobby\'s Workshop ${{ github.ref_name }}'
          releaseBody: 'See the assets to download and install this version.'
          releaseDraft: true
          releasePrerelease: false
          args: --target ${{ matrix.target }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.platform }}-artifacts
          path: |
            src-tauri/target/${{ matrix.target }}/release/bundle/**
            !src-tauri/target/${{ matrix.target }}/release/bundle/**/*.debug
```

### 6.2 Release Process

1. Tag release: `git tag v1.0.0 && git push origin v1.0.0`
2. GitHub Actions builds all platforms
3. Creates GitHub Release with artifacts
4. Download and install on fresh machines to test

---

## PHASE 7 — Implementation Checklist

### Phase 2: Backend Embedding
- [ ] Move backend entry point to `src-tauri/src/backend/index.js`
- [ ] Export `startBackend(port)` and `stopBackend(server)` functions
- [ ] Update backend to use `127.0.0.1` binding
- [ ] Add port auto-assignment logic
- [ ] Add structured logging to `~/BobbysWorkshop/logs`
- [ ] Test backend starts/stops cleanly

### Phase 3: Tauri Integration
- [ ] Update `tauri.conf.json` with bundle config
- [ ] Add backend state management to `main.rs`
- [ ] Add `start_backend` Tauri command
- [ ] Add `stop_backend` Tauri command
- [ ] Add `get_backend_port` Tauri command
- [ ] Update frontend `apiConfig.ts` to use Tauri port
- [ ] Test backend auto-starts on app launch
- [ ] Test backend stops on app exit

### Phase 4: Production Builds
- [ ] Add `build:backend` script (pkg or esbuild)
- [ ] Update `tauri:build` to build backend first
- [ ] Configure Tauri to bundle backend executable
- [ ] Test Windows build (`npm run tauri:build:windows`)
- [ ] Test macOS build (`npm run tauri:build:macos`)
- [ ] Test Linux build (`npm run tauri:build:linux`)
- [ ] Verify all platforms produce installers

### Phase 5: Polish
- [ ] Verify app icons are bundled
- [ ] Test desktop shortcut creation
- [ ] Test start menu entry (Windows/macOS)
- [ ] Implement logs folder (`~/BobbysWorkshop/logs`)
- [ ] Add backend status UI badge
- [ ] (Optional) Add crash reporter
- [ ] (Optional) Add first-run wizard

### Phase 6: CI/CD
- [ ] Create `.github/workflows/build-release.yml`
- [ ] Test workflow on tag push
- [ ] Verify all platform artifacts are created
- [ ] Test installer on fresh VMs

### Phase 7: Final Validation
- [ ] Fresh Windows VM test (no Node installed)
- [ ] Fresh macOS VM test (no Node installed)
- [ ] Fresh Linux VM test (no Node installed)
- [ ] Install → launch → works
- [ ] Backend auto-starts
- [ ] API responds
- [ ] Close app → backend stops
- [ ] Reopen → clean restart
- [ ] No console windows flashing
- [ ] Desktop icon present

---

## PHASE 8 — Migration Path (No Breaking Changes)

### Development Workflow

**Keep existing dev workflow:**
```json
"dev": "vite",
"server:dev": "cd server && npm run dev"
```

**Add new production build:**
```json
"build:all": "npm run build && npm run build:backend",
"tauri:dev": "cargo tauri dev",
"tauri:build": "npm run build:all && cargo tauri build"
```

### Backend Dual Mode

**Backend can run in two modes:**

1. **Standalone mode** (current):
   - `node server/index.js`
   - For development
   - Existing workflow preserved

2. **Embedded mode** (new):
   - Bundled executable
   - Started by Tauri
   - For production

**Backend code detects mode:**
```javascript
const isEmbedded = process.env.EMBEDDED === 'true' || !process.argv.includes('--standalone');
```

---

## Estimated Timeline

- **Phase 2 (Backend Embedding):** 2-3 days
- **Phase 3 (Tauri Integration):** 3-4 days
- **Phase 4 (Production Builds):** 2-3 days
- **Phase 5 (Polish):** 2-3 days
- **Phase 6 (CI/CD):** 1-2 days
- **Phase 7 (Testing):** 2-3 days

**Total: 12-18 days** for production-ready one-click install

---

## Success Criteria

✅ User can download installer from GitHub Releases  
✅ One-click install creates desktop icon  
✅ Double-click launches app  
✅ Backend starts automatically (no terminal)  
✅ Frontend connects to backend  
✅ App works on fresh machine (no Node.js required)  
✅ All features functional  
✅ Professional installer experience  
✅ Works offline  
✅ Logs accessible  

**When all checked → LEGENDARY status achieved** 🏆

