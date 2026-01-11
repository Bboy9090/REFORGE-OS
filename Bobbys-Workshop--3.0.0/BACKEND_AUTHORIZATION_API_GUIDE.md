# Backend Authorization Triggers API - Implementation Guide

## Overview

This guide provides the complete backend implementation for all device authorization triggers in Bobby's World / Pandora Codex. Every endpoint executes **real commands** with **real results** - no simulated data.

---

## 🏗️ Backend Stack

### Recommended Stack

- **Runtime**: Node.js 20+ or Python 3.11+
- **Framework**: Express.js or FastAPI
- **Command Execution**: `child_process.execFile` (Node) or `subprocess.run` (Python)
- **WebSocket**: Socket.IO or Python websockets
- **Database**: SQLite for audit logs
- **Security**: Rate limiting, input validation, GPG signing

---

## 🔐 API Endpoint Reference

### Base URL

```
http://localhost:8080/api
```

### Authentication

All endpoints require:

- `X-API-Key` header (for production)
- Rate limiting: 10 requests per minute per device

---

## 📱 Android/ADB Authorization Endpoints

### 1. Trigger USB Debugging Authorization

**Endpoint**: `POST /api/adb/trigger-auth`

**Purpose**: Forces "Allow USB debugging?" dialog on Android device

**Request**:

```json
{
  "serial": "ABC123XYZ",
  "command": "shell getprop"
}
```

**Backend Implementation (Node.js)**:

```javascript
const { execFile } = require("child_process");
const { promisify } = require("util");
const execFileAsync = promisify(execFile);

app.post("/api/adb/trigger-auth", async (req, res) => {
  const { serial, command = "shell getprop" } = req.body;

  if (!serial || !/^[A-Za-z0-9]{1,32}$/.test(serial)) {
    return res.status(400).json({
      success: false,
      message: "Invalid serial number format",
      triggered: false,
    });
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      "adb",
      ["-s", serial, "shell", "getprop", "ro.build.version.release"],
      { timeout: 5000 },
    );

    return res.json({
      success: true,
      message:
        'USB debugging authorization triggered. Check your device and tap "Allow".',
      triggered: true,
      requiresUserAction: true,
      authorizationType: "adb_usb_debugging",
      commandOutput: stdout.trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.stderr && error.stderr.includes("unauthorized")) {
      return res.json({
        success: true,
        message:
          "Authorization dialog triggered on device (device currently unauthorized)",
        triggered: true,
        requiresUserAction: true,
        authorizationType: "adb_usb_debugging",
        note: "Device is unauthorized - this is expected. The prompt should appear on the device.",
        timestamp: new Date().toISOString(),
      });
    }

    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "ADB tool not installed on this system",
        triggered: false,
        toolMissing: true,
        installGuide: "https://developer.android.com/studio/command-line/adb",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
      triggered: false,
    });
  }
});
```

**Backend Implementation (Python/FastAPI)**:

```python
import subprocess
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

class ADBAuthRequest(BaseModel):
    serial: str
    command: str = "shell getprop"

@app.post("/api/adb/trigger-auth")
async def trigger_adb_auth(request: ADBAuthRequest):
    if not re.match(r'^[A-Za-z0-9]{1,32}$', request.serial):
        raise HTTPException(status_code=400, detail="Invalid serial number format")

    try:
        result = subprocess.run(
            ['adb', '-s', request.serial, 'shell', 'getprop', 'ro.build.version.release'],
            capture_output=True,
            text=True,
            timeout=5
        )

        return {
            "success": True,
            "message": "USB debugging authorization triggered. Check your device and tap 'Allow'.",
            "triggered": True,
            "requiresUserAction": True,
            "authorizationType": "adb_usb_debugging",
            "commandOutput": result.stdout.strip(),
            "timestamp": datetime.utcnow().isoformat()
        }
    except subprocess.CalledProcessError as e:
        if 'unauthorized' in e.stderr:
            return {
                "success": True,
                "message": "Authorization dialog triggered on device (device currently unauthorized)",
                "triggered": True,
                "requiresUserAction": True,
                "authorizationType": "adb_usb_debugging",
                "note": "Device is unauthorized - this is expected.",
                "timestamp": datetime.utcnow().isoformat()
            }
        raise HTTPException(status_code=500, detail=str(e))
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "message": "ADB tool not installed on this system",
                "toolMissing": True,
                "installGuide": "https://developer.android.com/studio/command-line/adb"
            }
        )
```

