/**
 * Authorization Triggers - Backend-backed implementation
 *
 * Truth-only: no simulated execution. All trigger executions call real backend endpoints.
 */

import { getAPIUrl } from '@/lib/apiConfig';

export type TriggerCategory =
  | 'trust_security'
  | 'flash_operations'
  | 'diagnostics'
  | 'evidence_reports'
  | 'policy_compliance'
  | 'hotplug_events'
  | 'plugin_actions';

export type TriggerRiskLevel = 'low' | 'medium' | 'high' | 'destructive';

export type TriggerHttpMethod = 'POST' | 'GET';

export interface AuthorizationTrigger {
  id: string;
  name: string;
  category: TriggerCategory;
  riskLevel: TriggerRiskLevel;

  frontendPrompt: string;
  modalText: string;

  method: TriggerHttpMethod;
  backendEndpoint: string;

  deviceIdRequired: boolean;
  deviceIdField: 'serial' | 'udid';

  requiresTypedConfirmation: boolean;
  confirmationText?: string;
}

export type ExecuteTriggerResult =
  | { success: true; data: any }
  | { success: false; error: string; data?: any };

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function requestJson(endpoint: string, options: RequestInit, timeoutMs: number) {
  const response = await fetch(getAPIUrl(endpoint), {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
  });

  const text = await response.text();
  const json = text ? safeJsonParse(text) : null;
  return { response, json };
}

