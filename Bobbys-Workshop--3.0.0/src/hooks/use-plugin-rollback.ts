import { useState, useCallback, useEffect } from 'react';
import pluginRollbackManager from '@/lib/plugin-rollback';
import type { 
  PluginSnapshot, 
  RollbackPolicy, 
  RollbackResult,
  SnapshotMetadata,
  RollbackOperation 
} from '@/types/plugin-rollback';
import type { RegisteredPlugin } from '@/types/plugin-sdk';

export function usePluginRollback() {
  const [policy, setPolicy] = useState<RollbackPolicy>(pluginRollbackManager.getPolicy());
  const [isLoading, setIsLoading] = useState(false);

  const createSnapshot = useCallback(
    async (plugin: RegisteredPlugin, reason: PluginSnapshot['reason']) => {
      if (!policy.autoSnapshotOnInstall && reason === 'pre-install') {
        return null;
      }
      if (!policy.autoSnapshotOnUpdate && reason === 'pre-update') {
        return null;
      }
      if (!policy.autoSnapshotOnUninstall && reason === 'pre-uninstall') {
        return null;
      }

      setIsLoading(true);
      try {
        const snapshot = await pluginRollbackManager.createSnapshot(plugin, reason);
        return snapshot;
      } catch (error) {
        console.error('[usePluginRollback] Failed to create snapshot:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [policy]
  );

  const rollback = useCallback(async (snapshotId: string): Promise<RollbackResult> => {
    setIsLoading(true);
    try {
      const result = await pluginRollbackManager.rollback(snapshotId);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const autoRollback = useCallback(
    async (pluginId: string, error: Error): Promise<boolean> => {
      if (!policy.autoRollbackOnFailure) {
        return false;
      }

      setIsLoading(true);
      try {
        const success = await pluginRollbackManager.autoRollback(pluginId, error);
        return success;
      } finally {
        setIsLoading(false);
      }
    },
    [policy]
  );

  const getSnapshots = useCallback(async (pluginId: string): Promise<PluginSnapshot[]> => {
    return await pluginRollbackManager.getSnapshots(pluginId);
  }, []);

  const getAllSnapshots = useCallback(async (): Promise<SnapshotMetadata[]> => {
    return await pluginRollbackManager.getAllSnapshots();
  }, []);

  const deleteSnapshot = useCallback(async (snapshotId: string): Promise<void> => {
    setIsLoading(true);
    try {
      await pluginRollbackManager.deleteSnapshot(snapshotId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRollbackHistory = useCallback(
    async (pluginId: string): Promise<RollbackOperation[]> => {
      return await pluginRollbackManager.getRollbackHistory(pluginId);
    },
    []
  );

  const updatePolicy = useCallback(async (updates: Partial<RollbackPolicy>): Promise<void> => {
    setIsLoading(true);
    try {
      await pluginRollbackManager.updatePolicy(updates);
      setPolicy(pluginRollbackManager.getPolicy());
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    policy,
    isLoading,
    createSnapshot,
    rollback,
    autoRollback,
    getSnapshots,
    getAllSnapshots,
    deleteSnapshot,
    getRollbackHistory,
    updatePolicy,
  };
}

export function usePluginSnapshotMonitor(pluginId: string) {
  const [snapshots, setSnapshots] = useState<PluginSnapshot[]>([]);
  const [history, setHistory] = useState<RollbackOperation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [snapshotData, historyData] = await Promise.all([
        pluginRollbackManager.getSnapshots(pluginId),
        pluginRollbackManager.getRollbackHistory(pluginId),
      ]);
      setSnapshots(snapshotData);
      setHistory(historyData);
    } catch (error) {
      console.error('[usePluginSnapshotMonitor] Failed to refresh:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pluginId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    snapshots,
    history,
    isLoading,
    refresh,
  };
}
