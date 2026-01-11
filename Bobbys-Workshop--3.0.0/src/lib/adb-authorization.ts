// ADB Authorization - Triggers/inspects real ADB authorization state via backend.
// Truth-first: no simulated authorization state, no fake key material.

import { API_CONFIG, getAPIUrl } from '@/lib/apiConfig';

export interface ADBAuthorizationState {
  deviceSerial: string;
  authorized: boolean;
  pendingApproval: boolean;
  publicKeyHash?: string;
  lastAuthorized?: number;
  authorizedBy?: string;
}

export interface AdbTriggerAuthResponse {
  success: boolean;
  message: string;
  serial?: string;
  note?: string;
  availableSerials?: string[];
  hint?: string;
  [key: string]: unknown;
}

export interface ADBAuthorizationAPI {
  checkAuthorization(deviceSerial: string): Promise<ADBAuthorizationState>;
  requestAuthorization(deviceSerial: string): Promise<AdbTriggerAuthResponse>;
  revokeAuthorization(deviceSerial: string): Promise<boolean>;
  listAuthorizedDevices(): Promise<ADBAuthorizationState[]>;
  exportPublicKey(): Promise<string>;
}

type AdbDevicesResponse = {
  count: number;
  devices: Array<{ serial: string; state: string }>;
  [key: string]: unknown;
};

async function safeReadJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function normalizeMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const maybeMessage = (payload as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;
  }
  return fallback;
}

// Trigger ADB authorization prompt on device via backend.
export async function triggerADBAuthorization(deviceSerial: string): Promise<AdbTriggerAuthResponse> {
  return adbAuthorization.requestAuthorization(deviceSerial);
}

export const adbAuthorization: ADBAuthorizationAPI = {
  async checkAuthorization(deviceSerial: string): Promise<ADBAuthorizationState> {
    const url = getAPIUrl(API_CONFIG.ENDPOINTS.ADB_DEVICES);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });

    const payload = await safeReadJson(response);
    if (!response.ok) {
      throw new Error(normalizeMessage(payload, `Failed to query ADB devices (HTTP ${response.status})`));
    }

    const data = payload as AdbDevicesResponse;
    const match = Array.isArray(data?.devices)
      ? data.devices.find(d => d && d.serial === deviceSerial)
      : undefined;

    const state = match?.state;
    return {
      deviceSerial,
      authorized: state === 'device',
      pendingApproval: state === 'unauthorized',
    };
  },

  async requestAuthorization(deviceSerial: string): Promise<AdbTriggerAuthResponse> {
    const url = getAPIUrl(API_CONFIG.ENDPOINTS.ADB_TRIGGER_AUTH);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ serial: deviceSerial }),
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      const payload = (await safeReadJson(response)) as AdbTriggerAuthResponse | null;
      if (payload && typeof payload === 'object') {
        if (!response.ok) {
          return {
            ...payload,
            success: false,
            message: normalizeMessage(payload, `Failed to trigger authorization (HTTP ${response.status})`),
          };
        }
        return payload;
      }

      return {
        success: false,
        message: response.ok
          ? 'Backend returned a non-JSON response for ADB authorization trigger'
          : `Failed to trigger authorization (HTTP ${response.status})`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Authorization request failed: ${message}` };
    }
  },

  async revokeAuthorization(deviceSerial: string): Promise<boolean> {
    throw new Error(
      `Revoke is not supported. Android ADB authorization must be revoked on the device (Developer options: Revoke USB debugging authorizations). Serial: ${deviceSerial}`
    );
  },

  async listAuthorizedDevices(): Promise<ADBAuthorizationState[]> {
    const url = getAPIUrl(API_CONFIG.ENDPOINTS.ADB_DEVICES);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });
    const payload = await safeReadJson(response);
    if (!response.ok) {
      throw new Error(normalizeMessage(payload, `Failed to query ADB devices (HTTP ${response.status})`));
    }

    const data = payload as AdbDevicesResponse;
    if (!Array.isArray(data?.devices)) return [];

    return data.devices
      .filter(d => d && typeof d.serial === 'string' && d.state === 'device')
      .map(d => ({
        deviceSerial: d.serial,
        authorized: true,
        pendingApproval: false,
      }));
  },

  async exportPublicKey(): Promise<string> {
    throw new Error('Public key export is not implemented. This app does not manage ADB key material.');
  }
};
