# MediaTek SP Flash Tool Integration Guide

## Overview

Bobby's World now includes MediaTek SP Flash Tool integration for scatter-based firmware flashing on MediaTek chipsets (Helio, Dimensity series).

## Features

- **Device Detection**: Automatically detects MediaTek devices via USB VID 0x0E8D
- **Scatter File Support**: Validates and processes scatter files (.txt)
- **Multi-Image Flashing**: Flash multiple partitions (system, boot, recovery, etc.)
- **Real-Time Progress**: WebSocket-based live progress monitoring
- **Pause/Resume/Cancel**: Full control over flash operations
- **Safety Warnings**: Clear preloader caution alerts

## How to Use

### 1. Connect Your MediaTek Device

- Put device in **Preloader mode** or **VCOM mode**
- Connect via USB cable
- Click "Scan Devices" in the Devices tab

### 2. Configure Flash Job

- Select your device from the dropdown
- Specify the scatter file path (e.g., `MT6765_Android_scatter.txt`)
- Add firmware images using the "Add Image" button

### 3. Start Flashing

- Click "Start MTK Flash" button
- Monitor progress in the "Progress" tab
- View real-time transfer speeds and ETA

### 4. Monitor & Control

- **Pause**: Temporarily halt the flash operation
- **Resume**: Continue a paused operation
- **Stop**: Cancel the flash operation

## Supported Chipsets

- MT6765 (Helio P35)
- MT6768 (Helio P65)
- MT6785 (Helio G90)
- MT6833 (Dimensity 700)
- MT6853 (Dimensity 720)
- MT6873 (Dimensity 800)
- MT6877 (Dimensity 900)
- MT6889 (Dimensity 1000)
- MT6893 (Dimensity 1200)
- And more...

## Safety Warnings

### ⚠️ CRITICAL: Preloader Partition

- **DO NOT flash preloader unless you know exactly what you're doing**
- Incorrect preloader can permanently brick your device
- Always create a backup before flashing
- Verify firmware compatibility with your exact device model

### Backup Checklist

Before flashing, ensure you have:

- [ ] Full device backup (via TWRP or MTK Droid Tools)
- [ ] Original scatter file and firmware images
- [ ] Device model and chipset information confirmed
- [ ] Battery charged above 50%
- [ ] Stable USB connection

## WebSocket Integration

The MediaTek Flash Panel uses WebSocket for real-time progress updates:

- **Endpoint**: `ws://localhost:3001/flash-progress`
- **Auto-reconnect**: Enabled with 5 retry attempts
- **Ping/Pong**: Keepalive every 30 seconds

### Progress Events

- `flash_started`: Operation initiated
- `flash_progress`: Real-time progress updates (%, speed, ETA)
- `flash_paused`: Operation paused by user
- `flash_resumed`: Operation resumed
- `flash_completed`: Success
- `flash_failed`: Error occurred

## Backend Implementation (Reference)

### Rust Module Structure

```
backend/src/flash/mtk/
├── mod.rs           # Main MTK flash provider
├── detect.rs        # Device detection logic
├── runner.rs        # SP Flash Tool launcher
└── protocol.rs      # Shared message types
```

### FlashProvider Trait

```rust
pub trait FlashProvider {
    fn probe(&self) -> anyhow::Result<ProbeResult>;
    fn start_flash(&self, job: FlashJob, tx: ProgressTx) -> anyhow::Result<()>;
}
```

### Detection Logic

- **Windows**: USB VID 0x0E8D, COM port enumeration
- **Linux**: `/dev/ttyACM*`, `/dev/ttyUSB*` via udev
- **macOS**: Limited support (recommend Linux/Windows)

## Troubleshooting

### Device Not Detected

1. Ensure device is in Preloader/VCOM mode
2. Install MediaTek USB VCOM drivers (Windows)
3. Check USB cable (use data cable, not charge-only)
4. Try different USB ports (prefer USB 2.0)

### Flash Operation Failed

1. Verify scatter file matches firmware images
2. Check scatter file path is correct
3. Ensure images are not corrupted
4. Verify device compatibility
5. Try different USB port/cable

### WebSocket Connection Issues

1. Check backend server is running on port 3001
2. Verify firewall allows WebSocket connections
3. Check browser console for connection errors

## Legal & Safety Notice

This tool is provided for **authorized repair and development purposes only**. You must:

- Own the device or have explicit permission to flash it
- Understand the risks of firmware flashing
- Not use this tool for warranty fraud or device theft
- Accept full responsibility for device damage

Flashing firmware voids most manufacturer warranties. Proceed at your own risk.

## Additional Resources

- MediaTek Developer Portal: [developer.mediatek.com](https://developer.mediatek.com)
- SP Flash Tool Official: [spflashtool.com](https://spflashtool.com)
- XDA Developers MTK Forum: [forum.xda-developers.com](https://forum.xda-developers.com/c/mediatek.12393/)
