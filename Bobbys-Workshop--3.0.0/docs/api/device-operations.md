# Pandora Codex Device Operations API

## Overview

This document defines the complete API contract for all device operations in Pandora Codex. Every frontend (Web UI, CLI, future mobile) **must** use these APIs. No UI-only logic is permitted.

**Backend Server**: Express.js on port 3001  
**Protocol**: HTTP REST + WebSocket  
**Authentication**: Bearer token (planned), currently open for development  
**Base URL**: `http://localhost:3001/api`

---

## Design Principles

### 1. Device-Agnostic Primitives

All operations exposed as generic primitives:

- **inspect**: Gather device information
- **provision**: Prepare device for operations
- **enroll**: Register device in fleet management
- **flash**: Update firmware or partitions
- **report**: Generate evidence or compliance reports

### 2. Truth-First Responses

- No fake success indicators
- No optimistic responses
- Every response includes evidence or explicit failure reason
- Confidence scores where applicable

### 3. Explicit Failure Modes

Every endpoint documents:

- Success response schema
- Error response schema
- Partial success handling
- Tool availability requirements

### 4. Verifiable Results

Operations return:

- Command executed (for audit trail)
- Exit code
- Stdout/stderr (truncated if large)
- Duration in milliseconds
- Evidence references

---

## API Endpoint Categories

### System & Health

