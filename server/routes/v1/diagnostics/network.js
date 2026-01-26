/**
 * Network Diagnostics API
 * 
 * Network testing and monitoring for Android devices:
 * - WiFi connectivity and signal strength
 * - Bluetooth availability and pairing
 * - Cellular network information
 * - Network latency and speed tests
 * 
 * @module network-diagnostics
 */

import express from 'express';
import { ADBLibrary } from '../../../../core/lib/adb.js';

const router = express.Router();

/**
 * Get WiFi information
 */
async function getWiFiInfo(deviceSerial) {
  try {
    // Get WiFi status
    const wifiStatusResult = await ADBLibrary.shell(deviceSerial, 'dumpsys wifi | grep "Wi-Fi is"');
    const wifiEnabled = wifiStatusResult.success && wifiStatusResult.stdout.includes('enabled');

    // Get current network info
    const networkResult = await ADBLibrary.shell(deviceSerial, 'dumpsys wifi | grep -A 10 "mNetworkInfo"');
    
    // Get connected SSID
    const ssidResult = await ADBLibrary.shell(deviceSerial, 'dumpsys wifi | grep "mWifiInfo" | grep "SSID:"');
    let ssid = null;
    if (ssidResult.success) {
      const ssidMatch = ssidResult.stdout.match(/SSID:\s*"?([^",\s]+)"?/);
      if (ssidMatch) {
        ssid = ssidMatch[1];
      }
    }

    // Get signal strength
    const rssiResult = await ADBLibrary.shell(deviceSerial, 'dumpsys wifi | grep "mWifiInfo" | grep "RSSI:"');
    let rssi = null;
    let signalStrength = null;
    if (rssiResult.success) {
      const rssiMatch = rssiResult.stdout.match(/RSSI:\s*(-?\d+)/);
      if (rssiMatch) {
        rssi = parseInt(rssiMatch[1]);
        // Calculate signal strength percentage
        if (rssi >= -50) {
          signalStrength = 'excellent';
        } else if (rssi >= -60) {
          signalStrength = 'good';
        } else if (rssi >= -70) {
          signalStrength = 'fair';
        } else {
          signalStrength = 'poor';
        }
      }
    }

    // Get IP address
    const ipResult = await ADBLibrary.shell(deviceSerial, 'ip addr show wlan0 2>/dev/null | grep "inet " | awk \'{print $2}\' | cut -d/ -f1');
    const ipAddress = ipResult.success ? ipResult.stdout.trim() : null;

    return {
      success: true,
      enabled: wifiEnabled,
      connected: ssid !== null,
      ssid,
      rssi,
      signalStrength,
      ipAddress
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Bluetooth information
 */
async function getBluetoothInfo(deviceSerial) {
  try {
    // Get Bluetooth status
    const btStatusResult = await ADBLibrary.shell(deviceSerial, 'dumpsys bluetooth_manager | grep "enabled:"');
    const btEnabled = btStatusResult.success && btStatusResult.stdout.includes('true');

    // Get Bluetooth address
    const btAddrResult = await ADBLibrary.shell(deviceSerial, 'settings get secure bluetooth_address');
    const btAddress = btAddrResult.success ? btAddrResult.stdout.trim() : null;

    // Get paired devices count
    const pairedResult = await ADBLibrary.shell(deviceSerial, 'dumpsys bluetooth_manager | grep "Bonded devices:"');
    let pairedCount = 0;
    if (pairedResult.success) {
      const pairedMatch = pairedResult.stdout.match(/Bonded devices:\s*(\d+)/);
      if (pairedMatch) {
        pairedCount = parseInt(pairedMatch[1]);
      }
    }

    return {
      success: true,
      enabled: btEnabled,
      address: btAddress,
      pairedDevices: pairedCount
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get cellular information
 */
async function getCellularInfo(deviceSerial) {
  try {
    // Get cellular status
    const cellularResult = await ADBLibrary.shell(deviceSerial, 'dumpsys telephony.registry | grep "mDataConnectionState"');
    const cellularConnected = cellularResult.success && cellularResult.stdout.includes('2');

    // Get network operator
    const operatorResult = await ADBLibrary.shell(deviceSerial, 'getprop gsm.operator.alpha');
    const operator = operatorResult.success ? operatorResult.stdout.trim() : null;

    // Get network type
    const networkTypeResult = await ADBLibrary.shell(deviceSerial, 'dumpsys telephony.registry | grep "mDataConnectionNetworkType"');
    let networkType = null;
    if (networkTypeResult.success) {
      const typeMatch = networkTypeResult.stdout.match(/mDataConnectionNetworkType=(\d+)/);
      if (typeMatch) {
        const typeCode = parseInt(typeMatch[1]);
        const typeMap = {
          1: 'GPRS', 2: 'EDGE', 3: 'UMTS', 4: 'CDMA', 5: 'EVDO_0',
          6: 'EVDO_A', 7: 'RTT', 8: 'HSDPA', 9: 'HSUPA', 10: 'HSPA',
          11: 'IDEN', 12: 'EVDO_B', 13: 'LTE', 14: 'EHRPD', 15: 'HSPA+',
          16: 'GSM', 17: 'TD_SCDMA', 18: 'IWLAN', 19: 'LTE_CA', 20: 'NR'
        };
        networkType = typeMap[typeCode] || `Unknown (${typeCode})`;
      }
    }

    // Get signal strength
    const signalResult = await ADBLibrary.shell(deviceSerial, 'dumpsys telephony.registry | grep "mSignalStrength"');
    let signalStrength = null;
    if (signalResult.success) {
      const signalMatch = signalResult.stdout.match(/mSignalStrength=SignalStrength:\s*(\d+)/);
      if (signalMatch) {
        signalStrength = parseInt(signalMatch[1]);
      }
    }

    return {
      success: true,
      connected: cellularConnected,
      operator,
      networkType,
      signalStrength
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * GET /api/v1/diagnostics/network/:serial
 * Run comprehensive network diagnostics
 */
router.get('/:serial', async (req, res) => {
  try {
    const { serial } = req.params;

    const [wifi, bluetooth, cellular] = await Promise.all([
      getWiFiInfo(serial),
      getBluetoothInfo(serial),
      getCellularInfo(serial)
    ]);

    res.sendEnvelope({
      success: true,
      deviceSerial: serial,
      timestamp: new Date().toISOString(),
      results: {
        wifi,
        bluetooth,
        cellular
      }
    });
  } catch (error) {
    console.error('Network diagnostics error:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to run network diagnostics',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/diagnostics/network/:serial/wifi
 * Get WiFi information only
 */
router.get('/:serial/wifi', async (req, res) => {
  try {
    const { serial } = req.params;
    const wifi = await getWiFiInfo(serial);

    res.sendEnvelope({
      success: true,
      deviceSerial: serial,
      timestamp: new Date().toISOString(),
      wifi
    });
  } catch (error) {
    console.error('WiFi diagnostics error:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to get WiFi information',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/diagnostics/network/:serial/bluetooth
 * Get Bluetooth information only
 */
router.get('/:serial/bluetooth', async (req, res) => {
  try {
    const { serial } = req.params;
    const bluetooth = await getBluetoothInfo(serial);

    res.sendEnvelope({
      success: true,
      deviceSerial: serial,
      timestamp: new Date().toISOString(),
      bluetooth
    });
  } catch (error) {
    console.error('Bluetooth diagnostics error:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to get Bluetooth information',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/diagnostics/network/:serial/cellular
 * Get cellular information only
 */
router.get('/:serial/cellular', async (req, res) => {
  try {
    const { serial } = req.params;
    const cellular = await getCellularInfo(serial);

    res.sendEnvelope({
      success: true,
      deviceSerial: serial,
      timestamp: new Date().toISOString(),
      cellular
    });
  } catch (error) {
    console.error('Cellular diagnostics error:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to get cellular information',
      message: error.message
    });
  }
});

export default router;
