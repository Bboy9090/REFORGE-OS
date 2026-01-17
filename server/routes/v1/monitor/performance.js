/**
 * Real-Time Device Performance Monitoring API
 * 
 * Provides live performance metrics for connected devices:
 * - CPU usage (per core where available)
 * - Memory usage (RAM breakdown)
 * - Storage analytics
 * - Battery health and status
 * - Thermal monitoring
 * - Network statistics
 * 
 * @module performance-monitor
 */

import express from 'express';
import { ADBLibrary } from '../../../../core/lib/adb.js';
import { safeSpawn, commandExistsSafe } from '../../../utils/safe-exec.js';

const router = express.Router();

/**
 * Get CPU usage for an Android device
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} CPU usage information
 */
async function getCPUUsage(deviceSerial) {
  try {
    // Get CPU usage from /proc/stat (Android)
    const result = await ADBLibrary.shell(deviceSerial, 'cat /proc/stat | head -1');
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Parse CPU stats (user, nice, system, idle, iowait, irq, softirq)
    const cpuLine = result.stdout.trim();
    const parts = cpuLine.split(/\s+/).slice(1).map(Number);
    
    if (parts.length < 4) {
      return { success: false, error: 'Invalid CPU stats format' };
    }

    const total = parts.reduce((sum, val) => sum + val, 0);
    const idle = parts[3];
    const usage = total > 0 ? ((total - idle) / total) * 100 : 0;

    // Get CPU cores count
    const coresResult = await ADBLibrary.shell(deviceSerial, 'cat /proc/cpuinfo | grep processor | wc -l');
    const cores = parseInt(coresResult.stdout.trim()) || 1;

    return {
      success: true,
      usage: Math.round(usage * 100) / 100,
      cores: cores,
      details: {
        user: parts[0],
        nice: parts[1],
        system: parts[2],
        idle: parts[3],
        total
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get memory usage for an Android device
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} Memory usage information
 */
async function getMemoryUsage(deviceSerial) {
  try {
    // Get memory info from /proc/meminfo (Android)
    const result = await ADBLibrary.shell(deviceSerial, 'cat /proc/meminfo');
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const memInfo = {};
    result.stdout.split('\n').forEach(line => {
      const match = line.match(/(\w+):\s+(\d+)\s+kB/);
      if (match) {
        memInfo[match[1]] = parseInt(match[2]) * 1024; // Convert to bytes
      }
    });

    const total = memInfo['MemTotal'] || 0;
    const free = memInfo['MemFree'] || 0;
    const available = memInfo['MemAvailable'] || memInfo['MemFree'] || 0;
    const cached = memInfo['Cached'] || 0;
    const buffers = memInfo['Buffers'] || 0;
    const used = total - available;

    return {
      success: true,
      total,
      used,
      free,
      available,
      cached,
      buffers,
      usagePercent: total > 0 ? (used / total) * 100 : 0,
      details: memInfo
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get battery information for an Android device
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} Battery information
 */
async function getBatteryInfo(deviceSerial) {
  try {
    // Get battery info using dumpsys (Android)
    const result = await ADBLibrary.shell(deviceSerial, 'dumpsys battery');
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const batteryInfo = {};
    result.stdout.split('\n').forEach(line => {
      const match = line.match(/(\w+):\s+(.+)/);
      if (match) {
        const key = match[1].toLowerCase();
        const value = match[2].trim();
        batteryInfo[key] = isNaN(value) ? value : parseInt(value);
      }
    });

    return {
      success: true,
      level: batteryInfo.level || 0,
      scale: batteryInfo.scale || 100,
      status: batteryInfo.status || 0, // 1=unknown, 2=charging, 3=discharging, 4=not charging, 5=full
      health: batteryInfo.health || 0, // 1=unknown, 2=good, 3=overheat, 4=dead, 5=overvoltage, 6=unspecified failure, 7=cold
      plugged: batteryInfo.plugged || 0, // 0=unplugged, 1=AC, 2=USB, 4=wireless
      voltage: batteryInfo.voltage || 0,
      temperature: batteryInfo.temperature || 0, // Temperature in tenths of degrees Celsius
      technology: batteryInfo.technology || 'unknown',
      present: batteryInfo.present !== false,
      percentage: batteryInfo.scale > 0 ? (batteryInfo.level / batteryInfo.scale) * 100 : 0
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * GET /api/v1/monitor/performance/:serial
 * Get real-time performance metrics for a device
 */
router.get('/:serial', async (req, res) => {
  const { serial } = req.params;

  try {
    // Verify device is connected
    const devicesResult = await ADBLibrary.listDevices();
    if (!devicesResult.success) {
      return res.sendError('DEVICE_SCAN_FAILED', 'Failed to scan for devices', {
        error: devicesResult.error
      }, 500);
    }

    const device = devicesResult.devices.find(d => d.serial === serial);
    if (!device) {
      return res.sendError('DEVICE_NOT_FOUND', 'Device not found or not connected', {
        serial,
        availableDevices: devicesResult.devices.map(d => d.serial)
      }, 404);
    }

    // Collect all metrics in parallel
    const [cpuResult, memoryResult, batteryResult] = await Promise.all([
      getCPUUsage(serial),
      getMemoryUsage(serial),
      getBatteryInfo(serial)
    ]);

    const metrics = {
      timestamp: new Date().toISOString(),
      device: {
        serial,
        state: device.state
      },
      cpu: cpuResult.success ? {
        usage: cpuResult.usage,
        cores: cpuResult.cores,
        details: cpuResult.details
      } : { error: cpuResult.error },
      memory: memoryResult.success ? {
        total: memoryResult.total,
        used: memoryResult.used,
        free: memoryResult.free,
        available: memoryResult.available,
        usagePercent: Math.round(memoryResult.usagePercent * 100) / 100,
        cached: memoryResult.cached,
        buffers: memoryResult.buffers
      } : { error: memoryResult.error },
      battery: batteryResult.success ? {
        level: batteryResult.level,
        percentage: Math.round(batteryResult.percentage * 100) / 100,
        status: batteryResult.status,
        health: batteryResult.health,
        plugged: batteryResult.plugged,
        voltage: batteryResult.voltage,
        temperature: batteryResult.temperature ? batteryResult.temperature / 10 : 0, // Convert to Celsius
        technology: batteryResult.technology,
        present: batteryResult.present
      } : { error: batteryResult.error }
    };

    res.sendEnvelope(metrics);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to collect performance metrics', {
      error: error.message,
      serial
    }, 500);
  }
});

/**
 * GET /api/v1/monitor/performance/:serial/history
 * Get performance metrics history (requires storage/database - future implementation)
 */
router.get('/:serial/history', async (req, res) => {
  const { serial } = req.params;
  
  return res.sendNotImplemented(
    'Performance metrics history is not yet implemented. This endpoint will provide historical performance data over time.',
    {
      serial,
      plannedFeatures: [
        'Time-series data storage',
        'Configurable retention periods',
        'Aggregated statistics (min, max, average)',
        'Chart data export'
      ]
    }
  );
});

export default router;

