/**
 * Battery Health Diagnostics API
 * 
 * Comprehensive battery testing and health monitoring:
 * - Battery capacity measurement
 * - Charge/discharge cycle counting
 * - Battery health percentage
 * - Charging speed monitoring
 * - Battery temperature tracking
 * - Battery status and history
 * 
 * @module battery-diagnostics
 */

import express from 'express';
import { ADBLibrary } from '../../../../core/lib/adb.js';

const router = express.Router();

/**
 * Get detailed battery information
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} Battery information
 */
async function getBatteryHealth(deviceSerial) {
  try {
    // Get battery info via dumpsys
    const batteryResult = await ADBLibrary.shell(deviceSerial, 'dumpsys battery');
    
    if (!batteryResult.success) {
      return {
        success: false,
        error: batteryResult.error
      };
    }

    // Parse battery information
    const batteryInfo = {};
    batteryResult.stdout.split('\n').forEach(line => {
      const match = line.match(/(\w+):\s+(.+)/);
      if (match) {
        const key = match[1].toLowerCase();
        const value = match[2].trim();
        batteryInfo[key] = isNaN(value) ? value : (value === 'true' ? true : (value === 'false' ? false : parseInt(value)));
      }
    });

    // Calculate battery health percentage (if design capacity available)
    let healthPercentage = null;
    if (batteryInfo.level !== undefined && batteryInfo.scale !== undefined) {
      const currentCapacity = (batteryInfo.level / batteryInfo.scale) * 100;
      
      // Try to get design capacity (requires root on many devices)
      const designCapacityResult = await ADBLibrary.shell(deviceSerial, 'cat /sys/class/power_supply/battery/charge_full_design 2>/dev/null');
      const fullCapacityResult = await ADBLibrary.shell(deviceSerial, 'cat /sys/class/power_supply/battery/charge_full 2>/dev/null');
      
      const designCapacity = designCapacityResult.success ? parseInt(designCapacityResult.stdout.trim()) : null;
      const fullCapacity = fullCapacityResult.success ? parseInt(fullCapacityResult.stdout.trim()) : null;
      
      if (designCapacity && fullCapacity && designCapacity > 0) {
        healthPercentage = Math.round((fullCapacity / designCapacity) * 100);
      }
    }

    // Get battery cycles (requires root)
    const cyclesResult = await ADBLibrary.shell(deviceSerial, 'cat /sys/class/power_supply/battery/cycle_count 2>/dev/null');
    const cycles = cyclesResult.success ? parseInt(cyclesResult.stdout.trim()) : null;

    // Get battery temperature
    const tempResult = await ADBLibrary.shell(deviceSerial, 'cat /sys/class/power_supply/battery/temp 2>/dev/null');
    const tempRaw = tempResult.success ? parseInt(tempResult.stdout.trim()) : null;
    const temperature = tempRaw ? tempRaw / 10 : null; // Temperature in tenths of degrees

    return {
      success: true,
      level: batteryInfo.level || 0,
      scale: batteryInfo.scale || 100,
      percentage: batteryInfo.scale > 0 ? Math.round((batteryInfo.level / batteryInfo.scale) * 100) : 0,
      status: batteryInfo.status || 0,
      health: batteryInfo.health || 0,
      plugged: batteryInfo.plugged || 0,
      voltage: batteryInfo.voltage || 0,
      temperature: temperature,
      technology: batteryInfo.technology || 'unknown',
      present: batteryInfo.present !== false,
      healthPercentage: healthPercentage,
      cycles: cycles,
      designCapacity: designCapacity || null,
      fullCapacity: fullCapacity || null,
      charging: batteryInfo.status === 2 || batteryInfo.plugged > 0
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Monitor battery during charge/discharge
 * @param {string} deviceSerial - Device serial number
 * @param {number} durationSeconds - Monitoring duration in seconds
 * @returns {Promise<Object>} Battery monitoring result
 */
async function monitorBattery(deviceSerial, durationSeconds = 60) {
  try {
    const samples = [];
    const startTime = Date.now();
    const endTime = startTime + (durationSeconds * 1000);

    while (Date.now() < endTime) {
      const batteryInfo = await getBatteryHealth(deviceSerial);
      if (batteryInfo.success) {
        samples.push({
          timestamp: new Date().toISOString(),
          level: batteryInfo.level,
          percentage: batteryInfo.percentage,
          voltage: batteryInfo.voltage,
          temperature: batteryInfo.temperature,
          charging: batteryInfo.charging,
          status: batteryInfo.status
        });
      }
      
      // Sample every 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Calculate charge/discharge rate
    const firstSample = samples[0];
    const lastSample = samples[samples.length - 1];
    const rate = lastSample && firstSample 
      ? (lastSample.percentage - firstSample.percentage) / (durationSeconds / 60) // Percentage per minute
      : null;

    return {
      success: true,
      samples,
      duration: durationSeconds,
      startLevel: firstSample?.percentage || null,
      endLevel: lastSample?.percentage || null,
      rate: rate,
      chargeRate: rate && rate > 0 ? Math.abs(rate) : null,
      dischargeRate: rate && rate < 0 ? Math.abs(rate) : null
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * GET /api/v1/diagnostics/battery/:serial
 * Get battery health information
 */
router.get('/:serial', async (req, res) => {
  const { serial } = req.params;

  try {
    const result = await getBatteryHealth(serial);

    if (!result.success) {
      return res.sendError('BATTERY_HEALTH_CHECK_FAILED', result.error, {
        serial
      }, 500);
    }

    res.sendEnvelope({
      serial,
      battery: {
        level: result.level,
        percentage: result.percentage,
        status: result.status,
        health: result.health,
        healthPercentage: result.healthPercentage,
        plugged: result.plugged,
        charging: result.charging,
        voltage: result.voltage,
        temperature: result.temperature,
        technology: result.technology,
        cycles: result.cycles,
        designCapacity: result.designCapacity,
        fullCapacity: result.fullCapacity,
        present: result.present
      },
      note: result.healthPercentage === null ? 'Battery health percentage requires root access or device-specific permissions. Cycles and capacity data may not be available on all devices.' : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get battery health', {
      error: error.message,
      serial
    }, 500);
  }
});

/**
 * POST /api/v1/diagnostics/battery/:serial/monitor
 * Monitor battery during charge/discharge
 */
router.post('/:serial/monitor', async (req, res) => {
  const { serial } = req.params;
  const { duration = 60 } = req.body; // Default 60 seconds

  const durationSeconds = Math.min(Math.max(parseInt(duration) || 60, 10), 600); // Between 10 and 600 seconds

  try {
    const result = await monitorBattery(serial, durationSeconds);

    if (!result.success) {
      return res.sendError('BATTERY_MONITORING_FAILED', result.error, {
        serial,
        duration: durationSeconds
      }, 500);
    }

    res.sendEnvelope({
      serial,
      monitoring: {
        duration: result.duration,
        samples: result.samples,
        startLevel: result.startLevel,
        endLevel: result.endLevel,
        rate: result.rate,
        chargeRate: result.chargeRate,
        dischargeRate: result.dischargeRate
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to monitor battery', {
      error: error.message,
      serial
    }, 500);
  }
});

export default router;

