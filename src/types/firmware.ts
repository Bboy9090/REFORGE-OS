export interface FirmwareVersion {
  version: string;
  buildNumber?: string;
  buildDate?: string;
  securityPatch?: string;
  bootloaderVersion?: string;
  basebandVersion?: string;
  kernelVersion?: string;
}

export interface FirmwareInfo {
  deviceSerial: string;
  deviceModel?: string;
  deviceBrand?: string;
  current: FirmwareVersion;
  latest?: FirmwareVersion;
  updateAvailable: boolean;
  securityStatus: 'current' | 'outdated' | 'critical' | 'unknown';
  releaseNotes?: string;
  downloadUrl?: string;
  fileSize?: number;
  checksum?: string;
  lastChecked: number;
}

export interface FirmwareDatabase {
  brand: string;
  model: string;
  versions: FirmwareVersion[];
  latestVersion: string;
  latestBuildDate?: string;
  officialDownloadUrl?: string;
  notes?: string;
}

export interface FirmwareCheckResult {
  deviceSerial: string;
  success: boolean;
  firmware?: FirmwareInfo;
  error?: string;
  timestamp: number;
}

export interface BrandFirmwareList {
  brand: string;
  models: {
    model: string;
    codename?: string;
    versions: FirmwareVersion[];
    latestVersion: string;
    downloadUrls?: string[];
  }[];
}

export type FirmwareSource = 'device' | 'database' | 'api' | 'cache' | 'manual';

export interface FirmwareDownload {
  id: string;
  deviceSerial: string;
  deviceModel: string;
  firmwareVersion: string;
  url: string;
  fileSize: number;
  checksum: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  progress: number;
  downloadSpeed?: number;
  estimatedTimeRemaining?: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}
