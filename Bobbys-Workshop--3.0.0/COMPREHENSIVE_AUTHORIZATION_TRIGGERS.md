# 🔐 Comprehensive Device Authorization Triggers Guide

## Overview

This guide documents **every possible trigger** that Bobby's World / Pandora Codex can execute to prompt user interaction, device authorization, or system-level confirmations on connected devices.

**Critical Principle:** All triggers execute **real commands** that result in **real device prompts** or **real system checks**. No simulated responses.

---

## 🎯 Trigger Categories

### 1. 🔐 Trust & Security Prompts

These triggers request explicit user permission or trust on the device itself.

#### Android ADB Trust Triggers

| Trigger                         | Command Executed                                     | User Sees                                                      | Result                                          |
| ------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| **USB Debugging Authorization** | `adb -s {serial} shell getprop`                      | "Allow USB debugging?" dialog with computer fingerprint        | User taps "Allow" → ADB access granted          |
| **File Transfer Permission**    | `adb -s {serial} push test.txt /sdcard/`             | "Allow access to device files?" prompt                         | User taps "Allow" → File transfer enabled       |
| **Backup Authorization**        | `adb -s {serial} backup -noapk com.android.settings` | "Allow backup?" with optional encryption password              | User confirms → Backup access granted           |
| **Install from Computer**       | `adb -s {serial} install app.apk`                    | "Install this app from your computer?"                         | User taps "Install" → APK installation proceeds |
| **Screen Capture Permission**   | `adb -s {serial} shell screencap /sdcard/screen.png` | May trigger "Allow screen recording/capture?" on newer Android | User allows → Screenshots enabled               |

#### iOS Trust Triggers

| Trigger                    | Command Executed                          | User Sees                                   | Result                                                    |
| -------------------------- | ----------------------------------------- | ------------------------------------------- | --------------------------------------------------------- |
| **Trust This Computer**    | `ideviceinfo -u {udid}`                   | "Trust This Computer?" dialog               | User taps "Trust" + enters passcode → Computer authorized |
| **Pairing Request**        | `idevicepair -u {udid} pair`              | Pairing notification + passcode entry       | User enters passcode → Pairing record created             |
| **Backup Encryption**      | `idevicebackup2 -u {udid} info`           | "Would you like to encrypt your backups?"   | User sets backup password → Encrypted backups enabled     |
| **App Installation Trust** | `ideviceinstaller -u {udid} -i app.ipa`   | "Do you want to install this app?"          | User confirms on device → App installs                    |
| **Developer Trust**        | `ios-deploy --id {udid} --bundle app.app` | "Trust Developer?" (for non-App Store apps) | User: Settings → General → Device Management → Trust      |

---

### 2. ⚙️ Device Operation Confirmations

These triggers require explicit user confirmation before executing potentially destructive or sensitive operations.

#### Flash Operations

| Operation             | Frontend Trigger                        | Backend Execution                                   | Confirmation Required                                         |
| --------------------- | --------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| **Start Flash**       | User clicks "Flash Firmware"            | `fastboot -s {serial} flash system system.img`      | ✅ Dialog: "Flash system partition? This cannot be undone"    |
| **Batch Flash**       | User clicks "Flash Multiple Partitions" | Sequential `fastboot flash` commands                | ✅ Dialog: Shows partition list + "Type CONFIRM to proceed"   |
| **Factory Reset**     | User clicks "Factory Reset"             | `fastboot -w` or `adb shell recovery --wipe_data`   | ✅ Dialog: "Type FACTORY RESET to confirm data erasure"       |
| **Bootloader Unlock** | User clicks "Unlock Bootloader"         | `fastboot oem unlock` or `fastboot flashing unlock` | ✅ Dialog: "This will ERASE ALL DATA. Type UNLOCK to confirm" |
| **Format Userdata**   | User clicks "Format Data"               | `fastboot format:ext4 userdata`                     | ✅ Dialog: "All user data will be permanently erased"         |

#### Recovery & Boot Mode Triggers

| Trigger                   | Command Executed                  | User Interaction             | Result                                         |
| ------------------------- | --------------------------------- | ---------------------------- | ---------------------------------------------- |
| **Reboot to Recovery**    | `adb reboot recovery`             | None (automatic)             | Device reboots into recovery menu              |
| **Reboot to Bootloader**  | `adb reboot bootloader`           | None (automatic)             | Device enters fastboot mode                    |
| **Reboot to EDL**         | `adb reboot edl`                  | None (automatic)             | Qualcomm devices enter Emergency Download Mode |
| **iOS DFU Mode Entry**    | `ideviceenterrecovery {udid}`     | User follows button sequence | Device enters DFU mode for restore             |
| **Samsung Download Mode** | Hardware button combination guide | User holds Vol Down + Power  | Device enters Odin download mode               |

