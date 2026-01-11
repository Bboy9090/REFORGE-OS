# BootForgeUSB Backend API Integration

## Overview

This document details the backend API endpoints for **BootForgeUSB**, the advanced USB device detection and classification system for Pandora Codex. These endpoints provide real-time device scanning, correlation analysis, and tool status checking.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend (React)                               │
│  BootForgeUSBScanner Component                  │
│                                                 │
│  • Device scanning UI                           │
│  • Real-time status display                     │
│  • Device detail views                          │
│  • Correlation visualization                    │
│                                                 │
└──────────────┬──────────────────────────────────┘
               │
               │ HTTP Requests (JSON)
               │ fetch API
               ▼
┌─────────────────────────────────────────────────┐
│  Backend API (Express)                          │
│  http://localhost:3001                          │
│                                                 │
│  BootForgeUSB Endpoints:                        │
│  • GET  /api/bootforgeusb/scan                  │
│  • GET  /api/bootforgeusb/status                │
│  • GET  /api/bootforgeusb/devices/:uid          │
│  • GET  /api/bootforgeusb/correlate             │
│  • POST /api/bootforgeusb/build                 │
│                                                 │
└──────────────┬──────────────────────────────────┘
               │
               │ child_process.execSync()
               │
               ▼
┌─────────────────────────────────────────────────┐
│  BootForgeUSB CLI (Rust)                        │
│  libs/bootforgeusb/                             │
│                                                 │
│  • USB device enumeration (libusb/rusb)         │
│  • Device classification heuristics             │
│  • Tool correlation (adb/fastboot/idevice)      │
│  • Confidence scoring                           │
│  • Evidence collection                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. GET `/api/bootforgeusb/scan`

**Scan all connected USB devices and classify them.**

Executes the BootForgeUSB CLI to enumerate USB devices, classify them as iOS/Android/unknown, and correlate with tool-level confirmations (adb/fastboot/idevice_id).

#### Request

```http
GET /api/bootforgeusb/scan HTTP/1.1
Host: localhost:3001
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 2,
  "devices": [
    {
      "device_uid": "usb:05ac:12a8:bus3:addr12",
      "platform_hint": "ios",
      "mode": "ios_dfu_likely",
      "confidence": 0.86,
      "evidence": {
        "usb": {
          "vid": "05ac",
          "pid": "12a8",
          "manufacturer": "Apple",
          "product": null,
          "serial": null,
          "bus": 3,
          "address": 12,
          "interface_hints": [
            {
              "class": 255,
              "subclass": 255,
              "protocol": 255
            }
          ]
        },
        "tools": {
          "adb": {
            "present": true,
            "seen": false,
            "raw": "STDOUT:\nList of devices attached\n\nSTDERR:\n",
            "device_ids": []
          },
          "fastboot": {
            "present": true,
            "seen": false,
            "raw": "STDOUT:\n\nSTDERR:\n",
            "device_ids": []
          },
          "idevice_id": {
            "present": false,
            "seen": false,
            "raw": "missing",
            "device_ids": []
          }
        }
      },
      "notes": [
        "Apple VID with minimal descriptors + vendor interface pattern suggests DFU-like state."
      ],
      "matched_tool_ids": []
    },
    {
      "device_uid": "usb:18d1:4ee7:bus1:addr5",
      "platform_hint": "android",
      "mode": "android_adb_confirmed",
      "confidence": 0.94,
      "evidence": {
        "usb": {
          "vid": "18d1",
          "pid": "4ee7",
          "manufacturer": "Google",
          "product": "Nexus",
          "serial": "ABC123456",
          "bus": 1,
          "address": 5,
          "interface_hints": [
            {
              "class": 255,
              "subclass": 66,
              "protocol": 1
            }
          ]
        },
        "tools": {
          "adb": {
            "present": true,
            "seen": true,
            "raw": "STDOUT:\nList of devices attached\nABC123456\tdevice product:nexus model:Nexus_5X device:bullhead\n\nSTDERR:\n",
            "device_ids": ["ABC123456"]
          },
          "fastboot": {
            "present": true,
            "seen": false,
            "raw": "STDOUT:\n\nSTDERR:\n",
            "device_ids": []
          },
          "idevice_id": {
            "present": false,
            "seen": false,
            "raw": "missing",
            "device_ids": []
          }
        }
      },
      "notes": ["Correlated: adb device id matches USB serial."],
      "matched_tool_ids": ["ABC123456"]
    }
  ],
  "timestamp": "2024-01-15T10:30:45.123Z",
  "available": true
}
```

#### Response (CLI Not Available - 503)

```json
{
  "error": "BootForgeUSB not available",
  "message": "BootForgeUSB CLI tool is not installed or not in PATH",
  "installInstructions": "Build and install from libs/bootforgeusb: cargo build --release && cargo install --path .",
  "available": false
}
```

