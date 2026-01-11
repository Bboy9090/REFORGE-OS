# Comprehensive Test Plan - Bobby's Workshop

## Test Execution Date: 2025-12-17

## Test Objectives

1. Verify all connection detection methods work correctly
2. Test every feature end-to-end
3. Validate API integrations
4. Check error handling and edge cases
5. Ensure Truth-First principles are followed

---

## 1. CONNECTION DETECTION TESTS

### 1.1 Android Device Detection

- [ ] **ADB Detection** (`use-android-devices.ts`)
  - Endpoint: `GET /api/android-devices/all`
  - Expected: Real devices or empty array (no mock data)
  - Error handling: Backend unavailable shows clear message
  
- [ ] **Fastboot Detection** (`use-android-devices.ts`)
  - Endpoint: `GET /api/fastboot/devices`
  - Expected: Real bootloader devices or empty
  - No fake "Connected" states

- [ ] **Device State Tracking**
  - States: `device`, `unauthorized`, `offline`, `bootloader`
  - Must be based on actual ADB/Fastboot output
  - No automatic state promotion

### 1.2 USB Device Detection

- [ ] **WebUSB Detection** (`use-device-detection.ts`)
  - Uses browser WebUSB API
  - Real-time connect/disconnect events
  - Vendor identification (Google, Samsung, etc.)
  
- [ ] **Enhanced USB Classification** (`usbClassDetection.ts`)
  - USB class detection (MTP, PTP, ADB, Mass Storage)
  - Mobile device identification
  - No placeholder device lists

### 1.3 iOS Device Detection

- [ ] **libimobiledevice Integration**
  - Endpoint: `GET /api/ios/scan`
  - Detect DFU, Recovery, Normal modes
  - Real detection or empty state

### 1.4 Multi-Protocol Probing (`probeDevice.ts`)

- [ ] **Unified Device Probing**
  - Correlate devices across ADB/Fastboot/USB/WebUSB
  - Capability analysis per device
  - Device mode recognition (bootloader/recovery/normal)

---

## 2. BACKEND API TESTS

### 2.1 System Tools Check

- [ ] **Tool Availability** (`/api/system-tools`)
  - Detect: ADB, Fastboot, libimobiledevice, Rust, Node, Python
  - Return version numbers if installed
  - Clear error if backend not running

### 2.2 Device Endpoints

- [ ] **Android Devices** (`/api/android-devices/all`)
  - Returns: `{ devices: [...], sources: { adb: {...}, fastboot: {...} } }`
  - Empty devices array if none connected
  
- [ ] **iOS Devices** (`/api/ios/scan`)
  - Returns: Array of iOS devices with mode information
  - Empty if no devices
  
- [ ] **USB Devices** (WebUSB - browser API, no backend needed)
  - Direct browser API access
  - Permission-based access

### 2.3 Flash Operation Endpoints

- [ ] **Flash History** (`/api/flash/history`)
  - Real operation log or empty array
  - No fake operations
  
- [ ] **Start Flash** (`POST /api/flash/start`)
  - Requires real device
  - Returns operation ID
  - Fails gracefully if tools missing

### 2.4 WebSocket Endpoints

- [ ] **Flash Progress** (`ws://localhost:3001/ws/flash`)
  - Real-time progress streaming
  - Connection status clearly shown
  
- [ ] **Hotplug Events** (`ws://localhost:3001/ws/hotplug`)
  - Device connect/disconnect events
  - Shows "No events" when empty
  
- [ ] **Correlation Tracking** (`ws://localhost:3001/ws/correlation`)
  - Device state correlation across protocols
  - Empty state if no activity

---

## 3. FEATURE TESTS

### 3.1 Multi-Brand Flash Dashboard

- [ ] **Samsung Odin**
  - Detect Download Mode
  - Real flash or disabled if no device
  
- [ ] **Xiaomi EDL**
  - Detect EDL mode (Qualcomm 9008)
  - No fake device connections
  
- [ ] **Universal Fastboot**
  - Support: Google, OnePlus, Motorola, ASUS
  - Real device detection via `fastboot devices`
  
- [ ] **iOS DFU**
  - checkra1n/palera1n integration
  - Real DFU mode detection
  
- [ ] **MediaTek SP Flash Tool**
  - Preloader/VCOM detection
  - Scatter file validation

### 3.2 Pandora Codex Control Room

- [ ] **Flash Operations Monitor**
  - Real operation queue or empty state
  - No hardcoded operations
  
- [ ] **Performance Monitor**
  - Shows "Not monitoring" when inactive
  - Real metrics when active
  
- [ ] **Automated Testing**
  - Runs real tests or shows empty
  - No fake test results
  
- [ ] **Hotplug Monitor**
  - WebSocket-based event stream
  - Shows "No events recorded" when empty

### 3.3 Security Lock Education

