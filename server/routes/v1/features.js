/**
 * Feature Flags API endpoints (v1)
 * Provides feature availability information for the frontend
 */

import express from 'express';
import { execSync } from 'child_process';

const router = express.Router();

/**
 * Check if a command/tool is available in the system
 */
function commandExists(cmd) {
  try {
    if (process.platform === 'win32') {
      execSync(`where ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    } else {
      execSync(`which ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get feature flags based on environment and tool availability
 */
function getFeatureFlags() {
  const demoMode = process.env.DEMO_MODE === '1';
  const allowBootloaderUnlock = process.env.ALLOW_BOOTLOADER_UNLOCK === '1';
  const allowFirmwareDownload = process.env.ALLOW_FIRMWARE_DOWNLOAD === '1';
  
  // Check tool availability
  const adbAvailable = commandExists('adb');
  const fastbootAvailable = commandExists('fastboot');
  const ideviceIdAvailable = commandExists('idevice_id');
  const ideviceinfoAvailable = commandExists('ideviceinfo');
  const pythonAvailable = commandExists('python') || commandExists('python3');
  
  // iOS tooling available if libimobiledevice is present
  const iosEnabled = ideviceIdAvailable && ideviceinfoAvailable;
  
  // Android tooling available if adb/fastboot present
  const androidEnabled = adbAvailable || fastbootAvailable;
  
  return {
    demoMode,
    trapdoorEnabled: true, // Always enabled (gated by authentication)
    iosEnabled,
    androidEnabled,
    firmwareEnabled: allowFirmwareDownload && pythonAvailable,
    monitoringEnabled: false, // Not yet implemented
    testsEnabled: false, // Not yet implemented
    bootloaderUnlockEnabled: allowBootloaderUnlock && androidEnabled,
    flashOperationsEnabled: androidEnabled || iosEnabled,
    pluginRegistryEnabled: true, // Plugin registry is always available
    evidenceBundlesEnabled: true, // Evidence bundles are always available
    authorizationTriggersEnabled: true, // Authorization triggers are always available
    
    // Tool availability
    tools: {
      adb: adbAvailable,
      fastboot: fastbootAvailable,
      idevice_id: ideviceIdAvailable,
      ideviceinfo: ideviceinfoAvailable,
      python: pythonAvailable
    },
    
    // Feature availability by platform
    platforms: {
      android: {
        enabled: androidEnabled,
        adb: adbAvailable,
        fastboot: fastbootAvailable,
        flash: fastbootAvailable,
        unlock: allowBootloaderUnlock && fastbootAvailable
      },
      ios: {
        enabled: iosEnabled,
        detection: ideviceIdAvailable,
        info: ideviceinfoAvailable,
        dfu: ideviceinfoAvailable, // DFU detection available if libimobiledevice present
        backup: false, // Not yet implemented
        restore: false // Not yet implemented
      }
    }
  };
}

/**
 * GET /api/v1/features
 * Get feature flags and availability
 */
router.get('/', (req, res) => {
  try {
    const featureFlags = getFeatureFlags();
    
    res.sendEnvelope({
      features: featureFlags,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get feature flags', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/features/flags
 * Get feature flags only (alias for /)
 */
router.get('/flags', (req, res) => {
  try {
    const featureFlags = getFeatureFlags();
    
    res.sendEnvelope(featureFlags);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get feature flags', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/features/tools
 * Get tool availability information
 */
router.get('/tools', (req, res) => {
  try {
    const featureFlags = getFeatureFlags();
    
    res.sendEnvelope({
      tools: featureFlags.tools,
      platforms: featureFlags.platforms,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get tool availability', { error: error.message }, 500);
  }
});

export default router;
