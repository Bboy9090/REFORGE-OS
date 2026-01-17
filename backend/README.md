# Bobby's Workshop - Python Backend

FastAPI backend for Sonic Codex, Ghost Codex, and Pandora Codex operations.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   python -m backend.main
   ```
   
   Or with uvicorn directly:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

## API Endpoints

### Sonic Codex
- `POST /api/v1/trapdoor/sonic/upload` - Upload audio/video file
- `POST /api/v1/trapdoor/sonic/jobs/{job_id}/enhance` - Apply audio enhancement
- `POST /api/v1/trapdoor/sonic/jobs/{job_id}/transcribe` - Transcribe audio
- `GET /api/v1/trapdoor/sonic/jobs` - List all jobs
- `GET /api/v1/trapdoor/sonic/jobs/{job_id}` - Get job details
- `WS /api/v1/trapdoor/sonic/ws/{job_id}` - WebSocket for real-time updates

### Ghost Codex
- `POST /api/v1/trapdoor/ghost/shred` - Shred metadata from file
- `POST /api/v1/trapdoor/ghost/canary/generate` - Generate canary token
- `GET /api/v1/trapdoor/ghost/trap/{token_id}` - Canary alert endpoint
- `GET /api/v1/trapdoor/ghost/alerts` - Get canary alerts

### Pandora Codex
- `GET /api/v1/trapdoor/pandora/hardware/status` - Get hardware status
- `WS /api/v1/trapdoor/pandora/hardware/stream` - WebSocket hardware stream

## Authentication

All endpoints require the `X-Secret-Room-Passcode` header:
```bash
curl -H "X-Secret-Room-Passcode: your-passcode" http://localhost:8000/api/v1/trapdoor/sonic/jobs
```

## Environment Variables

- `PYTHON_BACKEND_PORT` - Port for FastAPI server (default: 8000)

## Dependencies

See `requirements.txt` for full list. Key dependencies:
- FastAPI - Web framework
- librosa - Audio processing
- faster-whisper - Whisper transcription
- pyannote.audio - Speaker diarization
- ffmpeg-python - Media processing
- yt-dlp - URL audio extraction
