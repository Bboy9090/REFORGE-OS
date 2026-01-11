// API Configuration - Unified configuration for all backends
// Priority: VITE_API_URL env var > Tauri detection > default (8000 for Python FastAPI backend)
const getDefaultAPIUrl = (): string => {
  // Import Tauri detection (dynamic import to avoid SSR issues)
  try {
    // Check if running in Tauri (desktop app with bundled Node.js backend on port 3001)
    if (typeof window !== 'undefined') {
      // Use the same detection method as tauriBridge.ts
      const w = window as any;
      if (w.__TAURI__ && typeof w.__TAURI__.invoke === 'function') {
        return 'http://localhost:3001'; // Tauri uses Node.js backend
      }
    }
  } catch {
    // Fall through to default
  }
  // Default to Python FastAPI backend port (8000)
  // Note: Secret Rooms (Sonic, Ghost, Pandora) use Python FastAPI on port 8000
  return 'http://localhost:8000';
};

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || getDefaultAPIUrl(),
  USE_MOCK: false,
  API_VERSION: 'v1',
  ENDPOINTS: {
    HEALTH: '/api/v1/health',
    READY: '/api/v1/ready',
    SYSTEM_TOOLS: '/api/v1/system-tools',
    SYSTEM_TOOLS_RUST: '/api/system-tools/rust',
    SYSTEM_TOOLS_ANDROID: '/api/system-tools/android',
    SYSTEM_TOOLS_ANDROID_ENSURE: '/api/system-tools/android/ensure',
    SYSTEM_TOOLS_PYTHON: '/api/system-tools/python',
    SYSTEM_INFO: '/api/system-info',
    ADB_DEVICES: '/api/v1/adb/devices',
    ADB_COMMAND: '/api/v1/adb/command',
    ADB_TRIGGER_AUTH: '/api/v1/adb/trigger-auth',
    FASTBOOT_DEVICES: '/api/v1/fastboot/devices',
    FASTBOOT_DEVICE_INFO: '/api/v1/fastboot/device-info',
    FASTBOOT_FLASH: '/api/v1/fastboot/flash',
    FASTBOOT_UNLOCK: '/api/v1/fastboot/unlock',
    FASTBOOT_REBOOT: '/api/v1/fastboot/reboot',
    FASTBOOT_ERASE: '/api/v1/fastboot/erase',
    FLASH_DEVICES: '/api/v1/flash/devices',
    FLASH_DEVICE_INFO: '/api/v1/flash/devices',
    FLASH_DEVICE_PARTITIONS: '/api/v1/flash/devices',
    FLASH_VALIDATE_IMAGE: '/api/v1/flash/validate-image',
    FLASH_START: '/api/v1/flash/start',
    FLASH_PAUSE: '/api/v1/flash/pause',
    FLASH_RESUME: '/api/v1/flash/resume',
    FLASH_CANCEL: '/api/v1/flash/cancel',
    FLASH_STATUS: '/api/v1/flash/status',
    FLASH_ACTIVE_OPERATIONS: '/api/v1/flash/operations/active',
    FLASH_HISTORY: '/api/v1/flash/history',
    BOOTFORGEUSB_SCAN: '/api/v1/bootforgeusb/scan',
    BOOTFORGEUSB_STATUS: '/api/v1/bootforgeusb/status',
    AUTHORIZATION_TRIGGERS: '/api/v1/authorization/triggers',
    MONITOR_START: '/api/v1/monitor/start',
    MONITOR_STOP: '/api/v1/monitor/stop',
    MONITOR_LIVE: '/api/v1/monitor/live',
    TESTS_RUN: '/api/v1/tests/run',
    TESTS_RESULTS: '/api/v1/tests/results',
    STANDARDS: '/api/v1/standards',
    HOTPLUG_EVENTS: '/api/v1/hotplug/events',
    // Secret Rooms (Trapdoor API) - Python FastAPI Backend
    PHOENIX_UNLOCK: '/api/v1/trapdoor/phoenix/unlock',
    PHOENIX_VALIDATE: '/api/v1/trapdoor/phoenix/validate',
    PHOENIX_REVOKE: '/api/v1/trapdoor/phoenix/revoke',
    // Sonic Codex
    SONIC_UPLOAD: '/api/v1/trapdoor/sonic/upload',
    SONIC_URL: '/api/v1/trapdoor/sonic/extract',
    SONIC_JOBS: '/api/v1/trapdoor/sonic/jobs',
    SONIC_JOB_DETAILS: '/api/v1/trapdoor/sonic/jobs/{id}',
    SONIC_CAPTURE_START: '/api/v1/trapdoor/sonic/capture/start',
    SONIC_CAPTURE_STOP: '/api/v1/trapdoor/sonic/capture/stop',
    SONIC_CAPTURE_STATUS: '/api/v1/trapdoor/sonic/capture/status',
    // Ghost Codex
    GHOST_SHRED: '/api/v1/trapdoor/ghost/shred',
    GHOST_CANARY_GENERATE: '/api/v1/trapdoor/ghost/canary/generate',
    GHOST_CANARY_ALERTS: '/api/v1/trapdoor/ghost/canary/alerts',
    GHOST_PERSONA_GENERATE: '/api/v1/trapdoor/ghost/persona/generate',
    GHOST_PERSONA_LIST: '/api/v1/trapdoor/ghost/persona/list',
    // Pandora Codex
    PANDORA_HARDWARE_STATUS: '/api/v1/trapdoor/pandora/hardware/status',
    PANDORA_HARDWARE_SCAN: '/api/v1/trapdoor/pandora/hardware/scan',
    PANDORA_DFU_ENTER: '/api/v1/trapdoor/pandora/dfu/enter',
    PANDORA_JAILBREAK_EXECUTE: '/api/v1/trapdoor/pandora/jailbreak/execute',
    // WebSocket endpoints
    WS_HARDWARE_STREAM: '/api/v1/trapdoor/pandora/hardware/stream',
    WS_SONIC_PROGRESS: '/api/v1/trapdoor/sonic/progress/{job_id}',
  },
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10), // 30 seconds default for large operations
};

export async function checkAPIHealth(): Promise<boolean> {
  if (API_CONFIG.USE_MOCK) return true;
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function getAPIUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

export function getWSUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  try {
    const base = new URL(API_CONFIG.BASE_URL);
    const wsProtocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
    const basePath = base.pathname && base.pathname !== '/' ? base.pathname.replace(/\/+$/g, '') : '';
    return `${wsProtocol}//${base.host}${basePath}${normalizedPath}`;
  } catch {
    return `ws://localhost:3001${normalizedPath}`;
  }
}
