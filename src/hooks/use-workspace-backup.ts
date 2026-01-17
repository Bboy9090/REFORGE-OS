import { useEffect, useCallback, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { snapshotManager } from '@/lib/snapshot-manager';
import { toast } from 'sonner';

export type BackupInterval = 'hourly' | 'every-4-hours' | 'every-12-hours' | 'daily' | 'weekly' | 'manual';

interface WorkspaceBackupConfig {
  enabled: boolean;
  interval: BackupInterval;
  lastBackup: number;
  nextBackup: number;
  includePluginStates: boolean;
  includeSettings: boolean;
  includeSnapshots: boolean;
  maxBackupsRetained: number;
}

interface WorkspaceData {
  timestamp: number;
  version: string;
  pluginStates?: Record<string, any>;
  settings?: Record<string, any>;
  snapshots?: any[];
  deviceRegistry?: any[];
  correlationData?: any[];
}

const DEFAULT_CONFIG: WorkspaceBackupConfig = {
  enabled: false,
  interval: 'daily',
  lastBackup: 0,
  nextBackup: 0,
  includePluginStates: true,
  includeSettings: true,
  includeSnapshots: false,
  maxBackupsRetained: 10,
};

const INTERVAL_MS: Record<BackupInterval, number> = {
  'hourly': 60 * 60 * 1000,
  'every-4-hours': 4 * 60 * 60 * 1000,
  'every-12-hours': 12 * 60 * 60 * 1000,
  'daily': 24 * 60 * 60 * 1000,
  'weekly': 7 * 24 * 60 * 60 * 1000,
  'manual': -1,
};

export function useWorkspaceBackup() {
  const [config, setConfig] = useKV<WorkspaceBackupConfig>('workspace-backup-config', DEFAULT_CONFIG);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupHistory, setBackupHistory] = useKV<Array<{ id: string; timestamp: number; sizeBytes: number }>>('workspace-backup-history', []);

  const collectWorkspaceData = useCallback(async (): Promise<WorkspaceData> => {
    const currentConfig = config || DEFAULT_CONFIG;
    const data: WorkspaceData = {
      timestamp: Date.now(),
      version: '1.0.0',
    };

    if (currentConfig.includePluginStates) {
      const pluginKeys = await window.spark.kv.keys();
      const pluginStates: Record<string, any> = {};
      
      for (const key of pluginKeys) {
        if (key.startsWith('plugin-') || key.startsWith('bobby-plugin-')) {
          pluginStates[key] = await window.spark.kv.get(key);
        }
      }
      
      data.pluginStates = pluginStates;
    }

    if (currentConfig.includeSettings) {
      const allKeys = await window.spark.kv.keys();
      const settings: Record<string, any> = {};
      
      for (const key of allKeys) {
        if (key.includes('settings') || key.includes('config') || key.includes('preferences')) {
          settings[key] = await window.spark.kv.get(key);
        }
      }
      
      data.settings = settings;
    }

    if (currentConfig.includeSnapshots) {
      const snapshots = await snapshotManager.listSnapshots();
      data.snapshots = snapshots.map(s => ({
        id: s.id,
        type: s.type,
        timestamp: s.timestamp,
        deviceId: s.deviceId,
        tags: s.tags,
        metadata: s.metadata,
      }));
    }

    const deviceData = await window.spark.kv.get<any[]>('connected-devices');
    if (deviceData) {
      data.deviceRegistry = deviceData;
    }

    const correlationData = await window.spark.kv.get<any[]>('device-correlation-data');
    if (correlationData) {
      data.correlationData = correlationData;
    }

    return data;
  }, [config]);

  const createBackup = useCallback(async (manual: boolean = false): Promise<{ success: boolean; snapshotId?: string; error?: string }> => {
    const currentConfig = config || DEFAULT_CONFIG;
    
    if (isBackingUp) {
      return { success: false, error: 'Backup already in progress' };
    }

    setIsBackingUp(true);

    try {
      const workspaceData = await collectWorkspaceData();
      
      const snapshot = await snapshotManager.createSnapshot(
        'workspace-backup',
        workspaceData,
        {
          tags: ['workspace', manual ? 'manual' : 'auto', `interval-${currentConfig.interval}`],
          metadata: {
            manual,
            interval: currentConfig.interval,
            itemsCaptured: {
              pluginStates: !!workspaceData.pluginStates,
              settings: !!workspaceData.settings,
              snapshots: !!workspaceData.snapshots,
              deviceRegistry: !!workspaceData.deviceRegistry,
              correlationData: !!workspaceData.correlationData,
            },
          },
          priority: manual ? 'high' : 'normal',
        }
      );

      const newHistory = [...(backupHistory || []), {
        id: snapshot.id,
        timestamp: snapshot.timestamp,
        sizeBytes: snapshot.sizeBytes,
      }];

      if (newHistory.length > currentConfig.maxBackupsRetained) {
        const toDelete = newHistory.slice(0, newHistory.length - currentConfig.maxBackupsRetained);
        for (const old of toDelete) {
          await snapshotManager.deleteSnapshot(old.id, false);
        }
        setBackupHistory(newHistory.slice(-currentConfig.maxBackupsRetained));
      } else {
        setBackupHistory(newHistory);
      }

      const now = Date.now();
      const intervalMs = INTERVAL_MS[currentConfig.interval];
      
      setConfig((current) => {
        const base = current || DEFAULT_CONFIG;
        return {
          ...base,
          lastBackup: now,
          nextBackup: intervalMs > 0 ? now + intervalMs : 0,
        };
      });

      if (manual) {
        toast.success('Workspace backup created successfully');
      }

      return { success: true, snapshotId: snapshot.id };
    } catch (error) {
      console.error('Workspace backup failed:', error);
      toast.error('Workspace backup failed');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsBackingUp(false);
    }
  }, [isBackingUp, collectWorkspaceData, config, backupHistory, setBackupHistory, setConfig]);

  const restoreBackup = useCallback(async (snapshotId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const snapshot = await snapshotManager.getSnapshot(snapshotId);
      if (!snapshot || snapshot.type !== 'workspace-backup') {
        return { success: false, error: 'Invalid backup snapshot' };
      }

      const data = snapshot.data as WorkspaceData;

      if (data.pluginStates) {
        for (const [key, value] of Object.entries(data.pluginStates)) {
          await window.spark.kv.set(key, value);
        }
      }

      if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
          await window.spark.kv.set(key, value);
        }
      }

      if (data.deviceRegistry) {
        await window.spark.kv.set('connected-devices', data.deviceRegistry);
      }

      if (data.correlationData) {
        await window.spark.kv.set('device-correlation-data', data.correlationData);
      }

      toast.success('Workspace restored from backup');
      return { success: true };
    } catch (error) {
      console.error('Workspace restore failed:', error);
      toast.error('Workspace restore failed');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  const updateConfig = useCallback((updates: Partial<WorkspaceBackupConfig>) => {
    setConfig((current) => {
      const base = current || DEFAULT_CONFIG;
      const newConfig = { ...base, ...updates };
      
      if (updates.interval && updates.interval !== base.interval) {
        const intervalMs = INTERVAL_MS[updates.interval];
        if (intervalMs > 0 && newConfig.lastBackup && newConfig.lastBackup > 0) {
          newConfig.nextBackup = newConfig.lastBackup + intervalMs;
        } else {
          newConfig.nextBackup = 0;
        }
      }
      
      return newConfig;
    });
  }, [setConfig]);

  useEffect(() => {
    const currentConfig = config || DEFAULT_CONFIG;
    
    if (!currentConfig.enabled || currentConfig.interval === 'manual') return;

    const intervalMs = INTERVAL_MS[currentConfig.interval];
    if (intervalMs <= 0) return;

    const checkAndBackup = async () => {
      const now = Date.now();
      const cfg = config || DEFAULT_CONFIG;
      
      if (cfg.lastBackup === 0) {
        setConfig((current) => {
          const base = current || DEFAULT_CONFIG;
          return {
            ...base,
            nextBackup: now + intervalMs,
          };
        });
        return;
      }

      if (cfg.nextBackup > 0 && now >= cfg.nextBackup) {
        await createBackup(false);
      }
    };

    const timerId = setInterval(checkAndBackup, 60000);
    checkAndBackup();

    return () => clearInterval(timerId);
  }, [config, createBackup, setConfig]);

  const timeUntilNextBackup = useCallback(() => {
    const currentConfig = config || DEFAULT_CONFIG;
    
    if (!currentConfig.enabled || currentConfig.interval === 'manual' || currentConfig.nextBackup === 0) {
      return null;
    }

    const remaining = Math.max(0, currentConfig.nextBackup - Date.now());
    return remaining;
  }, [config]);

  return {
    config,
    updateConfig,
    isBackingUp,
    backupHistory,
    createBackup,
    restoreBackup,
    timeUntilNextBackup,
  };
}
