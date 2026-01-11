/**
 * Authorization Triggers API endpoints (v1)
 */

import express from 'express';
import { AuthorizationTriggers } from '../../authorization-triggers.js';

const router = express.Router();

/**
 * GET /api/v1/authorization/triggers
 * Get all available authorization triggers
 */
router.get('/triggers', async (req, res) => {
  try {
    const { platform } = req.query;
    const result = await AuthorizationTriggers.getAllAvailableTriggers(platform || 'all');
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get available triggers', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/authorization/trigger-all
 * Trigger all available authorizations for a device/platform
 */
router.post('/trigger-all', async (req, res) => {
  try {
    const { deviceId, platform } = req.body;
    if (!deviceId || !platform) {
      return res.sendError('VALIDATION_ERROR', 'Device ID and platform required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerAllAvailableAuthorizations(deviceId, platform);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger all authorizations', { error: error.message }, 500);
  }
});

// ADB Authorization Triggers
router.post('/adb/trigger-usb-debugging', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerADBUSBDebugging(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger USB debugging', { error: error.message }, 500);
  }
});

router.post('/adb/trigger-file-transfer', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerFileTransferAuth(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger file transfer auth', { error: error.message }, 500);
  }
});

router.post('/adb/trigger-backup', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerBackupAuth(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger backup auth', { error: error.message }, 500);
  }
});

router.post('/adb/trigger-screen-capture', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerScreenCaptureAuth(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger screen capture auth', { error: error.message }, 500);
  }
});

router.post('/adb/trigger-install', async (req, res) => {
  try {
    const { serial, apkPath } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerADBInstallAuth(serial, apkPath);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger install auth', { error: error.message }, 500);
  }
});

router.post('/adb/trigger-wifi-adb', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerWiFiADBAuth(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger WiFi ADB auth', { error: error.message }, 500);
  }
});

router.post('/adb/verify-developer-options', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.verifyDeveloperOptions(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to verify developer options', { error: error.message }, 500);
  }
});

router.post('/adb/check-debugging-status', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.checkUSBDebuggingStatus(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to check debugging status', { error: error.message }, 500);
  }
});

router.post('/adb/reboot-recovery', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.rebootToRecovery(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to reboot to recovery', { error: error.message }, 500);
  }
});

router.post('/adb/reboot-bootloader', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.rebootToBootloader(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to reboot to bootloader', { error: error.message }, 500);
  }
});

router.post('/adb/reboot-edl', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.rebootToEDL(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to reboot to EDL', { error: error.message }, 500);
  }
});

// iOS Authorization Triggers
router.post('/ios/trigger-trust-computer', async (req, res) => {
  try {
    const { udid } = req.body;
    if (!udid) {
      return res.sendError('VALIDATION_ERROR', 'Device UDID required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerIOSTrustComputer(udid);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger trust computer', { error: error.message }, 500);
  }
});

router.post('/ios/trigger-pairing', async (req, res) => {
  try {
    const { udid } = req.body;
    if (!udid) {
      return res.sendError('VALIDATION_ERROR', 'Device UDID required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerIOSPairing(udid);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger pairing', { error: error.message }, 500);
  }
});

router.post('/ios/trigger-backup-encryption', async (req, res) => {
  try {
    const { udid } = req.body;
    if (!udid) {
      return res.sendError('VALIDATION_ERROR', 'Device UDID required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerIOSBackupEncryption(udid);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger backup encryption', { error: error.message }, 500);
  }
});

router.post('/ios/trigger-dfu', async (req, res) => {
  try {
    const { udid } = req.body;
    if (!udid) {
      return res.sendError('VALIDATION_ERROR', 'Device UDID required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerDFURecoveryMode(udid);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger DFU mode', { error: error.message }, 500);
  }
});

router.post('/ios/trigger-app-install', async (req, res) => {
  try {
    const { udid } = req.body;
    if (!udid) {
      return res.sendError('VALIDATION_ERROR', 'Device UDID required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerIOSAppInstallAuth(udid);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger app install auth', { error: error.message }, 500);
  }
});

router.post('/ios/trigger-developer-trust', async (req, res) => {
  try {
    const { udid } = req.body;
    if (!udid) {
      return res.sendError('VALIDATION_ERROR', 'Device UDID required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerIOSDeveloperTrust(udid);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger developer trust', { error: error.message }, 500);
  }
});

// Fastboot Authorization Triggers
router.post('/fastboot/verify-unlock', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.verifyFastbootUnlock(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to verify fastboot unlock', { error: error.message }, 500);
  }
});

router.post('/fastboot/trigger-oem-unlock', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerFastbootOEMUnlock(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger OEM unlock', { error: error.message }, 500);
  }
});

// Samsung Authorization Triggers
router.post('/samsung/trigger-download-mode', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.triggerSamsungDownloadMode(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to trigger download mode', { error: error.message }, 500);
  }
});

// Qualcomm Authorization Triggers
router.post('/qualcomm/verify-edl', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.verifyQualcommEDL(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to verify EDL', { error: error.message }, 500);
  }
});

// MediaTek Authorization Triggers
router.post('/mediatek/verify-flash', async (req, res) => {
  try {
    const { serial } = req.body;
    if (!serial) {
      return res.sendError('VALIDATION_ERROR', 'Device serial required', null, 400);
    }
    const result = await AuthorizationTriggers.verifyMediatekFlash(serial);
    res.sendEnvelope(result);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to verify flash', { error: error.message }, 500);
  }
});

export default router;

