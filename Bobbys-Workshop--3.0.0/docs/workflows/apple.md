# Pandora Codex: Lawful Apple Device Workflows

## Overview

This document defines **authorized, lawful, and ownership-respecting** workflows for Apple device operations within Pandora Codex.

**Core Principle**: All operations require proper device ownership, user authorization, and compliance with Apple's policies and regional laws.

---

## Legal & Ownership Framework

### Prerequisites for All Apple Operations

1. **Device Ownership**

   - User must be the legal owner of the device
   - OR have written authorization from the owner
   - OR device is owned by the organization performing the operation

2. **User Authorization**

   - User must explicitly consent to each operation
   - Destructive operations require typed confirmations
   - No operations performed without active user involvement

3. **Apple ID Authentication**

   - User must be able to authenticate with their Apple ID when required
   - No Apple ID bypass or removal attempts
   - No activation lock circumvention

4. **Supervision & MDM**
   - Supervised devices require proper supervision certificate
   - MDM-enrolled devices require MDM administrator authorization
   - No unauthorized MDM profile removal

---

## Supported Apple Device Workflows

### 1. Device Information Retrieval (Read-Only)

**Purpose**: Gather device information for diagnostics, inventory, or compliance auditing.

**Prerequisites:**

- Device connected via USB
- Device unlocked and "Trust This Computer" accepted
- libimobiledevice installed (`idevice_id`, `ideviceinfo`)

**Workflow:**

```
Step 1: Connect Device
  └─► User connects iOS device via Lightning/USB-C cable
  └─► Device prompts: "Trust This Computer?"
  └─► User taps "Trust" and enters passcode

Step 2: Detect Device
  └─► Backend runs: `idevice_id -l`
  └─► Returns UDID list of connected devices
  └─► Example: 00008110-001234567890123E

Step 3: Retrieve Device Info
  └─► Backend runs: `ideviceinfo -u <UDID>`
  └─► Returns XML plist with device properties
  └─► Parse properties: model, name, iOS version, serial number, etc.

Step 4: Display Information
  └─► Frontend displays device info in read-only panel
  └─► User can export info as JSON/CSV for inventory
```

**API Endpoint:**

- `GET /api/ios/devices` - List connected iOS devices
- `GET /api/ios/device-info/:udid` - Get detailed device information

**Capabilities:**

- ✅ Device model identification
- ✅ iOS version detection
- ✅ Serial number retrieval
- ✅ Battery health status
- ✅ Storage capacity and usage
- ✅ Device name
- ✅ UDID for inventory tracking

**Limitations:**

- ❌ Cannot bypass device lock screen
- ❌ Cannot access locked device data
- ❌ Cannot modify device without user consent

**Lawful Use Cases:**

- IT inventory management
- Compliance auditing (ensure devices meet OS version requirements)
- Pre-purchase device verification
- Repair shop diagnostics

---

### 2. iOS Backup (User-Authorized)

**Purpose**: Create backups of user data for migration, archival, or disaster recovery.

**Prerequisites:**

- Device ownership verified
- Device unlocked and trusted
- User explicitly initiates backup
- Sufficient storage space on host system
- libimobiledevice installed (`idevicebackup2`)

**Workflow:**

```
Step 1: User Initiates Backup
  └─► User clicks "Create Backup" in Pandora UI
  └─► UI displays: "This will create a full backup of <Device Name>"
  └─► User confirms action

Step 2: Prepare Backup Location
  └─► Backend creates timestamped backup directory
  └─► Example: /backups/ios/<UDID>/backup_2024-12-15_14-30-00/

Step 3: Execute Backup
  └─► Backend runs: `idevicebackup2 backup --udid <UDID> <backup_dir>`
  └─► Progress streamed via WebSocket
  └─► Progress updates: "Backing up Photos (45%)..."

Step 4: Backup Completion
  └─► Backend verifies backup integrity
  └─► Generates backup manifest (file list, sizes, checksums)
  └─► Creates evidence bundle with backup metadata

Step 5: User Notification
  └─► Success toast: "Backup completed successfully"
  └─► Backup listed in "Backup History" panel
  └─► User can export, restore, or delete backup
```

