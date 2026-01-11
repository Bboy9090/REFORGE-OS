# Fastboot Flashing Operations - Pandora Codex

## Overview

The Fastboot Flashing Panel provides comprehensive firmware deployment capabilities for Android devices in bootloader/fastboot mode. This module enables safe and efficient flashing of firmware images, bootloader management, and partition operations.

## Features

### 🔥 Firmware Flashing

- **Multi-Partition Support**: Flash to 12+ standard Android partitions
- **Safety Checks**: Critical partition warnings before destructive operations
- **Real-time Progress**: Live status updates during flash operations
- **File Validation**: Automatic validation of .img and .bin files
- **Flash History**: Persistent operation log with success/failure tracking

### 🔓 Bootloader Management

- **Unlock Detection**: Real-time bootloader lock status
- **OEM Unlock**: Initiate bootloader unlock operations
- **Secure Boot Status**: Monitor secure boot configuration
- **Critical Warnings**: Multi-level confirmation for destructive actions

### 📱 Device Management

- **Device Information**: Comprehensive device property extraction
- **Reboot Operations**: Reboot to system, bootloader, or recovery mode
- **Partition Management**: Erase non-critical partitions safely
- **Multi-Device Support**: Handle multiple devices simultaneously

### 🛡️ Safety Features

- **Critical Partition Protection**: Prevents accidental erasure of system partitions
- **Confirmation Dialogs**: Multi-level warnings for dangerous operations
- **Operation Logging**: Complete audit trail of all flash operations
- **Error Handling**: Detailed error messages and recovery guidance

## Supported Partitions

### Bootloader Category (Critical)

- **boot**: Kernel and ramdisk
- **bootloader**: Primary bootloader
- **aboot**: Application bootloader
- **vbmeta**: Verified boot metadata
- **recovery**: Recovery partition

### Firmware Category (Critical)

- **radio**: Baseband/modem firmware
- **dtbo**: Device tree overlays

### System Category (Critical)

- **system**: Android system image
- **vendor**: Vendor-specific files

### Data Category (Non-Critical)

- **userdata**: User data and apps
- **cache**: System cache

### Other Category

- **persist**: Persistent data partition

## API Endpoints

### Get Device Information

```http
GET /api/fastboot/device-info?serial={serial}
```

**Response:**

```json
{
  "product": "taimen",
  "variant": "MSM UFS",
  "bootloaderVersion": "TMZ20l",
  "basebandVersion": "g8998-00164-1710262031",
  "serialNumber": "XXXXXXXXXXXXX",
  "secure": true,
  "bootloaderUnlocked": false,
  "maxDownloadSize": "536870912",
  "currentSlot": "a",
  "slotCount": "2",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Flash Partition

```http
POST /api/fastboot/flash
Content-Type: multipart/form-data

