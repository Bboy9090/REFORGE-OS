# Truth-First Design Audit & Implementation

## 🎯 Objective

Eliminate ALL fake/placeholder data, ghost values, and simulated "connected" statuses from Bobby's World. Every UI element must reflect real backend detection results.

## 🔒 Core Principles

### 1. Live Data Only

- Panels must query backend APIs or device probes
- Empty responses show "No devices detected" or "No results yet"
- Never fake "Connected" status

### 2. Explicit Device States

- ✅ **Connected**: Device confirmed by tool evidence (ADB, Fastboot, DFU, etc.)
- ⚠️ **Weak**: Partial evidence, low confidence
- 🖥️ **System Confirmed**: OS confirms device, but not mapped to USB record
- 🤔 **Likely**: Heuristic detection, not verified
- ❌ **Unconfirmed**: Insufficient evidence

### 3. Backend Enforcement

- FastAPI/Node routes return real probe results only
- Missing tools return `{ present: false }`, not simulations
- No devices = empty array, UI shows appropriate empty state

### 4. UI Behavior

- Graceful empty states for all panels
- Muted text/icons for missing data
- No fake green checkmarks

---

## 📋 Audit Checklist

### ✅ Already Truth-First

- [x] **DeviceSidebar**: Uses `useAndroidDevices()` hook, shows "No devices connected" when empty
- [x] **useAndroidDevices hook**: Fetches from real API endpoint `/api/android-devices/all`
- [x] **Device state mapping**: Properly maps device states to UI indicators

### ⚠️ Needs Truth-First Enforcement

#### Mock Data Sources (REMOVE/REPLACE)

- [ ] **MockPandoraAPI** (`src/lib/mockAPI.ts`)

  - `getFlashHistory()`: Uses localStorage simulation
  - `startFlash()`: Creates fake device names like `Device-${random}`
  - `startMonitoring()`: Generates random performance metrics
  - `runTests()`: Returns hardcoded PASS/FAIL results
  - `getBenchmarkStandards()`: Hardcoded industry standards (OK if static reference data)
  - `subscribeToHotplug()`: Simulates random device attach/detach events

- [ ] **MockBatchDiagnosticsWebSocket** (`src/lib/mock-batch-diagnostics-websocket.ts`)

  - Intercepts WebSocket connections
  - Should only exist for development; needs clear "DEMO MODE" indicator in UI
  - Production should fail gracefully if backend unavailable

- [ ] **mock-plugin-registry-server.ts** (`src/lib/mock-plugin-registry-server.ts`)
  - Hardcoded `MOCK_REGISTRY_PLUGINS` array
  - Should fetch from real plugin registry API
  - Empty state if registry unreachable

#### Components Requiring Verification

##### Diagnostics Tab Components

- [ ] **RealTimeUSBDiagnostics**: Verify it shows real USB detection results
- [ ] **BatchDiagnosticsPanel**: Should show "No operations queued" when empty
- [ ] **PandoraCodexControlRoom**: Flash monitoring must show real operations only
- [ ] **MultiBrandFlashDashboard**: iOS DFU/Odin/EDL/Fastboot panels show actual device detection

##### Reports Tab Components

- [ ] **EvidenceBundleManager**: List empty until real signed bundles exist
- [ ] **SnapshotRetentionPanel**: Only show actual snapshots from operations
- [ ] **AuthorityDashboard**: Correlation tracking from real events only
- [ ] **RepairLibrary**: OK to have static content (guides/tutorials)

##### Tests Tab Components

- [ ] **AutomatedTestingDashboard**: Results panel blank until backend returns test outcomes
- [ ] **PluginDependencyGraph**: Show real plugin dependencies or "No plugins installed"

##### Plugins Tab Components

- [ ] **PluginMarketplace**: Only show plugins from synced registry
- [ ] **PluginInstaller**: Real installation status, not simulated
- [ ] **PluginManager**: List real installed plugins only

##### Community Tab Components

- [ ] **MyWorkspace**: User's actual notes/history (can be empty for new users)
- [ ] **BobbysVault**: Static educational content (OK)

##### Settings Tab Components

- [ ] **AtmosphereSettings**: User preferences (OK to have defaults)
- [ ] **BootForgeUSBSupportMatrix**: Static device mode specs (OK)

---

## 🛠️ Implementation Plan

### Phase 1: Backend API Contract Definition

1. Define clear API response schemas for all endpoints
2. Document "empty state" responses
3. Define error state responses (tool not installed, no permission, etc.)

### Phase 2: Frontend Empty State Components

