# Snapshot Retention Integration Guide

## Quick Start

The Snapshot Retention system is now integrated into Bobby's World. Access it from the main hub via the **Snapshot Retention** card.

## Auto-Snapshot Integration Examples

### 1. Device Diagnostics Integration

```typescript
// In RealTimeUSBDiagnostics.tsx or similar diagnostic components
import { autoSnapshot } from "@/lib/auto-snapshot";

async function runDiagnostics(device: Device) {
  // Run your diagnostic tests
  const results = await performDiagnosticTests(device);

  // Automatically snapshot the results
  await autoSnapshot.snapshotDiagnosticResult(results, {
    deviceSerial: device.serial,
    deviceModel: device.model,
    testName: "usb-diagnostics",
    passed: results.allTestsPassed,
    tags: ["usb", device.platform],
    metadata: {
      batteryLevel: results.batteryLevel,
      connectionType: results.connectionType,
    },
  });

  return results;
}
```

### 2. Flash Operation Integration

```typescript
// In MultiBrandFlashDashboard.tsx or flash-related components
import { autoSnapshot } from "@/lib/auto-snapshot";

async function performFlash(device: Device, image: FlashImage) {
  const flashData = {
    startTime: Date.now(),
    device: device.serial,
    imageFile: image.filename,
  };

  try {
    // Perform the flash
    await flashDevice(device, image);

    flashData.endTime = Date.now();
    flashData.status = "success";

    // Snapshot successful flash operation
    await autoSnapshot.snapshotFlashOperation(flashData, {
      deviceSerial: device.serial,
      deviceModel: device.model,
      operation: "system-flash",
      success: true,
      tags: [device.platform, image.type],
    });
  } catch (error) {
    flashData.endTime = Date.now();
    flashData.status = "failed";
    flashData.error = error.message;

    // Snapshot failed operation (critical for debugging)
    await autoSnapshot.snapshotFlashOperation(flashData, {
      deviceSerial: device.serial,
      deviceModel: device.model,
      operation: "system-flash",
      success: false,
      tags: [device.platform, "error"],
      metadata: { errorMessage: error.message },
    });

    throw error;
  }
}
```

### 3. Plugin Configuration Integration

```typescript
// In PluginManager.tsx or plugin settings components
import { autoSnapshot } from "@/lib/auto-snapshot";

async function updatePluginConfig(pluginId: string, config: any) {
  // Update the plugin configuration
  await savePluginConfig(pluginId, config);

  // Snapshot the configuration change
  await autoSnapshot.snapshotPluginConfig(config, {
    pluginId,
    pluginVersion: getPluginVersion(pluginId),
    tags: ["config-update", pluginId],
    metadata: {
      changedBy: await getCurrentUser(),
      changeReason: "settings-update",
    },
  });
}
```

### 4. Device State Integration

```typescript
// In LiveDeviceSelector.tsx or device monitoring components
import { autoSnapshot } from "@/lib/auto-snapshot";

async function onDeviceConnected(device: Device) {
  // Capture device state when connected
  const deviceState = {
    connectionTime: Date.now(),
    adbStatus: device.adbAuthorized ? "authorized" : "unauthorized",
    batteryLevel: await getBatteryLevel(device),
    platform: device.platform,
    buildInfo: await getBuildInfo(device),
  };

  await autoSnapshot.snapshotDeviceState(deviceState, {
    deviceSerial: device.serial,
    deviceModel: device.model,
    tags: ["connected", device.platform],
    metadata: deviceState,
  });
}
```

### 5. Evidence Bundle Integration

```typescript
// In EvidenceBundleManager.tsx
import { autoSnapshot } from "@/lib/auto-snapshot";

async function createEvidenceBundle(device: Device, diagnostics: any) {
  // Create and sign the bundle
  const bundle = await evidenceBundle.create({
    deviceSerial: device.serial,
    diagnostics,
    timestamp: Date.now(),
  });

  const signed = await evidenceBundle.sign(bundle);

  // Snapshot the signed evidence (critical - keep forever)
  await autoSnapshot.snapshotEvidenceBundle(signed, {
    deviceSerial: device.serial,
    deviceModel: device.model,
    signed: true,
    tags: ["forensic", "signed", device.platform],
    metadata: {
      bundleId: signed.id,
      signatureHash: signed.signature.hash,
    },
  });

  return signed;
}
```

