# Universal Flash Station - Real BootForge USB Integration

## Overview

The Universal Flash Station is a comprehensive multi-brand phone flashing interface with real-time WebSocket-based progress tracking, pause/resume controls, and support for **20+ device manufacturers**.

## Architecture

### Frontend (React/TypeScript)

- **UniversalFlashPanel**: Main UI component for device selection and flash operations
- **useBootForgeFlash**: React hook managing WebSocket connections and API calls
- **bootforge-api**: API client for BootForge USB backend
- **Type definitions**: Complete TypeScript types for 20+ device brands

### Backend Requirements

The frontend expects a BootForge USB backend server running on:

- **REST API**: `http://localhost:8000` (configurable via `VITE_BOOTFORGE_API_URL`)
- **WebSocket**: `ws://localhost:8000` (configurable via `VITE_BOOTFORGE_WS_URL`)

## Supported Device Brands

The system includes comprehensive support for:

### Android Manufacturers

- **Samsung** (Odin, Heimdall, Fastboot)
- **Google Pixel** (Fastboot, ADB Sideload)
- **Xiaomi** (Fastboot, EDL mode)
- **OnePlus** (Fastboot, ADB Sideload)
- **Motorola** (Fastboot)
- **LG** (Fastboot, Recovery)
- **Huawei** (Fastboot)
- **OPPO** (Fastboot, Recovery)
- **Vivo** (Fastboot, Recovery)
- **Realme** (Fastboot)
- **ASUS** (Fastboot, ADB Sideload)
- **Sony** (Fastboot)
- **Nokia** (Fastboot)
- **HTC** (Fastboot)
- **ZTE** (Fastboot, EDL)
- **Lenovo** (Fastboot)
- **TCL** (Fastboot)
- **Honor** (Fastboot)
- **Nothing** (Fastboot)
- **Fairphone** (Fastboot, ADB Sideload)

### iOS Devices

- **Apple** (DFU mode)

## Backend API Endpoints

### Device Management

#### `POST /api/bootforge/devices/scan`

Scan for connected USB devices

```json
Response: {
  "devices": [
    {
      "serial": "ABC123XYZ",
      "usbPath": "/dev/bus/usb/001/002",
      "vendorId": "18d1",
      "productId": "4ee7",
      "manufacturer": "Google",
      "model": "Pixel 6",
      "brand": "google",
      "platform": "android",
      "currentMode": "fastboot",
      "bootloaderUnlocked": true,
      "capabilities": { ... },
      "confidence": 0.95,
      "lastSeen": 1234567890
    }
  ]
}
```

#### `GET /api/bootforge/devices`

Get all connected devices

```json
Response: {
  "devices": [ ... ]
}
```

#### `GET /api/bootforge/devices/{serial}`

Get detailed information about a specific device

```json
Response: {
  "serial": "ABC123XYZ",
  "brand": "google",
  ...
}
```

#### `GET /api/bootforge/devices/{serial}/bootloader-status`

Check bootloader unlock status

```json
Response: {
  "unlocked": true,
  "canUnlock": true
}
```

#### `POST /api/bootforge/devices/{serial}/reboot`

Reboot device to different mode

```json
Request: {
  "mode": "bootloader" | "recovery" | "normal" | "download" | "edl"
}
Response: {
  "success": true
}
```

### Flash Operations

#### `POST /api/bootforge/flash/start`

Start a flash operation

```json
Request: {
  "deviceSerial": "ABC123XYZ",
  "deviceBrand": "google",
  "flashMethod": "fastboot",
  "partitions": [
    {
      "name": "boot",
      "imagePath": "/path/to/boot.img",
      "size": 67108864
    },
    {
      "name": "system",
      "imagePath": "/path/to/system.img",
      "size": 2147483648
    }
  ],
  "verifyAfterFlash": true,
  "autoReboot": true,
  "wipeUserData": false
}

Response: {
  "id": "flash-job-uuid",
  "jobConfig": { ... },
  "progress": {
    "jobId": "flash-job-uuid",
    "deviceSerial": "ABC123XYZ",
    "deviceBrand": "google",
    "status": "preparing",
    "overallProgress": 0,
    "bytesTransferred": 0,
    "totalBytes": 2214592512,
    "transferSpeed": 0,
    "estimatedTimeRemaining": 0,
    "currentStage": "Initializing",
    "startedAt": 1234567890,
    "warnings": []
  },
  "logs": [],
  "canPause": true,
  "canResume": false,
  "canCancel": true
}
```

#### `POST /api/bootforge/flash/{jobId}/pause`

Pause an active flash operation

```json
Response: {
  "success": true,
  "message": "Flash operation paused"
}
```

#### `POST /api/bootforge/flash/{jobId}/resume`

Resume a paused flash operation

```json
Response: {
  "success": true,
  "message": "Flash operation resumed"
}
```

#### `POST /api/bootforge/flash/{jobId}/cancel`

Cancel a flash operation

```json
Response: {
  "success": true,
  "message": "Flash operation cancelled"
}
```

#### `GET /api/bootforge/flash/{jobId}/status`

Get current status of a flash operation

```json
Response: {
  "jobId": "flash-job-uuid",
  "status": "flashing",
  "overallProgress": 45,
  "currentPartition": "system",
  "bytesTransferred": 967050240,
  "transferSpeed": 25.6,
  ...
}
```

#### `GET /api/bootforge/flash/active`

Get all active flash operations

```json
Response: {
  "operations": [ ... ]
}
```

#### `GET /api/bootforge/flash/history?limit=50`

Get flash operation history

```json
Response: {
  "operations": [ ... ]
}
```

#### `POST /api/bootforge/validate-image`

Validate a firmware image

