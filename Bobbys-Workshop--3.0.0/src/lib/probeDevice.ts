/**
 * probeDevice - Advanced device connectivity detection and probing
 * 
 * Provides comprehensive device detection across multiple protocols:
 * - USB devices (WebUSB)
 * - Android devices (ADB/Fastboot)
 * - iOS devices (libimobiledevice)
 * - Network devices
 * 
 * Part of the Bobby's World Tools connectivity detection arsenal.
 */

import { detectUSBDevicesEnhanced, type EnhancedUSBDeviceInfo } from './deviceDetection';
import { getAPIUrl, API_CONFIG } from './apiConfig';
import type { AndroidDevice, AndroidDevicesResponse } from '@/types/android-devices';

export interface DeviceCapability {
  id: string;
  name: string;
  description: string;
  available: boolean;
  protocols: string[];
}

export interface ProbeResult {
  deviceId: string;
  deviceName: string;
  deviceType: 'android' | 'ios' | 'usb' | 'network' | 'unknown';
  connectionType: 'adb' | 'fastboot' | 'usb' | 'network' | 'ios' | 'webusb';
  state: 'connected' | 'disconnected' | 'unauthorized' | 'offline' | 'unknown';
  capabilities: DeviceCapability[];
  properties: Record<string, any>;
  detectionMethod: string;
  timestamp: number;
}

export interface ProbeDeviceOptions {
  includeUSB?: boolean;
  includeAndroid?: boolean;
  includeiOS?: boolean;
  includeNetwork?: boolean;
  timeout?: number;
}

/**
 * Analyze device capabilities based on device type and properties
 */
export function analyzeDeviceCapabilities(
  deviceType: string,
  properties: Record<string, any>,
  usbInfo?: EnhancedUSBDeviceInfo
): DeviceCapability[] {
  const capabilities: DeviceCapability[] = [];

  // Android capabilities
  if (deviceType === 'android') {
    if (properties.source === 'adb') {
      capabilities.push({
        id: 'adb-shell',
        name: 'ADB Shell Access',
        description: 'Execute commands via Android Debug Bridge',
        available: properties.state === 'device',
        protocols: ['adb'],
      });

      capabilities.push({
        id: 'app-install',
        name: 'App Installation',
        description: 'Install and manage Android applications',
        available: properties.state === 'device',
        protocols: ['adb'],
      });

      capabilities.push({
        id: 'file-transfer',
        name: 'File Transfer',
        description: 'Transfer files to/from device',
        available: properties.state === 'device',
        protocols: ['adb', 'mtp'],
      });

      if (properties.properties?.debuggable) {
        capabilities.push({
          id: 'debugging',
          name: 'Debugging',
          description: 'Debug applications on device',
          available: true,
          protocols: ['adb'],
        });
      }
    }

    if (properties.source === 'fastboot' || properties.deviceMode === 'bootloader') {
      capabilities.push({
        id: 'fastboot-flash',
        name: 'Fastboot Flashing',
        description: 'Flash firmware partitions via fastboot',
        available: true,
        protocols: ['fastboot'],
      });

      capabilities.push({
        id: 'bootloader-unlock',
        name: 'Bootloader Operations',
        description: 'Unlock/lock bootloader and flash operations',
        available: true,
        protocols: ['fastboot'],
      });

      if (properties.properties?.unlocked) {
        capabilities.push({
          id: 'custom-rom',
          name: 'Custom ROM Installation',
          description: 'Install custom firmware and recoveries',
          available: true,
          protocols: ['fastboot'],
        });
      }
    }
  }

  // USB device capabilities
  if (usbInfo) {
    const usbCapabilities = usbInfo.capabilities || [];
    
    if (usbCapabilities.includes('Storage')) {
      capabilities.push({
        id: 'mass-storage',
        name: 'Mass Storage',
        description: 'Read/write files as storage device',
        available: true,
        protocols: ['usb', 'mtp', 'ptp'],
      });
    }

    if (usbCapabilities.includes('Video Capture')) {
      capabilities.push({
        id: 'video-capture',
        name: 'Video Capture',
        description: 'Capture video from device camera',
        available: true,
        protocols: ['usb', 'uvc'],
      });
    }

    if (usbCapabilities.includes('Audio')) {
      capabilities.push({
        id: 'audio',
        name: 'Audio I/O',
        description: 'Audio input/output capabilities',
        available: true,
        protocols: ['usb', 'audio'],
      });
    }
  }

  // iOS capabilities
  if (deviceType === 'ios') {
    capabilities.push({
      id: 'ios-backup',
      name: 'iOS Backup',
      description: 'Create and restore device backups',
      available: properties.state !== 'offline',
      protocols: ['usbmuxd'],
    });

    capabilities.push({
      id: 'ios-diagnostics',
      name: 'iOS Diagnostics',
      description: 'Run diagnostic tests and retrieve logs',
      available: properties.state !== 'offline',
      protocols: ['usbmuxd'],
    });

    if (properties.mode === 'dfu') {
      capabilities.push({
        id: 'dfu-restore',
        name: 'DFU Mode Restore',
        description: 'Firmware restore in DFU mode',
        available: true,
        protocols: ['dfu'],
      });

      capabilities.push({
        id: 'jailbreak',
        name: 'Jailbreak (checkra1n/palera1n)',
        description: 'iOS jailbreak operations',
        available: true,
        protocols: ['dfu'],
      });
    }
  }

  return capabilities;
}

/**
 * Probe Android devices via ADB and Fastboot
 */