#### Response (Scan Timeout - 504)

```json
{
  "error": "BootForgeUSB scan timeout",
  "message": "Device scan took too long to complete",
  "available": true
}
```

#### Response (Scan Failed - 500)

```json
{
  "error": "BootForgeUSB scan failed",
  "details": "Error message details",
  "stderr": "stderr output if available",
  "available": true
}
```

#### Notes

- Timeout: 10 seconds
- Max buffer: 10 MB (for large device lists)
- Returns empty device array if no devices detected
- Tool evidence always included (even if tools are missing)

---

### 2. GET `/api/bootforgeusb/status`

**Check BootForgeUSB installation status and tool availability.**

Returns comprehensive status of the BootForgeUSB CLI, Rust build environment, system tools (adb/fastboot/idevice_id), and library information.

#### Request

```http
GET /api/bootforgeusb/status HTTP/1.1
Host: localhost:3001
```

#### Response (200)

```json
{
  "available": true,
  "cli": {
    "installed": true,
    "command": "bootforgeusb-cli"
  },
  "buildEnvironment": {
    "rust": true,
    "cargo": true,
    "canBuild": true
  },
  "library": {
    "path": "../libs/bootforgeusb",
    "version": "0.2.0"
  },
  "systemTools": {
    "adb": true,
    "fastboot": true,
    "idevice_id": false
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

#### Fields

- `available`: Boolean indicating if CLI is ready to use
- `cli.installed`: Whether `bootforgeusb-cli` command exists in PATH
- `buildEnvironment.canBuild`: Whether Rust toolchain is present for building
- `library`: Information about the source library (null if not found)
- `systemTools`: Tool availability for device confirmation

---

### 3. GET `/api/bootforgeusb/devices/:uid`

**Get detailed information about a specific device by UID.**

Scans all devices and returns the device matching the provided UID.

#### Request

```http
GET /api/bootforgeusb/devices/usb:18d1:4ee7:bus1:addr5 HTTP/1.1
Host: localhost:3001
```

#### URL Parameters

- `uid` (required): Device UID from scan results (e.g., `usb:18d1:4ee7:bus1:addr5`)

#### Response (Found - 200)

```json
{
  "success": true,
  "device": {
    "device_uid": "usb:18d1:4ee7:bus1:addr5",
    "platform_hint": "android",
    "mode": "android_adb_confirmed",
    "confidence": 0.94,
    "evidence": {
      /* full evidence object */
    },
    "notes": ["Correlated: adb device id matches USB serial."],
    "matched_tool_ids": ["ABC123456"]
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

#### Response (Not Found - 404)

```json
{
  "error": "Device not found",
  "uid": "usb:18d1:4ee7:bus1:addr5"
}
```

#### Response (CLI Not Available - 503)

```json
{
  "error": "BootForgeUSB not available",
  "available": false
}
```

---

### 4. GET `/api/bootforgeusb/correlate`

**Analyze device correlation quality and methods.**

Scans devices and returns correlation analysis showing which devices were matched via tool confirmation, USB heuristics, or system-level detection.

#### Request

```http
GET /api/bootforgeusb/correlate HTTP/1.1
Host: localhost:3001
```

#### Response (200)

```json
{
  "success": true,
  "count": 2,
  "devices": [
    {
      "device_uid": "usb:05ac:12a8:bus3:addr12",
      "platform": "ios",
      "mode": "ios_dfu_likely",
      "confidence": 0.86,
      "correlation": {
        "method": "usb_heuristic",
        "confidence_boost": 0,
        "matched_ids": [],
        "details": ["USB-only classification, tool confirmation unavailable"]
      }
    },
    {
      "device_uid": "usb:18d1:4ee7:bus1:addr5",
      "platform": "android",
      "mode": "android_adb_confirmed",
      "confidence": 0.94,
      "correlation": {
        "method": "tool_confirmed",
        "confidence_boost": 0.15,
        "matched_ids": ["ABC123456"],
        "details": ["Correlated via 1 tool ID(s)"]
      }
    }
  ],
  "tools_available": {
    "adb": true,
    "fastboot": true
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

#### Correlation Methods

- `tool_confirmed`: Device matched via tool ID (adb serial, fastboot ID, iOS UDID)
- `system_level`: Tool sees devices but can't match to specific USB record
- `usb_heuristic`: USB-only classification (VID/PID/interface patterns)
- `none`: Unknown device

---

### 5. POST `/api/bootforgeusb/build`

**Build and install BootForgeUSB CLI from source.**

Compiles the Rust library and installs the CLI tool. Returns streaming JSON updates during the build process.

#### Request

```http
POST /api/bootforgeusb/build HTTP/1.1
Host: localhost:3001
```

#### Response (Streaming - 200)

Chunked transfer encoding with multiple JSON objects:

```json
{"status":"starting","message":"Building BootForgeUSB CLI...","timestamp":"2024-01-15T10:30:45.123Z"}
{"status":"installing","message":"Installing CLI tool...","timestamp":"2024-01-15T10:31:20.456Z"}
{"status":"complete","message":"BootForgeUSB CLI built and installed successfully","buildOutput":"   Compiling bootforgeusb v0.2.0...","installOutput":"  Installing bootforgeusb-cli...","timestamp":"2024-01-15T10:31:25.789Z"}
```

#### Response (Cargo Not Available - 503)

```json
{
  "error": "Rust toolchain not available",
  "message": "cargo command not found in PATH"
}
```

#### Response (Source Not Found - 404)

```json
{
  "error": "BootForgeUSB source not found",
  "message": "Expected path: ../libs/bootforgeusb"
}
```

#### Response (Build Failed - 200 with error status)

```json
{
  "status": "failed",
  "error": "Build failed",
  "details": "error message",
  "stderr": "stderr output",
  "timestamp": "2024-01-15T10:30:50.123Z"
}
```

#### Notes

- Build timeout: 5 minutes
- Install timeout: 1 minute
- Requires Rust toolchain (rustc + cargo)
- Installs CLI globally via `cargo install`

---

## Device Data Model

### DeviceRecord

```typescript
interface DeviceRecord {
  device_uid: string; // Unique identifier (usb:VID:PID:busN:addrN)
  platform_hint: string; // "ios" | "android" | "unknown"
  mode: string; // Detailed mode (see Mode Classification)
  confidence: number; // 0.0 to 1.0 confidence score
  evidence: Evidence; // Full evidence object
  notes: string[]; // Human-readable classification notes
  matched_tool_ids: string[]; // Tool IDs that matched this device
}
```

### Evidence

```typescript
interface Evidence {
  usb: USBEvidence;
  tools: ToolsEvidence;
}

interface USBEvidence {
  vid: string; // Vendor ID (hex, e.g., "05ac")
  pid: string; // Product ID (hex, e.g., "12a8")
  manufacturer: string | null; // Manufacturer string
  product: string | null; // Product string
  serial: string | null; // Serial number
  bus: number; // USB bus number
  address: number; // USB device address
  interface_hints: InterfaceHint[];
}

interface InterfaceHint {
  class: number; // USB interface class
  subclass: number; // USB interface subclass
  protocol: number; // USB interface protocol
}

interface ToolsEvidence {
  adb: ToolProbe;
  fastboot: ToolProbe;
  idevice_id: ToolProbe;
}

interface ToolProbe {
  present: boolean; // Tool installed on system
  seen: boolean; // Tool sees at least one device
  raw: string; // Raw command output
  device_ids: string[]; // Parsed device identifiers
}
```

---

## Mode Classification

### iOS Modes

- `ios_normal_confirmed` - iOS device in normal mode (confirmed via idevice_id)
- `ios_recovery_likely` - Likely iOS recovery mode (USB-only detection)
- `ios_dfu_likely` - Likely iOS DFU mode (USB-only detection)

### Android Modes

- `android_adb_confirmed` - Android device with ADB active (tool-confirmed)
- `android_fastboot_confirmed` - Android device in fastboot/bootloader (tool-confirmed)
- `android_recovery_adb_confirmed` - Android recovery with ADB sideload (tool-confirmed)
- `android_usb_likely` - Likely Android device (USB-only detection)

### Unknown

- `unknown_usb` - Unrecognized or unclassified USB device

---

## Confidence Scoring

| Confidence Range | Meaning           | Typical Cause                                                                  |
| ---------------- | ----------------- | ------------------------------------------------------------------------------ |
| 0.90 - 1.00      | High confidence   | Tool-confirmed via serial match or single-candidate correlation                |
| 0.75 - 0.89      | Medium confidence | USB heuristics match known patterns (Apple VID, Google VID, vendor interfaces) |
| 0.55 - 0.74      | Low confidence    | Generic USB detection, no strong classification signals                        |
| < 0.55           | Very low          | Unknown device with minimal information                                        |

---

## Usage Examples

### Frontend Integration

```typescript
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001';

function MyComponent() {
  const [devices, setDevices] = useState([]);

  async function scanDevices() {
    const res = await fetch(`${API_BASE}/api/bootforgeusb/scan`);
    const data = await res.json();

    if (data.success) {
      setDevices(data.devices);
    }
  }

  useEffect(() => {
    scanDevices();
  }, []);

  return (
    <div>
      {devices.map(device => (
        <div key={device.device_uid}>
          <h3>{device.platform_hint.toUpperCase()}</h3>
          <p>{device.mode}</p>
          <p>Confidence: {(device.confidence * 100).toFixed(0)}%</p>
        </div>
      ))}
    </div>
  );
}
```

### Command Line Testing

```bash
# Check status
curl http://localhost:3001/api/bootforgeusb/status | jq

# Scan devices
curl http://localhost:3001/api/bootforgeusb/scan | jq

# Get correlation analysis
curl http://localhost:3001/api/bootforgeusb/correlate | jq

# Build CLI from source
curl -X POST http://localhost:3001/api/bootforgeusb/build
```

---

## Setup Instructions

### 1. Install BootForgeUSB

**Option A: Build from source (recommended)**

```bash
cd libs/bootforgeusb
cargo build --release
cargo install --path .
```

**Option B: Use API build endpoint**

```bash
curl -X POST http://localhost:3001/api/bootforgeusb/build
```

### 2. Verify Installation

```bash
# Check if CLI is available
bootforgeusb-cli

# Check via API
curl http://localhost:3001/api/bootforgeusb/status | jq '.available'
```

### 3. Install System Tools (Optional but Recommended)

**ADB/Fastboot (Android)**

```bash
# Debian/Ubuntu
sudo apt-get install android-sdk-platform-tools

# macOS
brew install android-platform-tools
```

**idevice tools (iOS)**

```bash
# Debian/Ubuntu
sudo apt-get install libimobiledevice-utils

# macOS
brew install libimobiledevice
```

---

## Error Handling

### Common Errors

| Error                          | Cause                              | Solution                                                                        |
| ------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------- |
| "BootForgeUSB not available"   | CLI not installed                  | Build and install from `libs/bootforgeusb`                                      |
| "Rust toolchain not available" | cargo not in PATH                  | Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| "Device scan timeout"          | USB enumeration hung               | Retry scan, check USB permissions                                               |
| "Device not found"             | Invalid UID or device disconnected | Re-scan to get current device list                                              |

### Frontend Error Handling

```typescript
async function scanWithErrorHandling() {
  try {
    const res = await fetch(`${API_BASE}/api/bootforgeusb/scan`);
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 503) {
        console.error("BootForgeUSB not installed:", data.message);
        // Show installation instructions
      } else if (res.status === 504) {
        console.error("Scan timeout, retrying...");
        // Retry scan
      } else {
        console.error("Scan failed:", data.error);
      }
      return;
    }

    // Success
    setDevices(data.devices);
  } catch (err) {
    console.error("Network error:", err);
    // Show "backend unavailable" message
  }
}
```

---

## Performance

- **Scan duration**: Typically 200-500ms for 1-5 devices
- **Tool confirmation overhead**: +100-300ms per tool (adb/fastboot/idevice_id)
- **Timeout**: 10 seconds maximum
- **Concurrent scans**: Safe (read-only operations)
- **Polling interval**: Recommended 2-5 seconds minimum

---

## Security Considerations

1. **Read-only operations**: All endpoints perform read-only device detection
2. **No device modifications**: BootForgeUSB does not modify devices or firmware
3. **Command whitelisting**: Only safe, approved commands are executed
4. **Timeout enforcement**: All operations have strict timeouts
5. **Local only**: API designed for localhost development, not production deployment

---

## Troubleshooting

### No devices detected

1. Check USB permissions (Linux: udev rules, macOS: generally ok)
2. Verify devices are connected (`lsusb` on Linux, System Information on macOS)
3. Check logs for libusb errors
4. Try with `sudo` (not recommended for production)

### Low confidence scores

- Install system tools (adb/fastboot/idevice_id) for confirmation
- Low confidence is honest: device can't be definitively classified
- Check device mode (DFU/recovery modes have less identifying information)

### Build failures

- Verify Rust toolchain: `rustc --version && cargo --version`
- Check libusb dev libraries: `apt-get install libusb-1.0-0-dev` (Linux)
- Check compiler errors in build output
- Try clean build: `cargo clean && cargo build --release`

---

## Related Documentation

- [Backend API Implementation](/BACKEND_API_IMPLEMENTATION.md) - Complete backend API overview
- [BootForgeUSB v0.2 Integration](/BOOTFORGEUSB_V02_INTEGRATION.md) - Correlation and device detection
- [ADB/Fastboot Detection](/ADB_FASTBOOT_DETECTION.md) - Android device detection details
- [Server README](/server/README.md) - Backend server documentation

---

## Changelog

### v0.2.0 (Current)

- ✅ Device correlation via tool IDs
- ✅ Per-device confidence scoring
- ✅ Correlation analysis endpoint
- ✅ Build automation endpoint
- ✅ Enhanced tool evidence with device_ids

### v0.1.0

- Initial USB device enumeration
- Basic iOS/Android classification
- System-level tool detection
- USB evidence collection

---

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review related documentation
3. Check API status endpoint for diagnostics
4. Review backend server logs

---

**Last Updated**: 2024-01-15
**API Version**: 0.2.0
**Maintainer**: Pandora Codex Team
