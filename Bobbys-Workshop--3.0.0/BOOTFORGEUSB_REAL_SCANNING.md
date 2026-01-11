# BootForgeUSB Real Device Scanning

This document explains how the **BootForgeUSB Scanner** component works with real USB device detection.

## Overview

The BootForgeUSB Scanner has been upgraded to support **real device scanning** through the `bootforgeusb-cli` command-line tool. When the CLI is not available, it automatically falls back to **demo mode** with realistic sample data.

## Architecture

### Backend API (`server/index.js`)

**Endpoint:** `GET /api/bootforgeusb/scan`

**Query Parameters:**

- `demo=true` - Request demo data fallback if CLI unavailable

**Response Format:**

```json
{
  "success": true,
  "count": 4,
  "devices": [...],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "available": true,
  "demo": false
}
```

**Behavior:**

1. **CLI Available:** Executes `bootforgeusb-cli` command and returns real USB device data
2. **CLI Not Found + demo=true:** Returns demo device data with `demo: true` flag
3. **CLI Not Found + demo=false:** Returns 503 error with installation instructions
4. **CLI Error + demo=true:** Falls back to demo data
5. **CLI Timeout:** Returns 504 timeout error

### Frontend Component (`src/components/BootForgeUSBScanner.tsx`)

**Features:**

- Automatic status check on mount
- Real-time device scanning via API
- Demo mode indicator in UI
- Color-coded alerts (amber for demo, red for errors)
- Detailed device information with correlation badges
- Expandable device cards with evidence details

**States:**

- `loading` - Checking backend status
- `scanning` - Scanning for devices
- `isDemoMode` - Showing demo data (not real devices)
- `error` - Error message or demo mode warning

## Installing BootForgeUSB CLI

### Prerequisites

**Required:**

- Rust toolchain (`rustc` and `cargo`)
- USB access permissions (Linux: udev rules)

**Optional (for correlation):**

- `adb` - Android Debug Bridge
- `fastboot` - Android Fastboot tool
- `idevice_id` - iOS device detection (libimobiledevice)

### Build & Install

```bash
# Navigate to the BootForgeUSB library
cd libs/bootforgeusb

# Build release binary
cargo build --release --bin bootforgeusb-cli

# Install to system PATH
cargo install --path . --bin bootforgeusb-cli

# Verify installation
bootforgeusb-cli --version
```

### Alternative: Build via API

The backend also provides a build endpoint:

```bash
curl -X POST http://localhost:3001/api/bootforgeusb/build
```

This will compile and install the CLI tool automatically (requires Rust toolchain).

## Device Detection Flow

### 1. USB Enumeration

BootForgeUSB scans USB buses using `libusb` or platform-specific APIs:

- Reads VID (Vendor ID) and PID (Product ID)
- Extracts manufacturer and product strings
- Captures USB interface descriptors
- Generates unique device UID

### 2. Platform Classification

Analyzes USB evidence to determine platform:

- **Android:** VID/PID patterns (Google, Samsung, Xiaomi, etc.)
- **iOS:** Apple VID (0x05ac) with specific PID ranges
- **Unknown:** Unrecognized devices

### 3. Mode Detection

Determines device operational mode:

- **Normal OS** - Standard operating system mode
- **Recovery** - Recovery/restore mode
- **Fastboot** - Android bootloader mode
- **DFU** - iOS Device Firmware Update mode

### 4. Tool Correlation

Cross-references with system tools:

- Runs `adb devices` to match Android serials
- Runs `fastboot devices` to match bootloader serials
- Runs `idevice_id -l` to match iOS UDIDs
- Stores matched IDs in `matched_tool_ids` array

### 5. Confidence Scoring

Calculates confidence level (0.0 - 1.0):

- USB evidence only: 0.70 - 0.85
- Tool confirmation: +0.10 - 0.15
- Multiple correlations: Higher confidence

### 6. Correlation Badge

Assigns user-facing status:

- **CORRELATED** - Device matched to tool ID (high confidence)
- **CORRELATED (WEAK)** - Tool ID match but lower confidence
- **SYSTEM-CONFIRMED** - Tool sees platform but no device match
- **LIKELY** - USB evidence suggests platform
- **UNCONFIRMED** - Insufficient evidence

## Demo Mode

When `bootforgeusb-cli` is not installed, the scanner automatically enters **Demo Mode**:

### Demo Devices

**Device 1: Google Pixel 6 (Android OS)**

- Platform: Android
- Mode: Normal OS (Confirmed)
- Confidence: 95%
- Correlation: CORRELATED (ADB serial matched)

**Device 2: Apple iPhone (iOS)**

- Platform: iOS
- Mode: Normal OS (Likely)
- Confidence: 88%
- Correlation: LIKELY (USB evidence only)

**Device 3: Fastboot Device (Bootloader)**

