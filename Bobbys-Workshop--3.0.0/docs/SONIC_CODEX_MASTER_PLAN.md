# 🎯 SONIC CODEX & SECRET ROOMS - MASTER IMPLEMENTATION PLAN

## 📋 Executive Summary

This document breaks down all tasks, features, and requirements from the Sonic Codex / Super Sonic Codex specification into organized, actionable items for each Secret Room in Bobby's Workshop.

---

## 🏗️ ARCHITECTURE OVERVIEW

### Current Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js/Express (needs Python/FastAPI addition for audio processing)
- **Secret Rooms System**: Trapdoor API with `X-Secret-Room-Passcode` authentication
- **Existing Rooms**: Unlock Chamber, Flash Forge, Jailbreak Sanctum, Root Vault, Bypass Laboratory, Workflow Engine, Shadow Archive

### New Rooms to Add
1. **Sonic Codex** (Secret Room #8) - Audio Forensic Intelligence
2. **Ghost Codex** (Secret Room #9) - Stealth & Identity Protection
3. **Pandora Codex** (Already exists, needs Chain-Breaker UI enhancement)

---

## 🎵 SECRET ROOM #8: SONIC CODEX
### Audio Forensic Intelligence Suite

### Core Mission
Recover muffled, far-field, and low-decibel speech from audio/video sources. Translate any language to English. Provide forensic-grade transcription with speaker identification.

---

### 📦 TASK BREAKDOWN: Audio Capture & Input

#### 1.1 Live Audio Recording
- [ ] **Task**: Implement real-time microphone capture
- [ ] **Tech**: PyAudio (Python) or MediaDevices API (Browser)
- [ ] **Features**:
  - Start/Stop recording controls
  - Real-time waveform visualization
  - Sample rate selection (44.1kHz, 48kHz, 96kHz)
  - Gain control slider
  - Device selection dropdown
- [ ] **Location**: `backend/modules/sonic/capture.py` + `frontend/components/sonic/LiveCapture.tsx`
- [ ] **API Endpoint**: `POST /api/v1/trapdoor/sonic/capture/start`

#### 1.2 File Upload Handler
- [ ] **Task**: Accept audio/video file uploads
- [ ] **Tech**: Multer (Node) or FastAPI UploadFile
- [ ] **Supported Formats**: MP3, WAV, MP4, MOV, M4A, FLAC
- [ ] **Features**:
  - Drag-and-drop zone
  - File validation (size, format)
  - Progress indicator
  - Preview metadata (duration, bitrate)
- [ ] **Location**: `backend/modules/sonic/upload.py` + `frontend/components/sonic/FileUpload.tsx`
- [ ] **API Endpoint**: `POST /api/v1/trapdoor/sonic/upload`

#### 1.3 URL Audio Extraction
- [ ] **Task**: Pull audio from YouTube, TikTok, or any URL
- [ ] **Tech**: yt-dlp (Python)
- [ ] **Features**:
  - URL input field with validation
  - Format selection (best quality, WAV, MP3)
  - Download progress tracking
  - Automatic audio extraction from video
- [ ] **Location**: `backend/modules/sonic/extractor.py` + `frontend/components/sonic/URLPull.tsx`
- [ ] **API Endpoint**: `POST /api/v1/trapdoor/sonic/extract`
- [ ] **Dependencies**: Add `yt-dlp` to `requirements.txt`

---

### 🔧 TASK BREAKDOWN: Audio Enhancement Pipeline

#### 2.1 Forensic Pre-Processing
- [ ] **Task**: Implement spectral gating and noise reduction
- [ ] **Tech**: librosa, scipy, noisereduce (Python)
- [ ] **Features**:
  - High-pass filter (cut rumble below 80Hz)
  - Low-pass filter (cut hiss above 8kHz)
  - Spectral subtraction (remove stationary noise)
  - RMS normalization to -3dB target
- [ ] **Location**: `backend/modules/sonic/enhancement/preprocess.py`
- [ ] **Function**: `apply_forensic_preprocessing(input_path, output_path)`

#### 2.2 Consonant Recovery (2kHz-8kHz Boost)
- [ ] **Task**: Boost frequencies where speech clarity lives
- [ ] **Tech**: librosa.effects.preemphasis + parametric EQ
- [ ] **Features**:
  - Automatic 2kHz-8kHz high-shelf boost
  - Configurable gain (0-12dB)
  - Preserve low-end (don't over-boost)
- [ ] **Location**: `backend/modules/sonic/enhancement/consonant_boost.py`
- [ ] **Function**: `apply_consonant_recovery(audio_array, sample_rate, gain_db=6)`

#### 2.3 Enhancement Presets
- [ ] **Task**: Create preset filter chains
- [ ] **Tech**: FFmpeg filter strings
- [ ] **Presets**:
  - **Speech Clear**: `highpass=f=80, lowpass=f=8000, compand=0.3|0.3:1|1:-90/-60|-60/-40|-40/-30|-20/-20:6:0:-90:0.2`
  - **Interview**: Mid-range boost (2kHz-4kHz) + de-essing
  - **Noisy Room**: `afftdn=nr=20:nf=-25, highpass=f=200, lowpass=f=3000`
  - **Super Sonic**: Neural dereverberation (DeepFilterNet) + RMS normalization
- [ ] **Location**: `backend/modules/sonic/enhancement/presets.py`
- [ ] **Function**: `get_preset_filter(preset_name: str) -> str`

#### 2.4 DeepFilterNet Integration (Advanced)
- [ ] **Task**: Integrate neural dereverberation model
- [ ] **Tech**: DeepFilterNet3 (Python)
- [ ] **Features**:
  - Remove room echo/reverb
  - Real-time processing option
  - GPU acceleration support (if available)
- [ ] **Location**: `backend/modules/sonic/enhancement/deepfilter.py`
- [ ] **Dependencies**: Add `deepfilternet` to `requirements.txt`
- [ ] **Note**: This is Tier 2 - can be added after core works

#### 2.5 A/B Audio Comparison
- [ ] **Task**: Allow switching between original and enhanced audio
- [ ] **Tech**: React state + Wavesurfer.js
- [ ] **Features**:
  - Toggle button (Original ↔ Enhanced)
  - Side-by-side waveform comparison
  - Instant switching without reload
- [ ] **Location**: `frontend/components/sonic/AudioComparison.tsx`

---

### 🧠 TASK BREAKDOWN: AI Transcription & Translation

#### 3.1 Whisper Integration
- [ ] **Task**: Integrate OpenAI Whisper for transcription
- [ ] **Tech**: faster-whisper (local) or OpenAI API (cloud)
- [ ] **Model**: Whisper-Large-v3
- [ ] **Configuration**:
  - `beam_size=10` (or 15 for Super Sonic mode)
  - `patience=2.0`
  - `task="translate"` (force English output)
- [ ] **Location**: `backend/modules/sonic/transcription/whisper_engine.py`
- [ ] **Function**: `transcribe_audio(audio_path, language=None, translate=True)`
- [ ] **Dependencies**: Add `faster-whisper` or `openai` to `requirements.txt`

#### 3.2 Language Detection
- [ ] **Task**: Detect source language before transcription
- [ ] **Tech**: Whisper's built-in language detection
- [ ] **Features**:
  - Auto-detect language
  - Confidence score
  - Manual override option
- [ ] **Location**: `backend/modules/sonic/transcription/language_detector.py`

#### 3.3 Dual Transcript Storage
- [ ] **Task**: Keep both original language and English transcripts
- [ ] **Tech**: JSON storage with timestamps
- [ ] **Format**:
  ```json
  {
    "segments": [
      {
        "start": 0.0,
        "end": 2.5,
        "text": "Hello world",
        "confidence": 0.95
      }
    ],
    "language": "en",
    "language_probability": 0.99
  }
  ```
- [ ] **Location**: `backend/modules/sonic/transcription/storage.py`

#### 3.4 Speaker Diarization
- [ ] **Task**: Identify and label different speakers
- [ ] **Tech**: pyannote.audio (Python)
- [ ] **Features**:
  - Automatic speaker separation
  - Label as "Speaker 1", "Speaker 2", etc.
  - Timestamp alignment with transcript
  - Optional: Voice biometric fingerprinting (ECAPA-TDNN)
- [ ] **Location**: `backend/modules/sonic/transcription/diarization.py`
- [ ] **Function**: `identify_speakers(audio_path) -> List[SpeakerSegment]`
- [ ] **Dependencies**: Add `pyannote.audio` to `requirements.txt`

#### 3.5 Voice Activity Detection (VAD)
- [ ] **Task**: Only process segments with actual speech
- [ ] **Tech**: webrtcvad (Python)
- [ ] **Features**:
  - Skip silence to save processing time
  - Configurable sensitivity (0-3)
  - Frame-level detection
- [ ] **Location**: `backend/modules/sonic/transcription/vad.py`
- [ ] **Dependencies**: Add `webrtcvad` to `requirements.txt`

---

### 🎨 TASK BREAKDOWN: Frontend UI Components

#### 4.1 Wizard Flow (Multi-Step)
- [ ] **Task**: Build step-by-step wizard interface
- [ ] **Steps**:
  1. **Import**: File upload or URL input
  2. **Metadata**: Title, device name, date/time, notes
  3. **Enhance**: Preset selection + advanced controls
  4. **Transcribe**: Language selection + processing status
  5. **Review**: Playback with synced transcript
  6. **Export**: Package download
- [ ] **Location**: `frontend/components/sonic/WizardFlow.tsx`
- [ ] **State Management**: Zustand store for wizard state

#### 4.2 Job Library Screen
- [ ] **Task**: Display all processed jobs
- [ ] **Features**:
  - Grid/List view toggle
  - Search by title, device, date
  - Filter by status (Complete, Processing, Error)
  - Sort by date, name, duration
  - Batch delete
- [ ] **Location**: `frontend/components/sonic/JobLibrary.tsx`
- [ ] **API Endpoint**: `GET /api/v1/trapdoor/sonic/jobs`

#### 4.3 Job Details Screen
- [ ] **Task**: Full job review and export interface
- [ ] **Features**:
  - Audio player (Wavesurfer.js)
  - Transcript viewer with karaoke-style highlighting
  - Toggle between Original/English/Dual view
  - Click-to-jump (click word → jump to timestamp)
  - Export buttons (TXT, SRT, JSON, ZIP package)
- [ ] **Location**: `frontend/components/sonic/JobDetails.tsx`
- [ ] **Route**: `/secret-rooms/sonic-codex/jobs/:jobId`

#### 4.4 Real-Time Spectrogram
- [ ] **Task**: Visualize audio frequencies live
- [ ] **Tech**: Wavesurfer.js or custom Canvas/WebGL
- [ ] **Features**:
  - Log-frequency spectrogram
  - Color-coded intensity (cyan for speech range)
  - Zoom controls
  - Time cursor sync with playback
- [ ] **Location**: `frontend/components/sonic/Spectrogram.tsx`

#### 4.5 Waveform Visualizer
- [ ] **Task**: Real-time waveform display
- [ ] **Tech**: Wavesurfer.js
- [ ] **Features**:
  - Cyan wave color (#22d3ee)
  - Progress indicator (amber #f59e0b)
  - Cursor tracking
  - Responsive height
- [ ] **Location**: `frontend/components/sonic/Waveform.tsx`

#### 4.6 Progress Monitor
- [ ] **Task**: Show processing stage and percentage
- [ ] **Features**:
  - Stage indicators (Upload → Preprocess → Enhance → Transcribe → Translate → Package)
  - Progress bar with percentage
  - Estimated time remaining
  - Error messages if stage fails
- [ ] **Location**: `frontend/components/sonic/ProgressMonitor.tsx`

---

### 🔄 TASK BREAKDOWN: Backend Pipeline & State Management

#### 5.1 Job State Machine
- [ ] **Task**: Track job lifecycle
- [ ] **States**:
  - `UPLOADING` → `PREPROCESSING` → `ENHANCING` → `TRANSCRIBING` → `TRANSLATING` → `PACKAGING` → `COMPLETE`
  - Error states: `FAILED_UPLOAD`, `FAILED_ENHANCE`, `FAILED_TRANSCRIBE`, etc.
- [ ] **Location**: `backend/modules/sonic/job_manager.py`
- [ ] **Class**: `SonicJob` with state transitions

#### 5.2 WebSocket Heartbeat
- [ ] **Task**: Maintain persistent connection for real-time updates
- [ ] **Tech**: WebSocket (ws library for Node, FastAPI WebSocket for Python)
- [ ] **Features**:
  - Ping/Pong every 30 seconds
  - Auto-reconnect on disconnect
  - Resume in-flight jobs after reconnect
  - Progress updates pushed to frontend
- [ ] **Location**: `backend/modules/sonic/websocket_handler.py` + `frontend/hooks/useJobSync.ts`
- [ ] **Endpoint**: `WS /api/v1/trapdoor/sonic/ws/:jobId`

#### 5.3 Job Storage Structure
- [ ] **Task**: Organize files in predictable directory structure
- [ ] **Structure**:
  ```
  jobs/
    {job_id}/
      manifest.json
      original.{ext}
      enhanced.wav
      transcript_original.json
      transcript_english.json
      transcript_original.srt
      transcript_english.srt
      transcript_original.txt
      transcript_english.txt
      logs.txt
      {base_name}_FORENSIC_PACKAGE.zip
  ```
- [ ] **Location**: `backend/modules/sonic/storage.py`

#### 5.4 Human-Readable Naming
- [ ] **Task**: Generate descriptive filenames
- [ ] **Format**: `<DeviceName>_<YYYY-MM-DD>_<HHMM>_<ShortTitle>`
- [ ] **Example**: `iPhone_13_Pro_2025-12-30_1030_Project_Aegis_Draft.wav`
- [ ] **Location**: `backend/modules/sonic/naming.py`
- [ ] **Function**: `generate_job_filename(device, title, timestamp) -> str`

#### 5.5 Manifest Generation
- [ ] **Task**: Create manifest.json for each job
- [ ] **Schema**:
  ```json
  {
    "job_id": "8f2a-b3c1",
    "metadata": {
      "title": "Project_Aegis_Draft",
      "device": "iPhone_13_Pro",
      "timestamp": "2025-12-30T10:30:00",
      "base_name": "iPhone_13_Pro_2025-12-30_1030_Project_Aegis_Draft"
    },
    "pipeline": {
      "stage": "complete",
      "progress": 100,
      "language": "es",
      "confidence": 0.94
    },
    "outputs": {
      "original": "raw_input.wav",
      "enhanced": "iPhone_13_Pro_2025-12-30_1030_Project_Aegis_Draft_ENHANCED.wav",
      "transcript_orig": "transcript_es.json",
      "transcript_en": "transcript_en.json",
      "package": "iPhone_13_Pro_2025-12-30_1030_Project_Aegis_Draft_FORENSIC_PACKAGE.zip"
    },
    "settings": {
      "preset": "Speech Clear",
      "enhancement_applied": true,
      "whisper_model": "large-v3",
      "beam_size": 10
    }
  }
  ```
- [ ] **Location**: `backend/modules/sonic/manifest.py`

#### 5.6 Export Package Generator
- [ ] **Task**: Create ZIP file with all job outputs
- [ ] **Tech**: Python zipfile or Node.js adm-zip
- [ ] **Contents**:
  - Original audio
  - Enhanced audio
  - Both transcripts (JSON, SRT, TXT)
  - Manifest.json
  - Optional: logs.txt
- [ ] **Location**: `backend/modules/sonic/exporter.py`
- [ ] **Function**: `create_job_package(job_id: str) -> str` (returns ZIP path)
- [ ] **API Endpoint**: `GET /api/v1/trapdoor/sonic/jobs/:jobId/download`

---

### 🔐 TASK BREAKDOWN: Security & Integration

#### 6.1 Trapdoor API Integration
- [ ] **Task**: Add Sonic Codex endpoints to Trapdoor API
- [ ] **Authentication**: Require `X-Secret-Room-Passcode` header
- [ ] **Endpoints**:
  - `POST /api/v1/trapdoor/sonic/upload`
  - `POST /api/v1/trapdoor/sonic/extract`
  - `POST /api/v1/trapdoor/sonic/capture/start`
  - `GET /api/v1/trapdoor/sonic/jobs`
  - `GET /api/v1/trapdoor/sonic/jobs/:jobId`
  - `GET /api/v1/trapdoor/sonic/jobs/:jobId/download`
  - `WS /api/v1/trapdoor/sonic/ws/:jobId`
- [ ] **Location**: `server/routes/v1/trapdoor/sonic.js` (or Python FastAPI routes)

#### 6.2 Secret Room Navigation Entry
- [ ] **Task**: Add Sonic Codex to secret rooms list
- [ ] **Location**: `frontend/components/trapdoor/TrapdoorRoomNavigation.tsx`
- [ ] **Icon**: Headphones or Waveform icon from lucide-react
- [ ] **ID**: `'sonic-codex'`
- [ ] **Description**: "Audio forensic intelligence"

#### 6.3 State Persistence
- [ ] **Task**: Save wizard state to localStorage
- [ ] **Features**:
  - Resume wizard on page refresh
  - Remember last used preset
  - Cache job list
- [ ] **Location**: `frontend/hooks/useSonicPersistence.ts`

---

### 🧪 TASK BREAKDOWN: Testing & Quality

#### 7.1 Unit Tests
- [ ] **Task**: Test audio processing functions
- [ ] **Tests**:
  - Consonant boost math
  - RMS normalization
  - File naming logic
  - Manifest generation
- [ ] **Location**: `tests/sonic/unit/`

#### 7.2 Integration Tests
- [ ] **Task**: Test full pipeline end-to-end
- [ ] **Scenario**: Upload → Enhance → Transcribe → Export
- [ ] **Location**: `tests/sonic/integration/`

#### 7.3 Happy Path E2E Test
- [ ] **Task**: Automated test of complete user flow
- [ ] **Tools**: Playwright or Cypress
- [ ] **Location**: `tests/sonic/e2e/happy-path.test.ts`

---

## 👻 SECRET ROOM #9: GHOST CODEX
### Stealth & Identity Protection Suite

### Core Mission
Protect digital identity, strip metadata, create tripwire alerts, and generate burner personas for secure operations.

---

### 📦 TASK BREAKDOWN: Metadata Stripping

#### 8.1 Media Metadata Shredder
- [ ] **Task**: Remove all metadata from audio/video files
- [ ] **Tech**: FFmpeg with `-map_metadata -1` and `-fflags +bitexact`
- [ ] **Features**:
  - Strip EXIF, GPS, device info, timestamps
  - Create bit-exact copy (no encoder tags)
  - Support: MP3, WAV, MP4, MOV, M4A
- [ ] **Location**: `backend/modules/ghost/shredder.py`
- [ ] **Function**: `shred_media_metadata(input_path, output_path) -> bool`
- [ ] **API Endpoint**: `POST /api/v1/trapdoor/ghost/shred`

#### 8.2 Image Metadata Stripper
- [ ] **Task**: Remove EXIF/GPS from images
- [ ] **Tech**: Pillow (PIL) - re-save without metadata
- [ ] **Features**:
  - Strip all EXIF tags
  - Remove GPS coordinates
  - Remove camera model/software info
- [ ] **Location**: `backend/modules/ghost/shredder.py`
- [ ] **Function**: `shred_image_metadata(input_path, output_path) -> bool`

#### 8.3 Recursive Folder Sweep
- [ ] **Task**: Shred all files in a folder
- [ ] **Features**:
  - Process entire directory tree
  - Rename files to generic hashes (e.g., `ghost_8f2a.mp4`)
  - Preserve folder structure (optional)
- [ ] **Location**: `backend/modules/ghost/shredder.py`
- [ ] **Function**: `shred_folder(folder_path, recursive=True) -> List[str]`

---

### 🪤 TASK BREAKDOWN: Canary Tokens (Tripwires)

#### 9.1 Canary Token Generator
- [ ] **Task**: Create bait files that alert when opened
- [ ] **Tech**: HTML with hidden image beacon, or docx with remote image
- [ ] **Features**:
  - Generate unique token ID
  - Create HTML file with hidden callback
  - Place in specified directory
  - Register token in database/log
- [ ] **Location**: `backend/modules/ghost/canary.py`
- [ ] **Function**: `generate_bait_file(token_id: str, filename: str, callback_url: str) -> str`

#### 9.2 Canary Alert Endpoint
- [ ] **Task**: Receive alerts when bait file is accessed
- [ ] **Tech**: FastAPI endpoint that logs IP, user-agent, timestamp
- [ ] **Features**:
  - Log to `ghost_codex_alerts.json`
  - Capture IP address
  - Capture device info (user-agent)
  - Optional: Push notification to phone
- [ ] **Location**: `backend/modules/ghost/canary.py`
- [ ] **Endpoint**: `GET /api/v1/trapdoor/ghost/trap/:tokenId`
- [ ] **Response**: Return 200 OK (silent, no suspicion)

#### 9.3 Canary Alert Dashboard
- [ ] **Task**: Display triggered alerts in UI
- [ ] **Features**:
  - List all triggered tokens
  - Show IP, device, timestamp
  - Map IP to approximate location (optional)
  - Filter by date range
- [ ] **Location**: `frontend/components/ghost/CanaryDashboard.tsx`
- [ ] **API Endpoint**: `GET /api/v1/trapdoor/ghost/alerts`

---

### 🎭 TASK BREAKDOWN: Burner Persona Generator

#### 10.1 Email Generator
- [ ] **Task**: Create temporary email addresses
- [ ] **Tech**: Integration with temp-mail API or custom domain
- [ ] **Features**:
  - Generate random email
  - Set expiration (1 hour, 24 hours, 7 days)
  - Forward to real email (optional)
- [ ] **Location**: `backend/modules/ghost/persona.py`
- [ ] **Function**: `generate_burner_email(expires_in: int) -> str`

#### 10.2 Virtual Number Generator
- [ ] **Task**: Create temporary VOIP numbers
- [ ] **Tech**: Twilio or similar VOIP service
- [ ] **Features**:
  - Generate virtual number
  - Forward calls/SMS to real number
  - Auto-delete after expiration
- [ ] **Location**: `backend/modules/ghost/persona.py`

#### 10.3 Persona Vault
- [ ] **Task**: Store and manage burner identities
- [ ] **Features**:
  - List all active personas
  - Show expiration dates
  - Revoke/delete personas
  - Export persona data
- [ ] **Location**: `frontend/components/ghost/PersonaVault.tsx`

---

### 🔒 TASK BREAKDOWN: Hidden Partitions

#### 11.1 Ghost Folder Creator
- [ ] **Task**: Create hidden folder that only appears with secret gesture/frequency
- [ ] **Tech**: File system manipulation + custom unlock mechanism
- [ ] **Features**:
  - Create encrypted hidden partition
  - Unlock via secret frequency (audio trigger)
  - Unlock via secret gesture (touch pattern)
  - Auto-lock after inactivity
- [ ] **Location**: `backend/modules/ghost/hidden_partition.py`
- [ ] **Note**: Platform-specific (Windows/Mac/Linux)

#### 11.2 Frequency-Based Unlock
- [ ] **Task**: Play specific frequency to reveal folder
- [ ] **Tech**: Audio analysis + file system mount
- [ ] **Features**:
  - Listen for specific Hz tone (e.g., 440Hz + 880Hz)
  - Mount hidden partition on detection
  - Timeout after 5 minutes
- [ ] **Location**: `backend/modules/ghost/frequency_unlock.py`

---

### 🎨 TASK BREAKDOWN: Ghost Codex UI

#### 12.1 Main Dashboard
- [ ] **Task**: Central hub for all Ghost Codex features
- [ ] **Sections**:
  - Metadata Shredder (file upload)
  - Canary Token Generator
  - Persona Vault
  - Hidden Partition Manager
  - Alert Log
- [ ] **Location**: `frontend/components/ghost/GhostDashboard.tsx`

#### 12.2 Shredder Interface
- [ ] **Task**: Drag-and-drop file/folder shredding
- [ ] **Features**:
  - Single file upload
  - Folder selection
  - Progress indicator
  - Download shredded file
- [ ] **Location**: `frontend/components/ghost/ShredderInterface.tsx`

---

### 🔐 TASK BREAKDOWN: Ghost Codex Integration

#### 13.1 Trapdoor API Endpoints
- [ ] **Endpoints**:
  - `POST /api/v1/trapdoor/ghost/shred`
  - `POST /api/v1/trapdoor/ghost/canary/generate`
  - `GET /api/v1/trapdoor/ghost/trap/:tokenId`
  - `GET /api/v1/trapdoor/ghost/alerts`
  - `POST /api/v1/trapdoor/ghost/persona/create`
  - `GET /api/v1/trapdoor/ghost/personas`
- [ ] **Location**: `server/routes/v1/trapdoor/ghost.js` (or FastAPI)

#### 13.2 Secret Room Navigation Entry
- [ ] **Task**: Add Ghost Codex to navigation
- [ ] **Location**: `frontend/components/trapdoor/TrapdoorRoomNavigation.tsx`
- [ ] **Icon**: Ghost or EyeOff icon
- [ ] **ID**: `'ghost-codex'`
- [ ] **Description**: "Stealth & identity protection"

---

## ⚡ SECRET ROOM ENHANCEMENT: PANDORA CODEX (Chain-Breaker UI)

### Core Mission
Enhance existing Pandora Codex with Chain-Breaker UI for hardware manipulation and DFU detection.

---

### 📦 TASK BREAKDOWN: Hardware Detection

#### 14.1 DFU Mode Detector
- [ ] **Task**: Detect when iPhone enters DFU mode
- [ ] **Tech**: PyUSB + LibUSB (Python)
- [ ] **Apple Constants**:
  - `APPLE_VID = 0x05ac`
  - `DFU_PID = 0x1227` (vulnerable signature)
  - `REC_PID = 0x1281` (Recovery mode)
  - `NORM_PID = 0x12a8` (Normal mode)
- [ ] **Location**: `backend/modules/pandora/detector.py`
- [ ] **Function**: `scan_for_hardware() -> Dict[str, Any]`
- [ ] **Dependencies**: Add `pyusb` to `requirements.txt`

#### 14.2 USB Bus Scanner
- [ ] **Task**: Continuously scan USB bus for devices
- [ ] **Features**:
  - Real-time device detection
  - Mode identification (DFU, Recovery, Normal)
  - Device info (UDID, IMEI if available)
  - Battery health (if accessible)
- [ ] **Location**: `backend/modules/pandora/detector.py`
- [ ] **Function**: `hardware_heartbeat() -> Generator[Dict]`

#### 14.3 WebSocket Hardware Stream
- [ ] **Task**: Stream hardware status to frontend
- [ ] **Tech**: WebSocket connection
- [ ] **Features**:
  - Push device state changes
  - Real-time mode updates
  - Connection status indicator
- [ ] **Location**: `backend/modules/pandora/websocket.py`
- [ ] **Endpoint**: `WS /api/v1/trapdoor/pandora/hardware/stream`

---

### 🎨 TASK BREAKDOWN: Chain-Breaker UI

#### 15.1 Device Pulse Monitor
- [ ] **Task**: Display real-time device status
- [ ] **Features**:
  - Device model, chipset, serial
  - Current mode (DFU/Recovery/Normal)
  - Battery health
  - Connection status (pulsing indicator)
- [ ] **Location**: `frontend/components/pandora/DevicePulse.tsx`
- [ ] **Color Coding**:
  - Matrix Green (#00FF41) = DFU Ready
  - Amber (#FFB000) = Recovery Mode
  - Red (#FF0000) = Normal/Locked

#### 15.2 Exploit Selector
- [ ] **Task**: Dropdown menu for jailbreak methods
- [ ] **Options**:
  - Checkm8 (A5-A11)
  - Palera1n (A8-A11)
  - Unc0ver (A12+)
  - Custom script
- [ ] **Location**: `frontend/components/pandora/ExploitSelector.tsx`

#### 15.3 Console Log Stream
- [ ] **Task**: Terminal-style output window
- [ ] **Features**:
  - Auto-scrolling
  - Color-coded messages (green=success, red=error, amber=warning)
  - Timestamped entries
  - Copy to clipboard
- [ ] **Location**: `frontend/components/pandora/ConsoleLog.tsx`
- [ ] **Tech**: React component with monospace font

#### 15.4 Safety Interlock
- [ ] **Task**: Require 3-second hold for destructive operations
- [ ] **Features**:
  - Hold button for 3 seconds
  - Progress indicator during hold
  - Confirmation dialog after hold
- [ ] **Location**: `frontend/components/pandora/SafetyInterlock.tsx`

#### 15.5 Chain-Breaker Dashboard
- [ ] **Task**: Main UI layout
- [ ] **Layout**:
  - Left Sidebar: Device Info
  - Center: Console Log
  - Right Sidebar: Exploit Menu + Actions
- [ ] **Theme**: Night-Ops (jet black #050505, neon amber #FFB000, matrix green #00FF41)
- [ ] **Location**: `frontend/components/pandora/ChainBreakerDashboard.tsx`

---

### 🔐 TASK BREAKDOWN: Pandora Codex Integration

#### 16.1 MAC Address Lock
- [ ] **Task**: Restrict Pandora Codex to authorized machines
- [ ] **Tech**: Check MAC address on backend
- [ ] **Features**:
  - Whitelist of authorized MAC addresses
  - Fail LibUSB initialization if unauthorized
  - Log unauthorized access attempts
- [ ] **Location**: `backend/modules/pandora/security.py`

#### 16.2 Trapdoor API Endpoints
- [ ] **Endpoints**:
  - `GET /api/v1/trapdoor/pandora/hardware/status`
  - `POST /api/v1/trapdoor/pandora/enter-dfu`
  - `POST /api/v1/trapdoor/pandora/jailbreak`
  - `POST /api/v1/trapdoor/pandora/flash`
  - `WS /api/v1/trapdoor/pandora/hardware/stream`
- [ ] **Location**: `server/routes/v1/trapdoor/pandora.js` (or FastAPI)

---

## 🔑 CROSS-ROOM INTEGRATION TASKS

### 17.1 Phoenix Key Authentication
- [ ] **Task**: Unified authentication for all secret rooms
- [ ] **Features**:
  - Secret sequence of clicks/gestures
  - Token-based session
  - Auto-logout after inactivity
- [ ] **Location**: `frontend/components/auth/PhoenixKey.tsx` + `backend/modules/auth/phoenix.py`

### 17.2 Room Transition Animation
- [ ] **Task**: Smooth UI transition when entering secret room
- [ ] **Features**:
  - "Secure Handshake" animation
  - Color theme shift
  - Loading state
- [ ] **Location**: `frontend/components/trapdoor/RoomTransition.tsx`

### 17.3 Shared State Management
- [ ] **Task**: Zustand store for cross-room data
- [ ] **Stores**:
  - `useAuthStore` - Phoenix Key status
  - `useDeviceStore` - Active device info
  - `useJobStore` - Sonic Codex jobs
- [ ] **Location**: `frontend/stores/`

---

## 🛠️ INFRASTRUCTURE TASKS

### 18.1 Python Backend Setup
- [ ] **Task**: Add FastAPI backend alongside Node.js
- [ ] **Structure**:
  ```
  backend/
    modules/
      sonic/
      ghost/
      pandora/
    main.py (FastAPI app)
  ```
- [ ] **Dependencies**: Create `requirements.txt` with all Python packages

### 18.2 replit.nix Configuration
- [ ] **Task**: Add system dependencies
- [ ] **Required**:
  - `ffmpeg-full`
  - `portaudio`
  - `libsndfile`
  - `python311Full`
  - `pkg-config`
  - `libopus`
- [ ] **Location**: `replit.nix` (if using Replit) or system setup docs

### 18.3 Docker/Container Setup (Optional)
- [ ] **Task**: Containerize Python backend
- [ ] **Location**: `Dockerfile` + `docker-compose.yml`

---

## 📊 PRIORITY IMPLEMENTATION ORDER

### Phase 1: Foundation (Week 1-2)
1. ✅ Python backend setup (FastAPI)
2. ✅ Sonic Codex: File upload + basic enhancement
3. ✅ Sonic Codex: Whisper transcription
4. ✅ Sonic Codex: Basic wizard UI
5. ✅ Ghost Codex: Metadata shredder

### Phase 2: Core Features (Week 3-4)
6. ✅ Sonic Codex: Speaker diarization
7. ✅ Sonic Codex: URL extraction
8. ✅ Sonic Codex: Job library + details screen
9. ✅ Sonic Codex: Export package generator
10. ✅ Ghost Codex: Canary tokens

### Phase 3: Advanced Features (Week 5-6)
11. ✅ Sonic Codex: Live recording
12. ✅ Sonic Codex: Spectrogram visualization
13. ✅ Sonic Codex: WebSocket heartbeat
14. ✅ Pandora Codex: DFU detector
15. ✅ Pandora Codex: Chain-Breaker UI

### Phase 4: Polish & Integration (Week 7-8)
16. ✅ All rooms: Phoenix Key integration
17. ✅ All rooms: Room transition animations
18. ✅ Testing suite
19. ✅ Documentation
20. ✅ Performance optimization

---

## 📝 NOTES & CONSTRAINTS

### Known Limitations
- **Real-time Monitoring**: Progress percentage is estimated based on stage completion
- **Speaker Enrollment**: Diarization identifies "Speaker 1/2" but won't know names without manual tagging
- **Browser Storage**: Large files may hit localStorage limits
- **GPU Requirements**: DeepFilterNet and neural models require GPU for real-time processing

### Legal & Ethical
- **Consent-Based Only**: All audio transcription is for lawful, consent-based recordings
- **Owner Devices**: Pandora Codex operations are for owner devices only
- **No Surveillance Features**: Do not add covert surveillance capabilities

### Technical Decisions
- **Stack Choice**: Python backend for audio processing, Node.js for device management
- **Model Selection**: Whisper-Large-v3 for maximum accuracy
- **File Format**: WAV/FLAC for forensic-grade quality (no MP3 compression)

---

## ✅ COMPLETION CHECKLIST

### Sonic Codex
- [ ] All 7.1-7.6 task groups complete
- [ ] Full wizard flow working
- [ ] Export package generation working
- [ ] WebSocket heartbeat stable

### Ghost Codex
- [ ] All 8.1-13.2 task groups complete
- [ ] Canary tokens functional
- [ ] Metadata shredder tested

### Pandora Codex Enhancement
- [ ] All 14.1-16.2 task groups complete
- [ ] DFU detection working
- [ ] Chain-Breaker UI polished

### Integration
- [ ] Phoenix Key working across all rooms
- [ ] Room transitions smooth
- [ ] Cross-room state management stable

---

**END OF MASTER PLAN**

*This document is the complete blueprint for implementing Sonic Codex, Ghost Codex, and Pandora Codex enhancements within Bobby's Workshop Secret Rooms system.*