---

### 2. Trigger File Transfer Authorization

**Endpoint**: `POST /api/adb/trigger-file-auth`

**Backend Implementation (Node.js)**:

```javascript
const fs = require("fs").promises;
const path = require("path");
const os = require("os");

app.post("/api/adb/trigger-file-auth", async (req, res) => {
  const { serial } = req.body;

  if (!serial || !/^[A-Za-z0-9]{1,32}$/.test(serial)) {
    return res.status(400).json({
      success: false,
      message: "Invalid serial number format",
    });
  }

  const testFilePath = path.join(os.tmpdir(), `auth_test_${serial}.txt`);

  try {
    await fs.writeFile(testFilePath, "test\n");

    const { stdout, stderr } = await execFileAsync(
      "adb",
      ["-s", serial, "push", testFilePath, "/sdcard/Download/"],
      { timeout: 10000 },
    );

    await fs.unlink(testFilePath).catch(() => {});

    return res.json({
      success: true,
      message: "File transfer authorization triggered",
      triggered: true,
      requiresUserAction: true,
      authorizationType: "adb_file_transfer",
      commandOutput: stdout.trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await fs.unlink(testFilePath).catch(() => {});

    if (error.stderr && error.stderr.includes("unauthorized")) {
      return res.json({
        success: true,
        message:
          "File transfer authorization dialog triggered (device needs authorization)",
        triggered: true,
        requiresUserAction: true,
        authorizationType: "adb_file_transfer",
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
      triggered: false,
    });
  }
});
```

---

### 3. Trigger Backup Authorization

**Endpoint**: `POST /api/adb/trigger-backup-auth`

**Backend Implementation (Node.js)**:

```javascript
app.post("/api/adb/trigger-backup-auth", async (req, res) => {
  const { serial } = req.body;

  if (!serial || !/^[A-Za-z0-9]{1,32}$/.test(serial)) {
    return res.status(400).json({
      success: false,
      message: "Invalid serial number format",
    });
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      "adb",
      ["-s", serial, "backup", "-noapk", "-noshared", "com.android.settings"],
      { timeout: 10000 },
    );

    return res.json({
      success: true,
      message: "Backup authorization dialog triggered on device",
      triggered: true,
      requiresUserAction: true,
      authorizationType: "adb_backup",
      note: "User may be prompted for encryption password",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      triggered: false,
    });
  }
});
```

---

## 🍎 iOS Device Authorization Endpoints

### 4. Trigger iOS Trust Computer

**Endpoint**: `POST /api/ios/trigger-trust`

**Backend Implementation (Node.js)**:

```javascript
app.post("/api/ios/trigger-trust", async (req, res) => {
  const { udid } = req.body;

  if (!udid || !/^[a-f0-9]{40}$/i.test(udid)) {
    return res.status(400).json({
      success: false,
      message: "Invalid UDID format",
    });
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      "ideviceinfo",
      ["-u", udid],
      { timeout: 10000 },
    );

    return res.json({
      success: true,
      message: "iOS trust computer dialog triggered",
      triggered: true,
      requiresUserAction: true,
      authorizationType: "ios_trust_computer",
      commandOutput: stdout.trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.stderr && error.stderr.includes("not trusted")) {
      return res.json({
        success: true,
        message: "Trust This Computer dialog triggered (device not trusted)",
        triggered: true,
        requiresUserAction: true,
        authorizationType: "ios_trust_computer",
        note: "User must tap Trust and enter passcode on device",
        timestamp: new Date().toISOString(),
      });
    }

    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "libimobiledevice tools not installed",
        toolMissing: true,
        installGuide: "https://libimobiledevice.org/",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
      triggered: false,
    });
  }
});
```

