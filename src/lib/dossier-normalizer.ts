// Dossier Normalizer - Normalizes device data from various sources
// Creates unified device profiles for Bobby's World

export interface NormalizedDevice {
  deviceUid: string;
  serial: string;
  platformHint: 'android' | 'ios' | 'unknown';
  brand?: string;
  model?: string;
  manufacturer?: string;
  currentMode: string;
  confidence: number;
  sources: string[];
  matchedToolIds: string[];
  correlationBadge?: string;
  lastSeen: number;
  metadata: Record<string, any>;
}

export interface RawDeviceData {
  source: string;
  data: Record<string, any>;
}

export interface DossierNormalizerAPI {
  normalize(rawData: RawDeviceData): NormalizedDevice;
  merge(devices: NormalizedDevice[]): NormalizedDevice;
  generateCorrelationBadge(device: NormalizedDevice): string;
  extractSerialFromEvidence(evidence: Record<string, any>[]): string | null;
}

export function normalizeBootForgeUSBRecord(record: Record<string, any>): NormalizedDevice {
  return {
    deviceUid: record.serial || record.device_uid || generateDeviceUid(),
    serial: record.serial || 'unknown',
    platformHint: detectPlatform(record),
    brand: record.brand || record.manufacturer,
    model: record.model,
    manufacturer: record.manufacturer,
    currentMode: record.mode || record.current_mode || 'normal',
    confidence: record.confidence || 0.5,
    sources: ['bootforge'],
    matchedToolIds: record.matched_tool_ids || [],
    correlationBadge: record.correlation_badge,
    lastSeen: Date.now(),
    metadata: record
  };
}

function generateDeviceUid(): string {
  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function detectPlatform(record: Record<string, any>): 'android' | 'ios' | 'unknown' {
  const platform = record.platform || record.platform_hint || '';
  if (platform.toLowerCase().includes('android')) return 'android';
  if (platform.toLowerCase().includes('ios') || platform.toLowerCase().includes('apple')) return 'ios';
  
  // Check vendor ID for Apple devices
  if (record.vendor_id === '0x05ac' || record.vendorId === '0x05ac') return 'ios';
  
  return 'unknown';
}

export const dossierNormalizer: DossierNormalizerAPI = {
  normalize(rawData: RawDeviceData): NormalizedDevice {
    const { source, data } = rawData;

    switch (source) {
      case 'bootforge':
        return normalizeBootForgeUSBRecord(data);
      case 'adb':
        return {
          deviceUid: data.serial || generateDeviceUid(),
          serial: data.serial,
          platformHint: 'android',
          brand: data.product,
          model: data.model,
          manufacturer: data.manufacturer,
          currentMode: data.state || 'normal',
          confidence: 0.9,
          sources: ['adb'],
          matchedToolIds: ['adb'],
          lastSeen: Date.now(),
          metadata: data
        };
      case 'fastboot':
        return {
          deviceUid: data.serial || generateDeviceUid(),
          serial: data.serial,
          platformHint: 'android',
          currentMode: 'fastboot',
          confidence: 0.9,
          sources: ['fastboot'],
          matchedToolIds: ['fastboot'],
          lastSeen: Date.now(),
          metadata: data
        };
      default:
        return {
          deviceUid: data.serial || data.id || generateDeviceUid(),
          serial: data.serial || 'unknown',
          platformHint: detectPlatform(data),
          currentMode: 'unknown',
          confidence: 0.3,
          sources: [source],
          matchedToolIds: [],
          lastSeen: Date.now(),
          metadata: data
        };
    }
  },

  merge(devices: NormalizedDevice[]): NormalizedDevice {
    if (devices.length === 0) {
      throw new Error('Cannot merge empty device list');
    }

    if (devices.length === 1) {
      return devices[0];
    }

    // Use highest confidence device as base
    const sorted = [...devices].sort((a, b) => b.confidence - a.confidence);
    const base = { ...sorted[0] };

    // Merge data from other devices
    for (const device of sorted.slice(1)) {
      if (!base.brand && device.brand) base.brand = device.brand;
      if (!base.model && device.model) base.model = device.model;
      if (!base.manufacturer && device.manufacturer) base.manufacturer = device.manufacturer;
      
      base.sources = [...new Set([...base.sources, ...device.sources])];
      base.matchedToolIds = [...new Set([...base.matchedToolIds, ...device.matchedToolIds])];
      base.confidence = Math.max(base.confidence, device.confidence);
    }

    base.correlationBadge = this.generateCorrelationBadge(base);
    return base;
  },

  generateCorrelationBadge(device: NormalizedDevice): string {
    const parts = [
      device.brand?.slice(0, 3).toUpperCase() || 'UNK',
      device.model?.slice(0, 3).toUpperCase() || 'XXX',
      device.serial.slice(-4).toUpperCase()
    ];
    return parts.join('-');
  },

  extractSerialFromEvidence(evidence: Record<string, any>[]): string | null {
    for (const item of evidence) {
      if (item.serial) return item.serial;
      if (item.deviceSerial) return item.deviceSerial;
      if (item.serialno) return item.serialno;
    }
    return null;
  }
};
