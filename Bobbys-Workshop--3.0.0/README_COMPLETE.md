# Bobby's World - Workshop Toolkit

Professional repair diagnostic and flashing toolkit with comprehensive multi-brand support, educational security lock resources, and real-time device monitoring.

## 🎨 Industrial Operator UI Theme

The application uses a professional, field-ready aesthetic inspired by operator-grade equipment:

- **Background**: `#0B0F14` - Deep graphite black
- **Panels**: `#141922` - Elevated surfaces
- **Primary Accent**: `#2FD3FF` - Signal cyan
- **Success**: `#2ECC71` - Clean green
- **Warning**: `#F1C40F` - Amber
- **Error**: `#E74C3C` - Critical red
- **Typography**: Outfit (UI), Space Mono (code), Bebas Neue (headers)

Clean, authoritative, and honest about capabilities.

## 🚀 Core Features

### iOS DFU Flash Station

- **Real DFU mode detection** via libimobiledevice
- **checkra1n jailbreak support** with live progress tracking
- **palera1n integration** for newer iOS versions
- **WebSocket-based real-time console output**
- **Step-by-step DFU entry instructions**
- Device state detection: Normal / Recovery / DFU modes

**API Endpoints:**

- `GET /api/ios/scan` - Detect connected iOS devices
- `POST /api/ios/dfu/enter` - Automated DFU mode entry
- `WS ws://localhost:3001/ws/flash` - Live jailbreak progress

### MediaTek Flash Panel

- **SP Flash Tool integration** for MediaTek chipsets
- **Scatter file validation** and firmware image management
- **Preloader/VCOM detection** via USB scanning
- **Real-time flash progress** with pause/resume controls
- **Multi-image partition flashing** support

**Supported Chipsets:**

- MT6765 (Helio P35)
- MT6762 (Helio P22)
- MT6739, MT6737, MT6580
- And all other MediaTek platforms via SP Flash Tool

### Security Lock Education Panel

- **FRP (Factory Reset Protection) Detection**
  - Real ADB-based detection via `settings get secure android_id`
  - Confidence scoring: High / Medium / Low / Unknown
  - Device manufacturer and Android version identification
- **MDM (Mobile Device Management) Detection**

  - Enterprise profile identification
  - Organization name extraction
  - Restriction list analysis

- **Legitimate Recovery Resources**
  - Google Account Recovery guides
  - Manufacturer unlock procedures (with proof of purchase)
  - Official support documentation links
  - Enterprise IT contact procedures for MDM

**Educational Content:**

- What FRP is and why it exists (anti-theft protection)
- Legitimate recovery methods (account sign-in, recovery, proof of purchase)
- MDM profile explanation (enterprise device management)
- Legal notices and ethical guidelines

**API Endpoints:**

- `POST /api/frp/detect` - Detect FRP lock status
- `POST /api/mdm/detect` - Detect MDM profiles

### Multi-Brand Flash Dashboard

- **Samsung Odin Protocol** - Official download mode flashing
- **Xiaomi EDL (Emergency Download)** - Qualcomm EDL for bricked devices
- **Universal Fastboot** - Google, OnePlus, Motorola, ASUS support
- **iOS DFU** - checkra1n/palera1n jailbreak
- **MediaTek** - SP Flash Tool scatter-based flashing

### Pandora Codex Control Room

- **Flash Operations Monitor** - Queue management and history
- **Real-Time Performance** - Transfer speed, CPU, memory, USB utilization
- **Automated Testing** - Detection, performance, optimization validation
- **Industry Benchmarks** - USB-IF, JEDEC, Android standards reference
- **Live Hotplug Monitor** - Device connect/disconnect event stream

### Device Diagnostics

- **Real USB Detection** - ADB and Fastboot device enumeration
- **Battery Health** - Capacity percentage and cycle count
- **Storage Diagnostics** - SMART data and health status
- **Thermal Monitoring** - Temperature thresholds and safety checks
- **Sensor Testing** - Accelerometer, gyroscope, proximity, light

## 🔧 Backend API Architecture

### WebSocket Endpoints

```typescript
ws://localhost:3001/ws/flash - Flash progress streaming
ws://localhost:3001/ws/hotplug - Device hotplug events
ws://localhost:3001/ws/correlation - Device correlation tracking
```

