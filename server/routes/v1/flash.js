/**
 * Flash Operations API endpoints (v1)
 * 
 * Manages flash job operations with progress tracking
 */

import express from 'express';
import { execSync } from 'child_process';
import { getToolPath } from '../../tools-manager.js';
import { flashHistory, activeFlashJobs, jobCounter as sharedJobCounter, broadcastFlashProgress, simulateFlashOperation } from './flash-shared.js';

const router = express.Router();

let flashJobCounter = sharedJobCounter || 1;

// Helper functions (similar to server/index.js)
function safeExec(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 5000, ...options }).trim();
  } catch {
    return null;
  }
}

function commandExists(cmd) {
  try {
    if (process.platform === 'win32') {
      execSync(`where ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    } else {
      execSync(`command -v ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    }
    return true;
  } catch {
    return false;
  }
}

function getToolCommand(toolBaseName) {
  const resolvedPath = getToolPath(toolBaseName);
  if (resolvedPath) {
    return `"${resolvedPath}"`;
  }
  return toolBaseName;
}

/**
 * GET /api/v1/flash/devices
 * Get devices available for flashing (combined ADB + Fastboot)
 */
router.get('/devices', async (req, res) => {
  try {
    const devices = [];
    
    if (commandExists('adb')) {
      const adbOutput = safeExec('adb devices -l');
      if (adbOutput) {
        const lines = adbOutput.split('\n').slice(1).filter(l => l.trim());
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const serial = parts[0];
          const state = parts[1];
          const infoStr = parts.slice(2).join(' ');
          
          if (serial && state && state !== 'unauthorized' && state !== 'offline') {
            const model = infoStr.match(/model:(\S+)/)?.[1] || 'Unknown';
            const product = infoStr.match(/product:(\S+)/)?.[1] || 'Unknown';
            
            devices.push({
              serial,
              brand: 'Android',
              model: model.replace(/_/g, ' '),
              mode: state === 'device' ? 'Normal OS' : state,
              capabilities: state === 'device' 
                ? ['adb-sideload'] 
                : state === 'recovery' 
                ? ['adb-sideload'] 
                : [],
              connectionType: 'usb',
              isBootloader: state === 'bootloader',
              isRecovery: state === 'recovery',
              isDFU: false,
              isEDL: false
            });
          }
        }
      }
    }
    
    if (commandExists('fastboot')) {
      const fastbootOutput = safeExec('fastboot devices');
      if (fastbootOutput) {
        const lines = fastbootOutput.split('\n').filter(l => l.trim());
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const serial = parts[0];
          const mode = parts[1] || 'fastboot';
          
          if (serial) {
            const existing = devices.find(d => d.serial === serial);
            if (existing) {
              existing.isBootloader = true;
              existing.capabilities.push('fastboot');
            } else {
              devices.push({
                serial,
                brand: 'Android',
                model: 'Unknown',
                mode: 'Fastboot',
                capabilities: ['fastboot'],
                connectionType: 'usb',
                isBootloader: true,
                isRecovery: false,
                isDFU: false,
                isEDL: false
              });
            }
          }
        }
      }
    }
    
    res.sendEnvelope({
      success: true,
      count: devices.length,
      devices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Device scan failed', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/flash/devices/:serial
 * Get detailed device information for flashing
 */
router.get('/devices/:serial', async (req, res) => {
  const { serial } = req.params;
  
  try {
    const adbCmd = getToolCommand('adb');
    const fastbootCmd = getToolCommand('fastboot');

    let deviceInfo = {
      serial,
      found: false
    };
    
    if (commandExists('adb')) {
      const adbDevices = safeExec(`${adbCmd} devices`);
      if (adbDevices && adbDevices.includes(serial)) {
        const props = safeExec(`${adbCmd} -s ${serial} shell getprop`);
        if (props) {
          deviceInfo = {
            serial,
            found: true,
            source: 'adb',
            manufacturer: props.match(/\[ro\.product\.manufacturer\]:\s*\[(.*?)\]/)?.[1],
            brand: props.match(/\[ro\.product\.brand\]:\s*\[(.*?)\]/)?.[1],
            model: props.match(/\[ro\.product\.model\]:\s*\[(.*?)\]/)?.[1],
            androidVersion: props.match(/\[ro\.build\.version\.release\]:\s*\[(.*?)\]/)?.[1],
            sdkVersion: props.match(/\[ro\.build\.version\.sdk\]:\s*\[(.*?)\]/)?.[1],
            buildId: props.match(/\[ro\.build\.id\]:\s*\[(.*?)\]/)?.[1]
          };
        }
      }
    }
    
    if (!deviceInfo.found && commandExists('fastboot')) {
      const fastbootDevices = safeExec(`${fastbootCmd} devices`);
      if (fastbootDevices && fastbootDevices.includes(serial)) {
        const extractValue = (output) => {
          if (!output) return null;
          const match = output.match(/:\s*(.+)/);
          return match ? match[1].trim() : null;
        };
        
        deviceInfo = {
          serial,
          found: true,
          source: 'fastboot',
          product: extractValue(safeExec(`fastboot -s ${serial} getvar product 2>&1`)),
          variant: extractValue(safeExec(`fastboot -s ${serial} getvar variant 2>&1`)),
          bootloaderVersion: extractValue(safeExec(`fastboot -s ${serial} getvar version-bootloader 2>&1`)),
          unlocked: extractValue(safeExec(`fastboot -s ${serial} getvar unlocked 2>&1`))
        };
      }
    }
    
    if (!deviceInfo.found) {
      return res.sendError('NOT_FOUND', 'Device not found', { serial }, 404);
    }
    
    res.sendEnvelope({
      success: true,
      device: deviceInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get device info', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/flash/devices/:serial/partitions
 * Get available partitions for a device
 */
router.get('/devices/:serial/partitions', async (req, res) => {
  const { serial } = req.params;
  
  try {
    // In a real implementation, this would query the device for partitions
    // For now, return common partition list
    const partitions = ['boot', 'system', 'vendor', 'recovery', 'userdata', 
                       'cache', 'vbmeta', 'dtbo', 'persist'];
    
    res.sendEnvelope({
      success: true,
      serial,
      partitions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get partitions', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/flash/validate-image
 * Validate a flash image file
 */
router.post('/validate-image', async (req, res) => {
  const { filePath } = req.body;
  
  if (!filePath) {
    return res.sendError('VALIDATION_ERROR', 'File path required', null, 400);
  }
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    if (!fs.existsSync(filePath)) {
      return res.sendEnvelope({
        valid: false,
        error: 'File does not exist'
      });
    }
    
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    const validExtensions = ['.img', '.zip', '.tar', '.bin'];
    if (!validExtensions.includes(ext)) {
      return res.sendEnvelope({
        valid: false,
        error: 'Invalid file type'
      });
    }
    
    res.sendEnvelope({
      valid: true,
      type: ext.substring(1),
      size: stats.size,
      path: filePath
    });
  } catch (error) {
    res.sendEnvelope({
      valid: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/flash/start
 * Start a new flash operation
 */
router.post('/start', async (req, res) => {
  const config = req.body;
  
  if (!config.deviceSerial || !config.flashMethod || !config.partitions || config.partitions.length === 0) {
    return res.sendError('VALIDATION_ERROR', 'Missing required fields: deviceSerial, flashMethod, partitions', null, 400);
  }
  
  const jobId = `flash-job-${flashJobCounter++}-${Date.now()}`;
  
  const jobStatus = {
    jobId,
    status: 'queued',
    progress: 0,
    currentStep: 'Initializing',
    totalSteps: config.partitions.length,
    completedSteps: 0,
    bytesWritten: 0,
    totalBytes: config.partitions.reduce((sum, p) => sum + (p.size || 100000000), 0),
    speed: 0,
    timeElapsed: 0,
    timeRemaining: 0,
    logs: [`[${new Date().toISOString()}] Flash job ${jobId} created`],
    startTime: Date.now()
  };
  
  activeFlashJobs.set(jobId, { config, status: jobStatus });
  
  simulateFlashOperation(jobId, config);
  
  res.sendEnvelope({
    success: true,
    jobId,
    status: 'queued',
    deviceSerial: config.deviceSerial,
    startTime: Date.now(),
    message: 'Flash operation queued'
  });
});

/**
 * GET /api/v1/flash/status/:jobId
 * Get status of a flash operation
 */
router.get('/status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = activeFlashJobs.get(jobId);
  
  if (!job) {
    return res.sendError('NOT_FOUND', 'Job not found', { jobId }, 404);
  }
  
  res.sendEnvelope({
    success: true,
    ...job.status
  });
});

/**
 * GET /api/v1/flash/history
 * Get flash operation history
 */
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const limitedHistory = flashHistory.slice(0, limit);
  
  res.sendEnvelope({
    success: true,
    count: limitedHistory.length,
    history: limitedHistory,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/flash/operations/active
 * Get all active flash operations
 */
router.get('/operations/active', async (req, res) => {
  const operations = Array.from(activeFlashJobs.values()).map(job => job.status);
  
  res.sendEnvelope({
    success: true,
    count: operations.length,
    operations,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/v1/flash/pause/:jobId
 * Pause a flash operation
 */
router.post('/pause/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = activeFlashJobs.get(jobId);
  
  if (!job) {
    return res.sendError('NOT_FOUND', 'Job not found', { jobId }, 404);
  }
  
  if (job.status.status !== 'running') {
    return res.sendError('INVALID_STATE', 'Job is not running', { jobId, currentStatus: job.status.status }, 400);
  }
  
  job.status.status = 'paused';
  job.status.logs.push(`[${new Date().toISOString()}] Flash operation paused`);
  
  res.sendEnvelope({
    success: true,
    jobId,
    status: 'paused'
  });
});

/**
 * POST /api/v1/flash/resume/:jobId
 * Resume a paused flash operation
 */
router.post('/resume/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = activeFlashJobs.get(jobId);
  
  if (!job) {
    return res.sendError('NOT_FOUND', 'Job not found', { jobId }, 404);
  }
  
  if (job.status.status !== 'paused') {
    return res.sendError('INVALID_STATE', 'Job is not paused', { jobId, currentStatus: job.status.status }, 400);
  }
  
  job.status.status = 'running';
  job.status.logs.push(`[${new Date().toISOString()}] Flash operation resumed`);
  
  res.sendEnvelope({
    success: true,
    jobId,
    status: 'running'
  });
});

/**
 * POST /api/v1/flash/cancel/:jobId
 * Cancel a flash operation
 */
router.post('/cancel/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = activeFlashJobs.get(jobId);
  
  if (!job) {
    return res.sendError('NOT_FOUND', 'Job not found', { jobId }, 404);
  }
  
  job.status.status = 'cancelled';
  job.status.logs.push(`[${new Date().toISOString()}] Flash operation cancelled`);
  
  broadcastFlashProgress(jobId, {
    type: 'cancelled',
    status: job.status
  });
  
  flashHistory.unshift({
    jobId,
    deviceSerial: job.config.deviceSerial,
    deviceBrand: job.config.deviceBrand,
    flashMethod: job.config.flashMethod,
    partitions: job.config.partitions.map(p => p.name),
    status: 'cancelled',
    startTime: job.status.startTime,
    endTime: Date.now(),
    duration: Math.floor((Date.now() - job.status.startTime) / 1000),
    bytesWritten: 0,
    averageSpeed: 0
  });
  
  activeFlashJobs.delete(jobId);
  
  res.sendEnvelope({
    success: true,
    jobId,
    status: 'cancelled'
  });
});

export default router;

