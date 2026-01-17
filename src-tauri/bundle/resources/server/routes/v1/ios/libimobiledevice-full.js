/**
 * libimobiledevice Full Suite Integration
 * 
 * Comprehensive iOS device management using libimobiledevice tools:
 * - Device information retrieval
 * - App management
 * - File system access (jailbroken devices)
 * - Screenshot capture
 * - System log streaming
 * 
 * @module ios-libimobiledevice-full
 */

import express from 'express';
import IOSLibrary from '../../../../core/lib/ios.js';
import { safeSpawn, commandExistsSafe } from '../../../utils/safe-exec.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

/**
 * Get comprehensive device information
 * @param {string} udid - Device UDID
 * @returns {Promise<Object>} Complete device information
 */
async function getComprehensiveDeviceInfo(udid) {
  try {
    if (!(await commandExistsSafe('ideviceinfo'))) {
      return {
        success: false,
        error: 'ideviceinfo not installed'
      };
    }

    const result = await safeSpawn('ideviceinfo', ['-u', udid], {
      timeout: 10000
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to get device info'
      };
    }

    // Parse device info into structured format
    const info = {};
    const lines = result.stdout.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        info[key] = value;
      }
    });

    // Extract key information
    const deviceInfo = {
      udid: udid,
      deviceName: info.DeviceName || null,
      productType: info.ProductType || null,
      productVersion: info.ProductVersion || null,
      buildVersion: info.BuildVersion || null,
      serialNumber: info.SerialNumber || null,
      imei: info.InternationalMobileEquipmentIdentity || null,
      iccid: info.IntegratedCircuitCardIdentity || null,
      phoneNumber: info.PhoneNumber || null,
      wifiAddress: info.WiFiAddress || null,
      bluetoothAddress: info.BluetoothAddress || null,
      cpuArchitecture: info.CPUArchitecture || null,
      hardwareModel: info.HardwareModel || null,
      modelNumber: info.ModelNumber || null,
      deviceClass: info.DeviceClass || null,
      batteryLevel: info.BatteryLevel ? parseInt(info.BatteryLevel) : null,
      batteryIsCharging: info.BatteryIsCharging === 'true',
      activationState: info.ActivationState || null,
      isLocked: info.IsLocked === 'true',
      isPasscodeSet: info.IsPasscodeSet === 'true',
      isCloudBackupEnabled: info.IsCloudBackupEnabled === 'true',
      totalDiskCapacity: info.TotalDiskCapacity ? parseInt(info.TotalDiskCapacity) : null,
      totalDataAvailable: info.TotalDataAvailable ? parseInt(info.TotalDataAvailable) : null,
      totalDataCapacity: info.TotalDataCapacity ? parseInt(info.TotalDataCapacity) : null,
      allInfo: info // Include all raw info for advanced users
    };

    return {
      success: true,
      device: deviceInfo
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Capture screenshot from iOS device
 * @param {string} udid - Device UDID
 * @param {string} outputPath - Output path for screenshot
 * @returns {Promise<Object>} Screenshot capture result
 */
async function captureScreenshot(udid, outputPath) {
  try {
    if (!(await commandExistsSafe('idevicescreenshot'))) {
      return {
        success: false,
        error: 'idevicescreenshot not installed. Install from libimobiledevice package.'
      };
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const result = await safeSpawn('idevicescreenshot', ['-u', udid, outputPath], {
      timeout: 10000
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || result.stderr || 'Failed to capture screenshot'
      };
    }

    // Verify file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      return {
        success: true,
        path: outputPath,
        size: stats.size,
        message: 'Screenshot captured successfully'
      };
    } else {
      return {
        success: false,
        error: 'Screenshot file was not created'
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
 * List installed apps on iOS device
 * @param {string} udid - Device UDID
 * @returns {Promise<Object>} Installed apps list
 */
async function listInstalledApps(udid) {
  try {
    if (!(await commandExistsSafe('ideviceinstaller'))) {
      return {
        success: false,
        error: 'ideviceinstaller not installed. Install from libimobiledevice package.'
      };
    }

    const result = await safeSpawn('ideviceinstaller', ['-u', udid, '-l'], {
      timeout: 30000
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || result.stderr || 'Failed to list apps'
      };
    }

    // Parse app list
    const apps = [];
    const lines = result.stdout.split('\n');
    
    lines.forEach(line => {
      // Format: "BundleIdentifier - AppName"
      const match = line.match(/^(.+?)\s+-\s+(.+)$/);
      if (match) {
        apps.push({
          bundleId: match[1].trim(),
          name: match[2].trim()
        });
      }
    });

    return {
      success: true,
      apps,
      count: apps.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * GET /api/v1/ios/libimobiledevice/info/:udid
 * Get comprehensive device information
 */
router.get('/info/:udid', async (req, res) => {
  const { udid } = req.params;

  try {
    const result = await getComprehensiveDeviceInfo(udid);

    if (!result.success) {
      return res.sendError('DEVICE_INFO_FAILED', result.error, {
        udid,
        installInstructions: 'Install libimobiledevice tools: brew install libimobiledevice (macOS) or apt-get install libimobiledevice-utils (Linux)'
      }, 500);
    }

    res.sendEnvelope({
      device: result.device,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get device information', {
      error: error.message,
      udid
    }, 500);
  }
});

/**
 * POST /api/v1/ios/libimobiledevice/screenshot
 * Capture screenshot from iOS device
 */
router.post('/screenshot', async (req, res) => {
  const { udid, outputPath } = req.body;

  if (!udid) {
    return res.sendError('VALIDATION_ERROR', 'Device UDID is required', null, 400);
  }

  const screenshotPath = outputPath || path.join(process.cwd(), 'screenshots', `${udid}-${Date.now()}.png`);

  try {
    const result = await captureScreenshot(udid, screenshotPath);

    if (!result.success) {
      return res.sendError('SCREENSHOT_FAILED', result.error, {
        udid,
        installInstructions: 'Install libimobiledevice tools with idevicescreenshot: brew install libimobiledevice (macOS)'
      }, 500);
    }

    res.sendEnvelope({
      success: true,
      path: result.path,
      size: result.size,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to capture screenshot', {
      error: error.message,
      udid
    }, 500);
  }
});

/**
 * GET /api/v1/ios/libimobiledevice/apps/:udid
 * List installed apps on iOS device
 */
router.get('/apps/:udid', async (req, res) => {
  const { udid } = req.params;

  try {
    const result = await listInstalledApps(udid);

    if (!result.success) {
      return res.sendError('APP_LIST_FAILED', result.error, {
        udid,
        installInstructions: 'Install libimobiledevice tools with ideviceinstaller: brew install libimobiledevice (macOS)'
      }, 500);
    }

    res.sendEnvelope({
      apps: result.apps,
      count: result.count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to list installed apps', {
      error: error.message,
      udid
    }, 500);
  }
});

/**
 * GET /api/v1/ios/libimobiledevice/syslog/:udid
 * Stream system log from iOS device
 * 
 * Note: This would typically use WebSocket for real-time streaming
 * For now, returns recent log entries
 */
router.get('/syslog/:udid', async (req, res) => {
  const { udid } = req.params;
  const { lines = 100 } = req.query;

  try {
    if (!(await commandExistsSafe('idevicesyslog'))) {
      return res.sendError('TOOL_NOT_AVAILABLE', 'idevicesyslog not installed', {
        udid,
        installInstructions: 'Install libimobiledevice tools: brew install libimobiledevice (macOS)',
        note: 'For real-time log streaming, use WebSocket connection (coming soon)'
      }, 503);
    }

    // idevicesyslog streams continuously, so we need to capture recent lines
    // This is a simplified version - full implementation would use WebSocket streaming
    return res.sendNotImplemented(
      'System log streaming is not yet fully implemented. Use idevicesyslog command-line tool for now.',
      {
        udid,
        requestedLines: parseInt(lines),
        note: 'Full implementation will provide WebSocket-based real-time log streaming with filtering',
        currentAlternative: 'Use idevicesyslog -u <UDID> command-line tool',
        plannedFeatures: [
          'WebSocket-based real-time streaming',
          'Log filtering',
          'Search functionality',
          'Log export'
        ]
      }
    );
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get system log', {
      error: error.message,
      udid
    }, 500);
  }
});

export default router;

