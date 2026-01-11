import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePluginRegistry } from '@/hooks/use-plugin-registry';
import { CloudArrowDown, CheckCircle, Warning, Clock, ArrowsClockwise } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';

export function PluginRegistrySync() {
  const { syncStatus, isLoading, sync } = usePluginRegistry();

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return <ArrowsClockwise className="animate-spin" weight="bold" />;
      case 'success':
        return <CheckCircle weight="fill" className="text-success" />;
      case 'error':
        return <Warning weight="fill" className="text-destructive" />;
      default:
        return <Clock />;
    }
  };

  const getStatusBadge = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return <Badge className="bg-primary/20 text-primary border-primary">Syncing</Badge>;
      case 'success':
        return <Badge className="bg-success/20 text-success border-success">Synced</Badge>;
      case 'error':
        return <Badge className="bg-destructive/20 text-destructive border-destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-lg">Plugin Registry Sync</h3>
            <p className="text-sm text-muted-foreground">
              {syncStatus.lastSync 
                ? `Last synced ${formatDistanceToNow(new Date(syncStatus.lastSync), { addSuffix: true })}`
                : 'Never synced'}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {syncStatus.status === 'syncing' && (
        <div className="mb-4">
          <Progress value={undefined} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">Synchronizing with registry...</p>
        </div>
      )}

      {syncStatus.status === 'error' && syncStatus.error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-2">
            <Warning weight="fill" className="text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-destructive">Sync Failed</p>
              <p className="text-xs text-muted-foreground mt-1">{syncStatus.error}</p>
            </div>
          </div>
        </div>
      )}

      {syncStatus.status === 'success' && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Plugins Updated</p>
            <p className="text-2xl font-bold text-primary">{syncStatus.pluginsUpdated}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">New Plugins</p>
            <p className="text-2xl font-bold text-success">{syncStatus.pluginsAdded}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Removed</p>
            <p className="text-2xl font-bold text-muted-foreground">{syncStatus.pluginsRemoved}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          onClick={sync} 
          disabled={isLoading || syncStatus.status === 'syncing'}
          className="flex-1"
        >
          <CloudArrowDown className="mr-2" weight="bold" />
          {syncStatus.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>
    </Card>
  );
}
