# 🗺️ SECRET ROOMS INTEGRATION MAP

## Current Architecture

```
Bobby's Workshop (Main App)
│
├── Public Features
│   ├── Device Detection
│   ├── Fastboot Flashing
│   ├── ADB Operations
│   └── Firmware Management
│
└── Secret Rooms (Trapdoor API)
    │
    ├── 🔓 Unlock Chamber (Existing)
    │   └── FRP Bypass, Bootloader Unlock
    │
    ├── ⚡ Flash Forge (Existing)
    │   └── Multi-brand flashing operations
    │
    ├── 📱 Jailbreak Sanctum (Existing)
    │   └── iOS jailbreak automation
    │
    ├── 🛡️ Root Vault (Existing)
    │   └── Root installation & management
    │
    ├── 🔧 Bypass Laboratory (Existing)
    │   └── Security bypasses
    │
    ├── ⚙️ Workflow Engine (Existing)
    │   └── Automated workflows
    │
    ├── 📚 Shadow Archive (Existing)
    │   └── Audit logs & history
    │
    ├── 🎵 Sonic Codex (NEW - Room #8)
    │   ├── Audio Capture (Live/File/URL)
    │   ├── Forensic Enhancement
    │   ├── Whisper Transcription
    │   ├── Speaker Diarization
    │   └── Export Package
    │
    ├── 👻 Ghost Codex (NEW - Room #9)
    │   ├── Metadata Shredder
    │   ├── Canary Tokens
    │   ├── Burner Personas
    │   └── Hidden Partitions
    │
    └── ⚡ Pandora Codex (ENHANCEMENT)
        ├── Chain-Breaker UI
        ├── DFU Detection
        └── Hardware Manipulation
```

---

## 🔐 Authentication Flow

```
User → Phoenix Key Sequence → Trapdoor API → Secret Room Access
         (Secret Gesture)      (X-Secret-Room-Passcode)
```

### Phoenix Key Requirements
- Secret sequence of clicks/gestures
- Token-based session
- Auto-logout after inactivity
- Required for ALL secret rooms

---

## 🔄 Data Flow: Sonic Codex

```
┌─────────────────┐
│  User Uploads   │
│  Audio/Video     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI        │
│  Backend        │
│  (Python)       │
└────────┬────────┘
         │
         ├──► Pre-Processing (Spectral Gating)
         ├──► Enhancement (Consonant Boost)
         ├──► Whisper Transcription
         ├──► Speaker Diarization
         └──► Translation (if needed)
         │
         ▼
┌─────────────────┐
│  Job Storage    │
│  /jobs/{id}/    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WebSocket      │
│  Updates        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React UI       │
│  (Review/Export)│
└─────────────────┘
```

---

## 🔄 Data Flow: Ghost Codex

```
┌─────────────────┐
│  User Uploads   │
│  File/Folder    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Metadata       │
│  Shredder       │
│  (FFmpeg/PIL)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Clean File     │
│  (No Metadata)  │
└─────────────────┘

┌─────────────────┐
│  Canary Token   │
│  Generator      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Bait File      │
│  Created        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Alert Endpoint │
│  (When Opened)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Alert Log      │
│  (IP, Device)   │
└─────────────────┘
```

---

## 🔄 Data Flow: Pandora Codex (Chain-Breaker)

```
┌─────────────────┐
│  USB Bus         │
│  Scanner         │
│  (PyUSB)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Device         │
│  Detection      │
│  (DFU/Recovery) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WebSocket      │
│  Stream         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Chain-Breaker  │
│  UI             │
│  (React)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Exploit        │
│  Execution      │
│  (Jailbreak)    │
└─────────────────┘
```

---

## 🔗 Cross-Room Integration Points

### 1. Sonic Codex → Ghost Codex
- **Use Case**: After transcription, shred metadata from exported files
- **Integration**: Export button → Ghost Codex shredder
- **Flow**: `Sonic Export → Ghost Shred → Clean Package`

### 2. Pandora Codex → Sonic Codex
- **Use Case**: After jailbreak, pull raw audio from device
- **Integration**: Device access → Audio extraction → Sonic processing
- **Flow**: `Jailbreak → Root Access → Audio Pull → Sonic Transcription`

### 3. Ghost Codex → All Rooms
- **Use Case**: Protect all exports with metadata stripping
- **Integration**: Universal "Ghost Shred" option in export dialogs
- **Flow**: `Any Export → Ghost Shred Option → Clean File`

### 4. Shadow Archive → All Rooms
- **Use Case**: Log all secret room operations
- **Integration**: Every action logged to Shadow Archive
- **Flow**: `Any Operation → Shadow Log → Encrypted Audit Trail`

---

## 📁 File Structure

