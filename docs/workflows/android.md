# Pandora Codex: Lawful Android Device Workflows

## Overview

This document defines **authorized, lawful, and ownership-respecting** workflows for Android device operations within Pandora Codex.

**Core Principle**: All operations require proper device ownership, user authorization, OEM-supported methods, and compliance with regional laws.

---

## Legal & Ownership Framework

### Prerequisites for All Android Operations

1. **Device Ownership**

   - User must be the legal owner of the device
   - OR have written authorization from the owner
   - OR device is owned by the organization performing the operation

2. **User Authorization**

   - User must explicitly consent to each operation
   - Destructive operations require typed confirmations (CONFIRM, UNLOCK, RESET)
   - No operations performed without active user involvement

3. **OEM Authorization**

   - Bootloader unlock requires OEM unlock toggle enabled by user
   - Firmware flashing limited to OEM-provided or signed images
   - No bypass of bootloader security

4. **FRP (Factory Reset Protection)**
   - No bypass of Google account verification
   - Device owner must remove account before factory reset
   - FRP bypass tools are explicitly out of scope

**Note**: All typed confirmations referenced in this document (CONFIRM, UNLOCK, RESET, DELETE, YES) match the exact implementation strings in `/server/authorization-triggers.js` and frontend components. Any changes to confirmation strings must be updated in both locations.

---

## Supported Android Device Workflows

### 1. Device Detection & Information Retrieval

**Purpose**: Detect and identify connected Android devices for diagnostics, inventory, or operations.

**Prerequisites:**

- Device connected via USB
- USB debugging enabled on device (ADB mode)
- OR device in fastboot/bootloader mode
- ADB and Fastboot tools installed on host

**Workflow:**

```
Step 1: Enable USB Debugging (User Action on Device)
  └─► Settings → Developer Options → USB Debugging → Enable
  └─► Developer Options (if hidden): Settings → About Phone → Tap Build Number 7 times

Step 2: Connect Device
  └─► User connects device via USB-A/USB-C cable
  └─► Device prompts: "Allow USB debugging?"
  └─► User taps "Allow" (optionally "Always allow from this computer")

Step 3: Backend Detection (ADB)
  └─► Backend runs: `adb devices`
  └─► Returns device list with serial numbers and states
  └─► Example: ABC123XYZ    device

Step 4: Retrieve Device Properties
  └─► Backend runs: `adb -s ABC123XYZ shell getprop`
  └─► Extracts properties:
      - ro.build.version.release (Android version)
      - ro.build.version.sdk (SDK level)
      - ro.product.manufacturer (Brand)
      - ro.product.model (Model)
      - ro.build.version.security_patch (Security patch date)
      - ro.bootloader (Bootloader version)
      - gsm.version.baseband (Baseband/modem version)

Step 5: Display Information
  └─► Frontend displays device info in Device Sidebar
  └─► Confidence score: 0.95 (Confirmed via ADB)
  └─► Evidence: Full getprop output stored in audit log
```

**API Endpoints:**

- `GET /api/adb/devices` - List ADB-connected devices
- `GET /api/fastboot/devices` - List Fastboot-connected devices
- `GET /api/android-devices/all` - Unified ADB + Fastboot devices

**Capabilities:**

- ✅ Device model and manufacturer identification
- ✅ Android version and security patch detection
- ✅ Bootloader version retrieval
- ✅ Device serial number
- ✅ Battery health and charge level
- ✅ Storage capacity and usage

**Limitations:**

- ❌ Cannot detect device without USB debugging enabled (ADB mode)
- ❌ Cannot retrieve properties from locked devices
- ❌ Cannot detect devices with revoked USB debugging authorization

**Lawful Use Cases:**

- IT asset inventory management
- Compliance auditing (OS version requirements)
- Pre-repair device inspection
- Warranty claim verification

---

### 2. Firmware Version Checking & Security Patch Verification

**Purpose**: Automatically verify installed firmware version and security patch level against latest available updates.

