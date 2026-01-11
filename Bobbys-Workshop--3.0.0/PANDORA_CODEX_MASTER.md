# Pandora Codex Control Room - Complete System Documentation

## 🎯 System Overview

Pandora Codex is a professional device management and forensics platform for Android and iOS devices, combining real hardware detection, performance monitoring, automated testing, and device correlation tracking. Built with a "ZERO ILLUSIONS" principle - all features are real, no placeholders.

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)

- **Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui components
- **State Management**: React hooks, WebSocket connections for real-time updates
- **Styling**: Oklch color system, Source Code Pro, Playfair Display, Montserrat fonts
- **Key Features**: Real-time device monitoring, correlation tracking, performance benchmarking

### Backend (Node.js + Express)

- **Server**: Express.js on port 3001
- **WebSockets**: Two separate channels for device-events and correlation tracking
- **Real System Integration**: Executes actual ADB, Fastboot, and system commands
- **APIs**: RESTful endpoints for all operations

### System Tools Integration

- **Android**: ADB (Android Debug Bridge), Fastboot
- **iOS**: libimobiledevice (idevice_id, ideviceinfo, idevicediagnostics)
- **USB Detection**: BootForgeUSB (Rust-based USB scanning library)
- **Build Tools**: Rust toolchain, Python 3, Node.js, Git

## 📁 Project Structure

```
/workspaces/spark-template/
├── .devcontainer/                  # Codespaces development container config
│   ├── devcontainer.json           # Container configuration
│   ├── onCreate.sh                 # Initial setup script
│   ├── postStartCommand.sh         # Post-start commands
│   └── refreshTools.sh             # Tool refresh script
│
├── src/
│   ├── components/                 # React components
│   │   ├── ui/                     # shadcn/ui components (40+ components)
│   │   ├── PandoraCodexControlRoom.tsx     # Main dashboard
│   │   ├── PandoraFlashPanel.tsx           # Flash operations
│   │   ├── PandoraMonitorPanel.tsx         # Performance monitoring
│   │   ├── PandoraTestsPanel.tsx           # Automated testing
│   │   ├── PandoraStandardsPanel.tsx       # Industry benchmarks
│   │   ├── PandoraHotplugPanel.tsx         # Live device hotplug
│   │   ├── BootForgeUSBScanner.tsx         # USB device scanning
│   │   ├── RealTimeCorrelationTracker.tsx  # Correlation tracking
│   │   ├── BobbyDevPanel.tsx               # Browser/system info
│   │   └── BobbyDevArsenalDashboard.tsx    # Tool status dashboard
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-device-detection.ts # System tool detection
│   │   ├── use-device-hotplug.ts   # WebSocket hotplug monitoring
│   │   ├── use-correlation-websocket.ts  # Correlation tracking
│   │   ├── use-android-devices.ts  # ADB/Fastboot device hooks
│   │   └── use-mobile.ts           # Mobile breakpoint detection
│   │
│   ├── lib/                        # Utility libraries
│   │   └── utils.ts                # Class name utilities (cn)
│   │
│   ├── App.tsx                     # Main application component
│   ├── index.css                   # Global styles & theme
│   └── main.tsx                    # Application entry point
│
├── server/                         # Backend API server
│   ├── index.js                    # Express server with all APIs
│   ├── package.json                # Server dependencies
│   └── README.md                   # Server documentation
│
├── scripts/                        # Utility scripts
│   ├── check-rust.js               # Rust toolchain detection
│   ├── check-android-tools.js      # ADB/Fastboot detection
│   ├── dev-arsenal-status.js       # Complete tool status check
│   └── mock-ws-server.js           # WebSocket mock server
│
├── libs/bootforgeusb/              # Rust USB detection library (if present)
│   ├── Cargo.toml                  # Rust project manifest
│   ├── src/                        # Rust source code
│   └── README.md                   # Library documentation
│
├── docs/                           # Extended documentation
├── package.json                    # Frontend dependencies & scripts
├── PRD.md                          # Product Requirements Document
├── README.md                       # Project README
└── README_PANDORA.md               # Pandora-specific documentation
```

## 🚀 Getting Started

### Prerequisites

#### Required

- **Node.js**: v22+ (for frontend and backend)
- **npm**: v10+

#### Optional (for full functionality)

- **Rust**: Latest stable (for BootForgeUSB)
  - `rustc --version` should work
  - `cargo --version` should work
- **Android Tools**:
  - `adb` (Android Debug Bridge)
  - `fastboot` (Fastboot protocol)
- **iOS Tools** (Linux/macOS):
  - `idevice_id` (from libimobiledevice)
  - `ideviceinfo` (from libimobiledevice)
