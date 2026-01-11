// Snapshot Manager - Manages device state snapshots with retention policies
// Part of Bobby's World diagnostic toolkit

import type { 
  Snapshot, 
  SnapshotType, 
  RetentionPolicy, 
  RetentionStats, 
  RetentionAction,
  RetentionPriority 
} from '@/types/snapshot';

// In-memory storage (in production, use IndexedDB or file system)
const snapshots: Snapshot[] = [];
let policies: RetentionPolicy[] = [];
const retentionActions: RetentionAction[] = [];

interface SnapshotManagerConfig {
  maxStorageBytes: number;
  defaultPolicies: RetentionPolicy[];
  autoCleanupInterval: number;
}

const DEFAULT_CONFIG: SnapshotManagerConfig = {
  maxStorageBytes: 500 * 1024 * 1024, // 500MB
  defaultPolicies: [],
  autoCleanupInterval: 3600000 // 1 hour
};

interface SnapshotManager {
  createSnapshot(type: SnapshotType, data: any, options?: Partial<Snapshot>): Promise<Snapshot>;
  listSnapshots(filter?: Partial<{ type: SnapshotType; deviceId: string; priority: RetentionPriority }>): Promise<Snapshot[]>;
  getSnapshot(id: string): Promise<Snapshot | null>;
  getSnapshots(filter?: Partial<{ type: SnapshotType; deviceId: string; priority: RetentionPriority }>): Promise<Snapshot[]>;
  deleteSnapshot(id: string, manual?: boolean): Promise<boolean>;
  deleteSnapshots(ids: string[], manual?: boolean): Promise<number>;
  compressSnapshot(id: string): Promise<Snapshot>;
  listPolicies(): Promise<RetentionPolicy[]>;
  getRetentionPolicies(): Promise<RetentionPolicy[]>;
  setRetentionPolicies(policies: RetentionPolicy[]): Promise<void>;
  updatePolicy(policy: RetentionPolicy): Promise<void>;
  deletePolicy(id: string): Promise<void>;
  getRetentionStats(): Promise<RetentionStats>;
  applyRetentionPolicies(): Promise<number>;
  getRetentionHistory(): Promise<RetentionAction[]>;
  getRecentActions(limit?: number): Promise<RetentionAction[]>;
  exportSnapshots(ids?: string[]): Promise<string>;
  clearAllSnapshots(): Promise<void>;
  exportSnapshot(id: string): Promise<Blob>;
  importSnapshot(blob: Blob): Promise<Snapshot>;
  estimateStorageUsage(): Promise<{ used: number; available: number; percentage: number }>;

  formatBytes(bytes: number): string;
  formatAge(timestampMs: number): string;
}

function generateId(): string {
  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function estimateSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size;
}

