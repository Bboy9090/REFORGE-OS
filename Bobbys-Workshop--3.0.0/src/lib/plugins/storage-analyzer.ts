// Storage Analyzer Plugin - Diagnostic plugin for analyzing device storage health
// Part of Bobby's World diagnostic toolkit

import type { PluginManifest, PluginContext, PluginResult } from '@/types/plugin-sdk';

export interface StorageHealthData {
  totalSpace: number; // in bytes
  usedSpace: number; // in bytes
  freeSpace: number; // in bytes
  usagePercentage: number;
  partitions: StoragePartition[];
  storageType: 'emmc' | 'ufs' | 'nvme' | 'ssd' | 'hdd' | 'unknown';
  healthScore: number; // 0-100
  wearLevel?: number; // 0-100 for flash storage
  smartData?: SmartData;
  warnings: string[];
  recommendations: string[];
}

export interface StoragePartition {
  name: string;
  mountPoint: string;
  totalSize: number;
  usedSize: number;
  freeSize: number;
  usagePercentage: number;
  fileSystem: string;
}

export interface SmartData {
  available: boolean;
  lifeTimeEstimationA?: number;
  lifeTimeEstimationB?: number;
  extendedHealthInfo?: string;
  deviceLifeUsed?: number;
}

export const storageAnalyzerManifest: PluginManifest = {
  id: 'bobby.diagnostics.storage-analyzer',
  name: 'Storage Health Analyzer',
  version: '1.0.0',
  author: 'Bobby\'s Workshop',
  description: 'Comprehensive storage health analysis with wear level detection',
  category: 'diagnostics',
  capabilities: ['diagnostics'],
  riskLevel: 'safe',
  requiredPermissions: ['diagnostics:read', 'device:read'],
  supportedPlatforms: ['android', 'ios'],
  minimumSDKVersion: '1.0.0',
  entryPoint: 'storage-analyzer.ts',
  license: 'MIT'
};

async function parseAndroidStorageInfo(dfOutput: string): Promise<StoragePartition[]> {
  const partitions: StoragePartition[] = [];
  const lines = dfOutput.split('\n').slice(1); // Skip header

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 6) {
      const [filesystem, size, used, available, percentage, mountPoint] = parts;
      
      // Filter out pseudo filesystems
      if (mountPoint && !mountPoint.startsWith('/proc') && !mountPoint.startsWith('/sys')) {
        const totalSize = parseSize(size);
        const usedSize = parseSize(used);
        const freeSize = parseSize(available);
        
        if (totalSize > 0) {
          partitions.push({
            name: filesystem,
            mountPoint,
            totalSize,
            usedSize,
            freeSize,
            usagePercentage: (usedSize / totalSize) * 100,
            fileSystem: detectFileSystem(filesystem, mountPoint)
          });
        }
      }
    }
  }

  return partitions;
}

function parseSize(sizeStr: string): number {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)(K|M|G|T)?$/i);
  if (!match) return parseInt(sizeStr) || 0;

  const value = parseFloat(match[1]);
  const unit = (match[2] || '').toUpperCase();

  const multipliers: Record<string, number> = {
    'K': 1024,
    'M': 1024 * 1024,
    'G': 1024 * 1024 * 1024,
    'T': 1024 * 1024 * 1024 * 1024
  };

  return value * (multipliers[unit] || 1);
}

function detectFileSystem(filesystem: string, mountPoint: string): string {
  if (filesystem.includes('ext4')) return 'ext4';
  if (filesystem.includes('f2fs')) return 'f2fs';
  if (filesystem.includes('vfat')) return 'vfat';
  if (filesystem.includes('tmpfs')) return 'tmpfs';
  if (mountPoint === '/data') return 'ext4/f2fs';
  return 'unknown';
}

function detectStorageType(partitions: StoragePartition[]): StorageHealthData['storageType'] {
  // In a real implementation, this would check /sys/block/*/device/type
  // For now, we'll make an educated guess
  const totalSize = partitions.reduce((sum, p) => sum + p.totalSize, 0);
  
  // Modern phones typically have UFS storage, older ones eMMC
  if (totalSize > 128 * 1024 * 1024 * 1024) {
    return 'ufs'; // Larger storage typically uses UFS
  }
  return 'emmc';
}

function calculateStorageHealthScore(
  data: Partial<StorageHealthData>,
  partitions: StoragePartition[]
): number {
  let score = 100;

  // Check overall usage
  const dataPartition = partitions.find(p => 
    p.mountPoint === '/data' || p.mountPoint === '/storage/emulated'
  );
  
  if (dataPartition) {
    if (dataPartition.usagePercentage > 95) score -= 30;
    else if (dataPartition.usagePercentage > 90) score -= 20;
    else if (dataPartition.usagePercentage > 85) score -= 10;
  }

  // Check wear level if available
  if (data.wearLevel !== undefined) {
    if (data.wearLevel > 80) score -= 30;
    else if (data.wearLevel > 60) score -= 20;
    else if (data.wearLevel > 40) score -= 10;
  }

  // Check SMART data if available
  if (data.smartData?.deviceLifeUsed !== undefined) {
    const lifeUsed = data.smartData.deviceLifeUsed;
    if (lifeUsed > 80) score -= 25;
    else if (lifeUsed > 60) score -= 15;
    else if (lifeUsed > 40) score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

export async function execute(context: PluginContext): Promise<PluginResult<StorageHealthData>> {
  const startTime = Date.now();

  try {
    context.logger?.info('Starting storage health analysis');

    if (!context.deviceId) {
      return {
        success: false,
        error: 'No device connected',
        metadata: { executionTime: Date.now() - startTime }
      };
    }

    let storageData: StorageHealthData;

    if (context.platform === 'android' && context.adb) {
      // Get storage info via ADB
      const dfOutput = await context.adb.shell(context.deviceId, 'df -h');
      const partitions = await parseAndroidStorageInfo(dfOutput);

      const totalSpace = partitions.reduce((sum, p) => sum + p.totalSize, 0);
      const usedSpace = partitions.reduce((sum, p) => sum + p.usedSize, 0);
      const freeSpace = partitions.reduce((sum, p) => sum + p.freeSize, 0);

      const warnings: string[] = [];
      const recommendations: string[] = [];

      // Check for low storage
      const usagePercentage = totalSpace > 0 ? (usedSpace / totalSpace) * 100 : 0;
      if (usagePercentage > 90) {
        warnings.push('Storage is critically low');
        recommendations.push('Delete unused apps and media to free up space');
      } else if (usagePercentage > 80) {
        warnings.push('Storage is running low');
        recommendations.push('Consider cleaning up old files');
      }

      storageData = {
        totalSpace,
        usedSpace,
        freeSpace,
        usagePercentage,
        partitions,
        storageType: detectStorageType(partitions),
        healthScore: 0,
        warnings,
        recommendations
      };

      storageData.healthScore = calculateStorageHealthScore(storageData, partitions);
    } else if (context.platform === 'ios') {
      throw new Error('Storage analysis for iOS is not available. Install/enable required tools.');
    } else {
      throw new Error('Storage analysis requires Android ADB or platform-specific tooling.');
    }

    context.logger?.info(`Storage health analysis complete: Score ${storageData.healthScore}`);

    return {
      success: true,
      data: storageData,
      message: `Storage health score: ${storageData.healthScore}/100`,
      metadata: {
        executionTime: Date.now() - startTime
      }
    };
  } catch (error) {
    context.logger?.error(`Storage health analysis failed: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: { executionTime: Date.now() - startTime }
    };
  }
}
