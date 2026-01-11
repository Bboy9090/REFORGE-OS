# Snapshot Retention System

## Overview

The Snapshot Retention system provides automatic backup management and lifecycle control for device states, diagnostic results, flash operations, plugin configurations, and evidence bundles in Bobby's World.

## Features

### Automatic Snapshots

- **Device States**: Capture device configuration and status at any point
- **Diagnostic Results**: Store diagnostic test outputs with metadata
- **Flash Operations**: Record all flashing operations with progress data
- **Plugin Configs**: Backup plugin settings and configurations
- **Evidence Bundles**: Archive signed forensic evidence
- **Workspace Backups**: Periodic backup of user workspace data

### Retention Policies

- **Configurable Rules**: Define custom retention policies per snapshot type
- **Age-Based Deletion**: Automatically delete snapshots older than specified age
- **Count-Based Limits**: Keep only N most recent snapshots per type
- **Priority Levels**: Critical, High, Normal, Low priority classifications
- **Compression**: Automatic compression after specified age to save storage
- **Minimum Retention**: Always keep at least N snapshots regardless of age

### Policy Configuration

Each retention policy includes:

- **Name**: Human-readable policy name
- **Enabled**: Toggle policy on/off
- **Snapshot Types**: Which snapshot types this policy applies to
- **Max Age**: Maximum snapshot age in days (-1 for forever)
- **Max Count**: Maximum number of snapshots (-1 for unlimited)
- **Min Retain Count**: Minimum snapshots to always keep
- **Priority**: Priority level for this policy
- **Compress After Days**: Days before automatic compression
- **Auto Delete**: Enable/disable automatic deletion

## Default Policies

### Critical Data - Keep Forever

- **Types**: Evidence bundles, Flash operations
- **Max Age**: Forever (-1)
- **Max Count**: Unlimited (-1)
- **Compress After**: 30 days
- **Auto Delete**: Disabled

Never automatically delete critical forensic evidence or flash operation records.

### Diagnostic Results - 90 Days

- **Types**: Diagnostic results
- **Max Age**: 90 days
- **Max Count**: 500 snapshots
- **Min Retain**: 10 snapshots
- **Compress After**: 7 days
- **Auto Delete**: Enabled

Keep diagnostic results for 90 days, automatically compress after 1 week.

### Device States - 30 Days

- **Types**: Device states
- **Max Age**: 30 days
- **Max Count**: 200 snapshots
- **Min Retain**: 5 snapshots
- **Compress After**: 7 days
- **Auto Delete**: Enabled

Device state snapshots retained for 30 days, compressed after 1 week.

### Workspace Backups - 7 Days

- **Types**: Workspace backups
- **Max Age**: 7 days
- **Max Count**: 50 snapshots
- **Min Retain**: 3 snapshots
- **Compress After**: 3 days
- **Auto Delete**: Enabled

Weekly workspace backup rotation with 3-day compression threshold.

### Plugin Configs - 14 Days

- **Types**: Plugin configurations
- **Max Age**: 14 days
- **Max Count**: 100 snapshots
- **Min Retain**: 5 snapshots
- **Compress After**: 3 days
- **Auto Delete**: Enabled

Two-week plugin configuration history with quick compression.

## Usage

### Creating Snapshots

```typescript
import { snapshotManager } from "@/lib/snapshot-manager";

// Capture device state
await snapshotManager.createSnapshot("device-state", deviceData, {
  deviceId: "device-123",
  deviceSerial: "ABC123XYZ",
  deviceModel: "Pixel 7 Pro",
  priority: "high",
  tags: ["android", "adb-authorized"],
  metadata: {
    adbStatus: "authorized",
    batteryLevel: 85,
  },
});

// Capture diagnostic result
await snapshotManager.createSnapshot("diagnostic-result", diagnosticData, {
  deviceSerial: "ABC123XYZ",
  priority: "normal",
  tags: ["battery-test", "passed"],
});

// Capture flash operation
await snapshotManager.createSnapshot("flash-operation", flashData, {
  deviceSerial: "ABC123XYZ",
  priority: "critical",
  tags: ["system-image", "successful"],
  retainUntil: Date.now() + 365 * 24 * 60 * 60 * 1000, // Keep 1 year
});
```

### Querying Snapshots

```typescript
// List all snapshots
const all = await snapshotManager.listSnapshots();

// Filter by type
const diagnostics = await snapshotManager.listSnapshots({
  type: "diagnostic-result",
});

// Filter by device
const deviceSnapshots = await snapshotManager.listSnapshots({
  deviceSerial: "ABC123XYZ",
});

// Filter by date range
const recent = await snapshotManager.listSnapshots({
  minTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
});

// Filter by tags
const tagged = await snapshotManager.listSnapshots({
  tags: ["android", "successful"],
});
```

### Managing Policies

