# Batch Diagnostics Real Device Integration

## Overview

The Batch Diagnostics Panel now connects to real device operations with live progress streaming via WebSocket. This enables running diagnostics across multiple connected devices simultaneously with real-time updates.

## Key Features

### 1. **Real Device Detection**

- Scans for connected devices via backend API (`/api/devices/scan`)
- Polls every 10 seconds to keep device list fresh
- Displays device platform, mode, confidence, and matched tool IDs
- Shows correlation badges (CORRELATED, SYSTEM-CONFIRMED, LIKELY, UNCONFIRMED)

### 2. **Real ADB/Backend Integration**

- Plugin contexts now execute real ADB commands via backend API
- Battery health diagnostics call `/api/adb/shell` with real device IDs
- Storage analyzer executes real storage commands
- Thermal monitor reads actual temperature zones
- Uses Spark KV storage for persistent plugin data

### 3. **WebSocket Progress Streaming**

- Connects to `ws://localhost:3001/ws/batch-diagnostics`
- Real-time progress updates for each device
- Device-level events: `device_start`, `device_complete`, `progress`, `error`
- Operation-level events: `operation_start`, `operation_complete`
- Batch-level events: `batch_start`, `batch_complete`
- Auto-reconnect with exponential backoff (10 attempts, 3s interval)
- Heartbeat ping/pong to maintain connection

### 4. **Batch Operation Control**

- **Sequential Mode**: Process devices one at a time
- **Parallel Mode**: Process 1-5 devices concurrently
- **Pause/Resume**: Pause mid-operation and resume later
- **Stop**: Cancel entire batch operation
- Real-time status updates per device (pending, running, completed, failed, paused)

### 5. **Live Progress Display**

- Per-device progress bars showing completion percentage
- Current operation display (e.g., "Running battery diagnostic...")
- Completed operations list per device
- Error messages per device with detailed context
- Duration tracking (start time to end time)
- Live status badges with color coding

## Backend API Requirements

The frontend expects these backend endpoints:

### Device Scanning

```typescript
GET /api/devices/scan
Response: {
  devices: [
    {
      device_uid: string,
      platform_hint: string,
      mode: string,
      confidence: number,
      evidence: any,
      matched_tool_ids: string[],
      correlation_badge: any,
      display_name?: string
    }
  ]
}
```

### ADB Operations

```typescript
POST /api/adb/shell
Body: { deviceId: string, command: string }
Response: { output: string, error?: string }

POST /api/adb/execute
Body: { deviceId: string, command: string }
Response: { output: string, error?: string }
```

### WebSocket Events

```typescript
// Client → Server
{
  type: 'subscribe' | 'unsubscribe' | 'start_batch' | 'pause_batch' | 'resume_batch' | 'stop_batch',
  batchId: string,
  config?: {
    devices: string[],
    diagnostics: string[],
    concurrencyMode: 'sequential' | 'parallel',
    maxConcurrent: number
  }
}

// Server → Client
{
  type: 'progress' | 'device_start' | 'device_complete' | 'operation_start' | 'operation_complete' | 'batch_complete' | 'error',
  batchId: string,
  deviceId?: string,
  operation?: string,
  progress?: number,
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'paused',
  data?: any,
  error?: string,
  timestamp: number,
  metadata?: {
    totalDevices?: number,
    completedDevices?: number,
    failedDevices?: number,
    currentOperation?: string,
    estimatedTimeRemaining?: number
  }
}
```

## Plugin Integration

### Battery Health Plugin

- Executes `dumpsys battery` via ADB
- Parses battery capacity, health, temperature, voltage
- Returns structured `BatteryHealthData`

### Storage Analyzer Plugin

- Executes `df` and storage commands via ADB
- Analyzes SMART data and wear levels
- Returns structured `StorageHealthData`

### Thermal Monitor Plugin

- Executes `cat /sys/class/thermal/*/temp` via ADB
- Monitors temperature zones and throttling
- Returns structured `ThermalHealthData`

## UI Components

### Device Cards

- Checkbox for selection
- Status icon (spinning for running, check for completed, X for failed)
- Device UID and display name
- Platform and mode information
- Matched tool IDs
- Progress bar (when running)
- Completed operations list
- Error messages (if any)
- Duration (when completed)

### Diagnostic Selection

- Battery Health checkbox
- Storage Health checkbox
- Thermal Monitor checkbox
- Descriptions for each diagnostic type

### Execution Mode

- Sequential/Parallel dropdown
- Max concurrent devices (1-5) for parallel mode
- Start/Pause/Resume/Stop buttons
- Batch status summary (selected, running, completed, failed)

### WebSocket Status

- Connection indicator (WiFi icon)
- Connection status text (Connected, Connecting, Disconnected, Error)
- Batch ID display when running
- Pulsing indicator during active batch

## Error Handling

### Connection Errors

- Auto-reconnect with exponential backoff
- Visual feedback when connection lost
- Prevents starting batch without WebSocket connection
- Toast notifications for connection state changes

### Device Errors

- Per-device error tracking
- Error messages displayed in device cards
- Failed status with red badge
- Batch continues with remaining devices
- Summary shows failed count at completion

### Operation Errors

- Graceful degradation (continue to next operation)
- Error messages with operation context
- ADB command errors caught and displayed
- Plugin execution errors tracked per device

## Usage Flow

1. **Scan Devices**: Click "Refresh Devices" or wait for auto-scan
2. **Select Devices**: Check devices you want to diagnose
3. **Choose Diagnostics**: Select which diagnostics to run
4. **Configure Mode**: Choose sequential or parallel execution
5. **Start Batch**: Click "Start Batch Operation"
6. **Monitor Progress**: Watch real-time updates per device
7. **Control Flow**: Pause/Resume/Stop as needed
8. **View Results**: Check completed operations and errors

## Performance Considerations

- WebSocket connection reuses single socket for all events
- Device polling throttled to 10-second intervals
- Progress updates batched to avoid UI thrashing
- Event history limited to last 100 events
- Parallel mode limited to 5 devices max to avoid backend overload

## Security

- All ADB commands executed through backend API (no direct device access)
- Device IDs validated on backend
- WebSocket authentication should be added for production
- Plugin permissions checked via context
- Evidence stored in Spark KV with user isolation

## Future Enhancements

- [ ] Add backend mock server for development
- [ ] Implement WebSocket authentication
- [ ] Add progress estimation based on historical data
- [ ] Export batch results to evidence bundle
- [ ] Add scheduling for recurring batch diagnostics
- [ ] Device grouping for batch operations
- [ ] Custom diagnostic profiles
- [ ] Notification system for batch completion
- [ ] Retry failed devices automatically
- [ ] Detailed diagnostic reports per device
