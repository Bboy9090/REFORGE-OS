/**
 * Tool Inspection API
 * 
 * Endpoints for inspecting tool availability and device detection.
 * All responses use Operation Envelopes for consistency.
 */

import express from 'express';
import { execSync } from 'child_process';
import os from 'os';
import { createInspectEnvelope, createBatchEnvelope } from '../core/lib/operation-envelope.js';

const router = express.Router();
const IS_WINDOWS = os.platform() === 'win32';

/**
 * Execute a command safely
 * 
 * @param {string} cmd - Command to execute
 * @param {number} timeout - Timeout in milliseconds
 * @returns {string|null} Command output or null if failed
 */
function safeExec(cmd, timeout = 2000) {
  try {
    const result = execSync(cmd, {
      encoding: 'utf-8',
      timeout,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.trim();
  } catch (error) {
    return null;
  }
}

/**
 * Check if a command exists
 * 
 * @param {string} cmd - Command to check
 * @returns {boolean} True if command exists
 */
function commandExists(cmd) {
  try {
    if (IS_WINDOWS) {
      execSync(`where ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    } else {
      execSync(`command -v ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get tool version
 * 
 * @param {string} tool - Tool name
 * @param {string} versionFlag - Version flag (e.g., '--version')
 * @returns {string|null} Version string or null
 */
function getToolVersion(tool, versionFlag = '--version') {
  return safeExec(`${tool} ${versionFlag}`);
}

/**
 * Inspect ADB tool and detect devices
 * 
 * @returns {Object} Inspection result
 */
function inspectADB() {
  const installed = commandExists('adb');
  
  if (!installed) {
    return {
      available: false,
      installed: false,
      version: null,
      devices: [],
      error: 'ADB not found in PATH'
    };
  }

  const version = getToolVersion('adb');
  const devicesRaw = safeExec('adb devices');
  
  const devices = [];
  if (devicesRaw) {
    const lines = devicesRaw.split('\n').slice(1);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        devices.push({
          serial: parts[0],
          state: parts[1],
          transport: 'usb'
        });
      }
    }
  }

  return {
    available: true,
    installed: true,
    version,
    devices,
    deviceCount: devices.length
  };
}

/**
 * Inspect Fastboot tool and detect devices
 * 
 * @returns {Object} Inspection result
 */
function inspectFastboot() {
  const installed = commandExists('fastboot');
  
  if (!installed) {
    return {
      available: false,
      installed: false,
      version: null,
      devices: [],
      error: 'Fastboot not found in PATH'
    };
  }

  const version = getToolVersion('fastboot');
  const devicesRaw = safeExec('fastboot devices');
  
  const devices = [];
  if (devicesRaw) {
    const lines = devicesRaw.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 1) {
        devices.push({
          serial: parts[0],
          mode: parts[1] || 'fastboot',
          transport: 'usb'
        });
      }
    }
  }

  return {
    available: true,
    installed: true,
    version,
    devices,
    deviceCount: devices.length
  };
}

/**
 * Inspect iOS tools (libimobiledevice)
 * 
 * @returns {Object} Inspection result
 */
function inspectIOSTools() {
  const ideviceIdInstalled = commandExists('idevice_id');
  
  if (!ideviceIdInstalled) {
    return {
      available: false,
      installed: false,
      version: null,
      devices: [],
      error: 'libimobiledevice tools not found'
    };
  }

  const version = getToolVersion('idevice_id');
  const devicesRaw = safeExec('idevice_id -l');
  
  const devices = [];
  if (devicesRaw) {
    const lines = devicesRaw.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        devices.push({
          udid: trimmed,
          platform: 'ios',
          transport: 'usb'
        });
      }
    }
  }

  return {
    available: true,
    installed: true,
    version,
    devices,
    deviceCount: devices.length
  };
}

/**
 * POST /api/tools/inspect
 * 
 * Inspect one or more tools for availability and device detection.
 * 
 * Request body:
 * {
 *   "tools": ["adb", "fastboot", "idevice_id"] // or "all"
 * }
 */
