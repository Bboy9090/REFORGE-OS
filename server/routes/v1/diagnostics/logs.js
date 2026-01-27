/**
 * System Logs API
 * 
 * Retrieve and stream system logs from Android devices:
 * - Logcat (system logs)
 * - dmesg (kernel logs)
 * - Event logs
 * - Real-time log streaming
 * 
 * @module system-logs
 */

import express from 'express';
import { ADBLibrary } from '../../../../core/lib/adb.js';

const router = express.Router();

/**
 * GET /api/v1/diagnostics/logs/:serial/logcat
 * Get Android logcat logs
 */
router.get('/:serial/logcat', async (req, res) => {
  try {
    const { serial } = req.params;
    const { level, tag, lines } = req.query;

    let command = 'logcat -d';
    
    // Add level filter
    if (level) {
      command += ` *:${level.toUpperCase()}`;
    }
    
    // Add tag filter
    if (tag) {
      command += ` -s ${tag}`;
    }
    
    // Limit lines
    if (lines) {
      command += ` -t ${parseInt(lines)}`;
    } else {
      command += ' -t 500'; // Default to last 500 lines
    }

    const result = await ADBLibrary.shell(serial, command);

    if (!result.success) {
      return res.status(500).sendEnvelope({
        error: 'Failed to retrieve logcat',
        message: result.error
      });
    }

    res.sendEnvelope({
      success: true,
      deviceSerial: serial,
      timestamp: new Date().toISOString(),
      logType: 'logcat',
      filters: { level, tag, lines },
      logs: result.stdout
    });
  } catch (error) {
    console.error('Logcat retrieval error:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to retrieve logcat',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/diagnostics/logs/:serial/dmesg
 * Get kernel logs (dmesg)
 */
router.get('/:serial/dmesg', async (req, res) => {
  try {
    const { serial } = req.params;
    const { lines } = req.query;

    let command = 'dmesg';
    
    // Limit lines if specified
    if (lines) {
      command += ` | tail -n ${parseInt(lines)}`;
    }

    const result = await ADBLibrary.shell(serial, command);

    if (!result.success) {
      return res.status(500).sendEnvelope({
        error: 'Failed to retrieve dmesg',
        message: result.error
      });
    }

    res.sendEnvelope({
      success: true,
      deviceSerial: serial,
      timestamp: new Date().toISOString(),
      logType: 'dmesg',
      filters: { lines },
      logs: result.stdout
    });
  } catch (error) {
    console.error('dmesg retrieval error:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to retrieve dmesg',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/diagnostics/logs/:serial/events
 * Get Android event logs
 */
router.get('/:serial/events', async (req, res) => {
  try {
    const { serial } = req.params;
    const { lines } = req.query;

    let command = 'logcat -b events -d';
    
    if (lines) {
      command += ` -t ${parseInt(lines)}`;
    } else {
      command += ' -t 200';
    }

    const result = await ADBLibrary.shell(serial, command);

    if (!result.success) {
      return res.status(500).sendEnvelope({
        error: 'Failed to retrieve event logs',
        message: result.error
      });
    }

    res.sendEnvelope({
      success: true,
      deviceSerial: serial,
      timestamp: new Date().toISOString(),
      logType: 'events',
      filters: { lines },
      logs: result.stdout
    });
  } catch (error) {
    console.error('Event log retrieval error:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to retrieve event logs',
      message: error.message
    });
  }
});

/**
 * DELETE /api/v1/diagnostics/logs/:serial/logcat
 * Clear logcat buffer
 */
router.delete('/:serial/logcat', async (req, res) => {
  try {
    const { serial } = req.params;

    const result = await ADBLibrary.shell(serial, 'logcat -c');

    if (!result.success) {
      return res.status(500).sendEnvelope({
        error: 'Failed to clear logcat',
        message: result.error
      });
    }

    res.sendEnvelope({
      success: true,
      deviceSerial: serial,
      message: 'Logcat buffer cleared'
    });
  } catch (error) {
    console.error('Logcat clear error:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to clear logcat',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/diagnostics/logs/:serial
 * Get summary of available log types
 */
router.get('/:serial', (req, res) => {
  res.sendEnvelope({
    success: true,
    deviceSerial: req.params.serial,
    availableLogs: {
      logcat: {
        endpoint: `/api/v1/diagnostics/logs/${req.params.serial}/logcat`,
        description: 'System logcat logs',
        filters: ['level', 'tag', 'lines']
      },
      dmesg: {
        endpoint: `/api/v1/diagnostics/logs/${req.params.serial}/dmesg`,
        description: 'Kernel logs',
        filters: ['lines']
      },
      events: {
        endpoint: `/api/v1/diagnostics/logs/${req.params.serial}/events`,
        description: 'Android event logs',
        filters: ['lines']
      }
    }
  });
});

export default router;