---

### 3. 📊 Diagnostic & Evidence Collection Triggers

#### Diagnostic Operations

| Trigger                      | What It Does                                                         | Requires Confirmation              | Audit Logged |
| ---------------------------- | -------------------------------------------------------------------- | ---------------------------------- | ------------ |
| **Run Full Diagnostics**     | Executes all health checks (battery, storage, sensors, connectivity) | ✅ "Run diagnostics on {device}?"  | ✅ Yes       |
| **Export Evidence Bundle**   | Generates signed diagnostic report with chain-of-custody             | ✅ "Export evidence for {device}?" | ✅ Yes       |
| **Collect ADB Logs**         | `adb logcat -d > logs.txt`                                           | ❌ No                              | ✅ Yes       |
| **Capture Crash Logs (iOS)** | `idevicecrashreport -e`                                              | ❌ No                              | ✅ Yes       |
| **Benchmark Flash Speed**    | Runs timed flash operations to profile performance                   | ✅ "Start benchmark?"              | ✅ Yes       |
| **Network Diagnostics**      | Tests WiFi, Bluetooth, cellular connectivity                         | ❌ No                              | ✅ Yes       |

#### Evidence & Snapshot Operations

| Operation                       | Trigger                        | Backend Action                                            | User Confirmation               |
| ------------------------------- | ------------------------------ | --------------------------------------------------------- | ------------------------------- |
| **Auto-Snapshot**               | After any diagnostic operation | Saves diagnostic results to `.pandora_private/snapshots/` | ❌ Automatic                    |
| **Manual Snapshot**             | User clicks "Save Snapshot"    | Creates timestamped snapshot with metadata                | ✅ "Save current device state?" |
| **Workspace Backup**            | Scheduled or manual            | Archives workspace + evidence bundles                     | ✅ "Backup workspace now?"      |
| **Evidence Chain Verification** | User clicks "Verify Evidence"  | Validates GPG signatures + checksums                      | ❌ No (read-only)               |

---

### 4. 🛡️ Policy & Compliance Gates

These triggers enforce security policies and compliance requirements before allowing high-risk operations.

#### Destructive Action Confirmations

| Action                | Trigger Type       | Confirmation Method                 | Policy Enforcement   |
| --------------------- | ------------------ | ----------------------------------- | -------------------- |
| **Bootloader Unlock** | Typed Confirmation | User types "UNLOCK" exactly         | ✅ Logs who/when/why |
| **Factory Reset**     | Typed Confirmation | User types "FACTORY RESET"          | ✅ Logs who/when/why |
| **Partition Erase**   | Typed Confirmation | User types "ERASE {partition_name}" | ✅ Logs who/when/why |
| **Format Userdata**   | Typed Confirmation | User types "FORMAT"                 | ✅ Logs who/when/why |
| **Root Access Grant** | Typed Confirmation | User types "GRANT ROOT"             | ✅ Logs who/when/why |

#### RBAC (Role-Based Access Control) Gates

| Operation               | Required Role                 | Approval Needed        | Implementation                     |
| ----------------------- | ----------------------------- | ---------------------- | ---------------------------------- |
| **Flash Custom ROM**    | `technician` or higher        | ❌ No                  | Check user role before allowing    |
| **Unlock Bootloader**   | `senior_technician` or higher | ✅ Supervisor approval | Supervisor enters PIN              |
| **EDL Flash**           | `engineer` or higher          | ✅ Manager approval    | Manager GPG signs request          |
| **Evidence Export**     | Any authenticated user        | ❌ No                  | All exports are audit-logged       |
| **Plugin Installation** | `admin` or higher             | ❌ No                  | Plugins are security-scanned first |

#### Audit & Compliance Triggers

| Trigger                 | What It Records                                             | Where It's Stored              | Retention Period         |
| ----------------------- | ----------------------------------------------------------- | ------------------------------ | ------------------------ |
| **Operation Start**     | `{ action, deviceSerial, username, timestamp, evidenceId }` | `.pandora_private/audit_logs/` | 7 years (GDPR compliant) |
| **Authorization Grant** | `{ authType, deviceSerial, userResponse, timestamp }`       | Audit log + evidence bundle    | 7 years                  |
| **Evidence Export**     | `{ bundleId, exportedBy, recipientEmail, timestamp }`       | Audit log                      | 7 years                  |
| **Destructive Action**  | `{ action, confirmation, deviceState, outcome }`            | Audit log + snapshot           | 7 years                  |

---

### 5. 🔌 Device Connection & Hotplug Triggers

#### Hotplug Event Triggers

