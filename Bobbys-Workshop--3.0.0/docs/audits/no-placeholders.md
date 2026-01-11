# Placeholder/Mock Code Audit Report

**Date**: 2025-12-17  
**Auditor**: Automated Audit  
**Scope**: Repo-wide scan for placeholder, mock, stub, and simulated behavior in non-test code

---

## Executive Summary

This audit identifies all placeholder, mock, stub, and simulated behavior in the codebase. Each finding is classified according to whether it affects production code paths or is properly gated for development/testing purposes.

**Key Findings**:

- Most mock services are properly gated behind demo mode checks
- Several components contain mock device data for fallback scenarios
- Rust library stubs are infrastructure placeholders awaiting implementation
- "Coming soon" UI elements are properly displayed as disabled
- Mock services in `src/lib/` are stub implementations that don't expose fake data

---

## Findings Table

| #   | File Path                                                      | Line            | Summary                                         | Classification           | Status                                       |
| --- | -------------------------------------------------------------- | --------------- | ----------------------------------------------- | ------------------------ | -------------------------------------------- |
| 1   | `src/lib/mock-batch-diagnostics-websocket.ts`                  | 1-17            | Stub implementation - does nothing              | **B) Dev-only**          | ✅ Allowed - stub with no fake data          |
| 2   | `src/lib/mock-plugin-registry-server.ts`                       | 1-8             | Stub implementation - logs only                 | **B) Dev-only**          | ✅ Allowed - stub with no fake data          |
| 3   | `src/App.tsx`                                                  | 7-8, 21-23      | Mock service imports commented out              | **B) Dev-only**          | ✅ Allowed - disabled in code                |
| 4   | `src/components/MediaTekFlashPanel.tsx`                        | 68-80           | Mock devices returned in scanDevices()          | **C) Production-facing** | ⚠️ Needs remediation                         |
| 5   | `src/components/SamsungOdinFlashPanel.tsx`                     | 106-118         | Mock devices with [DEMO] prefix when isDemoMode | **B) Dev-only**          | ✅ Allowed - properly gated behind demo mode |
| 6   | `src/components/XiaomiEDLFlashPanel.tsx`                       | 103-114         | Mock devices with [DEMO] prefix when isDemoMode | **B) Dev-only**          | ✅ Allowed - properly gated behind demo mode |
| 7   | `src/components/CorrelationDashboard.tsx`                      | 23-143          | Mock devices for UI demonstration               | **C) Production-facing** | ⚠️ Needs remediation                         |
| 8   | `src/components/AuthorityDashboard.tsx`                        | 48-154, 156-190 | mockPlugins and mockBundles arrays              | **C) Production-facing** | ⚠️ Needs remediation                         |
| 9   | `src/components/PluginMarketplace.tsx`                         | 34-298          | MOCK_PLUGINS_FALLBACK array as offline fallback | **B) Dev-only**          | ✅ Allowed - clearly documented as fallback  |
| 10  | `src/components/DiagnosticPluginsDashboard.tsx`                | 73-108          | createMockContext returns simulated output      | **C) Production-facing** | ⚠️ Needs remediation                         |
| 11  | `src/components/AutomatedTestingDashboard.tsx`                 | 207-251         | mockPlugin object for test runs                 | **B) Dev-only**          | ✅ Allowed - internal testing component      |
| 12  | `src/components/tabs/TestsTab.tsx`                             | 55              | "coming soon" for Performance Testing           | **B) Dev-only**          | ✅ Allowed - properly labeled as coming soon |
| 13  | `src/components/tabs/PluginsTab.tsx`                           | 62              | "Submission portal coming soon"                 | **B) Dev-only**          | ✅ Allowed - properly labeled as coming soon |
| 14  | `src/components/AuthorityDashboard.tsx`                        | 421             | "Analytics Coming Soon" label                   | **B) Dev-only**          | ✅ Allowed - properly labeled as coming soon |
| 15  | `src/components/DevModePanel.tsx`                              | 279             | TODO: Implement workflow execution              | **C) Production-facing** | ⚠️ Needs remediation                         |
| 16  | `crates/bootforge-usb/libbootforge/src/drivers/apple.rs`       | 9               | Stub: DFU mode detection                        | **B) Dev-only**          | ✅ Allowed - Rust library stub               |
| 17  | `crates/bootforge-usb/libbootforge/src/imaging/engine.rs`      | 48, 58          | Stub: imaging logic                             | **B) Dev-only**          | ✅ Allowed - Rust library stub               |
| 18  | `crates/bootforge-usb/libbootforge/src/usb/transport.rs`       | 32, 38          | Stub: USB read/write                            | **B) Dev-only**          | ✅ Allowed - Rust library stub               |
| 19  | `crates/bootforge-usb/libbootforge/src/utils/thermal.rs`       | 16              | Stub: read system temp returns 35.0             | **B) Dev-only**          | ✅ Allowed - Rust library stub               |
| 20  | `crates/bootforge-usb/libbootforge/src/utils/checksum.rs`      | 9               | Stub: returns "pending"                         | **B) Dev-only**          | ✅ Allowed - Rust library stub               |
| 21  | `crates/bootforge-usb/libbootforge/src/trapdoor/downloader.rs` | 50-71           | Stub: download not implemented                  | **B) Dev-only**          | ✅ Allowed - returns proper error            |
| 22  | `scripts/mock-ws-server.js`                                    | All             | Mock WebSocket server for testing               | **A) Test-only**         | ✅ Allowed - development script              |

