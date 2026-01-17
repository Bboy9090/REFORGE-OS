/**
 * The Unlock Chamber - Secret Room #1
 * 
 * Complete device unlock automation:
 * - FRP bypass (owner devices only)
 * - Bootloader unlock automation
 * - OEM unlock enable
 * - Security patch bypass (testing)
 * 
 * @module trapdoor-unlock
 */

import express from 'express';
import ShadowLogger from '../../../../core/lib/shadow-logger.js';
import { ADBLibrary } from '../../../../core/lib/adb.js';
import { safeSpawn, commandExistsSafe } from '../../../utils/safe-exec.js';
import { acquireDeviceLock, releaseDeviceLock } from '../../../locks.js';

const router = express.Router();
const shadowLogger = new ShadowLogger();

/**
 * POST /api/v1/trapdoor/unlock/bootloader
 * Automatically unlock bootloader (requires confirmation)
 */
router.post('/bootloader', async (req, res) => {
  const { deviceSerial, confirmation } = req.body;

  if (!deviceSerial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  if (confirmation !== 'UNLOCK') {
    return res.sendConfirmationRequired('Type "UNLOCK" to confirm bootloader unlock', {
      operation: 'bootloader_unlock',
      warning: 'This will void warranty and may brick device if done incorrectly'
    });
  }

  // Check policy
  if (process.env.ALLOW_BOOTLOADER_UNLOCK !== '1') {
    return res.sendPolicyBlocked('Bootloader unlock is disabled. Set ALLOW_BOOTLOADER_UNLOCK=1 to enable.', {
      operation: 'bootloader_unlock',
      policy: 'ALLOW_BOOTLOADER_UNLOCK'
    });
  }

  // Acquire device lock
  const lockResult = acquireDeviceLock(deviceSerial, 'trapdoor_bootloader_unlock');
  if (!lockResult.acquired) {
    return res.sendDeviceLocked(lockResult.reason, {
      lockedBy: lockResult.lockedBy
    });
  }

  try {
    // Log to shadow
    await shadowLogger.logShadow({
      operation: 'bootloader_unlock',
      deviceSerial,
      userId: req.ip,
      authorization: 'TRAPDOOR',
      success: false, // Will update on completion
      metadata: {
        method: req.method,
        path: req.path,
        confirmation: 'provided'
      }
    });

    // Verify device is in Fastboot mode
    if (!(await commandExistsSafe('fastboot'))) {
      releaseDeviceLock(deviceSerial);
      return res.sendError('TOOL_NOT_AVAILABLE', 'Fastboot is not installed', null, 503);
    }

    const fastbootDevices = await safeSpawn('fastboot', ['devices'], { timeout: 5000 });
    if (!fastbootDevices.success || !fastbootDevices.stdout.includes(deviceSerial)) {
      releaseDeviceLock(deviceSerial);
      return res.sendError('DEVICE_NOT_FOUND', 'Device not found in Fastboot mode', {
        serial: deviceSerial,
        instructions: [
          '1. Enable USB debugging',
          '2. Run: adb reboot bootloader',
          '3. Or use hardware keys: Power + Volume Down (varies by device)'
        ]
      }, 404);
    }

    // Execute unlock
    const unlockResult = await safeSpawn('fastboot', ['-s', deviceSerial, 'oem', 'unlock'], {
      timeout: 60000
    });

    releaseDeviceLock(deviceSerial);

    if (!unlockResult.success) {
      await shadowLogger.logShadow({
        operation: 'bootloader_unlock',
        deviceSerial,
        userId: req.ip,
        authorization: 'TRAPDOOR',
        success: false,
        metadata: {
          error: unlockResult.error || unlockResult.stderr,
          stderr: unlockResult.stderr
        }
      });

      return res.sendError('UNLOCK_FAILED', unlockResult.error || unlockResult.stderr || 'Bootloader unlock failed', {
        serial: deviceSerial,
        stderr: unlockResult.stderr,
        stdout: unlockResult.stdout
      }, 500);
    }

    // Log success
    await shadowLogger.logShadow({
      operation: 'bootloader_unlock',
      deviceSerial,
      userId: req.ip,
      authorization: 'TRAPDOOR',
      success: true,
      metadata: {
        method: req.method,
        path: req.path,
        output: unlockResult.stdout
      }
    });

    res.sendEnvelope({
      success: true,
      message: 'Bootloader unlock initiated',
      deviceSerial,
      output: unlockResult.stdout,
      warning: 'Device will reboot. Bootloader is now unlocked. Warranty may be voided.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    releaseDeviceLock(deviceSerial);
    res.sendError('INTERNAL_ERROR', 'Failed to unlock bootloader', {
      error: error.message,
      deviceSerial
    }, 500);
  }
});

/**
 * POST /api/v1/trapdoor/unlock/frp
 * Bypass FRP lock (owner devices only)
 */
router.post('/frp', async (req, res) => {
  const { deviceSerial, confirmation } = req.body;

  if (!deviceSerial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  if (confirmation !== 'BYPASS') {
    return res.sendConfirmationRequired('Type "BYPASS" to confirm FRP bypass', {
      operation: 'frp_bypass',
      warning: 'This operation is for owner devices only. Unauthorized use is illegal.'
    });
  }

  // Acquire device lock
  const lockResult = acquireDeviceLock(deviceSerial, 'trapdoor_frp_bypass');
  if (!lockResult.acquired) {
    return res.sendDeviceLocked(lockResult.reason, {
      lockedBy: lockResult.lockedBy
    });
  }

  try {
    // Log to shadow
    await shadowLogger.logShadow({
      operation: 'frp_bypass',
      deviceSerial,
      userId: req.ip,
      authorization: 'TRAPDOOR',
      success: false,
      metadata: {
        method: req.method,
        path: req.path,
        confirmation: 'provided'
      }
    });

    // FRP bypass methods vary by device and Android version
    // This is a simplified example - real implementation would be device-specific
    const adbInstalled = await ADBLibrary.isInstalled();
    if (!adbInstalled) {
      releaseDeviceLock(deviceSerial);
      return res.sendError('TOOL_NOT_AVAILABLE', 'ADB is required for FRP bypass', null, 503);
    }

    // Check device state
    const devicesResult = await ADBLibrary.listDevices();
    const device = devicesResult.devices?.find(d => d.serial === deviceSerial);
    
    if (!device) {
      releaseDeviceLock(deviceSerial);
      return res.sendError('DEVICE_NOT_FOUND', 'Device not found', {
        serial: deviceSerial
      }, 404);
    }

    // FRP bypass implementation would go here
    // This is a placeholder - actual implementation requires device-specific methods
    releaseDeviceLock(deviceSerial);

    return res.sendNotImplemented(
      'FRP bypass automation is device-specific and requires detailed implementation per device model. Use manual ADB methods for now.',
      {
        deviceSerial,
        note: 'FRP bypass methods vary by device manufacturer and Android version. Consult device-specific guides.',
        legal: 'This operation is for owner devices only. Unauthorized use is illegal.'
      }
    );
  } catch (error) {
    releaseDeviceLock(deviceSerial);
    res.sendError('INTERNAL_ERROR', 'Failed to bypass FRP', {
      error: error.message,
      deviceSerial
    }, 500);
  }
});

export default router;

