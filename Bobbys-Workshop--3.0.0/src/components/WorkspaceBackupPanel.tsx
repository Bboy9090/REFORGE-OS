import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FloppyDisk,
  ArrowsClockwise,
  ClockCounterClockwise,
  Clock,
  Package,
  Gear,
  CheckCircle,
  Warning,
  Play,
  Download,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useWorkspaceBackup, BackupInterval } from '@/hooks/use-workspace-backup';
import { useEffect, useState } from 'react';

export function WorkspaceBackupPanel() {
  const {
    config,
    updateConfig,
    isBackingUp,
    backupHistory,
    createBackup,
    restoreBackup,
    timeUntilNextBackup,
  } = useWorkspaceBackup();

  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const remaining = timeUntilNextBackup();
      if (remaining === null) {
        setTimeRemaining('Manual only');
        return;
      }

      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [timeUntilNextBackup]);

  const handleManualBackup = async () => {
    await createBackup(true);
  };

  const handleRestore = async (snapshotId: string) => {
    if (!confirm('Restore workspace from this backup? Current state will be replaced.')) return;
    
    const result = await restoreBackup(snapshotId);
    if (result.success) {
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const intervalLabels: Record<BackupInterval, string> = {
    'manual': 'Manual Only',
    'hourly': 'Every Hour',
    'every-4-hours': 'Every 4 Hours',
    'every-12-hours': 'Every 12 Hours',
    'daily': 'Daily',
    'weekly': 'Weekly',
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const totalBackupSize = backupHistory?.reduce((sum, b) => sum + b.sizeBytes, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary mb-2">Workspace Backup</h1>
        <p className="text-muted-foreground">
          Automated backup system for plugin states, settings, and device data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Next Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-primary">
              {config?.enabled ? timeRemaining : 'Disabled'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {config?.interval ? intervalLabels[config.interval] : 'Not configured'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Total Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-primary">
              {backupHistory?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(totalBackupSize)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FloppyDisk className="w-4 h-4" />
              Last Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-primary">
              {config?.lastBackup ? formatDate(config.lastBackup).split(',')[1].trim() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {config?.lastBackup ? formatDate(config.lastBackup).split(',')[0] : 'No backups yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gear />
            Backup Configuration
          </CardTitle>
          <CardDescription>
            Configure automatic workspace backup schedule and options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">
                Schedule regular backups of workspace data
              </p>
            </div>
            <Switch
              checked={config?.enabled || false}
              onCheckedChange={(checked) => updateConfig({ enabled: checked })}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Backup Interval</Label>
            <Select
              value={config?.interval || 'manual'}
              onValueChange={(value) => updateConfig({ interval: value as BackupInterval })}
              disabled={!config?.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(intervalLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Include in Backup</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Plugin States</div>
                <p className="text-xs text-muted-foreground">
                  All plugin configurations and runtime data
                </p>
              </div>
              <Switch
                checked={config?.includePluginStates || false}
                onCheckedChange={(checked) => updateConfig({ includePluginStates: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Settings & Preferences</div>
                <p className="text-xs text-muted-foreground">
                  Application settings and user preferences
                </p>
              </div>
              <Switch
                checked={config?.includeSettings || false}
                onCheckedChange={(checked) => updateConfig({ includeSettings: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Snapshot Metadata</div>
                <p className="text-xs text-muted-foreground">
                  References to diagnostic snapshots (not full data)
                </p>
              </div>
              <Switch
                checked={config?.includeSnapshots || false}
                onCheckedChange={(checked) => updateConfig({ includeSnapshots: checked })}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-4">
            <Button
              onClick={handleManualBackup}
              disabled={isBackingUp}
              className="flex-1"
            >
              {isBackingUp ? (
                <>
                  <ArrowsClockwise className="w-4 h-4 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Play />
                  Create Backup Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockCounterClockwise />
            Backup History
          </CardTitle>
          <CardDescription>
            Recent workspace backups - {backupHistory?.length || 0} of {config?.maxBackupsRetained || 10} max
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backupHistory && backupHistory.length > 0 ? (
            <>
              <Progress
                value={(backupHistory.length / (config?.maxBackupsRetained || 10)) * 100}
                className="mb-4"
              />
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {[...backupHistory].reverse().map((backup, index) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-3 bg-card/50 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FloppyDisk className="w-4 h-4 text-primary" />
                          <span className="font-mono text-sm">
                            {formatDate(backup.timestamp)}
                          </span>
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Size: {formatBytes(backup.sizeBytes)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(backup.id)}
                        >
                          <ArrowsClockwise className="w-4 h-4" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No backups yet</p>
              <p className="text-sm mt-2">
                Create your first backup to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warning />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5" />
            <div>
              <strong>Automatic Retention:</strong> Old backups are automatically deleted when limit is reached
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5" />
            <div>
              <strong>Safe Restore:</strong> Restoring reloads the page with your backup data
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Warning className="w-4 h-4 text-warning mt-0.5" />
            <div>
              <strong>Not for Diagnostics:</strong> This backs up workspace state, not full diagnostic data
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