router.post('/inspect', (req, res) => {
  try {
    const { tools } = req.body;

    if (!tools) {
      return res.status(400).json({
        error: 'Missing required field: tools',
        message: 'Provide tools array or "all"'
      });
    }

    // Determine which tools to inspect
    let toolsToInspect = [];
    if (tools === 'all') {
      toolsToInspect = ['adb', 'fastboot', 'idevice_id'];
    } else if (Array.isArray(tools)) {
      toolsToInspect = tools;
    } else {
      return res.status(400).json({
        error: 'Invalid tools field',
        message: 'tools must be an array or "all"'
      });
    }

    // Inspect each tool
    const envelopes = [];

    for (const tool of toolsToInspect) {
      let inspectionResult;
      let operation;

      switch (tool) {
        case 'adb':
          operation = 'detect_android_adb';
          inspectionResult = inspectADB();
          break;
        case 'fastboot':
          operation = 'detect_android_fastboot';
          inspectionResult = inspectFastboot();
          break;
        case 'idevice_id':
        case 'ios':
          operation = 'detect_ios_devices';
          inspectionResult = inspectIOSTools();
          break;
        default:
          // Unknown tool - create error envelope
          envelopes.push(createInspectEnvelope({
            operation: `detect_${tool}`,
            available: false,
            details: {
              error: `Unknown tool: ${tool}`,
              supported: ['adb', 'fastboot', 'idevice_id']
            }
          }));
          continue;
      }

      // Create envelope for this tool
      const envelope = createInspectEnvelope({
        operation,
        available: inspectionResult.available,
        details: inspectionResult,
        metadata: {
          tool,
          platform: os.platform(),
          architecture: os.arch()
        }
      });

      envelopes.push(envelope);
    }

    // If single tool, return single envelope
    if (envelopes.length === 1) {
      return res.json(envelopes[0]);
    }

    // Multiple tools - return batch envelope
    const batchEnvelope = createBatchEnvelope(envelopes, {
      requestedTools: toolsToInspect,
      inspectionCount: envelopes.length
    });

    res.json(batchEnvelope);
  } catch (error) {
    console.error('Tool inspection error:', error);

    const envelope = createInspectEnvelope({
      operation: 'tools_inspect',
      available: false,
      details: {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });

    res.status(500).json(envelope);
  }
});

/**
 * GET /api/tools/inspect/:tool
 * 
 * Inspect a single tool by name.
 */
router.get('/inspect/:tool', (req, res) => {
  const { tool } = req.params;

  try {
    let inspectionResult;
    let operation;

    switch (tool) {
      case 'adb':
        operation = 'detect_android_adb';
        inspectionResult = inspectADB();
        break;
      case 'fastboot':
        operation = 'detect_android_fastboot';
        inspectionResult = inspectFastboot();
        break;
      case 'idevice_id':
      case 'ios':
        operation = 'detect_ios_devices';
        inspectionResult = inspectIOSTools();
        break;
      default:
        const envelope = createInspectEnvelope({
          operation: `detect_${tool}`,
          available: false,
          details: {
            error: `Unknown tool: ${tool}`,
            supported: ['adb', 'fastboot', 'idevice_id', 'ios']
          }
        });
        return res.status(404).json(envelope);
    }

    const envelope = createInspectEnvelope({
      operation,
      available: inspectionResult.available,
      details: inspectionResult,
      metadata: {
        tool,
        platform: os.platform(),
        architecture: os.arch()
      }
    });

    res.json(envelope);
  } catch (error) {
    console.error(`Tool inspection error (${tool}):`, error);

    const envelope = createInspectEnvelope({
      operation: `detect_${tool}`,
      available: false,
      details: {
        error: error.message
      }
    });

    res.status(500).json(envelope);
  }
});

/**
 * GET /api/tools/available
 * 
 * Quick check of which tools are available (just installed check, no device detection).
 */
router.get('/available', (req, res) => {
  try {
    const tools = {
      adb: commandExists('adb'),
      fastboot: commandExists('fastboot'),
      idevice_id: commandExists('idevice_id')
    };

    const envelope = createInspectEnvelope({
      operation: 'tools_availability_check',
      available: true,
      details: {
        tools,
        availableCount: Object.values(tools).filter(Boolean).length,
        totalCount: Object.keys(tools).length
      },
      metadata: {
        checkType: 'quick_availability',
        platform: os.platform()
      }
    });

    res.json(envelope);
  } catch (error) {
    const envelope = createInspectEnvelope({
      operation: 'tools_availability_check',
      available: false,
      details: {
        error: error.message
      }
    });

    res.status(500).json(envelope);
  }
});

export default router;
