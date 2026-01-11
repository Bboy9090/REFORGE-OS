export type DeviceBrand = 
  | 'samsung' 
  | 'google' 
  | 'xiaomi' 
  | 'oneplus' 
  | 'motorola' 
  | 'lg' 
  | 'huawei' 
  | 'oppo' 
  | 'vivo' 
  | 'realme' 
  | 'asus' 
  | 'sony' 
  | 'nokia' 
  | 'htc' 
  | 'zte' 
  | 'lenovo' 
  | 'tcl' 
  | 'honor' 
  | 'nothing' 
  | 'fairphone'
  | 'apple'
  | 'unknown';

export type FlashMethod = 
  | 'fastboot' 
  | 'odin' 
  | 'edl' 
  | 'dfu' 
  | 'recovery' 
  | 'adb-sideload'
  | 'heimdall';

export type FlashStatus = 
  | 'idle' 
  | 'preparing' 
  | 'verifying' 
  | 'flashing' 
  | 'paused' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface DeviceFlashCapabilities {
  brand: DeviceBrand;
  supportedMethods: FlashMethod[];
  bootloaderUnlockRequired: boolean;
  specialInstructions?: string;
  warningMessage?: string;
  partitionSupport: string[];
}

export interface FlashJobConfig {
  deviceSerial: string;
  deviceBrand: DeviceBrand;
  flashMethod: FlashMethod;
  partitions: {
    name: string;
    imagePath: string;
    size: number;
  }[];
  verifyAfterFlash: boolean;
  autoReboot: boolean;
  wipeUserData: boolean;
}

export interface FlashProgress {
  jobId: string;
  deviceSerial: string;
  deviceBrand: DeviceBrand;
  status: FlashStatus;
  currentPartition?: string;
  overallProgress: number;
  partitionProgress: number;
  bytesTransferred: number;
  totalBytes: number;
  transferSpeed: number;
  estimatedTimeRemaining: number;
  currentStage: string;
  startedAt: number;
  pausedAt?: number;
  completedAt?: number;
  error?: string;
  warnings: string[];
}

export interface RealTimeFlashUpdate {
  type: 'status' | 'progress' | 'log' | 'warning' | 'error';
  jobId: string;
  timestamp: number;
  data: {
    status?: FlashStatus;
    progress?: number;
    message?: string;
    bytesTransferred?: number;
    transferSpeed?: number;
  };
}

export interface BootForgeDevice {
  serial: string;
  usbPath: string;
  vendorId: string;
  productId: string;
  manufacturer?: string;
  model?: string;
  brand: DeviceBrand;
  platform: 'android' | 'ios' | 'unknown';
  currentMode: 'normal' | 'fastboot' | 'recovery' | 'download' | 'edl' | 'dfu';
  bootloaderUnlocked?: boolean;
  capabilities: DeviceFlashCapabilities;
  correlationBadge?: string;
  matchedIds?: string[];
  confidence: number;
  lastSeen: number;
}

export interface FlashOperation {
  id: string;
  jobConfig: FlashJobConfig;
  progress: FlashProgress;
  logs: string[];
  canPause: boolean;
  canResume: boolean;
  canCancel: boolean;
}

