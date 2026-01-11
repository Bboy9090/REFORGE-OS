# Authorization History Tracking

## Overview

Bobby's World Workshop now includes comprehensive authorization history tracking with timeline visualization and automatic retry mechanisms. Every authorization trigger execution is logged, tracked, and can be reviewed with detailed statistics and retry capabilities.

## Features

### 📊 History Tracking

- **Automatic Logging**: Every authorization trigger execution is automatically recorded
- **Detailed Metadata**: Captures trigger name, category, device info, timestamps, execution time
- **Status Tracking**: Monitors success, failure, pending, and retrying states
- **User Response**: Records whether user approved, rejected, or action timed out

### 🕐 Timeline Visualization

- **Grouped by Date**: Entries organized by Today, Yesterday, or specific dates
- **Search & Filter**: Search by trigger name, device ID, or device name
- **Category Filtering**: Filter by trust_security, flash_operations, diagnostics, etc.
- **Status Filtering**: Filter by success, failed, retrying, pending
- **Real-time Updates**: Timeline updates automatically as new triggers execute

### 🔄 Retry Mechanisms

- **Automatic Retry**: Failed operations can be retried with exponential backoff
- **Configurable Settings**:
  - Max Retry Attempts (0-10)
  - Initial Retry Delay (100-10000ms)
  - Backoff Multiplier (1-5x)
  - Operation Timeout (1-300 seconds)
- **Retry Tracking**: Shows retry count and max retries for each entry
- **Smart Backoff**: Delays increase exponentially to avoid overwhelming systems

### 📈 Statistics Dashboard

- **Overview Metrics**:
  - Total executions
  - Successful operations
  - Failed operations
  - Success rate percentage
  - Average execution time
- **Performance Metrics**:
  - Success rate with visual progress bar
  - Average execution time in milliseconds
  - Failure rate percentage
- **Category Breakdown**: Success rates for each authorization category

## Usage

### Accessing Authorization History

Navigate to: **Diagnostics Tab → Auth History**

The dashboard has three main tabs:

1. **Timeline**: View chronological history with search/filter
2. **Statistics**: View performance metrics and category breakdowns
3. **Retry Settings**: Configure automatic retry behavior

### Timeline View

```tsx
// Timeline entries show:
- Trigger name with status badge
- Category badge (color-coded)
- Device ID and name (if applicable)
- Timestamp and execution time
- Retry count (if retries occurred)
- User response (approved/rejected/timeout)
- Error message (if failed)
```

**Timeline Features**:

- Search by trigger name, device ID, or device name
- Filter by category (Trust & Security, Flash Ops, etc.)
- Filter by status (Success, Failed, Retrying, Pending)
- Delete individual entries
- Clear all history (with confirmation)
- Export history as JSON

### Statistics View

**Overview Stats Card**:

- Total Executions
- Successful count
- Failed count
- Pending count
- Retrying count

**Performance Metrics Card**:

- Success Rate with progress bar
- Average Execution Time
- Failure Rate percentage

**Category Breakdown**:

- Shows total operations per category
- Success rate for each category
- Visual progress bars

### Retry Settings

Configure automatic retry behavior:

**Max Retry Attempts**: Number of retry attempts before giving up (0-10)

- Default: 3

**Initial Retry Delay**: Delay before first retry in milliseconds (100-10000ms)

- Default: 1000ms (1 second)

**Backoff Multiplier**: Exponential multiplier for subsequent retries (1-5x)

- Default: 2x
- Example: 1000ms → 2000ms → 4000ms

**Operation Timeout**: Maximum time to wait for operation (1-300 seconds)

- Default: 30000ms (30 seconds)

**Retry Behavior Preview**:
Shows calculated delays for each retry attempt based on current settings.

## Integration with Authorization Triggers

### Automatic History Recording

When a trigger is executed via `AuthorizationTriggerModal`:

```tsx
// History entry created on trigger execution
const historyEntry = addHistoryEntry({
  triggerId: "flash_firmware",
  triggerName: "Flash Firmware",
  category: "flash_operations",
  deviceId: "ABC123",
  deviceName: "Samsung Galaxy S21",
  status: "pending",
  userResponse: "approved",
  metadata: {
    /* additional data */
  },
});

// Entry updated on completion
updateHistoryEntry(historyEntry.id, {
  status: "success", // or 'failed'
  executionTime: 1234,
  errorMessage: undefined,
  auditLog: {
    /* full audit details */
  },
});
```

