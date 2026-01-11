# Device Flashing Integration Guide

## Overview

The Device Flashing Dashboard provides comprehensive firmware flashing capabilities with real-time progress tracking, performance monitoring, and correlation with device detection.

## Features

### 1. Real-Time Progress Tracking

- **Live Progress Bars**: Visual percentage completion with smooth animations
- **Speed Metrics**: Current, average, and peak transfer speeds
- **ETA Calculation**: Accurate time remaining estimates based on current performance
- **Speed History Graph**: Visual timeline of transfer speeds during flashing
- **Status Updates**: Real-time status indicators (preparing, flashing, verifying, completed, error)

### 2. Device Detection & Correlation

- **Automatic Device Scanning**: Detect devices via USB using BootForgeUSB backend
- **Correlation Badges**: Visual indicators showing device identification confidence
  - `CORRELATED`: Device fully matched with tool IDs
  - `SYSTEM-CONFIRMED`: OS-level confirmation present
  - `LIKELY`: Probable platform detection
  - `UNCONFIRMED`: Device detected but not verified
- **Matched IDs**: Display of correlated device identifiers (ADB serial, Fastboot serial, UDID)
- **Multi-Device Support**: Handle multiple connected devices simultaneously

### 3. Performance Monitoring

- **Transfer Speed Tracking**: Monitor real-time data transfer rates
- **Bottleneck Detection**: Identify performance issues (USB, CPU, memory, disk)
- **Historical Baseline**: Compare current performance against past flashing operations
- **Metrics Dashboard**: Comprehensive view of all performance indicators

### 4. Flash Job Management

- **Job Queue**: Manage multiple flash operations
- **Job History**: Complete record of all flash operations with metrics
- **Job Status**: Track queued, running, completed, failed, and cancelled jobs
- **Automatic Profiles**: Create speed profiles for each completed flash

### 5. Safety Features

- **Device Mode Verification**: Ensure device is in fastboot mode before flashing
- **On-Screen Device State Guide**: Each workflow shows required device mode (fastboot/download/edl/dfu/recovery) and entry steps in-panel
- **Battery Check Reminder**: Warn users about device battery levels
- **USB Stability Warning**: Alert about stable connection requirements
- **Error Handling**: Graceful error recovery with detailed error messages
- **Cancel Operation**: Ability to safely cancel in-progress flash operations

## Architecture

### Components

#### `DeviceFlashingDashboard.tsx`

Main dashboard component integrating all flashing functionality.

**Key Features:**

- Device scanning and selection
- Partition selection
- Flash job initiation and management
- Metrics aggregation and display
- History tracking

**State Management:**

```typescript
- devices: Device[]              // Connected devices
- selectedDevice: string         // Currently selected device serial
- selectedPartition: string      // Target partition
- flashJobs: FlashJob[]          // All flash jobs (stored in KV)
- activeJob: FlashJob | null     // Currently running job
- metrics: FlashMetrics          // Aggregated performance metrics
```

#### `FlashProgressMonitor.tsx`

Real-time progress display component with animated visualizations.

**Key Features:**

- Live progress bar with percentage
- Current/average/peak speed display
- Time elapsed and ETA
- Speed history graph
- Status indicators
- Error display

**Hooks:**

- `useFlashProgressSimulator()`: Development-only progress simulation for UI work. Do not treat this as a real flash execution path.

#### `FlashSpeedProfiler.tsx`

Performance profiling and analysis component.

**Key Features:**

- Speed variance analysis
- Transfer efficiency calculations
- Bottleneck identification
- Performance recommendations

### Data Flow

```
User Action (Start Flash)
    ↓
Device Selection & Validation
    ↓
Create Flash Job
    ↓
Start Backend Flash Operation
   ↓
Stream or Poll Progress From Backend
    ↓
Real-Time UI Updates
    ↓
Bottleneck Detection
    ↓
Job Completion
    ↓
Create Speed Profile
    ↓
Update History & Metrics
```

### Backend Integration

The frontend must not hardcode the backend host. API URLs are built via `getAPIUrl()` using `VITE_API_URL` (defaults to `http://localhost:3001`).

#### Endpoints Used:

1. **Device Scanning**

   - `GET /api/devices/scan`
   - Returns: `{ devices: Device[] }`