| Event                       | Frontend Behavior            | User Prompt                    | Backend Action                              |
| --------------------------- | ---------------------------- | ------------------------------ | ------------------------------------------- |
| **USB Device Attached**     | Toast: "New device detected" | "Do you want to connect?"      | Runs detection probes (ADB/Fastboot/iOS)    |
| **Driver Missing**          | Alert: "Driver not found"    | "Install driver for {device}?" | Opens driver installation guide             |
| **Unauthorized ADB Device** | Alert: "Device unauthorized" | "Trigger authorization?"       | Executes `adb shell` to prompt trust dialog |
| **iOS Untrusted Device**    | Alert: "Device not trusted"  | "Trigger trust dialog?"        | Executes `ideviceinfo` to prompt trust      |
| **Weak USB Connection**     | Warning: "Weak USB signal"   | "Switch to USB 2.0 port?"      | Provides troubleshooting steps              |

#### Tool Health Checks

| Tool                 | Check Command          | User Prompt                     | Action                             |
| -------------------- | ---------------------- | ------------------------------- | ---------------------------------- |
| **ADB**              | `adb version`          | "ADB not found. Install?"       | Opens ADB installation guide       |
| **Fastboot**         | `fastboot --version`   | "Fastboot not found. Install?"  | Opens Fastboot installation guide  |
| **libimobiledevice** | `ideviceinfo -v`       | "iOS tools not found. Install?" | Opens libimobiledevice guide       |
| **Heimdall**         | `heimdall version`     | "Heimdall not found. Install?"  | Opens Heimdall installation guide  |
| **Python mtkclient** | `python3 -m mtkclient` | "mtkclient not found. Install?" | Opens mtkclient installation guide |

---

### 6. 🔧 Advanced Platform-Specific Triggers

#### Samsung-Specific Triggers

| Trigger                             | Tool     | Command                                              | User Sees                                   |
| ----------------------------------- | -------- | ---------------------------------------------------- | ------------------------------------------- |
| **Verify Download Mode**            | Heimdall | `heimdall detect`                                    | "Samsung device in Download Mode detected"  |
| **Flash with Odin**                 | Heimdall | `heimdall flash --BOOT boot.img`                     | "Flashing BOOT partition..." (progress bar) |
| **PIT Partition Table Read**        | Heimdall | `heimdall print-pit`                                 | Shows partition layout table                |
| **Factory Reset via Download Mode** | Heimdall | `heimdall flash --USERDATA userdata.img --no-reboot` | "Factory reset via Odin mode"               |

#### Qualcomm EDL Triggers

| Trigger                   | Tool     | Command                   | User Sees                                                     |
| ------------------------- | -------- | ------------------------- | ------------------------------------------------------------- |
| **Enter EDL Mode**        | ADB      | `adb reboot edl`          | "Device entering Emergency Download Mode"                     |
| **Verify EDL Connection** | EDL tool | `edl printgpt`            | "EDL mode verified. Partition table:"                         |
| **EDL Flash**             | EDL tool | `edl w system system.img` | "Flashing system partition via EDL..."                        |
| **EDL Full Erase**        | EDL tool | `edl e`                   | ⚠️ "DESTRUCTIVE: Erase all partitions? Type ERASE to confirm" |

#### MediaTek SP Flash Triggers

| Trigger                     | Tool      | Command                                  | User Sees                                   |
| --------------------------- | --------- | ---------------------------------------- | ------------------------------------------- |
| **Verify MTK Connection**   | mtkclient | `python3 mtk_cli.py printgpt`            | "MediaTek device detected. Chip: MT6765"    |
| **Flash via SP Flash Tool** | mtkclient | `python3 mtk_cli.py w system system.img` | "Flashing system partition..."              |
| **Unlock Bootloader (MTK)** | mtkclient | `python3 mtk_cli.py da seccfg unlock`    | ⚠️ "Unlock bootloader? This voids warranty" |
| **Read Boot Partition**     | mtkclient | `python3 mtk_cli.py r boot boot.img`     | "Reading boot partition..."                 |

---

## 🎨 Frontend UI Patterns for Triggers

### Confirmation Dialog Patterns

#### Standard Confirmation

```typescript
// For non-destructive operations
<AlertDialog>
  <AlertDialogTitle>Run Diagnostics?</AlertDialogTitle>
  <AlertDialogDescription>
    This will run a full device health check on {deviceName}.
  </AlertDialogDescription>
  <AlertDialogAction onClick={handleRun}>Run Diagnostics</AlertDialogAction>
  <AlertDialogCancel>Cancel</AlertDialogCancel>
</AlertDialog>
```

#### Typed Confirmation (Destructive)

