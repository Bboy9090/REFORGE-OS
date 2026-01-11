# 📋 MODULE STRUCTURE MAP
## Complete Feature & API Grouping Reference for GUI Development

This document provides a comprehensive mapping of all modules, features, and their groupings to help build the new GUI environment.

---

## 🎯 API MODULES (`/api/v1/*`)

### **Core System**
- **`/api/v1/health`** - Health check endpoint
- **`/api/v1/ready`** - Server readiness, version, feature flags
- **`/api/v1/routes`** - Route registry (dev-only)
- **`/api/v1/system-tools`** - System tool detection (Rust, Node, Python, ADB, Fastboot)

### **Device Detection & Management**
- **`/api/v1/adb/*`** - Android Debug Bridge operations
  - `/api/v1/adb/devices` - List ADB devices
  - `/api/v1/adb/command` - Execute ADB commands
  - `/api/v1/adb/trigger-auth` - Trigger device authorization
  - `/api/v1/adb/advanced/*` - Advanced ADB features (recovery, sideload, logcat)
- **`/api/v1/fastboot/*`** - Fastboot operations
  - `/api/v1/fastboot/devices` - List Fastboot devices
  - `/api/v1/fastboot/device-info` - Get device information
  - `/api/v1/fastboot/flash` - Flash partition
  - `/api/v1/fastboot/unlock` - Unlock bootloader
  - `/api/v1/fastboot/erase` - Erase partition
  - `/api/v1/fastboot/reboot` - Reboot device
- **`/api/v1/ios/*`** - iOS device operations
  - `/api/v1/ios/scan` - Scan for iOS devices
  - `/api/v1/ios/dfu/*` - DFU mode operations
  - `/api/v1/ios/libimobiledevice/*` - Full libimobiledevice suite
- **`/api/v1/bootforgeusb/*`** - BootForgeUSB low-level operations
  - `/api/v1/bootforgeusb/scan` - Scan USB devices
  - `/api/v1/bootforgeusb/status` - Get device status

### **Security & Detection**
- **`/api/v1/frp/*`** - Factory Reset Protection
  - `/api/v1/frp/detect` - Detect FRP lock status
- **`/api/v1/mdm/*`** - Mobile Device Management
  - `/api/v1/mdm/detect` - Detect MDM profiles
- **`/api/v1/security/root-detection`** - Root detection
- **`/api/v1/security/bootloader-status`** - Bootloader unlock status

### **Flashing Operations**
- **`/api/v1/flash/*`** - Universal flash operations
  - `/api/v1/flash/devices` - List devices available for flashing
  - `/api/v1/flash/devices/:serial` - Get device details
  - `/api/v1/flash/devices/:serial/partitions` - Get partition list
  - `/api/v1/flash/validate-image` - Validate firmware image
  - `/api/v1/flash/start` - Start flash operation
  - `/api/v1/flash/pause/:jobId` - Pause flash job
  - `/api/v1/flash/resume/:jobId` - Resume flash job
  - `/api/v1/flash/cancel/:jobId` - Cancel flash job
  - `/api/v1/flash/status/:jobId` - Get flash job status
  - `/api/v1/flash/operations/active` - Get active flash operations
  - `/api/v1/flash/history` - Get flash history
- **`/api/v1/flash/odin/*`** - Samsung Odin flashing
  - `/api/v1/flash/odin/detect` - Detect Odin-compatible devices
  - `/api/v1/flash/odin/flash` - Execute Odin flash
- **`/api/v1/flash/mtk/*`** - MediaTek SP Flash Tool
  - `/api/v1/flash/mtk/detect` - Detect MTK devices
  - `/api/v1/flash/mtk/flash` - Execute MTK flash
- **`/api/v1/flash/edl/*`** - Qualcomm EDL flashing
  - `/api/v1/flash/edl/detect` - Detect EDL mode devices
  - `/api/v1/flash/edl/flash` - Execute EDL flash

### **Monitoring & Diagnostics**
- **`/api/v1/monitor/*`** - Device monitoring
  - `/api/v1/monitor` - Get available monitoring features
  - `/api/v1/monitor/performance/:serial` - Real-time performance metrics
- **`/api/v1/diagnostics/*`** - Device diagnostics
  - `/api/v1/diagnostics/hardware/:serial` - Hardware diagnostics
  - `/api/v1/diagnostics/battery/:serial` - Battery diagnostics
- **`/api/v1/tests/*`** - Automated testing
  - `/api/v1/tests/run` - Run tests
  - `/api/v1/tests/results` - Get test results

