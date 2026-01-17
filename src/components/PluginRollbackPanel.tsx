import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowCounterClockwise, 
  Trash, 
  CheckCircle, 
  XCircle, 
  Clock,
  Warning,
  FloppyDisk,
  Play,
  Pause
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import pluginRollbackManager from '@/lib/plugin-rollback';
import type { 
  SnapshotMetadata, 
  RollbackOperation, 
  RollbackPolicy 
} from '@/types/plugin-rollback';

export function PluginRollbackPanel() {
  const [snapshots, setSnapshots] = useState<SnapshotMetadata[]>([]);
  const [policy, setPolicy] = useState<RollbackPolicy>(pluginRollbackManager.getPolicy());
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rollbackHistory, setRollbackHistory] = useState<Record<string, RollbackOperation[]>>({});

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    try {
      const data = await pluginRollbackManager.getAllSnapshots();
      setSnapshots(data);
    } catch (error) {
      console.error('[PluginRollbackPanel] Failed to load snapshots:', error);
      toast.error('Failed to load snapshots');
    }
  };

  const handleRollback = async (snapshotId: string) => {
    setLoading(true);
    try {
      const result = await pluginRollbackManager.rollback(snapshotId);
      
      if (result.success) {
        toast.success(`Rolled back to version ${result.restoredVersion}`);
        await loadSnapshots();
      } else {
        toast.error(`Rollback failed: ${result.error}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Rollback failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (!confirm('Delete this snapshot? This cannot be undone.')) {
      return;
    }

    try {
      await pluginRollbackManager.deleteSnapshot(snapshotId);
      toast.success('Snapshot deleted');
      await loadSnapshots();
    } catch (error) {
      toast.error('Failed to delete snapshot');
    }
  };

  const handlePolicyUpdate = async (updates: Partial<RollbackPolicy>) => {
    try {
      await pluginRollbackManager.updatePolicy(updates);
      setPolicy(pluginRollbackManager.getPolicy());
      toast.success('Rollback policy updated');
    } catch (error) {
      toast.error('Failed to update policy');
    }
  };

  const loadRollbackHistory = async (pluginId: string) => {
    try {
      const history = await pluginRollbackManager.getRollbackHistory(pluginId);
      setRollbackHistory(prev => ({ ...prev, [pluginId]: history }));
    } catch (error) {
      console.error('[PluginRollbackPanel] Failed to load rollback history:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      'pre-install': 'bg-primary/10 text-primary',
      'pre-update': 'bg-accent/10 text-accent',
      'pre-uninstall': 'bg-muted-foreground/10 text-muted-foreground',
      'manual': 'bg-secondary/10 text-secondary-foreground',
    };

    return (
      <Badge variant="outline" className={colors[reason] || ''}>
        {reason.replace('pre-', '')}
      </Badge>
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display tracking-tight text-foreground mb-2">
          Plugin Rollback System
        </h2>
        <p className="text-muted-foreground">
          Manage plugin snapshots and restore previous versions
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FloppyDisk className="w-5 h-5 text-primary" />
            Rollback Policy
          </CardTitle>
          <CardDescription>
            Configure automatic snapshot creation and rollback behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={policy.autoSnapshotOnInstall}
                onChange={(e) => handlePolicyUpdate({ autoSnapshotOnInstall: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <div className="font-medium text-sm">Auto-snapshot on Install</div>
                <div className="text-xs text-muted-foreground">Create snapshot before installing plugins</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={policy.autoSnapshotOnUpdate}
                onChange={(e) => handlePolicyUpdate({ autoSnapshotOnUpdate: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <div className="font-medium text-sm">Auto-snapshot on Update</div>
                <div className="text-xs text-muted-foreground">Create snapshot before updating plugins</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={policy.autoRollbackOnFailure}
                onChange={(e) => handlePolicyUpdate({ autoRollbackOnFailure: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <div className="font-medium text-sm">Auto-rollback on Failure</div>
                <div className="text-xs text-muted-foreground">Automatically restore on installation failure</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={policy.requireConfirmation}
                onChange={(e) => handlePolicyUpdate({ requireConfirmation: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <div className="font-medium text-sm">Require Confirmation</div>
                <div className="text-xs text-muted-foreground">Ask before performing rollback</div>
              </div>
            </label>
          </div>

          <Separator className="bg-border/50" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Snapshots per Plugin</label>
              <input
                type="number"
                value={policy.maxSnapshots}
                onChange={(e) => handlePolicyUpdate({ maxSnapshots: parseInt(e.target.value) })}
                min={1}
                max={50}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">Older snapshots are automatically deleted</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Retention Days</label>
              <input
                type="number"
                value={policy.retentionDays}
                onChange={(e) => handlePolicyUpdate({ retentionDays: parseInt(e.target.value) })}
                min={1}
                max={365}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">Snapshots older than this are deleted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowCounterClockwise className="w-5 h-5 text-primary" />
                Available Snapshots
              </CardTitle>
              <CardDescription>
                {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} available
              </CardDescription>
            </div>
            <Button onClick={loadSnapshots} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <div className="text-center py-12">
              <FloppyDisk className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No snapshots available</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Snapshots are created automatically when installing or updating plugins
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedSnapshot === snapshot.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium font-mono text-sm">{snapshot.pluginId}</h4>
                          {getReasonBadge(snapshot.reason)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>v{snapshot.version}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(snapshot.timestamp)}
                          </span>
                          <span>•</span>
                          <span>{formatBytes(snapshot.size)}</span>
                          {snapshot.dependencies > 0 && (
                            <>
                              <span>•</span>
                              <span>{snapshot.dependencies} dependencies</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRollback(snapshot.id)}
                          disabled={loading || !snapshot.canRestore}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <ArrowCounterClockwise className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          onClick={() => handleDeleteSnapshot(snapshot.id)}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {selectedSnapshot === snapshot.id && rollbackHistory[snapshot.pluginId] && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <h5 className="text-xs font-medium text-muted-foreground mb-2">Rollback History</h5>
                        <div className="space-y-2">
                          {rollbackHistory[snapshot.pluginId].map((op) => (
                            <div key={op.id} className="flex items-center gap-2 text-xs">
                              {op.status === 'completed' && <CheckCircle className="w-4 h-4 text-success" />}
                              {op.status === 'failed' && <XCircle className="w-4 h-4 text-destructive" />}
                              {op.status === 'in-progress' && <Play className="w-4 h-4 text-primary animate-pulse" />}
                              <span className="text-muted-foreground">
                                {new Date(op.startTime).toLocaleString()}
                              </span>
                              {op.error && <span className="text-destructive text-xs">• {op.error}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (selectedSnapshot === snapshot.id) {
                          setSelectedSnapshot(null);
                        } else {
                          setSelectedSnapshot(snapshot.id);
                          loadRollbackHistory(snapshot.pluginId);
                        }
                      }}
                      className="text-xs text-primary hover:underline mt-2"
                    >
                      {selectedSnapshot === snapshot.id ? 'Hide details' : 'Show details'}
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warning className="w-5 h-5 text-accent" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Snapshots are created automatically before plugin installations and updates</p>
          <p>• Rolling back restores the plugin code, configuration, and stored data</p>
          <p>• Dependencies are tracked but not automatically rolled back</p>
          <p>• Auto-rollback on failure helps maintain system stability</p>
          <p>• Snapshots are automatically pruned based on retention policy</p>
        </CardContent>
      </Card>
    </div>
  );
}
