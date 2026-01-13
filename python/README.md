# REFORGE OS Python Worker

Stateless worker service for device inspection, log collection, and report formatting.

## Purpose

This Python service is **not a controller**. It is a **worker**.

- Receives requests from Rust (Pandora/Crucible)
- Performs analysis / parsing / probing
- Returns results
- **Never decides what is allowed**

All authority stays in Rust.

## Structure

```
python/
├── app/
│   ├── main.py        # Server + lifecycle
│   ├── health.py       # Health check handler
│   ├── inspect.py     # Device inspection handlers
│   ├── logs.py         # Log collection handler
│   ├── report.py       # Report formatting handler
│   └── policy.py       # Policy mirror (refusal, never escalation)
├── requirements.txt    # Minimal dependencies
└── runtime/           # Embedded Python interpreter (bundled)
```

## API Endpoints

### GET /health
Returns health status.

**Response:**
```json
{
  "status": "ok",
  "version": "py-worker-1.0.0",
  "uptime_ms": 12345
}
```

### POST /inspect/basic
Basic device inspection.

**Request:**
```json
{
  "device_id": "dev_001",
  "platform": "ios",
  "payload": {
    "hints": {
      "connection": "usb"
    }
  }
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "activation_locked": true,
    "mdm_enrolled": false,
    "frp_locked": null,
    "efi_locked": null
  },
  "warnings": []
}
```

### POST /inspect/deep
Deep device inspection.

### POST /logs/collect
Collect device logs.

### POST /report/format
Format report.

## Running

### Development Mode

```bash
cd python/app
python main.py --port 8001 --policy-mode public
```

### Production Mode

Launched automatically by Tauri app. No manual startup needed.

## Rules

❌ No device mutations
❌ No persistent state
❌ No shell access
❌ No user scripts
✅ Stateless handlers
✅ Deterministic
✅ Logged

## Policy

Python **mirrors** Rust policy but **never overrides** it.

If policy disallows an action, Python returns 403.

Python never escalates permissions.
