# 🚀 Bobby's Workshop — Production Implementation Roadmap

**Goal:** Transform from development setup to production-ready one-click install with embedded backend.

---

## Current State Analysis

### ✅ What Already Works

1. **Tauri Integration:**
   - Tauri initialized and configured
   - Backend lifecycle management in Rust (`start_backend_server`, `stop_backend_server`)
   - Frontend builds to `dist/`
   - Icons configured

2. **Backend:**
   - Express server in `server/index.js`
   - Backend attempts to start from resource directory
   - Port management (currently fixed at 3001)

3. **Build System:**
   - `npm run build` builds frontend
   - `npm run tauri:build` builds Tauri app
   - Platform-specific build targets defined

### ❌ What's Missing

1. **Backend Bundling:**
   - Still requires Node.js installed separately
   - Server code not bundled in Tauri resources
   - `node_modules` not included

2. **Standalone Execution:**
   - User must install Node.js manually
   - Backend doesn't auto-start reliably
   - No health check before frontend connects

3. **Production Polish:**
   - No installer (.exe/.dmg/.AppImage)
   - No desktop shortcuts (relies on Tauri bundle)
   - No structured logging to user directory
   - No backend status UI indicator

---

## Implementation Strategy: Two-Phase Approach

### Phase 1: Quick Win — Bundle Node.js + Server (1-2 days)

**Objective:** Get it working with minimal changes.

**Steps:**

1. **Update Tauri config to include Node.js:**
   ```json
   // src-tauri/tauri.conf.json
   {
     "tauri": {
       "bundle": {
         "resources": [
           "nodejs/**/*",
           "server/**/*"
         ]
       }
     }
   }
   ```

2. **Update Rust code to use bundled Node.js:**
   ```rust
   // src-tauri/src/main.rs
   fn find_bundled_node() -> Option<PathBuf> {
       let resource_dir = app_handle.path_resolver().resource_dir()?;
       let node_exe = resource_dir.join("nodejs").join("node");
       // Platform-specific: .exe on Windows, no extension on Unix
       #[cfg(target_os = "windows")]
       let node_exe = node_exe.with_extension("exe");
       if node_exe.exists() {
           Some(node_exe)
       } else {
           None
       }
   }
   ```

3. **Script to bundle Node.js:**
   ```bash
   # scripts/bundle-nodejs.sh
   # Downloads Node.js for current platform and extracts to src-tauri/bundle/resources/nodejs/
   ```

4. **Copy server to resources:**
   ```bash
   # scripts/bundle-server.sh
   cp -r server src-tauri/bundle/resources/
   cd src-tauri/bundle/resources/server && npm install --production
   ```

**Pros:**
- ✅ Fast to implement
- ✅ No code changes needed
- ✅ Works immediately

**Cons:**
- ❌ Large bundle size (~100MB+ with Node.js)
- ❌ Still requires Node.js runtime

### Phase 2: Optimize — Compile Backend to Executable (3-5 days)

**Objective:** Smaller bundle, faster startup.

**Steps:**

1. **Use `pkg` to create executable:**
   ```bash
   npm install -g pkg
   pkg server/index.js --targets node18-win-x64,node18-macos-x64,node18-linux-x64 --output-path dist/backend
   ```

2. **Update Rust to use executable:**
   ```rust
   let backend_exe = resource_dir.join("backend");
   #[cfg(target_os = "windows")]
   let backend_exe = backend_exe.with_extension("exe");
   
   Command::new(&backend_exe)
       .arg("--port")
       .arg("0")
       .arg("--host")
       .arg("127.0.0.1")
       .spawn()?;
   ```

3. **Backend accepts CLI args:**
   ```javascript
   // server/index.js
   const args = process.argv.slice(2);
   const portArg = args.indexOf('--port');
   const port = portArg !== -1 ? parseInt(args[portArg + 1]) || 3001 : 3001;
   ```

**Pros:**
- ✅ Smaller bundle (~30-50MB)
- ✅ Faster startup
- ✅ Single executable

**Cons:**
- ❌ More complex build process
- ❌ Native modules may not bundle correctly

---

## Recommended Implementation: Phase 1 First

**Why:** Get it working quickly, optimize later.

### Step-by-Step: Phase 1 Implementation

#### Step 1: Create Bundle Scripts

**`scripts/bundle-nodejs.js`** (Node.js script to download and extract Node.js)

**`scripts/bundle-server.sh`** (Bash script to copy server code)

**`scripts/prepare-bundle.sh`** (Master script that runs both)

#### Step 2: Update Build Process

