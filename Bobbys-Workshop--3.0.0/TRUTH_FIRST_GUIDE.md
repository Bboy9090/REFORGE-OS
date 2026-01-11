# Truth-First Design Implementation Guide

## Overview

This document outlines the implementation of truth-first design principles across Bobby's World. Every UI element must reflect real backend detection results - no ghost values, no placeholders, no fake "connected" statuses.

## Core Components

### 1. App Context (`src/lib/app-context.tsx`)

Provides global state for demo mode and backend availability:

```typescript
import { useApp } from "@/lib/app-context";

const { isDemoMode, backendAvailable } = useApp();
```

- `isDemoMode`: Boolean indicating if app is running in demo mode (simulated data)
- `backendAvailable`: Boolean indicating if backend API is reachable
- State persists via `useKV` for session continuity

### 2. Backend Health Check (`src/lib/backend-health.ts`)

Utilities for checking backend and tool availability:

```typescript
import { checkBackendHealth, getBackendStatus } from "@/lib/backend-health";

const healthy = await checkBackendHealth();
const status = await getBackendStatus();
```

Functions:

- `checkBackendHealth()`: Returns boolean, 2s timeout
- `checkToolAvailability(tool)`: Checks if ADB/Fastboot/iDevice tools available
- `getBackendStatus()`: Returns complete availability status object

### 3. Reusable State Components

#### EmptyState (`src/components/EmptyState.tsx`)

Used when no data available (not an error):

```typescript
<EmptyState
  icon={<DeviceMobile className="w-12 h-12" />}
  title="No devices connected"
  description="Connect a device via USB to begin"
  action={{
    label: 'Refresh',
    onClick: refreshDevices
  }}
/>
```

#### ErrorState (`src/components/ErrorState.tsx`)

Used when something went wrong:

```typescript
<ErrorState
  title="Backend API unavailable"
  message="Could not connect to http://localhost:3001"
  variant="error"
  action={{
    label: 'Retry Connection',
    onClick: retryConnection
  }}
/>
```

#### LoadingState (`src/components/LoadingState.tsx`)

Used during data fetching:

```typescript
<LoadingState
  message="Detecting devices..."
  rows={3}
/>
```

### 4. Demo Mode Banner (`src/components/DemoModeBanner.tsx`)

Persistent banner shown when in demo mode:

```typescript
{isDemoMode && <DemoModeBanner onDisable={handleConnectBackend} />}
```

## Implementation Patterns

### Pattern 1: Device Detection

```typescript
import { useAndroidDevices } from '@/hooks/use-android-devices';

function DevicePanel() {
  const { devices, loading, error } = useAndroidDevices();

  if (loading) return <LoadingState message="Detecting devices..." />;

  if (error) {
    return (
      <ErrorState
        title="Device detection failed"
        message={error}
        action={{ label: 'Retry', onClick: refresh }}
      />
    );
  }

  if (devices.length === 0) {
    return (
      <EmptyState
        icon={<DeviceMobile className="w-12 h-12" />}
        title="No devices connected"
        description="Connect an Android device via USB"
      />
    );
  }

  return <DeviceList devices={devices} />;
}
```

### Pattern 2: Flash Operations

```typescript
function FlashPanel() {
  const { isDemoMode } = useApp();
  const [operations, setOperations] = useState([]);

  const startFlash = async () => {
    if (!isDemoMode) {
      toast.error('Flash operations require backend API');
      return;
    }
    // Only proceed in demo mode or with backend
  };

  if (operations.length === 0) {
    return (
      <EmptyState
        title="No operations queued"
        description={isDemoMode
          ? "Demo mode: Click to simulate flash operation"
          : "Connect backend to start real flash operations"}
        action={isDemoMode ? {
          label: 'Start Demo',
          onClick: startFlash
        } : undefined}
      />
    );
  }

  return <OperationsList operations={operations} />;
}
```

### Pattern 3: Plugin Registry

