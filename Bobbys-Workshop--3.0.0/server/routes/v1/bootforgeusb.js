/**
 * BootForgeUSB API endpoints (v1)
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { safeSpawn, commandExistsSafe } from '../../utils/safe-exec.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper functions
async function getBootForgeUsbCommand() {
  const candidates = ['bootforgeusb', 'bootforgeusb-cli'];
  for (const candidate of candidates) {
    if (await commandExistsSafe(candidate)) return candidate;
  }
  return null;
}

async function runBootForgeUsbScanJson() {
  const cmd = await getBootForgeUsbCommand();
  if (!cmd) {
    const err = new Error('BootForgeUSB CLI tool is not installed or not in PATH');
    err.code = 'CLI_NOT_FOUND';
    throw err;
  }

  // New CLI expects: `bootforgeusb scan --json`.
  const args = cmd === 'bootforgeusb' ? ['scan', '--json'] : [];
  const result = await safeSpawn(cmd, args, {
    timeout: 10000
  });

  if (!result.success) {
    const err = new Error(result.error || result.stderr || 'BootForgeUSB scan failed');
    err.code = 'SCAN_FAILED';
    throw err;
  }

  const devices = JSON.parse(result.stdout);
  return { cmd, devices };
}

function generateDemoBootForgeData() {
  const demoDevices = [
    {
      device_uid: "usb-18d1:4ee7-3-2",
      platform_hint: "android",
      mode: "Normal OS (Confirmed)",
      confidence: 0.95,
      evidence: {
        usb: {
          vid: "0x18d1",
          pid: "0x4ee7",
          manufacturer: "Google Inc.",
          product: "Pixel 6",
          serial: "1A2B3C4D5E6F",
          bus: 3,
          address: 2
        }
      },
      matched_tool_ids: ["1A2B3C4D5E6F"],
      correlation_badge: "CORRELATED"
    }
  ];

  return {
    success: true,
    count: demoDevices.length,
    devices: demoDevices,
    timestamp: new Date().toISOString(),
    available: false,
    demo: true,
    message: "Showing demo data - BootForgeUSB CLI not available"
  };
}

/**
 * GET /api/v1/bootforgeusb/scan
 * Scan for USB devices using BootForgeUSB
 */
router.get('/scan', async (req, res) => {
  const cmd = await getBootForgeUsbCommand();
  if (!cmd) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'BootForgeUSB CLI tool is not installed or not in PATH', {
      installInstructions: "Build and install from libs/bootforgeusb: cargo build --release --bin bootforgeusb && cargo install --path . --bin bootforgeusb",
      available: false
    }, 503);
  }

  try {
    const { cmd: usedCmd, devices } = await runBootForgeUsbScanJson();
    
    res.sendEnvelope({
      success: true,
      count: devices.length,
      devices,
      timestamp: new Date().toISOString(),
      available: true,
      command: usedCmd
    });
  } catch (error) {
    if (error.code === 'CLI_NOT_FOUND') {
      return res.sendError('TOOL_NOT_AVAILABLE', error.message, {
        installInstructions: "Build and install from libs/bootforgeusb: cargo build --release --bin bootforgeusb && cargo install --path . --bin bootforgeusb",
        available: false
      }, 503);
    }

    if (error.code === 'ETIMEDOUT') {
      return res.sendError('TIMEOUT', 'BootForgeUSB scan timeout - device scan took too long to complete', {
        available: true
      }, 504);
    }
    
    res.sendError('INTERNAL_ERROR', 'BootForgeUSB scan failed', {
      details: error.message,
      available: true
    }, 500);
  }
});

/**
 * GET /api/v1/bootforgeusb/status
 * Get BootForgeUSB tool status and build environment
 */
