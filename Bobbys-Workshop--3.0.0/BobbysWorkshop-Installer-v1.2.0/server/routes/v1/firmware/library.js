/**
 * Firmware Library API
 * 
 * Comprehensive firmware management:
 * - Firmware database (brand/model/version catalog)
 * - Firmware search and filtering
 * - Firmware download management
 * - Firmware verification (checksums, signatures)
 * - Firmware metadata storage
 * 
 * @module firmware-library
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadFirmware } from '../../../firmware-downloader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Firmware database path
const FIRMWARE_DB_PATH = path.join(process.cwd(), 'data', 'firmware-db.json');
const FIRMWARE_STORAGE_PATH = path.join(process.cwd(), 'data', 'firmware');

// Ensure directories exist
function ensureDirectories() {
  const dbDir = path.dirname(FIRMWARE_DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (!fs.existsSync(FIRMWARE_STORAGE_PATH)) {
    fs.mkdirSync(FIRMWARE_STORAGE_PATH, { recursive: true });
  }
}

// Initialize firmware database
function initializeFirmwareDB() {
  ensureDirectories();
  
  if (!fs.existsSync(FIRMWARE_DB_PATH)) {
    const initialDB = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      brands: {},
      metadata: {
        totalFirmware: 0,
        totalSize: 0
      }
    };
    fs.writeFileSync(FIRMWARE_DB_PATH, JSON.stringify(initialDB, null, 2), 'utf8');
    return initialDB;
  }
  
  try {
    const dbContent = fs.readFileSync(FIRMWARE_DB_PATH, 'utf8');
    return JSON.parse(dbContent);
  } catch (error) {
    console.error('[FirmwareDB] Error reading database:', error);
    return initializeFirmwareDB(); // Reset on error
  }
}

// Save firmware database
function saveFirmwareDB(db) {
  db.lastUpdated = new Date().toISOString();
  fs.writeFileSync(FIRMWARE_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

// Get firmware database
function getFirmwareDB() {
  return initializeFirmwareDB();
}

/**
 * Add firmware entry to database
 * @param {Object} firmwareInfo - Firmware information
 */
function addFirmwareToDB(firmwareInfo) {
  const db = getFirmwareDB();
  const { brand, model, version, region, carrier } = firmwareInfo;
  
  if (!db.brands[brand]) {
    db.brands[brand] = {};
  }
  if (!db.brands[brand][model]) {
    db.brands[brand][model] = [];
  }
  
  // Check if firmware already exists
  const existing = db.brands[brand][model].find(f => 
    f.version === version && 
    f.region === region && 
    f.carrier === carrier
  );
  
  if (existing) {
    // Update existing entry
    Object.assign(existing, firmwareInfo);
  } else {
    // Add new entry
    db.brands[brand][model].push(firmwareInfo);
    db.metadata.totalFirmware++;
  }
  
  saveFirmwareDB(db);
  return firmwareInfo;
}

/**
 * Search firmware database
 * @param {Object} filters - Search filters
 */
function searchFirmware(filters = {}) {
  const db = getFirmwareDB();
  const results = [];
  
  const { brand, model, version, region, carrier, minVersion, maxVersion } = filters;
  
  for (const [brandKey, models] of Object.entries(db.brands)) {
    if (brand && brandKey.toLowerCase() !== brand.toLowerCase()) continue;
    
    for (const [modelKey, firmwares] of Object.entries(models)) {
      if (model && modelKey.toLowerCase() !== model.toLowerCase()) continue;
      
      for (const fw of firmwares) {
        if (version && fw.version !== version) continue;
        if (region && fw.region !== region) continue;
        if (carrier && fw.carrier !== carrier) continue;
        
        // Version range filtering (basic semver comparison)
        if (minVersion || maxVersion) {
          // Simple version comparison (can be enhanced with semver library)
          if (minVersion && fw.version < minVersion) continue;
          if (maxVersion && fw.version > maxVersion) continue;
        }
        
        results.push({
          ...fw,
          brand: brandKey,
          model: modelKey
        });
      }
    }
  }
  
  return results;
}

/**
 * GET /api/v1/firmware/library/brands
 * List all available firmware brands
 */
router.get('/brands', (req, res) => {
  try {
    const db = getFirmwareDB();
    const brands = Object.keys(db.brands);
    
    res.sendEnvelope({
      brands,
      count: brands.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get firmware brands', {
      error: error.message
    }, 500);
  }
});

/**
 * GET /api/v1/firmware/library/models/:brand
 * List all models for a brand
 */
router.get('/models/:brand', (req, res) => {
  const { brand } = req.params;
  
  try {
    const db = getFirmwareDB();
    const models = db.brands[brand] ? Object.keys(db.brands[brand]) : [];
    
    res.sendEnvelope({
      brand,
      models,
      count: models.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get models for brand', {
      error: error.message,
      brand
    }, 500);
  }
});

/**
 * GET /api/v1/firmware/library/search
 * Search firmware database
 */