#### `GET /api/health`

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": 1703001234567,
  "uptime": 123456
}
```

**Failure Modes:** None (always returns 200)

---

#### `GET /api/system-info`

Get system information (OS, architecture, environment).

**Response:**

```json
{
  "platform": "linux",
  "arch": "x64",
  "node_version": "v22.1.0",
  "hostname": "dev-workstation",
  "uptime": 123456,
  "memory": {
    "total": 17179869184,
    "free": 4294967296,
    "used": 12884901888
  },
  "cpus": [
    {
      "model": "Intel Core i7",
      "speed": 2400,
      "times": {
        /* ... */
      }
    }
  ]
}
```

**Failure Modes:** None (always returns 200)

---

#### `GET /api/system-tools`

Get status of all system tools (ADB, Fastboot, Rust, Python, etc.).

**Response:**

```json
{
  "rust": {
    "installed": true,
    "rustc_version": "1.75.0",
    "cargo_version": "1.75.0",
    "toolchain": "stable-x86_64-unknown-linux-gnu"
  },
  "android": {
    "adb_installed": true,
    "adb_version": "34.0.5",
    "adb_path": "/usr/bin/adb",
    "fastboot_installed": true,
    "fastboot_version": "34.0.5",
    "fastboot_path": "/usr/bin/fastboot"
  },
  "python": {
    "installed": true,
    "version": "3.10.12",
    "path": "/usr/bin/python3"
  },
  "ios": {
    "libimobiledevice_installed": true,
    "idevice_id_present": true,
    "ideviceinfo_present": true
  }
}
```

**Failure Modes:**

- Tool not installed: `installed: false`, no version/path
- Tool present but not working: `installed: true`, `version: null`

---

### Device Detection

#### `GET /api/adb/devices`

List all ADB-detected devices with properties.

**Response:**

```json
{
  "success": true,
  "tool_available": true,
  "devices": [
    {
      "serial": "ABC123XYZ",
      "state": "device",
      "product": "redfin",
      "model": "Pixel_5",
      "device": "redfin",
      "transport_id": "3",
      "raw": "ABC123XYZ    device product:redfin model:Pixel_5 device:redfin transport_id:3",
      "properties": {
        "ro.build.version.release": "14",
        "ro.build.version.sdk": "34",
        "ro.product.manufacturer": "Google",
        "ro.product.model": "Pixel 5",
        "ro.build.version.security_patch": "2024-11-05"
      }
    }
  ],
  "error": null
}
```

**Failure Modes:**

- ADB not installed: `{ "success": false, "tool_available": false, "devices": [], "error": "adb not found in PATH" }`
- No devices connected: `{ "success": true, "tool_available": true, "devices": [], "error": null }`
- ADB server error: `{ "success": false, "tool_available": true, "devices": [], "error": "adb server failed to start" }`

---

#### `GET /api/fastboot/devices`

List all Fastboot-detected devices.

**Response:**

```json
{
  "success": true,
  "tool_available": true,
  "devices": [
    {
      "serial": "DEF456UVW",
      "raw": "DEF456UVW    fastboot",
      "mode": "fastboot"
    }
  ],
  "error": null
}
```

**Failure Modes:**

- Fastboot not installed: `{ "success": false, "tool_available": false, "devices": [], "error": "fastboot not found in PATH" }`
- No devices in fastboot mode: `{ "success": true, "tool_available": true, "devices": [], "error": null }`

---

#### `GET /api/android-devices/all`

Unified Android device detection (ADB + Fastboot).

**Response:**

```json
{
  "success": true,
  "adb": {
    "available": true,
    "devices": [
      /* ... */
    ]
  },
  "fastboot": {
    "available": true,
    "devices": [
      /* ... */
    ]
  },
  "merged": [
    {
      "id": "ABC123XYZ",
      "serial": "ABC123XYZ",
      "platform": "android",
      "mode": "adb",
      "state": "device",
      "model": "Pixel 5",
      "manufacturer": "Google"
    }
  ]
}
```

**Failure Modes:**

- Both tools unavailable: `{ "success": false, "adb": { "available": false }, "fastboot": { "available": false }, "merged": [] }`

---

#### `GET /api/bootforgeusb/scan`

Scan USB devices using BootForgeUSB Rust library.

**Query Parameters:**

- `demo=true` (optional): Return demo data if CLI not available

**Response:**

```json
{
  "success": true,
  "cli_available": true,
  "devices": [
    {
      "uid": "usb:18d1:4ee7:bus3:addr5",
      "vendor_id": 6353,
      "product_id": 20199,
      "manufacturer": "Google Inc.",
      "product": "Pixel Device",
      "serial_number": "ABC123XYZ",
      "bus_number": 3,
      "address": 5,
      "platform_hint": "android",
      "confidence": 0.85
    }
  ]
}
```

**Failure Modes:**

- CLI not built: `{ "success": false, "cli_available": false, "error": "BootForgeUSB CLI not found", "devices": [] }`
- Permission denied: `{ "success": false, "cli_available": true, "error": "USB permission denied", "devices": [] }`
- No USB devices: `{ "success": true, "cli_available": true, "devices": [] }`

---

### Device Operations

#### `POST /api/adb/command`

Execute safe ADB command (whitelist enforced).

**Request:**

```json
{
  "command": "shell getprop ro.build.version.release",
  "serial": "ABC123XYZ"
}
```

**Allowed Commands:**

- `devices`
- `shell getprop`
- `get-state`
- `get-serialno`

**Response:**

```json
{
  "success": true,
  "stdout": "14\n",
  "stderr": "",
  "exit_code": 0,
  "duration_ms": 234
}
```

**Failure Modes:**

- Command not whitelisted: `{ "success": false, "error": "Command not allowed: rm -rf" }`
- Device not found: `{ "success": false, "error": "Device ABC123XYZ not found" }`
- ADB error: `{ "success": false, "error": "adb command failed", "stderr": "error: ..." }`

---

#### `POST /api/fastboot/flash`

Flash partition via Fastboot (destructive, requires confirmation).

**Request (multipart/form-data):**

- `serial`: Device serial number
- `partition`: Partition name (boot, recovery, system_a, vendor_b, etc.)
- `image`: Partition image file (binary)

**Response:**

```json
{
  "success": true,
  "job_id": "flash_job_1703001234",
  "partition": "boot",
  "serial": "DEF456UVW",
  "duration_ms": 5432,
  "stdout": "Sending 'boot' (32768 KB)...\nOKAY [  2.145s]\nWriting 'boot'...\nOKAY [  0.321s]",
  "stderr": "",
  "exit_code": 0
}
```

**Failure Modes:**

- Device not in fastboot: `{ "success": false, "error": "Device not found in fastboot mode" }`
- Critical partition blocked: `{ "success": false, "error": "Cannot flash critical partition: bootloader" }`
- Image validation failed: `{ "success": false, "error": "Image file corrupt or invalid format" }`
- Flash operation failed: `{ "success": false, "error": "Fastboot flash failed", "stderr": "FAILED ..." }`

---

#### `POST /api/fastboot/unlock`

Attempt bootloader unlock (requires OEM unlock enabled on device).

**Request:**

```json
{
  "serial": "DEF456UVW",
  "typed_confirmation": "UNLOCK"
}
```

**Response:**

```json
{
  "success": true,
  "serial": "DEF456UVW",
  "stdout": "OKAY [  0.123s]\nFinished. Total time: 0.123s",
  "stderr": "",
  "exit_code": 0,
  "warning": "Device will factory reset and void warranty"
}
```

**Failure Modes:**

- Typed confirmation missing: `{ "success": false, "error": "Must type 'UNLOCK' exactly to confirm" }`
- OEM unlock not enabled: `{ "success": false, "error": "OEM unlocking not allowed", "stderr": "FAILED (remote: 'oem unlock is not allowed')" }`

---

#### `POST /api/fastboot/reboot`

Reboot device from fastboot mode.

**Request:**

```json
{
  "serial": "DEF456UVW",
  "target": "system"
}
```

**Valid Targets:**

- `system`: Reboot to normal OS
- `bootloader`: Reboot to bootloader/fastboot
- `recovery`: Reboot to recovery mode

**Response:**

```json
{
  "success": true,
  "serial": "DEF456UVW",
  "target": "system",
  "stdout": "Rebooting...\nFinished. Total time: 0.050s",
  "exit_code": 0
}
```

**Failure Modes:**

- Invalid target: `{ "success": false, "error": "Invalid reboot target: 'invalid'" }`
- Device not found: `{ "success": false, "error": "Device not found in fastboot mode" }`

---

#### `POST /api/fastboot/erase`

Erase non-critical partition.

**Request:**

```json
{
  "serial": "DEF456UVW",
  "partition": "userdata",
  "typed_confirmation": "RESET"
}
```

**Blocked Partitions:**

- `boot`, `system`, `system_a`, `system_b`, `vendor`, `vendor_a`, `vendor_b`
- `bootloader`, `radio`, `aboot`, `vbmeta`, `vbmeta_a`, `vbmeta_b`

**Response:**

```json
{
  "success": true,
  "serial": "DEF456UVW",
  "partition": "userdata",
  "stdout": "Erasing 'userdata'...\nOKAY [  2.345s]",
  "exit_code": 0
}
```

**Failure Modes:**

- Critical partition: `{ "success": false, "error": "Cannot erase critical partition: boot" }`
- Typed confirmation missing: `{ "success": false, "error": "Must type 'RESET' exactly to confirm" }`

---

### Firmware Management

#### `GET /api/firmware/check/:serial`

Check firmware version for connected device.

**Response:**

```json
{
  "success": true,
  "device": {
    "serial": "ABC123XYZ",
    "manufacturer": "Google",
    "model": "Pixel 5",
    "current_version": "14.0.0",
    "security_patch": "2024-11-05",
    "bootloader_version": "redfin-1.0.0-9123456",
    "baseband_version": "g7250-00345-231015-B-10123456"
  },
  "firmware_info": {
    "latest_version": "14.0.0",
    "latest_security_patch": "2024-12-05",
    "update_available": true,
    "security_status": "outdated",
    "download_url": "https://developers.google.com/android/images#redfin"
  }
}
```

**Failure Modes:**

- Device not connected: `{ "success": false, "error": "Device ABC123XYZ not found" }`
- Firmware database unavailable: `{ "success": true, "device": { ... }, "firmware_info": null, "warning": "Firmware database not accessible" }`

---

### Flash Operations & Progress

#### `POST /api/flash/start`

Start flashing operation with live progress tracking.

**Request:**

```json
{
  "device_id": "ABC123XYZ",
  "device_name": "Pixel 5",
  "partition": "boot",
  "image_path": "/uploads/boot.img",
  "image_size": 33554432
}
```

**Response:**

```json
{
  "success": true,
  "job_id": "job_1703001234_abc123",
  "device_id": "ABC123XYZ",
  "status": "started",
  "websocket_url": "ws://localhost:3001/ws/flash-progress"
}
```

**WebSocket Progress Messages:**

```json
{
  "type": "flash_progress",
  "job_id": "job_1703001234_abc123",
  "device_id": "ABC123XYZ",
  "progress": 45.5,
  "stage": "Flashing boot partition",
  "bytes_transferred": 15258789,
  "total_bytes": 33554432,
  "transfer_speed": 21250000,
  "estimated_time_remaining": 1,
  "timestamp": 1703001235678
}
```

**Completion Message:**

```json
{
  "type": "flash_completed",
  "job_id": "job_1703001234_abc123",
  "device_id": "ABC123XYZ",
  "duration_ms": 5432,
  "timestamp": 1703001240000
}
```

**Failure Modes:**

- Image file missing: `{ "success": false, "error": "Image file not found at path" }`
- Device not found: `{ "success": false, "error": "Device not in fastboot mode" }`
- Flash failed (via WebSocket): `{ "type": "flash_failed", "job_id": "...", "error": "Partition write failed" }`

---

### Authorization Triggers

#### `POST /api/authorization/trigger`

Execute authorization trigger (user confirmation required for sensitive operations).

**Request:**

```json
{
  "trigger_id": "flash_firmware",
  "device_id": "ABC123XYZ",
  "device_name": "Pixel 5",
  "risk_level": "high",
  "typed_confirmation": "CONFIRM",
  "metadata": {
    "partition": "boot",
    "image_size": 33554432
  }
}
```

**Response:**

```json
{
  "success": true,
  "trigger_id": "flash_firmware",
  "device_id": "ABC123XYZ",
  "history_entry_id": "auth_hist_1703001234",
  "execution_time_ms": 5432,
  "audit_log_id": "audit_1703001234"
}
```

**Failure Modes:**

- Typed confirmation mismatch: `{ "success": false, "error": "Must type 'CONFIRM' exactly" }`
- Device not found: `{ "success": false, "error": "Device ABC123XYZ not available" }`
- Operation failed: `{ "success": false, "error": "Flash operation failed", "execution_time_ms": 2345 }`

---

#### `GET /api/authorization/history`

Retrieve authorization trigger history.

**Query Parameters:**

- `limit` (optional): Max results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "total": 42,
  "entries": [
    {
      "id": "auth_hist_1703001234",
      "trigger_id": "flash_firmware",
      "device_id": "ABC123XYZ",
      "device_name": "Pixel 5",
      "status": "success",
      "execution_time_ms": 5432,
      "timestamp": 1703001234567,
      "user_response": "CONFIRM",
      "retry_count": 0
    }
  ]
}
```