**API Endpoints:**

- `POST /api/ios/backup/start` - Initiate backup
- `GET /api/ios/backup/progress/:job_id` - Query backup progress
- `GET /api/ios/backups` - List all backups
- `POST /api/ios/backup/restore` - Restore from backup
- `DELETE /api/ios/backup/:id` - Delete backup (requires confirmation)

**Capabilities:**

- ✅ Full device backup (apps, photos, messages, settings)
- ✅ Incremental backups (only changed data)
- ✅ Encrypted backups (optional, user-set password)
- ✅ Backup verification and integrity checks

**Limitations:**

- ❌ Cannot backup without device unlock
- ❌ Cannot decrypt backups without user password
- ❌ Cannot extract DRM-protected content (movies, purchased music)
- ❌ Cannot backup apps not permitted by iOS sandbox

**Lawful Use Cases:**

- Pre-repair backup for data safety
- Device migration (old iPhone to new iPhone)
- Data archival for personal records
- Disaster recovery planning

---

### 3. iOS Restore (User-Authorized)

**Purpose**: Restore device from previously created backup.

**Prerequisites:**

- Valid backup created by authorized user
- Device ownership verified
- Device in setup/restore mode OR user-initiated erase
- User explicitly authorizes restore

**Workflow:**

```
Step 1: User Selects Restore
  └─► User navigates to "Backup History"
  └─► Selects backup: "Backup from 2024-12-10"
  └─► Clicks "Restore to Device"

Step 2: Restore Confirmation
  └─► UI warns: "This will erase all current data on <Device Name>"
  └─► User types "RESTORE" to confirm
  └─► User re-confirms Apple ID if required

Step 3: Prepare Device
  └─► Device must be in setup state or freshly erased
  └─► If device has data, user must factory reset first
  └─► Backend verifies device state

Step 4: Execute Restore
  └─► Backend runs: `idevicebackup2 restore --udid <UDID> <backup_dir>`
  └─► Progress streamed: "Restoring Photos (32%)..."
  └─► Device reboots automatically during restore

Step 5: Post-Restore Setup
  └─► Device completes iOS setup wizard
  └─► User signs into Apple ID
  └─► Apps re-download from App Store
  └─► User data restored
```

**API Endpoints:**

- `POST /api/ios/restore/start` - Initiate restore
- `GET /api/ios/restore/progress/:job_id` - Query restore progress

**Capabilities:**

- ✅ Full device restore from backup
- ✅ Selective restore (contacts, photos only, etc.)
- ✅ Restore with encryption password

**Limitations:**

- ❌ Cannot restore to device with different Apple ID
- ❌ Cannot bypass activation lock during restore
- ❌ Cannot restore backups from stolen devices
- ❌ Cannot restore DRM content without original Apple ID

**Lawful Use Cases:**

- Post-repair data restoration
- Device replacement (restore old device data to new device)
- Recovery from accidental data loss

---

### 4. DFU Mode Detection (Device Firmware Update)

**Purpose**: Detect when device enters DFU mode for firmware restore/update operations.

**Prerequisites:**

- Device physically connected via USB
- User manually triggers DFU mode (button sequence)
- Device in critical failure state OR user-initiated

**Workflow:**

```
Step 1: User Enters DFU Mode
  └─► User follows DFU mode instructions for their device model
  └─► Example (iPhone 8+): Hold Volume Down + Side button for 10 seconds
  └─► Device screen goes black (DFU mode entered)

Step 2: Backend Detection
  └─► Backend monitors USB for DFU mode signature
  └─► Vendor ID: 0x05ac (Apple Inc.)
  └─► Product ID varies by device (e.g., 0x1227 for iPhone)
  └─► UI displays: "Device in DFU mode detected"

Step 3: User Options
  └─► "Restore Firmware" (via iTunes or ipsw file)
  └─► "Exit DFU Mode" (user manually restarts device)
  └─► "Diagnostics" (attempt to diagnose issue)

Step 4: Firmware Restore (if selected)
  └─► Requires IPSW file (iOS firmware image)
  └─► IPSW must be signed by Apple (no custom firmware)
  └─► Operation hands off to Apple's restore process
```

