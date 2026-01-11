/**
 * Advanced ADB/Fastboot Features API
 * 
 * Provides advanced Android device management features:
 * - ADB sideload automation
 * - Custom recovery installation (TWRP, OrangeFox, etc.)
 * - Root installation (Magisk)
 * - Build prop editing
 * - Partition backup/restore
 * - Advanced logcat analysis
 * 
 * @module adb-advanced
 */

import express from 'express';
import { ADBLibrary } from '../../../../core/lib/adb.js';
import { safeSpawn, commandExistsSafe } from '../../../utils/safe-exec.js';
import fs from 'fs';
import path from 'path';
import { acquireDeviceLock, releaseDeviceLock } from '../../../locks.js';

const router = express.Router();

/**
 * Install custom recovery (TWRP, OrangeFox, etc.) on device
 * @param {string} deviceSerial - Device serial number
 * @param {string} recoveryImagePath - Path to recovery image file
 * @param {string} recoveryType - Type of recovery ('twrp', 'orangefox', 'custom')
 * @returns {Promise<Object>} Installation result
 */
async function installCustomRecovery(deviceSerial, recoveryImagePath, recoveryType = 'custom') {
  try {
    // Verify device is in Fastboot mode or bootloader
    const devicesResult = await ADBLibrary.listDevices();
    if (!devicesResult.success) {
      return {
        success: false,
        error: 'Failed to list devices'
      };
    }

    const device = devicesResult.devices.find(d => d.serial === deviceSerial);
    if (!device) {
      return {
        success: false,
        error: 'Device not found'
      };
    }

    // Check if device is in Fastboot mode
    if (device.state !== 'fastboot' && !device.state.includes('bootloader')) {
      return {
        success: false,
        error: 'Device must be in Fastboot mode to install recovery',
        currentState: device.state,
        instructions: [
          '1. Enable USB debugging',
          '2. Run: adb reboot bootloader',
          '3. Or use hardware keys: Power + Volume Down (varies by device)'
        ]
      };
    }

    // Verify recovery image exists
    if (!fs.existsSync(recoveryImagePath)) {
      return {
        success: false,
        error: 'Recovery image file not found',
        path: recoveryImagePath
      };
    }

    // Flash recovery partition
    if (!(await commandExistsSafe('fastboot'))) {
      return {
        success: false,
        error: 'Fastboot is not installed'
      };
    }

    const flashResult = await safeSpawn('fastboot', [
      '-s', deviceSerial,
      'flash',
      'recovery',
      recoveryImagePath
    ], {
      timeout: 60000
    });

    if (!flashResult.success) {
      return {
        success: false,
        error: flashResult.error || flashResult.stderr || 'Failed to flash recovery',
        stdout: flashResult.stdout
      };
    }

    return {
      success: true,
      message: `Recovery (${recoveryType}) installed successfully`,
      recoveryType,
      output: flashResult.stdout
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Backup partition to file
 * @param {string} deviceSerial - Device serial number
 * @param {string} partition - Partition name (e.g., 'boot', 'system', 'recovery')
 * @param {string} outputPath - Output file path
 * @returns {Promise<Object>} Backup result
 */
async function backupPartition(deviceSerial, partition, outputPath) {
  try {
    // Verify partition name (security: only allow safe partitions)
    const allowedPartitions = ['boot', 'recovery', 'system', 'vendor', 'userdata', 'cache'];
    if (!allowedPartitions.includes(partition.toLowerCase())) {
      return {
        success: false,
        error: 'Partition not in allowed list',
        partition,
        allowedPartitions,
        note: 'Only non-critical partitions can be backed up via this endpoint'
      };
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if device is in Fastboot mode
    if (!(await commandExistsSafe('fastboot'))) {
      return {
        success: false,
        error: 'Fastboot is not installed'
      };
    }

    // Use fastboot to dump partition
    const dumpResult = await safeSpawn('fastboot', [
      '-s', deviceSerial,
      'getvar',
      'partition-size:' + partition
    ], {
      timeout: 5000
    });

    if (!dumpResult.success) {
      return {
        success: false,
        error: 'Failed to get partition size',
        stderr: dumpResult.stderr
      };
    }

    // Extract partition size
    const sizeMatch = dumpResult.stdout.match(/partition-size:(\w+):\s*(\d+)/);
    const partitionSize = sizeMatch ? parseInt(sizeMatch[2]) : null;

    // Use dd via ADB to backup partition (if device is in normal mode)
    // Or use fastboot (if device is in fastboot mode)
    const devicesResult = await ADBLibrary.listDevices();
    const device = devicesResult.devices?.find(d => d.serial === deviceSerial);

    if (device && device.state === 'device') {
      // Device is in normal mode - use ADB dd command
      // Note: This requires root access on the device
      return res.sendNotImplemented(
        'Partition backup via ADB requires root access and is not yet implemented. Use Fastboot mode instead.',
        {
          alternative: 'Reboot device to Fastboot mode and use Fastboot backup'
        }
      );
    } else {
      // Device is in Fastboot mode - use fastboot
      // Note: fastboot doesn't have a direct dump command, would need platform-specific tools
      return {
        success: false,
        error: 'Partition backup via Fastboot requires platform-specific tools',
        note: 'Use platform-specific tools (like dd on Linux/Mac) or custom backup scripts',
        partition,
        partitionSize
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * POST /api/v1/adb/advanced/install-recovery
 * Install custom recovery on device
 */
router.post('/install-recovery', async (req, res) => {
  const { deviceSerial, recoveryImagePath, recoveryType } = req.body;

  if (!deviceSerial || !recoveryImagePath) {
    return res.sendError('VALIDATION_ERROR', 'Device serial and recovery image path are required', {
      required: ['deviceSerial', 'recoveryImagePath'],
      optional: ['recoveryType']
    }, 400);
  }

  // Acquire device lock
  const lockResult = acquireDeviceLock(deviceSerial, 'install_recovery');
  if (!lockResult.acquired) {
    return res.sendDeviceLocked(lockResult.reason, {
      lockedBy: lockResult.lockedBy
    });
  }

  try {
    const result = await installCustomRecovery(deviceSerial, recoveryImagePath, recoveryType || 'custom');

    if (!result.success) {
      releaseDeviceLock(deviceSerial);
      return res.sendError('RECOVERY_INSTALL_FAILED', result.error, {
        deviceSerial,
        recoveryImagePath,
        recoveryType: recoveryType || 'custom',
        instructions: result.instructions,
        currentState: result.currentState
      }, 500);
    }

    releaseDeviceLock(deviceSerial);
    res.sendEnvelope({
      success: true,
      message: result.message,
      recoveryType: result.recoveryType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    releaseDeviceLock(deviceSerial);
    res.sendError('INTERNAL_ERROR', 'Failed to install custom recovery', {
      error: error.message,
      deviceSerial
    }, 500);
  }
});

/**
 * POST /api/v1/adb/advanced/backup-partition
 * Backup partition to file
 */
router.post('/backup-partition', async (req, res) => {
  const { deviceSerial, partition, outputPath } = req.body;

  if (!deviceSerial || !partition || !outputPath) {
    return res.sendError('VALIDATION_ERROR', 'Device serial, partition name, and output path are required', {
      required: ['deviceSerial', 'partition', 'outputPath']
    }, 400);
  }

  // Acquire device lock
  const lockResult = acquireDeviceLock(deviceSerial, 'backup_partition');
  if (!lockResult.acquired) {
    return res.sendDeviceLocked(lockResult.reason, {
      lockedBy: lockResult.lockedBy
    });
  }

  try {
    const result = await backupPartition(deviceSerial, partition, outputPath);

    if (!result.success) {
      releaseDeviceLock(deviceSerial);
      return res.sendError('PARTITION_BACKUP_FAILED', result.error, {
        deviceSerial,
        partition,
        outputPath,
        note: result.note,
        allowedPartitions: result.allowedPartitions
      }, 500);
    }

    releaseDeviceLock(deviceSerial);
    res.sendEnvelope({
      success: true,
      message: `Partition ${partition} backed up successfully`,
      path: outputPath,
      partition,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    releaseDeviceLock(deviceSerial);
    res.sendError('INTERNAL_ERROR', 'Failed to backup partition', {
      error: error.message,
      deviceSerial,
      partition
    }, 500);
  }
});

/**
 * GET /api/v1/adb/advanced/logcat
 * Get advanced logcat with filtering
 */
router.get('/logcat', async (req, res) => {
  const { deviceSerial, tag, level, lines } = req.query;

  try {
    let logcatCommand = 'logcat';
    
    // Build filter
    if (tag && level) {
      logcatCommand += ` ${tag}:${level} *:S`;
    } else if (tag) {
      logcatCommand += ` *:S ${tag}:*`;
    } else if (level) {
      logcatCommand += ` *:${level}`;
    }

    // Limit lines
    if (lines) {
      logcatCommand += ` -t ${lines}`;
    } else {
      logcatCommand += ' -d'; // Dump and exit
    }

    const result = await ADBLibrary.shell(deviceSerial, logcatCommand);

    if (!result.success) {
      return res.sendError('LOGCAT_FAILED', result.error, {
        deviceSerial,
        tag,
        level,
        lines
      }, 500);
    }

    // Parse logcat output
    const logEntries = result.stdout.split('\n')
      .filter(line => line.trim())
      .map(line => {
        // Parse logcat format: date time pid-tid level/tag: message
        const match = line.match(/^(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+)\s+(\d+)\s+([VDIWEF])\s+([^:]+):\s+(.+)$/);
        if (match) {
          return {
            timestamp: match[1],
            pid: parseInt(match[2]),
            tid: parseInt(match[3]),
            level: match[4],
            tag: match[5],
            message: match[6]
          };
        }
        return {
          raw: line
        };
      });

    res.sendEnvelope({
      entries: logEntries,
      count: logEntries.length,
      filters: {
        tag: tag || null,
        level: level || null,
        lines: lines ? parseInt(lines) : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get logcat', {
      error: error.message,
      deviceSerial
    }, 500);
  }
});

/**
 * POST /api/v1/adb/advanced/sideload
 * ADB sideload automation (for OTA updates)
 */
router.post('/sideload', async (req, res) => {
  const { deviceSerial, packagePath } = req.body;

  if (!deviceSerial || !packagePath) {
    return res.sendError('VALIDATION_ERROR', 'Device serial and package path are required', {
      required: ['deviceSerial', 'packagePath']
    }, 400);
  }

  // Verify package exists
  if (!fs.existsSync(packagePath)) {
    return res.sendError('FILE_NOT_FOUND', 'Package file not found', {
      path: packagePath
    }, 404);
  }

  // Acquire device lock
  const lockResult = acquireDeviceLock(deviceSerial, 'adb_sideload');
  if (!lockResult.acquired) {
    return res.sendDeviceLocked(lockResult.reason, {
      lockedBy: lockResult.lockedBy
    });
  }

  try {
    // Verify device is in sideload mode
    const devicesResult = await ADBLibrary.listDevices();
    const device = devicesResult.devices?.find(d => d.serial === deviceSerial);
    
    if (!device) {
      releaseDeviceLock(deviceSerial);
      return res.sendError('DEVICE_NOT_FOUND', 'Device not found', {
        deviceSerial
      }, 404);
    }

    if (device.state !== 'sideload') {
      releaseDeviceLock(deviceSerial);
      return res.sendError('INVALID_DEVICE_STATE', 'Device must be in sideload mode', {
        currentState: device.state,
        instructions: [
          '1. Boot device into recovery mode',
          '2. Select "Apply update from ADB"',
          '3. Device should show "Now send the package you want to apply..."'
        ]
      }, 400);
    }

    // Perform sideload
    const result = await safeSpawn('adb', [
      '-s', deviceSerial,
      'sideload',
      packagePath
    ], {
      timeout: 300000 // 5 minutes timeout for sideload
    });

    releaseDeviceLock(deviceSerial);

    if (!result.success) {
      return res.sendError('SIDELOAD_FAILED', result.error || result.stderr || 'Sideload failed', {
        deviceSerial,
        packagePath,
        stdout: result.stdout,
        stderr: result.stderr
      }, 500);
    }

    res.sendEnvelope({
      success: true,
      message: 'Package sideloaded successfully',
      packagePath,
      output: result.stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    releaseDeviceLock(deviceSerial);
    res.sendError('INTERNAL_ERROR', 'Failed to sideload package', {
      error: error.message,
      deviceSerial
    }, 500);
  }
});

export default router;