```typescript
// For destructive operations requiring user to type confirmation
<AlertDialog>
  <AlertDialogTitle>⚠️ Unlock Bootloader?</AlertDialogTitle>
  <AlertDialogDescription>
    This will ERASE ALL DATA on {deviceName}.
    Type "UNLOCK" to confirm.
  </AlertDialogDescription>
  <Input
    value={confirmText}
    onChange={(e) => setConfirmText(e.target.value)}
    placeholder="Type UNLOCK to confirm"
  />
  <AlertDialogAction
    disabled={confirmText !== "UNLOCK"}
    onClick={handleUnlock}
  >
    Unlock Bootloader
  </AlertDialogAction>
  <AlertDialogCancel>Cancel</AlertDialogCancel>
</AlertDialog>
```

#### Progress with Real-Time Updates

```typescript
// For long-running operations with WebSocket progress
<Dialog>
  <DialogTitle>Flashing System Partition</DialogTitle>
  <DialogContent>
    <Progress value={progress} />
    <p>{currentStep} - {progress}%</p>
    <ScrollArea className="h-48 font-mono text-xs">
      {outputLines.map((line, i) => <div key={i}>{line}</div>)}
    </ScrollArea>
  </DialogContent>
</Dialog>
```

---

## 🚀 Implementation Status

### ✅ Fully Implemented

- [x] ADB USB debugging authorization trigger
- [x] ADB file transfer trigger
- [x] ADB backup authorization trigger
- [x] iOS trust computer trigger
- [x] iOS pairing request
- [x] iOS backup encryption trigger
- [x] iOS DFU mode entry
- [x] Fastboot unlock verification
- [x] Samsung Download Mode verification
- [x] Qualcomm EDL authorization check
- [x] MediaTek SP Flash authorization check
- [x] Device hotplug event detection
- [x] Auto-snapshot after diagnostics
- [x] Manual snapshot triggers
- [x] Workspace backup scheduling

### 🚧 In Progress

- [ ] Typed confirmation dialogs for destructive operations
- [ ] RBAC policy gates (role-based authorization)
- [ ] Supervisor approval workflow
- [ ] Evidence bundle export with GPG signing
- [ ] Real-time WebSocket progress for flash operations

### 📋 Planned

- [ ] Advanced plugin permission requests
- [ ] Multi-device batch operation confirmation
- [ ] Compliance reporting dashboard
- [ ] Audit log search and filtering
- [ ] Evidence chain-of-custody viewer
- [ ] Device certification workflow

---

## 🔒 Security Best Practices

### Input Validation

```typescript
// Always validate device serial/UDID
function validateSerial(serial: string): boolean {
  // ADB serial: alphanumeric, max 32 chars
  return /^[A-Za-z0-9]{1,32}$/.test(serial);
}

function validateUDID(udid: string): boolean {
  // iOS UDID: 40-char hex string
  return /^[a-f0-9]{40}$/i.test(udid);
}
```

### Command Injection Prevention

```typescript
// Backend: Never use string interpolation for shell commands
// ❌ BAD:
exec(`adb -s ${serial} shell echo "test"`);

// ✅ GOOD:
execFile("adb", ["-s", serial, "shell", "echo", "test"]);
```

### Rate Limiting

```typescript
// Prevent authorization trigger spam
const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60000, // 1 minute
};

// Backend: Implement rate limiting per device
app.use("/api/adb/trigger-auth", rateLimit(RATE_LIMIT));
```

---

## 📝 API Response Standards

### Success Response

```json
{
  "success": true,
  "message": "USB debugging authorization triggered on device",
  "triggered": true,
  "requiresUserAction": true,
  "authorizationType": "adb_usb_debugging",
  "commandExecuted": "adb -s ABC123 shell getprop",
  "commandOutput": "unauthorized",
  "exitCode": 0,
  "timestamp": "2025-01-15T10:30:00Z",
  "evidenceId": "evt_abc123xyz"
}
```

### Error Response

```json
{
  "success": false,
  "message": "ADB tool not installed on this system",
  "triggered": false,
  "requiresUserAction": false,
  "authorizationType": "adb_usb_debugging",
  "error": "Command not found: adb",
  "toolMissing": true,
  "installGuide": "https://developer.android.com/studio/command-line/adb",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## 🎯 Next Steps

1. **Implement typed confirmation dialogs** for all destructive operations
2. **Add RBAC policy gates** with supervisor approval workflow
3. **Enhance audit logging** with searchable evidence viewer
4. **Create compliance dashboard** showing all authorization events
5. **Add bulk operation triggers** for multi-device scenarios
6. **Implement push notifications** for authorization events (optional)

---

**Last Updated:** 2025-01-15  
**Version:** 2.0  
**Maintained By:** Bobby's World Workshop Team