### 6. Workspace Backup Integration

```typescript
// In App.tsx or main application component
import { autoSnapshot } from "@/lib/auto-snapshot";

useEffect(() => {
  // Run periodic workspace backup every 24 hours
  const interval = setInterval(
    async () => {
      await autoSnapshot.runPeriodicBackup();
    },
    24 * 60 * 60 * 1000,
  ); // 24 hours

  // Also run on mount (checks if needed)
  autoSnapshot.runPeriodicBackup();

  return () => clearInterval(interval);
}, []);
```

### 7. Retention Policy Application

```typescript
// In App.tsx - apply retention policies periodically
useEffect(() => {
  // Apply retention policies every 6 hours
  const interval = setInterval(
    async () => {
      const deleted = await autoSnapshot.applyRetentionPolicies();
      if (deleted > 0) {
        console.log(`Cleaned up ${deleted} expired snapshots`);
      }
    },
    6 * 60 * 60 * 1000,
  ); // 6 hours

  // Run on mount
  autoSnapshot.applyRetentionPolicies();

  return () => clearInterval(interval);
}, []);
```

## Configuration

### Enable/Disable Auto-Snapshots

```typescript
import { autoSnapshot } from "@/lib/auto-snapshot";

// Disable all auto-snapshots
await autoSnapshot.configure({ enabled: false });

// Disable only diagnostic snapshots
await autoSnapshot.configure({
  types: {
    diagnosticResult: false,
  },
});

// Enable notifications for debugging
await autoSnapshot.configure({
  notifyOnSnapshot: true,
});
```

### Load Configuration

```typescript
// On app startup
useEffect(() => {
  autoSnapshot.loadConfig();
}, []);
```

## UI Access

Users can manage snapshots from:

1. **Main Hub** → "Snapshot Retention" card
2. **Settings Panel** → Could add quick links to retention settings

## Default Behavior

By default, the system will:

- ✅ Automatically snapshot all operation types
- ✅ Apply retention policies based on snapshot type
- ✅ Compress old snapshots to save storage
- ✅ Keep critical data (evidence, flash ops) forever
- ✅ Delete old diagnostic results after 90 days
- ✅ Delete old device states after 30 days
- ✅ Backup workspace daily

## Storage Monitoring

```typescript
import { snapshotManager } from "@/lib/snapshot-manager";

// Get current statistics
const stats = await snapshotManager.getRetentionStats();

console.log(`Total snapshots: ${stats.totalSnapshots}`);
console.log(
  `Storage used: ${snapshotManager.formatBytes(stats.totalSizeBytes)}`,
);
console.log(`Eligible for deletion: ${stats.eligibleForDeletion}`);
console.log(
  `Compression savings: ${snapshotManager.formatBytes(stats.compressionSavings)}`,
);
```

## Best Practices

1. **Always snapshot critical operations**: Flash operations, evidence bundles
2. **Tag meaningfully**: Use descriptive tags for filtering
3. **Set appropriate priorities**: Reserve 'critical' for irreplaceable data
4. **Monitor storage**: Check stats dashboard periodically
5. **Export important data**: Regularly export critical snapshots
6. **Test restoration**: Verify snapshots contain expected data

## Troubleshooting

### Snapshots Not Being Created

- Check if auto-snapshots are enabled: `autoSnapshot.getConfig()`
- Check console for error messages
- Verify device data is being passed correctly

### Storage Growing Too Fast

- Review retention policies (reduce max age/count)
- Enable compression for more snapshot types
- Check for unnecessary tags/metadata

### Missing Snapshots

- Verify retention policies aren't too aggressive
- Check if snapshots were manually deleted
- Review "Recent Activity" tab for deletion events

## Performance Impact

The snapshot system is designed to be lightweight:

- Snapshots are created asynchronously (non-blocking)
- Compression is deferred until specified age
- Retention policies run in background
- Storage uses efficient browser APIs

Typical overhead:

- **Snapshot creation**: < 50ms
- **Policy application**: < 200ms (runs infrequently)
- **Storage per snapshot**: 1-10 KB (depends on data)

## Future Integrations

Consider adding auto-snapshots to:

- Batch diagnostics operations
- Plugin installation/updates
- Correlation tracking events
- Network device scans
- USB hotplug events