router.get('/status', async (req, res) => {
  const cmd = await getBootForgeUsbCommand();
  const cliAvailable = !!cmd;
  const rustcAvailable = await commandExistsSafe("rustc");
  const cargoAvailable = await commandExistsSafe("cargo");
  
  let buildPath = null;
  let libInfo = null;
  
  if (rustcAvailable && cargoAvailable) {
    try {
      const manifestPath = path.join(__dirname, '../../../libs/bootforgeusb/Cargo.toml');
      if (fs.existsSync(manifestPath)) {
        buildPath = path.join(__dirname, '../../../libs/bootforgeusb');
        const manifest = fs.readFileSync(manifestPath, 'utf-8');
        const versionMatch = manifest.match(/version\s*=\s*"([^"]+)"/);
        libInfo = {
          path: buildPath,
          version: versionMatch ? versionMatch[1] : null
        };
      }
    } catch (e) {
      // Ignore errors
    }
  }
  
  const adbAvailable = await commandExistsSafe("adb");
  const fastbootAvailable = await commandExistsSafe("fastboot");
  const ideviceAvailable = await commandExistsSafe("idevice_id");
  
  res.sendEnvelope({
    available: cliAvailable,
    cli: {
      installed: cliAvailable,
      command: cmd || 'bootforgeusb',
      candidates: ['bootforgeusb', 'bootforgeusb-cli']
    },
    buildEnvironment: {
      rust: rustcAvailable,
      cargo: cargoAvailable,
      canBuild: rustcAvailable && cargoAvailable
    },
    library: libInfo,
    systemTools: {
      adb: adbAvailable,
      fastboot: fastbootAvailable,
      idevice_id: ideviceAvailable
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/bootforgeusb/devices/:uid
 * Get specific device by UID
 */
router.get('/devices/:uid', async (req, res) => {
  if (!(await getBootForgeUsbCommand())) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'BootForgeUSB not available', {
      available: false
    }, 503);
  }

  try {
    const { devices } = await runBootForgeUsbScanJson();
    const device = devices.find(d => d.device_uid === req.params.uid);
    
    if (!device) {
      return res.sendError('NOT_FOUND', 'Device not found', {
        uid: req.params.uid
      }, 404);
    }
    
    res.sendEnvelope({
      success: true,
      device,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to look up device', {
      details: error.message
    }, 500);
  }
});

/**
 * GET /api/v1/bootforgeusb/correlate
 * Correlate BootForgeUSB devices with tool outputs
 */
router.get('/correlate', async (req, res) => {
  if (!(await getBootForgeUsbCommand())) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'BootForgeUSB not available', {
      available: false
    }, 503);
  }

  const adbAvailable = await commandExistsSafe("adb");
  const fastbootAvailable = await commandExistsSafe("fastboot");

  try {
    const { devices } = await runBootForgeUsbScanJson();
    
    const correlationResults = devices.map(device => {
      const result = {
        device_uid: device.device_uid,
        platform: device.platform_hint,
        mode: device.mode,
        confidence: device.confidence,
        correlation: {
          method: 'none',
          confidence_boost: 0,
          matched_ids: device.matched_tool_ids || [],
          details: []
        }
      };
      
      if (device.matched_tool_ids && device.matched_tool_ids.length > 0) {
        result.correlation.method = 'tool_confirmed';
        result.correlation.confidence_boost = 0.15;
        result.correlation.details.push(`Correlated via ${device.matched_tool_ids.length} tool ID(s)`);
      } else if (device.mode && device.mode.includes('likely')) {
        result.correlation.method = 'usb_heuristic';
        result.correlation.details.push('USB-only classification, tool confirmation unavailable');
      } else if (device.mode && device.mode.includes('confirmed')) {
        result.correlation.method = 'system_level';
        result.correlation.details.push('System-level tool confirmation');
      }
      
      return result;
    });
    
    res.sendEnvelope({
      success: true,
      count: correlationResults.length,
      devices: correlationResults,
      tools_available: {
        adb: adbAvailable,
        fastboot: fastbootAvailable
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Correlation analysis failed', {
      details: error.message
    }, 500);
  }
});

/**
 * POST /api/v1/bootforgeusb/build
 * Build BootForgeUSB CLI tool from source
 */
router.post('/build', async (req, res) => {
  if (!(await commandExistsSafe("cargo"))) {
    return res.sendError('TOOL_NOT_AVAILABLE', 'Rust toolchain not available - cargo command not found in PATH', null, 503);
  }

  const buildPath = path.join(__dirname, '../../../libs/bootforgeusb');
  
  if (!fs.existsSync(buildPath)) {
    return res.sendError('NOT_FOUND', 'BootForgeUSB source not found', {
      expectedPath: buildPath
    }, 404);
  }

  try {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked'
    });

    res.write(JSON.stringify({ 
      status: 'starting',
      message: 'Building BootForgeUSB CLI...',
      timestamp: new Date().toISOString()
    }) + '\n');

    // Use safeSpawn instead of execSync for security
    const buildResult = await safeSpawn(
      'cargo',
      ['build', '--release', '--bin', 'bootforgeusb'],
      {
        cwd: buildPath,
        timeout: 300000,
      }
    );

    res.write(JSON.stringify({
      status: 'installing',
      message: 'Installing CLI tool...',
      timestamp: new Date().toISOString()
    }) + '\n');

    const installResult = await safeSpawn(
      'cargo',
      ['install', '--path', '.', '--bin', 'bootforgeusb'],
      {
        cwd: buildPath,
        timeout: 60000,
      }
    );

    if (!buildResult.success || !installResult.success) {
      throw new Error(buildResult.error || installResult.error || 'Build or install failed');
    }

    res.write(JSON.stringify({
      status: 'complete',
      message: 'BootForgeUSB CLI built and installed successfully',
      buildOutput: buildResult.stdout ? buildResult.stdout.trim() : '',
      installOutput: installResult.stdout ? installResult.stdout.trim() : '',
      timestamp: new Date().toISOString()
    }) + '\n');

    res.end();
  } catch (error) {
    res.write(JSON.stringify({
      status: 'failed',
      error: 'Build failed',
      details: error.message,
      stderr: error.stderr || null,
      timestamp: new Date().toISOString()
    }) + '\n');
    res.end();
  }
});

export default router;

