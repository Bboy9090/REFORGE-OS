// iOS Library - iOS device operations via libimobiledevice
// Provides safe wrappers around idevice* commands

import { execSync } from 'child_process';

function safeExec(cmd, options = {}) {
  try {
    return {
      success: true,
      stdout: execSync(cmd, { 
        encoding: 'utf-8', 
        timeout: options.timeout || 10000,
        ...options
      }).trim()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.toString() || ''
    };
  }
}

function commandExists(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

const IOSLibrary = {
  /**
   * Check if libimobiledevice tools are installed
   */
  isInstalled() {
    return commandExists('idevice_id');
  },

  /**
   * Get available iOS tools
   */
  getAvailableTools() {
    const tools = [
      'idevice_id',
      'ideviceinfo',
      'idevicename',
      'idevicepair',
      'idevicediagnostics',
      'idevicesyslog'
    ];
    
    const available = {};
    tools.forEach(tool => {
      available[tool] = commandExists(tool);
    });
    
    return available;
  },

  /**
   * List connected iOS devices
   */
  listDevices() {
    if (!commandExists('idevice_id')) {
      return { success: false, error: 'idevice_id not installed', devices: [] };
    }
    
    const result = safeExec('idevice_id -l');
    if (!result.success) {
      return { ...result, devices: [] };
    }
    
    const udids = result.stdout.split('\n').filter(l => l.trim());
    const devices = udids.map(udid => ({ udid, mode: 'normal' }));
    
    return { success: true, devices };
  },

  /**
   * Get device information
   * @param {string} udid - Device UDID
   */
  getDeviceInfo(udid) {
    if (!commandExists('ideviceinfo')) {
      return { success: false, error: 'ideviceinfo not installed' };
    }
    
    const result = safeExec(`ideviceinfo -u ${udid}`);
    if (!result.success) {
      return result;
    }
    
    const info = {};
    result.stdout.split('\n').forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)/);
      if (match) {
        info[match[1]] = match[2];
      }
    });
    
    return { 
      success: true, 
      info,
      deviceName: info.DeviceName,
      productType: info.ProductType,
      productVersion: info.ProductVersion,
      buildVersion: info.BuildVersion,
      serialNumber: info.SerialNumber
    };
  },

  /**
   * Get device name
   * @param {string} udid - Device UDID
   */
  getDeviceName(udid) {
    if (!commandExists('idevicename')) {
      return { success: false, error: 'idevicename not installed' };
    }
    
    return safeExec(`idevicename -u ${udid}`);
  },

  /**
   * Check pairing status
   * @param {string} udid - Device UDID
   */
  checkPairing(udid) {
    if (!commandExists('idevicepair')) {
      return { success: false, error: 'idevicepair not installed' };
    }
    
    const result = safeExec(`idevicepair -u ${udid} validate`);
    return {
      success: true,
      paired: result.success && result.stdout.includes('SUCCESS'),
      output: result.stdout || result.stderr
    };
  },

  /**
   * Initiate pairing with device
   * @param {string} udid - Device UDID
   */
  pair(udid) {
    if (!commandExists('idevicepair')) {
      return { success: false, error: 'idevicepair not installed' };
    }
    
    return safeExec(`idevicepair -u ${udid} pair`);
  },

  /**
   * Get device mode (normal, recovery, DFU)
   * @param {string} udid - Device UDID
   */
  getDeviceMode(udid) {
    // Try normal mode tools first
    const normalResult = safeExec(`ideviceinfo -u ${udid} -k DeviceClass 2>&1`);
    if (normalResult.success && !normalResult.stdout.includes('ERROR')) {
      return { success: true, mode: 'normal' };
    }
    
    // Check for recovery mode
    if (commandExists('irecovery')) {
      const recoveryResult = safeExec('irecovery -q');
      if (recoveryResult.success && recoveryResult.stdout.includes('PWNED')) {
        return { success: true, mode: 'dfu' };
      }
      if (recoveryResult.success && recoveryResult.stdout.includes('Recovery')) {
        return { success: true, mode: 'recovery' };
      }
    }
    
    return { success: true, mode: 'unknown' };
  },

  /**
   * Run diagnostics on device
   * @param {string} udid - Device UDID
   */
  runDiagnostics(udid) {
    if (!commandExists('idevicediagnostics')) {
      return { success: false, error: 'idevicediagnostics not installed' };
    }
    
    // Get battery info
    const batteryResult = safeExec(`idevicediagnostics -u ${udid} ioregentry IOPMPowerSource`);
    
    return {
      success: batteryResult.success,
      battery: batteryResult.stdout,
      error: batteryResult.error
    };
  },

  /**
   * Restart device
   * @param {string} udid - Device UDID
   */
  restart(udid) {
    if (!commandExists('idevicediagnostics')) {
      return { success: false, error: 'idevicediagnostics not installed' };
    }
    
    return safeExec(`idevicediagnostics -u ${udid} restart`);
  },

  /**
   * Shutdown device
   * @param {string} udid - Device UDID
   */
  shutdown(udid) {
    if (!commandExists('idevicediagnostics')) {
      return { success: false, error: 'idevicediagnostics not installed' };
    }
    
    return safeExec(`idevicediagnostics -u ${udid} shutdown`);
  }
};

export default IOSLibrary;