- **Python 3**: For Phoenix Key agent (optional)

### Installation

```bash
# 1. Install frontend dependencies
npm install

# 2. Install server dependencies
cd server
npm install
cd ..

# 3. (Optional) Install Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 4. (Optional) Install Android tools (Ubuntu/Debian)
sudo apt-get install -y adb fastboot

# 5. (Optional) Build BootForgeUSB CLI (if source available)
cd libs/bootforgeusb
cargo build --release
cargo install --path .
cd ../..
```

### Running the Application

#### Development Mode

```bash
# Terminal 1: Start backend server (port 3001)
npm run server:dev

# Terminal 2: Start frontend dev server (port 5000)
npm run dev
```

Visit: <http://localhost:5000>

#### Production Build

```bash
# Build frontend
npm run build

# Start production server
npm run preview
```

## 📡 API Endpoints

### System Detection

- `GET /api/health` - Health check
- `GET /api/system-tools` - All system tools status
- `GET /api/system-tools/rust` - Rust toolchain status
- `GET /api/system-tools/android` - ADB/Fastboot status
- `GET /api/system-tools/python` - Python status
- `GET /api/system-info` - System information

### Android Device Management

- `GET /api/adb/devices` - List ADB devices with properties
- `GET /api/fastboot/devices` - List Fastboot devices
- `GET /api/android-devices/all` - Combined ADB + Fastboot devices
- `POST /api/adb/command` - Execute safe ADB commands
- `GET /api/fastboot/device-info?serial=XXX` - Get device details
- `POST /api/fastboot/flash` - Flash partition (requires multipart/form-data)
- `POST /api/fastboot/unlock` - Attempt bootloader unlock
- `POST /api/fastboot/reboot` - Reboot device (system/bootloader/recovery)
- `POST /api/fastboot/erase` - Erase non-critical partition

### BootForgeUSB (USB Detection)

- `GET /api/bootforgeusb/status` - Check CLI availability
- `GET /api/bootforgeusb/scan` - Scan real USB devices
- `GET /api/bootforgeusb/scan?demo=true` - Get demo data
- `GET /api/bootforgeusb/devices/:uid` - Get specific device details
- `GET /api/bootforgeusb/correlate` - Correlation analysis
- `POST /api/bootforgeusb/build` - Build and install CLI

### Performance & Testing

- `GET /api/flash/history` - Flash operation history
- `POST /api/flash/start` - Start demo flash operation
- `POST /api/monitor/start` - Start performance monitoring
- `POST /api/monitor/stop` - Stop performance monitoring
- `GET /api/monitor/live` - Get live performance metrics
- `POST /api/tests/run` - Run automated test suite
- `GET /api/tests/results` - Get test history
- `GET /api/standards` - Get industry benchmark standards

### Network

- `POST /api/network/scan` - Scan local network for devices

### WebSocket Endpoints

- `ws://localhost:3001/ws/device-events` - Live device hotplug events
- `ws://localhost:3001/ws/correlation` - Real-time correlation updates

## 🎨 UI Components

### Main Dashboard Tabs

1. **Pandora Codex** - Main control room with 5 sub-tabs
2. **Live Tracking** - Real-time correlation tracking
3. **Correlation** - Correlation analysis dashboard
4. **Live Benchmark** - Benchmarked flashing operations
5. **Performance Monitor** - Real-time flash monitoring
6. **Automated Testing** - Test execution dashboard
7. **Benchmark Standards** - Industry standards reference
8. **BootForge USB** - USB device scanner
9. **Live Hotplug** - Device hotplug monitor
10. **Settings** - Audio notifications & preferences

### Pandora Codex Sub-Tabs

- **Flash** - Flash operations panel
- **Monitor** - Performance monitoring (CPU, Memory, USB, Disk I/O)
- **Tests** - Automated testing with pass/fail results
- **Standards** - Industry benchmark reference (USB-IF, JEDEC)
- **Hotplug** - Live device connection/disconnection events

## 🔧 npm Scripts

### Development

```bash
npm run dev              # Start Vite dev server (port 5000)
npm run server:dev       # Start backend dev server (port 3001)
npm run server:start     # Start backend production server
```

### Build & Preview

```bash
npm run build            # Build frontend for production
npm run preview          # Preview production build
```

### Server Management

```bash
npm run server:install   # Install server dependencies
npm run kill             # Kill process on port 5000
npm run server:kill      # Kill process on port 3001
```

### Tool Detection

```bash
npm run check:rust              # Check Rust toolchain
npm run check:android-tools     # Check ADB/Fastboot
npm run arsenal:status          # Complete tool status
```

