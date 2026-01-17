/**
 * Root/Jailbreak Detection API
 * 
 * Detects if Android devices are rooted or iOS devices are jailbroken.
 * Provides detailed information about root/jailbreak status and methods.
 * 
 * @module security-root-detection
 */

import express from 'express';
import { ADBLibrary } from '../../../../core/lib/adb.js';
import { IOSLibrary } from '../../../../core/lib/ios.js';
import { safeSpawn, commandExistsSafe } from '../../../utils/safe-exec.js';

const router = express.Router();

/**
 * Detect root on Android device
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} Root detection result
 */
async function detectAndroidRoot(deviceSerial) {
  try {
    const checks = {
      suBinary: false,
      suInPath: false,
      rootApps: false,
      superuserApk: false,
      buildProps: false,
      xposed: false,
      magisk: false,
      evidence: []
    };

    // Check 1: Look for su binary in common locations
    const suLocations = ['/system/bin/su', '/system/xbin/su', '/sbin/su', '/data/local/su', '/data/local/bin/su', '/data/local/xbin/su'];
    for (const location of suLocations) {
      const result = await ADBLibrary.shell(deviceSerial, `test -f ${location} && echo "exists" || echo "not_found"`);
      if (result.success && result.stdout.includes('exists')) {
        checks.suBinary = true;
        checks.evidence.push(`su binary found at ${location}`);
      }
    }

    // Check 2: Check if su command is in PATH
    const suPathResult = await ADBLibrary.shell(deviceSerial, 'which su');
    if (suPathResult.success && suPathResult.stdout.trim()) {
      checks.suInPath = true;
      checks.evidence.push(`su found in PATH: ${suPathResult.stdout.trim()}`);
    }

    // Check 3: Check for common root management apps
    const rootApps = ['com.noshufou.android.su', 'com.noshufou.android.su.elite', 'eu.chainfire.supersu', 
                      'com.koushikdutta.superuser', 'com.thirdparty.superuser', 'com.yellowes.su',
                      'com.topjohnwu.magisk', 'com.kingroot.kinguser', 'com.kingo.root'];
    
    for (const packageName of rootApps) {
      const result = await ADBLibrary.shell(deviceSerial, `pm list packages | grep ${packageName}`);
      if (result.success && result.stdout.includes(packageName)) {
        checks.rootApps = true;
        if (packageName.includes('magisk')) {
          checks.magisk = true;
          checks.evidence.push('Magisk detected');
        } else if (packageName.includes('superuser') || packageName.includes('supersu')) {
          checks.superuserApk = true;
          checks.evidence.push(`Superuser app detected: ${packageName}`);
        } else {
          checks.evidence.push(`Root management app detected: ${packageName}`);
        }
      }
    }

    // Check 4: Check build.prop for root indicators
    const buildPropResult = await ADBLibrary.shell(deviceSerial, 'getprop ro.debuggable');
    if (buildPropResult.success && buildPropResult.stdout.trim() === '1') {
      checks.buildProps = true;
      checks.evidence.push('ro.debuggable=1 (debuggable build)');
    }

    // Check 5: Check for Xposed Framework
    const xposedResult = await ADBLibrary.shell(deviceSerial, 'getprop ro.xposed.version');
    if (xposedResult.success && xposedResult.stdout.trim()) {
      checks.xposed = true;
      checks.evidence.push(`Xposed Framework detected: ${xposedResult.stdout.trim()}`);
    }

    // Determine root status
    const isRooted = checks.suBinary || checks.suInPath || checks.rootApps || checks.buildProps;
    const confidence = isRooted ? 'high' : 'low';
    
    // Determine root method
    let rootMethod = 'unknown';
    if (checks.magisk) {
      rootMethod = 'Magisk';
    } else if (checks.superuserApk) {
      rootMethod = 'SuperSU/Superuser';
    } else if (checks.xposed) {
      rootMethod = 'Xposed Framework';
    } else if (checks.suBinary || checks.suInPath) {
      rootMethod = 'Custom SU Binary';
    }

    return {
      success: true,
      isRooted,
      confidence,
      rootMethod: isRooted ? rootMethod : null,
      checks,
      evidence: checks.evidence
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Detect jailbreak on iOS device
 * @param {string} udid - Device UDID
 * @returns {Promise<Object>} Jailbreak detection result
 */
async function detectiOSJailbreak(udid) {
  try {
    if (!(await commandExistsSafe('ideviceinfo'))) {
      return {
        success: false,
        error: 'libimobiledevice tools not installed'
      };
    }

    const checks = {
      fileSystemWritable: false,
      cydiaInstalled: false,
      jailbreakFiles: false,
      evidence: []
    };

    // Check 1: Try to access system directory (jailbroken devices allow this)
    // Note: This is limited as we can't directly access iOS filesystem without jailbreak tools
    // We rely on ideviceinfo output instead
    
    // Check 2: Get device info and look for jailbreak indicators
    const infoResult = await safeSpawn('ideviceinfo', ['-u', udid], {
      timeout: 5000
    });

    if (!infoResult.success) {
      // If ideviceinfo fails, device might be in recovery/DFU mode
      return {
        success: false,
        error: 'Failed to communicate with device',
        note: 'Device may be in recovery/DFU mode or not properly paired'
      };
    }

    const deviceInfo = infoResult.stdout.toLowerCase();

    // Check for common jailbreak indicators in device info
    const jailbreakIndicators = ['cydia', 'substrate', 'mobile substrate', 'jailbreak'];
    for (const indicator of jailbreakIndicators) {
      if (deviceInfo.includes(indicator)) {
        checks.jailbreakFiles = true;
        checks.evidence.push(`Jailbreak indicator found: ${indicator}`);
      }
    }

    // Note: Comprehensive jailbreak detection requires device-side checks
    // which need to be performed via SSH or jailbreak detection apps
    // This is a basic detection that works with available tools

    const isJailbroken = checks.jailbreakFiles || checks.cydiaInstalled;
    const confidence = isJailbroken ? 'medium' : 'low';

    return {
      success: true,
      isJailbroken,
      confidence,
      checks,
      evidence: checks.evidence,
      note: 'Comprehensive jailbreak detection requires device-side checks via SSH or detection apps. This is a basic detection using available tools.',
      limitations: [
        'Cannot directly access iOS filesystem without jailbreak',
        'Limited to information available via libimobiledevice',
        'May not detect newer jailbreak methods'
      ]
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * GET /api/v1/security/root-detection/:serial
 * Detect root/jailbreak status for a device
 */
router.get('/:identifier', async (req, res) => {
  const { identifier } = req.params;
  const { platform } = req.query;

  try {
    // Determine platform from identifier format or query parameter
    // Android serials are typically longer, iOS UDIDs have dashes
    const isIOS = identifier.includes('-') || platform === 'ios';
    const isAndroid = !isIOS || platform === 'android';

    if (isIOS) {
      const result = await detectiOSJailbreak(identifier);
      
      if (!result.success) {
        return res.sendError('JAILBREAK_DETECTION_FAILED', result.error, {
          udid: identifier,
          note: result.note,
          limitations: result.limitations
        }, 500);
      }

      return res.sendEnvelope({
        platform: 'ios',
        udid: identifier,
        isJailbroken: result.isJailbroken,
        confidence: result.confidence,
        checks: result.checks,
        evidence: result.evidence,
        note: result.note,
        limitations: result.limitations,
        timestamp: new Date().toISOString()
      });
    } else {
      const result = await detectAndroidRoot(identifier);
      
      if (!result.success) {
        return res.sendError('ROOT_DETECTION_FAILED', result.error, {
          serial: identifier
        }, 500);
      }

      return res.sendEnvelope({
        platform: 'android',
        serial: identifier,
        isRooted: result.isRooted,
        confidence: result.confidence,
        rootMethod: result.rootMethod,
        checks: result.checks,
        evidence: result.evidence,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to detect root/jailbreak status', {
      error: error.message,
      identifier,
      platform: platform || 'auto-detect'
    }, 500);
  }
});

/**
 * POST /api/v1/security/root-detection/scan
 * Scan multiple devices for root/jailbreak status
 */
router.post('/scan', async (req, res) => {
  const { devices } = req.body;

  if (!devices || !Array.isArray(devices)) {
    return res.sendError('VALIDATION_ERROR', 'devices array is required', null, 400);
  }

  try {
    const results = [];

    for (const device of devices) {
      const { identifier, platform } = device;
      
      if (!identifier) {
        results.push({
          identifier: identifier || 'unknown',
          error: 'Missing device identifier'
        });
        continue;
      }

      const isIOS = platform === 'ios' || identifier.includes('-');
      const isAndroid = !isIOS || platform === 'android';

      if (isIOS) {
        const result = await detectiOSJailbreak(identifier);
        results.push({
          identifier,
          platform: 'ios',
          ...(result.success ? {
            isJailbroken: result.isJailbroken,
            confidence: result.confidence
          } : {
            error: result.error
          })
        });
      } else {
        const result = await detectAndroidRoot(identifier);
        results.push({
          identifier,
          platform: 'android',
          ...(result.success ? {
            isRooted: result.isRooted,
            confidence: result.confidence,
            rootMethod: result.rootMethod
          } : {
            error: result.error
          })
        });
      }
    }

    res.sendEnvelope({
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to scan devices for root/jailbreak status', {
      error: error.message
    }, 500);
  }
});

export default router;