### **Firmware Management**
- **`/api/v1/firmware/*`** - Firmware library
  - `/api/v1/firmware` - Get firmware API info
  - `/api/v1/firmware/library/brands` - List firmware brands
  - `/api/v1/firmware/library/search` - Search firmware
  - `/api/v1/firmware/library/add` - Add firmware to library
  - `/api/v1/firmware/library/download` - Download firmware
  - `/api/v1/firmware/library/stats` - Get library statistics

### **Workflow & Catalog**
- **`/api/v1/catalog/*`** - Tool catalog
  - `/api/v1/catalog` - Get full catalog
  - `/api/v1/catalog/capabilities` - List capabilities
  - `/api/v1/catalog/tools` - List tools
  - `/api/v1/catalog/policies` - List policies
- **`/api/v1/operations/*`** - Operation execution
  - `/api/v1/operations/execute` - Execute operation
  - `/api/v1/operations/simulate` - Simulate operation

### **Secret Rooms (Trapdoor API)**
- **`/api/v1/trapdoor/*`** - Bobby's Secret Rooms (requires authentication)
  - `/api/v1/trapdoor` - Get Secret Rooms information
  - `/api/v1/trapdoor/status` - Get access status
  - `/api/v1/trapdoor/unlock/*` - Unlock Chamber
    - `/api/v1/trapdoor/unlock/bootloader` - Bootloader unlock
    - `/api/v1/trapdoor/unlock/frp` - FRP bypass
  - `/api/v1/trapdoor/workflows/*` - Workflow Engine
    - `/api/v1/trapdoor/workflows/execute` - Execute workflow
    - `/api/v1/trapdoor/workflows/templates` - Get workflow templates
  - `/api/v1/trapdoor/logs/*` - Shadow Archive
    - `/api/v1/trapdoor/logs/shadow` - Get shadow logs
    - `/api/v1/trapdoor/logs/analytics` - Get analytics

### **System Events**
- **`/api/v1/authorization/*`** - Authorization triggers
  - `/api/v1/authorization/triggers` - Get authorization triggers
- **`/api/v1/hotplug/*`** - USB hotplug events
  - `/api/v1/hotplug/events` - Get hotplug events
- **`/api/v1/standards/*`** - USB standards information

---

## 🎨 FRONTEND MODULES (`src/`)

### **Core Application**
- **`src/App.tsx`** - Main application entry point
- **`src/main.tsx`** - Application initialization

### **Layout Components**
- **`src/components/DashboardLayout.tsx`** - Main dashboard layout
- **`src/components/Sidebar.tsx`** - Navigation sidebar (if exists)
- **`src/components/Header.tsx`** - Top header bar (if exists)

### **Device Management Panels**
- **`FastbootFlashingPanel.tsx`** - Fastboot operations panel
- **`ADBPanel.tsx`** - ADB operations panel
- **`DeviceDetectionPanel.tsx`** - Device detection and listing
- **`DeviceInfoPanel.tsx`** - Device information display

### **Flashing Panels**
- **`FlashPanel.tsx`** - Universal flash operations
- **`FlashHistoryPanel.tsx`** - Flash operation history
- **`FlashStatusPanel.tsx`** - Active flash job status

### **iOS Panels**
- **`iOSDFUPanel.tsx`** - iOS DFU mode operations
- **`iOSDevicePanel.tsx`** - iOS device management
- **`JailbreakPanel.tsx`** - iOS jailbreak operations

### **Secret Rooms (Pandora's Room)**
- **`src/components/SecretRoom/PandorasRoom.tsx`** - Pandora's Room main component
- **`src/components/SecretRoom/BobbysTraproom.tsx`** - Bobby's Traproom component
- **`src/components/TrapdoorControlPanel.tsx`** - Trapdoor API control panel
- **`src/components/ShadowLogsViewer.tsx`** - Shadow logs viewer
- **`src/components/WorkflowExecutionConsole.tsx`** - Workflow execution console

### **Monitoring & Diagnostics**
- **`PerformanceMonitorPanel.tsx`** - Real-time performance monitoring
- **`DiagnosticsPanel.tsx`** - Device diagnostics
- **`BatteryDiagnosticsPanel.tsx`** - Battery health diagnostics

### **Firmware Management**
- **`FirmwareLibraryPanel.tsx`** - Firmware library browser
- **`FirmwareDownloadPanel.tsx`** - Firmware download manager

### **Security Panels**
- **`FRPPanel.tsx`** - FRP detection and bypass
- **`MDMPanel.tsx`** - MDM detection and removal
- **`RootDetectionPanel.tsx`** - Root status detection
- **`BootloaderStatusPanel.tsx`** - Bootloader status

