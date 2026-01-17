/**
 * Fastboot API endpoints (migrated to v1 with envelope)
 * 
 * Includes policy checks and confirmation gates
 */

import express from 'express';
import { execSync, spawn } from 'child_process';
import { acquireDeviceLock, releaseDeviceLock, LOCK_TIMEOUT } from '../../locks.js';

const router = express.Router();

function safeExec(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 5000, ...options }).trim();
  } catch (error) {
    return null;
  }
}

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

// Policy: Allowed partition names for erase operations
const ALLOWED_PARTITIONS = [
  'userdata', 'cache', 'system', 'vendor', 'boot', 'recovery',
  'data', 'system_a', 'system_b', 'vendor_a', 'vendor_b'
];

// Policy: Blocked partition names (critical partitions that should never be erased)
const BLOCKED_PARTITIONS = [
  'bootloader', 'radio', 'sbl1', 'aboot', 'rpm', 'tz', 'hyp', 'pmic'
];

/**
 * Device lock middleware for Fastboot operations
 */
function requireDeviceLock(req, res, next) {
  const deviceSerial = req.body?.serial || req.body?.deviceSerial || req.params?.serial;
  
  if (!deviceSerial) {
    return next(); // Some operations don't need a device lock
  }

  const operation = `fastboot_${req.path.replace('/', '_').replace(/\//g, '_')}`;
  const lockResult = acquireDeviceLock(deviceSerial, operation);

  if (!lockResult.acquired) {
    return res.sendDeviceLocked(lockResult.reason, {
      lockedBy: lockResult.lockedBy,
      retryAfter: Math.floor(LOCK_TIMEOUT / 1000) // Convert milliseconds to seconds
    });
  }

  // Release lock when response finishes
  const originalEnd = res.end;
  res.end = function(...args) {
    releaseDeviceLock(deviceSerial);
    originalEnd.apply(this, args);
  };

  next();
}

/**
 * GET /api/v1/fastboot/devices
 * List Fastboot devices
 */
