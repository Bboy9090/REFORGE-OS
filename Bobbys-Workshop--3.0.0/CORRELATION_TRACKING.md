# Device Correlation Tracking System

## Overview

The Device Correlation Tracking System provides transparent, honest device identification by correlating USB device records with tool-reported IDs (adb serial, fastboot serial, iOS UDID). It generates correlation badges, calculates confidence scores, and enforces policy gates to prevent destructive actions on uncertain devices.

## Architecture

### Core Components

1. **Types** (`src/types/correlation.ts`)

   - `CorrelationBadge`: Badge types (CORRELATED, CORRELATED (WEAK), SYSTEM-CONFIRMED, LIKELY, UNCONFIRMED)
   - `PolicyGates`: Policy enforcement structure
   - `DossierSeed`: Complete device dossier with correlation data
   - `DeviceRecord`: Raw device detection record

2. **Normalizer** (`src/lib/dossier-normalizer.ts`)

   - `getMatchedIds()`: Extracts matched tool IDs from device record
   - `correlationBadge()`: Determines correlation badge based on evidence
   - `policyGates()`: Calculates allowed/blocked actions
   - `normalizeBootForgeUSBRecord()`: Generates complete dossier
   - `normalizeScan()`: Processes multiple devices with summary stats

3. **UI Components**
   - `CorrelationBadgeDisplay`: Visual badge with icon and matched IDs
   - `DeviceDossierPanel`: Comprehensive device information panel
   - `CorrelationDashboard`: Full-featured correlation tracking interface

## Correlation Badge Logic

### CORRELATED

**Criteria**: Matched tool IDs present + "confirmed" in mode + confidence ≥ 0.90

**Meaning**: Per-device correlation established. This USB record is definitively linked to specific tool ID(s).

**Example**: USB device 18d1:4ee7 matched to adb serial "ABC123XYZ"

### CORRELATED (WEAK)

**Criteria**: Matched tool IDs present + (mode not confirmed OR confidence < 0.90)

**Meaning**: Tool IDs are matched but confidence is not high enough for strong correlation.

**Example**: USB device has matched ID but mode is "likely_android" instead of "confirmed"

### SYSTEM-CONFIRMED

**Criteria**: No matched tool IDs + "confirmed" in mode + confidence ≥ 0.90

**Meaning**: Tools detect the platform/device at system level, but not mapped to this specific USB record.

**Warning**: "Tool confirmation detected, but not mapped to this specific USB record (system-level only)."

### LIKELY

**Criteria**: No matched tool IDs + "likely" in mode

**Meaning**: Detection suggests probable platform/mode but lacks confirmation.

### UNCONFIRMED

**Criteria**: None of the above

**Meaning**: Insufficient evidence for confident classification.

## Policy Gates

Policy gates define what operations Pandora/BootForge can perform on a device based on correlation quality.

### Gate Structure

```typescript
{
  require_explicit_device_select: true,  // Always true
  require_typed_confirmation_for_destructive: true,  // Always true
  block_destructive_if_confidence_below: 0.90,  // 0.87 if correlated
  correlation_present: boolean,
  allowed_actions: string[],
  blocked_actions: string[],
  reasons: string[]
}
```

### Confidence Thresholds

- **Without correlation**: 0.90 (90% confidence required)
- **With correlation**: 0.87 (87% confidence required)

Rationale: Per-device correlation provides additional evidence, allowing slightly lower confidence threshold while still maintaining safety.

### Action Categories

#### Always Allowed (Safe)

- `detect`
- `read_usb_identity`
- `tool_health`
- `export_evidence_bundle`

#### Android Conditional (Read-Only)

- `android_getprop` (requires `can_run_adb_shell`)
- `android_logcat_tail` (requires `can_run_adb_shell`)
- `fastboot_getvar` (requires `can_use_fastboot`)
- `fastboot_list_devices` (requires `can_use_fastboot`)

#### Android Destructive (Always Blocked by Default)

- `fastboot_flash_partition`
- `android_factory_reset`
- `bootloader_unlock_attempt`

**Note**: These require job preflight + authorization even when confidence is high.

#### iOS Conditional (Read-Only)

- `ios_info_read` (requires `can_collect_ios_info`)
- `ios_pairing_status` (requires `can_collect_ios_info`)

#### iOS Destructive (Always Blocked by Default)

- `ios_restore_attempt`
- `ios_firmware_write`

**Note**: iOS destructive operations require strict authorization + external tooling policy.

## Capabilities

Capabilities determine what tool-level operations are available:

```typescript
{
  can_run_adb_shell: platform === 'android' && mode.includes('confirmed'),
  can_use_fastboot: platform === 'android' && mode === 'bootloader',
  can_collect_ios_info: platform === 'ios' && mode.includes('confirmed')
}
```

