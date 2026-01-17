/**
 * Settings API endpoints (v1)
 * User settings and preferences management
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Settings storage directory
const SETTINGS_DIR = process.env.BW_SETTINGS_DIR || (process.platform === 'win32'
  ? path.join(process.env.LOCALAPPDATA || process.env.APPDATA || process.cwd(), 'BobbysWorkshop', 'settings')
  : path.join(process.env.HOME || process.cwd(), '.local', 'share', 'bobbys-workshop', 'settings'));

// Ensure settings directory exists
if (!fs.existsSync(SETTINGS_DIR)) {
  fs.mkdirSync(SETTINGS_DIR, { recursive: true });
}

// In-memory storage for settings (in production, use database)
const settingsStore = new Map();

// Default settings
const DEFAULT_SETTINGS = {
  theme: 'auto',
  notifications: {
    enabled: true,
    sound: true,
    desktop: true
  },
  workshop: {
    atmosphere: 'professional',
    animations: true
  },
  audio: {
    volume: 0.7,
    notifications: true
  },
  advanced: {
    debugMode: false,
    logLevel: 'info'
  }
};

/**
 * GET /api/v1/settings
 * Get user settings
 */
router.get('/', (req, res) => {
  try {
    const { userId } = req.query;
    const settingsKey = userId || 'default';

    let settings = settingsStore.get(settingsKey);
    
    if (!settings) {
      // Try to load from disk
      const settingsFile = path.join(SETTINGS_DIR, `${settingsKey}.json`);
      if (fs.existsSync(settingsFile)) {
        try {
          settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
          settingsStore.set(settingsKey, settings);
        } catch {
          // If file is invalid, use defaults
          settings = { ...DEFAULT_SETTINGS };
        }
      } else {
        settings = { ...DEFAULT_SETTINGS };
      }
    }

    res.sendEnvelope(settings);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get settings', { error: error.message }, 500);
  }
});

/**
 * PUT /api/v1/settings
 * Update user settings
 */
router.put('/', (req, res) => {
  try {
    const { userId, settings: newSettings } = req.body;

    if (!newSettings || typeof newSettings !== 'object') {
      return res.sendError('VALIDATION_ERROR', 'settings object is required', null, 400);
    }

    const settingsKey = userId || 'default';
    let currentSettings = settingsStore.get(settingsKey);

    if (!currentSettings) {
      // Try to load from disk
      const settingsFile = path.join(SETTINGS_DIR, `${settingsKey}.json`);
      if (fs.existsSync(settingsFile)) {
        try {
          currentSettings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        } catch {
          currentSettings = { ...DEFAULT_SETTINGS };
        }
      } else {
        currentSettings = { ...DEFAULT_SETTINGS };
      }
    }

    // Merge new settings with current settings
    const updatedSettings = {
      ...currentSettings,
      ...newSettings,
      updatedAt: Date.now()
    };

    settingsStore.set(settingsKey, updatedSettings);

    // Save to disk
    const settingsFile = path.join(SETTINGS_DIR, `${settingsKey}.json`);
    fs.writeFileSync(settingsFile, JSON.stringify(updatedSettings, null, 2));

    res.sendEnvelope(updatedSettings);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to update settings', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/settings/export
 * Export settings as JSON
 */
router.post('/export', (req, res) => {
  try {
    const { userId } = req.body;
    const settingsKey = userId || 'default';

    let settings = settingsStore.get(settingsKey);
    
    if (!settings) {
      const settingsFile = path.join(SETTINGS_DIR, `${settingsKey}.json`);
      if (fs.existsSync(settingsFile)) {
        settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      } else {
        settings = { ...DEFAULT_SETTINGS };
      }
    }

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userId: settingsKey,
      settings
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonData, 'utf8');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Content-Disposition', `attachment; filename="bobbys-workshop-settings-${settingsKey}.json"`);

    res.send(buffer);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to export settings', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/settings/import
 * Import settings from JSON
 */
router.post('/import', (req, res) => {
  try {
    const { userId, settingsData } = req.body;

    if (!settingsData || typeof settingsData !== 'object') {
      return res.sendError('VALIDATION_ERROR', 'settingsData object is required', null, 400);
    }

    const settingsKey = userId || 'default';

    // Validate imported settings structure
    const importedSettings = settingsData.settings || settingsData;
    
    // Merge with defaults to ensure all keys exist
    const mergedSettings = {
      ...DEFAULT_SETTINGS,
      ...importedSettings,
      importedAt: Date.now(),
      updatedAt: Date.now()
    };

    settingsStore.set(settingsKey, mergedSettings);

    // Save to disk
    const settingsFile = path.join(SETTINGS_DIR, `${settingsKey}.json`);
    fs.writeFileSync(settingsFile, JSON.stringify(mergedSettings, null, 2));

    res.sendEnvelope({
      success: true,
      message: 'Settings imported successfully',
      settings: mergedSettings
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to import settings', { error: error.message }, 500);
  }
});

/**
 * DELETE /api/v1/settings
 * Reset settings to defaults
 */
router.delete('/', (req, res) => {
  try {
    const { userId } = req.query;
    const settingsKey = userId || 'default';

    // Reset to defaults
    const defaultSettings = {
      ...DEFAULT_SETTINGS,
      resetAt: Date.now()
    };

    settingsStore.set(settingsKey, defaultSettings);

    // Save to disk
    const settingsFile = path.join(SETTINGS_DIR, `${settingsKey}.json`);
    fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2));

    res.sendEnvelope({
      success: true,
      message: 'Settings reset to defaults',
      settings: defaultSettings
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to reset settings', { error: error.message }, 500);
  }
});

export default router;
