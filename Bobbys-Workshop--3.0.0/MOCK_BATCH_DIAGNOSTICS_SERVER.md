# Mock Batch Diagnostics Server

A comprehensive testing backend for the Batch Diagnostics Panel that simulates real WebSocket-based diagnostic operations across multiple devices.

## Overview

The Mock Batch Diagnostics Server provides a realistic testing environment for batch diagnostic operations without requiring actual hardware or backend infrastructure. It simulates:

- Multiple connected devices (Android & iOS)
- Real-time progress updates via WebSocket
- Batch job orchestration with pause/resume/stop controls
- Diagnostic operation execution (battery health, storage analysis, thermal monitoring)
- Realistic timing and progress reporting
- Success/failure scenarios

## Architecture

```
┌─────────────────────────────────────────┐
│  BatchDiagnosticsPanel (React)          │
│  - UI Controls                          │
│  - Device Selection                     │
│  - Progress Display                     │
└────────────┬────────────────────────────┘
             │
             │ useBatchDiagnosticsWebSocket
             │
┌────────────▼────────────────────────────┐
│  MockBatchDiagnosticsWebSocket         │
│  - WebSocket Interception               │
│  - Browser Integration                  │
└────────────┬────────────────────────────┘
             │
             │ Mock WebSocket Protocol
             │
┌────────────▼────────────────────────────┐
│  MockBatchDiagnosticsServer            │
│  - Job Management                       │
│  - Device Simulation                    │
│  - Progress Streaming                   │
│  - Result Generation                    │
└─────────────────────────────────────────┘
```

## Features

### Mock Devices

The server provides 4 simulated devices:

1. **Google Pixel 6** (ADB mode, confidence: 95%)
2. **Samsung Galaxy S21** (ADB mode, confidence: 92%)
3. **OnePlus 9 Pro** (Fastboot mode, confidence: 88%)
4. **iPhone 13** (Normal mode, confidence: 97%)

### Supported Operations

- **battery-health**: Battery capacity, health status, cycle count, temperature, voltage
- **storage-analyzer**: Storage health, SMART status, wear level, capacity metrics
- **thermal-monitor**: Temperature readings, thermal state, imaging safety status

### WebSocket Protocol

#### Client → Server Messages

```typescript
// Subscribe to batch updates
{ type: 'subscribe', batchId: 'batch-123' }

// Start batch operation
{
  type: 'start_batch',
  batchId: 'batch-123',
  config: {
    deviceIds: ['device-1', 'device-2'],
    operations: ['battery-health', 'storage-analyzer']
  }
}

// Control messages
{ type: 'pause_batch', batchId: 'batch-123' }
{ type: 'resume_batch', batchId: 'batch-123' }
{ type: 'stop_batch', batchId: 'batch-123' }

// Heartbeat
{ type: 'ping' }
```

#### Server → Client Messages

```typescript
// Batch lifecycle
{ type: 'batch_start', batchId: string, timestamp: number, metadata: {...} }
{ type: 'batch_complete', batchId: string, timestamp: number, metadata: {...} }

// Device lifecycle
{ type: 'device_start', batchId: string, deviceId: string, timestamp: number }
{ type: 'device_complete', batchId: string, deviceId: string, status: string }

// Operation lifecycle
{ type: 'operation_start', batchId: string, deviceId: string, operation: string }
{ type: 'operation_complete', batchId: string, deviceId: string, operation: string, data: {...} }

// Progress updates
{
  type: 'progress',
  batchId: string,
  deviceId: string,
  operation: string,
  progress: number,  // 0-100
  status: 'running' | 'paused' | 'completed' | 'failed'
}

// Heartbeat response
{ type: 'pong', timestamp: number }
```

## Usage

### Automatic Initialization

The mock server is automatically initialized when the app starts:

```tsx
// App.tsx
useEffect(() => {
  MockBatchDiagnosticsWebSocket.initialize();
  return () => MockBatchDiagnosticsWebSocket.cleanup();
}, []);
```

### WebSocket Connection

The hook automatically connects to the mock server:

```tsx
const {
  isConnected,
  connectionStatus,
  lastEvent,
  events,
  startBatch,
  pauseBatch,
  resumeBatch,
  stopBatch,
} = useBatchDiagnosticsWebSocket();
```

### Starting a Batch Job

```tsx
const handleStartBatch = () => {
  const batchId = `batch-${Date.now()}`;

  startBatch(batchId, {
    deviceIds: ["adb-ABC123XYZ", "adb-DEF456UVW"],
    operations: ["battery-health", "storage-analyzer", "thermal-monitor"],
  });
};
```

### Monitoring Progress

