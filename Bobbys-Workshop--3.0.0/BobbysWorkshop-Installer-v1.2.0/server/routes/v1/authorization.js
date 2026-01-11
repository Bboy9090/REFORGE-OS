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
 * GET /api/v1/authorization/catalog
 * Get authorization trigger catalog (metadata for all triggers)
 * This endpoint provides trigger metadata for the frontend catalog UI
 */
router.get('/catalog', async (req, res) => {
  try {
    // Return trigger catalog metadata
    // This structure matches what the frontend expects for the trigger catalog
    const catalog = [
      // ADB Triggers
      {
        id: 'adb_usb_debugging',
        name: 'USB Debugging Authorization',
        category: 'trust_security',
        riskLevel: 'medium',
        frontendPrompt: 'Allow USB debugging on device?',
        modalText: 'Device needs USB debugging authorization. Please allow on device screen.',
        method: 'POST',
        backendEndpoint: '/api/v1/authorization/adb/trigger-usb-debugging',
        deviceIdRequired: true,
        deviceIdField: 'serial',
        requiresTypedConfirmation: false
      },
      {
        id: 'adb_file_transfer',
        name: 'File Transfer Authorization',
        category: 'trust_security',
        riskLevel: 'low',
        frontendPrompt: 'Allow file transfer on device?',
        modalText: 'Device needs file transfer authorization. Please allow on device screen.',
        method: 'POST',
        backendEndpoint: '/api/v1/authorization/adb/trigger-file-transfer',
        deviceIdRequired: true,
        deviceIdField: 'serial',
        requiresTypedConfirmation: false
      },
      {
        id: 'adb_backup',
        name: 'Backup Authorization',
        category: 'evidence_reports',
        riskLevel: 'low',
        frontendPrompt: 'Allow backup authorization on device?',
        modalText: 'Device needs backup authorization. Please allow on device screen.',
        method: 'POST',
        backendEndpoint: '/api/v1/authorization/adb/trigger-backup',
        deviceIdRequired: true,
        deviceIdField: 'serial',
        requiresTypedConfirmation: false
      },
      {
        id: 'adb_screen_capture',
        name: 'Screen Capture Authorization',
        category: 'evidence_reports',
        riskLevel: 'low',
        frontendPrompt: 'Allow screen capture on device?',
        modalText: 'Device needs screen capture authorization. Please allow on device screen.',
        method: 'POST',
        backendEndpoint: '/api/v1/authorization/adb/trigger-screen-capture',
        deviceIdRequired: true,
        deviceIdField: 'serial',
        requiresTypedConfirmation: false
      },
      {
        id: 'adb_install',
        name: 'APK Install Authorization',
        category: 'plugin_actions',
        riskLevel: 'medium',
        frontendPrompt: 'Allow APK installation on device?',
        modalText: 'Device needs APK installation authorization. Please allow on device screen.',
        method: 'POST',
        backendEndpoint: '/api/v1/authorization/adb/trigger-install',
        deviceIdRequired: true,
        deviceIdField: 'serial',
        requiresTypedConfirmation: false
      },
      // iOS Triggers
      {
        id: 'ios_trust_computer',
        name: 'Trust This Computer',
        category: 'trust_security',
        riskLevel: 'medium',
        frontendPrompt: 'Trust this computer on iOS device?',
        modalText: 'iOS device needs to trust this computer. Please tap "Trust" on device screen.',
        method: 'POST',
        backendEndpoint: '/api/v1/authorization/ios/trigger-trust-computer',
        deviceIdRequired: true,
        deviceIdField: 'udid',
        requiresTypedConfirmation: false
      },
      {
        id: 'ios_pairing',
        name: 'iOS Pairing',
        category: 'trust_security',
        riskLevel: 'medium',
        frontendPrompt: 'Complete iOS device pairing?',
        modalText: 'iOS device needs to be paired. Please complete pairing on device screen.',
        method: 'POST',
        backendEndpoint: '/api/v1/authorization/ios/trigger-pairing',
        deviceIdRequired: true,
        deviceIdField: 'udid',
        requiresTypedConfirmation: false
      },
      {
        id: 'ios_backup_encryption',
        name: 'Backup Encryption Password',
        category: 'evidence_reports',
        riskLevel: 'low',
        frontendPrompt: 'Enter backup encryption password?',
        modalText: 'iOS backup requires encryption password. Please enter on device screen.',
        method: 'POST',
        backendEndpoint: '/api/v1/authorization/ios/trigger-backup-encryption',
        deviceIdRequired: true,
        deviceIdField: 'udid',
        requiresTypedConfirmation: false
      },
      // Fastboot Triggers
      {
        id: 'fastboot_oem_unlock',
        name: 'OEM Unlock Confirmation',
        category: 'flash_operations',
        riskLevel: 'destructive',
        frontendPrompt: 'Unlock bootloader? This will wipe device data!',
        modalText: 'This will unlock the bootloader and wipe all device data. Type "UNLOCK" to confirm.',
        method: 'POST',
        backendEndpoint: '/api/v1/authorization/fastboot/trigger-oem-unlock',
        deviceIdRequired: true,
        deviceIdField: 'serial',
        requiresTypedConfirmation: true,
        confirmationText: 'UNLOCK'
      },
      {
        id: 'fastboot_verify_unlock',
        name: 'Verify Bootloader Unlock',
        category: 'diagnostics',
        riskLevel: 'low',
        frontendPrompt: 'Check bootloader unlock status?',
        modalText: 'Verify if bootloader is unlocked on device.',
        method: 'POST',
        backendEndpoint: '/api/v1/authorization/fastboot/verify-unlock',
        deviceIdRequired: true,
        deviceIdField: 'serial',
        requiresTypedConfirmation: false
      },
      // Flash Operations
      {
        id: 'flash_firmware',
        name: 'Flash Firmware',
        category: 'flash_operations',
        riskLevel: 'destructive',
        frontendPrompt: 'Flash firmware to device? This will overwrite device data!',
        modalText: 'This will flash firmware to device and may overwrite data. Type device serial to confirm.',
        method: 'POST',
        backendEndpoint: '/api/v1/flash/start',
        deviceIdRequired: true,
        deviceIdField: 'serial',
        requiresTypedConfirmation: true
      },
      // Evidence & Reports
      {
        id: 'evidence_export',
        name: 'Export Evidence Bundle',
        category: 'evidence_reports',
        riskLevel: 'low',
        frontendPrompt: 'Export signed evidence bundle?',
        modalText: 'Generate cryptographically signed diagnostic report for device?',
        method: 'POST',
        backendEndpoint: '/api/v1/evidence/export',
        deviceIdRequired: false,
        deviceIdField: 'serial',
        requiresTypedConfirmation: false
      },
      {
        id: 'evidence_sign',
        name: 'Sign Evidence Bundle',
        category: 'evidence_reports',
        riskLevel: 'medium',
        frontendPrompt: 'Sign evidence bundle?',
        modalText: 'Apply cryptographic signature to evidence bundle?',
        method: 'POST',
        backendEndpoint: '/api/v1/evidence/sign',
        deviceIdRequired: false,
        deviceIdField: 'serial',
        requiresTypedConfirmation: false
      }
    ];

    res.sendEnvelope(catalog);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get authorization catalog', { error: error.message }, 500);
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

