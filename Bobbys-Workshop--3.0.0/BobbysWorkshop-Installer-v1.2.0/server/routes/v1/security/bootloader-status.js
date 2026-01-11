/**
 * Bootloader Lock Status Detection API
 * 
 * Detects bootloader unlock status across different Android device brands.
 * Supports: Google Pixel, Samsung, OnePlus, Xiaomi, Motorola, and generic Fastboot devices.
 * 
 * @module security-bootloader-status
 */

import express from 'express';
import { safeSpawn, commandExistsSafe } from '../../../utils/safe-exec.js';
import { ADBLibrary } from '../../../../core/lib/adb.js';

const router = express.Router();

/**
 * Get bootloader unlock status via Fastboot
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} Bootloader unlock status
 */
async function getFastbootUnlockStatus(deviceSerial) {
  try {
    if (!(await commandExistsSafe('fastboot'))) {
      return {
        success: false,
        error: 'Fastboot is not installed or not in PATH'
      };
    }

    // Get unlock status
    const unlockResult = await safeSpawn('fastboot', ['-s', deviceSerial, 'getvar', 'unlocked'], {
      timeout: 5000
    });

    if (!unlockResult.success) {
      return {
        success: false,
        error: unlockResult.error || 'Failed to get unlock status'
      };
    }

    const output = unlockResult.stdout.toLowerCase();
    const isUnlocked = output.includes('unlocked: yes') || output.includes('unlocked:true');
    const isLocked = output.includes('unlocked: no') || output.includes('unlocked:false');

    // Get additional bootloader info
    const bootloaderVersionResult = await safeSpawn('fastboot', ['-s', deviceSerial, 'getvar', 'version-bootloader'], {
      timeout: 5000
    });

    const bootloaderVersion = bootloaderVersionResult.success 
      ? bootloaderVersionResult.stdout.match(/version-bootloader:\s*(.+)/i)?.[1]?.trim() 
      : null;

    return {
      success: true,
      isUnlocked,
      isLocked,
      status: isUnlocked ? 'unlocked' : (isLocked ? 'locked' : 'unknown'),
      bootloaderVersion,
      method: 'fastboot',
      rawOutput: unlockResult.stdout
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get bootloader unlock status via ADB (for devices in normal mode)
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} Bootloader unlock status
 */
async function getADBBootloaderStatus(deviceSerial) {
  try {
    // Check various properties that indicate unlock status
    const properties = await ADBLibrary.getProperties(deviceSerial);
    
    if (!properties.success) {
      return {
        success: false,
        error: 'Failed to get device properties'
      };
    }

    const props = properties.properties;
    const checks = {
      'ro.boot.verifiedbootstate': props['ro.boot.verifiedbootstate'], // 'green', 'yellow', 'orange', 'red'
      'ro.boot.flash.locked': props['ro.boot.flash.locked'], // '1' = locked, '0' = unlocked
      'ro.boot.vbmeta.device_state': props['ro.boot.vbmeta.device_state'], // 'locked' or 'unlocked'
      'ro.crypto.state': props['ro.crypto.state'], // Encryption state (may indicate unlock)
      'ro.debuggable': props['ro.debuggable'] // '1' = debuggable (often unlocked)
    };

    // Determine unlock status
    let isUnlocked = false;
    let confidence = 'low';
    const evidence = [];

    // Check 1: Verified boot state
    if (checks['ro.boot.verifiedbootstate']) {
      const state = checks['ro.boot.verifiedbootstate'].toLowerCase();
      if (state === 'orange' || state === 'yellow') {
        isUnlocked = true;
        confidence = 'high';
        evidence.push(`Verified boot state: ${state} (indicates unlocked bootloader)`);
      } else if (state === 'green') {
        isUnlocked = false;
        confidence = 'high';
        evidence.push(`Verified boot state: ${state} (indicates locked bootloader)`);
      }
    }

    // Check 2: Flash lock status
    if (checks['ro.boot.flash.locked'] !== undefined) {
      const locked = checks['ro.boot.flash.locked'] === '1';
      if (locked) {
        isUnlocked = false;
        confidence = 'high';
        evidence.push('Flash lock: locked');
      } else {
        isUnlocked = true;
        confidence = 'high';
        evidence.push('Flash lock: unlocked');
      }
    }

    // Check 3: VBmeta device state
    if (checks['ro.boot.vbmeta.device_state']) {
      const state = checks['ro.boot.vbmeta.device_state'].toLowerCase();
      if (state === 'unlocked') {
        isUnlocked = true;
        confidence = 'high';
        evidence.push('VBmeta device state: unlocked');
      } else if (state === 'locked') {
        isUnlocked = false;
        confidence = 'high';
        evidence.push('VBmeta device state: locked');
      }
    }

    // Check 4: Debuggable (secondary indicator)
    if (checks['ro.debuggable'] === '1') {
      if (confidence === 'low') {
        isUnlocked = true;
        confidence = 'medium';
        evidence.push('Device is debuggable (may indicate unlocked bootloader)');
      }
    }

    return {
      success: true,
      isUnlocked,
      status: isUnlocked ? 'unlocked' : 'locked',
      confidence,
      checks,
      evidence,
      method: 'adb',
      note: 'ADB-based detection may not be accurate for all devices. For definitive status, check device in Fastboot mode.'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get OEM unlock status (ability to unlock bootloader)
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} OEM unlock status
 */
async function getOEMUnlockStatus(deviceSerial) {
  try {
    // Check OEM unlock setting (requires root or special permission on some devices)
    const result = await ADBLibrary.shell(deviceSerial, 'getprop sys.oem_unlock_allowed');
    
    if (!result.success) {
      return {
        success: false,
        error: 'Failed to check OEM unlock status'
      };
    }

    const allowed = result.stdout.trim() === '1';
    
    // Also check if already unlocked
    const bootloaderStatus = await getADBBootloaderStatus(deviceSerial);

    return {
      success: true,
      oemUnlockAllowed: allowed,
      isUnlocked: bootloaderStatus.success ? bootloaderStatus.isUnlocked : null,
      status: allowed ? 'allowed' : 'not_allowed',
      note: 'OEM unlock status indicates whether bootloader unlocking is allowed by manufacturer. Some devices require enabling this in developer options first.',
      bootloaderStatus: bootloaderStatus.success ? bootloaderStatus.status : null
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * GET /api/v1/security/bootloader-status/:serial
 * Get bootloader unlock status for a device
 */
router.get('/:serial', async (req, res) => {
  const { serial } = req.params;
  const { method } = req.query; // 'fastboot', 'adb', or 'auto'

  try {
    let result;

    if (method === 'fastboot') {
      result = await getFastbootUnlockStatus(serial);
    } else if (method === 'adb') {
      result = await getADBBootloaderStatus(serial);
    } else {
      // Try ADB first (device might be in normal mode)
      result = await getADBBootloaderStatus(serial);
      
      // If ADB check has low confidence, try Fastboot
      if (!result.success || result.confidence === 'low') {
        const fastbootResult = await getFastbootUnlockStatus(serial);
        if (fastbootResult.success) {
          result = fastbootResult;
        }
      }
    }

    if (!result.success) {
      return res.sendError('BOOTLOADER_STATUS_CHECK_FAILED', result.error, {
        serial,
        method: method || 'auto'
      }, 500);
    }

    res.sendEnvelope({
      serial,
      isUnlocked: result.isUnlocked,
      status: result.status,
      confidence: result.confidence || 'medium',
      method: result.method,
      bootloaderVersion: result.bootloaderVersion || null,
      checks: result.checks || null,
      evidence: result.evidence || null,
      note: result.note || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to check bootloader status', {
      error: error.message,
      serial
    }, 500);
  }
});

/**
 * GET /api/v1/security/bootloader-status/:serial/oem-unlock
 * Get OEM unlock status (whether unlocking is allowed)
 */
router.get('/:serial/oem-unlock', async (req, res) => {
  const { serial } = req.params;

  try {
    const result = await getOEMUnlockStatus(serial);

    if (!result.success) {
      return res.sendError('OEM_UNLOCK_CHECK_FAILED', result.error, {
        serial
      }, 500);
    }

    res.sendEnvelope({
      serial,
      oemUnlockAllowed: result.oemUnlockAllowed,
      isUnlocked: result.isUnlocked,
      status: result.status,
      bootloaderStatus: result.bootloaderStatus,
      note: result.note,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to check OEM unlock status', {
      error: error.message,
      serial
    }, 500);
  }
});

export default router;