1. Create reusable `EmptyState` component
2. Create reusable `ErrorState` component
3. Create reusable `LoadingState` component
4. Add "Demo Mode" indicator banner when using mocks

### Phase 3: Replace Mock Data with Real APIs

1. **Flash Operations**

   - Replace `MockPandoraAPI.getFlashHistory()` with real endpoint
   - Replace `MockPandoraAPI.startFlash()` with real backend call
   - Show "No operations queued" when empty

2. **Performance Monitoring**

   - Replace random metrics with real system monitoring
   - Show "Not monitoring" when inactive
   - Require explicit "Start Monitoring" action

3. **Test Results**

   - Replace hardcoded test results with real test runner output
   - Show "No test results yet" initially
   - Display real pass/fail with evidence

4. **Plugin Registry**

   - Replace `MOCK_REGISTRY_PLUGINS` with API fetch
   - Show "Sync failed" error if registry unreachable
   - Empty marketplace if sync never succeeded

5. **Hotplug Events**
   - Replace simulated events with real USB monitoring
   - Event stream starts empty
   - Only fills when actual WebSocket pushes arrive

### Phase 4: Audit Logging

1. Every detection logs evidence (stdout/stderr, exit codes, timestamps)
2. If detection fails, log failure (don't mask it)
3. UI can show audit trail on demand

### Phase 5: Demo Mode vs Production Mode

1. Add global app state: `isDemoMode`
2. Show persistent banner when in demo mode
3. All mock data clearly labeled as "DEMO DATA"
4. Production mode fails gracefully with helpful error messages

---

## 🎨 Empty State Design Patterns

### Device Sidebar - No Devices

```
┌─────────────────┐
│   🖥️ Devices    │
├─────────────────┤
│                 │
│    📵          │
│                 │
│  No devices     │
│  connected      │
│                 │
└─────────────────┘
```

### Flash Panel - No Operations

```
┌────────────────────────────────┐
│  ⚡ Flash Operations            │
├────────────────────────────────┤
│                                │
│        📦                      │
│                                │
│   No operations queued         │
│                                │
│   [Start Flash Operation]      │
│                                │
└────────────────────────────────┘
```

### Tests Panel - No Results

```
┌────────────────────────────────┐
│  🧪 Test Results                │
├────────────────────────────────┤
│                                │
│        🧪                      │
│                                │
│   No test results yet          │
│                                │
│   [Run Test Suite]             │
│                                │
└────────────────────────────────┘
```

### Plugin Marketplace - Sync Failed

```
┌────────────────────────────────┐
│  🔌 Plugin Marketplace          │
├────────────────────────────────┤
│                                │
│        ⚠️                       │
│                                │
│   Registry sync failed         │
│   Unable to connect to         │
│   plugin registry              │
│                                │
│   [Retry Sync]                 │
│                                │
└────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### DeviceSidebar

- [ ] Shows "No devices connected" when `devices.length === 0`
- [ ] Never auto-promotes to "Connected" without tool evidence
- [ ] Device states accurately reflect backend detection confidence

### Diagnostics Panels

- [ ] Device Diagnostics shows real ADB/Fastboot/USB results or "No devices"
- [ ] Batch Diagnostics shows "No operations" when queue is empty
- [ ] Flash Monitoring shows "Not monitoring" when inactive
- [ ] Multi-Brand Flash only shows devices detected by respective tools

### Reports Panels

- [ ] Evidence Bundles list is empty until bundles created
- [ ] Snapshots only show real backup artifacts
- [ ] Authority Dashboard shows "No events tracked" when empty

### Tests Panels

- [ ] Test Suite shows "No results yet" until tests run
- [ ] Performance panel shows "Not benchmarking" when inactive
- [ ] Plugin Map shows "No plugins installed" when appropriate

### Plugins Panels

- [ ] Marketplace shows registry sync status
- [ ] No plugins displayed if sync never succeeded
- [ ] Installed list accurate, not hardcoded

### Global Behavior

- [ ] Demo mode clearly indicated with persistent banner
- [ ] All error states helpful and actionable
- [ ] No confusing "ghost" data that appears connected but isn't
- [ ] Audit logs track all detection attempts and results

---

## 🚀 Next Steps

1. Review this audit with stakeholders
2. Prioritize phases based on user impact
3. Implement Phase 1 (API contracts) first
4. Roll out empty state components (Phase 2)
5. Systematically replace mocks (Phase 3)
6. Add audit logging (Phase 4)
7. Implement demo mode toggle (Phase 5)