**Prerequisites:**

- Device connected via ADB
- Firmware database populated with OEM release data
- Internet connection (for firmware database updates)

**Workflow:**

```
Step 1: Extract Current Firmware Info
  └─► Backend runs: `adb shell getprop ro.build.version.release`
  └─► Backend runs: `adb shell getprop ro.build.version.security_patch`
  └─► Example: Android 14, Security patch 2024-11-05

Step 2: Query Firmware Database
  └─► Backend queries database by manufacturer + model
  └─► Example: Google Pixel 5 → Latest: Android 14, Patch 2024-12-05

Step 3: Compare Versions
  └─► Backend compares current vs latest
  └─► Security patch age calculated (days since latest patch)
  └─► Security status determined:
      - Current: < 3 months old
      - Outdated: 3-6 months old
      - Critical: > 6 months old

Step 4: Display Results
  └─► UI shows:
      - Current Version: Android 14 (2024-11-05)
      - Latest Version: Android 14 (2024-12-05)
      - Status: Outdated (1 month behind)
      - Download Link: [Official OEM Update]

Step 5: User Actions
  └─► User can download latest firmware from OEM source
  └─► User can initiate OTA update (if device supports)
  └─► User can export firmware report for compliance
```

**API Endpoints:**

- `GET /api/firmware/check/:serial` - Check firmware for specific device
- `GET /api/firmware/library` - Browse firmware database
- `GET /api/firmware/library/:brand/:model` - Get firmware list for device

**Capabilities:**

- ✅ Automatic firmware version extraction
- ✅ Security patch age calculation
- ✅ Comparison against OEM release database
- ✅ Download links to official firmware sources
- ✅ Security status classification (current/outdated/critical)

**Limitations:**

- ❌ Cannot force OTA updates (requires user initiation on device)
- ❌ Cannot install firmware without bootloader unlock (for most devices)
- ❌ Database limited to major OEMs (Google, Samsung, Xiaomi, OnePlus)

**Lawful Use Cases:**

- Enterprise compliance: Ensure devices meet security patch requirements
- Repair shop: Verify device firmware status before/after repair
- Personal: Monitor device security and update availability

---

### 3. OEM-Authorized Bootloader Unlock

**Purpose**: Unlock device bootloader to enable custom firmware installation (user-authorized, warranty-voiding operation).

**Prerequisites:**

- Device ownership verified
- OEM unlock toggle enabled in Developer Options (user action)
- Device in fastboot/bootloader mode
- User explicitly authorizes unlock with typed confirmation "UNLOCK"
- User acknowledges warranty void and data wipe

**Workflow:**

```
Step 1: User Enables OEM Unlock (On Device)
  └─► Settings → Developer Options → OEM unlocking → Enable
  └─► Device may require internet connection to verify eligibility
  └─► Some OEMs restrict unlock (carrier-locked devices, enterprise MDM)

Step 2: Reboot to Bootloader
  └─► User selects "Reboot to Bootloader" in Pandora UI
  └─► OR manually: Power off → Hold Volume Down + Power
  └─► Device enters fastboot mode

Step 3: Backend Detects Fastboot Device
  └─► Backend runs: `fastboot devices`
  └─► Returns serial: DEF456UVW    fastboot

Step 4: User Initiates Unlock
  └─► User clicks "Unlock Bootloader" button
  └─► UI displays warning modal:
      ⚠️ WARNING: This operation will:
         - Erase all data on the device
         - Void manufacturer warranty
         - Potentially brick device if interrupted
         - Make device vulnerable to unsigned firmware

      Type "UNLOCK" to confirm

  └─► User types "UNLOCK" exactly
  └─► User clicks "Confirm Unlock"

Step 5: Backend Executes Unlock
  └─► Backend runs: `fastboot oem unlock` (or `fastboot flashing unlock`)
  └─► Device displays unlock confirmation screen
  └─► User must confirm unlock on device screen (Volume Up to accept)

Step 6: Device Wipes and Reboots
  └─► Device performs factory reset automatically
  └─► Bootloader unlocked
  └─► Device reboots to setup wizard

Step 7: Audit Logging
  └─► Backend creates audit log entry:
      - Operation: bootloader_unlock
      - Device serial: DEF456UVW
      - User typed confirmation: "UNLOCK"
      - Result: Success (or error message if failed)
      - Timestamp: 2024-12-15T14:30:00Z
```