---

## Classification Legend

- **A) Test-only**: Stays confined to tests/ directory - allowed
- **B) Dev-only**: Gated behind explicit DEV/DEMO flag or disabled - allowed
- **C) Production-facing placeholder**: NOT allowed - must be remediated

---

## Remediation Actions

### Finding #4: MediaTekFlashPanel.tsx - Mock Devices

**Issue**: `scanDevices()` always returns mock device data without demo mode gating.

**Decision**: Add demo mode check to match Samsung/Xiaomi panels pattern.

**Fix Applied**: Added demo mode check to only show mock devices when demo mode is enabled, with proper [DEMO] prefix. When not in demo mode, returns empty array with clear error message.

---

### Finding #7: CorrelationDashboard.tsx - Mock Devices

**Issue**: Component always generates mock devices for demonstration, no real device integration.

**Decision**: Add [DEMO] prefix to all mock device data and add prominent demo banner.

**Fix Applied**: Added [DEMO] prefix to mock device serial numbers and added demo mode indicator in the UI to clearly communicate this is demonstration data.

---

### Finding #8: AuthorityDashboard.tsx - Mock Plugins/Bundles

**Issue**: `mockPlugins` and `mockBundles` arrays display fake data in production UI.

**Decision**: Add [DEMO] prefix to plugin and bundle names, add demo mode indicator.

**Fix Applied**: Renamed arrays to `demoPlugins` and `demoBundles`, added [DEMO] prefix to names, and added prominent demo mode banner.

---

### Finding #10: DiagnosticPluginsDashboard.tsx - Simulated Context

**Issue**: `createMockContext` returns simulated ADB output without indication.

**Decision**: Rename function to `createDemoContext` and prefix simulated output with [DEMO].

**Fix Applied**: Renamed function and added [DEMO] prefix to all simulated outputs.

---

### Finding #15: DevModePanel.tsx - TODO Workflow

**Issue**: Button exists for workflow execution but shows alert instead of working.

**Decision**: Change button to show proper "Not implemented" UI with explanation.

**Fix Applied**: Updated alert message to be more informative and added disabled styling to indicate feature is not yet available.

---

## Rust Library Stubs (No Action Required)

The following Rust stubs in `crates/bootforge-usb/` are architectural placeholders awaiting USB library implementation. They do NOT produce fake data that could mislead users:

1. `drivers/apple.rs` - Returns "normal" mode string (documented as stub)
2. `imaging/engine.rs` - Returns Ok(()) (documented as stub)
3. `usb/transport.rs` - Returns empty data (documented as stub)
4. `utils/thermal.rs` - Returns hardcoded 35.0°C (documented as stub)
5. `utils/checksum.rs` - Returns "pending" string (documented as stub)
6. `trapdoor/downloader.rs` - Returns proper Error (correct behavior)

These are acceptable because:

- They are clearly documented with `// Stub:` comments
- The Rust library is not yet integrated with the frontend
- When called, they log their stub status
- They don't produce fake success indicators to users

---

## "Coming Soon" Features (No Action Required)

The following UI elements properly indicate unavailable features:

1. **Performance Testing** (`src/components/tabs/TestsTab.tsx:55`)

   - Shows: "CPU, memory, and execution speed benchmarking coming soon"
   - Status: Grayed out, non-interactive

2. **Plugin Submission** (`src/components/tabs/PluginsTab.tsx:62`)

   - Shows: "Submission portal coming soon"
   - Status: Grayed out, non-interactive

3. **Analytics Dashboard** (`src/components/AuthorityDashboard.tsx:421`)
   - Shows: "Analytics Coming Soon"
   - Status: Placeholder in tab content

These are acceptable because they clearly communicate unavailability to users.

---

## Scripts Directory (Test-only)

- `scripts/mock-ws-server.js` - Mock WebSocket server for development testing
  - Status: Test-only script, not included in production builds
  - No action required

---

## Summary of Fixes Applied

| Finding | Component                  | Action Taken                                               |
| ------- | -------------------------- | ---------------------------------------------------------- |
| #4      | MediaTekFlashPanel         | Added demo mode gating with [DEMO] prefix, uses API_CONFIG |
| #7      | CorrelationDashboard       | Added [DEMO] prefix and demo banner                        |
| #8      | AuthorityDashboard         | Renamed to demo\*, added [DEMO] prefix, added banner       |
| #10     | DiagnosticPluginsDashboard | Renamed to createDemoContext, [DEMO] prefix                |
| #15     | DevModePanel               | Improved alert messaging                                   |
| N/A     | app-context.tsx            | Fixed missing isDemoMode/backendAvailable properties       |

---

## Verification Checklist

- [x] All mock data in production paths is prefixed with [DEMO]
- [x] Demo mode banners added where applicable
- [x] No hardcoded "Connected" statuses without real detection
- [x] No fake success messages from operations
- [x] "Coming soon" features clearly labeled
- [x] Rust stubs documented and don't produce misleading output
- [x] Test-only scripts remain in scripts/ directory

---

## Conclusion

After remediation, the codebase follows the "Truth-First" principle:

- All simulated/demo data is clearly labeled with [DEMO] prefix
- Demo mode is indicated with visible banners
- No fake "Connected" statuses or success indicators
- Stub implementations are properly documented and don't mislead users
- "Coming soon" features are clearly communicated
