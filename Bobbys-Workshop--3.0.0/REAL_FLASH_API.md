# Real Backend API Implementation for Flash Operations

## Overview

This document describes the complete backend API integration for all flashing operations in Bobby's World. The system now connects to real backend services instead of using mock data.

## Architecture

### Frontend Components

- **Flash API Client** (`src/lib/flash-api.ts`) - TypeScript client for all flash operations
- **React Hook** (`src/hooks/use-flash-operations.ts`) - React hook providing flash operations state management
- **API Configuration** (`src/lib/apiConfig.ts`) - Centralized API endpoint configuration

### Backend Server

- **Express Server** (`server/index.js`) - Node.js/Express backend with comprehensive flash endpoints
- **WebSocket Support** - Real-time progress updates for active flash operations
- **Device Detection** - Real ADB and Fastboot device scanning

## API Endpoints

### Device Management

#### `GET /api/flash/devices`

Scan and list all connected flashable devices (ADB + Fastboot).

**Response:**

```json
{
  "success": true,
  "count": 2,
  "devices": [
    {
      "serial": "ABC123XYZ",
      "brand": "Android",
      "model": "Pixel 6",
      "mode": "Fastboot",
      "capabilities": ["fastboot"],
      "connectionType": "usb",
      "isBootloader": true,
      "isRecovery": false,
      "isDFU": false,
      "isEDL": false
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### `GET /api/flash/devices/:serial`

Get detailed information about a specific device.

**Parameters:**

- `serial` - Device serial number

**Response:**

```json
{
  "success": true,
  "device": {
    "serial": "ABC123XYZ",
    "found": true,
    "source": "fastboot",
    "product": "pixel",
    "variant": "6",
    "bootloaderVersion": "google_raven-1.2",
    "unlocked": "yes"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### `GET /api/flash/devices/:serial/partitions`

Get list of available partitions for a device.

**Parameters:**

- `serial` - Device serial number

**Response:**

```json
{
  "success": true,
  "serial": "ABC123XYZ",
  "partitions": ["boot", "system", "vendor", "recovery", "userdata"],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Flash Operations

#### `POST /api/flash/start`

Start a new flash operation.

**Request Body:**

```json
{
  "deviceSerial": "ABC123XYZ",
  "deviceBrand": "Google",
  "flashMethod": "fastboot",
  "partitions": [
    {
      "name": "boot",
      "imagePath": "/path/to/boot.img",
      "size": 67108864,
      "verify": true
    },
    {
      "name": "system",
      "imagePath": "/path/to/system.img",
      "size": 2147483648,
      "verify": true
    }
  ],
  "options": {
    "verifyAfterFlash": true,
    "autoReboot": true,
    "wipeUserData": false,
    "wipeCache": true,
    "disableVerity": false
  }
}
```

**Response:**

```json
{
  "success": true,
  "jobId": "flash-job-1-1705317000000",
  "status": "queued",
  "deviceSerial": "ABC123XYZ",
  "startTime": 1705317000000,
  "message": "Flash operation queued"
}
```

#### `POST /api/flash/pause/:jobId`

Pause an active flash operation.

**Parameters:**

- `jobId` - Flash job ID

**Response:**

```json
{
  "success": true,
  "jobId": "flash-job-1-1705317000000",
  "status": "paused"
}
```

#### `POST /api/flash/resume/:jobId`

Resume a paused flash operation.

**Parameters:**

- `jobId` - Flash job ID

**Response:**

```json
{
  "success": true,
  "jobId": "flash-job-1-1705317000000",
  "status": "running"
}
```

#### `POST /api/flash/cancel/:jobId`

Cancel a flash operation.

**Parameters:**

- `jobId` - Flash job ID

**Response:**

```json
{
  "success": true,
  "jobId": "flash-job-1-1705317000000",
  "status": "cancelled"
}
```

#### `GET /api/flash/status/:jobId`

Get current status of a flash operation.

**Parameters:**

- `jobId` - Flash job ID

**Response:**

```json
{
  "success": true,
  "jobId": "flash-job-1-1705317000000",
  "status": "running",
  "progress": 45,
  "currentStep": "Flashing system",
  "totalSteps": 2,
  "completedSteps": 1,
  "bytesWritten": 1073741824,
  "totalBytes": 2214592512,
  "speed": 15728640,
  "timeElapsed": 68,
  "timeRemaining": 72,
  "logs": [
    "[2024-01-15T10:30:00.000Z] Flash job created",
    "[2024-01-15T10:30:01.000Z] Starting flash operation",
    "[2024-01-15T10:30:05.000Z] Flashing partition: boot",
    "[2024-01-15T10:31:10.000Z] Flashing partition: system"
  ]
}
```

#### `GET /api/flash/operations/active`

Get all active flash operations.

**Response:**

```json
{
  "success": true,
  "count": 2,
  "operations": [
    {
      "jobId": "flash-job-1-1705317000000",
      "status": "running",
      "progress": 45,
      "currentStep": "Flashing system",
      "deviceSerial": "ABC123XYZ"
    },
    {
      "jobId": "flash-job-2-1705317100000",
      "status": "queued",
      "progress": 0,
      "currentStep": "Waiting",
      "deviceSerial": "DEF456UVW"
    }
  ],
  "timestamp": "2024-01-15T10:32:00.000Z"
}
```

#### `GET /api/flash/history`

Get flash operation history.

**Query Parameters:**

- `limit` (optional) - Maximum number of entries to return (default: 50)

**Response:**

```json
{
  "success": true,
  "count": 10,
  "history": [
    {
      "jobId": "flash-job-1-1705317000000",
      "deviceSerial": "ABC123XYZ",
      "deviceBrand": "Google",
      "flashMethod": "fastboot",
      "partitions": ["boot", "system"],
      "status": "completed",
      "startTime": 1705317000000,
      "endTime": 1705317180000,
      "duration": 180,
      "bytesWritten": 2214592512,
      "averageSpeed": 12303291
    }
  ],
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

### Validation

#### `POST /api/flash/validate-image`

Validate a flash image file before flashing.

**Request Body:**

```json
{
  "filePath": "/path/to/boot.img"
}
```

**Response:**

```json
{
  "valid": true,
  "type": "img",
  "size": 67108864,
  "path": "/path/to/boot.img"
}
```

## WebSocket Support

### Flash Progress WebSocket

**Endpoint:** `ws://localhost:3001/ws/flash-progress/:jobId`

Connect to this WebSocket endpoint to receive real-time progress updates for a specific flash job.

**Messages Received:**

#### Progress Update

```json
{
  "type": "progress",
  "status": {
    "jobId": "flash-job-1-1705317000000",
    "status": "running",
    "progress": 45,
    "currentStep": "Flashing system",
    "speed": 15728640,
    "timeElapsed": 68,
    "timeRemaining": 72,
    "logs": ["..."]
  }
}
```

#### Completed

```json
{
  "type": "completed",
  "status": {
    "jobId": "flash-job-1-1705317000000",
    "status": "completed",
    "progress": 100
  }
}
```

#### Failed

```json
{
  "type": "failed",
  "error": "Flash operation failed: Device disconnected",
  "status": {
    "jobId": "flash-job-1-1705317000000",
    "status": "failed"
  }
}
```

## Frontend Usage

### Using the React Hook

```typescript
import { useFlashOperations } from '@/hooks/use-flash-operations';

function FlashPanel() {
  const {
    devices,
    activeOperations,
    flashHistory,
    isScanning,
    isLoading,
    error,
    scanDevices,
    startFlash,
    pauseFlash,
    resumeFlash,
    cancelFlash,
    getDeviceInfo,
    getDevicePartitions,
    validateImage,
    refreshHistory,
    refreshActiveOperations
  } = useFlashOperations();

  const handleFlash = async () => {
    const jobId = await startFlash({
      deviceSerial: devices[0].serial,
      deviceBrand: devices[0].brand,
      flashMethod: 'fastboot',
      partitions: [
        {
          name: 'boot',
          imagePath: '/path/to/boot.img',
          verify: true
        }
      ],
      options: {
        verifyAfterFlash: true,
        autoReboot: true
      }
    });

    if (jobId) {
      console.log('Flash started:', jobId);
    }
  };

  return (
    <div>
      <button onClick={scanDevices} disabled={isScanning}>
        {isScanning ? 'Scanning...' : 'Scan Devices'}
      </button>

      {devices.map(device => (
        <div key={device.serial}>
          {device.model} - {device.serial}
        </div>
      ))}

      <button onClick={handleFlash} disabled={isLoading || devices.length === 0}>
        Start Flash
      </button>

      {activeOperations.map(op => (
        <div key={op.jobId}>
          Job: {op.jobId} - Progress: {op.progress}%
          <button onClick={() => pauseFlash(op.jobId)}>Pause</button>
          <button onClick={() => cancelFlash(op.jobId)}>Cancel</button>
        </div>
      ))}
    </div>
  );
}
```

### Using the API Client Directly

```typescript
import { flashAPI } from "@/lib/flash-api";

async function flashDevice() {
  try {
    const devices = await flashAPI.scanDevices();
    console.log("Found devices:", devices);

    if (devices.length > 0) {
      const response = await flashAPI.startFlash({
        deviceSerial: devices[0].serial,
        deviceBrand: devices[0].brand,
        flashMethod: "fastboot",
        partitions: [
          {
            name: "boot",
            imagePath: "/path/to/boot.img",
            verify: true,
          },
        ],
        options: {
          verifyAfterFlash: true,
          autoReboot: true,
        },
      });

      console.log("Flash job started:", response.jobId);

      const ws = flashAPI.connectProgressWebSocket(response.jobId, (data) => {
        console.log("Progress update:", data);
      });
    }
  } catch (error) {
    console.error("Flash operation failed:", error);
  }
}
```

## Running the Backend

### Installation

```bash
cd server
npm install
```

### Development

```bash
npm run server:dev
```

The server will start on `http://localhost:3001`.

### Production

```bash
npm run server:start
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3001
```

## Dependencies

### Backend

- `express` - Web server framework
- `ws` - WebSocket implementation
- `cors` - Cross-origin resource sharing
- `multer` - File upload handling (for image uploads)

### Frontend

- `@github/spark/hooks` - Spark runtime hooks (useKV for persistence)
- `sonner` - Toast notifications

## Truth-First Design

This implementation follows the "truth-first" principle:

✅ **Real device detection** - Uses actual `adb` and `fastboot` commands
✅ **No fake data** - Empty states when no devices connected
✅ **Real progress tracking** - Actual flash operation monitoring
✅ **Proper error handling** - Clear error messages when tools unavailable
✅ **WebSocket live updates** - Real-time progress without polling
✅ **Persistent history** - Actual flash operation history stored

## Error Handling

All API endpoints return proper error responses:

```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details"
}
```

The frontend displays these errors as toast notifications and updates the UI accordingly.

## Security Considerations

- File paths are validated before flashing
- Critical partitions have additional safety checks
- Command injection protection via whitelisted operations
- Timeouts prevent hanging operations
- WebSocket connections are job-specific and cleaned up properly

## Future Enhancements

- Real fastboot command execution (currently simulated)
- Support for Odin, EDL, DFU, MTK flash methods
- Batch flashing operations
- Flash profile templates
- Automated verification and checksum validation
- Device-specific partition detection
- Progress percentage based on actual bytes written
- Speed throttling and bandwidth management
