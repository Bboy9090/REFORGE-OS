# Pandora Codex - Device Detection Arsenal

A comprehensive device detection and monitoring system built with React, TypeScript, and Node.js. Part of the Bobby Dev Arsenal for advanced hardware interaction and device management.

## 🚀 Features

### Multi-Protocol Device Detection

- **WebUSB Detection**: Real-time USB device monitoring with vendor recognition
- **ADB/Fastboot Detection**: Android device detection with bootloader mode recognition
- **Network Scanning**: Local network device discovery
- **System Tools Detection**: Backend API for detecting installed development tools

### Advanced Android Device Support

- **Bootloader Mode Recognition**: Detect devices in bootloader/fastboot mode
- **Unlock State Detection**: Identify locked vs unlocked bootloaders
- **Device State Monitoring**: Track Android OS, Recovery, Sideload, and Bootloader modes
- **Real-time Properties**: Access manufacturer, model, Android version, and security state
- **Dual-Source Detection**: Unified view from both ADB and Fastboot sources
- **Firmware Flashing**: Complete fastboot flashing operations for firmware deployment
- **Partition Management**: Flash, erase, and manage device partitions safely
- **Bootloader Unlock**: OEM unlock operations with safety confirmations

### Real-time Monitoring

- **Live Connection Events**: Instant notifications for device connect/disconnect
- **Auto-refresh**: Configurable polling intervals for continuous monitoring
- **Connection History**: Track device connection patterns and analytics
- **Health Monitoring**: Device status tracking and diagnostics

### Device Analytics

- **Connection Statistics**: Detailed metrics on device usage
- **Timeline Visualization**: Visual history of device connections
- **Device Insights**: AI-powered analysis of device patterns
- **Health Scores**: Automated device health assessment

### Performance Monitoring & Benchmarking

- **Real-time Flash Performance Monitor**: Live metrics during firmware operations
- **Bottleneck Detection**: Automatic identification of performance issues
- **Industry Benchmarking**: Compare your performance against official standards (USB-IF, JEDEC, etc.)
- **Performance Optimization**: AI-powered recommendations for improvement
- **Automated Testing**: Comprehensive validation of optimization effectiveness
- **Historical Tracking**: Monitor performance trends over time

## 📋 System Architecture

### Frontend (React + TypeScript)

- **Components**: Modular device detection UI components
- **Hooks**: Custom React hooks for device management
- **Real-time Updates**: WebUSB event listeners and polling strategies
- **State Management**: KV persistence for settings and history

### Backend (Node.js + Express)

- **System Tool Detection**: ADB, Fastboot, Rust, Python, Git, Docker
- **ADB Integration**: Device enumeration and property extraction
- **Fastboot Integration**: Bootloader state detection
- **Network Scanning**: ARP and IP neighbor table parsing
- **CORS Enabled**: Cross-origin support for development

## 🛠️ Prerequisites

### Required

- Node.js 18+ and npm/pnpm
- Modern browser with WebUSB support (Chrome, Edge, Opera)

### Optional (for full functionality)

- **ADB** (Android Debug Bridge) for Android device detection
- **Fastboot** for bootloader mode detection
- **Rust** toolchain for BootForge USB layer
- **Python 3** for Phoenix Key integration

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd spark-template
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Install System Tools (Optional)

**ADB/Fastboot (Android SDK Platform Tools):**

```bash
# Ubuntu/Debian
sudo apt-get install android-sdk-platform-tools

# macOS
brew install android-platform-tools

# Windows
# Download from https://developer.android.com/studio/releases/platform-tools
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd server
npm start
# Server runs on http://localhost:3001
```

### Start Frontend Development Server

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

## 📚 Documentation

- [ADB/Fastboot Detection Guide](./ADB_FASTBOOT_DETECTION.md) - Complete guide for Android device detection
- [Fastboot Flashing Operations](./FASTBOOT_FLASHING.md) - Firmware deployment and partition management
- [Performance Benchmarking](./PERFORMANCE_BENCHMARKING.md) - Industry standards comparison and optimization
- [Benchmarking Quick Start](./BENCHMARKING_QUICKSTART.md) - Get started with performance evaluation
- [Backend API Implementation](./BACKEND_API_IMPLEMENTATION.md) - API endpoints and usage
- [WebUSB Monitoring](./WEBUSB_MONITORING.md) - WebUSB integration details
- [Backend Setup](./BACKEND_SETUP.md) - Server configuration guide
- [Automated Testing](./AUTOMATED_TESTING.md) - Test suite documentation

