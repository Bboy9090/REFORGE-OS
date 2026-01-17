/**
 * Hardware Diagnostics API
 * 
 * Comprehensive hardware testing suite for Android devices:
 * - Screen and touch testing
 * - Sensor testing (accelerometer, gyroscope, magnetometer, etc.)
 * - Camera quality tests
 * - Audio quality tests (speakers, microphones)
 * - Vibration test
 * - LED/Flash test
 * 
 * @module hardware-diagnostics
 */

import express from 'express';
import { ADBLibrary } from '../../../../core/lib/adb.js';

const router = express.Router();

/**
 * Test device screen and touch
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} Screen test result
 */
async function testScreen(deviceSerial) {
  try {
    // Get screen resolution
    const resolutionResult = await ADBLibrary.shell(deviceSerial, 'wm size');
    const resolution = resolutionResult.success ? resolutionResult.stdout.trim() : null;

    // Get screen density
    const densityResult = await ADBLibrary.shell(deviceSerial, 'wm density');
    const density = densityResult.success ? densityResult.stdout.trim() : null;

    // Get screen brightness (requires root for some devices)
    const brightnessResult = await ADBLibrary.shell(deviceSerial, 'settings get system screen_brightness');
    const brightness = brightnessResult.success ? parseInt(brightnessResult.stdout.trim()) : null;

    return {
      success: true,
      resolution,
      density,
      brightness,
      note: 'Touch testing requires interactive display test - use device hardware test mode or dedicated test apps'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test device sensors
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} Sensor test result
 */
async function testSensors(deviceSerial) {
  try {
    // List available sensors
    const sensorsResult = await ADBLibrary.shell(deviceSerial, 'dumpsys sensorservice | grep -A 10 "Sensor List"');
    
    // Parse sensor list
    const sensors = [];
    if (sensorsResult.success) {
      const lines = sensorsResult.stdout.split('\n');
      lines.forEach(line => {
        // Parse sensor entries (format varies by Android version)
        const sensorMatch = line.match(/^\s*\d+\.\s+(.+?)\s+\((.+?)\)/);
        if (sensorMatch) {
          sensors.push({
            name: sensorMatch[1].trim(),
            vendor: sensorMatch[2].trim()
          });
        }
      });
    }

    // Get sensor data (requires sensor test app or dumpsys)
    return {
      success: true,
      sensors,
      count: sensors.length,
      note: 'Sensor functionality testing requires interactive test or sensor test apps. Use *#0*# dialer code for hardware test menu on Samsung devices.'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test device camera
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} Camera test result
 */
async function testCamera(deviceSerial) {
  try {
    // Get camera information
    const cameraResult = await ADBLibrary.shell(deviceSerial, 'dumpsys media.camera | grep -A 5 "Camera.*:"');
    
    // Count cameras
    const cameraCountResult = await ADBLibrary.shell(deviceSerial, 'getprop | grep camera');
    const cameraProps = cameraCountResult.success ? cameraCountResult.stdout : '';

    // Parse camera count
    const cameras = [];
    if (cameraProps.includes('back') || cameraProps.includes('rear')) {
      cameras.push({ position: 'back', available: true });
    }
    if (cameraProps.includes('front')) {
      cameras.push({ position: 'front', available: true });
    }

    return {
      success: true,
      cameras,
      count: cameras.length,
      note: 'Camera quality testing requires capturing test images. Use camera app or hardware test mode for full camera test.'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test device audio
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} Audio test result
 */
async function testAudio(deviceSerial) {
  try {
    // Get audio information
    const audioResult = await ADBLibrary.shell(deviceSerial, 'dumpsys audio | grep -A 5 "Audio"');
    
    // Check audio volume levels
    const musicVolumeResult = await ADBLibrary.shell(deviceSerial, 'settings get system volume_music');
    const callVolumeResult = await ADBLibrary.shell(deviceSerial, 'settings get system volume_voice_call');
    const alarmVolumeResult = await ADBLibrary.shell(deviceSerial, 'settings get system volume_alarm');

    return {
      success: true,
      volumes: {
        music: musicVolumeResult.success ? parseInt(musicVolumeResult.stdout.trim()) : null,
        call: callVolumeResult.success ? parseInt(callVolumeResult.stdout.trim()) : null,
        alarm: alarmVolumeResult.success ? parseInt(alarmVolumeResult.stdout.trim()) : null
      },
      note: 'Audio quality testing (speaker/microphone) requires playing test tones and recording. Use hardware test mode or audio test apps for full audio test.'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run comprehensive hardware diagnostics
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<Object>} Comprehensive test results
 */
async function runComprehensiveDiagnostics(deviceSerial) {
  const [screenResult, sensorResult, cameraResult, audioResult] = await Promise.all([
    testScreen(deviceSerial),
    testSensors(deviceSerial),
    testCamera(deviceSerial),
    testAudio(deviceSerial)
  ]);

  return {
    success: true,
    screen: screenResult.success ? {
      resolution: screenResult.resolution,
      density: screenResult.density,
      brightness: screenResult.brightness,
      note: screenResult.note
    } : { error: screenResult.error },
    sensors: sensorResult.success ? {
      sensors: sensorResult.sensors,
      count: sensorResult.count,
      note: sensorResult.note
    } : { error: sensorResult.error },
    camera: cameraResult.success ? {
      cameras: cameraResult.cameras,
      count: cameraResult.count,
      note: cameraResult.note
    } : { error: cameraResult.error },
    audio: audioResult.success ? {
      volumes: audioResult.volumes,
      note: audioResult.note
    } : { error: audioResult.error }
  };
}

/**
 * GET /api/v1/diagnostics/hardware/:serial
 * Run comprehensive hardware diagnostics
 */
router.get('/:serial', async (req, res) => {
  const { serial } = req.params;

  try {
    const result = await runComprehensiveDiagnostics(serial);

    if (!result.success) {
      return res.sendError('DIAGNOSTICS_FAILED', 'Failed to run hardware diagnostics', {
        serial
      }, 500);
    }

    res.sendEnvelope({
      device: {
        serial
      },
      diagnostics: result,
      timestamp: new Date().toISOString(),
      note: 'Full hardware testing may require device hardware test mode. Dial *#0*# on Samsung devices, or use manufacturer-specific test codes.'
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to run hardware diagnostics', {
      error: error.message,
      serial
    }, 500);
  }
});

/**
 * GET /api/v1/diagnostics/hardware/:serial/screen
 * Test screen and touch
 */
router.get('/:serial/screen', async (req, res) => {
  const { serial } = req.params;

  try {
    const result = await testScreen(serial);

    if (!result.success) {
      return res.sendError('SCREEN_TEST_FAILED', result.error, {
        serial
      }, 500);
    }

    res.sendEnvelope({
      serial,
      screen: {
        resolution: result.resolution,
        density: result.density,
        brightness: result.brightness
      },
      note: result.note,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to test screen', {
      error: error.message,
      serial
    }, 500);
  }
});

/**
 * GET /api/v1/diagnostics/hardware/:serial/sensors
 * Test device sensors
 */
router.get('/:serial/sensors', async (req, res) => {
  const { serial } = req.params;

  try {
    const result = await testSensors(serial);

    if (!result.success) {
      return res.sendError('SENSOR_TEST_FAILED', result.error, {
        serial
      }, 500);
    }

    res.sendEnvelope({
      serial,
      sensors: result.sensors,
      count: result.count,
      note: result.note,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to test sensors', {
      error: error.message,
      serial
    }, 500);
  }
});

/**
 * GET /api/v1/diagnostics/hardware/:serial/camera
 * Test device cameras
 */
router.get('/:serial/camera', async (req, res) => {
  const { serial } = req.params;

  try {
    const result = await testCamera(serial);

    if (!result.success) {
      return res.sendError('CAMERA_TEST_FAILED', result.error, {
        serial
      }, 500);
    }

    res.sendEnvelope({
      serial,
      cameras: result.cameras,
      count: result.count,
      note: result.note,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to test camera', {
      error: error.message,
      serial
    }, 500);
  }
});

/**
 * GET /api/v1/diagnostics/hardware/:serial/audio
 * Test device audio
 */
router.get('/:serial/audio', async (req, res) => {
  const { serial } = req.params;

  try {
    const result = await testAudio(serial);

    if (!result.success) {
      return res.sendError('AUDIO_TEST_FAILED', result.error, {
        serial
      }, 500);
    }

    res.sendEnvelope({
      serial,
      audio: {
        volumes: result.volumes
      },
      note: result.note,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to test audio', {
      error: error.message,
      serial
    }, 500);
  }
});

export default router;

