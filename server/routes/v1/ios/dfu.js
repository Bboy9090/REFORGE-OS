/**
 * iOS DFU (Device Firmware Update) Mode Automation
 * 
 * Provides automated DFU mode entry, detection, and recovery operations.
 * DFU mode is used for low-level firmware operations, jailbreaking, and device recovery.
 * 
 * @module ios-dfu
 */

import express from 'express';
import IOSLibrary from '../../../../core/lib/ios.js';
import { safeSpawn, commandExistsSafe } from '../../../utils/safe-exec.js';

const router = express.Router();

/**
 * Detect if a device is in DFU mode
 * @param {string} udid - Device UDID (optional, will detect first DFU device if not provided)
 * @returns {Promise<Object>} DFU detection result
 */
async function detectDFUMode(udid = null) {
  try {
    // Use idevice_id to detect DFU devices
    // In DFU mode, devices appear with a different identifier pattern
    if (!(await commandExistsSafe('idevice_id'))) {
      return {
        success: false,
        error: 'libimobiledevice tools not installed. Install from https://libimobiledevice.org/'
      };
    }

    // List all connected devices (including DFU mode devices)
    const result = await safeSpawn('idevice_id', ['-l'], {
      timeout: 5000
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to detect devices'
      };
    }

    const devices = result.stdout.split('\n').filter(line => line.trim());
    const dfuDevices = [];

    // Check each device for DFU mode characteristics
    for (const deviceId of devices) {
      if (!deviceId.trim()) continue;

      // Try to get device info - DFU mode devices typically don't respond to normal commands
      const infoResult = await safeSpawn('ideviceinfo', ['-u', deviceId], {
        timeout: 3000
      });

      // If ideviceinfo fails, device might be in DFU mode
      if (!infoResult.success) {
        dfuDevices.push({
          udid: deviceId,
          mode: 'dfu',
          confidence: 'high'
        });
      } else {
        // Check if device info indicates DFU mode
        const info = infoResult.stdout;
        if (info.includes('DFU') || info.toLowerCase().includes('recovery')) {
          dfuDevices.push({
            udid: deviceId,
            mode: 'dfu',
            confidence: 'medium',
            info: info
          });
        }
      }
    }

    if (udid) {
      const dfuDevice = dfuDevices.find(d => d.udid === udid);
      if (!dfuDevice) {
        return {
          success: false,
          error: 'Device not found in DFU mode',
          devices: dfuDevices
        };
      }
      return {
        success: true,
        device: dfuDevice
      };
    }

    return {
      success: true,
      devices: dfuDevices,
      count: dfuDevices.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Enter DFU mode (requires user interaction)
 * 
 * Note: DFU entry requires physical button combination that cannot be automated.
 * This endpoint provides instructions instead.
 * 
 * @param {string} udid - Device UDID
 * @returns {Object} DFU entry instructions
 */
function getDFUEntryInstructions(deviceModel = 'unknown') {
  // Different models have different DFU entry procedures
  const instructions = {
    'iPhone 8 and later (including X, XS, 11, 12, 13, 14, 15)': [
      '1. Connect device to computer via USB',
      '2. Press and release Volume Up',
      '3. Press and release Volume Down',
      '4. Press and hold Side button (power)',
      '5. Keep holding Side button while connecting USB cable (if not already connected)',
      '6. Continue holding Side button for 5 seconds',
      '7. Release Side button but immediately press and hold both Volume Down + Side button',
      '8. Continue holding for 10 seconds',
      '9. Release Side button but keep holding Volume Down for 5 more seconds',
      '10. Device should be in DFU mode (screen will be black)'
    ],
    'iPhone 7 and 7 Plus': [
      '1. Connect device to computer via USB',
      '2. Press and hold both Volume Down + Side button (power)',
      '3. Keep holding for 8 seconds',
      '4. Release Side button but keep holding Volume Down',
      '5. Continue holding Volume Down for 5 more seconds',
      '6. Device should be in DFU mode (screen will be black)'
    ],
    'iPhone 6s and earlier': [
      '1. Connect device to computer via USB',
      '2. Press and hold both Home + Side button (power)',
      '3. Keep holding for 8 seconds',
      '4. Release Side button but keep holding Home',
      '5. Continue holding Home for 5 more seconds',
      '6. Device should be in DFU mode (screen will be black)'
    ]
  };

  return {
    note: 'DFU mode entry requires physical button combinations and cannot be fully automated.',
    instructions: instructions,
    detection: 'After following instructions, device will appear in DFU mode and can be detected via /api/v1/ios/dfu/detect',
    warning: 'Entering DFU mode incorrectly may put device in recovery mode instead. If you see iTunes/Finder logo, you are in recovery mode, not DFU mode.'
  };
}

/**
 * Exit DFU mode (force restart device)
 * @param {string} udid - Device UDID
 * @returns {Promise<Object>} Exit DFU result
 */
async function exitDFUMode(udid) {
  try {
    // Force restart device using idevicediagnostics (if available)
    if (await commandExistsSafe('idevicediagnostics')) {
      const result = await safeSpawn('idevicediagnostics', ['-u', udid, 'restart'], {
        timeout: 10000
      });

      if (result.success) {
        return {
          success: true,
          message: 'Device restart initiated',
          method: 'idevicediagnostics'
        };
      }
    }

    // Alternative: Use physical button combination (user must do this)
    return {
      success: false,
      error: 'Automatic DFU exit not available',
      instructions: [
        'Hold Side button (power) + Volume Down (iPhone 8+) or Home button (iPhone 7 and earlier)',
        'Keep holding until Apple logo appears',
        'Device will restart and exit DFU mode'
      ],
      note: 'Install idevicediagnostics for automatic restart capability'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * GET /api/v1/ios/dfu/detect
 * Detect devices in DFU mode
 */
router.get('/detect', async (req, res) => {
  const { udid } = req.query;

  try {
    const result = await detectDFUMode(udid || null);

    if (!result.success) {
      return res.sendError('DFU_DETECTION_FAILED', result.error, {
        udid: udid || 'auto',
        availableTools: await IOSLibrary.getAvailableTools()
      }, 500);
    }

    res.sendEnvelope({
      detected: result.devices ? result.devices.length > 0 : !!result.device,
      devices: result.devices || (result.device ? [result.device] : []),
      count: result.count || (result.device ? 1 : 0),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to detect DFU mode devices', {
      error: error.message,
      udid: udid || 'auto'
    }, 500);
  }
});

/**
 * GET /api/v1/ios/dfu/instructions
 * Get instructions for entering DFU mode
 */
router.get('/instructions', (req, res) => {
  const { model } = req.query;

  const instructions = getDFUEntryInstructions(model);
  res.sendEnvelope(instructions);
});

/**
 * POST /api/v1/ios/dfu/exit
 * Exit DFU mode (restart device)
 */
router.post('/exit', async (req, res) => {
  const { udid } = req.body;

  if (!udid) {
    return res.sendError('VALIDATION_ERROR', 'Device UDID is required', null, 400);
  }

  try {
    const result = await exitDFUMode(udid);

    if (!result.success) {
      return res.sendError('DFU_EXIT_FAILED', result.error, {
        instructions: result.instructions,
        note: result.note
      }, 500);
    }

    res.sendEnvelope({
      success: true,
      message: result.message,
      method: result.method,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to exit DFU mode', {
      error: error.message,
      udid
    }, 500);
  }
});

/**
 * GET /api/v1/ios/dfu/status
 * Get DFU mode status for a device
 */
router.get('/status', async (req, res) => {
  const { udid } = req.query;

  if (!udid) {
    return res.sendError('VALIDATION_ERROR', 'Device UDID is required', null, 400);
  }

  try {
    const result = await detectDFUMode(udid);

    if (!result.success) {
      return res.sendError('DFU_STATUS_CHECK_FAILED', result.error, {
        udid
      }, 500);
    }

    const isDFU = !!result.device;
    res.sendEnvelope({
      udid,
      inDFUMode: isDFU,
      device: result.device || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to check DFU status', {
      error: error.message,
      udid
    }, 500);
  }
});

export default router;

