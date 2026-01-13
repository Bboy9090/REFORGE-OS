# Bundled Python Runtime Architecture

## Overview

REFORGE OS uses a **bundled Python runtime** with **auto-launcher** to create a truly standalone desktop application. This architecture ensures:

- ✅ Zero system dependencies (no "install Python first")
- ✅ Predictable behavior across all machines
- ✅ Contained execution (Python only runs while app runs)
- ✅ Policy enforcement (Rust owns authority, Python is worker)

---

## Architecture Layers

```
┌─────────────────────────────────────┐
│         Tauri UI (React)            │
│  - User interface                   │
│  - State display                    │
│  - User intent                      │
└──────────────┬──────────────────────┘
               │ HTTP (localhost)
               ▼
┌─────────────────────────────────────┐
│      Rust (Pandora/Crucible)        │
│  - Policy enforcement               │
│  - Workflow decisions               │
│  - Evidence integrity               │
│  - Python client                    │
└──────────────┬──────────────────────┘
               │ HTTP (127.0.0.1)
               ▼
┌─────────────────────────────────────┐
│    Python Worker (Bundled)          │
│  - Device probes                    │
│  - Log parsing                      │
│  - Report formatting                 │
│  - Stateless handlers                │
└─────────────────────────────────────┘
```

---

## Key Principles

### 1. Rust = Authority
- All policy decisions made in Rust
- Python never escalates permissions
- Python mirrors policy, never overrides

### 2. Python = Worker
- Stateless handlers only
- No device mutations
- No persistent state
- Returns observations only

### 3. Tauri = Container
- Manages Python lifecycle
- Auto-launches on app start
- Kills on app exit
- No background daemons

---

## Python Service API

### Endpoints

**GET /health**
- Returns: `{ status: "ok", version: "...", uptime_ms: ... }`
- Required for UI unlock

**POST /inspect/basic**
- Request: `{ device_id, platform, payload: { hints } }`
- Response: `{ ok: true, data: { activation_locked, mdm_enrolled, ... }, warnings: [] }`

**POST /inspect/deep**
- Request: `{ device_id, platform }`
- Response: `{ ok: true, data: { signals, notes }, warnings: [] }`

**POST /logs/collect**
- Request: `{ device_id, scope }`
- Response: `{ ok: true, data: { log_count } }`

**POST /report/format**
- Request: `{ report_id, format }`
- Response: `{ ok: true, data: { artifact } }`

### Hard Rules

❌ No "do this now" endpoints
❌ No direct device mutations
❌ No persistent state
✅ Stateless
✅ Deterministic
✅ Logged

---

## Rust → Python Client

### Type-Safe Contracts

```rust
pub struct PyInspectRequest<T> {
    pub device_id: String,
    pub platform: String,
    pub payload: T,
}

pub struct PyResponse<T> {
    pub ok: bool,
    pub data: Option<T>,
    pub warnings: Vec<String>,
}
```

### Enforcement Pattern

```rust
// 1. Policy check (Rust)
policy.ensure_allowed("inspect_basic")?;

// 2. Call Python
let flags = py_client.inspect_basic(device_id, platform).await?;

// 3. Store evidence (Rust)
audit.log("inspect_basic", &flags).await?;
```

**Policy is checked BEFORE the call.**
**Evidence is written AFTER the call.**

---

## Tauri Auto-Launcher

### Lifecycle

```
User clicks app
   ↓
Tauri starts
   ↓
Spawn Python (bundled)
   ↓
Wait for /health OK
   ↓
Enable UI
   ↓
User exits
   ↓
Kill Python
```

### Implementation

**Launch:**
```rust
let backend = PythonBackend::new();
let port = backend.launch(&resource_dir)?;
```

**Shutdown:**
```rust
backend.shutdown(); // Called on app exit
```

### Port Management

- Python worker picks random available port
- Prints port to stdout
- Tauri reads port from stdout
- Port stored in app state

---

## UI Health Gating

### States

- **BOOTING**: Splash screen + spinner
- **READY**: Full navigation enabled
- **FAILED**: Locked screen with retry

### Implementation

```tsx
<BackendHealthGate>
  <App />
</BackendHealthGate>
```

**UI cannot bypass this gate.**

---

## Bundling Python Runtime

### Structure

```
app/
├── python/
│   ├── bin/
│   │   └── python (or python.exe)
│   ├── app/
│   │   ├── main.py
│   │   ├── health.py
│   │   ├── inspect.py
│   │   ├── logs.py
│   │   ├── report.py
│   │   └── policy.py
│   └── requirements.txt
└── resources/
```

### What Gets Bundled

✅ Python executable
✅ Required stdlib
✅ Only packages you use
✅ Your service entry script

### What Does NOT Get Bundled

❌ Pip
❌ Dev tools
❌ Interactive REPL
❌ User scripts

---

## Build Process

### 1. Prepare Python Runtime

```bash
# Create embedded Python distribution
# (Use Python embeddable package or build custom)
```

### 2. Bundle Python Files

```bash
# Copy Python runtime to app resources
# Copy your Python app code
```

### 3. Build Tauri App

```bash
cd apps/workshop-ui
npm run build
```

### 4. Package Installer

```bash
# MSI (Windows) or DMG (macOS)
# Includes Python runtime
```

---

## Security Model

### Containment

- Python binds to 127.0.0.1 only
- No external network access
- No shell access
- No user scripts

### Authority

- Rust owns policy
- Python mirrors policy
- Python never escalates
- UI never executes

### Evidence

- All operations logged
- Audit trail in Rust
- Python operations tracked
- No silent failures

---

## Operational Benefits

✅ **Support tickets drop** (no env issues)
✅ **Demos "just work"**
✅ **CI builds are reproducible**
✅ **Audits are easier**
✅ **Swap Python internals without touching UI**

---

## Next Steps

1. ✅ Python service API defined
2. ✅ Rust client implemented
3. ✅ Tauri launcher created
4. ✅ UI health gating added
5. ⏳ Bundle Python runtime
6. ⏳ Test end-to-end
7. ⏳ Create installer

---

**This architecture doesn't make you "less powerful."**
**It makes you unbreakable—technically, legally, and operationally.**
