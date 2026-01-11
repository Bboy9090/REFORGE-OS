# 🔐 BOBBY'S SECRET ROOMS - QUICK REFERENCE

## 📋 Summary of All Tasks by Room

---

## 🎵 SONIC CODEX (Secret Room #8)
**Purpose**: Audio Forensic Intelligence - Recover muffled/distant speech, transcribe, translate

### Audio Input (3 tasks)
- ✅ Live microphone recording (PyAudio/MediaDevices)
- ✅ File upload (MP3, WAV, MP4, MOV, M4A, FLAC)
- ✅ URL extraction (yt-dlp for YouTube/TikTok)

### Audio Enhancement (5 tasks)
- ✅ Forensic pre-processing (spectral gating, noise reduction)
- ✅ Consonant recovery (2kHz-8kHz boost)
- ✅ Enhancement presets (Speech Clear, Interview, Noisy Room, Super Sonic)
- ✅ DeepFilterNet integration (neural dereverberation - Tier 2)
- ✅ A/B comparison (original vs enhanced toggle)

### AI Transcription (5 tasks)
- ✅ Whisper integration (Large-v3, beam_size=10)
- ✅ Language detection (auto-detect + confidence)
- ✅ Dual transcript storage (original + English)
- ✅ Speaker diarization (pyannote.audio)
- ✅ Voice Activity Detection (webrtcvad)

### Frontend UI (6 tasks)
- ✅ Wizard flow (6-step: Import → Metadata → Enhance → Transcribe → Review → Export)
- ✅ Job library (search, filter, sort, batch delete)
- ✅ Job details screen (player + transcript viewer)
- ✅ Real-time spectrogram (frequency visualization)
- ✅ Waveform visualizer (Wavesurfer.js)
- ✅ Progress monitor (stage indicators + percentage)

### Backend Pipeline (6 tasks)
- ✅ Job state machine (UPLOADING → PREPROCESSING → ENHANCING → TRANSCRIBING → TRANSLATING → PACKAGING → COMPLETE)
- ✅ WebSocket heartbeat (ping/pong, auto-reconnect, resume jobs)
- ✅ Job storage structure (organized directory tree)
- ✅ Human-readable naming (`<Device>_<Date>_<Time>_<Title>`)
- ✅ Manifest generation (JSON with all metadata)
- ✅ Export package generator (ZIP with all outputs)

### Security & Integration (3 tasks)
- ✅ Trapdoor API endpoints (7 endpoints)
- ✅ Secret room navigation entry
- ✅ State persistence (localStorage)

### Testing (3 tasks)
- ✅ Unit tests (audio processing functions)
- ✅ Integration tests (full pipeline)
- ✅ E2E happy path test

**Total Sonic Codex Tasks: 31**

---

## 👻 GHOST CODEX (Secret Room #9)
**Purpose**: Stealth & Identity Protection - Strip metadata, create tripwires, generate burner personas

### Metadata Stripping (3 tasks)
- ✅ Media metadata shredder (FFmpeg: remove EXIF, GPS, device info)
- ✅ Image metadata stripper (Pillow: remove EXIF/GPS)
- ✅ Recursive folder sweep (shred entire directories)

### Canary Tokens (3 tasks)
- ✅ Canary token generator (create bait HTML files)
- ✅ Canary alert endpoint (log IP, user-agent, timestamp)
- ✅ Canary alert dashboard (display triggered alerts)

### Burner Personas (3 tasks)
- ✅ Email generator (temporary email addresses)
- ✅ Virtual number generator (VOIP numbers)
- ✅ Persona vault (manage active personas)

### Hidden Partitions (2 tasks)
- ✅ Ghost folder creator (encrypted hidden partition)
- ✅ Frequency-based unlock (audio trigger to reveal)

### UI Components (2 tasks)
- ✅ Main dashboard (central hub)
- ✅ Shredder interface (drag-and-drop)