2. **Fastboot workflows (Android)**

   - `GET /api/fastboot/devices`
   - `GET /api/fastboot/device-info?serial=...`
   - `POST /api/fastboot/flash`

3. **Samsung Download Mode (Odin) workflows (Android)**

   - `GET /api/odin/scan`

4. **Qualcomm EDL workflows (Android)**

   - `GET /api/edl/scan`

5. **Flash Operation (generic)**

   - `POST /api/flash/start`
   - Body: `{ deviceSerial, partition, imagePath }`
   - Returns: `{ jobId, status }`

6. **Progress / status / cancellation (generic)**

   - `GET /api/flash/status`
   - `POST /api/flash/cancel`

If an endpoint is not available on the current platform/toolchain, the UI should surface an explicit error and keep the action disabled.

### Fallback Mode

Truth-first behavior: when the backend is offline or a required tool is missing, the UI shows an explicit error state and does not simulate a successful flash.

## Usage

### Basic Flash Operation

1. **Scan for Devices**

   - Click "Scan Devices" button
   - Wait for device detection
   - Devices appear in the list with correlation badges

2. **Select Device**

   - Navigate to "Flash Device" tab
   - Choose device from dropdown
   - Verify device is in fastboot mode

3. **Select Partition**

   - Choose target partition (system, boot, recovery, etc.)
   - Verify partition selection

4. **Start Flashing**

   - Click "Start Flashing" button
   - Monitor real-time progress
   - View speed metrics and ETA

5. **Monitor Progress**

   - Watch live progress bar
   - View speed graph
   - Check for bottleneck alerts

6. **Completion**
   - Verify success message
   - Check job history
   - Review performance metrics

### Viewing Connected Devices

1. Navigate to "Connected Devices" tab
2. View all detected devices with:
   - Serial numbers
   - Device models
   - Platform (Android/iOS)
   - Current mode (fastboot, adb, etc.)
   - Correlation status
   - Matched tool IDs

### Reviewing Flash History

1. Navigate to "Flash History" tab
2. View completed operations with:
   - Device information
   - Partition flashed
   - Image size
   - Average speed
   - Peak speed
   - Duration
   - Timestamp
   - Status (completed/failed)

## Performance Metrics

### Dashboard Metrics

The main dashboard displays aggregated metrics:

1. **Total Jobs**: Count of all flash operations
2. **Completed Jobs**: Successfully finished operations
3. **Failed Jobs**: Operations that encountered errors
4. **Average Speed**: Mean transfer speed across all jobs
5. **Data Written**: Total bytes successfully flashed
6. **Active Jobs**: Currently running operations

### Speed Profile

Each completed flash generates a speed profile containing:

```typescript
{
  deviceSerial: string;
  partition: string;
  fileSize: number;
  duration: number;
  averageSpeed: number;
  peakSpeed: number;
  minSpeed: number;
  speedVariance: number;
  transferEfficiency: number;
  speedProfile: Array<{ time: number; speed: number }>;
  errors: number;
  retries: number;
}
```

## Integration with Existing Systems

### BootForgeUSB Integration

The dashboard integrates with BootForgeUSB for device detection:

1. **Real-Time Device Correlation**

   - Automatic matching of USB devices to tool IDs
   - Confidence scoring for device identification
   - Support for 30+ device vendors

2. **State Machine Integration**
   - Device state: Attached → Identified → Probed → Ready
   - Protocol detection: ADB, Fastboot, DFU, etc.
   - Mode verification before flashing

### Performance Monitoring Integration

Connects with existing monitoring systems:

1. **Real-Time Flash Monitor**

   - Live metrics collection
   - Bottleneck detection
   - Performance analysis

2. **Benchmark Standards**
   - Compare against industry benchmarks
   - USB 3.2 Gen 2 optimal speeds
   - Device-specific performance baselines

## Data Persistence

All data is persisted using Spark's `useKV` hooks:

- **Flash Jobs**: `flash-jobs` key stores all job history
- **Speed Profiles**: `flash-speed-profiles` key stores performance data
- **Monitoring Sessions**: `monitoring-sessions` key stores detailed metrics

Data survives page refreshes and is user-specific.

## Error Handling

### Common Errors

1. **Device Not in Fastboot Mode**

   - Detection: Check device.mode !== 'fastboot'
   - Action: Display error, prevent flash start
   - User Guidance: "Device must be in fastboot mode to flash"