```typescript
function PluginMarketplace() {
  const { isDemoMode } = useApp();
  const { plugins, loading, error, syncStatus } = usePluginRegistry();

  if (loading) return <LoadingState message="Syncing plugin registry..." />;

  if (error || !syncStatus.success) {
    return (
      <ErrorState
        title="Registry sync failed"
        message="Unable to connect to plugin registry"
        variant="warning"
        action={{
          label: 'Retry Sync',
          onClick: retrySync
        }}
      />
    );
  }

  if (plugins.length === 0) {
    return (
      <EmptyState
        title="No plugins available"
        description="Plugin registry is empty or sync failed"
      />
    );
  }

  return <PluginGrid plugins={plugins} isDemoMode={isDemoMode} />;
}
```

### Pattern 4: Test Results

```typescript
function TestResultsPanel() {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  if (running) {
    return <LoadingState message="Running test suite..." />;
  }

  if (!results) {
    return (
      <EmptyState
        icon={<TestTube className="w-12 h-12" />}
        title="No test results yet"
        description="Run the test suite to see security and quality results"
        action={{
          label: 'Run Tests',
          onClick: runTests
        }}
      />
    );
  }

  return <TestResults data={results} />;
}
```

### Pattern 5: Evidence Bundles

```typescript
function EvidenceBundleList() {
  const { bundles, loading, error } = useEvidenceBundles();

  if (loading) return <LoadingState message="Loading bundles..." />;

  if (error) {
    return (
      <ErrorState
        title="Failed to load evidence bundles"
        message={error}
        action={{ label: 'Retry', onClick: refresh }}
      />
    );
  }

  if (bundles.length === 0) {
    return (
      <EmptyState
        icon={<Archive className="w-12 h-12" />}
        title="No evidence bundles created"
        description="Evidence bundles are created automatically during diagnostic operations"
      />
    );
  }

  return <BundleGrid bundles={bundles} />;
}
```

## Device State Classification

### State Definitions

Never auto-promote devices to higher confidence states. Only backend tool evidence can upgrade state.

```typescript
type DeviceState =
  | "connected" // ✅ Tool confirmed (ADB/Fastboot/DFU)
  | "weak" // ⚠️ Partial evidence, low confidence
  | "confirmed" // 🖥️ OS confirmed, not mapped to USB
  | "likely" // 🤔 Heuristic detection, unverified
  | "unconfirmed"; // ❌ Insufficient evidence

// Mapping to UI
function getStatusIndicator(state: DeviceState) {
  switch (state) {
    case "connected":
      return { icon: CheckCircle, color: "text-success", label: "Connected" };
    case "weak":
      return { icon: Warning, color: "text-warning", label: "Weak Signal" };
    case "confirmed":
      return { icon: CheckCircle, color: "text-primary", label: "Confirmed" };
    case "likely":
      return { icon: Circle, color: "text-accent", label: "Likely" };
    case "unconfirmed":
      return {
        icon: Question,
        color: "text-muted-foreground",
        label: "Unconfirmed",
      };
  }
}
```

### Backend Response Contract

```typescript
// Example backend response
interface DeviceDetectionResponse {
  devices: Array<{
    serial: string;
    state: DeviceState;
    evidence: {
      adb?: boolean;
      fastboot?: boolean;
      usb?: boolean;
      confidence: number; // 0-100
    };
    model?: string;
    source: "adb" | "fastboot" | "usb" | "dfu";
  }>;
  tools: {
    adb: { available: boolean; version?: string };
    fastboot: { available: boolean; version?: string };
    idevice: { available: boolean; version?: string };
  };
}
```

## Demo Mode Handling

### Labeling Demo Data

All simulated data must be clearly marked:

```typescript
const demoDevice = {
  serial: "[DEMO] ABC123XYZ",
  model: "[DEMO] Simulated Device",
  state: "connected",
};

toast.success("Operation started (DEMO MODE)");
```

### Disabling Features Without Backend

```typescript
<Button
  disabled={!backendAvailable}
  onClick={performRealOperation}
>
  {backendAvailable ? 'Start Operation' : 'Backend Required'}
</Button>
```

