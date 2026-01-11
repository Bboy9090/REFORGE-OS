/**
 * DeviceIcon - Platform-specific device icons
 * 
 * Returns appropriate icons for different device platforms:
 * - Desktop/PC (Windows, Linux)
 * - Mac (macOS)
 * - Mobile (iOS, Android, etc.)
 * - Other devices
 */

import React from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Computer,
  Cpu,
  Server,
  Wifi,
  Activity,
  type LucideIcon,
} from 'lucide-react';

export type DevicePlatform =
  | 'android'
  | 'ios'
  | 'apple'
  | 'windows'
  | 'windows-pc'
  | 'windowspc' // Rust enum: WindowsPc
  | 'mac'
  | 'macos'
  | 'linux'
  | 'linux-pc'
  | 'linuxpc' // Rust enum: LinuxPc
  | 'desktop'
  | 'pc'
  | 'tablet'
  | 'server'
  | 'iot'
  | 'samsung'
  | 'qualcomm'
  | 'mediatek'
  | 'unknown';

interface DeviceIconProps {
  platform?: DevicePlatform | string;
  className?: string;
  size?: number | string;
  fallback?: LucideIcon;
}

/**
 * Get the appropriate icon component for a device platform
 */
function getDeviceIcon(platform?: DevicePlatform | string): LucideIcon {
  if (!platform) return Smartphone;

  const normalized = platform.toLowerCase().trim();

  // Desktop/PC platforms
  if (
    normalized === 'windows' ||
    normalized === 'windows-pc' ||
    normalized === 'windowspc' ||
    normalized === 'pc'
  ) {
    return Computer;
  }

  // Mac platforms
  if (normalized === 'mac' || normalized === 'macos') {
    return Monitor; // Using Monitor for Mac aesthetic
  }

  // Linux desktop
  if (normalized === 'linux' || normalized === 'linux-pc' || normalized === 'linuxpc') {
    return Computer;
  }

  // Generic desktop
  if (normalized === 'desktop') {
    return Computer;
  }

  // Laptop (could be Mac or PC)
  if (normalized === 'laptop') {
    return Laptop;
  }

  // Mobile platforms
  if (normalized === 'android' || normalized === 'ios' || normalized === 'apple') {
    return Smartphone;
  }

  // Tablet
  if (normalized === 'tablet' || normalized === 'ipad') {
    return Tablet;
  }

  // Server/IoT
  if (normalized === 'server') {
    return Server;
  }

  if (normalized === 'iot') {
    return Wifi;
  }

  // Unknown/fallback
  if (normalized === 'unknown' || normalized === '') {
    return Activity;
  }

  // Default to smartphone for unrecognized platforms
  return Smartphone;
}

/**
 * DeviceIcon Component
 * 
 * Renders an appropriate icon based on device platform
 */
export function DeviceIcon({
  platform,
  className = '',
  size = 24,
  fallback,
}: DeviceIconProps) {
  const IconComponent = React.useMemo(() => {
    return fallback || getDeviceIcon(platform);
  }, [fallback, platform]);

  return <IconComponent className={className} size={size} />;
}

/**
 * Hook-style function to get icon component (for advanced usage)
 */
export function useDeviceIcon(platform?: DevicePlatform | string): LucideIcon {
  return getDeviceIcon(platform);
}

