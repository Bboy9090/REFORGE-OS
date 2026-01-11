# Device Authorization Triggers - Backend API Guide

## Overview

This document outlines all backend endpoints required to support device authorization triggering across Android, iOS, Samsung, Qualcomm, and MediaTek platforms.

**Critical Requirement:** All responses must be based on **real command executions**. No simulated data, no ghost values, no fake "connected" statuses.

---

## 🔐 Android/ADB Authorization Endpoints

### 1. Trigger ADB USB Debugging Authorization

**Endpoint:** `POST /api/adb/trigger-auth`

**Purpose:** Force the "Allow USB debugging?" dialog on Android device

**Request Body:**

```json
{
  "serial": "device_serial_number",
  "command": "shell getprop"
}
```

**Real Command Executed:**

```bash
adb -s {serial} shell getprop ro.build.version.release
```

**Response:**

```json
{
  "success": true,
  "message": "ADB authorization dialog triggered on device",
  "triggered": true,
  "requiresUserAction": true,
  "authorizationType": "adb_usb_debugging",
  "commandOutput": "...",
  "exitCode": 0
}
```

**Failure Response (unauthorized):**

```json
{
  "success": false,
  "message": "device unauthorized - waiting for user approval",
  "triggered": true,
  "requiresUserAction": true,
  "authorizationType": "adb_usb_debugging",
  "error": "device unauthorized"
}
```

---

### 2. Trigger File Transfer Authorization

**Endpoint:** `POST /api/adb/trigger-file-auth`

**Purpose:** Trigger file transfer permission dialog

**Request Body:**

```json
{
  "serial": "device_serial_number",
  "command": "push"
}
```

**Real Command Executed:**

```bash
# Create a temporary test file
echo "test" > /tmp/auth_test_${serial}.txt
adb -s {serial} push /tmp/auth_test_${serial}.txt /sdcard/Download/
rm /tmp/auth_test_${serial}.txt
```

**Response:** Similar structure to ADB USB debugging

---

### 3. Trigger Backup Authorization

**Endpoint:** `POST /api/adb/trigger-backup-auth`

**Purpose:** Trigger backup authorization and encryption dialog

**Request Body:**

```json
{
  "serial": "device_serial_number"
}
```

**Real Command Executed:**

```bash
# Initiate a minimal backup request (no actual backup performed)
adb -s {serial} backup -noapk -noshared com.android.settings
```

**Response:** Similar structure to ADB USB debugging

---

## 🍎 iOS Device Authorization Endpoints

### 4. Trigger iOS Trust Computer Dialog

**Endpoint:** `POST /api/ios/trigger-trust`

**Purpose:** Trigger "Trust This Computer?" dialog on iOS device

**Request Body:**

```json
{
  "udid": "device_udid",
  "command": "ideviceinfo"
}
```

**Real Command Executed:**

```bash
ideviceinfo -u {udid}
```

**Response:**

```json
{
  "success": true,
  "message": "iOS trust computer dialog triggered",
  "triggered": true,
  "requiresUserAction": true,
  "authorizationType": "ios_trust_computer",
  "commandOutput": "...",
  "exitCode": 0
}
```

**Failure Response (not trusted):**

```json
{
  "success": false,
  "message": "ERROR: Could not connect to lockdownd - device not trusted",
  "triggered": true,
  "requiresUserAction": true,
  "authorizationType": "ios_trust_computer",
  "error": "device not trusted"
}
```

---

### 5. Trigger iOS Pairing Request

**Endpoint:** `POST /api/ios/trigger-pairing`

**Purpose:** Send pairing request to establish device connection

**Request Body:**

```json
{
  "udid": "device_udid",
  "command": "idevicepair pair"
}
```

**Real Command Executed:**

```bash
idevicepair -u {udid} pair
```

**Response:**

```json
{
  "success": true,
  "message": "SUCCESS: Paired with device {udid}",
  "triggered": true,
  "requiresUserAction": true,
  "authorizationType": "ios_pairing"
}
```

---

### 6. Trigger iOS Backup Encryption Authorization

**Endpoint:** `POST /api/ios/trigger-backup-auth`

**Purpose:** Trigger backup encryption authorization dialog

**Request Body:**

```json
{
  "udid": "device_udid"
}
```

**Real Command Executed:**

```bash
# Query backup encryption status (triggers authorization)
idevicebackup2 -u {udid} info
```

**Response:** Similar structure to iOS trust computer

---

### 7. Trigger DFU/Recovery Mode Entry

**Endpoint:** `POST /api/ios/trigger-dfu`

**Purpose:** Enter DFU or Recovery mode (shows warning on device)

**Request Body:**

```json
{
  "udid": "device_udid",
  "command": "ideviceenterrecovery"
}
```

**Real Command Executed:**

```bash
ideviceenterrecovery {udid}
```

**Response:**

```json
{
  "success": true,
  "message": "Device entering recovery mode",
  "triggered": true,
  "requiresUserAction": true,
  "authorizationType": "dfu_restore_mode"
}
```

---

## ⚡ Fastboot Authorization Endpoints

### 8. Verify Fastboot Unlock Status

**Endpoint:** `POST /api/fastboot/verify-unlock`

**Purpose:** Verify bootloader unlock status

**Request Body:**

```json
{
  "serial": "device_serial_number",
  "command": "getvar unlocked"
}
```

**Real Command Executed:**

```bash
fastboot -s {serial} getvar unlocked
```

**Response:**

