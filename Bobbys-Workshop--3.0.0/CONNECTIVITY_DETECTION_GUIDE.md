# Advanced Connectivity Detection System

## Overview

Bobby's World Tools now includes a comprehensive device connectivity detection system that unifies detection across multiple protocols and device types. This system provides a single interface for detecting Android (ADB/Fastboot), iOS (libimobiledevice), and USB devices, with automatic capability analysis and connection state monitoring.

## Architecture

### Core Components

#### 1. `probeDevice.ts` - Multi-Protocol Device Probing

The central module for device detection across all supported protocols.

**Features:**

- Unified device detection API
- Parallel probing across multiple protocols
- Automatic capability detection
- Real-time connection monitoring
- Device state correlation

**Key Functions:**

```typescript
// Probe all connected devices
const devices = await probeDevices({
  includeUSB: true,
  includeAndroid: true,
  includeiOS: true,
  timeout: 10000,
});

// Monitor for device connect/disconnect
const cleanup = createDeviceMonitor(
  (device) => console.log("Connected:", device),
  (deviceId) => console.log("Disconnected:", deviceId),
  3000, // poll interval
);
```

#### 2. `usbClassDetection.ts` - Enhanced USB Classification

Provides detailed USB device class detection with mobile device support.

**Enhanced Features:**

- MTP (Media Transfer Protocol) detection for Android
- PTP (Picture Transfer Protocol) for cameras and iOS
- ADB interface detection (Android Debug Bridge)
- Fastboot mode detection (Android bootloader)
- iOS usbmuxd protocol recognition

**Detected Mobile Capabilities:**

- Android Debug Bridge (ADB)
- Android Fastboot
- iOS Device (iTunes/libimobiledevice)
- MTP File Transfer
- PTP Photo Import

#### 3. `DevModePanel.tsx` - Visual Device Management

React component providing a comprehensive UI for device detection and workflow management.

**Features:**

- Real-time device list with auto-refresh
- Device capability visualization
- Workflow launcher interface
- Connection state indicators
- Detailed device properties display

## Device Detection Flow

### 1. Android Device Detection

```
User Connects Device
       ↓
ADB Detection (via backend API)
  - Check `adb devices`
  - Parse device serial, state, properties
  - Detect mode: OS, Recovery, Sideload, Unauthorized
       ↓
Fastboot Detection (parallel)
  - Check `fastboot devices`
  - Detect bootloader state
  - Read bootloader properties
       ↓
USB Detection (WebUSB, parallel)
  - Scan for Android USB vendor IDs
  - Detect ADB/Fastboot USB interfaces
       ↓
Capability Analysis
  - Determine available operations
  - Check bootloader lock state
  - Identify supported features
       ↓
ProbeResult Generated
```

### 2. iOS Device Detection

```
User Connects Device
       ↓
libimobiledevice Detection (via backend)
  - Run `idevice_id -l`
  - Get device UDID
  - Query device info with `ideviceinfo`
       ↓
USB Detection (WebUSB, parallel)
  - Scan for Apple vendor ID (0x05AC)
  - Detect iOS-specific USB interfaces
       ↓
Mode Detection
  - Normal mode
  - Recovery mode
  - DFU mode (bootloader)
       ↓
Capability Analysis
  - Backup/restore capabilities
  - Diagnostics support
  - DFU operations (if in DFU mode)
       ↓
ProbeResult Generated
```

### 3. Generic USB Device Detection

```
User Connects Device
       ↓
WebUSB API Query
  - Get paired devices
  - Request device access (if needed)
       ↓
Device Enumeration
  - Open device connection
  - Read device descriptors
  - Parse configuration/interfaces
       ↓
USB Class Analysis
  - Identify device class codes
  - Parse interface classes
  - Detect subclass/protocol
       ↓
Capability Detection
  - Map classes to capabilities
  - Identify device type
  - Determine supported operations
       ↓
ProbeResult Generated
```

## Device Capabilities System

Each detected device includes a `capabilities` array describing available operations:

```typescript
interface DeviceCapability {
  id: string; // Unique capability ID
  name: string; // Human-readable name
  description: string; // Detailed description
  available: boolean; // Whether capability is currently available
  protocols: string[]; // Required protocols (e.g., 'adb', 'fastboot')
}
```

