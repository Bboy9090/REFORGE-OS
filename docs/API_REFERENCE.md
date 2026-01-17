# 📚 Bobby's Workshop - API Reference

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com`

## Authentication

All Secret Room endpoints require the `X-Secret-Room-Passcode` header:

```http
X-Secret-Room-Passcode: your-phoenix-key-token
```

---

## Phoenix Key API

### Unlock
```http
POST /api/v1/trapdoor/phoenix/unlock
Content-Type: application/json

{
  "sequence": "PHOENIX_RISES_2025"
  // OR
  "gesture": [1, 2, 3, 2, 1]
}
```

**Response**:
```json
{
  "token": "abc123...",
  "status": "unlocked"
}
```

### Validate Token
```http
POST /api/v1/trapdoor/phoenix/validate
Content-Type: application/json

{
  "token": "abc123..."
}
```

---

## Sonic Codex API

### Upload File
```http
POST /api/v1/trapdoor/sonic/upload
X-Secret-Room-Passcode: token
Content-Type: multipart/form-data

file: <audio/video file>
device: "iPhone_13_Pro"
title: "Meeting_Notes"
```

### Extract from URL
```http
POST /api/v1/trapdoor/sonic/extract?url=https://youtube.com/watch?v=...
X-Secret-Room-Passcode: token
```

### Enhance Audio
```http
POST /api/v1/trapdoor/sonic/jobs/{job_id}/enhance?preset=Speech Clear
X-Secret-Room-Passcode: token
```

### Transcribe
```http
POST /api/v1/trapdoor/sonic/jobs/{job_id}/transcribe?diarize=true
X-Secret-Room-Passcode: token
```

### List Jobs
```http
GET /api/v1/trapdoor/sonic/jobs
X-Secret-Room-Passcode: token
```

### Get Job Details
```http
GET /api/v1/trapdoor/sonic/jobs/{job_id}
X-Secret-Room-Passcode: token
```

### Download Package
```http
GET /api/v1/trapdoor/sonic/jobs/{job_id}/download?format=zip
X-Secret-Room-Passcode: token
```

**Formats**: `zip`, `srt`, `txt`, `json`

### Start Live Capture
```http
POST /api/v1/trapdoor/sonic/capture/start
X-Secret-Room-Passcode: token
Content-Type: application/json

{
  "device": "Microphone",
  "title": "Live_Recording",
  "sample_rate": 44100
}
```

### Get Capture Devices
```http
GET /api/v1/trapdoor/sonic/capture/devices
X-Secret-Room-Passcode: token
```

---

## Ghost Codex API

### Shred Metadata
```http
POST /api/v1/trapdoor/ghost/shred
X-Secret-Room-Passcode: token
Content-Type: multipart/form-data

file: <file>
```

### Generate Canary Token
```http
POST /api/v1/trapdoor/ghost/canary/generate
X-Secret-Room-Passcode: token
Content-Type: application/json

{
  "token_id": "unique_id",
  "filename": "Passwords.html",
  "callback_url": "https://your-server.com/trap/{token_id}"
}
```

### Get Alerts
```http
GET /api/v1/trapdoor/ghost/alerts
X-Secret-Room-Passcode: token
```

### Generate Email Persona
```http
POST /api/v1/trapdoor/ghost/persona/email?expires_in_hours=24
X-Secret-Room-Passcode: token
```

### Generate Phone Persona
```http
POST /api/v1/trapdoor/ghost/persona/phone?expires_in_days=7
X-Secret-Room-Passcode: token
```

### List Personas
```http
GET /api/v1/trapdoor/ghost/personas
X-Secret-Room-Passcode: token
```

---

## Pandora Codex API

### Get Hardware Status
```http
GET /api/v1/trapdoor/pandora/hardware/status
X-Secret-Room-Passcode: token
```

**Response**:
```json
{
  "status": "READY_TO_STRIKE",
  "msg": "Device in DFU. Bootrom exploit available.",
  "mode": "DFU",
  "color": "#00FF41"
}
```

### Enter DFU Mode
```http
POST /api/v1/trapdoor/pandora/enter-dfu?device_serial=ABC123
X-Secret-Room-Passcode: token
```

### Execute Jailbreak
```http
POST /api/v1/trapdoor/pandora/jailbreak
X-Secret-Room-Passcode: token
Content-Type: application/json

{
  "exploit": "checkm8",
  "device_serial": "ABC123",
  "ios_version": "14.8"
}
```

### Flash Firmware
```http
POST /api/v1/trapdoor/pandora/flash
X-Secret-Room-Passcode: token
Content-Type: application/json

{
  "firmware_path": "/path/to/firmware.ipsw",
  "device_serial": "ABC123"
}
```

### WebSocket: Hardware Stream
```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/trapdoor/pandora/hardware/stream');
ws.onmessage = (event) => {
  const status = JSON.parse(event.data);
  console.log(status);
};
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "detail": "Error message here"
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized (missing/invalid token)
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

- **Default**: 100 requests per minute per token
- **Heavy Operations**: 10 requests per minute (transcription, enhancement)

---

**Full OpenAPI/Swagger docs available at**: `/docs` (when FastAPI is running)