export const snapshotManager: SnapshotManager = {
  async createSnapshot(type: SnapshotType, data: any, options?: Partial<Snapshot>): Promise<Snapshot> {
    const snapshot: Snapshot = {
      id: generateId(),
      type,
      timestamp: Date.now(),
      deviceId: options?.deviceId,
      deviceSerial: options?.deviceSerial,
      deviceModel: options?.deviceModel,
      priority: options?.priority || 'normal',
      sizeBytes: estimateSize(data),
      compressed: false,
      tags: options?.tags || [],
      metadata: options?.metadata || {},
      data,
      autoDelete: options?.autoDelete ?? true,
      ...options
    };

    snapshots.push(snapshot);
    return snapshot;
  },

  async listSnapshots(filter?: Partial<{ type: SnapshotType; deviceId: string; priority: RetentionPriority }>): Promise<Snapshot[]> {
    return this.getSnapshots(filter);
  },

  async getSnapshot(id: string): Promise<Snapshot | null> {
    return snapshots.find(s => s.id === id) || null;
  },

  async getSnapshots(filter?: Partial<{ 
    type: SnapshotType; 
    deviceId: string; 
    priority: RetentionPriority 
  }>): Promise<Snapshot[]> {
    let result = [...snapshots];
    
    if (filter) {
      if (filter.type) result = result.filter(s => s.type === filter.type);
      if (filter.deviceId) result = result.filter(s => s.deviceId === filter.deviceId);
      if (filter.priority) result = result.filter(s => s.priority === filter.priority);
    }
    
    return result.sort((a, b) => b.timestamp - a.timestamp);
  },

  async deleteSnapshot(id: string, manual: boolean = true): Promise<boolean> {
    const index = snapshots.findIndex(s => s.id === id);
    if (index >= 0) {
      snapshots.splice(index, 1);
      retentionActions.push({
        action: 'delete',
        snapshotId: id,
        reason: 'Manual deletion',
        timestamp: Date.now(),
        manual
      });
      return true;
    }
    return false;
  },

  async deleteSnapshots(ids: string[], manual: boolean = true): Promise<number> {
    let deleted = 0;
    for (const id of ids) {
      if (await this.deleteSnapshot(id, manual)) {
        deleted++;
      }
    }
    return deleted;
  },

  async compressSnapshot(id: string): Promise<Snapshot> {
    const snapshot = await this.getSnapshot(id);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${id}`);
    }
    
    if (snapshot.compressed) {
      return snapshot;
    }

    // In production, use actual compression
    snapshot.compressed = true;
    snapshot.sizeBytes = Math.floor(snapshot.sizeBytes * 0.4); // Simulate 60% compression
    
    retentionActions.push({
      action: 'compress',
      snapshotId: id,
      reason: 'Retention policy compression',
      timestamp: Date.now(),
      manual: false
    });

    return snapshot;
  },

  async listPolicies(): Promise<RetentionPolicy[]> {
    return this.getRetentionPolicies();
  },

  async getRetentionPolicies(): Promise<RetentionPolicy[]> {
    if (policies.length === 0) {
      // Return default policies
      policies = [
        {
          id: 'default-diagnostic',
          name: 'Diagnostic Results',
          enabled: true,
          snapshotTypes: ['diagnostic-result'],
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          maxCount: 100,
          minRetainCount: 5,
          priority: 'normal',
          compressAfterDays: 7,
          autoDeleteEnabled: true
        },
        {
          id: 'default-flash',
          name: 'Flash Operations',
          enabled: true,
          snapshotTypes: ['flash-operation'],
          maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
          maxCount: 50,
          minRetainCount: 10,
          priority: 'high',
          compressAfterDays: 14,
          autoDeleteEnabled: true
        },
        {
          id: 'default-evidence',
          name: 'Evidence Bundles',
          enabled: true,
          snapshotTypes: ['evidence-bundle'],
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
          maxCount: 500,
          minRetainCount: 20,
          priority: 'critical',
          compressAfterDays: 30,
          autoDeleteEnabled: false
        }
      ];
    }
    return [...policies];
  },

  async setRetentionPolicies(newPolicies: RetentionPolicy[]): Promise<void> {
    policies = [...newPolicies];
  },

  async updatePolicy(policy: RetentionPolicy): Promise<void> {
    const current = await this.getRetentionPolicies();
    const index = current.findIndex(p => p.id === policy.id);
    if (index >= 0) {
      current[index] = policy;
    } else {
      current.push(policy);
    }
    await this.setRetentionPolicies(current);
  },

  async deletePolicy(id: string): Promise<void> {
    const current = await this.getRetentionPolicies();
    await this.setRetentionPolicies(current.filter(p => p.id !== id));
  },

  async getRetentionStats(): Promise<RetentionStats> {
    const now = Date.now();
    const snapshotsByType: Record<SnapshotType, number> = {
      'device-state': 0,
      'diagnostic-result': 0,
      'flash-operation': 0,
      'plugin-config': 0,
      'evidence-bundle': 0,
      'workspace-backup': 0
    };

    snapshots.forEach(s => {
      snapshotsByType[s.type] = (snapshotsByType[s.type] || 0) + 1;
    });

    const totalSizeBytes = snapshots.reduce((sum, s) => sum + s.sizeBytes, 0);
    const timestamps = snapshots.map(s => s.timestamp);
    
    // Calculate eligible for deletion based on policies
    const currentPolicies = await this.getRetentionPolicies();
    let eligibleForDeletion = 0;
    
    for (const snapshot of snapshots) {
      const policy = currentPolicies.find(p => p.snapshotTypes.includes(snapshot.type));
      if (policy && snapshot.autoDelete) {
        const age = now - snapshot.timestamp;
        if (age > policy.maxAge) {
          eligibleForDeletion++;
        }
      }
    }

    return {
      totalSnapshots: snapshots.length,
      totalSizeBytes,
      snapshotsByType,
      oldestSnapshot: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestSnapshot: timestamps.length > 0 ? Math.max(...timestamps) : 0,
      eligibleForDeletion,
      compressionSavings: snapshots.filter(s => s.compressed).reduce((sum, s) => sum + s.sizeBytes * 0.6, 0)
    };
  },

  async applyRetentionPolicies(): Promise<number> {
    const actions: RetentionAction[] = [];
    let deletedCount = 0;
    const now = Date.now();
    const currentPolicies = await this.getRetentionPolicies();

    for (const policy of currentPolicies) {
      if (!policy.enabled) continue;

      const policySnapshots = snapshots.filter(s => 
        policy.snapshotTypes.includes(s.type) && s.autoDelete
      );

      // Sort by timestamp (oldest first)
      policySnapshots.sort((a, b) => a.timestamp - b.timestamp);

      for (const snapshot of policySnapshots) {
        const age = now - snapshot.timestamp;
        const ageInDays = age / (24 * 60 * 60 * 1000);

        // Compress old snapshots
        if (!snapshot.compressed && ageInDays > policy.compressAfterDays) {
          await this.compressSnapshot(snapshot.id);
          actions.push({
            action: 'compress',
            snapshotId: snapshot.id,
            reason: `Compressed after ${policy.compressAfterDays} days`,
            timestamp: now,
            manual: false
          });
        }

        // Delete expired snapshots
        if (policy.autoDeleteEnabled && age > policy.maxAge) {
          const typeSnapshots = policySnapshots.filter(s => s.type === snapshot.type);
          if (typeSnapshots.length > policy.minRetainCount) {
            const deleted = await this.deleteSnapshot(snapshot.id, false);
            if (deleted) deletedCount++;
            actions.push({
              action: 'delete',
              snapshotId: snapshot.id,
              reason: `Exceeded max age of ${policy.maxAge / (24 * 60 * 60 * 1000)} days`,
              timestamp: now,
              manual: false
            });
          }
        }
      }
    }

    retentionActions.push(...actions);
    return deletedCount;
  },

  async getRetentionHistory(): Promise<RetentionAction[]> {
    return [...retentionActions].sort((a, b) => b.timestamp - a.timestamp);
  },

  async getRecentActions(limit: number = 50): Promise<RetentionAction[]> {
    const history = await this.getRetentionHistory();
    return history.slice(0, Math.max(0, limit));
  },

  async exportSnapshots(ids?: string[]): Promise<string> {
    const all = await this.getSnapshots();
    const selected = ids && ids.length > 0 ? all.filter(s => ids.includes(s.id)) : all;
    return JSON.stringify({
      exportedAt: Date.now(),
      count: selected.length,
      snapshots: selected,
    });
  },

  async clearAllSnapshots(): Promise<void> {
    if (snapshots.length === 0) return;
    const clearedIds = snapshots.map(s => s.id);
    snapshots.splice(0, snapshots.length);
    const now = Date.now();
    for (const id of clearedIds) {
      retentionActions.push({
        action: 'delete',
        snapshotId: id,
        reason: 'Cleared all snapshots',
        timestamp: now,
        manual: true,
      });
    }
  },

  async exportSnapshot(id: string): Promise<Blob> {
    const snapshot = await this.getSnapshot(id);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${id}`);
    }
    return new Blob([JSON.stringify(snapshot)], { type: 'application/json' });
  },

  async importSnapshot(blob: Blob): Promise<Snapshot> {
    const text = await blob.text();
    const snapshot = JSON.parse(text) as Snapshot;
    snapshot.id = generateId(); // Generate new ID
    snapshot.timestamp = Date.now(); // Update timestamp
    snapshots.push(snapshot);
    return snapshot;
  },

  async estimateStorageUsage(): Promise<{ used: number; available: number; percentage: number }> {
    const used = snapshots.reduce((sum, s) => sum + s.sizeBytes, 0);
    const available = DEFAULT_CONFIG.maxStorageBytes - used;
    const percentage = (used / DEFAULT_CONFIG.maxStorageBytes) * 100;
    
    return { used, available, percentage };
  },

  formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    const precision = unitIndex === 0 ? 0 : value < 10 ? 2 : 1;
    return `${value.toFixed(precision)} ${units[unitIndex]}`;
  },

  formatAge(timestampMs: number): string {
    const diff = Math.max(0, Date.now() - timestampMs);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
};
