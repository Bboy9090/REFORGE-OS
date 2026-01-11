/**
 * MDM Detection API endpoints
 * 
 * Mobile Device Management (MDM) profile detection
 */

import express from 'express';
import ADBLibrary from '../../../core/lib/adb.js';

const router = express.Router();

/**
 * POST /api/v1/mdm/detect
 * Detect MDM profiles on Android device
 */
router.post('/detect', async (req, res) => {
  const { serial } = req.body;

  if (!serial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  const adbInstalled = await ADBLibrary.isInstalled();
  if (!adbInstalled) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'ADB is required for MDM detection', {
      tool: 'adb',
      installInstructions: 'Install Android SDK Platform Tools'
    }, 503);
  }

  try {
    const result = await ADBLibrary.shell(serial, 'dumpsys device_policy');
    
    if (!result.success) {
      return res.sendError('INTERNAL_ERROR', 'Failed to run device_policy dumpsys', {
        error: result.error
      }, 500);
    }

    const output = result.stdout;
    const detected = output.includes('DevicePolicyManagerService:');
    const profileOwnerMatch = output.match(/mProfileOwnerName=(.*?)\n/);
    const deviceOwnerMatch = output.match(/mDeviceOwnerName=(.*?)\n/);
    const restrictionsMatch = output.match(/User restrictions:(.*?)\n/s);

    // Detect common MDM packages
    const mdmPackages = [];
    const commonMDM = ['airwatch', 'vmware', 'mobileiron', 'good', 'blackberry', 'microsoft', 'intune', 'jamf'];
    for (const mdm of commonMDM) {
      if (output.toLowerCase().includes(mdm.toLowerCase())) {
        mdmPackages.push(mdm);
      }
    }

    const mdmInfo = {
      detected,
      profileOwner: profileOwnerMatch ? profileOwnerMatch[1].trim() : null,
      deviceOwner: deviceOwnerMatch ? deviceOwnerMatch[1].trim() : null,
      restrictions: restrictionsMatch ? restrictionsMatch[1].trim().split('\n').map(s => s.trim()).filter(Boolean) : [],
      mdmPackages,
      rawOutput: output.split('\n').slice(0, 20).join('\n') + '...' // Limit raw output
    };

    res.sendEnvelope({
      serial,
      ...mdmInfo,
      confidence: detected ? 0.9 : 0.1
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'MDM detection failed', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/mdm/remove
 * Remove MDM profile (owner devices only - must be in trapdoor/secret room)
 * This endpoint should only be accessible via trapdoor API
 */
router.post('/remove', async (req, res) => {
  return res.sendError('FORBIDDEN', 'MDM removal must be performed through trapdoor API', {
    redirect: '/api/v1/trapdoor/mdm/remove'
  }, 403);
});

export default router;

