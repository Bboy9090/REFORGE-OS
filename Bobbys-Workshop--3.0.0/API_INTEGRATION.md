# API Integration Guide

## Overview

The Pandora Codex Control Room now connects to real backend API endpoints for all operations including flash management, performance monitoring, automated testing, benchmark standards, and live device hotplug events.

## Backend Server

### Starting the Server

```bash
# Install server dependencies (first time only)
npm run server:install

# Start the backend server
npm run server:dev
```

The server runs on **http://localhost:3001** by default.

### Server Features

- **Flash Operations API** - Start demo flashes and track history
- **Performance Monitoring API** - Real-time metrics collection
- **Automated Testing API** - Run test suites and retrieve results
- **Benchmark Standards API** - Industry reference data
- **Hotplug Events WebSocket** - Live device connection/disconnection events
- **Device Detection** - ADB, Fastboot, BootForgeUSB integration
- **System Tools** - Detect installed development tools

## API Endpoints

### Flash Operations

**GET `/api/flash/history`**

- Returns array of past flash operations
- No authentication required

**POST `/api/flash/start`**

- Starts a new demo flash operation
- Returns operation entry with ID and timestamp
- Response: `{ status: 'started', entry: {...} }`

### Performance Monitoring

**POST `/api/monitor/start`**

- Activates performance monitoring
- Response: `{ status: 'monitoring started', active: true }`

**POST `/api/monitor/stop`**

- Stops performance monitoring
- Response: `{ status: 'monitoring stopped', active: false }`

**GET `/api/monitor/live`**

- Returns current performance metrics
- Polls every 2 seconds when monitoring is active
- Response:

```json
{
  "speed": "25.43",
  "cpu": 45,
  "memory": 62,
  "usb": 78,
  "disk": 35,
  "baseline": 21.25,
  "timestamp": "2024-01-15T10:30:00Z",
  "active": true
}
```

### Automated Testing

**POST `/api/tests/run`**

- Executes the automated test suite
- Response:

```json
{
  "id": 1234567890,
  "timestamp": "2024-01-15T10:30:00Z",
  "results": [
    {
      "name": "Device Detection Test",
      "status": "PASS",
      "duration": 234,
      "details": "All device detection methods working correctly"
    }
  ],
  "summary": {
    "total": 4,
    "passed": 3,
    "failed": 0,
    "warnings": 1
  }
}
```

**GET `/api/tests/results`**

- Returns test history (last 20 runs)

### Benchmark Standards

**GET `/api/standards`**

- Returns industry benchmark reference data
- Response:

```json
{
  "standards": [
    {
      "category": "flash_speed",
      "metric": "Flash Speed",
      "levels": [
        {
          "level": "Optimal",
          "threshold": "> 500 MB/s",
          "description": "USB 3.2 Gen 2 (Best-in-class)"
        }
      ]
    }
  ],
  "reference": "USB-IF, JEDEC, Android Platform Tools",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Hotplug Events

**WebSocket `ws://localhost:3001/ws/device-events`**

- Live stream of device connection/disconnection events
- Automatically sends events every 8 seconds (demo mode)
- Event format:

```json
{
  "type": "connected",
  "device_uid": "device-abc123xyz",
  "platform_hint": "android",
  "mode": "Normal OS (Confirmed)",
  "confidence": 0.95,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "display_name": "Demo Android Device",
  "matched_tool_ids": ["ABC123XYZ"],
  "correlation_badge": "CORRELATED",
  "correlation_notes": ["Per-device correlation present"]
}
```

### Device Detection (Existing)

**GET `/api/system-tools`**

- Detects installed development tools
- Returns versions of Rust, Node, Python, Git, Docker, ADB, Fastboot

**GET `/api/adb/devices`**

- Lists connected Android devices via ADB
- Returns device properties, modes, and correlation data

**GET `/api/fastboot/devices`**

- Lists devices in bootloader mode
- Returns bootloader information and unlock status

**GET `/api/bootforgeusb/scan`**

- Scans USB devices using BootForgeUSB
- Provides platform detection and correlation

## Frontend Components

### PandoraFlashPanel

**Location:** `src/components/PandoraFlashPanel.tsx`

**Features:**

- Fetches flash history from backend on mount
- Starts demo flash operations via API
- Shows real-time progress tracking
- Automatically refreshes history after completion

**API Integration:**