2. **No Device Selected**

   - Detection: selectedDevice is empty
   - Action: Display error
   - User Guidance: "Please select a device"

3. **Backend Offline**

   - Detection: Fetch error on API calls
   - Action: Show an offline error state; disable flash start
   - User Guidance: Toast/banner indicating backend is unreachable and which API base URL is configured

4. **Flash Operation Failed**
   - Detection: progress.status === 'error'
   - Action: Update job status, display error
   - User Guidance: Show error message from backend

### Error Recovery

- **Automatic Retry**: Not implemented (manual retry required)
- **Cancel Operation**: Immediate cancellation with cleanup
- **Job History**: Failed jobs preserved for analysis
- **Error Messages**: Detailed error information displayed

## Best Practices

### For Users

1. **Before Flashing**

   - Ensure device battery > 50%
   - Use USB 3.0 cable and port
   - Close unnecessary applications
   - Backup important data

2. **During Flashing**

   - Do not disconnect device
   - Do not close application
   - Monitor for bottleneck warnings
   - Keep system resources available

3. **After Flashing**
   - Verify completion message
   - Review speed metrics
   - Check device status
   - Reboot device if necessary

### For Developers

1. **Backend Integration**

   - Implement real device scanning endpoint
   - Add progress streaming via WebSocket
   - Handle cancellation gracefully
   - Provide detailed error messages

2. **Performance Optimization**

   - Use chunked transfers for large images
   - Implement buffer management
   - Monitor system resources
   - Provide performance recommendations

3. **Testing**
   - Test with multiple device types
   - Verify error handling
   - Test cancellation mid-operation
   - Validate speed calculations

## Future Enhancements

### Planned Features

1. **Batch Flashing**

   - Flash multiple devices simultaneously
   - Queue management
   - Progress tracking for each device

2. **Resume Capability**

   - Resume interrupted flashing operations
   - Checkpoint creation
   - Automatic recovery

3. **Advanced Analytics**

   - Performance trend analysis
   - Device-specific optimization
   - Predictive failure detection

4. **Custom Image Management**

   - Image library
   - Version tracking
   - Checksum verification

5. **Network Flashing**
   - Remote device flashing
   - Network-based device detection
   - Progress synchronization

## Troubleshooting

### Common Issues

**Issue**: Devices not appearing after scan

- **Check**: USB cable connection
- **Check**: Device in correct mode (fastboot)
- **Check**: USB debugging enabled (Android)
- **Check**: Driver installation (Windows)

**Issue**: Slow transfer speeds

- **Check**: USB port version (use USB 3.0+)
- **Check**: Cable quality
- **Check**: System resources (CPU, memory, disk)
- **Check**: Background applications

**Issue**: Flash operation fails

- **Check**: Device battery level
- **Check**: Available storage on device
- **Check**: Image file integrity
- **Check**: Partition compatibility

**Issue**: Progress stuck at percentage

- **Check**: USB connection stability
- **Check**: Device not suspended
- **Check**: System not hibernating
- **Check**: Sufficient system resources

## API Reference

### Device Interface

```typescript
interface Device {
  serial: string;
  model?: string;
  platform: "android" | "ios" | "unknown";
  mode: string;
  confidence: number;
  correlationBadge: string;
  matchedIds: string[];
  usbPort?: string;
  vendor?: string;
}
```

### FlashJob Interface

```typescript
interface FlashJob {
  id: string;
  deviceSerial: string;
  deviceModel?: string;
  partition: string;
  imagePath: string;
  imageSize: number;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  startTime?: number;
  endTime?: number;
  progress?: FlashProgress;
  error?: string;
  averageSpeed?: number;
  peakSpeed?: number;
}
```

### FlashProgress Interface

```typescript
interface FlashProgress {
  partition: string;
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  transferSpeed: number;
  averageSpeed: number;
  peakSpeed: number;
  eta: number;
  status: "preparing" | "flashing" | "verifying" | "completed" | "error";
  startTime: number;
  currentTime: number;
  error?: string;
  deviceSerial?: string;
  deviceModel?: string;
}
```

## Conclusion

The flashing UI is designed to work with real backend endpoints and real device/tool detection. Development-only simulators can exist for UI work, but production UX must remain truth-first: no fake success, no simulated flashing when the backend/tools are unavailable.