---

### WebSocket Channels

#### `ws://localhost:3001/ws/device-events`

Real-time device hotplug events.

**Message Types:**

- `connected`: Device attached
- `disconnected`: Device detached

**Example:**

```json
{
  "type": "connected",
  "device_uid": "usb:18d1:4ee7:bus3:addr5",
  "platform_hint": "android",
  "mode": "adb",
  "confidence": 0.92,
  "timestamp": 1703001234567,
  "display_name": "Google Pixel 5",
  "correlation_badge": "CORRELATED"
}
```

---

#### `ws://localhost:3001/ws/correlation`

Real-time correlation tracking updates.

**Message Types:**

- `batch_update`: Full device list refresh
- `device_connected`: New device added
- `device_disconnected`: Device removed
- `correlation_update`: Correlation evidence updated

---

## Error Response Schema

All endpoints follow consistent error structure:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "error_code": "DEVICE_NOT_FOUND",
  "details": {
    "serial": "ABC123XYZ",
    "attempted_operation": "flash_boot"
  },
  "recommendations": [
    "Check device is connected via USB",
    "Ensure device is in fastboot mode",
    "Run 'fastboot devices' to verify"
  ]
}
```

---

## Rate Limiting

**Current**: No rate limiting (development mode)  
**Planned**: 100 requests/minute per IP for production

---

## Authentication

**Current**: Open (no authentication required)  
**⚠️ WARNING**: Current open authentication is for development only. **DO NOT use in production environments** without implementing proper authentication and authorization.

**Security Implications of Open Mode:**

- Any user with network access can execute operations
- No audit trail of which user performed actions
- No role-based access control
- Vulnerable to unauthorized access

**Planned**: Bearer token authentication via `Authorization: Bearer <token>` header with RBAC support

**Implementation Guidance:**

- Phase 1 (Q1 2025): JWT-based authentication with user registration/login
- Phase 2 (Q2 2025): Role-Based Access Control (RBAC) with permission levels
- Phase 3 (Q2 2025): API key management for automation/integration
- See `/docs/security/authentication-plan.md` (planned) for detailed implementation roadmap

---

## Versioning

API version indicated in response headers:

```
X-API-Version: 1.0
```

Breaking changes will increment major version and require `/api/v2/...` path prefix.

---

## Testing

All endpoints have automated integration tests verifying:

1. Success response schema
2. All documented failure modes
3. Edge cases (empty inputs, missing tools, permission errors)
4. Performance benchmarks

---

## Maintenance

This API contract is updated:

- **On every breaking change**: Document new error modes
- **On feature addition**: Add new endpoint documentation
- **Quarterly**: Review for accuracy and completeness

**Last Updated**: December 15, 2024  
**Version**: 1.0  
**Maintainer**: Pandora Codex Backend Team
