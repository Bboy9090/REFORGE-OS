# Authorization Trigger Catalog API

Complete mapping of frontend authorization prompts to backend API endpoints with audit logging.

## Overview

The Authorization Trigger Catalog is a comprehensive system that maps every user-facing authorization prompt to a real backend API endpoint. Every trigger produces structured audit logs for compliance and traceability.

## Design Principles

1. **Truth-Only Data**: Backend must return actual detection results - no simulated values
2. **Explicit Confirmation**: Typed responses required for destructive actions
3. **Audit Logging**: Every trigger produces a structured log entry
4. **RBAC Support**: Supervisor approval required for high-risk actions
5. **Empty States**: UI shows "No devices detected" if backend returns nothing - no ghost values

## Trigger Categories

### 🔐 Trust & Security

Device authorization and permission management.

#### Trust Device

- **Frontend Prompt:** "Do you want to trust this device?"
- **Backend Endpoint:** `POST /api/devices/trust`
- **Modal Text:** "Authorize this device for diagnostics and flashing?"
- **Risk Level:** Medium
- **Device Required:** Yes
- **Audit Log:**

```json
{
  "action": "trust_device",
  "triggerId": "trust_device",
  "deviceId": "XYZ123",
  "userResponse": "approved",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Grant USB Debugging

- **Frontend Prompt:** "Allow USB debugging?"
- **Backend Endpoint:** `POST /api/devices/authorize-debugging`
- **Modal Text:** "Enable USB debugging for this device?"
- **Risk Level:** Medium
- **Device Required:** Yes

#### Authorize File Transfer

- **Frontend Prompt:** "Allow file transfer access?"
- **Backend Endpoint:** `POST /api/devices/authorize-transfer`
- **Modal Text:** "Grant file transfer permissions for this device?"
- **Risk Level:** Low
- **Device Required:** Yes

---

### ⚙️ Flash Operations

Firmware flashing and bootloader operations.

#### Flash Firmware

- **Frontend Prompt:** "Do you want to flash this firmware?"
- **Backend Endpoint:** `POST /api/flash/start`
- **Modal Text:** "Confirm flashing firmware to device. This will overwrite partitions."
- **Typed Confirmation:** `CONFIRM` (required)
- **Risk Level:** Destructive
- **Device Required:** Yes
- **Audit Log:**

```json
{
  "action": "flash_start",
  "triggerId": "flash_firmware",
  "deviceId": "ABC123",
  "partitions": ["boot", "system", "vendor"],
  "firmwareHash": "sha256:abc123...",
  "userResponse": "approved",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

#### Unlock Bootloader

- **Frontend Prompt:** "Unlock bootloader?"
- **Backend Endpoint:** `POST /api/flash/unlock-bootloader`
- **Modal Text:** "This will erase all data and void warranty. Type UNLOCK to confirm."
- **Typed Confirmation:** `UNLOCK` (required)
- **Risk Level:** Destructive
- **Device Required:** Yes

#### Flash Recovery

- **Frontend Prompt:** "Flash recovery partition?"
- **Backend Endpoint:** `POST /api/flash/recovery`
- **Modal Text:** "Flash custom recovery to this device?"
- **Typed Confirmation:** `CONFIRM` (required)
- **Risk Level:** High
- **Device Required:** Yes

#### Batch Flash

- **Frontend Prompt:** "Start batch flash operation?"
- **Backend Endpoint:** `POST /api/flash/batch`
- **Modal Text:** "Flash firmware to multiple devices simultaneously?"
- **Typed Confirmation:** `CONFIRM` (required)
- **Risk Level:** Destructive
- **Device Required:** No (operates on multiple devices)

#### Factory Reset

- **Frontend Prompt:** "Factory reset device?"
- **Backend Endpoint:** `POST /api/devices/factory-reset`
- **Modal Text:** "This will erase all data. Type RESET to confirm."
- **Typed Confirmation:** `RESET` (required)
- **Risk Level:** Destructive
- **Device Required:** Yes

#### Reboot Operations

- **Reboot to System:** `POST /api/devices/reboot` (Low risk)
- **Reboot to Recovery:** `POST /api/devices/reboot-recovery` (Low risk)
- **Reboot to Bootloader:** `POST /api/devices/reboot-bootloader` (Low risk)
- **Enter DFU Mode (iOS):** `POST /api/devices/enter-dfu` (Medium risk)

---

### 📊 Diagnostics

Device health checks and performance testing.

#### Run Diagnostics

- **Frontend Prompt:** "Run full diagnostics on connected devices?"
- **Backend Endpoint:** `POST /api/diagnostics/run`
- **Modal Text:** "Run health checks (CPU, memory, storage, battery) on device?"
- **Risk Level:** Low
- **Device Required:** Yes
- **Audit Log:**

```json
{
  "action": "diagnostics_run",
  "triggerId": "run_diagnostics",
  "deviceId": "XYZ123",
  "diagnosticSuite": ["cpu", "memory", "storage", "battery"],
  "results": { ... },
  "timestamp": "2024-01-15T10:40:00Z"
}
```

#### Batch Diagnostics

- **Frontend Prompt:** "Run diagnostics on all devices?"
- **Backend Endpoint:** `POST /api/diagnostics/batch`
- **Modal Text:** "Run comprehensive diagnostics on all connected devices?"
- **Risk Level:** Low
- **Device Required:** No

#### Collect Logs

- **Frontend Prompt:** "Collect device logs?"
- **Backend Endpoint:** `POST /api/diagnostics/logs`
- **Modal Text:** "Capture ADB logcat, fastboot logs, and system logs from device?"
- **Risk Level:** Low
- **Device Required:** Yes

#### Benchmark Device

- **Frontend Prompt:** "Run performance benchmark?"
- **Backend Endpoint:** `POST /api/diagnostics/benchmark`
- **Modal Text:** "Run flash speed and performance profiling on device?"
- **Risk Level:** Low
- **Device Required:** Yes

---

### 🧪 Evidence & Reports

Signed evidence bundles and audit reports.

#### Export Evidence Bundle

- **Frontend Prompt:** "Export signed evidence bundle?"
- **Backend Endpoint:** `POST /api/evidence/export`
- **Modal Text:** "Generate cryptographically signed diagnostic report for device?"
- **Risk Level:** Low
- **Device Required:** Yes
- **Audit Log:**

```json
{
  "action": "evidence_export",
  "triggerId": "export_evidence",
  "deviceId": "XYZ123",
  "bundleId": "bundle_abc123",
  "signature": "sig_xyz789",
  "timestamp": "2024-01-15T10:45:00Z"
}
```

#### Import Evidence Bundle

- **Frontend Prompt:** "Import evidence bundle?"
- **Backend Endpoint:** `POST /api/evidence/import`
- **Modal Text:** "Import and verify external evidence bundle?"
- **Risk Level:** Medium
- **Device Required:** No

#### Sign Evidence

- **Frontend Prompt:** "Sign evidence bundle?"
- **Backend Endpoint:** `POST /api/evidence/sign`
- **Modal Text:** "Apply cryptographic signature to evidence bundle?"
- **Risk Level:** Medium
- **Device Required:** No

#### Create Snapshot

- **Frontend Prompt:** "Create diagnostic snapshot?"
- **Backend Endpoint:** `POST /api/snapshots/create`
- **Modal Text:** "Capture current device state for backup?"
- **Risk Level:** Low
- **Device Required:** Yes

---

### 🛡️ Policy & Compliance

Compliance gates and supervisor approvals.

#### Policy Gate Confirmation

- **Frontend Prompt:** "This is a destructive action. Do you want to continue?"
- **Backend Endpoint:** `POST /api/policy/confirm`
- **Modal Text:** "This action cannot be undone. Type YES to proceed."
- **Typed Confirmation:** `YES` (required)
- **Risk Level:** Destructive
- **Device Required:** No
- **Audit Log:**

```json
{
  "action": "policy_gate",
  "triggerId": "policy_gate_confirm",
  "riskLevel": "destructive",
  "userResponse": "approved",
  "timestamp": "2024-01-15T10:50:00Z"
}
```

#### Supervisor Approval

- **Frontend Prompt:** "High-risk action requires supervisor approval"
- **Backend Endpoint:** `POST /api/policy/supervisor-approval`
- **Modal Text:** "Submit request for supervisor approval of this action?"
- **Risk Level:** High
- **Device Required:** No

#### Audit Log Consent

- **Frontend Prompt:** "Consent to audit logging?"
- **Backend Endpoint:** `POST /api/policy/audit-consent`
- **Modal Text:** "Agree to record this operation in audit log?"
- **Risk Level:** Low
- **Device Required:** No

---

### 🔌 Hotplug Events

USB device connection and driver management.

#### Authorize Hotplug Device

- **Frontend Prompt:** "New device detected. Do you want to connect?"
- **Backend Endpoint:** `POST /api/hotplug/authorize`
- **Modal Text:** "Device connected via USB. Authorize for monitoring?"
- **Risk Level:** Medium
- **Device Required:** Yes
- **Audit Log:**

```json
{
  "action": "hotplug_authorize",
  "triggerId": "hotplug_authorize",
  "deviceId": "XYZ987",
  "vendorId": "0x18d1",
  "productId": "0x4ee7",
  "userResponse": "approved",
  "timestamp": "2024-01-15T10:55:00Z"
}
```

#### Install Device Driver

- **Frontend Prompt:** "Install missing driver?"
- **Backend Endpoint:** `POST /api/devices/install-driver`
- **Modal Text:** "Device requires driver installation. Download and install?"
- **Risk Level:** Medium
- **Device Required:** Yes

---

### 🛠️ Plugin Actions

Plugin installation, updates, and removal.

#### Install Plugin

- **Frontend Prompt:** "Install plugin?"
- **Backend Endpoint:** `POST /api/plugins/install`
- **Modal Text:** "Install certified plugin?"
- **Risk Level:** Medium
- **Device Required:** No
- **Audit Log:**

```json
{
  "action": "plugin_install",
  "triggerId": "plugin_install",
  "pluginId": "battery-health-pro",
  "pluginVersion": "3.2.1",
  "userResponse": "approved",
  "timestamp": "2024-01-15T11:00:00Z"
}
```

#### Update Plugin

- **Frontend Prompt:** "Update plugin?"
- **Backend Endpoint:** `PUT /api/plugins/update`
- **Modal Text:** "Update plugin to latest version?"
- **Risk Level:** Low
- **Device Required:** No

#### Uninstall Plugin

- **Frontend Prompt:** "Uninstall plugin?"
- **Backend Endpoint:** `DELETE /api/plugins/uninstall`
- **Modal Text:** "Remove plugin and all associated data?"
- **Risk Level:** Medium
- **Device Required:** No

---

## Backend Implementation

### Endpoint Structure

All trigger endpoints follow this pattern:

**Request:**

```json
{
  "triggerId": "trigger_id",
  "deviceId": "XYZ123",
  "timestamp": "2024-01-15T10:30:00Z",
  ...additionalData
}
```

**Response (Success):**

```json
{
  "success": true,
  "deviceId": "XYZ123",
  "data": { ... },
  "auditLogId": "audit_abc123"
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Device not found",
  "errorCode": "DEVICE_NOT_FOUND"
}
```

### Audit Logging Endpoint

`POST /api/audit/log`

All trigger executions automatically log to this endpoint:

```json
{
  "id": "audit_abc123",
  "action": "trigger_trust_device",
  "triggerId": "trust_device",
  "deviceId": "XYZ123",
  "userResponse": "approved | rejected | cancelled",
  "timestamp": "2024-01-15T10:30:00Z",
  "userId": "user_456",
  "metadata": {
    "deviceName": "Samsung Galaxy S21",
    "ipAddress": "192.168.1.100"
  }
}
```

### Backend Requirements

1. **Real Data Only**: All endpoints must return actual device probe results (ADB, Fastboot, libusb)
2. **No Simulation**: If tools aren't installed, return `{ present: false }` instead of simulating
3. **Empty Arrays**: If no devices found, return `[]` - UI will show empty state
4. **Error Handling**: Return proper HTTP status codes and error messages
5. **Audit Trail**: Every trigger execution must be logged with structured data

---

## Frontend Usage

### Using the Hook

```typescript
import { useAuthorizationTrigger } from '@/hooks/use-authorization-trigger';
import { AuthorizationTriggerModal } from '@/components/AuthorizationTriggerModal';

function MyComponent() {
  const { trigger, deviceId, isOpen, openTrigger, closeTrigger } = useAuthorizationTrigger();

  const handleFlash = () => {
    openTrigger('flash_firmware', {
      deviceId: 'ABC123',
      deviceName: 'Samsung Galaxy S21',
      additionalData: { partitions: ['boot', 'system'] }
    });
  };

  return (
    <>
      <Button onClick={handleFlash}>Flash Device</Button>

      <AuthorizationTriggerModal
        trigger={trigger}
        deviceId={deviceId}
        open={isOpen}
        onClose={closeTrigger}
        onSuccess={(data) => console.log('Success:', data)}
        onError={(error) => console.error('Error:', error)}
      />
    </>
  );
}
```

### Direct Execution

```typescript
import {
  executeTrigger,
  logTriggerAction,
  getTriggerById,
} from "@/lib/authorization-triggers";

const trigger = getTriggerById("flash_firmware");
if (trigger) {
  const result = await executeTrigger(trigger, "ABC123", {
    partitions: ["boot"],
  });

  await logTriggerAction(
    trigger.id,
    "ABC123",
    result.success ? "approved" : "rejected",
  );
}
```

---

## UI Behavior

### Empty States

- **No Devices:** Show "No devices connected" with dimmed icon
- **No Operations:** Show "No operations queued"
- **No Results:** Show "No test results yet"
- **No Plugins:** Show "No plugins installed"

### Never Show

- ❌ Fake "Connected" status
- ❌ Placeholder device entries
- ❌ Simulated operation results
- ❌ Ghost values

### Always Show

- ✅ Real device detection only
- ✅ Actual API responses
- ✅ Truth-first data
- ✅ Clear empty states

---

## Risk Levels

| Level           | Badge Color | Icon           | Description                            |
| --------------- | ----------- | -------------- | -------------------------------------- |
| **Low**         | Green       | Info           | Safe operations, no data loss risk     |
| **Medium**      | Amber       | Warning        | Caution required, reversible actions   |
| **High**        | Orange      | Shield         | Elevated risk, requires careful review |
| **Destructive** | Red         | Shield Warning | Cannot be undone, data loss possible   |

---

## Total Triggers: 27

- Trust & Security: 3
- Flash Operations: 8
- Diagnostics: 4
- Evidence & Reports: 4
- Policy & Compliance: 3
- Hotplug Events: 2
- Plugin Actions: 3

---

## Next Steps

1. Implement backend endpoints for all triggers
2. Set up audit logging database/storage
3. Configure RBAC for supervisor approval triggers
4. Test each trigger with real devices
5. Set up monitoring for failed trigger executions
6. Create admin dashboard for audit log review
