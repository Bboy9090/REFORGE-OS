# ⚡ Pandora Codex - User Guide

## Overview

Pandora Codex (Chain-Breaker) is Bobby's Workshop's hardware manipulation suite for iOS devices. It detects device modes, automates DFU entry, and executes jailbreak exploits.

---

## Getting Started

1. Navigate to **Secret Rooms**
2. Authenticate with **Phoenix Key**
3. Select **Jailbreak Sanctum** (Pandora Codex)

---

## Interface Overview

### Left Sidebar: Device Pulse
- Real-time device status
- Mode indicator (DFU, Recovery, Normal)
- Color-coded status:
  - 🟢 **Green**: Ready to Strike (DFU mode)
  - 🟡 **Amber**: Recovery Mode
  - 🔴 **Red**: Normal/Locked

### Center: Console Log
- Real-time operation output
- Color-coded messages:
  - Green: Success/Ready
  - Amber: Warning
  - Red: Error
- Auto-scrolling terminal view

### Right Sidebar: Exploit Selector
- **Checkm8**: A5-A11 devices (iPhone 4S - iPhone X)
- **Palera1n**: A8-A11 devices, iOS 15+
- **Unc0ver**: A12+ devices, iOS 14-16

---

## Workflows

### Workflow 1: Enter DFU Mode

1. Connect iOS device via USB
2. Wait for device detection (appears in Device Pulse)
3. Click **"Enter DFU Mode"**
4. Follow on-screen instructions:
   - Press and release Volume Up
   - Press and release Volume Down
   - Press and hold Side button until screen goes black
   - Continue holding Side button, press and hold Volume Down
   - Release Side button after 5 seconds
   - Keep holding Volume Down for 5 more seconds
5. Device status changes to **"READY_TO_STRIKE"** (Green)

---

### Workflow 2: Execute Jailbreak

**Prerequisites**:
- Device in DFU mode (Green status)
- Compatible exploit selected

**Steps**:
1. Select appropriate exploit:
   - **Checkm8**: For iPhone 4S through iPhone X
   - **Palera1n**: For iPhone 8/X with iOS 15+
   - **Unc0ver**: For iPhone XS and newer
2. Click **"Execute Exploit"**
3. Monitor console log for progress
4. Wait for completion (may take several minutes)
5. Device will reboot with jailbreak active

---

### Workflow 3: Flash Firmware

1. Ensure device is in appropriate mode (DFU or Recovery)
2. Prepare firmware files
3. Click **"Flash"** button
4. Upload firmware file
5. Confirm operation
6. Monitor progress in console log

---

## Device Detection

### Automatic Detection
- Device is detected when connected via USB
- Status updates every 2 seconds
- WebSocket provides real-time updates

### Manual Refresh
- Status refreshes automatically
- Console log shows detection events

---

## Safety Features

### Safety Interlock
- Destructive operations require device to be in correct mode
- Buttons are disabled when conditions aren't met
- Prevents accidental operations

### Audit Logging
- All operations are logged to Shadow Archive
- Includes timestamps, device info, and operation type
- Cannot be deleted or modified

---

## Exploit Compatibility

### Checkm8
- **Devices**: iPhone 4S through iPhone X
- **Chipsets**: A5 through A11
- **iOS Versions**: All (bootrom exploit)
- **Persistence**: Not persistent (requires re-jailbreak on reboot)

### Palera1n
- **Devices**: iPhone 8, iPhone X
- **Chipsets**: A11
- **iOS Versions**: iOS 15.0 - 16.6.1
- **Persistence**: Semi-untethered

### Unc0ver
- **Devices**: iPhone XS and newer
- **Chipsets**: A12 and newer
- **iOS Versions**: iOS 14.0 - 16.6.1
- **Persistence**: Semi-untethered

---

## Troubleshooting

### "No Hardware Detected"
- Check USB connection
- Try different USB port/cable
- Ensure device is powered on
- Install USB drivers if needed

### "Device in Normal Mode"
- Device is locked/active
- Enter DFU mode to proceed
- Follow DFU entry instructions

### "Exploit Failed"
- Verify device compatibility
- Check iOS version is supported
- Ensure device is in DFU mode
- Try different exploit if available

### "Flash Failed"
- Verify firmware file is correct
- Check device is in correct mode
- Ensure sufficient battery (>50%)
- Try different firmware version

---

## Important Warnings

⚠️ **Critical**:
- All operations are for **owner devices only**
- Jailbreaking may void warranty
- Some operations cannot be undone
- Always backup device before operations
- Use at your own risk

---

## Best Practices

1. **Backup First**: Always backup before jailbreaking
2. **Battery**: Ensure device has >50% battery
3. **Stable Connection**: Use quality USB cable
4. **Patience**: Operations may take several minutes
5. **Monitor Console**: Watch for errors in real-time

---

**Remember**: Pandora Codex provides powerful hardware manipulation. Use responsibly and only on devices you own.
