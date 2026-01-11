// BootForge API - Client for the BootForge USB Flash service
// Handles device scanning, flash operations, and real-time updates

import type {
  BootForgeDevice,
  FlashJobConfig,
  FlashOperation,
  FlashProgress,
  FlashStatus,
  DeviceBrand,
  DEVICE_BRAND_CAPABILITIES
} from '@/types/flash-operations';

const API_BASE = 'http://localhost:3001/api/bootforge';

// No mock data in production paths

export interface BootForgeAPI {
  scanDevices(): Promise<BootForgeDevice[]>;
  getDeviceInfo(serial: string): Promise<BootForgeDevice | null>;
  startFlashJob(config: FlashJobConfig): Promise<string>;
  pauseFlashJob(jobId: string): Promise<boolean>;
  resumeFlashJob(jobId: string): Promise<boolean>;
  cancelFlashJob(jobId: string): Promise<boolean>;
  getFlashProgress(jobId: string): Promise<FlashProgress | null>;
  getActiveFlashOperations(): Promise<FlashOperation[]>;
  getFlashHistory(limit?: number): Promise<FlashOperation[]>;
  verifyFlashResult(jobId: string): Promise<{ success: boolean; errors: string[] }>;
  getWebSocketUrl(jobId?: string): string;
  checkServerHealth(): Promise<{ healthy: boolean; version: string }>;
}

export const bootForgeAPI: BootForgeAPI = {
  async scanDevices(): Promise<BootForgeDevice[]> {
    try {
      const response = await fetch(`${API_BASE}/devices/scan`);
      if (!response.ok) {
        throw new Error('BootForgeUSB service unavailable');
      }
      const data = await response.json();
      return data.devices || [];
    } catch (err) {
      throw new Error('BootForgeUSB service unavailable');
    }
  },

  async getDeviceInfo(serial: string): Promise<BootForgeDevice | null> {
    try {
      const response = await fetch(`${API_BASE}/devices/${serial}`);
      if (!response.ok) {
        throw new Error('BootForgeUSB service unavailable');
      }
      return await response.json();
    } catch (err) {
      throw new Error('BootForgeUSB service unavailable');
    }
  },

  async startFlashJob(config: FlashJobConfig): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/flash/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) {
        throw new Error('Failed to start flash job');
      }
      const data = await response.json();
      return data.jobId;
    } catch (err) {
      throw new Error('Failed to start flash job');
    }
  },

  async pauseFlashJob(jobId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/flash/${jobId}/pause`, { method: 'POST' });
    if (!response.ok) return false;
    return true;
  },

  async resumeFlashJob(jobId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/flash/${jobId}/resume`, { method: 'POST' });
    if (!response.ok) return false;
    return true;
  },

  async cancelFlashJob(jobId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/flash/${jobId}/cancel`, { method: 'POST' });
    if (!response.ok) return false;
    return true;
  },

  async getFlashProgress(jobId: string): Promise<FlashProgress | null> {
    const response = await fetch(`${API_BASE}/flash/${jobId}/progress`);
    if (!response.ok) return null;
    return await response.json();
  },

  async getActiveFlashOperations(): Promise<FlashOperation[]> {
    try {
      const response = await fetch(`${API_BASE}/flash/active`);
      if (!response.ok) {
        throw new Error('Failed to query active flash operations');
      }
      return await response.json();
    } catch (err) {
      throw new Error('Failed to query active flash operations');
    }
  },

  async getFlashHistory(limit: number = 50): Promise<FlashOperation[]> {
    try {
      const response = await fetch(`${API_BASE}/flash/history?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to query flash history');
      }
      return await response.json();
    } catch (err) {
      throw new Error('Failed to query flash history');
    }
  },

  async verifyFlashResult(jobId: string): Promise<{ success: boolean; errors: string[] }> {
    const response = await fetch(`${API_BASE}/flash/${jobId}/verify`);
    if (!response.ok) {
      return { success: false, errors: ['Verification failed'] };
    }
    return await response.json();
  },

  getWebSocketUrl(jobId?: string): string {
    const wsBase = API_BASE.replace('http', 'ws');
    return jobId ? `${wsBase}/flash/ws/${jobId}` : `${wsBase}/devices/ws`;
  },

  async checkServerHealth(): Promise<{ healthy: boolean; version: string }> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Server unavailable
    }
    
    return { healthy: false, version: 'unknown' };
  }
};
