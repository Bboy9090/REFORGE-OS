/**
 * GET /api/v1/ready
 * 
 * Server readiness and version compatibility endpoint
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_VERSION = 'v1';
const FRONTEND_MIN_VERSION = '2.0.0'; // Minimum required frontend version

// Read package.json for server version
let serverVersion = 'unknown';
try {
  const packagePath = path.resolve(__dirname, '../../../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  serverVersion = packageJson.version || 'unknown';
} catch (err) {
  console.warn('[Ready] Failed to read package.json version:', err);
}

// Get git commit (optional)
let gitCommit = null;
try {
  const gitHeadPath = path.resolve(__dirname, '../../../.git/HEAD');
  if (fs.existsSync(gitHeadPath)) {
    const headContent = fs.readFileSync(gitHeadPath, 'utf-8').trim();
    if (headContent.startsWith('ref: ')) {
      const refPath = path.resolve(__dirname, '../../../.git', headContent.substring(5));
      if (fs.existsSync(refPath)) {
        gitCommit = fs.readFileSync(refPath, 'utf-8').trim().substring(0, 7);
      }
    } else {
      gitCommit = headContent.substring(0, 7);
    }
  }
} catch (err) {
  // Git commit is optional, fail silently
}

/**
 * Feature flags based on environment and tool availability
 */
function getFeatureFlags() {
  const demoMode = process.env.DEMO_MODE === '1';
  const allowBootloaderUnlock = process.env.ALLOW_BOOTLOADER_UNLOCK === '1';
  const allowFirmwareDownload = process.env.ALLOW_FIRMWARE_DOWNLOAD === '1';
  
  return {
    demoMode,
    trapdoorEnabled: true, // Always enabled (gated by auth)
    iosEnabled: true, // iOS tooling available if libimobiledevice present
    androidEnabled: true, // Android tooling available if adb/fastboot present
    firmwareEnabled: allowFirmwareDownload,
    monitoringEnabled: false, // Not yet implemented
    testsEnabled: false, // Not yet implemented
    bootloaderUnlockEnabled: allowBootloaderUnlock,
    flashOperationsEnabled: true
  };
}

export function readyHandler(req, res) {
  const featureFlags = getFeatureFlags();
  
  const response = {
    serverVersion,
    apiVersion: API_VERSION,
    ...(gitCommit && { gitCommit }),
    featureFlags,
    requiredFrontendMinVersion: FRONTEND_MIN_VERSION,
    compatibleFrontendRange: `>=${FRONTEND_MIN_VERSION}`, // Semver range
    timestamp: new Date().toISOString()
  };
  
  res.sendEnvelope(response);
}