```
Bobbys-Workshop--3.0.0/
│
├── backend/                    # NEW: Python FastAPI backend
│   ├── modules/
│   │   ├── sonic/
│   │   │   ├── capture.py
│   │   │   ├── upload.py
│   │   │   ├── extractor.py
│   │   │   ├── enhancement/
│   │   │   │   ├── preprocess.py
│   │   │   │   ├── consonant_boost.py
│   │   │   │   ├── presets.py
│   │   │   │   └── deepfilter.py
│   │   │   ├── transcription/
│   │   │   │   ├── whisper_engine.py
│   │   │   │   ├── language_detector.py
│   │   │   │   ├── diarization.py
│   │   │   │   └── vad.py
│   │   │   ├── job_manager.py
│   │   │   ├── storage.py
│   │   │   ├── naming.py
│   │   │   ├── manifest.py
│   │   │   └── exporter.py
│   │   ├── ghost/
│   │   │   ├── shredder.py
│   │   │   ├── canary.py
│   │   │   ├── persona.py
│   │   │   └── hidden_partition.py
│   │   └── pandora/
│   │       ├── detector.py
│   │       └── websocket.py
│   └── main.py                 # FastAPI app
│
├── frontend/
│   └── src/
│       └── components/
│           ├── sonic/
│           │   ├── WizardFlow.tsx
│           │   ├── LiveCapture.tsx
│           │   ├── FileUpload.tsx
│           │   ├── URLPull.tsx
│           │   ├── JobLibrary.tsx
│           │   ├── JobDetails.tsx
│           │   ├── Spectrogram.tsx
│           │   ├── Waveform.tsx
│           │   ├── ProgressMonitor.tsx
│           │   └── AudioComparison.tsx
│           ├── ghost/
│           │   ├── GhostDashboard.tsx
│           │   ├── ShredderInterface.tsx
│           │   ├── CanaryDashboard.tsx
│           │   └── PersonaVault.tsx
│           └── pandora/
│               ├── ChainBreakerDashboard.tsx
│               ├── DevicePulse.tsx
│               ├── ExploitSelector.tsx
│               ├── ConsoleLog.tsx
│               └── SafetyInterlock.tsx
│
├── server/                      # Existing: Node.js Express
│   └── routes/
│       └── v1/
│           └── trapdoor/
│               ├── sonic.js    # NEW
│               ├── ghost.js    # NEW
│               └── pandora.js  # ENHANCED
│
├── jobs/                        # NEW: Job storage
│   └── {job_id}/
│       ├── manifest.json
│       ├── original.{ext}
│       ├── enhanced.wav
│       ├── transcript_*.json
│       └── {name}_FORENSIC_PACKAGE.zip
│
└── requirements.txt             # NEW: Python dependencies
```

---

## 🔌 API Endpoint Map

### Sonic Codex
```
POST   /api/v1/trapdoor/sonic/upload
POST   /api/v1/trapdoor/sonic/extract
POST   /api/v1/trapdoor/sonic/capture/start
GET    /api/v1/trapdoor/sonic/jobs
GET    /api/v1/trapdoor/sonic/jobs/:jobId
GET    /api/v1/trapdoor/sonic/jobs/:jobId/download
WS     /api/v1/trapdoor/sonic/ws/:jobId
```

### Ghost Codex
```
POST   /api/v1/trapdoor/ghost/shred
POST   /api/v1/trapdoor/ghost/canary/generate
GET    /api/v1/trapdoor/ghost/trap/:tokenId
GET    /api/v1/trapdoor/ghost/alerts
POST   /api/v1/trapdoor/ghost/persona/create
GET    /api/v1/trapdoor/ghost/personas
```

### Pandora Codex (Enhanced)
```
GET    /api/v1/trapdoor/pandora/hardware/status
POST   /api/v1/trapdoor/pandora/enter-dfu
POST   /api/v1/trapdoor/pandora/jailbreak
POST   /api/v1/trapdoor/pandora/flash
WS     /api/v1/trapdoor/pandora/hardware/stream
```

---

## 🎨 UI Navigation Flow

```
Main Dashboard
    │
    ├──► Secret Rooms (Trapdoor)
    │       │
    │       ├──► Unlock Chamber
    │       ├──► Flash Forge
    │       ├──► Jailbreak Sanctum
    │       ├──► Root Vault
    │       ├──► Bypass Laboratory
    │       ├──► Workflow Engine
    │       ├──► Shadow Archive
    │       ├──► 🎵 Sonic Codex (NEW)
    │       │       ├──► Wizard Flow
    │       │       ├──► Job Library
    │       │       └──► Job Details
    │       ├──► 👻 Ghost Codex (NEW)
    │       │       ├──► Shredder
    │       │       ├──► Canary Tokens
    │       │       └──► Persona Vault
    │       └──► ⚡ Pandora Codex (ENHANCED)
    │               └──► Chain-Breaker UI
    │
    └──► Public Features
            ├──► Device Detection
            ├──► Fastboot
            └──► ADB
```

---

## 🔒 Security Layers

```
Layer 1: Phoenix Key
    │
    ▼
Layer 2: Trapdoor API Authentication
    │ (X-Secret-Room-Passcode)
    ▼
Layer 3: Room-Specific Security
    │
    ├──► Sonic Codex: Job encryption (AES-256)
    ├──► Ghost Codex: MAC address lock
    └──► Pandora Codex: Safety interlock (3-sec hold)
    │
    ▼
Layer 4: Shadow Archive
    │ (All actions logged)
    ▼
Audit Trail
```

---

## 📊 State Management (Zustand)

```typescript
// Stores
useAuthStore          // Phoenix Key status
useDeviceStore        // Active device info
useSonicJobStore      // Sonic Codex jobs
useGhostAlertStore    // Ghost Codex alerts
usePandoraDeviceStore // Pandora hardware status
```

---

## 🚀 Deployment Considerations

### Development
- Python backend: `uvicorn backend.main:app --reload`
- Node.js backend: `npm run server:dev`
- Frontend: `npm run dev`

### Production
- Python backend: Gunicorn + Uvicorn workers
- Node.js backend: PM2 or systemd
- Frontend: Static build served by Nginx

### Dependencies
- **System**: FFmpeg, PortAudio, LibUSB
- **Python**: See `requirements.txt`
- **Node.js**: See `package.json`

---

**This map shows how all the pieces fit together in Bobby's Workshop.** 🗺️
