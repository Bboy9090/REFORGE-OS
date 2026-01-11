/**
 * ADB API endpoints (migrated to v1 with envelope)
 */

import express from 'express';
import { execSync, spawn } from 'child_process';

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

/**
 * GET /api/v1/adb/devices
 * List ADB devices
 */
router.get('/devices', (req, res) => {
  if (!commandExists('adb')) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'ADB is not installed or not in PATH', {
      tool: 'adb',
      installInstructions: 'Install Android SDK Platform Tools from https://developer.android.com/studio/releases/platform-tools'
    }, 503);
  }

  try {
    const output = safeExec('adb devices -l');
    if (!output) {
      return res.sendEnvelope({ devices: [], count: 0 });
    }

    const lines = output.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('List of devices');
    });

    const devices = lines.map(line => {
      const parts = line.split(/\s+/);
      const serial = parts[0];
      const status = parts[1] || 'unknown';
      const properties = {};

      // Parse properties (model:, device:, etc.)
      const propMatches = line.matchAll(/(\w+):([^\s]+)/g);
      for (const match of propMatches) {
        properties[match[1]] = match[2];
      }

      return {
        serial,
        status,
        properties,
        connected: status === 'device'
      };
    }).filter(d => d.serial !== 'no' && d.serial !== 'devices');

    res.sendEnvelope({ devices, count: devices.length });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to list ADB devices', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/adb/command
 * Execute ADB command
 */
router.post('/command', (req, res) => {
  const { serial, command } = req.body;

  if (!commandExists('adb')) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'ADB is not installed or not in PATH', null, 503);
  }

  if (!command) {
    return res.sendError('VALIDATION_ERROR', 'Command is required', null, 400);
  }

  try {
    const cmd = serial ? `adb -s ${serial} ${command}` : `adb ${command}`;
    const output = safeExec(cmd);
    
    res.sendEnvelope({
      command: cmd,
      output,
      success: true
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'ADB command execution failed', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/adb/device-info
 * Get detailed device information
 */
router.get('/device-info', (req, res) => {
  const { serial } = req.query;

  if (!commandExists('adb')) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'ADB is not installed or not in PATH', null, 503);
  }

  if (!serial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  try {
    const getprop = (prop) => safeExec(`adb -s ${serial} shell getprop ${prop}`);

    const info = {
      serial,
      model: getprop('ro.product.model'),
      manufacturer: getprop('ro.product.manufacturer'),
      brand: getprop('ro.product.brand'),
      device: getprop('ro.product.device'),
      androidVersion: getprop('ro.build.version.release'),
      sdkVersion: getprop('ro.build.version.sdk'),
      fingerprint: getprop('ro.build.fingerprint'),
      buildId: getprop('ro.build.id'),
      bootloader: getprop('ro.bootloader'),
      baseband: getprop('ro.baseband'),
      hardware: getprop('ro.hardware'),
      batteryLevel: safeExec(`adb -s ${serial} shell dumpsys battery | grep level`),
    };

    res.sendEnvelope(info);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get device information', { error: error.message }, 500);
  }
});

export default router;

