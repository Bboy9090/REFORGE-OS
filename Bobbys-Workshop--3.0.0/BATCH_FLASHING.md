# Batch Flashing Operations

## Overview

The Batch Flashing Panel provides advanced functionality to flash multiple firmware partitions sequentially with comprehensive control, progress tracking, and error handling. This feature is designed for developers and power users who need to flash complete firmware packages efficiently.

## Features

### Core Capabilities

1. **Sequential Multi-Partition Flashing**

   - Queue multiple partitions to flash in a single batch session
   - Automatic sequential execution with progress tracking
   - Support for all standard Android partitions (boot, system, vendor, recovery, etc.)

2. **Advanced Configuration Options**

   - **Continue on Error**: Choose whether to continue flashing remaining partitions if one fails
   - **Verify After Flash**: Optional verification step after each partition flash
   - **Auto Reboot**: Automatically reboot device after successful completion

3. **Real-Time Progress Monitoring**

   - Overall batch progress indicator
   - Per-partition status tracking (pending, flashing, success, failed, skipped)
   - Live status updates with visual feedback
   - Duration tracking for each operation

4. **Queue Management**

   - Add/remove partitions from the queue
   - Reorder partitions with up/down controls
   - File selection per partition
   - Visual indication of file size and names

5. **Safety Features**

   - Critical partition warnings before flashing
   - Confirmation dialogs for dangerous operations
   - Cannot remove items currently being flashed
   - Backend safety checks prevent erasing critical partitions

6. **Session History**
   - Persistent storage of batch flash sessions
   - Detailed history with success/failure counts
   - Duration and partition information
   - Last 10 sessions accessible for review

## Supported Partitions

### Critical Partitions (Require Extra Confirmation)

- **boot**: Kernel and ramdisk
- **system**: Android system image
- **vendor**: Vendor-specific files
- **bootloader**: Primary bootloader
- **radio**: Baseband firmware
- **aboot**: Application bootloader
- **vbmeta**: Verified boot metadata
- **super**: Dynamic partition container

### Standard Partitions

- **recovery**: Recovery partition
- **product**: Product-specific files
- **system_ext**: System extensions
- **odm**: ODM partition
- **dtbo**: Device tree overlays
- **persist**: Persistent data partition

### User Data Partitions

- **userdata**: User data and apps
- **cache**: System cache

## Usage Instructions

### 1. Create a Batch Session

1. Select a fastboot device from the dropdown
2. Configure batch options:
   - ✓ Continue on error (optional)
   - ✓ Verify after flash (recommended)
   - ✓ Reboot after completion (optional)
3. Click **"Create Batch Session"**

### 2. Add Partitions to Queue

1. Click the partition dropdown (e.g., "Add partition...")
2. Select the partition you want to flash
3. The partition is added to the batch queue
4. Repeat for all partitions you need to flash

### 3. Select Firmware Files

For each partition in the queue:

1. Click the file input field
2. Select the corresponding `.img` or `.bin` file
3. Verify the file name and size are displayed correctly

### 4. Reorder (Optional)

- Use ↑ and ↓ buttons to reorder partitions
- Flash order can be critical for some devices
- Common order: bootloader → boot → system → vendor → recovery

### 5. Start Batch Flash

1. Verify all partitions have files selected
2. Click **"Start Batch Flash"**
3. Confirm the warning dialog (especially for critical partitions)
4. Monitor progress in real-time

### 6. Monitor Progress

The panel displays:

- **Overall Progress**: Total completion percentage
- **Per-Partition Status**: Individual flash status with icons
  - ⚪ Pending
  - 🔵 Flashing (animated pulse)
  - ✅ Success (green)
  - ❌ Failed (red)
  - ⭕ Skipped (gray)
- **Duration**: Time taken for each operation
- **Error Messages**: Detailed error information if failures occur

### 7. Review Results

After completion:

- View success/failure counts
- Review any error messages
- Check session history for records
- Start a new session or reset

## Workflow Examples

### Example 1: Full Firmware Flash

```
1. Create session
2. Add partitions in order:
   - bootloader
   - radio
   - boot
   - system
   - vendor
   - recovery
   - vbmeta
3. Select corresponding .img files
4. Enable "Verify after flash"
5. Enable "Reboot after completion"
6. Start batch flash
```