**API Endpoints:**

- `GET /api/ios/dfu-devices` - List devices in DFU mode

**Capabilities:**

- ✅ DFU mode detection via USB
- ✅ Guide user through DFU mode entry
- ✅ Provide firmware restore instructions

**Limitations:**

- ❌ Cannot install unsigned firmware (jailbreak)
- ❌ Cannot downgrade to unsigned iOS versions
- ❌ Cannot bypass activation lock in DFU mode
- ❌ No direct firmware flashing (requires Apple's restore tools)

**Lawful Use Cases:**

- Unbricking devices stuck in boot loop
- Firmware corruption recovery
- Major iOS version downgrade (if signed by Apple)

---

### 5. Diagnostics & Health Reporting

**Purpose**: Run non-destructive diagnostics to assess device health.

**Prerequisites:**

- Device connected and trusted
- libimobiledevice installed (`idevicediagnostics`)

**Workflow:**

```
Step 1: User Requests Diagnostics
  └─► User clicks "Run Diagnostics" on iOS device panel
  └─► UI displays: "This will run non-destructive health checks"

Step 2: Execute Diagnostics
  └─► Backend runs: `idevicediagnostics diagnostics --udid <UDID>`
  └─► Collects: Battery cycles, health, temperature
  └─► Collects: Storage health, wear level
  └─► Collects: WiFi/Bluetooth radio functionality

Step 3: Generate Report
  └─► Backend compiles diagnostic results
  └─► Compares against Apple's health thresholds
  └─► Flags issues: "Battery health < 80%", "Storage errors detected"

Step 4: Display Results
  └─► UI shows health report with color-coded indicators
  └─► Green: Healthy | Yellow: Degraded | Red: Critical
  └─► User can export report as PDF for warranty claims
```

**API Endpoints:**

- `POST /api/ios/diagnostics/run` - Execute diagnostics
- `GET /api/ios/diagnostics/results/:job_id` - Get results

**Capabilities:**

- ✅ Battery health assessment
- ✅ Storage health check
- ✅ Component functionality tests
- ✅ iOS version and security patch verification

**Limitations:**

- ❌ Cannot run diagnostics on locked devices
- ❌ Cannot access encrypted user data
- ❌ Cannot modify system files

**Lawful Use Cases:**

- Pre-purchase device inspection
- Warranty claim evidence collection
- Repair shop diagnostics
- Fleet health monitoring

---

## Explicit Non-Goals (Lawful Exclusions)

Pandora Codex **does not** and **will not** support:

### 1. Apple ID Bypass

- ❌ No removal of Apple ID without credentials
- ❌ No activation lock bypass
- ❌ No iCloud account removal
- **Reason**: Violates ownership, enables device theft

### 2. MDM Profile Removal (Unauthorized)

- ❌ No MDM profile removal without administrator authorization
- ❌ No supervision profile tampering
- ❌ No bypass of organizational device policies
- **Reason**: Violates enterprise security policies, may violate contracts

### 3. Jailbreaking or Custom Firmware

- ❌ No jailbreak installation
- ❌ No unsigned iOS firmware installation
- ❌ No bootrom exploits or security bypasses
- **Reason**: Voids warranty, violates Apple EULA, may be illegal in some jurisdictions

### 4. Supervision Without Authorization

- ❌ No unauthorized device supervision
- ❌ No supervision certificate forgery
- ❌ No DEP/ADE enrollment without Apple Business Manager access
- **Reason**: Requires proper organizational authorization

### 5. Data Extraction Without Consent

- ❌ No forensic data extraction from locked devices
- ❌ No bypass of FileVault/encryption
- ❌ No unauthorized app data access
- **Reason**: Violates privacy laws (GDPR, CCPA, etc.)

---

## Tool Integration

### libimobiledevice

Open-source library for iOS device communication (legally reverse-engineered).

**Capabilities:**

- Device detection and pairing
- Read device information
- Backup and restore operations
- App installation (with user consent)
- Diagnostics

**Limitations:**

- Cannot bypass Apple ID or activation lock
- Cannot install unsigned apps without developer certificate
- Cannot access encrypted data without passcode

**Installation:**

```bash
# Ubuntu/Debian
sudo apt-get install libimobiledevice-utils

# macOS
brew install libimobiledevice

# Verify installation
idevice_id --version
```

**Pandora Integration:**

- `GET /api/system-tools/ios` - Check libimobiledevice status
- All iOS operations require libimobiledevice availability

---

## Compliance & Audit Trail

### Audit Logging

Every iOS operation produces structured audit log:

```json
{
  "timestamp": "2024-12-15T14:30:00.000Z",
  "operation": "ios_backup",
  "device_udid": "00008110-001234567890123E",
  "device_model": "iPhone13,2",
  "user": "repair-tech@shop.com",
  "command": ["idevicebackup2", "backup", "/backups/..."],
  "exit_code": 0,
  "duration_ms": 45000,
  "user_confirmation": true,
  "typed_confirmation": null,
  "result": "success",
  "backup_size_mb": 4096,
  "evidence_bundle_id": "evidence_1703001234"
}
```

### Chain of Custody

For repair shops and enterprises, evidence bundles include:

- Device UDID and serial number
- Timestamp of operation
- User who initiated operation
- Command executed with full output
- Cryptographic signature of evidence bundle
- Chain-of-custody notes

**Export:**

- `GET /api/evidence/export/:id` - Export signed evidence bundle as ZIP

---

## Recommended Workflows by Use Case

### Repair Shop Workflow

1. **Customer Check-In**

   - Connect device → Retrieve device info
   - Run diagnostics → Generate health report
   - Create backup → Evidence bundle

2. **Repair Operation**

   - Perform hardware repair
   - Verify device still boots

3. **Customer Check-Out**
   - Restore backup → Verify data integrity
   - Run diagnostics again → Compare before/after
   - Export evidence bundle → Customer receives copy

### IT Department Workflow (Enterprise)

1. **Device Enrollment**

   - Connect device → Retrieve UDID
   - Verify device meets compliance (iOS version, security patch)
   - Add to inventory system via API export

2. **Device Refresh**

   - Create backup (authorized by employee)
   - Issue new device
   - Restore backup to new device

3. **Device Decommissioning**
   - User authorizes data wipe
   - Factory reset performed
   - Device removed from inventory

### Personal Use Workflow

1. **Device Migration**

   - Backup old iPhone
   - Setup new iPhone
   - Restore backup to new device

2. **Pre-Sale Preparation**
   - Create final backup
   - Factory reset device
   - Verify activation lock removed (user signs out of Apple ID)

---

## Future Capabilities (Planned)

### Apple Business Manager (ABM) Integration

**Prerequisite**: Organization must have ABM account with API access.

**Planned Features:**

- Device enrollment via DEP/ADE
- Automated supervision during setup
- App distribution via Volume Purchase Program (VPP)
- Zero-touch deployment workflows

**Status**: Architecture documented, implementation pending ABM API access.

---

### Apple Configurator 2 Compatibility

**Planned Features:**

- Import/export Apple Configurator profiles
- Supervised device blueprints
- Batch provisioning workflows

**Status**: Planned for Q2 2025.

---

## Maintenance

This document is updated:

- **On Apple policy changes**: Review workflows for continued compliance
- **On new iOS version releases**: Verify libimobiledevice compatibility
- **Annually**: Full legal and compliance review

**Last Updated**: December 15, 2024  
**Version**: 1.0  
**Maintainer**: Pandora Codex Legal & Compliance Team
