export type SnapshotType = 'device-state' | 'diagnostic-result' | 'flash-operation' | 'plugin-config' | 'evidence-bundle' | 'workspace-backup';

export type RetentionPriority = 'critical' | 'high' | 'normal' | 'low';

export interface Snapshot {
  id: string;
  type: SnapshotType;
  timestamp: number;
  deviceId?: string;
  deviceSerial?: string;
  deviceModel?: string;
  priority: RetentionPriority;
  sizeBytes: number;
  compressed: boolean;
  tags: string[];
  metadata: Record<string, any>;
  data: any;
  retainUntil?: number;
  autoDelete: boolean;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  enabled: boolean;
  snapshotTypes: SnapshotType[];
  maxAge: number;
  maxCount: number;
  minRetainCount: number;
  priority: RetentionPriority;
  compressAfterDays: number;
  autoDeleteEnabled: boolean;
  conditions?: RetentionCondition[];
}

export interface RetentionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater-than' | 'less-than';
  value: any;
}

export interface RetentionStats {
  totalSnapshots: number;
  totalSizeBytes: number;
  snapshotsByType: Record<SnapshotType, number>;
  oldestSnapshot: number;
  newestSnapshot: number;
  eligibleForDeletion: number;
  compressionSavings: number;
}

export interface RetentionAction {
  action: 'delete' | 'compress' | 'archive' | 'retain';
  snapshotId: string;
  reason: string;
  timestamp: number;
  manual: boolean;
}
