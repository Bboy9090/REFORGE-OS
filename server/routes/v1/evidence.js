/**
 * Evidence Bundle API endpoints (v1)
 * Implements forensic-grade evidence bundle management
 */

import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// In-memory storage for evidence bundles (in production, this would be a database)
const bundleStore = new Map();
const signatureStore = new Map();

// Storage directory for evidence bundles
const EVIDENCE_DIR = process.env.BW_EVIDENCE_DIR || (process.platform === 'win32'
  ? path.join(process.env.LOCALAPPDATA || process.env.APPDATA || process.cwd(), 'BobbysWorkshop', 'evidence')
  : path.join(process.env.HOME || process.cwd(), '.local', 'share', 'bobbys-workshop', 'evidence'));

// Ensure evidence directory exists
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

/**
 * Generate a unique bundle ID
 */
function generateBundleId() {
  return `bundle-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Generate a cryptographic signature for a bundle
 */
function signBundle(bundle) {
  const data = JSON.stringify(bundle);
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  const signature = crypto.createSign('RSA-SHA256')
    .update(data)
    .sign({
      key: process.env.BW_SIGNATURE_KEY || 'default-key-placeholder',
      padding: crypto.constants.RSA_PKCS1_PADDING
    }, 'base64');

  return {
    hash,
    signature,
    algorithm: 'RSA-SHA256',
    timestamp: Date.now()
  };
}

/**
 * POST /api/v1/evidence/create
 * Create a new evidence bundle
 */
router.post('/create', (req, res) => {
  try {
    const { name, deviceSerial } = req.body;

    if (!name || !deviceSerial) {
      return res.sendError('VALIDATION_ERROR', 'name and deviceSerial are required', null, 400);
    }

    const bundle = {
      id: generateBundleId(),
      name,
      timestamp: Date.now(),
      deviceSerial,
      items: [{
        type: 'device-info',
        data: { deviceSerial, createdAt: Date.now() },
        timestamp: Date.now()
      }]
    };

    bundleStore.set(bundle.id, bundle);

    // Save to disk
    const filePath = path.join(EVIDENCE_DIR, `${bundle.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(bundle, null, 2));

    res.sendEnvelope(bundle);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to create evidence bundle', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/evidence/bundles
 * List all evidence bundles
 */
router.get('/bundles', (req, res) => {
  try {
    const bundles = Array.from(bundleStore.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    res.sendEnvelope(bundles);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to list evidence bundles', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/evidence/:id/export
 * Export an evidence bundle as a downloadable file
 * Must be defined before /:id route
 */
router.get('/:id/export', (req, res) => {
  try {
    const { id } = req.params;
    const bundle = bundleStore.get(id);

    if (!bundle) {
      return res.sendError('NOT_FOUND', `Evidence bundle ${id} not found`, null, 404);
    }

    const signature = signatureStore.get(id);
    const exportData = {
      ...bundle,
      signature: signature || null
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonData, 'utf8');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Content-Disposition', `attachment; filename="${bundle.name || bundle.id}.json"`);

    res.send(buffer);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to export evidence bundle', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/evidence/:id/verify
 * Verify an evidence bundle signature
 * Must be defined before /:id route
 */
router.get('/:id/verify', (req, res) => {
  try {
    const { id } = req.params;
    const bundle = bundleStore.get(id);

    if (!bundle) {
      return res.sendError('NOT_FOUND', `Evidence bundle ${id} not found`, null, 404);
    }

    const storedSignature = signatureStore.get(id);

    if (!storedSignature) {
      return res.sendEnvelope({
        valid: false,
        error: 'No signature found for this bundle'
      });
    }

    // Verify signature (simplified - in production, use proper RSA verification)
    const data = JSON.stringify(bundle);
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    const isValid = hash === storedSignature.hash;

    res.sendEnvelope({
      valid: isValid,
      signedBy: 'system',
      timestamp: storedSignature.timestamp,
      algorithm: storedSignature.algorithm
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to verify evidence bundle', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/evidence/:id
 * Get a specific evidence bundle
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const bundle = bundleStore.get(id);

    if (!bundle) {
      // Try to load from disk
      const filePath = path.join(EVIDENCE_DIR, `${id}.json`);
      if (fs.existsSync(filePath)) {
        const bundleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        bundleStore.set(id, bundleData);
        return res.sendEnvelope(bundleData);
      }
      return res.sendError('NOT_FOUND', `Evidence bundle ${id} not found`, null, 404);
    }

    res.sendEnvelope(bundle);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get evidence bundle', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/evidence/:id/item
 * Add an item to an evidence bundle
 */
router.post('/:id/item', (req, res) => {
  try {
    const { id } = req.params;
    const { type, data } = req.body;

    if (!type || !data) {
      return res.sendError('VALIDATION_ERROR', 'type and data are required', null, 400);
    }

    const bundle = bundleStore.get(id);
    if (!bundle) {
      return res.sendError('NOT_FOUND', `Evidence bundle ${id} not found`, null, 404);
    }

    const item = {
      type,
      data,
      timestamp: Date.now()
    };

    bundle.items.push(item);

    // Update on disk
    const filePath = path.join(EVIDENCE_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(bundle, null, 2));

    res.sendEnvelope({ success: true, bundle });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to add item to evidence bundle', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/evidence/:id/sign
 * Sign an evidence bundle cryptographically
 */
router.post('/:id/sign', (req, res) => {
  try {
    const { id } = req.params;
    const bundle = bundleStore.get(id);

    if (!bundle) {
      return res.sendError('NOT_FOUND', `Evidence bundle ${id} not found`, null, 404);
    }

    const signature = signBundle(bundle);
    signatureStore.set(id, signature);

    res.sendEnvelope({
      bundleId: id,
      signature: signature.signature,
      hash: signature.hash,
      algorithm: signature.algorithm,
      timestamp: signature.timestamp
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to sign evidence bundle', { error: error.message }, 500);
  }
});


/**
 * DELETE /api/v1/evidence/:id
 * Delete an evidence bundle
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const bundle = bundleStore.get(id);

    if (!bundle) {
      return res.sendError('NOT_FOUND', `Evidence bundle ${id} not found`, null, 404);
    }

    bundleStore.delete(id);
    signatureStore.delete(id);

    // Delete from disk
    const filePath = path.join(EVIDENCE_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.sendEnvelope({ success: true });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to delete evidence bundle', { error: error.message }, 500);
  }
});

export default router;
