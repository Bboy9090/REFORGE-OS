// Backend-backed authorization trigger client (no mock/demo paths).

import { getAPIUrl } from '@/lib/apiConfig';

export type DevicePlatform = 'android' | 'ios' | 'fastboot' | 'samsung' | 'qualcomm' | 'mediatek';

export type AuthorizationTriggerResult = {
  success: boolean;
  message: string;
  triggered?: boolean;
  requiresUserAction?: boolean;
  authorizationType?: string;
  error?: string;
  toolMissing?: boolean;
  installGuide?: string;
  manualCommand?: string;
  alternativeCommand?: string;
  manualSteps?: string[];
  warning?: string;
  note?: string;
  deviceSerial?: string;
  deviceUdid?: string;
};

export type TriggerAllResponse = {
  success: boolean;
  message: string;
  deviceId?: string;
  platform?: string;
  totalTriggers?: number;
  successfulTriggers?: number;
  failedTriggers?: number;
  results: Array<
    {
      triggerId: string;
      triggerName: string;
    } & AuthorizationTriggerResult
  >;
};

async function postJson<TResponse>(endpoint: string, body: unknown): Promise<TResponse> {
  const response = await fetch(getAPIUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  const text = await response.text();
  const maybeJson = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      (maybeJson && typeof maybeJson === 'object' && 'error' in maybeJson && typeof (maybeJson as any).error === 'string')
        ? (maybeJson as any).error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return maybeJson as TResponse;
}

async function getJson<TResponse>(endpoint: string): Promise<TResponse> {
  const response = await fetch(getAPIUrl(endpoint), {
    method: 'GET',
    signal: AbortSignal.timeout(10000),
  });

  const text = await response.text();
  const maybeJson = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      (maybeJson && typeof maybeJson === 'object' && 'error' in maybeJson && typeof (maybeJson as any).error === 'string')
        ? (maybeJson as any).error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return maybeJson as TResponse;
}

export const authTriggers = {
  // Android / ADB
  triggerADBUSBDebugging: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/adb/trigger-usb-debugging', { serial }),
  triggerADBFileTransfer: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/adb/trigger-file-transfer', { serial }),
  triggerADBBackupAuth: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/adb/trigger-backup', { serial }),
  triggerADBScreenshotAuth: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/adb/trigger-screen-capture', { serial }),
  triggerWiFiADBAuth: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/adb/trigger-wifi-adb', { serial }),
  verifyDeveloperOptions: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/adb/verify-developer-options', { serial }),
  checkUSBDebuggingStatus: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/adb/check-debugging-status', { serial }),
  rebootToRecovery: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/adb/reboot-recovery', { serial }),
  rebootToBootloader: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/adb/reboot-bootloader', { serial }),
  rebootToEDL: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/adb/reboot-edl', { serial }),

  // iOS
  triggerIOSTrustComputer: (udid: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/ios/trigger-trust-computer', { udid }),
  triggerIOSPairing: (udid: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/ios/trigger-pairing', { udid }),
  triggerIOSBackupEncryption: (udid: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/ios/trigger-backup-encryption', { udid }),
  triggerDFUModeEntry: (udid: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/ios/trigger-dfu', { udid }),
  triggerIOSAppInstallAuth: (udid: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/ios/trigger-app-install', { udid }),
  triggerIOSDeveloperTrust: (udid: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/ios/trigger-developer-trust', { udid }),

  // Fastboot
  triggerFastbootUnlockVerify: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/fastboot/verify-unlock', { serial }),
  triggerFastbootOEMUnlock: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/fastboot/trigger-oem-unlock', { serial }),

  // Samsung / Qualcomm / MTK
  triggerOdinDownloadMode: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/samsung/trigger-download-mode', { serial }),
  triggerEDLAuthorization: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/qualcomm/verify-edl', { serial }),
  triggerMTKSPFlashAuth: (serial: string) =>
    postJson<AuthorizationTriggerResult>('/api/authorization/mediatek/verify-flash', { serial }),

  // Catalog / One-click
  getAllAvailableTriggers: (platform: DevicePlatform | 'all' = 'all') =>
    getJson<{ success: boolean; triggers: any; platform?: string; totalCount?: number }>(
      `/api/authorization/triggers?platform=${encodeURIComponent(platform)}`
    ),
  triggerAllAvailableAuthorizations: (deviceId: string, platform: DevicePlatform) =>
    postJson<TriggerAllResponse>('/api/authorization/trigger-all', { deviceId, platform }),
} as const;
