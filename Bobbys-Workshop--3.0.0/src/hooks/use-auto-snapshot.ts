import { useCallback, useEffect, useState } from 'react';
import { snapshotManager } from '@/lib/snapshot-manager';
import type { SnapshotType } from '@/types/snapshot';
import { toast } from 'sonner';

interface AutoSnapshotConfig {
  enabled: boolean;
  beforeDiagnostics: boolean;
  afterDiagnostics: boolean;
  onErrors: boolean;
  minIntervalMs: number;
}

interface AutoSnapshotResult {
  success: boolean;
  snapshotId?: string;
  error?: string;
}

export function useAutoSnapshot(config?: Partial<AutoSnapshotConfig>) {
  const [lastSnapshotTime, setLastSnapshotTime] = useState<number>(0);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  const defaultConfig: AutoSnapshotConfig = {
    enabled: true,
    beforeDiagnostics: true,
    afterDiagnostics: true,
    onErrors: true,
    minIntervalMs: 30000,
    ...config,
  };

  const canCreateSnapshot = useCallback(() => {
    if (!defaultConfig.enabled) return false;
    const now = Date.now();
    return now - lastSnapshotTime >= defaultConfig.minIntervalMs;
  }, [defaultConfig.enabled, defaultConfig.minIntervalMs, lastSnapshotTime]);

  const createAutoSnapshot = useCallback(
    async (
      type: SnapshotType,
      data: any,
      trigger: 'before' | 'after' | 'error',
      description?: string
    ): Promise<AutoSnapshotResult> => {
      if (isCreatingSnapshot) {
        return { success: false, error: 'Snapshot already in progress' };
      }

      if (!canCreateSnapshot()) {
        return { success: false, error: 'Too soon since last snapshot' };
      }

      setIsCreatingSnapshot(true);

      try {
        const snapshot = await snapshotManager.createSnapshot(type, data, {
          tags: ['auto-snapshot', trigger],
          metadata: {
            auto: true,
            trigger,
            description: description || `Auto-snapshot (${trigger})`,
            timestamp: Date.now(),
          },
        });

        setLastSnapshotTime(Date.now());
        return { success: true, snapshotId: snapshot.id };
      } catch (error) {
        console.error('Auto-snapshot failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      } finally {
        setIsCreatingSnapshot(false);
      }
    },
    [canCreateSnapshot, isCreatingSnapshot]
  );

  const beforeDiagnostic = useCallback(
    async (deviceId: string, diagnosticType: string, state: any) => {
      if (!defaultConfig.beforeDiagnostics) return null;

      const result = await createAutoSnapshot(
        'diagnostic-result',
        { deviceId, diagnosticType, state },
        'before',
        `Before ${diagnosticType} diagnostic on ${deviceId}`
      );

      if (result.success) {
        toast.info('Auto-snapshot created (before diagnostic)');
      }

      return result;
    },
    [defaultConfig.beforeDiagnostics, createAutoSnapshot]
  );

  const afterDiagnostic = useCallback(
    async (deviceId: string, diagnosticType: string, results: any) => {
      if (!defaultConfig.afterDiagnostics) return null;

      const result = await createAutoSnapshot(
        'diagnostic-result',
        { deviceId, diagnosticType, results },
        'after',
        `After ${diagnosticType} diagnostic on ${deviceId}`
      );

      if (result.success) {
        toast.info('Auto-snapshot created (after diagnostic)');
      }

      return result;
    },
    [defaultConfig.afterDiagnostics, createAutoSnapshot]
  );

  const onError = useCallback(
    async (deviceId: string, operation: string, error: any) => {
      if (!defaultConfig.onErrors) return null;

      const result = await createAutoSnapshot(
        'diagnostic-result',
        { deviceId, operation, error },
        'error',
        `Error during ${operation} on ${deviceId}`
      );

      if (result.success) {
        toast.warning('Auto-snapshot created (error state)');
      }

      return result;
    },
    [defaultConfig.onErrors, createAutoSnapshot]
  );

  return {
    canCreateSnapshot,
    isCreatingSnapshot,
    createAutoSnapshot,
    beforeDiagnostic,
    afterDiagnostic,
    onError,
  };
}
