/**
 * iOS API endpoints
 * 
 * iOS device detection and management
 */

import express from 'express';
import IOSLibrary from '../../../core/lib/ios.js';

const router = express.Router();

/**
 * GET /api/v1/ios/scan
 * Scan for connected iOS devices
 */
router.get('/scan', async (req, res) => {
  try {
    if (!IOSLibrary.isInstalled()) {
      return res.sendError('TOOL_NOT_AVAILABLE', 'libimobiledevice tools not installed', {
        tool: 'idevice_id',
        installInstructions: 'Install libimobiledevice tools (e.g., brew install libimobiledevice on macOS)',
        platform: process.platform
      }, 503);
    }

    const devices = IOSLibrary.listDevices(); // This is synchronous
    
    if (!devices.success) {
      return res.sendError('INTERNAL_ERROR', 'Failed to list iOS devices', {
        error: devices.error
      }, 500);
    }

    // Get detailed info for each device
    const detailedDevices = await Promise.all(
      devices.devices.map(async (d) => {
        const info = await IOSLibrary.getDeviceInfo(d.udid);
        return { ...d, ...info.info };
      })
    );

    res.sendEnvelope({
      devices: detailedDevices,
      count: detailedDevices.length
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to scan for iOS devices', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/ios/jailbreak
 * Jailbreak iOS device (instructions/guidance only - actual jailbreak via trapdoor)
 */
router.post('/jailbreak', (req, res) => {
  // Return guidance instead of implementing actual jailbreak
  return res.sendNotImplemented(
    'iOS jailbreak automation is not implemented. Use manual methods (checkra1n, palera1n) or access through trapdoor API for advanced operations.',
    {
      manualMethods: [
        {
          name: 'checkra1n',
          description: 'Hardware-based jailbreak for iOS 12.0 - 14.8.1',
          url: 'https://checkra.in'
        },
        {
          name: 'palera1n',
          description: 'Semi-tethered jailbreak for iOS 15.0 - 16.x',
          url: 'https://palera.in'
        }
      ],
      note: 'Jailbreaking may void warranty and should only be performed on devices you own'
    }
  );
});

export default router;