### Optional Tools

```bash
npm run phoenix:dev             # Run Phoenix Key agent (Python)
npm run bootforge:build         # Build BootForgeUSB CLI (Rust)
npm run bootforge:test          # Test BootForgeUSB library
```

## 🌐 WebSocket Protocol

### Device Events Channel (`/ws/device-events`)

#### Connection

```javascript
const ws = new WebSocket("ws://localhost:3001/ws/device-events");
```

#### Message Types

### Connected Event

```json
{
  "type": "connected",
  "device_uid": "device-abc123",
  "platform_hint": "android",
  "mode": "Normal OS (Confirmed)",
  "confidence": 0.95,
  "timestamp": 1703001234567,
  "display_name": "Google Pixel 6",
  "matched_tool_ids": ["ABC123XYZ"],
  "correlation_badge": "CORRELATED",
  "correlation_notes": ["Per-device correlation present"]
}
```

#### Disconnected Event

```json
{
  "type": "disconnected",
  "device_uid": "device-abc123",
  "timestamp": 1703001234567
}
```

### Correlation Tracking Channel (`/ws/correlation`)

#### Message Types

#### Batch Update

```json
{
  "type": "batch_update",
  "devices": [
    {
      "id": "demo-android-001",
      "serial": "ABC123XYZ",
      "platform": "android",
      "mode": "confirmed_android_os",
      "confidence": 0.95,
      "correlationBadge": "CORRELATED",
      "matchedIds": ["ABC123XYZ"],
      "correlationNotes": ["Per-device correlation present"],
      "vendorId": 6353,
      "productId": 20199
    }
  ],
  "timestamp": 1703001234567
}
```

#### Device Connected

```json
{
  "type": "device_connected",
  "deviceId": "device-xyz789",
  "device": {
    /* device object */
  },
  "timestamp": 1703001234567
}
```

#### Correlation Update

```json
{
  "type": "correlation_update",
  "deviceId": "device-xyz789",
  "device": {
    "correlationBadge": "CORRELATED",
    "matchedIds": ["XYZ789"],
    "confidence": 0.92,
    "correlationNotes": ["Tool confirmed"]
  },
  "timestamp": 1703001234567
}
```

#### Device Disconnected

```json
{
  "type": "device_disconnected",
  "deviceId": "device-xyz789",
  "timestamp": 1703001234567
}
```

**Ping/Pong**

```json
// Client → Server
{ "type": "ping" }

// Server → Client
{ "type": "pong", "timestamp": 1703001234567 }
```

## 🎭 Correlation Badges

Devices are classified with correlation badges indicating confidence:

- **CORRELATED** - Per-device tool correlation present (highest confidence)
- **CORRELATED (WEAK)** - Tool IDs matched but mode not strongly confirmed
- **SYSTEM-CONFIRMED** - System-level tool confirmation (no per-device mapping)
- **LIKELY** - Probable platform based on USB evidence
- **UNCONFIRMED** - Insufficient evidence for classification

## 🎨 Theme & Design

### Color Palette (Oklch)

- **Background**: `oklch(0.15 0.02 250)` - Deep blue-black
- **Primary**: `oklch(0.65 0.25 250)` - Electric blue
- **Accent**: `oklch(0.75 0.20 150)` - Bright cyan-green
- **Destructive**: `oklch(0.65 0.25 20)` - Bright red

### Typography

- **Sans**: Montserrat (UI elements)
- **Serif**: Playfair Display (headings)
- **Mono**: Source Code Pro (code, technical data)

### Design Philosophy

- **3uTools-inspired**: Clear labels, simple buttons, instant feedback
- **No enterprise jargon**: Straightforward terminology
- **One-click operations**: Minimal steps to action
- **Real-time feedback**: Instant visual updates
- **Color-coded status**: Green (connected), Yellow (weak), Red (unconfirmed)

## 🧪 Testing & Quality Assurance

### Automated Tests

The system includes automated testing for:

- Device detection accuracy
- USB performance metrics
- Correlation algorithm validation
- Performance optimization effectiveness

Run tests via:

```bash
# Via UI: Navigate to Tests tab → "Run All Tests"
# Via API: POST http://localhost:3001/api/tests/run
```

### Performance Benchmarks

Industry-standard benchmarks are tracked:

- **Flash Speed**: USB 2.0 / 3.0 / 3.1 / 3.2 Gen 2
- **USB Bandwidth Utilization**: Percentage of theoretical max
- **Random Write IOPS**: Storage performance classification
- **Fastboot Throughput**: Device flashing speed categories

## 🔒 Security Considerations

### Safe Operations

