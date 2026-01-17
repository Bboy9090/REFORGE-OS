import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Camera,
  ClockCounterClockwise,
  Trash,
  Download,
  Play,
  HardDrives,
  ChartBar,
  Gear,
  CheckCircle,
  WarningCircle,
  Info,
  ArrowsClockwise,
  Package,
  FloppyDisk
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useSnapshotManager } from '@/hooks/use-snapshot-manager';
import { snapshotManager } from '@/lib/snapshot-manager';
import type { RetentionPolicy, Snapshot, SnapshotType } from '@/types/snapshot';

export function SnapshotRetentionPanel() {
  const {
    snapshots,
    policies,
    stats,
    recentActions,
    loading,
    loadSnapshots,
    updatePolicy,
    deletePolicy,
    deleteSnapshot,
    applyRetentionPolicies,
    exportSnapshots,
    clearAllSnapshots,
  } = useSnapshotManager();

  const [selectedType, setSelectedType] = useState<SnapshotType | 'all'>('all');
  const [editingPolicy, setEditingPolicy] = useState<RetentionPolicy | null>(null);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);

  const handleApplyPolicies = async () => {
    try {
      const deleted = await applyRetentionPolicies();
      toast.success(`Retention policies applied - ${deleted} snapshots deleted`);
    } catch (_error) {
      toast.error('Failed to apply retention policies');
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    try {
      await deleteSnapshot(id, true);
      toast.success('Snapshot deleted');
    } catch (_error) {
      toast.error('Failed to delete snapshot');
    }
  };

  const handleExportAll = async () => {
    try {
      const json = await exportSnapshots();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bobby-snapshots-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Snapshots exported');
    } catch (_error) {
      toast.error('Failed to export snapshots');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Delete ALL snapshots? This cannot be undone.')) return;
    
    try {
      await clearAllSnapshots();
      toast.success('All snapshots cleared');
    } catch (_error) {
      toast.error('Failed to clear snapshots');
    }
  };

  const handleSavePolicy = async () => {
    if (!editingPolicy) return;
    
    try {
      await updatePolicy(editingPolicy);
      setShowPolicyDialog(false);
      setEditingPolicy(null);
      toast.success('Retention policy saved');
    } catch (_error) {
      toast.error('Failed to save policy');
    }
  };

  const filteredSnapshots = selectedType === 'all' 
    ? snapshots 
    : snapshots.filter(s => s.type === selectedType);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-warning';
      case 'normal': return 'text-primary';
      case 'low': return 'text-muted-foreground';
      default: return '';
    }
  };

  const getTypeIcon = (type: SnapshotType) => {
    switch (type) {
      case 'device-state': return <HardDrives className="w-4 h-4" />;
      case 'diagnostic-result': return <ChartBar className="w-4 h-4" />;
      case 'flash-operation': return <FloppyDisk className="w-4 h-4" />;
      case 'plugin-config': return <Package className="w-4 h-4" />;
      case 'evidence-bundle': return <Camera className="w-4 h-4" />;
      case 'workspace-backup': return <Download className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Snapshot Retention</h1>
          <p className="text-muted-foreground mt-1">Automatic backup management and retention policies</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleApplyPolicies} variant="outline" size="sm">
            <ArrowsClockwise className="w-4 h-4 mr-2" />
            Apply Policies
          </Button>
          <Button onClick={handleExportAll} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Snapshots</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalSnapshots}</p>
                </div>
                <Camera className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold text-primary">
                    {snapshotManager.formatBytes(stats.totalSizeBytes)}
                  </p>
                </div>
                <HardDrives className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Eligible for Deletion</p>
                  <p className="text-2xl font-bold text-warning">{stats.eligibleForDeletion}</p>
                </div>
                <WarningCircle className="w-8 h-8 text-warning opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compression Savings</p>
                  <p className="text-2xl font-bold text-success">
                    {snapshotManager.formatBytes(stats.compressionSavings)}
                  </p>
                </div>
                <Package className="w-8 h-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="snapshots" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="snapshots">
            <Camera className="w-4 h-4 mr-2" />
            Snapshots
          </TabsTrigger>
          <TabsTrigger value="policies">
            <Gear className="w-4 h-4 mr-2" />
            Retention Policies
          </TabsTrigger>
          <TabsTrigger value="activity">
            <ClockCounterClockwise className="w-4 h-4 mr-2" />
            Recent Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="snapshots" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Snapshot Archive</CardTitle>
                  <CardDescription>All captured device states and operation results</CardDescription>
                </div>
                <Select value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="device-state">Device States</SelectItem>
                    <SelectItem value="diagnostic-result">Diagnostics</SelectItem>
                    <SelectItem value="flash-operation">Flash Operations</SelectItem>
                    <SelectItem value="plugin-config">Plugin Configs</SelectItem>
                    <SelectItem value="evidence-bundle">Evidence Bundles</SelectItem>
                    <SelectItem value="workspace-backup">Workspace Backups</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading snapshots...</div>
                ) : filteredSnapshots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No snapshots found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSnapshots.map((snapshot) => (
                      <Card key={snapshot.id} className="border-border/50">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`mt-1 ${getPriorityColor(snapshot.priority)}`}>
                                {getTypeIcon(snapshot.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {snapshot.type}
                                  </Badge>
                                  <Badge variant={snapshot.priority === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                                    {snapshot.priority}
                                  </Badge>
                                  {snapshot.compressed && (
                                    <Badge variant="secondary" className="text-xs">
                                      compressed
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm space-y-1">
                                  {snapshot.deviceSerial && (
                                    <p className="font-mono text-xs text-muted-foreground">
                                      Device: {snapshot.deviceSerial}
                                    </p>
                                  )}
                                  <p className="text-muted-foreground">
                                    {new Date(snapshot.timestamp).toLocaleString()} • {snapshotManager.formatAge(snapshot.timestamp)} ago
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    Size: {snapshotManager.formatBytes(snapshot.sizeBytes)}
                                  </p>
                                  {snapshot.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap mt-2">
                                      {snapshot.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSnapshot(snapshot.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Retention Policies</CardTitle>
                  <CardDescription>Configure automatic snapshot lifecycle management</CardDescription>
                </div>
                <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setEditingPolicy({
                          id: `policy-${Date.now()}`,
                          name: 'New Policy',
                          enabled: true,
                          snapshotTypes: ['device-state'],
                          maxAge: 30 * 24 * 60 * 60 * 1000,
                          maxCount: 100,
                          minRetainCount: 5,
                          priority: 'normal',
                          compressAfterDays: 7,
                          autoDeleteEnabled: true,
                        });
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      New Policy
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Retention Policy</DialogTitle>
                      <DialogDescription>Configure automatic snapshot retention rules</DialogDescription>
                    </DialogHeader>
                    {editingPolicy && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Policy Name</Label>
                          <Input
                            value={editingPolicy.name}
                            onChange={(e) => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Enabled</Label>
                          <Switch
                            checked={editingPolicy.enabled}
                            onCheckedChange={(checked) => setEditingPolicy({ ...editingPolicy, enabled: checked })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Max Age (days, -1 for forever)</Label>
                          <Input
                            type="number"
                            value={editingPolicy.maxAge === -1 ? -1 : Math.floor(editingPolicy.maxAge / (24 * 60 * 60 * 1000))}
                            onChange={(e) => {
                              const days = parseInt(e.target.value);
                              setEditingPolicy({ 
                                ...editingPolicy, 
                                maxAge: days === -1 ? -1 : days * 24 * 60 * 60 * 1000 
                              });
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Max Count (-1 for unlimited)</Label>
                          <Input
                            type="number"
                            value={editingPolicy.maxCount}
                            onChange={(e) => setEditingPolicy({ ...editingPolicy, maxCount: parseInt(e.target.value) })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Min Retain Count</Label>
                          <Input
                            type="number"
                            value={editingPolicy.minRetainCount}
                            onChange={(e) => setEditingPolicy({ ...editingPolicy, minRetainCount: parseInt(e.target.value) })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Compress After (days)</Label>
                          <Input
                            type="number"
                            value={editingPolicy.compressAfterDays}
                            onChange={(e) => setEditingPolicy({ ...editingPolicy, compressAfterDays: parseInt(e.target.value) })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Auto Delete Enabled</Label>
                          <Switch
                            checked={editingPolicy.autoDeleteEnabled}
                            onCheckedChange={(checked) => setEditingPolicy({ ...editingPolicy, autoDeleteEnabled: checked })}
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                          <Button variant="outline" onClick={() => setShowPolicyDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSavePolicy}>
                            Save Policy
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {policies.map((policy) => (
                  <Card key={policy.id} className="border-border/50">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{policy.name}</h4>
                            <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                              {policy.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <p>Max Age: {policy.maxAge === -1 ? 'Forever' : `${Math.floor(policy.maxAge / (24 * 60 * 60 * 1000))} days`}</p>
                            <p>Max Count: {policy.maxCount === -1 ? 'Unlimited' : policy.maxCount}</p>
                            <p>Min Retain: {policy.minRetainCount}</p>
                            <p>Compress After: {policy.compressAfterDays} days</p>
                            <p>Auto Delete: {policy.autoDeleteEnabled ? 'Yes' : 'No'}</p>
                            <p>Priority: {policy.priority}</p>
                          </div>
                          <div className="flex gap-1 flex-wrap mt-2">
                            {policy.snapshotTypes.map(type => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPolicy(policy);
                              setShowPolicyDialog(true);
                            }}
                          >
                            <Gear className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePolicy(policy.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Snapshot lifecycle events and policy actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {recentActions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentActions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border border-border/50 rounded-lg">
                        <div className={
                          action.action === 'delete' ? 'text-destructive' :
                          action.action === 'compress' ? 'text-warning' :
                          action.action === 'archive' ? 'text-primary' :
                          'text-success'
                        }>
                          {action.action === 'delete' && <Trash className="w-4 h-4" />}
                          {action.action === 'compress' && <Package className="w-4 h-4" />}
                          {action.action === 'archive' && <Download className="w-4 h-4" />}
                          {action.action === 'retain' && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{action.action}</Badge>
                            {action.manual && <Badge variant="secondary" className="text-xs">manual</Badge>}
                          </div>
                          <p className="text-sm mt-1">{action.reason}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(action.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