### Demo Mode Detection

```typescript
useEffect(() => {
  async function checkBackend() {
    const healthy = await checkBackendHealth();

    if (!healthy) {
      setDemoMode(true);
      // Initialize mock services
      MockBatchDiagnosticsWebSocket.initialize();
      setupMockRegistryAPI();
    } else {
      setDemoMode(false);
      // Use real backend
    }
  }

  checkBackend();
}, []);
```

## Audit Logging

### Detection Events

Every device detection attempt should be logged:

```typescript
async function detectDevices() {
  const startTime = Date.now();
  console.log("[Detection] Starting device detection...");

  try {
    const response = await fetch("/api/android-devices/all");
    const data = await response.json();

    console.log("[Detection] Found", data.devices.length, "devices");
    console.log("[Detection] Evidence:", {
      adb: data.sources.adb.count,
      fastboot: data.sources.fastboot.count,
      duration: Date.now() - startTime,
    });

    return data;
  } catch (error) {
    console.error("[Detection] Failed:", error);
    throw error;
  }
}
```

### Operation Audit Trail

```typescript
interface AuditEntry {
  timestamp: number;
  operation: string;
  device?: string;
  evidence: {
    tool: string;
    output: string;
    exitCode: number;
  };
  result: "success" | "failure";
}

function logOperation(entry: AuditEntry) {
  const auditLog = getFromKV("audit:operations", []);
  auditLog.push(entry);
  saveToKV("audit:operations", auditLog);
}
```

## Migration Checklist

### For Each Component:

- [ ] Import and use `useApp()` hook for demo mode detection
- [ ] Replace hardcoded data with API calls
- [ ] Add loading states with `<LoadingState />`
- [ ] Add error states with `<ErrorState />`
- [ ] Add empty states with `<EmptyState />`
- [ ] Label all demo data with `[DEMO]` prefix
- [ ] Disable real operations when `!backendAvailable`
- [ ] Log detection attempts and results
- [ ] Never auto-promote device states
- [ ] Show "No data" instead of fake data

### Common Mistakes to Avoid:

❌ Showing "Connected" without tool evidence  
❌ Hardcoded device lists in components  
❌ Simulated data without `[DEMO]` label  
❌ Missing empty states (showing nothing)  
❌ Auto-promoting "unconfirmed" to "connected"  
❌ Masking backend errors with fallback data  
❌ localStorage without real backend sync

✅ Real API responses or clear empty states  
✅ Explicit device state confidence levels  
✅ Demo mode banner when using mocks  
✅ Error states with retry actions  
✅ Audit logging for all operations  
✅ No data means empty list, not fake entries

## Testing Truth-First Design

### Manual Testing

1. Start app with backend DOWN → Should show demo banner
2. All panels should show empty states initially
3. Click operations → Should warn "Backend required" or show "[DEMO]"
4. Start backend → Banner should disappear
5. Connect device → Should appear with correct state
6. Disconnect device → Should remove from list immediately

### Automated Tests

```typescript
describe('Truth-First Device Detection', () => {
  it('shows empty state when no devices', () => {
    mockAPI.getDevices = () => ({ devices: [] });
    render(<DeviceSidebar />);
    expect(screen.getByText(/no devices connected/i)).toBeInTheDocument();
  });

  it('never shows devices without backend evidence', () => {
    render(<DeviceSidebar />);
    expect(screen.queryByText(/connected/i)).not.toBeInTheDocument();
  });

  it('labels demo data clearly', () => {
    mockAPI.demoMode = true;
    render(<FlashPanel />);
    fireEvent.click(screen.getByText(/start demo/i));
    expect(screen.getByText(/\[DEMO\]/i)).toBeInTheDocument();
  });
});
```

## Summary

**Golden Rule**: If the backend says nothing, the UI shows nothing. No ghost values, no fake connections, no placeholders that look real. Every "Connected" status must have tool evidence. Every empty list must stay empty until real data arrives. Demo mode must be clearly labeled and separate from production behavior.