- Read-only device information retrieval
- Non-destructive diagnostics
- Evidence collection

### Restricted Operations (Require Confirmation)

- Bootloader unlock attempts
- Partition flashing
- Partition erasure (non-critical only)
- Factory reset operations

### Blocked Operations

- Critical partition erasure (boot, system, vendor, bootloader, radio, aboot, vbmeta)
- Unsigned firmware installation
- Operations without device selection

### Command Filtering

ADB commands are restricted to safe operations:

- `devices`, `shell getprop`, `get-state`, `get-serialno`

## 📊 Performance Monitoring

Real-time metrics tracked:

- **Transfer Speed**: MB/s (baseline: 21.25 MB/s)
- **CPU Usage**: Percentage
- **Memory Usage**: Percentage
- **USB Utilization**: Percentage
- **Disk I/O**: Operations per second

Metrics update every second when monitoring is active.

## 🔌 Hardware Requirements

### Minimum

- **CPU**: 2 cores
- **RAM**: 4GB
- **Disk**: 10GB free space
- **USB**: USB 2.0 port

### Recommended

- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Disk**: 20GB+ free space
- **USB**: USB 3.0+ port

### Codespaces Configuration

```json
{
  "hostRequirements": {
    "cpus": 4,
    "memory": "8gb",
    "storage": "32gb"
  }
}
```

## 🐛 Troubleshooting

### BootForgeUSB CLI Not Found

```bash
# Check status
npm run arsenal:status

# Build from source (if available)
cd libs/bootforgeusb
cargo build --release
cargo install --path .
```

### ADB Devices Not Detected

```bash
# Check ADB status
adb devices

# Restart ADB server
adb kill-server
adb start-server

# Enable USB debugging on Android device
# Settings → Developer Options → USB Debugging
```

### WebSocket Connection Fails

```bash
# Ensure server is running
npm run server:dev

# Check server logs
# WebSocket should bind to ws://localhost:3001
```

### USB Permission Denied (Linux)

```bash
# Add udev rules for USB access
sudo usermod -a -G plugdev $USER

# Restart or re-login required
```

## 📝 Development Notes

### Hot Module Replacement (HMR)

Vite provides instant HMR for React components. Changes reflect immediately.

### API Proxy

Vite proxies `/api/*` requests to `http://localhost:3001` in development.

### Type Safety

Full TypeScript coverage with strict mode enabled. No `any` types in production code.

### Component Library

shadcn/ui v4 components are pre-installed in `src/components/ui/`. Do not modify these files directly.

### State Management

- React hooks for local state
- WebSocket hooks for real-time data
- No global state library (Redux, MobX) needed

## 🎯 Feature Roadmap

### Phase 0: Foundations ✅

- [x] Tool detection and system status
- [x] WebSocket infrastructure
- [x] BootForgeUSB integration
- [x] Correlation tracking
- [x] UI component library

### Phase 1: MVP

- [ ] Device dossier system
- [ ] Evidence bundle export
- [ ] Tool health monitoring
- [ ] Job queue management

### Phase 2: Pro Features

- [ ] Batch flashing profiles
- [ ] Automated workflow engine
- [ ] Custom test suites
- [ ] Performance optimization recommendations

### Phase 3: Enterprise

- [ ] Policy engine for RBAC
- [ ] Signed plugin system
- [ ] Audit log retention
- [ ] Multi-user support
- [ ] Compliance reporting

## 📄 License

See LICENSE file for details.

## 🤝 Contributing

This is a private project. Contact the maintainer for contribution guidelines.

## 📧 Support

For issues, questions, or feature requests, consult the documentation files:

- `README.md` - General overview
- `PRD.md` - Product requirements
- `BACKEND_SETUP.md` - Backend configuration
- `BOBBY_DEV_ARSENAL.md` - Tool detection guide
- `BOOTFORGEUSB_*.md` - USB detection guides
- `CORRELATION_TRACKING.md` - Correlation system details
- `PANDORA_ENTERPRISE_BLUEPRINT.md` - Enterprise architecture

## 🏁 Quick Start Checklist

- [ ] Install Node.js 22+
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Run `cd server && npm install && cd ..`
- [ ] Start backend: `npm run server:dev`
- [ ] Start frontend: `npm run dev`
- [ ] Visit <http://localhost:5000>
- [ ] (Optional) Install Rust, ADB, Fastboot for full functionality
- [ ] (Optional) Build BootForgeUSB CLI
- [ ] Check tool status: `npm run arsenal:status`

---

**Pandora Codex Control Room** - Professional Device Management & Forensics Platform  
**Version**: 0.2.0  
**Last Updated**: December 2024
