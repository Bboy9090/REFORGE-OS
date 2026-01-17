// Thermal Monitor Plugin - Diagnostic plugin for analyzing device thermal status
// Part of Bobby's World diagnostic toolkit

import type { PluginManifest, PluginContext, PluginResult } from '@/types/plugin-sdk';

export interface ThermalHealthData {
  overallStatus: 'normal' | 'warm' | 'hot' | 'critical' | 'unknown';
  zones: ThermalZone[];
  isThrottling: boolean;
  throttlingLevel?: number; // 0-3, higher = more throttling
  cpuTemperature?: number;
  batteryTemperature?: number;
  skinTemperature?: number;
  gpuTemperature?: number;
  healthScore: number; // 0-100
  warnings: string[];
  recommendations: string[];
  timestamp: number;
}

export interface ThermalZone {
  name: string;
  type: string;
  temperature: number; // in Celsius
  tripPoints?: TripPoint[];
  isOverheating: boolean;
}

export interface TripPoint {
  type: 'active' | 'passive' | 'critical' | 'hot';
  temperature: number;
}

export const thermalMonitorManifest: PluginManifest = {
  id: 'bobby.diagnostics.thermal-monitor',
  name: 'Thermal Monitor',
  version: '1.0.0',
  author: 'Bobby\'s Workshop',
  description: 'Real-time thermal monitoring and health analysis for mobile devices',
  category: 'diagnostics',
  capabilities: ['diagnostics'],
  riskLevel: 'safe',
  requiredPermissions: ['diagnostics:read', 'device:read'],
  supportedPlatforms: ['android', 'ios'],
  minimumSDKVersion: '1.0.0',
  entryPoint: 'thermal-monitor.ts',
  license: 'MIT'
};

async function parseAndroidThermalInfo(output: string): Promise<ThermalZone[]> {
  const zones: ThermalZone[] = [];
  const lines = output.split('\n');

  let currentZone: Partial<ThermalZone> | null = null;

  for (const line of lines) {
    // Match zone name patterns
    const zoneMatch = line.match(/type:\s*(\S+)/);
    if (zoneMatch) {
      if (currentZone && currentZone.name) {
        zones.push(currentZone as ThermalZone);
      }
      currentZone = {
        name: zoneMatch[1],
        type: zoneMatch[1],
        temperature: 0,
        isOverheating: false
      };
    }

    // Match temperature
    const tempMatch = line.match(/temp:\s*(\d+)/);
    if (tempMatch && currentZone) {
      currentZone.temperature = parseInt(tempMatch[1]) / 1000; // Convert from millicelsius
    }
  }

  if (currentZone && currentZone.name) {
    zones.push(currentZone as ThermalZone);
  }

  // Mark overheating zones
  zones.forEach(zone => {
    zone.isOverheating = zone.temperature > 45;
  });

  return zones;
}

function determineOverallStatus(zones: ThermalZone[]): ThermalHealthData['overallStatus'] {
  const maxTemp = Math.max(...zones.map(z => z.temperature), 0);

  if (maxTemp >= 50) return 'critical';
  if (maxTemp >= 45) return 'hot';
  if (maxTemp >= 38) return 'warm';
  if (maxTemp >= 20) return 'normal';
  return 'unknown';
}

function calculateThermalHealthScore(zones: ThermalZone[]): number {
  if (zones.length === 0) return 100;

  const maxTemp = Math.max(...zones.map(z => z.temperature));
  const avgTemp = zones.reduce((sum, z) => sum + z.temperature, 0) / zones.length;
  const overheatingCount = zones.filter(z => z.isOverheating).length;

  let score = 100;

  // Deduct based on max temperature
  if (maxTemp >= 50) score -= 40;
  else if (maxTemp >= 45) score -= 25;
  else if (maxTemp >= 40) score -= 15;
  else if (maxTemp >= 38) score -= 5;

  // Deduct based on average temperature
  if (avgTemp >= 45) score -= 20;
  else if (avgTemp >= 40) score -= 10;
  else if (avgTemp >= 35) score -= 5;

  // Deduct based on number of overheating zones
  score -= overheatingCount * 5;

  return Math.max(0, Math.min(100, score));
}