export const AUTHORIZATION_TRIGGERS: AuthorizationTrigger[] = [
  // Android (ADB)
  {
    id: 'adb_usb_debugging',
    name: 'ADB USB Debugging Authorization',
    category: 'trust_security',
    riskLevel: 'medium',
    frontendPrompt: 'Trigger the “Allow USB debugging?” authorization flow (Android).',
    modalText:
      'This runs a harmless ADB command against the device to surface the USB debugging authorization prompt when needed.',
    method: 'POST',
    backendEndpoint: '/api/authorization/adb/trigger-usb-debugging',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'file_transfer',
    name: 'File Transfer Permission',
    category: 'trust_security',
    riskLevel: 'low',
    frontendPrompt: 'Trigger file transfer permission (push a small test file).',
    modalText:
      'This attempts to push a small file to /sdcard/Download to validate/trigger file transfer authorization.',
    method: 'POST',
    backendEndpoint: '/api/authorization/adb/trigger-file-transfer',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'backup_auth',
    name: 'Backup Authorization',
    category: 'trust_security',
    riskLevel: 'medium',
    frontendPrompt: 'Trigger Android backup authorization prompt (may require unlock).',
    modalText:
      'This attempts an ADB backup operation to prompt for backup authorization where supported.',
    method: 'POST',
    backendEndpoint: '/api/authorization/adb/trigger-backup',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'screen_capture',
    name: 'Screen Capture Permission',
    category: 'diagnostics',
    riskLevel: 'low',
    frontendPrompt: 'Verify/trigger screen capture permission (Android).',
    modalText:
      'This runs a screencap test on the device and cleans up the temporary file if successful.',
    method: 'POST',
    backendEndpoint: '/api/authorization/adb/trigger-screen-capture',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'install_auth',
    name: 'Install From Computer (Manual Command)',
    category: 'trust_security',
    riskLevel: 'medium',
    frontendPrompt: 'Get the install command needed to trigger “Install via USB” prompts.',
    modalText:
      'This endpoint returns the command you can run manually (requires an APK path) to trigger installation authorization prompts.',
    method: 'POST',
    backendEndpoint: '/api/authorization/adb/trigger-install',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'wifi_adb',
    name: 'WiFi ADB Debugging',
    category: 'trust_security',
    riskLevel: 'medium',
    frontendPrompt: 'Enable WiFi ADB (tcpip 5555) on the device.',
    modalText:
      'This runs “adb tcpip 5555”. You will still need to connect with “adb connect <ip>:5555”.',
    method: 'POST',
    backendEndpoint: '/api/authorization/adb/trigger-wifi-adb',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'developer_options',
    name: 'Developer Options Check',
    category: 'diagnostics',
    riskLevel: 'low',
    frontendPrompt: 'Check whether Developer Options are enabled (Android).',
    modalText:
      'This reads the development_settings_enabled global setting via ADB (best-effort).',
    method: 'POST',
    backendEndpoint: '/api/authorization/adb/verify-developer-options',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'usb_debugging_status',
    name: 'USB Debugging Status',
    category: 'diagnostics',
    riskLevel: 'low',
    frontendPrompt: 'Check current ADB device status from host (authorized/unauthorized).',
    modalText:
      'This runs “adb devices -l” and reports whether the target device is unauthorized.',
    method: 'POST',
    backendEndpoint: '/api/authorization/adb/check-debugging-status',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'reboot_recovery',
    name: 'Reboot to Recovery',
    category: 'flash_operations',
    riskLevel: 'medium',
    frontendPrompt: 'Reboot the device into recovery mode (Android).',
    modalText: 'This sends “adb reboot recovery”.',
    method: 'POST',
    backendEndpoint: '/api/authorization/adb/reboot-recovery',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'reboot_bootloader',
    name: 'Reboot to Bootloader',
    category: 'flash_operations',
    riskLevel: 'medium',
    frontendPrompt: 'Reboot the device into bootloader/fastboot mode (Android).',
    modalText: 'This sends “adb reboot bootloader”.',
    method: 'POST',
    backendEndpoint: '/api/authorization/adb/reboot-bootloader',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'reboot_edl',
    name: 'Reboot to EDL (Best-Effort)',
    category: 'flash_operations',
    riskLevel: 'high',
    frontendPrompt: 'Attempt to reboot the device into EDL mode (device support varies).',
    modalText: 'This sends “adb reboot edl” (may fail on most devices).',
    method: 'POST',
    backendEndpoint: '/api/authorization/adb/reboot-edl',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },

  // iOS (libimobiledevice)
  {
    id: 'ios_trust',
    name: 'Trust This Computer (iOS)',
    category: 'trust_security',
    riskLevel: 'medium',
    frontendPrompt: 'Trigger/check “Trust This Computer?” on an iOS device.',
    modalText:
      'This checks device trust state via libimobiledevice. If not trusted, the user must tap Trust and enter passcode on-device.',
    method: 'POST',
    backendEndpoint: '/api/authorization/ios/trigger-trust-computer',
    deviceIdRequired: true,
    deviceIdField: 'udid',
    requiresTypedConfirmation: false,
  },
  {
    id: 'ios_pairing',
    name: 'Device Pairing (iOS)',
    category: 'trust_security',
    riskLevel: 'medium',
    frontendPrompt: 'Initiate iOS pairing (requires passcode).',
    modalText: 'This runs a pairing attempt via libimobiledevice (idevicepair).',
    method: 'POST',
    backendEndpoint: '/api/authorization/ios/trigger-pairing',
    deviceIdRequired: true,
    deviceIdField: 'udid',
    requiresTypedConfirmation: false,
  },
  {
    id: 'ios_backup',
    name: 'Backup Encryption (iOS)',
    category: 'trust_security',
    riskLevel: 'medium',
    frontendPrompt: 'Query/trigger backup encryption authorization (iOS).',
    modalText: 'This queries backup info via libimobiledevice (idevicebackup2).',
    method: 'POST',
    backendEndpoint: '/api/authorization/ios/trigger-backup-encryption',
    deviceIdRequired: true,
    deviceIdField: 'udid',
    requiresTypedConfirmation: false,
  },
  {
    id: 'ios_dfu',
    name: 'Enter Recovery Mode (iOS)',
    category: 'flash_operations',
    riskLevel: 'high',
    frontendPrompt: 'Attempt to enter recovery mode on an iOS device.',
    modalText:
      'This attempts to enter recovery mode using libimobiledevice. User may need to manually exit recovery or restore the device.',
    method: 'POST',
    backendEndpoint: '/api/authorization/ios/trigger-dfu',
    deviceIdRequired: true,
    deviceIdField: 'udid',
    requiresTypedConfirmation: false,
  },
  {
    id: 'ios_app_install',
    name: 'App Installation Trust (iOS) (Manual)',
    category: 'trust_security',
    riskLevel: 'medium',
    frontendPrompt: 'Get the manual install command that may require trust prompts (IPA needed).',
    modalText:
      'This returns a manual command string; iOS app installation requires an IPA and correct signing/trust configuration.',
    method: 'POST',
    backendEndpoint: '/api/authorization/ios/trigger-app-install',
    deviceIdRequired: true,
    deviceIdField: 'udid',
    requiresTypedConfirmation: false,
  },
  {
    id: 'ios_developer',
    name: 'Developer Trust (iOS) (Manual Steps)',
    category: 'trust_security',
    riskLevel: 'medium',
    frontendPrompt: 'Show manual steps to trust an iOS developer profile.',
    modalText:
      'Developer trust must be configured manually on-device: Settings → General → Device Management/Profiles → Trust.',
    method: 'POST',
    backendEndpoint: '/api/authorization/ios/trigger-developer-trust',
    deviceIdRequired: true,
    deviceIdField: 'udid',
    requiresTypedConfirmation: false,
  },

  // Fastboot / OEM
  {
    id: 'fastboot_unlock',
    name: 'Verify Bootloader Unlock (Fastboot)',
    category: 'flash_operations',
    riskLevel: 'medium',
    frontendPrompt: 'Check whether the bootloader is unlocked (fastboot getvar).',
    modalText: 'This runs “fastboot getvar unlocked” and parses the output.',
    method: 'POST',
    backendEndpoint: '/api/authorization/fastboot/verify-unlock',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'fastboot_oem_unlock',
    name: 'OEM Unlock (Manual Command Only)',
    category: 'flash_operations',
    riskLevel: 'destructive',
    frontendPrompt: 'Get the manual OEM unlock command (destructive).',
    modalText:
      'This endpoint does not execute unlock; it returns the exact manual fastboot command. Unlocking wipes data and may be irreversible.',
    method: 'POST',
    backendEndpoint: '/api/authorization/fastboot/trigger-oem-unlock',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: true,
    confirmationText: 'UNLOCK',
  },

  // Vendor / chipset tools
  {
    id: 'samsung_download',
    name: 'Samsung Download Mode Detection',
    category: 'flash_operations',
    riskLevel: 'medium',
    frontendPrompt: 'Detect Samsung device in Download Mode (Heimdall).',
    modalText:
      'This uses Heimdall to detect a Samsung device in Download Mode. The user must manually enter Download Mode on the device.',
    method: 'POST',
    backendEndpoint: '/api/authorization/samsung/trigger-download-mode',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'qualcomm_edl',
    name: 'Qualcomm EDL Toolkit Verification',
    category: 'diagnostics',
    riskLevel: 'high',
    frontendPrompt: 'Verify Qualcomm EDL toolkit presence (does not bypass authorization).',
    modalText:
      'This checks whether the EDL toolkit exists locally. It does not flash or modify devices automatically.',
    method: 'POST',
    backendEndpoint: '/api/authorization/qualcomm/verify-edl',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
  {
    id: 'mediatek_flash',
    name: 'MediaTek Toolkit Verification',
    category: 'diagnostics',
    riskLevel: 'high',
    frontendPrompt: 'Verify MTKClient toolkit presence (does not flash automatically).',
    modalText:
      'This checks whether MTKClient exists locally. It does not flash or modify devices automatically.',
    method: 'POST',
    backendEndpoint: '/api/authorization/mediatek/verify-flash',
    deviceIdRequired: true,
    deviceIdField: 'serial',
    requiresTypedConfirmation: false,
  },
];

export function getTriggers(): AuthorizationTrigger[] {
  return AUTHORIZATION_TRIGGERS;
}

export function getTriggerById(id: string): AuthorizationTrigger | undefined {
  return AUTHORIZATION_TRIGGERS.find((t) => t.id === id);
}

export function getTriggersByCategory(category: TriggerCategory): AuthorizationTrigger[] {
  return AUTHORIZATION_TRIGGERS.filter((t) => t.category === category);
}

export async function executeTrigger(
  trigger: AuthorizationTrigger,
  deviceId?: string,
  additionalData?: Record<string, any>
): Promise<ExecuteTriggerResult> {
  try {
    if (trigger.deviceIdRequired && !deviceId) {
      return { success: false, error: 'Device identifier is required for this trigger.' };
    }

    const body: Record<string, any> = {
      ...(additionalData || {}),
    };

    if (trigger.deviceIdRequired) {
      body[trigger.deviceIdField] = deviceId;
    }

    const { response, json } = await requestJson(
      trigger.backendEndpoint,
      {
        method: trigger.method,
        headers: { 'Content-Type': 'application/json' },
        body: trigger.method === 'POST' ? JSON.stringify(body) : undefined,
      },
      30000
    );

    if (!response.ok) {
      const message =
        json && typeof json === 'object' && typeof json.error === 'string'
          ? json.error
          : `Request failed (${response.status})`;
      return { success: false, error: message, data: json };
    }

    // Most endpoints return a structured result with success/message.
    return { success: true, data: json };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