### Example 2: Custom ROM Installation

```
1. Create session
2. Add partitions:
   - boot
   - system
   - vendor
   - product (if applicable)
3. Select ROM files
4. Enable "Continue on error" (optional)
5. Start batch flash
```

### Example 3: Recovery + Boot Update

```
1. Create session
2. Add partitions:
   - recovery
   - boot
3. Select firmware files
4. Enable "Reboot after completion"
5. Start batch flash
```

## Error Handling

### Continue on Error (Enabled)

- Failed partitions are marked as failed
- Remaining partitions continue to flash
- Final summary shows all successes and failures
- Useful for non-critical flashing scenarios

### Continue on Error (Disabled - Default)

- First failure stops the entire batch
- Remaining partitions are marked as skipped
- More conservative approach
- Recommended for critical system updates

## Safety Considerations

### ⚠️ Critical Warnings

1. **Bootloader Must Be Unlocked**

   - Device must be in fastboot mode with unlocked bootloader
   - Flashing with locked bootloader will fail

2. **Correct Files Required**

   - Always verify you have the correct firmware files for your device
   - Wrong files can brick your device

3. **Critical Partitions**

   - Extra confirmation required for: bootloader, boot, system, vendor, radio, vbmeta
   - Incorrectly flashing these can make device unbootable

4. **Power During Flashing**

   - Ensure device has sufficient battery (>50%)
   - Do not disconnect USB during flashing
   - Power loss during critical partition flash can brick device

5. **Device-Specific Requirements**
   - Some devices require specific flash order
   - Some devices need additional steps (e.g., flashing twice for A/B partitions)
   - Consult device-specific documentation

## Backend API Integration

The batch flashing panel uses the following backend endpoints:

- `GET /api/fastboot/devices` - List connected fastboot devices
- `POST /api/fastboot/flash` - Flash individual partition
  - Body: `serial`, `partition`, `file` (multipart)
- `POST /api/fastboot/reboot` - Reboot device
  - Body: `serial`, `mode` (system/bootloader/recovery)

## Data Persistence

Session history is stored using the Spark KV store:

- Key: `batch-flash-history`
- Max stored sessions: Latest 10
- Data includes: device serial, timestamp, duration, partition list, success/fail counts

## Troubleshooting

### Device Not Detected

- Ensure device is in fastboot mode
- Check USB connection
- Verify fastboot is installed (`fastboot devices`)
- Try different USB port/cable

### Flash Operation Fails

- Verify bootloader is unlocked
- Check file integrity (correct .img for device)
- Ensure partition name matches device partition table
- Review backend logs for detailed error

### Files Not Uploading

- Check file size (must be reasonable)
- Verify file format (.img or .bin)
- Ensure sufficient disk space on server
- Check backend upload directory permissions

### Batch Gets Stuck

- Refresh the page
- Restart the backend server
- Reboot device to fastboot mode
- Start a new session

## Best Practices

1. **Always backup important data before flashing**
2. **Test with non-critical partitions first**
3. **Keep the verification option enabled**
4. **Don't interrupt the process once started**
5. **Monitor the console/logs for detailed output**
6. **Know your device's specific requirements**
7. **Have a recovery plan (stock firmware, unbrick guide)**

## Advanced Features

### Partition Ordering

- Some devices require specific flash order
- Typically: bootloader → firmware → system partitions → user data
- Use reorder controls to adjust sequence

### Verification

- When enabled, adds small delay after each flash
- Recommended for critical partitions
- Can extend total flash time

### Session Recovery

- If page refreshes, session is lost (flashing stops)
- History is preserved in KV store
- Can review past sessions even after page reload

## Related Components

- **FastbootFlashingPanel**: Single partition flashing operations
- **ADBFastbootDetector**: Device detection and bootloader status
- **FastbootFlashingGuide**: Comprehensive flashing documentation
- **DeviceAnalyticsDashboard**: Device connection analytics

## Support & References

- [Android Fastboot Documentation](https://source.android.com/docs/core/architecture/bootloader/fastboot)
- [XDA Developers Forums](https://forum.xda-developers.com/)
- Backend API: `http://localhost:3001/api/fastboot/*`
- GitHub: Pandora Codex Repository