```json
// package.json
{
  "scripts": {
    "bundle:nodejs": "node scripts/bundle-nodejs.js",
    "bundle:server": "bash scripts/bundle-server.sh",
    "prepare:bundle": "npm run bundle:nodejs && npm run bundle:server",
    "tauri:build": "npm run build && npm run prepare:bundle && cargo tauri build"
  }
}
```

#### Step 3: Update Rust Code

Update `start_backend_server` to:
1. Try bundled Node.js first
2. Fall back to system Node.js (for development)
3. Use bundled server path

#### Step 4: Test on All Platforms

- Windows: `.exe` installer
- macOS: `.app` + `.dmg`
- Linux: `.AppImage`

---

## Phase 3: Production Polish (2-3 days)

### 1. Installer Configuration

**Tauri already handles this**, but verify:
- ✅ Desktop icons created
- ✅ Start menu entries (Windows/macOS)
- ✅ File associations (if needed)

### 2. Logging Infrastructure

**Add structured logging:**

```rust
// src-tauri/src/main.rs
use std::path::PathBuf;

fn get_log_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        dirs::data_local_dir()
            .unwrap()
            .join("BobbysWorkshop")
            .join("logs")
    }
    #[cfg(target_os = "macos")]
    {
        dirs::home_dir()
            .unwrap()
            .join("Library")
            .join("Logs")
            .join("BobbysWorkshop")
    }
    #[cfg(target_os = "linux")]
    {
        dirs::data_local_dir()
            .unwrap()
            .join("bobbys-workshop")
            .join("logs")
    }
}
```

**Backend logging:**
```javascript
// server/index.js
import fs from 'fs';
import path from 'path';

const logDir = process.env.BW_LOG_DIR || getLogDir(); // From Tauri
const logFile = path.join(logDir, 'backend.log');

const logger = {
  info: (msg) => {
    const line = `[${new Date().toISOString()}] INFO: ${msg}\n`;
    fs.appendFileSync(logFile, line);
    console.log(line.trim());
  },
  error: (msg) => {
    const line = `[${new Date().toISOString()}] ERROR: ${msg}\n`;
    fs.appendFileSync(logFile, line);
    console.error(line.trim());
  }
};
```

### 3. Backend Status UI

**Frontend component:**

```typescript
// src/components/BackendStatus.tsx
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function BackendStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [port, setPort] = useState<number | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const backendPort = await invoke<number>('get_backend_port');
        setPort(backendPort);
        
        const response = await fetch(`http://127.0.0.1:${backendPort}/api/health`);
        setStatus(response.ok ? 'connected' : 'disconnected');
      } catch {
        setStatus('disconnected');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm">
        Backend: {status === 'connected' ? `Connected (${port})` : 'Disconnected'}
      </span>
    </div>
  );
}
```

### 4. CI/CD Pipeline

**`.github/workflows/build-release.yml`:**

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
          - platform: 'macos-latest'
            target: 'x86_64-apple-darwin'
          - platform: 'ubuntu-latest'
            target: 'x86_64-unknown-linux-gnu'

    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm ci
          cd server && npm ci
      
      - name: Bundle Node.js and server
        run: npm run prepare:bundle
      
      - name: Build frontend
        run: npm run build
      
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
```

---

## Final Validation Checklist

### Fresh Machine Test (Each Platform)

- [ ] Download installer from GitHub Releases
- [ ] Run installer (one-click)
- [ ] Verify desktop icon created
- [ ] Double-click app icon
- [ ] Verify app opens
- [ ] Verify backend starts (check logs)
- [ ] Verify frontend connects (no connection errors)
- [ ] Test basic functionality (device scan, diagnostics)
- [ ] Close app
- [ ] Verify backend stops (no orphaned processes)
- [ ] Reopen app
- [ ] Verify clean restart (backend starts again)

### Production Readiness

- [ ] No console windows flashing
- [ ] No Node.js installation required
- [ ] Works offline (local services only)
- [ ] Logs accessible in user directory
- [ ] Backend status visible in UI
- [ ] Professional installer experience
- [ ] All features functional

---

## Timeline Estimate

- **Phase 1 (Bundle Node.js):** 1-2 days
- **Phase 2 (Compile to executable):** 3-5 days (future)
- **Phase 3 (Polish):** 2-3 days
- **Testing:** 1-2 days

**Total for Phase 1 + 3:** 4-7 days to production-ready

---

## Success Criteria

✅ User downloads installer  
✅ Clicks Install  
✅ Gets desktop icon  
✅ Double-click opens app  
✅ Backend starts automatically  
✅ Frontend connects to backend  
✅ No terminal, no npm, no node install  
✅ Works offline  
✅ Logs + health check built in  

**When all checked → Production ready** 🎉