async function probeAndroidDevices(timeout: number): Promise<ProbeResult[]> {
  try {
    const response = await fetch(getAPIUrl('/api/android/devices'), {
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      console.warn('Failed to fetch Android devices:', response.statusText);
      return [];
    }

    const data: AndroidDevicesResponse = await response.json();
    const results: ProbeResult[] = [];

    for (const device of data.devices) {
      const state = device.state === 'device' ? 'connected' 
        : device.state === 'unauthorized' ? 'unauthorized'
        : device.state === 'offline' ? 'offline'
        : 'unknown';

      const capabilities = analyzeDeviceCapabilities('android', device);

      results.push({
        deviceId: device.serial,
        deviceName: device.model || device.product || `Android Device (${device.serial})`,
        deviceType: 'android',
        connectionType: device.source,
        state,
        capabilities,
        properties: {
          ...device,
          manufacturer: device.properties.manufacturer,
          model: device.properties.model,
          androidVersion: device.properties.androidVersion,
        },
        detectionMethod: `${device.source.toUpperCase()} API`,
        timestamp: Date.now(),
      });
    }

    return results;
  } catch (error) {
    console.error('Failed to probe Android devices:', error);
    return [];
  }
}

/**
 * Probe iOS devices via libimobiledevice
 */
async function probeiOSDevices(timeout: number): Promise<ProbeResult[]> {
  try {
    const response = await fetch(getAPIUrl('/api/ios/scan'), {
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      console.warn('Failed to fetch iOS devices:', response.statusText);
      return [];
    }

    const data = await response.json();
    const results: ProbeResult[] = [];

    for (const device of data.devices || []) {
      const capabilities = analyzeDeviceCapabilities('ios', device);

      results.push({
        deviceId: device.udid || device.serial,
        deviceName: device.name || device.model || 'iOS Device',
        deviceType: 'ios',
        connectionType: 'ios',
        state: device.state || 'connected',
        capabilities,
        properties: device,
        detectionMethod: 'libimobiledevice',
        timestamp: Date.now(),
      });
    }

    return results;
  } catch (error) {
    console.error('Failed to probe iOS devices:', error);
    return [];
  }
}

/**
 * Probe USB devices via WebUSB
 */
async function probeUSBDevices(): Promise<ProbeResult[]> {
  try {
    const usbDevices = await detectUSBDevicesEnhanced();
    const results: ProbeResult[] = [];

    for (const device of usbDevices) {
      const capabilities = analyzeDeviceCapabilities('usb', {}, device);

      results.push({
        deviceId: device.id,
        deviceName: device.productName || device.manufacturerName || 'USB Device',
        deviceType: 'usb',
        connectionType: 'webusb',
        state: 'connected',
        capabilities,
        properties: {
          vendorId: device.vendorId,
          productId: device.productId,
          manufacturer: device.manufacturerName,
          product: device.productName,
          serialNumber: device.serialNumber,
          usbVersion: device.usbVersion,
          classes: device.classes,
        },
        detectionMethod: 'WebUSB API',
        timestamp: Date.now(),
      });
    }

    return results;
  } catch (error) {
    console.error('Failed to probe USB devices:', error);
    return [];
  }
}

/**
 * Main device probing function - detects all connected devices
 */
export async function probeDevices(options: ProbeDeviceOptions = {}): Promise<ProbeResult[]> {
  const {
    includeUSB = true,
    includeAndroid = true,
    includeiOS = true,
    includeNetwork = false,
    timeout = API_CONFIG.TIMEOUT,
  } = options;

  const probePromises: Promise<ProbeResult[]>[] = [];

  if (includeAndroid) {
    probePromises.push(probeAndroidDevices(timeout));
  }

  if (includeiOS) {
    probePromises.push(probeiOSDevices(timeout));
  }

  if (includeUSB) {
    probePromises.push(probeUSBDevices());
  }

  // Run all probes in parallel
  const results = await Promise.all(probePromises);
  
  // Flatten and deduplicate results
  const allResults = results.flat();
  const uniqueResults = new Map<string, ProbeResult>();

  for (const result of allResults) {
    // Prefer ADB/iOS over generic USB detection
    const existing = uniqueResults.get(result.deviceId);
    if (!existing || 
        (result.connectionType !== 'webusb' && existing.connectionType === 'webusb')) {
      uniqueResults.set(result.deviceId, result);
    }
  }

  return Array.from(uniqueResults.values());
}

/**
 * Probe a single device by ID
 */
export async function probeSingleDevice(deviceId: string): Promise<ProbeResult | null> {
  const allDevices = await probeDevices();
  return allDevices.find(d => d.deviceId === deviceId) || null;
}

/**
 * Monitor devices for connection/disconnection events
 */
export function createDeviceMonitor(
  onDeviceConnected: (device: ProbeResult) => void,
  onDeviceDisconnected: (deviceId: string) => void,
  intervalMs: number = 3000
): () => void {
  let previousDevices = new Map<string, ProbeResult>();
  let isMonitoring = true;

  const checkDevices = async () => {
    if (!isMonitoring) return;

    const currentDevices = await probeDevices();
    const currentMap = new Map(currentDevices.map(d => [d.deviceId, d]));

    // Check for new devices
    for (const [id, device] of currentMap) {
      if (!previousDevices.has(id)) {
        onDeviceConnected(device);
      }
    }

    // Check for disconnected devices
    for (const [id] of previousDevices) {
      if (!currentMap.has(id)) {
        onDeviceDisconnected(id);
      }
    }

    previousDevices = currentMap;

    if (isMonitoring) {
      setTimeout(checkDevices, intervalMs);
    }
  };

  // Start monitoring
  checkDevices();

  // Return cleanup function
  return () => {
    isMonitoring = false;
  };
}
