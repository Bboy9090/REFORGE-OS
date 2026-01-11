# ADB/Fastboot Device Detection

## Overview

The ADB/Fastboot detection system provides comprehensive Android device monitoring with bootloader mode recognition. This feature integrates with the Bobby Dev Arsenal to detect and track Android devices through both ADB (Android Debug Bridge) and Fastboot interfaces.

## Features

### 🔍 Device Detection

- **ADB Device Detection**: Detects Android devices connected via ADB
- **Fastboot Device Detection**: Identifies devices in bootloader/fastboot mode
- **Unified Device View**: Combines ADB and Fastboot detection for complete device visibility

### 🔐 Bootloader Recognition

- **Bootloader State Detection**: Identifies locked/unlocked bootloader status
- **Mode Recognition**: Detects various device modes:
  - Android OS (normal operation)
  - Recovery Mode
  - Sideload Mode
  - Bootloader/Fastboot Mode
  - Unauthorized State
  - Offline State

### 📊 Device Information

- **System Properties** (ADB mode):
  - Manufacturer, Brand, Model
  - Android version and SDK level
  - Build ID and bootloader version
  - Security state (secure boot, debuggable)
- **Bootloader Information** (Fastboot mode):
  - Product name and variant
  - Bootloader version
  - Baseband version
  - Bootloader unlock state
  - Secure boot status

### ⚡ Real-time Monitoring

- **Auto-refresh**: Continuous device monitoring with configurable intervals
- **Live Updates**: Instant detection of device connections and disconnections
- **Status Indicators**: Visual feedback for active monitoring

## Architecture

### Backend API Endpoints

#### `/api/android-devices/all`

Returns unified view of all Android devices from both ADB and Fastboot sources.

**Response:**

