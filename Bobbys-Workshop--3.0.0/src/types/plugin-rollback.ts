export interface PluginSnapshot {
  id: string;
  pluginId: string;
  version: string;
  timestamp: string;
  reason: 'pre-install' | 'pre-update' | 'pre-uninstall' | 'manual';
  state: PluginState;
  dependencies: Array<{
    id: string;
    version: string;
  }>;
  files?: {
    manifest: string;
    code: string;
    metadata: Record<string, unknown>;
  };
  kvData?: Record<string, unknown>;
  registryData?: Record<string, unknown>;
}

export interface PluginState {
  installed: boolean;
  enabled: boolean;
  certified: boolean;
  version: string;
  installDate?: string;
  lastUsed?: string;
  executionCount: number;
  errors: number;
  configuration?: Record<string, unknown>;
}

export interface RollbackOperation {
  id: string;
  snapshotId: string;
  pluginId: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  steps: RollbackStep[];
  error?: string;
}

export interface RollbackStep {
  id: string;
  type: 'remove-files' | 'restore-files' | 'restore-kv' | 'restore-dependencies' | 'restore-registry' | 'cleanup';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  error?: string;
  details?: string;
}

export interface RollbackPolicy {
  autoSnapshotOnInstall: boolean;
  autoSnapshotOnUpdate: boolean;
  autoSnapshotOnUninstall: boolean;
  maxSnapshots: number;
  retentionDays: number;
  autoRollbackOnFailure: boolean;
  requireConfirmation: boolean;
}

export interface RollbackHistory {
  operations: RollbackOperation[];
  snapshots: PluginSnapshot[];
  lastCleanup?: string;
}

export interface RollbackResult {
  success: boolean;
  snapshotId: string;
  pluginId: string;
  restoredVersion: string;
  steps: RollbackStep[];
  duration: number;
  error?: string;
}

export interface SnapshotMetadata {
  id: string;
  pluginId: string;
  pluginName: string;
  version: string;
  timestamp: string;
  reason: string;
  size: number;
  dependencies: number;
  canRestore: boolean;
}