- [ ] **FRP Detection** (`POST /api/frp/detect`)
  - Real ADB-based detection
  - Confidence scoring based on evidence
  - Educational resources (not bypass tools)
  
- [ ] **MDM Detection** (`POST /api/mdm/detect`)
  - Enterprise profile detection
  - Shows legitimate removal procedures
  - No unauthorized bypass methods

### 3.4 Trapdoor Module (Bobby's Secret Workshop)

- [ ] **Workflow System**
  - JSON-defined workflows
  - Real execution or disabled
  - Admin authorization required
  
- [ ] **Shadow Logging**
  - AES-256 encrypted audit logs
  - Append-only for compliance
  - No fake log entries
  
- [ ] **Trapdoor API** (`/api/trapdoor/*`)
  - Secured endpoints (admin only)
  - Real tool execution or error
  - Clear authorization tracking

### 3.5 Device Diagnostics

- [ ] **Battery Health**
  - Real ADB query or unavailable
  - No fake battery percentages
  
- [ ] **Storage Health**
  - SMART data from real devices
  - Empty if not available
  
- [ ] **Thermal Monitoring**
  - Real temperature readings
  - Safety thresholds enforced
  
- [ ] **Sensor Testing**
  - Real sensor data or disabled
  - No simulated readings

### 3.6 BootForge USB (Rust Backend)

- [ ] **Imaging Engine**
  - Real disk imaging or unavailable
  - Progress tracking
  
- [ ] **USB Transport Layer**
  - Low-level USB communication
  - Vendor-specific protocols
  
- [ ] **Thermal Monitoring**
  - Hardware temperature sensors
  - Real-time tracking

---

## 4. UI COMPONENT TESTS

### 4.1 Demo Mode Behavior

- [ ] **Demo Mode Banner**
  - Shows when backend unavailable
  - Dismissable but persistent
  - Clear "Connect Backend" action
  
- [ ] **Demo Data Labeling**
  - All simulated data has `[DEMO]` prefix
  - Clear visual distinction
  - Real operations disabled

### 4.2 Empty States

- [ ] **PandoraFlashPanel**
  - "No operations queued" when empty
  - EmptyState component used
  
- [ ] **PandoraTestsPanel**
  - "No test results yet" when empty
  - Tests labeled `[DEMO]` in demo mode
  
- [ ] **PandoraMonitorPanel**
  - "Not monitoring" when inactive
  - Real metrics when active
  
- [ ] **PandoraHotplugPanel**
  - "No events recorded" when empty
  - WebSocket connection status shown

### 4.3 Error States

- [ ] **Backend Connection Error**
  - Clear message when API unavailable
  - Retry option provided
  - No silent failures
  
- [ ] **Tool Not Installed**
  - Specific error: "ADB not installed"
  - Installation instructions
  - No fake success
  
- [ ] **Device Authorization Required**
  - Clear prompt to authorize device
  - "Unauthorized" state shown
  - No automatic promotion

### 4.4 Loading States

- [ ] **Device Scanning**
  - Loading indicator shown
  - Timeout after reasonable duration
  - Clear completion message
  
- [ ] **Flash Progress**
  - Real-time progress bar
  - Percentage and transfer speed
  - WebSocket-based updates

---

## 5. TRUTH-FIRST COMPLIANCE TESTS

### 5.1 Never Show Fake Data

- [ ] No hardcoded device lists in production
- [ ] No fake "Connected" states without evidence
- [ ] No simulated test results
- [ ] No placeholder success messages

### 5.2 Clear Demo Mode Indication

- [ ] Demo mode banner persistent
- [ ] All demo data labeled `[DEMO]`
- [ ] Real operations disabled in demo
- [ ] Backend status transparent

### 5.3 Evidence-Based States

- [ ] Device states from real tool output
- [ ] Confidence scoring based on evidence
- [ ] Audit logging for state changes
- [ ] No automatic state promotion

### 5.4 Error Transparency

- [ ] Backend errors shown to user
- [ ] Tool installation status clear
- [ ] Device authorization status clear
- [ ] No error masking with fake data

---

## 6. INTEGRATION TESTS

### 6.1 Frontend + Backend

- [ ] Frontend handles backend unavailable
- [ ] API contract adherence
- [ ] WebSocket reconnection logic
- [ ] CORS and security headers

### 6.2 Multi-Component Coordination

- [ ] DeviceSidebar updates on detection
- [ ] Flash panel shows real operations
- [ ] Hotplug events trigger UI updates
- [ ] Correlation tracking works across components

### 6.3 Workflow Execution

- [ ] Trapdoor workflows execute correctly
- [ ] Progress tracking accurate
- [ ] Error handling at each step
- [ ] Shadow logging records all actions

---

## 7. BUILD & CI TESTS

### 7.1 Build Process

```bash
npm run build
```

- [ ] TypeScript compilation succeeds
- [ ] Vite build completes
- [ ] No build warnings
- [ ] Bundle size acceptable