```json
Request: {
  "imagePath": "/path/to/firmware.img"
}
Response: {
  "valid": true,
  "size": 67108864,
  "partitions": ["boot", "system", "vendor"]
}
```

## WebSocket Protocol

### Device Monitor WebSocket

**URL**: `ws://localhost:8000/ws/bootforge/devices`

Streams real-time device connection/disconnection events:

```json
{
  "type": "device_connected" | "device_disconnected",
  "device": {
    "serial": "ABC123XYZ",
    "brand": "google",
    ...
  },
  "timestamp": 1234567890
}
```

### Flash Progress WebSocket

**URL**: `ws://localhost:8000/ws/bootforge/flash/{jobId}`

Streams real-time flash progress updates:

```json
{
  "type": "status" | "progress" | "log" | "warning" | "error",
  "jobId": "flash-job-uuid",
  "timestamp": 1234567890,
  "data": {
    "status": "flashing",
    "progress": 45,
    "message": "Writing partition: system",
    "bytesTransferred": 967050240,
    "transferSpeed": 25.6
  }
}
```

## Flash Methods by Brand

### Fastboot (Most Android devices)

Standard Google-developed flashing protocol

```bash
fastboot flash boot boot.img
fastboot flash system system.img
fastboot reboot
```

### Odin/Heimdall (Samsung)

Samsung-specific flashing protocol

```bash
heimdall flash --BOOT boot.img --SYSTEM system.img
```

### EDL (Emergency Download Mode)

Qualcomm emergency flashing mode

- Used for deeply bricked devices
- Requires special tools (edl.py, QFIL)

### DFU (Apple iOS)

Device Firmware Update mode for iPhones/iPads

- Requires iTunes/Finder or third-party tools
- Limited by Apple security restrictions

### ADB Sideload

Over-the-air style updates via recovery

```bash
adb sideload update.zip
```

## Example Backend Implementation (Python/FastAPI)

```python
from fastapi import FastAPI, WebSocket
from fastapi.responses import JSONResponse
import asyncio

app = FastAPI()

# Device scanning
@app.post("/api/bootforge/devices/scan")
async def scan_devices():
    # Implement USB scanning logic here
    devices = []
    # Scan USB devices using pyusb, libusb, etc.
    return {"devices": devices}

# Start flash operation
@app.post("/api/bootforge/flash/start")
async def start_flash(config: FlashJobConfig):
    job_id = generate_job_id()

    # Start async flash task
    asyncio.create_task(execute_flash_operation(job_id, config))

    return {
        "id": job_id,
        "jobConfig": config,
        "progress": initialize_progress(job_id, config),
        "logs": [],
        "canPause": True,
        "canResume": False,
        "canCancel": True
    }

# Flash progress WebSocket
@app.websocket("/ws/bootforge/flash/{job_id}")
async def flash_progress_ws(websocket: WebSocket, job_id: str):
    await websocket.accept()

    try:
        while True:
            # Stream flash progress
            progress_update = get_flash_progress(job_id)
            await websocket.send_json(progress_update)
            await asyncio.sleep(0.5)
    except:
        pass

# Pause/Resume/Cancel operations
@app.post("/api/bootforge/flash/{job_id}/pause")
async def pause_flash(job_id: str):
    success = pause_flash_job(job_id)
    return {"success": success, "message": "Flash operation paused"}

@app.post("/api/bootforge/flash/{job_id}/resume")
async def resume_flash(job_id: str):
    success = resume_flash_job(job_id)
    return {"success": success, "message": "Flash operation resumed"}

@app.post("/api/bootforge/flash/{job_id}/cancel")
async def cancel_flash(job_id: str):
    success = cancel_flash_job(job_id)
    return {"success": success, "message": "Flash operation cancelled"}
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_BOOTFORGE_API_URL=http://localhost:8000
VITE_BOOTFORGE_WS_URL=ws://localhost:8000
```

### Frontend Usage

```tsx
import { UniversalFlashPanel } from "@/components/UniversalFlashPanel";

function App() {
  return <UniversalFlashPanel />;
}
```

## Features

### ✅ Multi-Brand Support

- 20+ device manufacturers
- Brand-specific flash methods
- Automatic capability detection

### ✅ Pause/Resume Control

- Pause flash operations mid-transfer
- Resume from exact position
- Cancel with cleanup

### ✅ Real-Time Monitoring

- WebSocket-based live updates
- Transfer speed tracking
- ETA calculations
- Per-partition progress

### ✅ Safety Features

- Bootloader unlock verification
- Partition validation
- User data wipe warnings
- Brand-specific safety warnings

### ✅ Comprehensive Logging

- Detailed operation logs
- Warning messages
- Error reporting with recovery hints

## Development

### Prerequisites

- Node.js 18+
- Python 3.10+ (for backend)
- USB access permissions
- ADB/Fastboot tools installed

### Running Frontend

```bash
npm install
npm run dev
```

### Testing Without Backend

The hook gracefully handles connection failures and will show appropriate UI states when the backend is unavailable.

## Security Considerations

⚠️ **WARNING**: Flashing operations can permanently damage devices if done incorrectly.

- Always verify bootloader unlock status
- Validate firmware images before flashing
- Provide clear warnings for destructive operations
- Implement user confirmation for data wipe
- Log all operations for audit trails

## Troubleshooting

### WebSocket Connection Failed

- Check backend is running on correct port
- Verify CORS settings
- Check firewall rules

### Device Not Detected

- Ensure USB debugging enabled
- Check USB drivers installed
- Verify ADB/Fastboot in PATH
- Try different USB cable/port

### Flash Operation Fails

- Verify bootloader unlocked
- Check firmware compatibility
- Ensure sufficient USB power
- Review device-specific requirements

## License

MIT License - Educational and repair purposes only