### **Workflow Panels**
- **`WorkflowBuilderPanel.tsx`** - Visual workflow builder
- **`WorkflowExecutionPanel.tsx`** - Workflow execution interface
- **`WorkflowTemplatesPanel.tsx`** - Workflow template browser

### **System Information**
- **`SystemToolsPanel.tsx`** - System tools status
- **`LogViewerPanel.tsx`** - Log file viewer
- **`SettingsPanel.tsx`** - Application settings

---

## 📦 FEATURE GROUPINGS

### **1. Device Detection & Connection**
**Group:** `device-management`
**Modules:**
- ADB device detection
- Fastboot device detection
- iOS device detection
- BootForgeUSB scanning
- USB hotplug events
- Device correlation

**API Endpoints:**
- `/api/v1/adb/devices`
- `/api/v1/fastboot/devices`
- `/api/v1/ios/scan`
- `/api/v1/bootforgeusb/scan`
- `/api/v1/hotplug/events`

**UI Components:**
- `DeviceDetectionPanel`
- `DeviceInfoPanel`
- `ADBPanel`
- `iOSDevicePanel`

---

### **2. Flashing Operations**
**Group:** `flashing`
**Modules:**
- Universal flash operations
- Samsung Odin flashing
- MediaTek SP Flash
- Qualcomm EDL flashing
- Flash job management
- Flash history

**API Endpoints:**
- `/api/v1/flash/*`
- `/api/v1/flash/odin/*`
- `/api/v1/flash/mtk/*`
- `/api/v1/flash/edl/*`
- `/api/v1/fastboot/flash`

**UI Components:**
- `FlashPanel`
- `FastbootFlashingPanel`
- `FlashHistoryPanel`
- `FlashStatusPanel`

---

### **3. Security & Bypass**
**Group:** `security`
**Modules:**
- FRP detection/bypass
- MDM detection/removal
- Root detection
- Bootloader status
- Security locks

**API Endpoints:**
- `/api/v1/frp/*`
- `/api/v1/mdm/*`
- `/api/v1/security/root-detection`
- `/api/v1/security/bootloader-status`

**UI Components:**
- `FRPPanel`
- `MDMPanel`
- `RootDetectionPanel`
- `BootloaderStatusPanel`

---

### **4. iOS Operations**
**Group:** `ios`
**Modules:**
- iOS device detection
- DFU mode operations
- Jailbreak operations
- libimobiledevice integration
- iOS diagnostics

**API Endpoints:**
- `/api/v1/ios/*`
- `/api/v1/ios/dfu/*`
- `/api/v1/ios/libimobiledevice/*`

**UI Components:**
- `iOSDevicePanel`
- `iOSDFUPanel`
- `JailbreakPanel`

---

### **5. Monitoring & Diagnostics**
**Group:** `monitoring`
**Modules:**
- Performance monitoring
- Hardware diagnostics
- Battery diagnostics
- Real-time metrics
- Device health checks

**API Endpoints:**
- `/api/v1/monitor/*`
- `/api/v1/monitor/performance/*`
- `/api/v1/diagnostics/*`
- `/api/v1/tests/*`

**UI Components:**
- `PerformanceMonitorPanel`
- `DiagnosticsPanel`
- `BatteryDiagnosticsPanel`

---

### **6. Firmware Management**
**Group:** `firmware`
**Modules:**
- Firmware library
- Firmware search
- Firmware download
- Brand management
- Firmware statistics

**API Endpoints:**
- `/api/v1/firmware/*`
- `/api/v1/firmware/library/*`

**UI Components:**
- `FirmwareLibraryPanel`
- `FirmwareDownloadPanel`

---

### **7. Workflow Automation**
**Group:** `workflows`
**Modules:**
- Workflow execution
- Workflow templates
- Workflow builder
- Operation catalog
- Operation simulation

**API Endpoints:**
- `/api/v1/catalog/*`
- `/api/v1/operations/*`
- `/api/v1/trapdoor/workflows/*`

**UI Components:**
- `WorkflowBuilderPanel`
- `WorkflowExecutionPanel`
- `WorkflowTemplatesPanel`
- `WorkflowExecutionConsole`

---

### **8. Secret Rooms (Trapdoor)**
**Group:** `secret-rooms`
**Modules:**
- Unlock Chamber (bootloader/FRP bypass)
- Flash Forge (advanced flashing)
- Jailbreak Sanctum (iOS manipulation)
- Root Vault (root management)
- Bypass Laboratory (security bypasses)
- Workflow Engine (automation)
- Shadow Archive (audit logs)