**API Endpoints:**

- `POST /api/fastboot/unlock` - Attempt bootloader unlock
- `GET /api/fastboot/device-info?serial=XXX` - Check bootloader status

**Capabilities:**

- ✅ OEM-authorized bootloader unlock
- ✅ Typed confirmation to prevent accidental unlock
- ✅ Full audit trail of unlock attempts
- ✅ Pre-unlock warnings about consequences

**Limitations:**

- ❌ Cannot unlock without OEM unlock toggle enabled
- ❌ Cannot unlock carrier-locked devices
- ❌ Cannot unlock enterprise MDM-controlled devices
- ❌ Cannot reverse warranty void after unlock

**Lawful Use Cases:**

- Custom ROM installation (user-authorized)
- Development and testing of Android builds
- Rooting device for advanced functionality (user's choice)
- Repair shop: Firmware recovery on bricked devices

**Explicit Non-Goal:**

- ❌ No bypass of OEM unlock requirement
- ❌ No unlock of stolen devices
- ❌ No unlock without user consent

---

### 4. Firmware Flashing (Fastboot-Based)

**Purpose**: Flash OEM firmware images to device partitions for repair, upgrade, or downgrade operations.

**Prerequisites:**

- Bootloader unlocked (see Workflow 3)
- Device in fastboot mode
- Valid firmware image file (boot.img, system.img, vendor.img, etc.)
- Image validation passed (checksum verified)
- User explicitly authorizes flash with typed confirmation

**Workflow:**

```
Step 1: User Prepares Firmware Image
  └─► User downloads official firmware from OEM source
  └─► Example: Google Factory Image for Pixel 5
  └─► User extracts partition images (boot.img, system.img, vendor.img)

Step 2: Upload Image to Pandora
  └─► User selects "Flash Partition" in Multi-Brand Flash panel
  └─► Selects partition: "boot" (or system, recovery, vendor, etc.)
  └─► Uploads image file: boot.img (32 MB)

Step 3: Image Validation
  └─► Backend validates:
      - File format (sparse image, ext4, etc.)
      - File size matches expected partition size
      - Checksum verification (if available)
  └─► If invalid: Error displayed, upload rejected

Step 4: User Confirms Flash
  └─► UI displays:
      ⚠️ Flashing boot partition to device DEF456UVW

      This will overwrite the boot partition with:
      - File: boot.img
      - Size: 33,554,432 bytes (32 MB)
      - Checksum: a1b2c3d4e5f6...

      Type "CONFIRM" to proceed

  └─► User types "CONFIRM"
  └─► User clicks "Start Flash"

Step 5: Backend Executes Flash
  └─► Backend runs: `fastboot flash boot /tmp/uploads/boot.img`
  └─► Progress streamed via WebSocket:
      - Sending 'boot' (32768 KB)... OK [2.145s]
      - Writing 'boot'... OK [0.321s]
  └─► Finished. Total time: 2.466s

Step 6: Verify Flash Success
  └─► Backend checks exit code and stdout
  └─► If successful: "Flash completed successfully"
  └─► If failed: Display stderr output for debugging

Step 7: Audit Logging
  └─► Backend logs:
      - Partition flashed: boot
      - Image file: boot.img (checksum)
      - Duration: 2466 ms
      - Result: Success
```

**API Endpoints:**

- `POST /api/fastboot/flash` - Flash partition image
- `POST /api/flash/validate-image` - Validate image file before flash
- `POST /api/flash/start` - Start flash operation with progress tracking
- `ws://localhost:3001/ws/flash-progress` - Real-time progress updates

**Capabilities:**

- ✅ Flash boot, recovery, system, vendor, vbmeta partitions
- ✅ Real-time progress tracking via WebSocket
- ✅ Image validation before flash
- ✅ Critical partition protection (bootloader, radio blocked)
- ✅ Full audit trail with checksums

**Limitations:**

- ❌ Cannot flash without bootloader unlock
- ❌ Cannot flash signed partitions on locked bootloader
- ❌ Cannot flash critical partitions (bootloader, radio, aboot)
- ❌ Cannot flash images for wrong device model

**Lawful Use Cases:**

- OEM firmware restore after soft brick
- Android version upgrade/downgrade (if bootloader unlocked)
- Custom ROM installation (user-authorized)
- Repair shop: Firmware recovery

**Blocked Partitions (Safety):**

- bootloader, aboot, sbl, tz, rpm, modem, radio, persist, dsp, vendor_boot (if critical)

**Allowed Partitions:**

- boot, recovery, system, system_a, system_b, vendor, vendor_a, vendor_b, userdata, cache

---

### 5. Factory Reset (Policy-Safe)

**Purpose**: Erase user data while preserving system partitions (non-destructive to firmware).

**Prerequisites:**

- Device ownership verified
- User explicitly authorizes reset
- Typed confirmation "RESET" required
- Device in fastboot mode OR ADB mode

**Workflow:**

```
Step 1: User Initiates Factory Reset
  └─► User selects "Factory Reset" in Diagnostics panel
  └─► UI displays warning modal:
      ⚠️ WARNING: This will erase all data on device DEF456UVW

      This includes:
      - All apps and app data
      - Photos, videos, and documents
      - User accounts and settings

      This does NOT erase:
      - System firmware (Android OS remains intact)
      - Bootloader or radio firmware

      Type "RESET" to confirm

  └─► User types "RESET"
  └─► User clicks "Confirm Reset"

Step 2: Backend Executes Reset (Fastboot Method)
  └─► Backend runs: `fastboot erase userdata`
  └─► Backend runs: `fastboot erase cache`
  └─► User data partitions erased, firmware intact

Step 3: Device Reboots
  └─► Backend runs: `fastboot reboot`
  └─► Device boots to Android setup wizard
  └─► User reconfigures device as new

Step 4: Audit Logging
  └─► Backend logs:
      - Operation: factory_reset
      - Method: fastboot_erase_userdata
      - User typed confirmation: "RESET"
      - Result: Success
```

**API Endpoints:**

- `POST /api/fastboot/erase` - Erase non-critical partition
- `POST /api/fastboot/reboot` - Reboot device

**Alternative Method (ADB):**

```bash
# If device in ADB mode
adb shell recovery --wipe_data
```

**Capabilities:**

- ✅ Erase user data and cache partitions
- ✅ Preserve system firmware
- ✅ Typed confirmation required
- ✅ Full audit trail

**Limitations:**

- ❌ Cannot erase system partitions (use flash operation instead)
- ❌ Cannot bypass FRP (Factory Reset Protection)
- ❌ Cannot reset without user consent

**Lawful Use Cases:**

- Pre-sale device preparation
- Repair shop: Reset device after repair
- Enterprise: Decommission employee device
- Personal: Clean device for resale

**Explicit Non-Goal:**

- ❌ No FRP bypass
- ❌ No Google account removal without credentials

---

### 6. Multi-Brand Flash Support

**Purpose**: Provide unified flashing interface for multiple Android OEMs with brand-specific protocols.

#### Supported Brands & Methods

| Brand            | Method        | Protocol                      | Tool            | Status         |
| ---------------- | ------------- | ----------------------------- | --------------- | -------------- |
| Google Pixel     | Fastboot      | Standard fastboot             | `fastboot`      | ✅ Implemented |
| Samsung Galaxy   | Heimdall      | Odin protocol                 | `heimdall`      | ⚠️ Planned     |
| Qualcomm Devices | EDL           | Sahara protocol               | `edl.py`        | ⚠️ Planned     |
| MediaTek Devices | SP Flash Tool | MediaTek protocol             | `sp-flash-tool` | ⚠️ Planned     |
| OnePlus          | Fastboot      | Standard fastboot             | `fastboot`      | ✅ Implemented |
| Xiaomi           | Fastboot      | Standard fastboot (with auth) | `fastboot`      | ✅ Implemented |
| Motorola         | Fastboot      | Standard fastboot             | `fastboot`      | ✅ Implemented |

#### Samsung Galaxy (Heimdall/Odin)

**Workflow:**

```
Step 1: Reboot to Download Mode
  └─► Power off device
  └─► Hold Volume Down + Power
  └─► Press Volume Up when prompted

Step 2: Connect Device
  └─► Backend detects Samsung device via USB (VID: 0x04e8)

Step 3: Flash Firmware
  └─► Backend runs: `heimdall flash --BOOT boot.img --SYSTEM system.img`
  └─► Progress tracked via heimdall output parsing

Step 4: Reboot
  └─► Backend runs: `heimdall reboot`
```

**Status**: Planned for Q1 2025 (Heimdall library integration documented)

---

#### Qualcomm EDL (Emergency Download Mode)

**Workflow:**

```
Step 1: Enter EDL Mode
  └─► User triggers EDL via test point or key combo
  └─► OR device auto-enters EDL on brick

Step 2: Detect Device
  └─► Backend detects Qualcomm device in EDL (VID: 0x05c6, PID: 0x9008)

Step 3: Flash Firmware
  └─► Backend runs: `edl.py qfil <firmware_dir>`
  └─► Qualcomm Sahara protocol used for low-level flash

Step 4: Reboot
  └─► Device reboots automatically after flash
```

**Status**: Planned for Q2 2025 (EDL tool integration pending)

---

### 7. Device Reboot Operations

**Purpose**: Reboot device to different modes (system, bootloader, recovery) for various operations.

**Workflow:**

```
Step 1: User Selects Reboot Target
  └─► User clicks "Reboot Device" dropdown
  └─► Options: System | Bootloader | Recovery

Step 2: User Confirms Reboot
  └─► Modal: "Reboot device DEF456UVW to <target>?"
  └─► User clicks "Confirm"

Step 3: Backend Executes Reboot
  └─► If in ADB mode:
      - System: `adb reboot`
      - Bootloader: `adb reboot bootloader`
      - Recovery: `adb reboot recovery`

  └─► If in Fastboot mode:
      - System: `fastboot reboot`
      - Bootloader: `fastboot reboot bootloader`
      - Recovery: `fastboot reboot recovery`

Step 4: Device Reboots
  └─► Device enters target mode
  └─► Backend re-detects device in new mode
  └─► UI updates device state
```

**API Endpoints:**

- `POST /api/fastboot/reboot` - Reboot device (fastboot)
- `POST /api/adb/reboot` - Reboot device (adb)

---

## Explicit Non-Goals (Lawful Exclusions)

Pandora Codex **does not** and **will not** support:

### 1. FRP (Factory Reset Protection) Bypass

- ❌ No Google account bypass
- ❌ No FRP unlock tools
- ❌ No unauthorized account removal
- **Reason**: Violates ownership, enables device theft

### 2. Bootloader Unlock Bypass

- ❌ No exploit-based bootloader unlock
- ❌ No unlock without OEM unlock toggle
- ❌ No carrier lock bypass
- **Reason**: Violates OEM security policies, enables theft

### 3. IMEI Alteration

- ❌ No IMEI rewriting or spoofing
- ❌ No baseband modification for IMEI change
- **Reason**: Illegal in most jurisdictions, enables fraud

### 4. MDM Profile Bypass

- ❌ No unauthorized MDM profile removal
- ❌ No enterprise device policy bypass
- **Reason**: Violates organizational policies, may breach contracts

### 5. Security Exploit Tools

- ❌ No root exploits for locked bootloaders
- ❌ No bootrom exploits
- ❌ No security bypass tools
- **Reason**: Violates security policies, may be illegal

---

## Tool Integration

### Android Debug Bridge (ADB)

Official Android tool for device communication.

**Installation:**

```bash
# Ubuntu/Debian
sudo apt-get install adb

# macOS
brew install android-platform-tools

# Verify
adb version
```

**Pandora Integration:**

- `GET /api/system-tools/android` - Check ADB status
- `GET /api/adb/devices` - List ADB devices
- `POST /api/adb/command` - Execute safe ADB commands

---

### Fastboot

Official Android tool for bootloader operations.

**Installation:**

```bash
# Ubuntu/Debian
sudo apt-get install fastboot

# macOS
brew install android-platform-tools

# Verify
fastboot --version
```

**Pandora Integration:**

- `GET /api/fastboot/devices` - List Fastboot devices
- `POST /api/fastboot/flash` - Flash partitions
- `POST /api/fastboot/unlock` - Unlock bootloader

---

## Compliance & Audit Trail

### Audit Logging

Every Android operation produces structured audit log:

```json
{
  "timestamp": "2024-12-15T14:30:00.000Z",
  "operation": "fastboot_flash",
  "device_serial": "DEF456UVW",
  "device_model": "Pixel 5",
  "user": "repair-tech@shop.com",
  "command": ["fastboot", "flash", "boot", "/tmp/boot.img"],
  "exit_code": 0,
  "duration_ms": 2466,
  "user_confirmation": true,
  "typed_confirmation": "CONFIRM",
  "result": "success",
  "image_checksum": "a1b2c3d4e5f6...",
  "evidence_bundle_id": "evidence_1703001234"
}
```

### Chain of Custody

Evidence bundles include:

- Device serial number
- Firmware version before/after operation
- Full command output (stdout/stderr)
- Timestamp of operation
- User who initiated operation
- Cryptographic signature

---

## Recommended Workflows by Use Case

### Repair Shop Workflow

1. **Device Intake**

   - Connect device → Detect via ADB/Fastboot
   - Check firmware version → Security patch status
   - Run diagnostics → Document device health

2. **Firmware Recovery (Bricked Device)**

   - Reboot to fastboot mode (if possible)
   - Flash OEM firmware images
   - Verify device boots successfully

3. **Post-Repair Verification**
   - Recheck firmware version
   - Run diagnostics again
   - Export evidence bundle for customer

### IT Department Workflow (Enterprise)

1. **Device Provisioning**

   - Connect device → Verify firmware compliance
   - Check security patch (must be < 3 months old)
   - Add device to inventory via API export

2. **Device Decommissioning**
   - User authorizes data wipe
   - Factory reset via fastboot
   - Verify FRP removed (user signed out)

### Developer Workflow

1. **Custom ROM Installation**
   - Enable OEM unlock → Unlock bootloader
   - Flash TWRP recovery (if desired)
   - Flash custom ROM via fastboot
   - Install GApps if needed

---

## Future Capabilities (Planned)

### Samsung Odin/Heimdall Integration

**Status**: Q1 2025 - Heimdall library integration

### Qualcomm EDL Support

**Status**: Q2 2025 - EDL tool integration for emergency flashing

### MediaTek SP Flash Tool Support

**Status**: Q2 2025 - MediaTek protocol support

---

## Maintenance

This document is updated:

- **On Android version releases**: Verify tool compatibility
- **On OEM policy changes**: Review workflows for continued compliance
- **Quarterly**: Legal and compliance review

**Last Updated**: December 15, 2024  
**Version**: 1.0  
**Maintainer**: Pandora Codex Legal & Compliance Team