export const DEVICE_BRAND_CAPABILITIES: Record<DeviceBrand, DeviceFlashCapabilities> = {
  samsung: {
    brand: 'samsung',
    supportedMethods: ['odin', 'heimdall', 'fastboot'],
    bootloaderUnlockRequired: true,
    specialInstructions: 'Use Odin mode (Vol Down + Power + Home) for Samsung-specific firmware',
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor', 'modem', 'bootloader'],
    warningMessage: 'Samsung devices may trip KNOX counter when flashing',
  },
  google: {
    brand: 'google',
    supportedMethods: ['fastboot', 'adb-sideload'],
    bootloaderUnlockRequired: true,
    specialInstructions: 'Use fastboot commands for Pixel devices',
    partitionSupport: ['boot', 'system', 'vendor', 'product', 'recovery', 'dtbo', 'vbmeta'],
  },
  xiaomi: {
    brand: 'xiaomi',
    supportedMethods: ['fastboot', 'edl'],
    bootloaderUnlockRequired: true,
    specialInstructions: 'EDL mode available for deeply bricked devices',
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor', 'cust'],
    warningMessage: 'Xiaomi requires waiting period for bootloader unlock',
  },
  oneplus: {
    brand: 'oneplus',
    supportedMethods: ['fastboot', 'adb-sideload'],
    bootloaderUnlockRequired: true,
    specialInstructions: 'OnePlus uses standard fastboot protocol',
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor', 'modem'],
  },
  motorola: {
    brand: 'motorola',
    supportedMethods: ['fastboot'],
    bootloaderUnlockRequired: true,
    specialInstructions: 'Motorola bootloader unlock requires official unlock code',
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor', 'logo'],
  },
  lg: {
    brand: 'lg',
    supportedMethods: ['fastboot', 'recovery'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache'],
  },
  huawei: {
    brand: 'huawei',
    supportedMethods: ['fastboot'],
    bootloaderUnlockRequired: true,
    warningMessage: 'Huawei stopped providing bootloader unlock codes',
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor'],
  },
  oppo: {
    brand: 'oppo',
    supportedMethods: ['fastboot', 'recovery'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor'],
  },
  vivo: {
    brand: 'vivo',
    supportedMethods: ['fastboot', 'recovery'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache'],
  },
  realme: {
    brand: 'realme',
    supportedMethods: ['fastboot'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor'],
  },
  asus: {
    brand: 'asus',
    supportedMethods: ['fastboot', 'adb-sideload'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor'],
  },
  sony: {
    brand: 'sony',
    supportedMethods: ['fastboot'],
    bootloaderUnlockRequired: true,
    specialInstructions: 'Sony devices may lose DRM keys when unlocking bootloader',
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor', 'fota'],
    warningMessage: 'Camera quality may degrade after bootloader unlock',
  },
  nokia: {
    brand: 'nokia',
    supportedMethods: ['fastboot'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor'],
  },
  htc: {
    brand: 'htc',
    supportedMethods: ['fastboot'],
    bootloaderUnlockRequired: true,
    specialInstructions: 'HTC requires official unlock token from HTCDev',
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache'],
  },
  zte: {
    brand: 'zte',
    supportedMethods: ['fastboot', 'edl'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache'],
  },
  lenovo: {
    brand: 'lenovo',
    supportedMethods: ['fastboot'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor'],
  },
  tcl: {
    brand: 'tcl',
    supportedMethods: ['fastboot'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache'],
  },
  honor: {
    brand: 'honor',
    supportedMethods: ['fastboot'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor'],
  },
  nothing: {
    brand: 'nothing',
    supportedMethods: ['fastboot'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor', 'dtbo', 'vbmeta'],
  },
  fairphone: {
    brand: 'fairphone',
    supportedMethods: ['fastboot', 'adb-sideload'],
    bootloaderUnlockRequired: false,
    specialInstructions: 'Fairphone officially supports bootloader unlock',
    partitionSupport: ['boot', 'system', 'recovery', 'userdata', 'cache', 'vendor'],
  },
  apple: {
    brand: 'apple',
    supportedMethods: ['dfu'],
    bootloaderUnlockRequired: false,
    specialInstructions: 'iOS devices use DFU mode and require iTunes/Finder or third-party tools',
    partitionSupport: [],
    warningMessage: 'iOS flashing limited by Apple security restrictions',
  },
  unknown: {
    brand: 'unknown',
    supportedMethods: ['fastboot', 'recovery'],
    bootloaderUnlockRequired: true,
    partitionSupport: ['boot', 'system', 'recovery'],
    warningMessage: 'Unknown device - proceed with extreme caution',
  },
};
