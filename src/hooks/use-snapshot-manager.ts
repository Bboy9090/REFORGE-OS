import { useState, useEffect, useCallback } from 'react';
import { snapshotManager } from '@/lib/snapshot-manager';
import type { Snapshot, RetentionPolicy, RetentionStats, SnapshotType, RetentionAction } from '@/types/snapshot';

export function useSnapshotManager() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [stats, setStats] = useState<RetentionStats | null>(null);
  const [recentActions, setRecentActions] = useState<RetentionAction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSnapshots = useCallback(async (filters?: Parameters<typeof snapshotManager.listSnapshots>[0]) => {
    setLoading(true);
    try {
      const data = await snapshotManager.listSnapshots(filters);
      setSnapshots(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPolicies = useCallback(async () => {
    const data = await snapshotManager.listPolicies();
    setPolicies(data);
  }, []);

  const loadStats = useCallback(async () => {
    const data = await snapshotManager.getRetentionStats();
    setStats(data);
  }, []);

  const loadRecentActions = useCallback(async (limit?: number) => {
    const data = await snapshotManager.getRecentActions(limit);
    setRecentActions(data);
  }, []);

  const createSnapshot = useCallback(async (
    type: SnapshotType,
    data: any,
    options?: Parameters<typeof snapshotManager.createSnapshot>[2]
  ) => {
    const snapshot = await snapshotManager.createSnapshot(type, data, options);
    await loadSnapshots();
    await loadStats();
    await loadRecentActions();
    return snapshot;
  }, [loadSnapshots, loadStats, loadRecentActions]);

  const deleteSnapshot = useCallback(async (id: string, manual: boolean = true) => {
    await snapshotManager.deleteSnapshot(id, manual);
    await loadSnapshots();
    await loadStats();
    await loadRecentActions();
  }, [loadSnapshots, loadStats, loadRecentActions]);

  const updatePolicy = useCallback(async (policy: RetentionPolicy) => {
    await snapshotManager.updatePolicy(policy);
    await loadPolicies();
  }, [loadPolicies]);

  const deletePolicy = useCallback(async (id: string) => {
    await snapshotManager.deletePolicy(id);
    await loadPolicies();
  }, [loadPolicies]);

  const applyRetentionPolicies = useCallback(async () => {
    const deletedCount = await snapshotManager.applyRetentionPolicies();
    await loadSnapshots();
    await loadStats();
    await loadRecentActions();
    return deletedCount;
  }, [loadSnapshots, loadStats, loadRecentActions]);

  const exportSnapshots = useCallback(async (ids?: string[]) => {
    return await snapshotManager.exportSnapshots(ids);
  }, []);

  const clearAllSnapshots = useCallback(async () => {
    await snapshotManager.clearAllSnapshots();
    await loadSnapshots();
    await loadStats();
    await loadRecentActions();
  }, [loadSnapshots, loadStats, loadRecentActions]);

  useEffect(() => {
    loadSnapshots();
    loadPolicies();
    loadStats();
    loadRecentActions();
  }, [loadSnapshots, loadPolicies, loadStats, loadRecentActions]);

  return {
    snapshots,
    policies,
    stats,
    recentActions,
    loading,
    loadSnapshots,
    loadPolicies,
    loadStats,
    createSnapshot,
    deleteSnapshot,
    updatePolicy,
    deletePolicy,
    applyRetentionPolicies,
    exportSnapshots,
    clearAllSnapshots,
  };
}