function generateWarningsAndRecommendations(
  zones: ThermalZone[],
  overallStatus: ThermalHealthData['overallStatus']
): { warnings: string[]; recommendations: string[] } {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (overallStatus === 'critical') {
    warnings.push('Device temperature is critically high!');
    recommendations.push('Stop using the device immediately and allow it to cool');
    recommendations.push('Remove protective case if present');
    recommendations.push('Do not charge until device cools down');
  } else if (overallStatus === 'hot') {
    warnings.push('Device temperature is elevated');
    recommendations.push('Reduce intensive tasks (gaming, camera, etc.)');
    recommendations.push('Move to a cooler environment');
  } else if (overallStatus === 'warm') {
    warnings.push('Device is slightly warm');
    recommendations.push('Monitor temperature during heavy use');
  }

  // Check for specific zone issues
  const cpuZone = zones.find(z => z.type.toLowerCase().includes('cpu'));
  if (cpuZone && cpuZone.temperature > 80) {
    warnings.push('CPU temperature is very high');
    recommendations.push('Close background applications');
  }

  const batteryZone = zones.find(z => z.type.toLowerCase().includes('battery'));
  if (batteryZone && batteryZone.temperature > 40) {
    warnings.push('Battery temperature is elevated');
    recommendations.push('Avoid charging until battery cools');
  }

  return { warnings, recommendations };
}

export async function execute(context: PluginContext): Promise<PluginResult<ThermalHealthData>> {
  const startTime = Date.now();

  try {
    context.logger?.info('Starting thermal health analysis');

    if (!context.deviceId) {
      return {
        success: false,
        error: 'No device connected',
        metadata: { executionTime: Date.now() - startTime }
      };
    }

    let thermalData: ThermalHealthData;

    if (context.platform === 'android' && context.adb) {
      // Get thermal info via ADB
      let zones: ThermalZone[] = [];
      
      try {
        const thermalOutput = await context.adb.shell(
          context.deviceId, 
          'dumpsys thermalservice'
        );
        zones = await parseAndroidThermalInfo(thermalOutput);
      } catch {
        // Fallback to reading thermal zones directly
        try {
          const zoneOutput = await context.adb.shell(
            context.deviceId,
            'cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null || echo "0"'
          );
          const temps = zoneOutput.split('\n').filter(t => t.trim());
          zones = temps.map((temp, i) => ({
            name: `zone${i}`,
            type: `thermal_zone${i}`,
            temperature: parseInt(temp) / 1000,
            isOverheating: parseInt(temp) / 1000 > 45
          }));
        } catch {
          zones = [];
        }
      }

      const overallStatus = determineOverallStatus(zones);
      const { warnings, recommendations } = generateWarningsAndRecommendations(zones, overallStatus);

      // Try to get specific sensor readings
      let batteryTemp: number | undefined;
      try {
        const batteryOutput = await context.adb.shell(context.deviceId, 'dumpsys battery');
        const tempMatch = batteryOutput.match(/temperature:\s*(\d+)/);
        if (tempMatch) batteryTemp = parseInt(tempMatch[1]) / 10;
      } catch {
        // Ignore battery temp errors
      }

      thermalData = {
        overallStatus,
        zones,
        isThrottling: overallStatus === 'hot' || overallStatus === 'critical',
        throttlingLevel: overallStatus === 'critical' ? 3 : overallStatus === 'hot' ? 2 : overallStatus === 'warm' ? 1 : 0,
        batteryTemperature: batteryTemp,
        cpuTemperature: zones.find(z => z.type.toLowerCase().includes('cpu'))?.temperature,
        healthScore: calculateThermalHealthScore(zones),
        warnings,
        recommendations,
        timestamp: Date.now()
      };
    } else if (context.platform === 'ios') {
      throw new Error('Thermal monitoring for iOS is not available. Install/enable required tools.');
    } else {
      throw new Error('Thermal monitoring requires Android ADB or platform-specific tooling.');
    }

    context.logger?.info(`Thermal health analysis complete: Status ${thermalData.overallStatus}`);

    return {
      success: true,
      data: thermalData,
      message: `Thermal status: ${thermalData.overallStatus} (Score: ${thermalData.healthScore}/100)`,
      metadata: {
        executionTime: Date.now() - startTime
      }
    };
  } catch (error) {
    context.logger?.error(`Thermal health analysis failed: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: { executionTime: Date.now() - startTime }
    };
  }
}
