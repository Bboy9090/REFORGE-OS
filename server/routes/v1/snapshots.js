/**
 * Diagnostic Snapshots API endpoints (v1)
 * Implements diagnostic snapshot creation and management
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Snapshot storage directory
const SNAPSHOT_DIR = process.env.BW_SNAPSHOT_DIR || (process.platform === 'win32'
  ? path.join(process.env.LOCALAPPDATA || process.env.APPDATA || process.cwd(), 'BobbysWorkshop', 'snapshots')
  : path.join(process.env.HOME || process.cwd(), '.local', 'share', 'bobbys-workshop', 'snapshots'));

// Ensure snapshot directory exists
if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

// In-memory storage for snapshots (in production, use database)
const snapshotStore = new Map();

// Default retention policy
const DEFAULT_RETENTION_POLICY = {
  maxSnapshots: 100,
  maxAgeDays: 30,
  autoDelete: true
};

/**
 * Generate snapshot ID
 */
function generateSnapshotId() {
  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * POST /api/v1/snapshots/create
 * Create a diagnostic snapshot
 */
router.post('/create', (req, res) => {
  try {
    const { deviceId, deviceType, data, metadata } = req.body;

    if (!deviceId || !deviceType || !data) {
      return res.sendError('VALIDATION_ERROR', 'deviceId, deviceType, and data are required', null, 400);
    }

    const snapshot = {
      id: generateSnapshotId(),
      deviceId,
      deviceType,
      data,
      metadata: metadata || {},
      timestamp: Date.now(),
      size: JSON.stringify(data).length
    };

    snapshotStore.set(snapshot.id, snapshot);

    // Save to disk
    const snapshotFile = path.join(SNAPSHOT_DIR, `${snapshot.id}.json`);
    fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2));

    // Apply retention policy
    applyRetentionPolicy();

    res.sendEnvelope(snapshot);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to create snapshot', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/snapshots
 * List all snapshots
 */
router.get('/', (req, res) => {
  try {
    const { deviceId, deviceType } = req.query;
    let snapshots = Array.from(snapshotStore.values());

    // Filter by deviceId if provided
    if (deviceId) {
      snapshots = snapshots.filter(s => s.deviceId === deviceId);
    }

    // Filter by deviceType if provided
    if (deviceType) {
      snapshots = snapshots.filter(s => s.deviceType === deviceType);
    }

    // Also load from disk
    if (fs.existsSync(SNAPSHOT_DIR)) {
      const files = fs.readdirSync(SNAPSHOT_DIR, { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.json'));

      for (const file of files) {
        const filePath = path.join(SNAPSHOT_DIR, file.name);
        const snapshotId = file.name.replace('.json', '');

        if (!snapshotStore.has(snapshotId)) {
          try {
            const snapshot = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            snapshotStore.set(snapshotId, snapshot);
            if ((!deviceId || snapshot.deviceId === deviceId) &&
                (!deviceType || snapshot.deviceType === deviceType)) {
              snapshots.push(snapshot);
            }
          } catch {
            // Skip invalid snapshot files
          }
        }
      }
    }

    // Sort by timestamp (newest first)
    snapshots.sort((a, b) => b.timestamp - a.timestamp);

    res.sendEnvelope(snapshots);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to list snapshots', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/snapshots/:id
 * Get a specific snapshot
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    let snapshot = snapshotStore.get(id);

    if (!snapshot) {
      // Try to load from disk
      const snapshotFile = path.join(SNAPSHOT_DIR, `${id}.json`);
      if (fs.existsSync(snapshotFile)) {
        snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
        snapshotStore.set(id, snapshot);
      } else {
        return res.sendError('NOT_FOUND', `Snapshot ${id} not found`, null, 404);
      }
    }

    res.sendEnvelope(snapshot);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get snapshot', { error: error.message }, 500);
  }
});

/**
 * DELETE /api/v1/snapshots/:id
 * Delete a snapshot
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = snapshotStore.get(id);

    if (!snapshot) {
      return res.sendError('NOT_FOUND', `Snapshot ${id} not found`, null, 404);
    }

    // Delete from memory
    snapshotStore.delete(id);

    // Delete from disk
    const snapshotFile = path.join(SNAPSHOT_DIR, `${id}.json`);
    if (fs.existsSync(snapshotFile)) {
      fs.unlinkSync(snapshotFile);
    }

    res.sendEnvelope({ success: true, message: 'Snapshot deleted' });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to delete snapshot', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/snapshots/retention
 * Get snapshot retention policy
 */
router.get('/retention', (req, res) => {
  try {
    const policy = {
      ...DEFAULT_RETENTION_POLICY,
      currentSnapshotCount: snapshotStore.size,
      snapshotDirectory: SNAPSHOT_DIR
    };

    res.sendEnvelope(policy);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get retention policy', { error: error.message }, 500);
  }
});

/**
 * Apply retention policy (delete old snapshots)
 */
function applyRetentionPolicy() {
  const policy = DEFAULT_RETENTION_POLICY;
  if (!policy.autoDelete) {
    return;
  }

  const snapshots = Array.from(snapshotStore.values());
  
  // Sort by timestamp (oldest first)
  snapshots.sort((a, b) => a.timestamp - b.timestamp);

  const now = Date.now();
  const maxAgeMs = policy.maxAgeDays * 24 * 60 * 60 * 1000;

  // Delete snapshots older than maxAgeDays
  for (const snapshot of snapshots) {
    if (now - snapshot.timestamp > maxAgeMs) {
      snapshotStore.delete(snapshot.id);
      const snapshotFile = path.join(SNAPSHOT_DIR, `${snapshot.id}.json`);
      if (fs.existsSync(snapshotFile)) {
        try {
          fs.unlinkSync(snapshotFile);
        } catch {
          // Ignore deletion errors
        }
      }
    }
  }

  // If still over maxSnapshots limit, delete oldest
  const remaining = Array.from(snapshotStore.values());
  if (remaining.length > policy.maxSnapshots) {
    remaining.sort((a, b) => a.timestamp - b.timestamp);
    const toDelete = remaining.slice(0, remaining.length - policy.maxSnapshots);
    
    for (const snapshot of toDelete) {
      snapshotStore.delete(snapshot.id);
      const snapshotFile = path.join(SNAPSHOT_DIR, `${snapshot.id}.json`);
      if (fs.existsSync(snapshotFile)) {
        try {
          fs.unlinkSync(snapshotFile);
        } catch {
          // Ignore deletion errors
        }
      }
    }
  }
}

export default router;