## Detection Evidence

Device dossiers track evidence from two sources:

### USB Evidence

- Vendor ID (VID)
- Product ID (PID)
- Serial number (if available)

Example:

```
USB VID: 0x18d1
USB PID: 0x4ee7
```

### Tool Evidence

- Serial numbers reported by tools (adb, fastboot, libimobiledevice)
- Transport IDs
- Device modes

Example:

```
Serial: ABC123XYZ
```

## Integration Guide

### Basic Usage

```typescript
import { normalizeBootForgeUSBRecord } from "@/lib/dossier-normalizer";

const deviceRecord = {
  id: "device-1",
  serial: "ABC123XYZ",
  vendorId: 0x18d1,
  productId: 0x4ee7,
  platform: "android",
  mode: "confirmed_android_os",
  confidence: 0.95,
  matched_tool_ids: ["ABC123XYZ", "adb-ABC123XYZ"],
};

const dossier = normalizeBootForgeUSBRecord(deviceRecord);

console.log(dossier.correlation_badge); // "CORRELATED"
console.log(dossier.matched_ids); // ["ABC123XYZ", "adb-ABC123XYZ"]
console.log(dossier.policy_gates.allowed_actions);
console.log(dossier.policy_gates.blocked_actions);
```

### Batch Processing

```typescript
import { normalizeScan } from "@/lib/dossier-normalizer";

const records = [
  /* ... device records ... */
];
const { devices, summary } = normalizeScan(records);

console.log(`Total: ${summary.total}`);
console.log(`Correlated: ${summary.correlated}`);
console.log(`System Confirmed: ${summary.system_confirmed}`);
console.log(`Unconfirmed: ${summary.unconfirmed}`);
```

### UI Display

```typescript
import { DeviceDossierPanel } from '@/components/DeviceDossierPanel';
import { CorrelationBadgeDisplay } from '@/components/CorrelationBadgeDisplay';

// Full dossier panel
<DeviceDossierPanel dossier={dossier} />

// Badge only
<CorrelationBadgeDisplay
  badge={dossier.correlation_badge}
  matchedIds={dossier.matched_ids}
/>
```

## Security Considerations

### Conservative by Design

The correlation system is intentionally conservative:

1. **Badge Assignment**: Requires strong evidence for higher badge levels
2. **Confidence Thresholds**: High thresholds (87-90%) prevent false positives
3. **Destructive Actions**: Always blocked by default, require explicit authorization
4. **Warnings**: Surface when correlation is system-level only

### Defense in Depth

Multiple layers of protection:

1. **Correlation Quality**: Badge indicates reliability of device identification
2. **Confidence Scores**: Numeric measure of detection certainty
3. **Policy Gates**: Enforce action restrictions based on evidence
4. **Explicit Selection**: Always require user to select target device
5. **Typed Confirmation**: Destructive actions require user to type confirmation

### Honest Communication

The system never overstates confidence:

- "CORRELATED" only when truly per-device
- "SYSTEM-CONFIRMED" explicitly warns of system-level limitation
- Warnings for low confidence (<70%)
- Clear reasons in policy gates

## Dashboard Features

The Correlation Dashboard (`CorrelationDashboard.tsx`) provides:

### Summary Cards

- Total devices
- Correlated count with progress bar
- System-confirmed count with progress bar
- Unconfirmed count with progress bar

### Device Tabs

- Quick navigation between devices
- Badge display on each tab
- Full dossier panel for selected device

### Distribution View

- All devices with correlation status
- Platform and confidence indicators
- Matched IDs display

### Documentation Card

- Explains each badge type
- Reference for operators

## Testing

The correlation system can be tested with mock data:

```typescript
const mockDevices = [
  {
    id: "device-1",
    matched_tool_ids: ["ABC123"], // Has correlation
    platform: "android",
    mode: "confirmed_android_os",
    confidence: 0.95,
  },
  {
    id: "device-2",
    matched_tool_ids: [], // No correlation
    platform: "android",
    mode: "confirmed_android_os",
    confidence: 0.93,
  },
];

const { devices, summary } = normalizeScan(mockDevices);
// First device: CORRELATED
// Second device: SYSTEM-CONFIRMED
```

## Future Enhancements

Potential improvements:

1. **Machine Learning**: Train models on correlation patterns
2. **Historical Tracking**: Track correlation quality over time
3. **Cross-Session Correlation**: Remember device correlations across sessions
4. **Advanced Policy Templates**: Custom policy profiles per use case
5. **Audit Logging**: Track all policy gate decisions
6. **Risk Scoring**: Combine correlation + confidence + history into risk score

## API Reference

See inline TypeScript documentation in:

- `src/types/correlation.ts`
- `src/lib/dossier-normalizer.ts`

All functions are fully typed and documented with JSDoc comments.