---

### 5. Trigger iOS Pairing

**Endpoint**: `POST /api/ios/trigger-pairing`

**Backend Implementation (Node.js)**:

```javascript
app.post("/api/ios/trigger-pairing", async (req, res) => {
  const { udid } = req.body;

  if (!udid || !/^[a-f0-9]{40}$/i.test(udid)) {
    return res.status(400).json({
      success: false,
      message: "Invalid UDID format",
    });
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      "idevicepair",
      ["-u", udid, "pair"],
      { timeout: 30000 },
    );

    const successMatch = stdout.match(/SUCCESS: Paired with device/i);

    return res.json({
      success: !!successMatch,
      message: successMatch
        ? "Device paired successfully"
        : "Pairing request sent",
      triggered: true,
      requiresUserAction: true,
      authorizationType: "ios_pairing",
      commandOutput: stdout.trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      triggered: false,
    });
  }
});
```

---

## ⚡ Fastboot/Bootloader Endpoints

### 6. Verify Fastboot Unlock Status

**Endpoint**: `POST /api/fastboot/verify-unlock`

**Backend Implementation (Node.js)**:

```javascript
app.post("/api/fastboot/verify-unlock", async (req, res) => {
  const { serial } = req.body;

  if (!serial || !/^[A-Za-z0-9]{1,32}$/.test(serial)) {
    return res.status(400).json({
      success: false,
      message: "Invalid serial number format",
    });
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      "fastboot",
      ["-s", serial, "getvar", "unlocked"],
      { timeout: 5000 },
    );

    const combined = stdout + stderr;
    const unlocked = combined.toLowerCase().includes("unlocked: yes");

    return res.json({
      success: true,
      message: unlocked ? "Bootloader is unlocked" : "Bootloader is locked",
      triggered: true,
      requiresUserAction: false,
      authorizationType: "fastboot_unlock",
      unlocked,
      commandOutput: combined.trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "Fastboot tool not installed",
        toolMissing: true,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
      triggered: false,
    });
  }
});
```

---

## 📱 Samsung/Odin Endpoints

### 7. Verify Download Mode

**Endpoint**: `POST /api/samsung/trigger-download-mode`

**Backend Implementation (Node.js)**:

```javascript
app.post("/api/samsung/trigger-download-mode", async (req, res) => {
  try {
    const { stdout: detectOut } = await execFileAsync("heimdall", ["detect"], {
      timeout: 5000,
    });

    if (!detectOut.toLowerCase().includes("device detected")) {
      return res.json({
        success: false,
        message: "No Samsung device detected in Download Mode",
        triggered: true,
        requiresUserAction: false,
      });
    }

    const { stdout: pitOut } = await execFileAsync(
      "heimdall",
      ["print-pit", "--no-reboot", "--verbose"],
      { timeout: 10000 },
    );

    return res.json({
      success: true,
      message: "Samsung device in Download Mode verified",
      triggered: true,
      requiresUserAction: false,
      authorizationType: "odin_download_mode",
      commandOutput: pitOut.trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "Heimdall not installed",
        toolMissing: true,
        installGuide: "https://github.com/Benjamin-Dobell/Heimdall",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
      triggered: false,
    });
  }
});
```

---

## 🔥 Qualcomm EDL Endpoints

### 8. Verify EDL Authorization

**Endpoint**: `POST /api/qualcomm/trigger-edl-auth`

**Backend Implementation (Node.js)**:

