/**
 * iOS Backup and Restore API endpoints (v1)
 * Implements iOS device backup and restore using idevicebackup2
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { safeSpawn, commandExistsSafe } from '../../../utils/safe-exec.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const execAsync = promisify(exec);

// Backup storage directory
const BACKUP_DIR = process.env.BW_IOS_BACKUP_DIR || (process.platform === 'win32'
  ? path.join(process.env.LOCALAPPDATA || process.env.APPDATA || process.cwd(), 'BobbysWorkshop', 'ios-backups')
  : path.join(process.env.HOME || process.cwd(), '.local', 'share', 'bobbys-workshop', 'ios-backups'));

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// In-memory storage for backup jobs (in production, use database)
const backupJobs = new Map();
const backupMetadata = new Map();

/**
 * Sanitize UDID input
 */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }
  return input.replace(/[^a-zA-Z0-9\-]/g, '');
}

/**
 * Generate backup ID
 */
function generateBackupId() {
  return `backup-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Get backup directory for a device
 */
function getDeviceBackupDir(udid) {
  return path.join(BACKUP_DIR, sanitizeInput(udid));
}

/**
 * POST /api/v1/ios/backup/start
 * Start iOS backup
 */
router.post('/start', async (req, res) => {
  try {
    const { udid, encrypted, password } = req.body;

    if (!udid) {
      return res.sendError('VALIDATION_ERROR', 'Device UDID is required', null, 400);
    }

    const sanitizedUdid = sanitizeInput(udid);

    // Check if idevicebackup2 is available
    if (!(await commandExistsSafe('idevicebackup2'))) {
      return res.sendError('TOOL_NOT_AVAILABLE', 'idevicebackup2 not installed', {
        installInstructions: 'Install libimobiledevice: brew install libimobiledevice (macOS) or apt-get install libimobiledevice-utils (Linux)',
        tool: 'idevicebackup2'
      }, 503);
    }

    // Create backup directory
    const deviceBackupDir = getDeviceBackupDir(sanitizedUdid);
    if (!fs.existsSync(deviceBackupDir)) {
      fs.mkdirSync(deviceBackupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = generateBackupId();
    const backupPath = path.join(deviceBackupDir, `backup_${timestamp}`);

    // Create backup job
    const job = {
      id: backupId,
      udid: sanitizedUdid,
      backupPath,
      status: 'starting',
      progress: 0,
      createdAt: Date.now(),
      encrypted: encrypted || false
    };

    backupJobs.set(backupId, job);

    // Start backup process (async)
    startBackupProcess(job, password).catch(err => {
      const currentJob = backupJobs.get(backupId);
      if (currentJob) {
        currentJob.status = 'failed';
        currentJob.error = err.message;
      }
    });

    res.sendEnvelope({
      jobId: backupId,
      udid: sanitizedUdid,
      backupPath,
      status: 'starting',
      message: 'Backup started'
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to start backup', { error: error.message }, 500);
  }
});

/**
 * Start backup process (background)
 */
async function startBackupProcess(job, password) {
  const { id, udid, backupPath, encrypted } = job;

  try {
    job.status = 'running';
    job.progress = 0;

    // Create backup directory
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    // Build idevicebackup2 command
    const args = ['-u', udid, 'backup', backupPath];
    if (encrypted && password) {
      args.push('--full');
      // Note: In real implementation, password would need to be passed securely
      // idevicebackup2 prompts for password interactively
    }

    // Execute backup
    const result = await safeSpawn('idevicebackup2', args, {
      timeout: 3600000, // 1 hour timeout
      env: password ? { ...process.env, IDEVICE_BACKUP_PASSWORD: password } : process.env
    });

    if (result.success) {
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = Date.now();

      // Save backup metadata
      const metadata = {
        id: job.id,
        udid,
        backupPath,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        encrypted,
        size: getBackupSize(backupPath)
      };

      backupMetadata.set(id, metadata);

      // Also save to disk
      const metadataFile = path.join(backupPath, 'backup_metadata.json');
      fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
    } else {
      job.status = 'failed';
      job.error = result.error || result.stderr || 'Backup failed';
    }
  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
  }
}

/**
 * Get backup size
 */
function getBackupSize(backupPath) {
  try {
    let totalSize = 0;
    const files = fs.readdirSync(backupPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(backupPath, file.name);
      if (file.isDirectory()) {
        totalSize += getBackupSize(filePath);
      } else {
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }
    }

    return totalSize;
  } catch {
    return 0;
  }
}

/**
 * GET /api/v1/ios/backup/status/:jobId
 * Get backup status
 */
router.get('/status/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = backupJobs.get(jobId);

    if (!job) {
      return res.sendError('NOT_FOUND', `Backup job ${jobId} not found`, null, 404);
    }

    res.sendEnvelope({
      jobId: job.id,
      udid: job.udid,
      status: job.status,
      progress: job.progress,
      backupPath: job.backupPath,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      error: job.error
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get backup status', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/ios/backups
 * List all backups (for all devices or specific UDID)
 */
router.get('/backups', (req, res) => {
  try {
    const { udid } = req.query;
    let backups = Array.from(backupMetadata.values());

    // Filter by UDID if provided
    if (udid) {
      const sanitizedUdid = sanitizeInput(udid);
      backups = backups.filter(b => b.udid === sanitizedUdid);
    }

    // Also scan disk for backups not in memory
    if (fs.existsSync(BACKUP_DIR)) {
      const deviceDirs = fs.readdirSync(BACKUP_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory());

      for (const deviceDir of deviceDirs) {
        const devicePath = path.join(BACKUP_DIR, deviceDir.name);
        const backupDirs = fs.readdirSync(devicePath, { withFileTypes: true })
          .filter(d => d.isDirectory() && d.name.startsWith('backup_'));

        for (const backupDir of backupDirs) {
          const backupPath = path.join(devicePath, backupDir.name);
          const metadataFile = path.join(backupPath, 'backup_metadata.json');

          if (fs.existsSync(metadataFile)) {
            try {
              const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
              if (!backupMetadata.has(metadata.id)) {
                backupMetadata.set(metadata.id, metadata);
                if (!udid || metadata.udid === sanitizeInput(udid)) {
                  backups.push(metadata);
                }
              }
            } catch {
              // Skip invalid metadata files
            }
          }
        }
      }
    }

    // Sort by creation date (newest first)
    backups.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    res.sendEnvelope(backups);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to list backups', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/ios/restore/start
 * Start iOS restore from backup
 */
router.post('/restore/start', async (req, res) => {
  try {
    const { udid, backupId, password } = req.body;

    if (!udid || !backupId) {
      return res.sendError('VALIDATION_ERROR', 'Device UDID and backup ID are required', null, 400);
    }

    const sanitizedUdid = sanitizeInput(udid);

    // Check if idevicebackup2 is available
    if (!(await commandExistsSafe('idevicebackup2'))) {
      return res.sendError('TOOL_NOT_AVAILABLE', 'idevicebackup2 not installed', {
        installInstructions: 'Install libimobiledevice: brew install libimobiledevice (macOS) or apt-get install libimobiledevice-utils (Linux)',
        tool: 'idevicebackup2'
      }, 503);
    }

    // Find backup
    const backup = backupMetadata.get(backupId);
    if (!backup) {
      return res.sendError('NOT_FOUND', `Backup ${backupId} not found`, null, 404);
    }

    // Verify backup path exists
    if (!fs.existsSync(backup.backupPath)) {
      return res.sendError('NOT_FOUND', `Backup directory not found: ${backup.backupPath}`, null, 404);
    }

    const restoreJobId = generateBackupId(); // Reuse function for restore job ID
    const job = {
      id: restoreJobId,
      udid: sanitizedUdid,
      backupId,
      backupPath: backup.backupPath,
      status: 'starting',
      progress: 0,
      createdAt: Date.now()
    };

    backupJobs.set(restoreJobId, job);

    // Start restore process (async)
    startRestoreProcess(job, password).catch(err => {
      const currentJob = backupJobs.get(restoreJobId);
      if (currentJob) {
        currentJob.status = 'failed';
        currentJob.error = err.message;
      }
    });

    res.sendEnvelope({
      jobId: restoreJobId,
      udid: sanitizedUdid,
      backupId,
      status: 'starting',
      message: 'Restore started'
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to start restore', { error: error.message }, 500);
  }
});

/**
 * Start restore process (background)
 */
async function startRestoreProcess(job, password) {
  const { id, udid, backupPath } = job;

  try {
    job.status = 'running';
    job.progress = 0;

    // Build idevicebackup2 restore command
    const args = ['-u', udid, 'restore', backupPath];

    // Execute restore
    const result = await safeSpawn('idevicebackup2', args, {
      timeout: 3600000, // 1 hour timeout
      env: password ? { ...process.env, IDEVICE_BACKUP_PASSWORD: password } : process.env
    });

    if (result.success) {
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = Date.now();
    } else {
      job.status = 'failed';
      job.error = result.error || result.stderr || 'Restore failed';
    }
  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
  }
}

/**
 * DELETE /api/v1/ios/backup/:backupId
 * Delete a backup
 */
router.delete('/:backupId', (req, res) => {
  try {
    const { backupId } = req.params;
    const backup = backupMetadata.get(backupId);

    if (!backup) {
      return res.sendError('NOT_FOUND', `Backup ${backupId} not found`, null, 404);
    }

    // Delete backup directory
    if (fs.existsSync(backup.backupPath)) {
      fs.rmSync(backup.backupPath, { recursive: true, force: true });
    }

    // Remove from metadata
    backupMetadata.delete(backupId);

    res.sendEnvelope({ success: true, message: 'Backup deleted' });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to delete backup', { error: error.message }, 500);
  }
});

export default router;