- Platform: Android
- Mode: Fastboot (Confirmed)
- Confidence: 92%
- Correlation: CORRELATED (Fastboot serial matched)

**Device 4: Xiaomi Device (Unauthorized)**

- Platform: Android
- Mode: Normal OS (Likely)
- Confidence: 78%
- Correlation: LIKELY (No tool confirmation)

### Visual Indicators

**Demo Mode Badge:** Displayed in device list header
**Amber Alert:** Warning-style alert explaining demo mode
**Status Message:** "⚠️ Demo Mode: BootForgeUSB CLI not installed"

## API Reference

### Status Check

```bash
GET /api/bootforgeusb/status
```

Returns CLI availability, build environment, and system tools status.

### Scan Devices

```bash
GET /api/bootforgeusb/scan?demo=true
```

Scans for USB devices. Falls back to demo data if CLI unavailable.

### Device Lookup

```bash
GET /api/bootforgeusb/devices/:uid
```

Retrieves detailed information for specific device UID.

### Correlation Analysis

```bash
GET /api/bootforgeusb/correlate
```

Analyzes correlation between USB devices and tool detections.

## USB Permissions (Linux)

Create udev rules for non-root USB access:

```bash
# /etc/udev/rules.d/99-usb-devices.rules
SUBSYSTEM=="usb", MODE="0666", GROUP="plugdev"
```

Reload rules:

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

## Troubleshooting

### "BootForgeUSB not available"

**Cause:** CLI tool not installed or not in PATH

**Solution:**

1. Verify Rust installation: `rustc --version`
2. Build from source: `cd libs/bootforgeusb && cargo build --release`
3. Install: `cargo install --path . --bin bootforgeusb-cli`
4. Verify: `which bootforgeusb-cli`

### "No devices detected" (Real Mode)

**Possible Causes:**

- No USB devices connected
- USB permissions issue (Linux)
- Device not in ADB/Fastboot mode

**Solutions:**

1. Connect a mobile device via USB
2. Enable USB debugging (Android)
3. Trust computer on device (iOS)
4. Check USB cable quality
5. Verify USB mode on device (file transfer vs. charging)

### "Scan timeout"

**Cause:** USB enumeration took longer than 10 seconds

**Solution:**

- Disconnect unnecessary USB devices
- Check for USB hub issues
- Restart USB services: `sudo systemctl restart usbmuxd` (iOS)

## Development

### Testing with Real Devices

1. **Connect Android Device:**

   ```bash
   # Enable USB debugging in Developer Options
   adb devices
   # Accept authorization on device
   ```

2. **Scan with BootForgeUSB:**

   ```bash
   bootforgeusb-cli
   ```

3. **Verify API Response:**
   ```bash
   curl http://localhost:3001/api/bootforgeusb/scan | jq
   ```

### Testing Demo Mode

```bash
# Temporarily rename CLI to simulate unavailability
mv ~/.cargo/bin/bootforgeusb-cli ~/.cargo/bin/bootforgeusb-cli.bak

# Scan should return demo data
curl "http://localhost:3001/api/bootforgeusb/scan?demo=true" | jq

# Restore CLI
mv ~/.cargo/bin/bootforgeusb-cli.bak ~/.cargo/bin/bootforgeusb-cli
```

## Integration with Pandora Codex

The BootForgeUSB Scanner integrates with other Pandora Codex components:

- **Correlation Dashboard** - Shows device correlation badges
- **Device Analytics** - Tracks device history and patterns
- **Live Hotplug Monitor** - Real-time device connect/disconnect events
- **Benchmark Dashboard** - Performance metrics during flashing

## Security Considerations

### Safe Operations

- Device detection (read-only)
- USB information queries
- Serial number correlation

### Restricted Operations

- Device flashing (requires explicit authorization)
- Bootloader unlocking (policy gates)
- Partition modification (blocked by default)

### Policy Gates

All destructive operations require:

1. Explicit device selection
2. Typed confirmation
3. Confidence threshold > 0.90
4. Preflight authorization
5. Job approval

## Future Enhancements

- [ ] Real-time USB hotplug via udev/IOKit
- [ ] WebUSB support for browser-based detection
- [ ] Network device scanning (ADB over WiFi)
- [ ] Device fingerprinting and tracking
- [ ] Historical device analytics
- [ ] Automated correlation improvement via ML

## Resources

- **BootForgeUSB Library:** `libs/bootforgeusb/`
- **API Documentation:** `BOOTFORGEUSB_API.md`
- **Backend Integration:** `BOOTFORGEUSB_BACKEND_WIRING.md`
- **Correlation Guide:** `CORRELATION_TRACKING.md`
- **USB Specifications:** https://www.usb.org/documents

---

**Last Updated:** 2024-01-15
**Version:** BootForgeUSB v0.2 + Correlation Tracking
