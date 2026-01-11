/**
 * FRP Detection API endpoints
 * 
 * Factory Reset Protection (FRP) lock detection and bypass (owner devices only)
 */

import express from 'express';
import ADBLibrary from '../../../core/lib/adb.js';

const router = express.Router();

/**
 * POST /api/v1/frp/detect
 * Detect FRP lock status on Android device
 */
router.post('/detect', async (req, res) => {
  const { serial } = req.body;

  if (!serial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  const adbInstalled = await ADBLibrary.isInstalled();
  if (!adbInstalled) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'ADB is required for FRP detection', {
      tool: 'adb',
      installInstructions: 'Install Android SDK Platform Tools'
    }, 503);
  }

  try {
    const frpStatus = await ADBLibrary.checkFRPStatus(serial);
    
    if (!frpStatus.success) {
      return res.sendError('INTERNAL_ERROR', 'Failed to determine FRP status', {
        error: frpStatus.error
      }, 500);
    }

    const indicators = [];
    if (frpStatus.hasFRP) {
      indicators.push('Android ID is short (common FRP indicator)');
    }
    if (frpStatus.properties && frpStatus.properties['ro.frp.pst']) {
      indicators.push(`FRP partition property found: ${frpStatus.properties['ro.frp.pst']}`);
    }

    res.sendEnvelope({
      serial,
      detected: frpStatus.hasFRP,
      confidence: frpStatus.confidence,
      androidId: frpStatus.androidId,
      indicators,
      properties: frpStatus.properties
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'FRP detection failed', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/frp/bypass
 * Bypass FRP lock (owner devices only - must be in trapdoor/secret room)
 * This endpoint should only be accessible via trapdoor API
 */
router.post('/bypass', async (req, res) => {
  // This should be handled by trapdoor router, but included here for completeness
  return res.sendError('FORBIDDEN', 'FRP bypass must be performed through trapdoor API', {
    redirect: '/api/v1/trapdoor/frp/bypass'
  }, 403);
});

export default router;