**API Endpoints:**
- `/api/v1/trapdoor/*`
- `/api/v1/trapdoor/unlock/*`
- `/api/v1/trapdoor/workflows/*`
- `/api/v1/trapdoor/logs/*`

**UI Components:**
- `PandorasRoom`
- `BobbysTraproom`
- `TrapdoorControlPanel`
- `ShadowLogsViewer`

**Authentication Required:** Yes (X-Secret-Room-Passcode header)

---

### **9. System Tools**
**Group:** `system`
**Modules:**
- System tool detection
- Tool installation status
- Platform tools management
- System information

**API Endpoints:**
- `/api/v1/system-tools`
- `/api/v1/ready`

**UI Components:**
- `SystemToolsPanel`
- `SettingsPanel`

---

## 🗂️ FILE STRUCTURE SUMMARY

```
src/
├── components/
│   ├── SecretRoom/
│   │   ├── PandorasRoom.tsx
│   │   └── BobbysTraproom.tsx
│   ├── DashboardLayout.tsx
│   ├── FastbootFlashingPanel.tsx
│   ├── ADBPanel.tsx
│   ├── DeviceDetectionPanel.tsx
│   ├── FlashPanel.tsx
│   ├── iOSDFUPanel.tsx
│   ├── TrapdoorControlPanel.tsx
│   ├── ShadowLogsViewer.tsx
│   └── ... (other panels)
├── lib/
│   ├── apiConfig.ts          # API endpoint configuration
│   ├── api-envelope.ts       # API envelope types
│   └── backend-health.ts     # Backend health monitoring
└── hooks/
    └── use-api-client.ts     # API client hook

server/
├── routes/
│   └── v1/
│       ├── adb.js
│       ├── fastboot.js
│       ├── ios/
│       ├── flash/
│       ├── trapdoor/
│       ├── diagnostics/
│       ├── monitor/
│       └── ... (other modules)
└── middleware/
    ├── api-envelope.js
    ├── api-versioning.js
    ├── rate-limiter.js
    └── trapdoor-auth.js
```

---

## 🎯 RECOMMENDED GUI GROUPING

### **Main Navigation Sections:**

1. **Dashboard** (`/dashboard`)
   - Device overview
   - Quick actions
   - System status

2. **Devices** (`/devices`)
   - Device detection
   - Device information
   - Connection management

3. **Flashing** (`/flashing`)
   - Universal flash
   - Odin (Samsung)
   - MTK (MediaTek)
   - EDL (Qualcomm)
   - Fastboot

4. **iOS** (`/ios`)
   - Device detection
   - DFU operations
   - Jailbreak
   - Diagnostics

5. **Security** (`/security`)
   - FRP detection/bypass
   - MDM detection/removal
   - Root detection
   - Bootloader status

6. **Monitoring** (`/monitoring`)
   - Performance metrics
   - Hardware diagnostics
   - Battery health
   - Real-time monitoring

7. **Firmware** (`/firmware`)
   - Library browser
   - Search & download
   - Brand management

8. **Workflows** (`/workflows`)
   - Workflow builder
   - Template library
   - Execution console
   - Catalog browser

9. **Secret Rooms** (`/secret-rooms`) 🔐
   - Unlock Chamber
   - Flash Forge
   - Jailbreak Sanctum
   - Root Vault
   - Bypass Laboratory
   - Workflow Engine
   - Shadow Archive
   - *Requires authentication*

10. **Settings** (`/settings`)
    - System tools
    - Application settings
    - Logs viewer
    - API configuration

---

## 🔌 WEBSOCKET ENDPOINTS

- **`ws://localhost:3001/ws/device-events`** - Device connection/disconnection events
- **`ws://localhost:3001/ws/correlation`** - Device correlation tracking
- **`ws://localhost:3001/ws/analytics`** - Real-time analytics

---

## 📝 NOTES FOR GUI DEVELOPMENT

1. **API Versioning:** All endpoints are under `/api/v1/*`
2. **Envelope Format:** All responses use `{ok: true/false, data: {...}, meta: {...}}` format
3. **Authentication:** Secret Rooms require `X-Secret-Room-Passcode` header
4. **Rate Limiting:** Destructive operations have rate limiting
5. **Device Locking:** Only one operation per device at a time
6. **Confirmation Gates:** Destructive operations require typed confirmation
7. **Shadow Logging:** All Secret Room operations are audit-logged

---

This structure map should help you organize your new GUI environment! 🚀