```json
{
  "count": 2,
  "devices": [
    {
      "id": "adb-ABC123",
      "serial": "ABC123",
      "state": "device",
      "deviceMode": "android_os",
      "source": "adb",
      "properties": {
        "manufacturer": "Samsung",
        "model": "SM-G998B",
        "androidVersion": "13",
        "sdkVersion": "33",
        "secure": true,
        "debuggable": false
      }
    }
  ],
  "sources": {
    "adb": {
      "available": true,
      "count": 1
    },
    "fastboot": {
      "available": true,
      "count": 1
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### `/api/adb/devices`

Returns detailed ADB device information including system properties.

**Response:**

```json
{
  "count": 1,
  "devices": [
    {
      "serial": "ABC123",
      "state": "device",
      "deviceMode": "android_os",
      "product": "galaxy",
      "model": "SM-G998B",
      "properties": {
        "manufacturer": "Samsung",
        "brand": "samsung",
        "model": "SM-G998B",
        "androidVersion": "13",
        "sdkVersion": "33",
        "buildId": "TP1A.220624.014",
        "bootloader": "G998BXXU5DWA1",
        "secure": true,
        "debuggable": false
      }
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### `/api/fastboot/devices`

Returns detailed Fastboot device information including bootloader state.

**Response:**

```json
{
  "count": 1,
  "devices": [
    {
      "serial": "ABC123",
      "mode": "fastboot",
      "deviceMode": "bootloader",
      "bootloaderMode": "fastboot",
      "properties": {
        "product": "galaxy",
        "variant": "userdebug",
        "bootloaderVersion": "G998BXXU5DWA1",
        "basebandVersion": "G998BXXU5DWA1",
        "secure": true,
        "unlocked": false,
        "bootloaderState": "locked"
      }
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Frontend Components

#### `ADBFastbootDetector`

Main UI component for displaying Android device detection.

**Features:**

- Auto-refresh toggle with live monitoring indicator
- Device mode badges with color-coded status
- Bootloader lock state indicators
- Security status badges
- Expandable device details

#### Custom Hooks

##### `useAndroidDevices(autoRefresh?, refreshInterval?)`

Main hook for unified Android device detection.

**Parameters:**

- `autoRefresh`: Enable automatic device polling (default: false)
- `refreshInterval`: Polling interval in milliseconds (default: 3000)

**Returns:**

```typescript
{
  data: AndroidDevicesResponse | null;
  devices: AndroidDevice[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  adbAvailable: boolean;
  fastbootAvailable: boolean;
  adbCount: number;
  fastbootCount: number;
}
```

##### `useADBDevices()`

Hook specifically for ADB device detection.

##### `useFastbootDevices()`

Hook specifically for Fastboot device detection.

## Usage

### Prerequisites

**Backend Server:**

```bash
cd server
npm install
npm start
```

The backend server runs on port 3001 by default.

**System Requirements:**

- ADB installed and in PATH
- Fastboot installed and in PATH (optional)
- USB debugging enabled on Android devices

### Basic Implementation

```tsx
import { ADBFastbootDetector } from "@/components/ADBFastbootDetector";

function App() {
  return (
    <div>
      <ADBFastbootDetector />
    </div>
  );
}
```

### Using the Hooks

```tsx
import { useAndroidDevices } from "@/hooks/use-android-devices";

function MyComponent() {
  const { devices, loading, error, refresh, adbAvailable, fastbootAvailable } =
    useAndroidDevices(true, 3000);

  if (loading) return <div>Scanning...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>ADB Available: {adbAvailable ? "Yes" : "No"}</p>
      <p>Fastboot Available: {fastbootAvailable ? "Yes" : "No"}</p>
      <p>Devices Found: {devices.length}</p>

      {devices.map((device) => (
        <div key={device.id}>
          <h3>{device.serial}</h3>
          <p>Mode: {device.deviceMode}</p>
          <p>Source: {device.source}</p>
        </div>
      ))}

      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

## Device Modes

### Android OS Mode (`android_os`)

- Device is in normal Android operation
- Full system properties available
- Can execute ADB shell commands

### Recovery Mode (`recovery`)

- Device is in recovery mode
- Limited ADB functionality
- Used for system updates and factory reset

### Sideload Mode (`sideload`)

- Device is in ADB sideload mode
- Used for installing OTA updates manually

### Bootloader Mode (`bootloader`)

- Device is in fastboot/bootloader mode
- Fastboot commands available
- Used for flashing firmware, unlocking bootloader

### Unauthorized (`unauthorized`)

- Device is connected but not authorized for debugging
- User needs to accept USB debugging prompt on device

### Offline (`offline`)

- Device is connected but not responding
- May indicate driver issues or connection problems

## Security Considerations

### Bootloader State

- **Locked**: Bootloader is locked (OEM locked)

  - Factory state for most devices
  - Prevents modification of system partitions
  - Indicated by 🔒 icon

- **Unlocked**: Bootloader is unlocked
  - Allows flashing custom firmware
  - May void warranty
  - Indicated by 🔓 icon

### Secure Boot

- Indicates if device has secure boot enabled
- Shows if device is running a debug build

### USB Debugging

- Must be enabled for ADB detection
- Security risk if left enabled with untrusted computers

## Troubleshooting

### ADB Not Detected

1. Verify ADB is installed: `adb --version`
2. Check ADB is in system PATH
3. Ensure USB debugging is enabled on device
4. Accept USB debugging authorization on device

### Fastboot Not Detected

1. Verify Fastboot is installed: `fastboot --version`
2. Check Fastboot is in system PATH
3. Device must be in bootloader mode
4. May require different USB drivers than ADB

### Device Shows as Offline

1. Check USB cable and connection
2. Try different USB port
3. Restart ADB server: `adb kill-server && adb start-server`
4. Check device drivers (Windows)

### Backend Connection Failed

1. Ensure backend server is running on port 3001
2. Check CORS configuration if accessing from different origin
3. Verify no firewall blocking localhost:3001

## Integration with Pandora Codex

This ADB/Fastboot detection system integrates seamlessly with the Pandora Codex arsenal:

1. **Device Discovery**: Automatically detects Android devices for bootloader unlocking workflows
2. **Mode Awareness**: Provides context about current device state for appropriate actions
3. **Bootloader Status**: Essential for Phoenix Key operations requiring unlocked bootloaders
4. **Real-time Updates**: Live monitoring ensures accurate device state throughout operations

## API Reference

See the TypeScript types in `/src/types/android-devices.ts` for complete type definitions.

## Future Enhancements

- [ ] ADB command execution interface
- [ ] Fastboot flashing operations
- [ ] Device property comparison
- [ ] Connection history and analytics
- [ ] Notification system for device state changes
- [ ] Multi-device operation support
- [ ] Device grouping and tagging
- [ ] Export device information reports