## 🎯 Key Components

### Performance Benchmarking Dashboard

Industry-standard performance comparison and optimization tracking.

```tsx
import { PerformanceBenchmarking } from "@/components/PerformanceBenchmarking";

<PerformanceBenchmarking currentMetrics={metrics} isActive={isMonitoring} />;
```

**Features:**

- Compare against 16+ industry benchmarks (USB-IF, JEDEC, etc.)
- Real-time performance rating (Optimal/Good/Acceptable/Poor)
- Percentile rankings across 7 categories
- Actionable optimization recommendations
- Session history and trend tracking
- Export benchmark data for analysis
- Industry comparison view

### Benchmark Standards Guide

Reference documentation for all performance standards.

```tsx
import { BenchmarkStandardsGuide } from "@/components/BenchmarkStandardsGuide";

<BenchmarkStandardsGuide />;
```

### Fastboot Flashing Panel

Complete firmware deployment system with safety features.

```tsx
import { FastbootFlashingPanel } from "@/components/FastbootFlashingPanel";

<FastbootFlashingPanel />;
```

**Features:**

- Flash firmware images to device partitions
- Unlock/lock bootloader operations
- Partition management (erase non-critical partitions)
- Device information extraction
- Reboot operations (system, bootloader, recovery)
- Flash operation history and tracking
- Critical partition protection
- Multi-level safety confirmations

### ADB/Fastboot Detector

Comprehensive Android device detection with bootloader recognition.

```tsx
import { ADBFastbootDetector } from "@/components/ADBFastbootDetector";

<ADBFastbootDetector />;
```

### USB Device Detector

WebUSB-based real-time USB device monitoring.

```tsx
import { USBDeviceDetector } from "@/components/USBDeviceDetector";

<USBDeviceDetector />;
```

### System Tools Detector

Backend-powered system tool detection.

```tsx
import { SystemToolsDetector } from "@/components/SystemToolsDetector";

<SystemToolsDetector />;
```

## 🔧 Configuration

### Backend API URL

Update the API base URL in hooks if using a different port:

```typescript
// src/hooks/use-android-devices.ts
const API_BASE_URL = "http://localhost:3001/api";
```

### Auto-refresh Settings

Configure polling intervals in components:

```typescript
const { data } = useAndroidDevices(true, 3000); // 3 second interval
```

## 🔐 Security Considerations

### USB Device Access

- Requires user permission for each device
- Permissions persist per device
- Revoke via browser settings

### ADB/Fastboot

- Requires USB debugging enabled on Android devices
- User must authorize computer on device
- Backend runs with system user permissions

### Bootloader Detection

- Identifies locked/unlocked state
- Shows secure boot status
- Debug build detection

## 🧪 Development

### Project Structure

```
spark-template/
├── src/
│   ├── components/          # React components
│   │   ├── ADBFastbootDetector.tsx
│   │   ├── USBDeviceDetector.tsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── use-android-devices.ts
│   │   ├── use-device-detection.ts
│   │   └── ...
│   ├── types/              # TypeScript types
│   │   ├── android-devices.ts
│   │   └── ...
│   └── lib/                # Utility functions
├── server/                 # Backend API
│   ├── index.js           # Express server
│   └── package.json
└── ...
```

### Adding New Device Types

1. Create type definitions in `src/types/`
2. Add detection logic to backend API
3. Create custom hook in `src/hooks/`
4. Build UI component in `src/components/`

## 🐛 Troubleshooting

### ADB Devices Not Detected

- Verify ADB installed: `adb --version`
- Enable USB debugging on device
- Accept authorization prompt on device
- Check backend server is running

### WebUSB Not Working

- Use Chrome, Edge, or Opera browser
- Ensure HTTPS or localhost
- Check browser permissions

### Backend Connection Failed

- Verify server running on port 3001
- Check CORS configuration
- Ensure no firewall blocking

## 🤝 Contributing

This is part of the Pandora Codex project. Contributions welcome!

## 📄 License

MIT License - See LICENSE file for details

---

**Part of the Bobby Dev Arsenal** 🛠️ | Built with React, TypeScript, and Node.js