router.get('/devices', (req, res) => {
  if (!commandExists('fastboot')) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'Fastboot is not installed or not in PATH', {
      tool: 'fastboot',
      installInstructions: 'Install Android SDK Platform Tools from https://developer.android.com/studio/releases/platform-tools'
    }, 503);
  }

  try {
    const output = safeExec('fastboot devices -l');
    if (!output) {
      return res.sendEnvelope({ devices: [], count: 0 });
    }

    const lines = output.split('\n').filter(line => line.trim());
    const devices = lines.map(line => {
      const parts = line.split(/\s+/);
      const serial = parts[0];
      const status = parts[1] || 'fastboot';
      const properties = {};

      // Parse properties
      const propMatches = line.matchAll(/(\w+):([^\s]+)/g);
      for (const match of propMatches) {
        properties[match[1]] = match[2];
      }

      return {
        serial,
        status,
        properties,
        connected: true
      };
    });

    res.sendEnvelope({ devices, count: devices.length });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to list Fastboot devices', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/fastboot/device-info
 * Get Fastboot device information
 */
router.get('/device-info', (req, res) => {
  const { serial } = req.query;

  if (!commandExists('fastboot')) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'Fastboot is not installed or not in PATH', null, 503);
  }

  if (!serial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  try {
    const getvar = (varName) => safeExec(`fastboot -s ${serial} getvar ${varName} 2>&1`);

    const info = {
      serial,
      product: getvar('product'),
      variant: getvar('variant'),
      hwrev: getvar('hwrev'),
      bootloaderVersion: getvar('version-bootloader'),
      basebandVersion: getvar('version-baseband'),
      unlockStatus: getvar('unlocked'),
      secureBoot: getvar('secure'),
      antiRollback: getvar('anti'),
    };

    res.sendEnvelope(info);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get Fastboot device information', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/fastboot/unlock
 * Unlock bootloader (requires confirmation and policy check)
 */
router.post('/unlock', requireDeviceLock, (req, res) => {
  const { serial, confirmation } = req.body;
  
  if (!commandExists('fastboot')) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'Fastboot is not installed or not in PATH', null, 503);
  }

  if (!serial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  // Policy check: bootloader unlock must be explicitly enabled
  if (process.env.ALLOW_BOOTLOADER_UNLOCK !== '1') {
    return res.sendPolicyBlocked('Bootloader unlock is disabled. Set ALLOW_BOOTLOADER_UNLOCK=1 to enable.', {
      reason: 'POLICY_DISABLED',
      requiredEnv: 'ALLOW_BOOTLOADER_UNLOCK=1'
    });
  }

  // Confirmation check
  if (!confirmation || confirmation !== 'UNLOCK') {
    return res.sendConfirmationRequired('You must type "UNLOCK" to confirm this operation. This will ERASE ALL DATA on the device.', {
      requiredText: 'UNLOCK',
      warning: 'This operation will erase all user data'
    });
  }

  try {
    const output = safeExec(`fastboot -s ${serial} flashing unlock`);
    
    res.sendEnvelope({
      success: true,
      serial,
      operation: 'unlock',
      output,
      warning: 'Device data has been erased'
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Bootloader unlock failed', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/fastboot/flash
 * Flash partition (requires confirmation and device lock)
 */
router.post('/flash', requireDeviceLock, async (req, res) => {
  const { serial, partition, imagePath, confirmation } = req.body;
  
  if (!commandExists('fastboot')) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'Fastboot is not installed or not in PATH', null, 503);
  }

  if (!serial || !partition || !imagePath) {
    return res.sendError('VALIDATION_ERROR', 'Serial, partition, and imagePath are required', null, 400);
  }

  // Validate partition name
  if (BLOCKED_PARTITIONS.includes(partition.toLowerCase())) {
    return res.sendPolicyBlocked(`Partition "${partition}" is blocked for safety reasons`, {
      partition,
      blockedPartitions: BLOCKED_PARTITIONS
    });
  }

  // Confirmation check
  if (!confirmation || confirmation !== 'FLASH') {
    return res.sendConfirmationRequired('You must type "FLASH" to confirm this operation', {
      requiredText: 'FLASH'
    });
  }

  try {
    const output = safeExec(`fastboot -s ${serial} flash ${partition} ${imagePath}`);
    
    res.sendEnvelope({
      success: true,
      serial,
      partition,
      imagePath,
      output
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Flash operation failed', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/fastboot/erase
 * Erase partition (requires confirmation, policy check, and device lock)
 */
router.post('/erase', requireDeviceLock, (req, res) => {
  const { serial, partition, confirmation } = req.body;
  
  if (!commandExists('fastboot')) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'Fastboot is not installed or not in PATH', null, 503);
  }

  if (!serial || !partition) {
    return res.sendError('VALIDATION_ERROR', 'Serial and partition are required', null, 400);
  }

  // Policy check: blocked partitions
  if (BLOCKED_PARTITIONS.includes(partition.toLowerCase())) {
    return res.sendPolicyBlocked(`Partition "${partition}" cannot be erased for safety reasons`, {
      partition,
      blockedPartitions: BLOCKED_PARTITIONS
    });
  }

  // Policy check: warn for non-standard partitions
  if (!ALLOWED_PARTITIONS.includes(partition.toLowerCase())) {
    // Allow but warn
    console.warn(`[Fastboot] Erasing non-standard partition: ${partition}`);
  }

  // Confirmation check
  const expectedConfirmation = `ERASE ${partition}`.toUpperCase();
  if (!confirmation || confirmation.toUpperCase() !== expectedConfirmation) {
    return res.sendConfirmationRequired(`You must type "${expectedConfirmation}" to confirm erasing partition ${partition}`, {
      requiredText: expectedConfirmation,
      partition
    });
  }

  try {
    const output = safeExec(`fastboot -s ${serial} erase ${partition}`);
    
    res.sendEnvelope({
      success: true,
      serial,
      partition,
      output,
      warning: partition === 'userdata' ? 'User data has been erased' : undefined
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Erase operation failed', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/fastboot/reboot
 * Reboot device
 */
router.post('/reboot', requireDeviceLock, (req, res) => {
  const { serial, mode = 'normal' } = req.body;
  
  if (!commandExists('fastboot')) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'Fastboot is not installed or not in PATH', null, 503);
  }

  if (!serial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  try {
    let output;
    if (mode === 'bootloader' || mode === 'fastboot') {
      output = safeExec(`fastboot -s ${serial} reboot-bootloader`);
    } else if (mode === 'recovery') {
      output = safeExec(`fastboot -s ${serial} reboot recovery`);
    } else {
      output = safeExec(`fastboot -s ${serial} reboot`);
    }
    
    res.sendEnvelope({
      success: true,
      serial,
      mode,
      output
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Reboot operation failed', { error: error.message }, 500);
  }
});

export default router;