```tsx
useEffect(() => {
  const unsubscribe = on("progress", (event) => {
    console.log(`Progress: ${event.progress}%`, event);
  });

  return unsubscribe;
}, [on]);
```

## Realistic Behavior

### Timing

- **Operation duration**: 500-2000ms per operation
- **Device transition**: 500ms between devices
- **Progress updates**: 100-300ms intervals
- **Total batch time**: ~3-8 seconds depending on configuration

### Success/Failure Rates

- **Device success rate**: 90% (configurable)
- **Operation reliability**: Varies by type
- **Network simulation**: Automatic reconnection with backoff

### Result Generation

Each operation generates realistic mock data:

**Battery Health:**

```json
{
  "status": "healthy",
  "capacity": 92,
  "health": "Good",
  "cycles": 234,
  "temperature": 32,
  "voltage": 4.1
}
```

**Storage Analyzer:**

```json
{
  "status": "healthy",
  "totalSpace": 128000,
  "usedSpace": 67500,
  "health": "Excellent",
  "smartStatus": "PASSED",
  "wearLevel": 12
}
```

**Thermal Monitor:**

```json
{
  "status": "normal",
  "temperature": 38,
  "cpuTemp": 42,
  "batteryTemp": 34,
  "thermalState": "normal",
  "safeForImaging": true
}
```

## Testing Scenarios

### Normal Operation

1. Select multiple devices
2. Choose operations
3. Click "Start Batch"
4. Watch real-time progress
5. Review results

### Pause & Resume

1. Start batch
2. Click "Pause" mid-operation
3. Progress halts
4. Click "Resume"
5. Operation continues from same point

### Stop Operation

1. Start batch
2. Click "Stop" at any time
3. Current operation completes
4. Batch terminates gracefully

### Connection Loss

1. Server automatically attempts reconnection
2. Exponential backoff (3s base, max 10 attempts)
3. UI shows connection status
4. Operations resume on reconnect

## Configuration

### Custom Port

```typescript
useBatchDiagnosticsWebSocket({
  wsUrl: "ws://localhost:3002/ws/batch-diagnostics",
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
});
```

### Mock Device Customization

Edit `src/lib/mock-batch-diagnostics-server.ts`:

```typescript
private mockDevices: MockDevice[] = [
  {
    device_uid: 'custom-device-001',
    platform_hint: 'android',
    mode: 'adb',
    confidence: 0.98,
    vendor: 'Xiaomi',
    product: 'Mi 11',
  },
  // ... more devices
];
```

## Debugging

### Console Output

The mock server provides detailed logging:

```
[MockBatchDiagnosticsServer] Initializing on port 3001...
[MockBatchDiagnosticsServer] Server started (mock mode)
[MockBatchDiagnosticsServer] Client connected (1 total)
[MockBatchDiagnosticsServer] Starting batch: batch-1701234567890
[MockBatchDiagnosticsServer] Batch completed: batch-1701234567890
```

### Event Inspection

All events are stored in the hook:

```tsx
const { events } = useBatchDiagnosticsWebSocket();

console.log("All events:", events);
console.log("Last 10 events:", events.slice(-10));
```

### Manual Testing

```typescript
// Get server instance
const server = MockBatchDiagnosticsWebSocket.getServer();

// Inspect active jobs
const jobs = server?.getActiveJobs();

// Get mock devices
const devices = server?.getMockDevices();
```

## Limitations

### What It Does NOT Simulate

- Actual USB device detection
- Real hardware diagnostic tools (ADB, fastboot, etc.)
- Persistent storage of results
- Multi-client coordination
- Network latency or packet loss

### Production Migration

When moving to production:

1. Remove `MockBatchDiagnosticsWebSocket.initialize()` from App.tsx
2. Deploy real WebSocket backend server
3. Update `wsUrl` in hook configuration
4. Keep all UI code unchanged (protocol-compatible)

## Files

```
src/
├── lib/
│   ├── mock-batch-diagnostics-server.ts      # Core server logic
│   └── mock-batch-diagnostics-websocket.ts   # Browser integration
├── hooks/
│   └── use-batch-diagnostics-websocket.ts    # React hook
└── components/
    └── BatchDiagnosticsPanel.tsx             # UI component
```

## Next Steps

To implement the real backend:

1. **Backend Server** (Node.js/Python):

   - Implement same WebSocket protocol
   - Connect to real device APIs (ADB, BootForge USB, etc.)
   - Add authentication and authorization
   - Implement result persistence

2. **Frontend Updates**:

   - Update WebSocket URL to production endpoint
   - Add authentication tokens
   - Remove mock server initialization

3. **Additional Features**:
   - Historical batch results
   - Device filtering and search
   - Custom diagnostic scripts
   - Email/webhook notifications on completion

## License

Part of Bobby's World Workshop & Repair Toolkit.