### Integration (2 tasks)
- ✅ Trapdoor API endpoints (6 endpoints)
- ✅ Secret room navigation entry

**Total Ghost Codex Tasks: 15**

---

## ⚡ PANDORA CODEX ENHANCEMENT (Chain-Breaker UI)
**Purpose**: Hardware manipulation - DFU detection, jailbreak automation

### Hardware Detection (3 tasks)
- ✅ DFU mode detector (PyUSB: detect 0x1227 signature)
- ✅ USB bus scanner (continuous device monitoring)
- ✅ WebSocket hardware stream (real-time status updates)

### Chain-Breaker UI (5 tasks)
- ✅ Device pulse monitor (real-time device status display)
- ✅ Exploit selector (Checkm8, Palera1n, Unc0ver dropdown)
- ✅ Console log stream (terminal-style output)
- ✅ Safety interlock (3-second hold for destructive ops)
- ✅ Chain-Breaker dashboard (night-ops theme layout)

### Security & Integration (2 tasks)
- ✅ MAC address lock (restrict to authorized machines)
- ✅ Trapdoor API endpoints (5 endpoints)

**Total Pandora Codex Enhancement Tasks: 10**

---

## 🔑 CROSS-ROOM INTEGRATION (3 tasks)
- ✅ Phoenix Key authentication (secret gesture sequence)
- ✅ Room transition animation (secure handshake effect)
- ✅ Shared state management (Zustand stores)

---

## 🛠️ INFRASTRUCTURE (3 tasks)
- ✅ Python backend setup (FastAPI alongside Node.js)
- ✅ replit.nix configuration (system dependencies)
- ✅ Docker/Container setup (optional)

---

## 📊 TOTAL TASK COUNT

| Room | Tasks |
|------|-------|
| Sonic Codex | 31 |
| Ghost Codex | 15 |
| Pandora Codex Enhancement | 10 |
| Cross-Room Integration | 3 |
| Infrastructure | 3 |
| **TOTAL** | **62 tasks** |

---

## 🎯 IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1-2)
- Python backend setup
- Sonic Codex: Basic upload + enhancement + transcription
- Sonic Codex: Wizard UI
- Ghost Codex: Metadata shredder

### Phase 2: Core Features (Week 3-4)
- Sonic Codex: Diarization + URL extraction + Job library
- Sonic Codex: Export package
- Ghost Codex: Canary tokens

### Phase 3: Advanced Features (Week 5-6)
- Sonic Codex: Live recording + Spectrogram + WebSocket
- Pandora Codex: DFU detector + Chain-Breaker UI

### Phase 4: Polish & Integration (Week 7-8)
- Phoenix Key integration
- Room transitions
- Testing suite
- Documentation

---

## 🔗 KEY TECHNOLOGIES

### Backend
- **Python**: FastAPI, librosa, scipy, faster-whisper, pyannote.audio, webrtcvad, yt-dlp, FFmpeg, PyUSB
- **Node.js**: Express, WebSocket (ws), Multer

### Frontend
- **React**: TypeScript, Tailwind CSS, Zustand, Wavesurfer.js, Framer Motion

### AI/ML
- **Whisper**: Large-v3 model for transcription
- **DeepFilterNet**: Neural dereverberation (Tier 2)
- **pyannote.audio**: Speaker diarization

---

## ⚠️ CRITICAL CONSTRAINTS

### Legal & Ethical
- ✅ Consent-based audio only (no surveillance)
- ✅ Owner devices only (Pandora Codex)
- ✅ Lawful use only

### Technical
- ✅ GPU required for neural models (DeepFilterNet)
- ✅ Large files may hit browser storage limits
- ✅ Real-time progress is estimated (not granular)

---

## 📝 NEXT STEPS

1. **Review this document** - Confirm all tasks are correct
2. **Approve architecture** - FastAPI + React stack confirmed
3. **Start Phase 1** - Begin with Python backend setup
4. **Iterate** - Build, test, refine

---

**Ready to build when you are, Bobby.** 🔥
