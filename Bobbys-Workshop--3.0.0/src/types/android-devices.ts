export interface AndroidDeviceProperties {
  manufacturer?: string;
  brand?: string;
  model?: string;
  androidVersion?: string;
  sdkVersion?: string;
  buildId?: string;
  bootloader?: string;
  secure?: boolean;
  debuggable?: boolean;
}

export interface FastbootDeviceProperties {
  product?: string;
  variant?: string;
  bootloaderVersion?: string;
  basebandVersion?: string;
  serialNumber?: string;
  secure?: boolean;
  unlocked?: boolean;
  bootloaderState?: 'locked' | 'unlocked' | 'unknown';
}

export type DeviceMode = 
  | 'android_os' 
  | 'recovery' 
  | 'sideload' 
  | 'bootloader' 
  | 'unauthorized' 
  | 'offline' 
  | 'unknown';

export type DeviceSource = 'adb' | 'fastboot';

export interface AndroidDevice {
  id: string;
  serial: string;
  state: string;
  deviceMode: DeviceMode;
  bootloaderMode?: string | null;
  source: DeviceSource;
  product?: string | null;
  model?: string | null;
  device?: string | null;
  properties: AndroidDeviceProperties | FastbootDeviceProperties;
  transportId?: string;
}

export interface AndroidDevicesResponse {
  count: number;
  devices: AndroidDevice[];
  sources: {
    adb: { 
      available: boolean; 
      count: number;
      version?: string | null;
    };
    fastboot: { 
      available: boolean; 
      count: number;
    };
  };
  timestamp: string;
}

export interface ADBDeviceDetails {
  serial: string;
  state: string;
  deviceMode: DeviceMode;
  bootloaderMode?: string | null;
  product?: string | null;
  model?: string | null;
  device?: string | null;
  transportId?: string | null;
  properties: AndroidDeviceProperties;
  info: string;
}

export interface FastbootDeviceDetails {
  serial: string;
  mode: string;
  deviceMode: 'bootloader';
  bootloaderMode: string;
  properties: FastbootDeviceProperties;
}