```typescript
// Get all policies
const policies = await snapshotManager.listPolicies();

// Update a policy
await snapshotManager.updatePolicy({
  id: "diagnostics-90days",
  name: "Diagnostic Results - 90 Days",
  enabled: true,
  snapshotTypes: ["diagnostic-result"],
  maxAge: 90 * 24 * 60 * 60 * 1000,
  maxCount: 500,
  minRetainCount: 10,
  priority: "high",
  compressAfterDays: 7,
  autoDeleteEnabled: true,
});

// Apply all policies (run cleanup)
const deletedCount = await snapshotManager.applyRetentionPolicies();
console.log(`Deleted ${deletedCount} expired snapshots`);
```

### React Hook

```typescript
import { useSnapshotManager } from '@/hooks/use-snapshot-manager';

function MyComponent() {
  const {
    snapshots,
    policies,
    stats,
    recentActions,
    loading,
    createSnapshot,
    deleteSnapshot,
    updatePolicy,
    applyRetentionPolicies,
  } = useSnapshotManager();

  // snapshots, policies, and stats automatically loaded and reactive

  return (
    <div>
      <p>Total Snapshots: {stats?.totalSnapshots}</p>
      <p>Storage Used: {snapshotManager.formatBytes(stats?.totalSizeBytes || 0)}</p>
      <button onClick={applyRetentionPolicies}>Apply Policies</button>
    </div>
  );
}
```

## Storage

All snapshots and policies are stored in browser localStorage via the Spark KV API:

- **Key**: `bobby-snapshots` - All snapshot data
- **Key**: `bobby-retention-policies` - Policy configurations
- **Key**: `bobby-retention-actions` - Audit log (last 1000 actions)

## Statistics

The system tracks:

- **Total Snapshots**: Count of all snapshots
- **Total Size**: Storage space used (in bytes)
- **Snapshots by Type**: Breakdown by snapshot type
- **Oldest/Newest**: Timestamp ranges
- **Eligible for Deletion**: Snapshots that meet deletion criteria
- **Compression Savings**: Estimated space saved by compression

## Audit Trail

Every retention action is logged:

- **Action Type**: delete, compress, archive, retain
- **Snapshot ID**: Target snapshot
- **Reason**: Why action was taken
- **Timestamp**: When action occurred
- **Manual**: Whether action was user-initiated or automatic

Last 1000 actions kept in history.

## Export/Import

```typescript
// Export all snapshots
const json = await snapshotManager.exportSnapshots();

// Export specific snapshots
const json = await snapshotManager.exportSnapshots(['snapshot-1', 'snapshot-2']);

// Export format
{
  "version": "1.0",
  "exportDate": "2025-01-15T10:30:00.000Z",
  "snapshots": [...]
}
```

## UI Components

### SnapshotRetentionPanel

Main management interface with three tabs:

1. **Snapshots**: Browse, filter, and manage snapshots
2. **Retention Policies**: Configure lifecycle rules
3. **Recent Activity**: View audit trail

Features:

- Live statistics dashboard
- Type filtering
- Manual deletion
- Policy editor
- Export functionality
- Bulk operations

## Integration Points

### Device Diagnostics

Automatically snapshot diagnostic results:

```typescript
// After running diagnostics
await snapshotManager.createSnapshot("diagnostic-result", results, {
  deviceSerial: device.serial,
  tags: ["battery-health", testResult.status],
});
```

### Flash Operations

Capture flash progress and results:

```typescript
// After flash completes
await snapshotManager.createSnapshot("flash-operation", flashData, {
  deviceSerial: device.serial,
  priority: "critical",
  tags: [device.platform, "flash-success"],
});
```

### Plugin System

Backup plugin configurations:

```typescript
// When plugin settings change
await snapshotManager.createSnapshot("plugin-config", pluginState, {
  tags: [plugin.id, "config-update"],
});
```

### Evidence Bundles

Archive signed evidence:

```typescript
// Create evidence bundle snapshot
await snapshotManager.createSnapshot("evidence-bundle", bundle, {
  deviceSerial: device.serial,
  priority: "critical",
  tags: ["signed", "forensic"],
  retainUntil: -1, // Keep forever
});
```

## Best Practices

1. **Set Appropriate Priorities**: Use 'critical' sparingly for truly irreplaceable data
2. **Enable Compression**: Saves storage without data loss
3. **Keep Minimum Counts**: Always retain at least N snapshots per type
4. **Tag Snapshots**: Makes filtering and searching easier
5. **Run Policies Regularly**: Set up periodic policy application (e.g., daily)
6. **Export Important Data**: Regularly export critical snapshots
7. **Monitor Storage**: Check stats dashboard for storage usage trends

## Automatic Policy Application

Policies are automatically applied:

- After creating a new snapshot
- When manually triggered via UI
- Can be integrated into scheduled tasks

## Performance

- **Fast Queries**: Snapshots stored in memory-efficient format
- **Incremental Compression**: Only compress when needed
- **Batched Deletions**: Efficient multi-snapshot cleanup
- **Lazy Loading**: Statistics computed on-demand

## Future Enhancements

- **Cloud Sync**: Optional backup to remote storage
- **Encryption**: Encrypted snapshot storage
- **Scheduled Policies**: Cron-like policy execution
- **Advanced Filters**: Complex query conditions
- **Snapshot Diffing**: Compare snapshots over time
- **Restore Points**: Quick device state restoration