### Example Capabilities

**Android (ADB Mode):**

- `adb-shell` - Execute shell commands
- `app-install` - Install/manage apps
- `file-transfer` - Transfer files via ADB
- `debugging` - Debug applications

**Android (Fastboot Mode):**

- `fastboot-flash` - Flash firmware partitions
- `bootloader-unlock` - Unlock/lock bootloader
- `custom-rom` - Install custom firmware

**iOS (Normal Mode):**

- `ios-backup` - Create/restore backups
- `ios-diagnostics` - Run diagnostics

**iOS (DFU Mode):**

- `dfu-restore` - Firmware restore
- `jailbreak` - Jailbreak operations (checkra1n/palera1n)

## Mobile Workflows

### VesselSanctum - Deep Device Diagnostics

**Purpose:** Comprehensive health check for mobile devices

**Location:** `/workflows/mobile/vessel-sanctum.json`

**Features:**

- 15-step diagnostic process
- Platform-specific commands (Android/iOS)
- Hardware sensor testing
- Battery, storage, memory analysis
- Thermal monitoring
- Network connectivity check
- Security status verification
- Health score calculation (0-100)

**Duration:** 5-10 minutes

**Risk Level:** Low (read-only operations)

**Usage:**

```typescript
import { DevModePanel } from '@/components/DevModePanel';

// Component auto-detects devices and displays workflows
<DevModePanel />
```

### Warhammer - Advanced Device Repair

**Purpose:** Heavy-duty repair and recovery operations

**Location:** `/workflows/mobile/warhammer.json`

**Features:**

- Emergency device recovery
- Firmware flashing (boot, system, vendor, recovery)
- Bootloader unlock/lock operations
- Factory reset capabilities
- Partition backup/restore
- Bootloop recovery procedures
- Post-flash diagnostics

**Duration:** 15-30 minutes

**Risk Level:** High (destructive operations)

**Prerequisites:**

- Device owner authorization
- Bootloader must be unlockable
- Firmware files available
- > 50% battery charge
- Stable USB connection

**Warning:** ⚠️ DATA LOSS MAY OCCUR

### Quick Diagnostics

**Purpose:** Fast device health check

**Location:** `/workflows/mobile/quick-diagnostics.json`

**Features:**

- Device detection
- Battery level check
- Storage availability check
- Quick status report

**Duration:** 2 minutes

**Risk Level:** Low

### Battery Health Analysis

**Purpose:** Comprehensive battery assessment

**Location:** `/workflows/mobile/battery-health.json`

**Features:**

- Full battery statistics
- Cycle count tracking
- Capacity analysis
- Temperature monitoring
- Health score calculation
- Replacement recommendations

**Duration:** 3 minutes

**Risk Level:** Low

## API Reference

### ProbeDevice API

```typescript
import { probeDevices, probeSingleDevice, createDeviceMonitor } from '@/lib/probeDevice';

// Probe all devices
const devices: ProbeResult[] = await probeDevices({
  includeUSB?: boolean;      // Default: true
  includeAndroid?: boolean;  // Default: true
  includeiOS?: boolean;      // Default: true
  includeNetwork?: boolean;  // Default: false
  timeout?: number;          // Default: 10000ms
});

// Probe specific device
const device: ProbeResult | null = await probeSingleDevice(deviceId);

// Monitor devices
const stopMonitoring = createDeviceMonitor(
  onDeviceConnected: (device: ProbeResult) => void,
  onDeviceDisconnected: (deviceId: string) => void,
  intervalMs: number = 3000
);

// Cleanup
stopMonitoring();
```

### ProbeResult Interface

```typescript
interface ProbeResult {
  deviceId: string; // Unique device identifier
  deviceName: string; // Human-readable name
  deviceType: "android" | "ios" | "usb" | "network" | "unknown";
  connectionType: "adb" | "fastboot" | "usb" | "network" | "ios" | "webusb";
  state: "connected" | "disconnected" | "unauthorized" | "offline" | "unknown";
  capabilities: DeviceCapability[]; // Available operations
  properties: Record<string, any>; // Device-specific properties
  detectionMethod: string; // How device was detected
  timestamp: number; // Detection timestamp
}
```

## Integration Examples

### Example 1: List All Connected Devices