router.get('/search', (req, res) => {
  const { brand, model, version, region, carrier, minVersion, maxVersion } = req.query;
  
  try {
    const results = searchFirmware({
      brand,
      model,
      version,
      region,
      carrier,
      minVersion,
      maxVersion
    });
    
    res.sendEnvelope({
      results,
      count: results.length,
      filters: {
        brand: brand || null,
        model: model || null,
        version: version || null,
        region: region || null,
        carrier: carrier || null,
        minVersion: minVersion || null,
        maxVersion: maxVersion || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to search firmware', {
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/v1/firmware/library/add
 * Add firmware entry to database
 */
router.post('/add', (req, res) => {
  const firmwareInfo = req.body;
  
  const requiredFields = ['brand', 'model', 'version', 'downloadUrl'];
  const missing = requiredFields.filter(field => !firmwareInfo[field]);
  
  if (missing.length > 0) {
    return res.sendError('VALIDATION_ERROR', 'Missing required fields', {
      missing,
      required: requiredFields
    }, 400);
  }
  
  try {
    const addedFirmware = addFirmwareToDB({
      brand: firmwareInfo.brand,
      model: firmwareInfo.model,
      version: firmwareInfo.version,
      region: firmwareInfo.region || 'global',
      carrier: firmwareInfo.carrier || 'unlocked',
      downloadUrl: firmwareInfo.downloadUrl,
      filename: firmwareInfo.filename || path.basename(firmwareInfo.downloadUrl),
      size: firmwareInfo.size || null,
      checksum: firmwareInfo.checksum || null,
      checksumType: firmwareInfo.checksumType || 'sha256',
      description: firmwareInfo.description || null,
      releaseDate: firmwareInfo.releaseDate || new Date().toISOString(),
      androidVersion: firmwareInfo.androidVersion || null,
      securityPatch: firmwareInfo.securityPatch || null,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    res.sendEnvelope({
      firmware: addedFirmware,
      message: 'Firmware added to database',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to add firmware to database', {
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/v1/firmware/library/download
 * Download firmware from database entry
 */
router.post('/download', async (req, res) => {
  const { brand, model, version, region, carrier } = req.body;
  
  if (!brand || !model || !version) {
    return res.sendError('VALIDATION_ERROR', 'Brand, model, and version are required', null, 400);
  }
  
  try {
    const results = searchFirmware({ brand, model, version, region, carrier });
    
    if (results.length === 0) {
      return res.sendError('FIRMWARE_NOT_FOUND', 'Firmware not found in database', {
        brand,
        model,
        version,
        region: region || 'any',
        carrier: carrier || 'any'
      }, 404);
    }
    
    const firmware = results[0]; // Use first match
    
    // Check if download is allowed
    if (process.env.ALLOW_FIRMWARE_DOWNLOAD !== '1') {
      return res.sendError('POLICY_BLOCKED', 'Firmware downloads are disabled', {
        enable: 'Set ALLOW_FIRMWARE_DOWNLOAD=1 environment variable',
        firmware: {
          brand,
          model,
          version
        }
      }, 403);
    }
    
    // Generate desired download path (for organization)
    let downloadPath = path.join(
      FIRMWARE_STORAGE_PATH,
      brand,
      model,
      `${firmware.filename || `${version}.zip`}`
    );
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(downloadPath), { recursive: true });
    
    // Start download (firmware-downloader manages its own storage directory)
    const downloadResult = await downloadFirmware(firmware.downloadUrl, {
      firmwareId: `fw-${brand}-${model}-${version}`,
      expectedSize: firmware.size || null,
      expectedChecksum: firmware.checksum || null,
      checksumType: firmware.checksumType || 'sha256'
    });
    
    if (!downloadResult.success) {
      return res.sendError('DOWNLOAD_FAILED', downloadResult.error, {
        firmware: {
          brand,
          model,
          version
        },
        url: firmware.downloadUrl
      }, 500);
    }
    
    // Move file to desired location if different (optional organization)
    const actualPath = downloadResult.filePath;
    if (actualPath !== downloadPath && fs.existsSync(actualPath)) {
      fs.mkdirSync(path.dirname(downloadPath), { recursive: true });
      fs.renameSync(actualPath, downloadPath);
    } else {
      // Use the actual path from downloader
      downloadPath = actualPath;
    }
    
    // Update firmware entry with local path
    const updatedFirmware = {
      ...firmware,
      localPath: downloadPath,
      downloadedAt: new Date().toISOString(),
      downloaded: true
    };
    addFirmwareToDB(updatedFirmware);
    
    res.sendEnvelope({
      firmware: updatedFirmware,
      download: downloadResult,
      message: 'Firmware download started',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to download firmware', {
      error: error.message,
      brand,
      model,
      version
    }, 500);
  }
});

/**
 * GET /api/v1/firmware/library/stats
 * Get firmware database statistics
 */
router.get('/stats', (req, res) => {
  try {
    const db = getFirmwareDB();
    
    // Calculate statistics
    let totalFirmware = 0;
    let totalSize = 0;
    const brandCounts = {};
    
    for (const [brand, models] of Object.entries(db.brands)) {
      brandCounts[brand] = 0;
      for (const [model, firmwares] of Object.entries(models)) {
        brandCounts[brand] += firmwares.length;
        totalFirmware += firmwares.length;
        firmwares.forEach(fw => {
          if (fw.size) totalSize += fw.size;
        });
      }
    }
    
    res.sendEnvelope({
      statistics: {
        totalBrands: Object.keys(db.brands).length,
        totalModels: Object.values(db.brands).reduce((sum, models) => sum + Object.keys(models).length, 0),
        totalFirmware,
        totalSize,
        brandCounts,
        lastUpdated: db.lastUpdated
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get firmware statistics', {
      error: error.message
    }, 500);
  }
});

export default router;

