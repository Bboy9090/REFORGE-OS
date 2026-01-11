/**
 * Device Brand Detection Module
 * 
 * Automatically detects device brand/manufacturer to route to appropriate flash method.
 * Supports: Samsung, MediaTek, Qualcomm, Xiaomi, OnePlus, Google, and more.
 * 
 * @module device-detector
 */

import { safeSpawn, commandExistsSafe } from '../../../utils/safe-exec.js';
import { ADBLibrary } from '../../../../core/lib/adb.js';

/**
 * Device brand detection results
 * @typedef {Object} DeviceBrandInfo
 * @property {string} brand - Device brand (e.g., 'samsung', 'xiaomi', 'oneplus')
 * @property {string} model - Device model identifier
 * @property {number} confidence - Confidence level (0-1)
 * @property {string[]} detectionMethods - Methods used for detection
 * @property {Object} metadata - Additional device information
 */

/**
 * Supported device brands and their detection methods
 */
const SUPPORTED_BRANDS = {
  samsung: {
    identifiers: ['samsung', 'sm-g', 'sm-n', 'sm-a', 'galaxy'],
    flashMethod: 'odin',
    description: 'Samsung Galaxy devices (Odin mode)'
  },
  xiaomi: {
    identifiers: ['xiaomi', 'redmi', 'poco', 'mi '],
    flashMethod: 'miflash',
    description: 'Xiaomi/Redmi/Poco devices (MiFlash/EDL)'
  },
  oneplus: {
    identifiers: ['oneplus', 'one plus'],
    flashMethod: 'msm',
    description: 'OnePlus devices (MSM Tool/EDL)'
  },
  qualcomm: {
    identifiers: ['qualcomm', 'qcom'],
    flashMethod: 'edl',
    description: 'Qualcomm-based devices (EDL mode)'
  },
  mediatek: {
    identifiers: ['mediatek', 'mtk', 'mt'],
    flashMethod: 'spflash',
    description: 'MediaTek devices (SP Flash Tool)'
  },
  google: {
    identifiers: ['google', 'pixel'],
    flashMethod: 'fastboot',
    description: 'Google Pixel devices (Fastboot)'
  },
  motorola: {
    identifiers: ['motorola', 'moto'],
    flashMethod: 'fastboot',
    description: 'Motorola devices (Fastboot/EDL)'
  },
  sony: {
    identifiers: ['sony', 'xperia'],
    flashMethod: 'flashtool',
    description: 'Sony Xperia devices (FlashTool)'
  },
  lg: {
    identifiers: ['lg', 'lg-'],
    flashMethod: 'lgup',
    description: 'LG devices (LG UP)'
  }
};

/**
 * Detect device brand from ADB device properties
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<DeviceBrandInfo|null>} Device brand information or null if not detected
 */
export async function detectDeviceBrandFromADB(deviceSerial) {
  try {
    const propertiesResult = await ADBLibrary.getProperties(deviceSerial);
    if (!propertiesResult.success) {
      return null;
    }

    const properties = propertiesResult.properties;
    const brandLower = (properties['ro.product.brand'] || '').toLowerCase();
    const manufacturerLower = (properties['ro.product.manufacturer'] || '').toLowerCase();
    const modelLower = (properties['ro.product.model'] || '').toLowerCase();
    const deviceLower = (properties['ro.product.device'] || '').toLowerCase();

    const searchString = `${brandLower} ${manufacturerLower} ${modelLower} ${deviceLower}`.toLowerCase();

    // Check each brand's identifiers
    for (const [brand, config] of Object.entries(SUPPORTED_BRANDS)) {
      for (const identifier of config.identifiers) {
        if (searchString.includes(identifier)) {
          return {
            brand,
            model: properties['ro.product.model'] || modelLower,
            confidence: 0.9,
            detectionMethods: ['adb_properties'],
            metadata: {
              manufacturer: properties['ro.product.manufacturer'],
              brand: properties['ro.product.brand'],
              device: properties['ro.product.device'],
              flashMethod: config.flashMethod
            }
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[DeviceDetector] Error detecting brand from ADB:', error);
    return null;
  }
}

/**
 * Detect device brand from Fastboot device information
 * @param {string} deviceSerial - Device serial number
 * @returns {Promise<DeviceBrandInfo|null>} Device brand information or null if not detected
 */
export async function detectDeviceBrandFromFastboot(deviceSerial) {
  try {
    if (!(await commandExistsSafe('fastboot'))) {
      return null;
    }

    // Get product name from fastboot
    const productResult = await safeSpawn('fastboot', ['-s', deviceSerial, 'getvar', 'product'], {
      timeout: 5000
    });

    if (!productResult.success) {
      return null;
    }

    const productName = productResult.stdout.toLowerCase();
    const searchString = productName;

    // Check each brand's identifiers
    for (const [brand, config] of Object.entries(SUPPORTED_BRANDS)) {
      for (const identifier of config.identifiers) {
        if (searchString.includes(identifier)) {
          return {
            brand,
            model: productName,
            confidence: 0.85,
            detectionMethods: ['fastboot_getvar'],
            metadata: {
              product: productName,
              flashMethod: config.flashMethod
            }
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[DeviceDetector] Error detecting brand from Fastboot:', error);
    return null;
  }
}

/**
 * Detect device brand using multiple methods
 * @param {string} deviceSerial - Device serial number
 * @param {string} deviceMode - Device mode ('adb', 'fastboot', 'auto')
 * @returns {Promise<DeviceBrandInfo|null>} Device brand information
 */
export async function detectDeviceBrand(deviceSerial, deviceMode = 'auto') {
  let detectionMethods = [];

  // Try ADB detection first if in ADB mode or auto mode
  if (deviceMode === 'adb' || deviceMode === 'auto') {
    const adbResult = await detectDeviceBrandFromADB(deviceSerial);
    if (adbResult) {
      detectionMethods.push('adb');
      return {
        ...adbResult,
        detectionMethods: [...adbResult.detectionMethods, ...detectionMethods]
      };
    }
  }

  // Try Fastboot detection if in Fastboot mode or auto mode
  if (deviceMode === 'fastboot' || deviceMode === 'auto') {
    const fastbootResult = await detectDeviceBrandFromFastboot(deviceSerial);
    if (fastbootResult) {
      detectionMethods.push('fastboot');
      return {
        ...fastbootResult,
        detectionMethods: [...fastbootResult.detectionMethods, ...detectionMethods]
      };
    }
  }

  return null;
}

/**
 * Get recommended flash method for a device brand
 * @param {string} brand - Device brand
 * @returns {Object|null} Flash method configuration or null if brand not supported
 */
export function getFlashMethodForBrand(brand) {
  const brandConfig = SUPPORTED_BRANDS[brand.toLowerCase()];
  if (!brandConfig) {
    return null;
  }

  return {
    method: brandConfig.flashMethod,
    description: brandConfig.description,
    brand: brand.toLowerCase()
  };
}

/**
 * Get all supported brands
 * @returns {Object} Object mapping brand names to their configurations
 */
export function getSupportedBrands() {
  return Object.fromEntries(
    Object.entries(SUPPORTED_BRANDS).map(([brand, config]) => [
      brand,
      {
        flashMethod: config.flashMethod,
        description: config.description
      }
    ])
  );
}