```javascript
app.post("/api/qualcomm/trigger-edl-auth", async (req, res) => {
  const { serial, programmer } = req.body;

  if (!programmer) {
    return res.status(400).json({
      success: false,
      message: "Programmer file path required for EDL mode",
    });
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      "edl",
      [`--loader=${programmer}`, "--memory=ufs", "printgpt"],
      { timeout: 15000 },
    );

    return res.json({
      success: true,
      message: "EDL mode device detected and authorized",
      triggered: true,
      requiresUserAction: false,
      authorizationType: "edl_authorized_connection",
      commandOutput: stdout.trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "EDL tools not installed",
        toolMissing: true,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
      triggered: false,
    });
  }
});
```

---

## 🔧 Audit Logging

### Audit Log Schema (SQLite)

```sql
CREATE TABLE authorization_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  authorization_type TEXT NOT NULL,
  device_serial TEXT NOT NULL,
  command_executed TEXT NOT NULL,
  exit_code INTEGER,
  stdout TEXT,
  stderr TEXT,
  success BOOLEAN NOT NULL,
  user_response TEXT,
  ip_address TEXT,
  evidence_id TEXT
);

CREATE INDEX idx_auth_timestamp ON authorization_audit(timestamp);
CREATE INDEX idx_auth_device ON authorization_audit(device_serial);
CREATE INDEX idx_auth_type ON authorization_audit(authorization_type);
```

### Logging Function (Node.js)

```javascript
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(".pandora_private/audit.db");

async function logAuthorization(data) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO authorization_audit (
        timestamp, authorization_type, device_serial, command_executed,
        exit_code, stdout, stderr, success, user_response, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        new Date().toISOString(),
        data.authorizationType,
        data.deviceSerial,
        data.commandExecuted,
        data.exitCode || 0,
        data.stdout || "",
        data.stderr || "",
        data.success ? 1 : 0,
        data.userResponse || null,
        data.ipAddress || null,
      ],
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });
}
```

---

## 🔒 Security Best Practices

### Input Validation

```javascript
function validateSerial(serial) {
  if (typeof serial !== "string") return false;
  if (serial.length < 1 || serial.length > 32) return false;
  if (!/^[A-Za-z0-9]+$/.test(serial)) return false;
  return true;
}

function validateUDID(udid) {
  if (typeof udid !== "string") return false;
  if (!/^[a-f0-9]{40}$/i.test(udid)) return false;
  return true;
}
```

### Command Injection Prevention

```javascript
const { execFile } = require("child_process");

execFile(
  "adb",
  ["-s", serial, "shell", "echo", userInput],
  (error, stdout) => {},
);
```

### Rate Limiting (Express)

```javascript
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many authorization requests, please try again later",
  keyGenerator: (req) => req.body.serial || req.ip,
});

app.use("/api/adb/trigger-auth", authLimiter);
app.use("/api/ios/trigger-trust", authLimiter);
```

---

## 🚀 Testing Commands

### Test ADB Authorization

```bash
curl -X POST http://localhost:8080/api/adb/trigger-auth \
  -H "Content-Type: application/json" \
  -d '{"serial": "ABC123"}'
```

### Test iOS Trust

```bash
curl -X POST http://localhost:8080/api/ios/trigger-trust \
  -H "Content-Type: application/json" \
  -d '{"udid": "00008030000012345678900a1234567890123456"}'
```

### Test Fastboot Unlock

```bash
curl -X POST http://localhost:8080/api/fastboot/verify-unlock \
  -H "Content-Type: application/json" \
  -d '{"serial": "ABC123"}'
```

---

## 📝 Complete Server Example (Node.js)

```javascript
const express = require("express");
const { execFile } = require("child_process");
const { promisify } = require("util");
const rateLimit = require("express-rate-limit");

const app = express();
const execFileAsync = promisify(execFile);

app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 60000,
  max: 10,
});

app.post("/api/adb/trigger-auth", authLimiter, async (req, res) => {});

app.listen(8080, () => {
  console.log("Authorization triggers API running on port 8080");
});
```

---

**Last Updated**: 2025-01-15  
**API Version**: 2.0  
**Compatible with**: Bobby's World Workshop v2.0+