### Manual Retry

Failed entries can be retried from the timeline:

```tsx
// Retry button available for failed entries
// that haven't exceeded max retries
<Button onClick={handleRetry}>
  <ArrowClockwise /> Retry
</Button>;

// Retry logic with backoff
await retryAuthorization(entryId, async () => {
  // Re-execute the trigger
  return await executeTrigger(trigger, deviceId, additionalData);
});
```

## Data Persistence

All authorization history is persisted using the `useKV` hook:

**Storage Keys**:

- `authorization-history`: Array of all history entries
- `authorization-retry-config`: Retry configuration settings

**Data Structure**:

```typescript
interface AuthorizationHistoryEntry {
  id: string;
  triggerId: string;
  triggerName: string;
  category: string;
  deviceId?: string;
  deviceName?: string;
  status: "pending" | "success" | "failed" | "retrying";
  userResponse: "approved" | "rejected" | "timeout";
  timestamp: number;
  executionTime?: number;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
  metadata?: Record<string, any>;
  auditLog?: {
    action: string;
    triggerId: string;
    deviceId?: string;
    userResponse: string;
    timestamp: number;
    executionResult?: any;
    errorDetails?: string;
  };
}
```

## Export History

Export authorization history as JSON for external analysis:

```tsx
// Click "Export" button in dashboard header
// Downloads: authorization-history-YYYY-MM-DD-HHmmss.json

// Example exported data:
[
  {
    "id": "auth-1234567890-abc123",
    "triggerId": "flash_firmware",
    "triggerName": "Flash Firmware",
    "category": "flash_operations",
    "deviceId": "ABC123",
    "status": "success",
    "executionTime": 2341,
    "timestamp": 1234567890000,
    ...
  },
  ...
]
```

## Best Practices

### Monitoring

- Review success rates regularly in Statistics tab
- Investigate failed operations with high retry counts
- Monitor average execution times for performance issues

### Retry Configuration

- Start with default settings (3 retries, 1000ms delay, 2x backoff)
- Increase max retries for unreliable connections
- Increase timeout for slow operations
- Adjust backoff multiplier based on system responsiveness

### Data Management

- Export history periodically for external backup
- Clear old entries to maintain performance
- Use search/filter to focus on specific issues

### Troubleshooting

- Check error messages in timeline entries
- Review audit logs for detailed execution info
- Monitor retry counts to identify problematic triggers
- Export history for detailed analysis in external tools

## Timeline Entry States

**Success** (Green):

- Operation completed successfully
- Execution time recorded
- No errors

**Failed** (Red):

- Operation failed
- Error message displayed
- Retry available (if under max retries)

**Retrying** (Amber):

- Currently retrying after failure
- Animated spinner indicator
- Retry count displayed

**Pending** (Gray):

- Operation started but not completed
- Usually very brief state
- Transitions to success or failed

## API Integration

The authorization history system integrates with existing trigger APIs:

```typescript
// From use-authorization-history.ts
const {
  history, // All history entries
  addHistoryEntry, // Add new entry
  updateHistoryEntry, // Update existing entry
  deleteHistoryEntry, // Delete entry
  clearHistory, // Clear all entries
  retryAuthorization, // Retry failed operation
  getTimelineGroups, // Get grouped timeline
  getFilteredHistory, // Filter history
  getStats, // Get statistics
  isRetrying, // Retry status by entry ID
  retryConfig, // Current retry config
} = useAuthorizationHistory();
```

## Future Enhancements

Potential improvements for future versions:

- Bulk retry operations
- Scheduled automatic retries
- Email notifications for critical failures
- Historical trend analysis
- Category-specific retry configurations
- Custom retry strategies per trigger type
- Integration with evidence bundles
- Advanced analytics and reporting

## Related Documentation

- [Authorization Triggers API](AUTHORIZATION_TRIGGERS_API.md)
- [Comprehensive Authorization Triggers](COMPREHENSIVE_AUTHORIZATION_TRIGGERS.md)
- [Trigger Catalog](TRIGGER_CATALOG_API.md)
- [Truth-First Design](TRUTH_FIRST_GUIDE.md)