```typescript
import { probeDevices } from "@/lib/probeDevice";

async function listDevices() {
  const devices = await probeDevices();

  console.log(`Found ${devices.length} devices:`);
  devices.forEach((device) => {
    console.log(`- ${device.deviceName} (${device.connectionType})`);
    console.log(`  State: ${device.state}`);
    console.log(
      `  Capabilities: ${device.capabilities.map((c) => c.name).join(", ")}`,
    );
  });
}
```

### Example 2: Monitor Device Connections

```typescript
import { createDeviceMonitor } from "@/lib/probeDevice";

const cleanup = createDeviceMonitor(
  (device) => {
    console.log(`Device connected: ${device.deviceName}`);
    // Show notification, update UI, etc.
  },
  (deviceId) => {
    console.log(`Device disconnected: ${deviceId}`);
    // Clean up resources, update UI, etc.
  },
  5000, // Check every 5 seconds
);

// When done:
cleanup();
```

### Example 3: Check Device Capabilities

```typescript
import { probeDevices } from "@/lib/probeDevice";

async function checkADBCapability() {
  const devices = await probeDevices({ includeAndroid: true });

  const adbDevices = devices.filter((device) =>
    device.capabilities.some((cap) => cap.id === "adb-shell" && cap.available),
  );

  console.log(`${adbDevices.length} devices support ADB shell`);
  return adbDevices;
}
```

## Backend Requirements

The connectivity detection system requires backend services to be running:

### Required Endpoints

**Android Detection:**

- `GET /api/android/devices` - List ADB/Fastboot devices
- `GET /api/fastboot/devices` - List Fastboot-only devices

**iOS Detection:**

- `GET /api/ios/scan` - Scan for iOS devices via libimobiledevice

**System Tools:**

- `GET /api/system/tools` - Check installed tools (ADB, Fastboot, etc.)

### Starting Backend Services

```bash
# Install backend dependencies
cd server
npm install

# Start backend server
npm start
# Server runs on http://localhost:3001
```

## Troubleshooting

### Device Not Detected

**Android:**

1. Ensure USB debugging is enabled on device
2. Accept authorization prompt on device
3. Check `adb devices` in terminal
4. Try different USB cable/port

**iOS:**

1. Install libimobiledevice: `brew install libimobiledevice` (macOS)
2. Trust computer on iOS device
3. Check `idevice_id -l` in terminal

**USB:**

1. Use Chrome, Edge, or Opera (WebUSB support)
2. Grant browser USB permissions
3. Check browser console for errors

### Backend Connection Failed

1. Verify backend server is running on port 3001
2. Check CORS configuration
3. Ensure no firewall blocking
4. Check backend logs for errors

### Capabilities Not Showing

1. Ensure device is in correct mode (ADB for Android OS operations, Fastboot for bootloader operations)
2. Check device authorization status
3. Verify backend endpoints are responding
4. Check browser console for API errors

## Security Considerations

### Authorization

- High-risk operations (like Warhammer workflow) require explicit user authorization
- Confirmation prompts for destructive operations
- Shadow logging of all sensitive operations

### USB Access

- WebUSB requires user permission for each device
- Permissions persist per device
- Can be revoked via browser settings

### Backend Security

- Backend runs with system user permissions
- No elevated privileges required
- All operations logged for audit

## Workshop Vibe Maintained

The connectivity detection system maintains Bobby's World 90s workshop aesthetic:

- **Honest about capabilities** - Shows what's actually available, no fake features
- **Clear status indicators** - Green/yellow/red badges for connection states
- **No-nonsense diagnostics** - VesselSanctum provides thorough, practical health checks
- **Heavy-duty repair tools** - Warhammer workflow for serious repair operations
- **Professional presentation** - Clean, industrial UI matching the workshop theme

## Future Enhancements

Potential areas for expansion:

1. **Network Device Detection** - Discover devices on local network
2. **Bluetooth Device Support** - Web Bluetooth API integration
3. **Device History** - Track connection patterns and analytics
4. **Workflow Scheduling** - Automated diagnostic runs
5. **Custom Workflow Builder** - Visual workflow creation tool
6. **Multi-Device Operations** - Batch operations across multiple devices

---

**Part of Bobby's World Tools - Workshop Toolkit**  
_Professional device connectivity detection with 90s workshop charm_