serial: {device_serial}
partition: {partition_name}
file: {firmware_file.img}
```

**Response:**

```json
{
  "success": true,
  "output": "Sending 'boot' (16384 KB)...\nOKAY [  0.534s]\nWriting 'boot'...\nOKAY [  0.234s]\nFinished.",
  "message": "Successfully flashed boot",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Unlock Bootloader

```http
POST /api/fastboot/unlock
Content-Type: application/json

{
  "serial": "{device_serial}"
}
```

**Response:**

```json
{
  "success": true,
  "output": "...",
  "message": "Bootloader unlock initiated. Follow device prompts.",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Reboot Device

```http
POST /api/fastboot/reboot
Content-Type: application/json

{
  "serial": "{device_serial}",
  "mode": "system|bootloader|recovery"
}
```

**Response:**

```json
{
  "success": true,
  "output": "Rebooting...\nFinished.",
  "message": "Rebooting to system",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Erase Partition

```http
POST /api/fastboot/erase
Content-Type: application/json

{
  "serial": "{device_serial}",
  "partition": "{partition_name}"
}
```

**Response:**

```json
{
  "success": true,
  "output": "Erasing 'cache'...\nOKAY [  0.123s]\nFinished.",
  "message": "Partition cache erased",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## Usage Guide

### Prerequisites

1. **Fastboot installed** on the host system
2. **USB Debugging enabled** on the Android device
3. **Device in fastboot mode**:
   - Power off device
   - Hold Volume Down + Power button
   - OR: `adb reboot bootloader`
4. **OEM Unlocking enabled** (for bootloader unlock)

### Flashing Firmware

1. **Select Device**

   - Choose target device from dropdown
   - Verify device information is correct

2. **Select Partition**

   - Choose the partition to flash
   - Review partition description
   - Note if partition is marked as "Critical"

3. **Select Firmware File**

   - Click "Choose File" button
   - Select .img or .bin file
   - Verify file size and name

4. **Flash**
   - Click "Flash Partition"
   - Confirm operation if critical partition
   - Monitor progress and wait for completion

### Unlocking Bootloader

⚠️ **WARNING**: This will erase ALL data on the device!

1. Navigate to **Bootloader** tab
2. Select target device
3. Verify bootloader status shows "Locked"
4. Click "Unlock Bootloader"
5. Read and confirm the critical warning
6. Follow on-screen device prompts:
   - Use volume buttons to select "Unlock"
   - Press power button to confirm
   - Wait for device to unlock and reboot

### Device Operations

**Reboot Operations:**

- **System**: Normal boot to Android OS
- **Bootloader**: Reboot back to fastboot mode
- **Recovery**: Boot to recovery mode

**Partition Management:**

- Only non-critical partitions can be erased
- Erasing userdata = factory reset
- Erasing cache is generally safe

## Safety Guidelines

### ⚠️ Critical Warnings

1. **Bootloader Unlock**

   - Erases all device data
   - Voids warranty on most devices
   - Cannot be easily reversed
   - Required for custom ROM installation

2. **Critical Partitions**

   - Flashing wrong images can brick device
   - Always verify image compatibility
   - Have recovery plan before flashing
   - Keep backup of stock firmware

3. **Partition Erasure**
   - Cannot be undone
   - May prevent device from booting
   - Only erase if you know what you're doing

### ✅ Best Practices

1. **Before Flashing**

   - Backup all important data
   - Charge device to >50%
   - Download correct firmware for your device
   - Verify MD5/SHA checksums
   - Have stock firmware available

2. **During Flashing**

   - Do not disconnect USB cable
   - Do not power off device
   - Do not interrupt the process
   - Monitor for error messages

3. **After Flashing**
   - Wait for operation to complete
   - Check for success confirmation
   - Reboot device if instructed
   - Test device functionality

## Troubleshooting

### Device Not Detected

- Verify fastboot is installed: `fastboot --version`
- Check USB cable connection
- Try different USB port
- Install/update USB drivers
- Verify device is in fastboot mode

### Flash Operation Failed

- Check file integrity (MD5/SHA checksum)
- Verify partition name is correct
- Ensure sufficient space on partition
- Try rebooting to bootloader again
- Check for device-specific requirements

### Bootloader Unlock Failed

- Verify OEM unlocking is enabled in Developer Options
- Some devices require unlock code from manufacturer
- Check device-specific unlock instructions
- Wait 7 days after enabling OEM unlock (some devices)

### Device Bricked

- Try entering recovery mode
- Attempt fastboot flash of stock firmware
- Use manufacturer's unbrick tools
- Seek help in device-specific forums
- Consider professional repair if needed

## Technical Details

### File Upload Handling

- Files uploaded to `/tmp/fastboot-uploads/`
- Automatic cleanup after flash operation
- Maximum file size: Limited by server configuration
- Supported formats: .img, .bin

### Operation Timeout

- Flash operations: 120 seconds
- Other operations: 5 seconds
- Configurable in backend code

### Error Handling

- All operations wrapped in try-catch
- Detailed error messages returned
- Failed operations logged
- Temporary files cleaned up on failure

## Security Considerations

1. **File Upload Security**

   - Files stored in temporary directory
   - Automatic cleanup after operations
   - No permanent storage of firmware files

2. **Command Injection Prevention**

   - Serial numbers validated
   - Partition names validated against whitelist
   - No arbitrary command execution

3. **Critical Partition Protection**
   - Server-side validation of partition names
   - Prevents erasure of system-critical partitions
   - Multiple confirmation layers

## Future Enhancements

- [ ] Multi-file batch flashing
- [ ] Automatic device driver installation
- [ ] Flash script automation (.bat/.sh)
- [ ] Firmware verification before flash
- [ ] A/B slot management
- [ ] Custom recovery installation
- [ ] Factory image extraction and flash
- [ ] Remote device management
- [ ] Flash operation scheduling
- [ ] Device state backup/restore

## Resources

- [Android Fastboot Documentation](https://source.android.com/docs/core/architecture/bootloader/fastboot)
- [ADB/Fastboot Installation Guide](https://developer.android.com/studio/releases/platform-tools)
- [XDA Developers Forum](https://forum.xda-developers.com/)
- [LineageOS Installation Guide](https://wiki.lineageos.org/devices/)

## License

Part of the Pandora Codex project - Bobby Dev Arsenal