### 7.2 Linting

```bash
npm run lint
```

- [ ] ESLint passes
- [ ] No unused imports
- [ ] Code style consistent

### 7.3 Unit Tests

```bash
npm run test
```

- [ ] Workflow engine tests pass
- [ ] Shadow logger tests pass
- [ ] ADB library tests pass
- [ ] Fastboot library tests pass

### 7.4 Integration Tests

```bash
npm run test:integration
```

- [ ] Trapdoor API tests pass
- [ ] Backend integration tests pass
- [ ] WebSocket tests pass

### 7.5 E2E Tests

```bash
npm run test:e2e
```

- [ ] Workflow execution E2E test
- [ ] Device detection E2E test
- [ ] Flash operation E2E test

---

## 8. SECURITY & COMPLIANCE TESTS

### 8.1 Authorization Checks

- [ ] Trapdoor requires admin auth
- [ ] Shadow logs admin-only access
- [ ] Sensitive operations logged
- [ ] Authorization bypass prevention

### 8.2 Data Encryption

- [ ] Shadow logs AES-256 encrypted
- [ ] No secrets in code
- [ ] Environment variables used correctly
- [ ] API keys not committed

### 8.3 Audit Logging

- [ ] All sensitive operations logged
- [ ] Logs are append-only
- [ ] 90-day retention enforced
- [ ] Export functionality works

### 8.4 Sandbox Isolation (Trapdoor)

- [ ] Firejail sandboxing active
- [ ] No network access from tools
- [ ] Private /tmp directories
- [ ] Capabilities dropped

---

## 9. PERFORMANCE TESTS

### 9.1 Device Detection Speed

- [ ] USB detection < 500ms
- [ ] ADB scan < 2s
- [ ] Fastboot scan < 2s
- [ ] iOS scan < 3s

### 9.2 WebSocket Latency

- [ ] Flash progress < 100ms latency
- [ ] Hotplug events < 50ms latency
- [ ] Correlation updates < 200ms latency

### 9.3 UI Responsiveness

- [ ] Tab switching < 100ms
- [ ] Device list updates < 200ms
- [ ] Panel rendering < 500ms

---

## 10. CROSS-PLATFORM TESTS

### 10.1 Windows

- [ ] ADB/Fastboot detection works
- [ ] USB device detection works
- [ ] Backend server starts correctly
- [ ] Build process completes

### 10.2 macOS

- [ ] libimobiledevice integration
- [ ] iOS device detection
- [ ] Unix commands work
- [ ] Build process completes

### 10.3 Linux

- [ ] All system tools detected
- [ ] Firejail sandboxing works
- [ ] USB permissions correct
- [ ] Build process completes

---

## TEST EXECUTION CHECKLIST

### Pre-Test Setup

- [ ] Install dependencies: `npm install`
- [ ] Start backend: `npm run server:dev`
- [ ] Start frontend: `npm run dev`
- [ ] Connect test devices (if available)

### Test Execution

- [ ] Run unit tests: `npm run test`
- [ ] Run integration tests: `npm run test:integration`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Manual UI testing in browser
- [ ] Backend API endpoint testing

### Post-Test Verification

- [ ] Document test results
- [ ] Capture screenshots of edge cases
- [ ] Log any failures with reproduction steps
- [ ] Update documentation if needed

---

## SUCCESS CRITERIA

### Must Pass (Critical)

- ✅ All unit tests passing
- ✅ No fake device data in production
- ✅ Backend unavailable handled gracefully
- ✅ Demo mode clearly indicated
- ✅ Empty states shown correctly
- ✅ Error states actionable

### Should Pass (High Priority)

- ⚠️ Integration tests passing
- ⚠️ Build with no warnings
- ⚠️ Lint with no errors
- ⚠️ Performance targets met

### Nice to Have (Medium Priority)

- 💡 E2E tests automated
- 💡 Cross-platform verified
- 💡 Security audit complete

---

## TEST REPORT TEMPLATE

### Test Session

- **Date**: YYYY-MM-DD
- **Tester**: Name
- **Environment**: OS, Browser, Backend Version

### Results Summary

- **Total Tests**: X
- **Passed**: Y
- **Failed**: Z
- **Pass Rate**: YY%

### Failed Tests

1. **Test Name**: Description
   - **Expected**: ...
   - **Actual**: ...
   - **Reproduction Steps**: ...

### Notes

- Additional observations
- Suggestions for improvement
- Blockers identified

---

## NEXT STEPS AFTER TESTING

1. **Fix Critical Failures** - Priority 1
2. **Address Truth-First Violations** - Priority 1
3. **Improve Error Handling** - Priority 2
4. **Enhance Empty States** - Priority 2
5. **Optimize Performance** - Priority 3
6. **Cross-Platform Testing** - Priority 3

---

**Status**: Ready for execution  
**Last Updated**: 2025-12-17  
**Next Review**: After test execution completion