```json
{
  "success": true,
  "message": "unlocked: yes",
  "triggered": true,
  "requiresUserAction": false,
  "authorizationType": "fastboot_unlock",
  "unlocked": true
}
```

---

## 📱 Samsung Odin/Download Mode Endpoints

### 9. Verify Samsung Download Mode

**Endpoint:** `POST /api/samsung/trigger-download-mode`

**Purpose:** Verify Samsung Download Mode connectivity

**Request Body:**

```json
{
  "serial": "device_serial_number"
}
```

**Real Command Executed:**

```bash
# Using Heimdall for Samsung device detection
heimdall detect
heimdall print-pit --no-reboot --verbose
```

**Response:**

```json
{
  "success": true,
  "message": "Samsung device detected in Download Mode",
  "triggered": true,
  "requiresUserAction": false,
  "authorizationType": "odin_download_mode",
  "deviceInfo": {
    "model": "SM-G998B",
    "firmwareVersion": "...",
    "bootloaderVersion": "..."
  }
}
```

---

## 🔥 Qualcomm EDL Mode Endpoints

### 10. Verify EDL Mode Authorization

**Endpoint:** `POST /api/qualcomm/trigger-edl-auth`

**Purpose:** Verify Qualcomm EDL mode authorization

**Request Body:**

```json
{
  "serial": "device_serial_number"
}
```

**Real Command Executed:**

```bash
# Using QDL/EDL tools to verify connection
edl --loader={programmer.elf} --memory=ufs printgpt
```

**Response:**

```json
{
  "success": true,
  "message": "EDL mode device detected and authorized",
  "triggered": true,
  "requiresUserAction": false,
  "authorizationType": "edl_authorized_connection",
  "deviceInfo": {
    "serialNumber": "...",
    "emmc": false,
    "ufs": true
  }
}
```

---

## 📲 MediaTek SP Flash Tool Endpoints

### 11. Verify MTK SP Flash Authorization

**Endpoint:** `POST /api/mediatek/trigger-flash-auth`

**Purpose:** Check MediaTek SP Flash Tool authorization

**Request Body:**

```json
{
  "serial": "device_serial_number"
}
```

**Real Command Executed:**

```bash
# Using SP Flash Tool CLI or mtkclient
python3 mtk_cli.py printgpt
```

**Response:**

```json
{
  "success": true,
  "message": "MediaTek device detected and ready for flash operations",
  "triggered": true,
  "requiresUserAction": false,
  "authorizationType": "mtk_sp_flash",
  "deviceInfo": {
    "chip": "MT6765",
    "ramSize": "4GB",
    "emmcSize": "64GB"
  }
}
```

---

## 🔧 Implementation Requirements

### 1. Real Command Execution

- **Must use actual CLI tools:** `adb`, `fastboot`, `ideviceinfo`, `idevicepair`, `heimdall`, `edl`, `mtkclient`
- **Must capture real stdout/stderr**
- **Must return actual exit codes**
- **No simulated responses**

### 2. Error Handling

```typescript
// Backend error response structure
{
  "success": false,
  "message": "Tool not installed: adb",
  "triggered": false,
  "requiresUserAction": false,
  "authorizationType": "adb_usb_debugging",
  "error": "Command not found: adb",
  "toolMissing": true,
  "installGuide": "https://developer.android.com/studio/command-line/adb"
}
```

### 3. Timeout Handling

- Default timeout: 30 seconds
- If command hangs, return timeout error
- Do not fake success

### 4. Logging Requirements

All authorization trigger requests must log:

- Timestamp
- Command executed
- Exit code
- stdout/stderr output
- Success/failure status
- Device serial/UDID

### 5. Security Considerations

- Validate all device serial/UDID inputs
- Prevent command injection attacks
- Sanitize file paths
- Rate limit authorization trigger requests

---

## 📋 Testing Checklist

- [ ] ADB USB debugging trigger tested with real unauthorized device
- [ ] ADB file transfer trigger tested
- [ ] ADB backup authorization trigger tested
- [ ] iOS trust computer trigger tested with untrusted device
- [ ] iOS pairing trigger tested
- [ ] iOS backup encryption trigger tested
- [ ] Fastboot unlock verification tested
- [ ] Samsung Download Mode detection tested
- [ ] Qualcomm EDL mode detection tested
- [ ] MediaTek flash mode detection tested
- [ ] All error cases return proper error responses
- [ ] No simulated data in any response
- [ ] All timeouts properly handled
- [ ] All commands properly logged

---

## 🎯 Frontend Integration

The frontend `DeviceAuthorizationTriggersPanel` component expects these exact endpoint formats.

**Usage Example:**

```typescript
import { authTriggers } from "@/lib/device-authorization-triggers";

// Trigger ADB USB debugging authorization
const result = await authTriggers.triggerADBUSBDebugging("serial123");

// Trigger iOS trust computer
const iosResult = await authTriggers.triggerIOSTrustComputer("udid456");

// Trigger all available authorizations for a platform
const allResults = await authTriggers.triggerAllAvailableAuthorizations(
  "serial123",
  "android",
);
```

---

## 📝 Notes

1. **User must be present** for authorization triggers that require user action
2. **Device screen must be unlocked** for iOS/Android authorization dialogs
3. **USB debugging must be enabled** in Developer Options (but not authorized)
4. **Trust dialog only appears once** until computer is untrusted or device is reset
5. **Backup authorization** may require device to be unlocked and screen on

---

**Last Updated:** 2025-01-XX  
**API Version:** 1.0  
**Backend Implementation:** Node.js/FastAPI
