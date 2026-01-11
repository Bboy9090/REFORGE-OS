// Flash API - Backend client for flash operations.
// Truth-first: no mock fallbacks, no fabricated IDs.

import { API_CONFIG, getAPIUrl } from '@/lib/apiConfig';
import { connectFlashProgress, type RealtimeConnection } from '@/lib/realtime';
import type { FlashJobConfig as CanonicalFlashJobConfig } from '@/types/flash-operations';

export interface FlashDevice {
  serial: string;
  brand: string;
  model: string;
  mode: string;
  capabilities: string[];
  connectionType: string;
  isBootloader: boolean;
  isRecovery: boolean;
  isDFU: boolean;
  isEDL: boolean;
}

export type FlashJobConfig = CanonicalFlashJobConfig;

export interface FlashOperationStatus {
  jobId: string;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  bytesWritten: number;
  totalBytes: number;
  speed: number;
  timeElapsed: number;
  timeRemaining: number;
  logs: string[];
  startTime: number;
}

export interface FlashHistoryEntry {
  jobId: string;
  deviceSerial: string;
  deviceBrand?: string;
  flashMethod: string;
  partitions: string[];
  status: 'completed' | 'failed' | 'cancelled';
  startTime: number;
  endTime: number;
  duration: number;
  bytesWritten: number;
  averageSpeed: number;
}

export interface FlashStartResponse {
  jobId: string;
}

export type FlashProgressMessage =
  | { type: 'progress'; status: FlashOperationStatus }
  | { type: 'completed'; status: FlashOperationStatus }
  | { type: 'failed'; error?: string; status?: FlashOperationStatus }
  | { type: 'cancelled'; status: FlashOperationStatus };

async function readErrorBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text || `${response.status} ${response.statusText}`;
  } catch {
    return `${response.status} ${response.statusText}`;
  }
}

export const flashAPI = {
  async scanDevices(): Promise<FlashDevice[]> {
    const response = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.FLASH_DEVICES));
    if (!response.ok) {
      throw new Error(`Device scan failed: ${await readErrorBody(response)}`);
    }
    const data: any = await response.json();
    return Array.isArray(data?.devices) ? data.devices : [];
  },

  async startFlash(config: FlashJobConfig): Promise<FlashStartResponse> {
    const response = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.FLASH_START), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Flash start failed: ${await readErrorBody(response)}`);
    }

    const data: any = await response.json();
    if (!data?.jobId || typeof data.jobId !== 'string') {
      throw new Error('Flash start failed: missing jobId in response');
    }
    return { jobId: data.jobId };
  },

  connectProgressWebSocket(
    jobId: string,
    onMessage: (message: FlashProgressMessage) => void,
    onError?: (error: Event) => void,
  ): RealtimeConnection {
    const conn = connectFlashProgress(jobId);

    conn.onmessage = (event) => {
      const parsed = JSON.parse(event.data) as FlashProgressMessage;
      onMessage(parsed);
    };

    conn.onerror = (event) => {
      onError?.(event as Event);
    };

    return conn;
  },

  async pauseFlash(jobId: string): Promise<void> {
    const response = await fetch(getAPIUrl(`${API_CONFIG.ENDPOINTS.FLASH_PAUSE}/${encodeURIComponent(jobId)}`), {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Pause failed: ${await readErrorBody(response)}`);
    }
  },

  async resumeFlash(jobId: string): Promise<void> {
    const response = await fetch(getAPIUrl(`${API_CONFIG.ENDPOINTS.FLASH_RESUME}/${encodeURIComponent(jobId)}`), {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Resume failed: ${await readErrorBody(response)}`);
    }
  },

  async cancelFlash(jobId: string): Promise<void> {
    const response = await fetch(getAPIUrl(`${API_CONFIG.ENDPOINTS.FLASH_CANCEL}/${encodeURIComponent(jobId)}`), {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Cancel failed: ${await readErrorBody(response)}`);
    }
  },

  async getDeviceInfo(serial: string): Promise<any> {
    const response = await fetch(getAPIUrl(`${API_CONFIG.ENDPOINTS.FLASH_DEVICE_INFO}/${encodeURIComponent(serial)}`));
    if (!response.ok) {
      throw new Error(`Device info failed: ${await readErrorBody(response)}`);
    }
    const data: any = await response.json();
    return data?.device ?? data;
  },

  async getDevicePartitions(serial: string): Promise<string[]> {
    const response = await fetch(
      getAPIUrl(`${API_CONFIG.ENDPOINTS.FLASH_DEVICE_PARTITIONS}/${encodeURIComponent(serial)}/partitions`),
    );
    if (!response.ok) {
      throw new Error(`Partitions unavailable: ${await readErrorBody(response)}`);
    }
    const data: any = await response.json();
    return Array.isArray(data?.partitions) ? data.partitions : [];
  },

  async validateImage(filePath: string): Promise<{ valid: boolean; type?: string; size?: number; error?: string }> {
    const response = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.FLASH_VALIDATE_IMAGE), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath }),
    });

    if (!response.ok) {
      throw new Error(`Validate image failed: ${await readErrorBody(response)}`);
    }
    return await response.json();
  },

  async getFlashHistory(limit: number = 50): Promise<FlashHistoryEntry[]> {
    const response = await fetch(
      getAPIUrl(`${API_CONFIG.ENDPOINTS.FLASH_HISTORY}?limit=${encodeURIComponent(String(limit))}`),
    );
    if (!response.ok) {
      throw new Error(`Flash history unavailable: ${await readErrorBody(response)}`);
    }
    const data: any = await response.json();
    return Array.isArray(data?.history) ? data.history : [];
  },

  async getActiveOperations(): Promise<FlashOperationStatus[]> {
    const response = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.FLASH_ACTIVE_OPERATIONS));
    if (!response.ok) {
      throw new Error(`Active operations unavailable: ${await readErrorBody(response)}`);
    }
    const data: any = await response.json();
    return Array.isArray(data?.operations) ? data.operations : [];
  },
} as const;