- `useEffect` → Fetches `/api/flash/history` on load
- `startDemoFlash()` → POSTs to `/api/flash/start`
- Auto-refreshes history after operation completes

### RealTimeFlashMonitor

**Location:** `src/components/RealTimeFlashMonitor.tsx`

**Features:**

- Connects to backend monitoring API
- Polls live metrics every 2 seconds
- Displays transfer speed, CPU, memory, USB, disk I/O
- Detects bottlenecks based on real data

**API Integration:**

- `startMonitoring()` → POSTs to `/api/monitor/start`
- `startMetricsCollection()` → Polls `/api/monitor/live` every 2s
- `stopMonitoring()` → POSTs to `/api/monitor/stop`

### AutomatedTestingDashboard

**Location:** `src/components/AutomatedTestingDashboard.tsx`

**Features:**

- Runs automated tests via backend
- Shows progress indicator
- Displays test results with pass/fail status
- Saves test history to local storage

**API Integration:**

- `runTests()` → POSTs to `/api/tests/run`
- Maps backend response to frontend TestResult format
- Uses `useKV` to persist test history

### LiveDeviceHotplugMonitor

**Location:** `src/components/LiveDeviceHotplugMonitor.tsx`

**Features:**

- Connects to WebSocket for real-time device events
- Shows connection/disconnection events
- Displays correlation badges
- Audio notifications for device events

**API Integration:**

- Uses `useDeviceHotplug` hook
- Auto-connects to `ws://localhost:3001/ws/device-events`
- Handles WebSocket reconnection
- Integrates with audio notification system

## Configuration

### API Base URL

**File:** `src/lib/apiConfig.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  ENDPOINTS: {
    // ... all endpoints
  },
  TIMEOUT: 10000,
};
```

### Environment Variables

Create `.env` in the project root:

```bash
VITE_API_URL=http://localhost:3001
```

For production:

```bash
VITE_API_URL=https://your-api-server.com
```

## Error Handling

All components include error handling for API failures:

1. **Network Errors** - Shows toast notification "backend may be offline"
2. **API Errors** - Logs to console and shows user-friendly message
3. **Timeout Handling** - 10-second timeout on all requests
4. **Graceful Degradation** - Components continue to work with cached data

## Development Workflow

### Running Locally

Terminal 1 - Backend:

```bash
npm run server:dev
```

Terminal 2 - Frontend:

```bash
npm run dev
```

### Testing API Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Flash history
curl http://localhost:3001/api/flash/history

# Start monitoring
curl -X POST http://localhost:3001/api/monitor/start

# Get live metrics
curl http://localhost:3001/api/monitor/live

# Run tests
curl -X POST http://localhost:3001/api/tests/run

# Get standards
curl http://localhost:3001/api/standards
```

### WebSocket Testing

Use a WebSocket client or browser console:

```javascript
const ws = new WebSocket("ws://localhost:3001/ws/device-events");
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

## Production Deployment

### Backend Deployment

1. Deploy Express server to your hosting provider (Railway, Render, etc.)
2. Update CORS settings in `server/index.js`
3. Set environment variables (PORT, etc.)
4. Ensure WebSocket support is enabled

### Frontend Configuration

1. Update `.env.production`:

```bash
VITE_API_URL=https://your-api-domain.com
```

2. Build frontend:

```bash
npm run build
```

3. Deploy `dist/` folder to static hosting

## Troubleshooting

### "Backend may be offline" error

**Solution:** Ensure backend server is running on port 3001

```bash
npm run server:dev
```

### WebSocket connection failed

**Solution:** Check that WebSocket path is correct and server supports WS

- Path: `/ws/device-events`
- URL: `ws://localhost:3001/ws/device-events`

### CORS errors

**Solution:** Backend already has CORS enabled. Check network tab for actual error.

### "Failed to fetch" errors

**Solution:**

1. Verify backend is running
2. Check API_CONFIG.BASE_URL in `src/lib/apiConfig.ts`
3. Ensure no proxy/firewall blocking port 3001

## Next Steps

1. **Real Device Integration** - Connect actual BootForgeUSB scans
2. **Authentication** - Add API keys or JWT tokens
3. **Rate Limiting** - Implement request throttling
4. **Caching** - Add Redis for performance
5. **Analytics** - Track API usage and performance
6. **Webhooks** - Send events to external services

## Resources

- Express Documentation: https://expressjs.com/
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
