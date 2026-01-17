// Firmware API - Handles firmware discovery, version checking, and downloads
// Part of Bobby's World toolkit

import type { 
  FirmwareInfo, 
  FirmwareDatabase, 
  FirmwareCheckResult, 
  BrandFirmwareList,
  FirmwareVersion 
} from '../types/firmware';

const API_BASE = 'http://localhost:3001/api/firmware';

export async function getAllBrandsWithFirmware(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/brands`);
    if (!response.ok) {
      throw new Error('Firmware service unavailable');
    }
    return await response.json();
  } catch (err) {
    throw new Error('Firmware service unavailable');
  }
}

export async function getBrandFirmwareList(brand: string): Promise<BrandFirmwareList> {
  try {
    const response = await fetch(`${API_BASE}/brands/${encodeURIComponent(brand)}`);
    if (!response.ok) {
      throw new Error('Firmware service unavailable');
    }
    return await response.json();
  } catch (err) {
    throw new Error('Firmware service unavailable');
  }
}

export async function searchFirmware(query: string): Promise<FirmwareDatabase[]> {
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Firmware service unavailable');
    }
    return await response.json();
  } catch (err) {
    throw new Error('Firmware service unavailable');
  }
}

export async function checkDeviceFirmware(deviceSerial: string): Promise<FirmwareCheckResult> {
  try {
    const response = await fetch(`${API_BASE}/check/${encodeURIComponent(deviceSerial)}`);
    if (!response.ok) {
      throw new Error('Firmware check service unavailable');
    }
    return await response.json();
  } catch (err) {
    throw new Error('Firmware check service unavailable');
  }
}

export async function checkMultipleDevicesFirmware(
  deviceSerials: string[]
): Promise<FirmwareCheckResult[]> {
  const results: FirmwareCheckResult[] = [];
  
  for (const serial of deviceSerials) {
    const result = await checkDeviceFirmware(serial);
    results.push(result);
  }
  
  return results;
}

export async function getFirmwareInfo(brand: string, model: string): Promise<FirmwareDatabase | null> {
  try {
    const response = await fetch(
      `${API_BASE}/info/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`
    );
    if (!response.ok) {
      throw new Error('Firmware info service unavailable');
    }
    return await response.json();
  } catch (err) {
    throw new Error('Firmware info service unavailable');
  }
}

export async function downloadFirmware(
  brand: string, 
  model: string, 
  version: string,
  onProgress?: (progress: number) => void
): Promise<Blob | null> {
  throw new Error('Firmware downloads are disabled. Configure the firmware service to enable downloads.');
}