### REST API Endpoints

#### iOS Flashing

```
GET  /api/ios/scan - Scan for iOS devices
POST /api/ios/dfu/enter - Enter DFU mode
POST /api/ios/jailbreak - Start jailbreak (checkra1n/palera1n)
```

#### Android Flashing

```
GET  /api/android/devices - List ADB devices
GET  /api/fastboot/devices - List Fastboot devices
POST /api/fastboot/flash - Flash partition
POST /api/odin/flash - Samsung Odin flash
POST /api/edl/flash - Xiaomi EDL flash
```

#### MediaTek

```
GET  /api/mtk/scan - Detect MTK devices
POST /api/mtk/flash - SP Flash Tool operation
GET  /api/mtk/preloader - Check preloader mode
```

#### Security Detection

```
POST /api/frp/detect - Detect FRP lock
POST /api/mdm/detect - Detect MDM profile
GET  /api/security/info - Device security info
```

#### Pandora Codex

```
GET  /api/flash/history - Flash operation history
POST /api/flash/start - Start flash operation
GET  /api/monitor/live - Live performance metrics
POST /api/monitor/start - Start monitoring
POST /api/tests/run - Run automated tests
GET  /api/standards - Industry benchmark standards
GET  /api/hotplug/events - Device hotplug event log
```

## 📦 Required System Dependencies

### Linux/macOS

```bash
# Android tools
sudo apt install android-tools-adb android-tools-fastboot

# iOS tools
sudo apt install libimobiledevice-utils usbmuxd

# MediaTek (manual installation)
wget https://spflashtool.com/download/SP_Flash_Tool_v5.2136_Linux.zip
```

### Windows

```powershell
# Install via Chocolatey
choco install adb fastboot

# iOS support (limited - requires iTunes/3uTools)
# MediaTek - Download SP Flash Tool from official site
```

## 🚨 Legal & Ethical Guidelines

### What This Toolkit DOES

✅ Detect device security states (FRP, MDM, bootloader locks)
✅ Provide educational resources for legitimate recovery
✅ Link to official manufacturer unlock procedures
✅ Support authorized repairs on owned devices
✅ Teach proper diagnostic and repair techniques

### What This Toolkit DOES NOT DO

❌ Bypass FRP on devices you don't own
❌ Remove MDM from enterprise-managed devices without authorization
❌ Enable device theft or unauthorized access
❌ Violate manufacturer warranties or terms of service
❌ Provide "hacking" or "cracking" tools

### Legal Notice

This software is intended for **authorized repair technicians only**. Use only on:

- Devices you personally own
- Devices where you have explicit owner authorization
- Devices in professional repair contexts with proper documentation

Bypassing security features on devices you do not own is **illegal** under:

- Computer Fraud and Abuse Act (CFAA) - United States
- Computer Misuse Act - United Kingdom
- Similar laws in most jurisdictions

**The developers assume no liability for misuse of this software.**

## 🛠️ Development

### Start Development Server

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

### Start Backend Services

```bash
# Start WebSocket flash progress server
node server/flash-ws.js

# Start API server
node server/api.js

# Start correlation tracking
node server/correlation-ws.js
```

## 📚 Documentation

- [iOS DFU Flash Guide](./docs/IOS_DFU_FLASH.md)
- [MediaTek SP Flash Tool Integration](./MEDIATEK_FLASH_GUIDE.md)
- [Security Lock Detection](./SECURITY_LOCK_EDU_GUIDE.md)
- [Pandora Codex Architecture](./PANDORA_CODEX_MASTER.md)
- [WebSocket API Reference](./WEBSOCKET_QUICKSTART.md)
- [Backend API Implementation](./BACKEND_API_IMPLEMENTATION.md)

## 🤝 Contributing

Contributions welcome for:

- Additional device brand support
- Educational repair guides
- Legitimate security unlock procedures
- Bug fixes and performance improvements

**We will not accept contributions that:**

- Enable unauthorized device access
- Bypass security without owner consent
- Violate terms of service or warranties
- Support illegal activities

## 📄 License

MIT License - See LICENSE file for details

This software is provided "as is" for educational and legitimate repair purposes only.

---

**Bobby's World** - Workshop Toolkit  
Professional repair diagnostics and educational resources  
Use responsibly. Repair ethically.
