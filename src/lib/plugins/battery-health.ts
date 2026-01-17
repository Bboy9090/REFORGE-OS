// Battery Health Plugin - Diagnostic plugin for analyzing device battery health
// Part of Bobby's World diagnostic toolkit

import type { PluginManifest, PluginContext, PluginResult } from '@/types/plugin-sdk';

export interface BatteryHealthData {
  level: number;
  status: 'charging' | 'discharging' | 'full' | 'not_charging' | 'unknown';
  health: 'good' | 'overheat' | 'dead' | 'over_voltage' | 'cold' | 'unknown';
  technology: string;
  temperature: number; // in Celsius
  voltage: number; // in mV
  capacity: number; // design capacity in mAh
  currentCapacity?: number; // current capacity in mAh
  cycleCount?: number;
  chargeRate?: number; // in mA
  isCharging: boolean;
  isPowerConnected: boolean;
  healthScore: number; // 0-100
  estimatedLifeRemaining?: string;
  warnings: string[];
  recommendations: string[];
}

export const batteryHealthManifest: PluginManifest = {
  id: 'bobby.diagnostics.battery-health',
  name: 'Battery Health Analyzer',
  version: '1.0.0',
  author: 'Bobby\'s Workshop',
  description: 'Comprehensive battery health analysis for Android and iOS devices',
  category: 'diagnostics',
  capabilities: ['diagnostics'],
  riskLevel: 'safe',
  requiredPermissions: ['diagnostics:read', 'device:read'],
  supportedPlatforms: ['android', 'ios'],
  minimumSDKVersion: '1.0.0',
  entryPoint: 'battery-health.ts',
  license: 'MIT'
};

async function parseAndroidBatteryInfo(output: string): Promise<Partial<BatteryHealthData>> {
  const data: Partial<BatteryHealthData> = {
    warnings: [],
    recommendations: []
  };

  const levelMatch = output.match(/level:\s*(\d+)/);
  if (levelMatch) data.level = parseInt(levelMatch[1]);

  const statusMatch = output.match(/status:\s*(\d+)/);
  if (statusMatch) {
    const statusMap: Record<string, BatteryHealthData['status']> = {
      '1': 'unknown',
      '2': 'charging',
      '3': 'discharging',
      '4': 'not_charging',
      '5': 'full'
    };
    data.status = statusMap[statusMatch[1]] || 'unknown';
  }

  const healthMatch = output.match(/health:\s*(\d+)/);
  if (healthMatch) {
    const healthMap: Record<string, BatteryHealthData['health']> = {
      '1': 'unknown',
      '2': 'good',
      '3': 'overheat',
      '4': 'dead',
      '5': 'over_voltage',
      '6': 'unknown',
      '7': 'cold'
    };
    data.health = healthMap[healthMatch[1]] || 'unknown';
  }

  const techMatch = output.match(/technology:\s*(\w+)/);
  if (techMatch) data.technology = techMatch[1];

  const tempMatch = output.match(/temperature:\s*(\d+)/);
  if (tempMatch) data.temperature = parseInt(tempMatch[1]) / 10; // Convert from tenths

  const voltageMatch = output.match(/voltage:\s*(\d+)/);
  if (voltageMatch) data.voltage = parseInt(voltageMatch[1]);

  // Calculate health score
  data.healthScore = calculateHealthScore(data);

  // Generate warnings and recommendations
  if (data.temperature && data.temperature > 40) {
    data.warnings!.push('Battery temperature is elevated');
    data.recommendations!.push('Allow device to cool down before heavy use');
  }

  if (data.health === 'overheat') {
    data.warnings!.push('Battery is overheating');
    data.recommendations!.push('Immediately stop charging and allow device to cool');
  }

  if (data.health === 'dead') {
    data.warnings!.push('Battery health is poor - replacement recommended');
    data.recommendations!.push('Visit authorized service center for battery replacement');
  }

  data.isCharging = data.status === 'charging';
  data.isPowerConnected = data.status === 'charging' || data.status === 'full';

  return data;
}

function calculateHealthScore(data: Partial<BatteryHealthData>): number {
  let score = 100;

  // Deduct points based on health status
  if (data.health === 'dead') score -= 50;
  else if (data.health === 'overheat') score -= 30;
  else if (data.health === 'over_voltage') score -= 25;
  else if (data.health === 'cold') score -= 15;
  else if (data.health === 'unknown') score -= 10;

  // Deduct points for high temperature
  if (data.temperature) {
    if (data.temperature > 45) score -= 20;
    else if (data.temperature > 40) score -= 10;
    else if (data.temperature > 35) score -= 5;
  }

  // Deduct for voltage anomalies
  if (data.voltage) {
    if (data.voltage < 3000) score -= 15;
    else if (data.voltage < 3500) score -= 5;
    if (data.voltage > 4400) score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

export async function execute(context: PluginContext): Promise<PluginResult<BatteryHealthData>> {
  const startTime = Date.now();

  try {
    context.logger?.info('Starting battery health analysis');

    if (!context.deviceId) {
      return {
        success: false,
        error: 'No device connected',
        metadata: { executionTime: Date.now() - startTime }
      };
    }

    let batteryData: BatteryHealthData;

    if (context.platform === 'android' && context.adb) {
      // Get battery info via ADB
      const output = await context.adb.shell(context.deviceId, 'dumpsys battery');
      const parsedData = await parseAndroidBatteryInfo(output);
      
      batteryData = {
        level: parsedData.level || 0,
        status: parsedData.status || 'unknown',
        health: parsedData.health || 'unknown',
        technology: parsedData.technology || 'Unknown',
        temperature: parsedData.temperature || 0,
        voltage: parsedData.voltage || 0,
        capacity: parsedData.capacity || 0,
        isCharging: parsedData.isCharging || false,
        isPowerConnected: parsedData.isPowerConnected || false,
        healthScore: parsedData.healthScore || 0,
        warnings: parsedData.warnings || [],
        recommendations: parsedData.recommendations || []
      };
    } else if (context.platform === 'ios') {
      // iOS battery path not implemented yet
      throw new Error('Battery health analysis for iOS is not available. Install/enable iOS tools to proceed.');
    } else {
      // No mock fallback in production
      throw new Error('Battery health analysis requires Android ADB connection.');
    }

    context.logger?.info(`Battery health analysis complete: Score ${batteryData.healthScore}`);

    return {
      success: true,
      data: batteryData,
      message: `Battery health score: ${batteryData.healthScore}/100`,
      metadata: {
        executionTime: Date.now() - startTime
      }
    };
  } catch (error) {
    context.logger?.error(`Battery health analysis failed: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: { executionTime: Date.now() - startTime }
    };
  }
}
