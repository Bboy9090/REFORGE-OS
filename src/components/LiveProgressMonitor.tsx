import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Lightning,
  PlugsConnected,
  Warning,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  ArrowsClockwise,
  Trash,
  DownloadSimple,
  Clock,
  HardDrive,
  Gauge,
  Circle
} from '@phosphor-icons/react';
import { useFlashProgressWebSocket } from '@/hooks/use-flash-progress-websocket';
import { getWSUrl } from '@/lib/apiConfig';
import { toast } from 'sonner';

export function LiveProgressMonitor() {
  const [wsUrl, setWsUrl] = useState(getWSUrl('/ws/flash-progress'));
  
  const {
    isConnected,
    connectionStatus,
    reconnectAttempts,
    lastMessageTime,
    activeJobs,
    connect,
    disconnect,
    clearJob,
    clearAllJobs,
  } = useFlashProgressWebSocket({
    url: wsUrl,
    enableNotifications: true,
    autoConnect: false,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-accent text-accent-foreground"><Play className="w-3 h-3 mr-1" weight="fill" /> Running</Badge>;
      case 'paused':
        return <Badge variant="secondary"><Pause className="w-3 h-3 mr-1" weight="fill" /> Paused</Badge>;
      case 'completed':
        return <Badge className="bg-accent text-accent-foreground"><CheckCircle className="w-3 h-3 mr-1" weight="fill" /> Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" weight="fill" /> Failed</Badge>;
      default:
        return <Badge variant="outline"><Circle className="w-3 h-3 mr-1" /> Idle</Badge>;
    }
  };

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-accent text-accent-foreground"><PlugsConnected className="w-3 h-3 mr-1" weight="fill" /> Connected</Badge>;
      case 'connecting':
        return <Badge variant="secondary"><ArrowsClockwise className="w-3 h-3 mr-1 animate-spin" /> Connecting</Badge>;
      case 'error':
        return <Badge variant="destructive"><Warning className="w-3 h-3 mr-1" weight="fill" /> Error</Badge>;
      default:
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" /> Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-display tracking-wide">
                <Lightning className="w-6 h-6 text-primary" weight="duotone" />
                Live Progress Monitor
              </CardTitle>
              <CardDescription className="mt-2">
                Real-time updates for device flashing operations via WebSocket
              </CardDescription>
            </div>
            {getConnectionBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={isConnected ? disconnect : connect}
                variant={isConnected ? 'destructive' : 'default'}
                size="sm"
              >
                {isConnected ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" weight="duotone" />
                    Disconnect
                  </>
                ) : (
                  <>
                    <PlugsConnected className="w-4 h-4 mr-2" weight="duotone" />
                    Connect
                  </>
                )}
              </Button>
              
              {activeJobs.length > 0 && (
                <Button
                  onClick={clearAllJobs}
                  variant="outline"
                  size="sm"
                >
                  <Trash className="w-4 h-4 mr-2" weight="duotone" />
                  Clear All
                </Button>
              )}
            </div>

            {connectionStatus === 'connecting' && reconnectAttempts > 0 && (
              <Alert>
                <ArrowsClockwise className="w-4 h-4 animate-spin" />
                <AlertTitle>Reconnecting</AlertTitle>
                <AlertDescription>
                  Attempt {reconnectAttempts}/5 - Trying to reconnect to the server...
                </AlertDescription>
              </Alert>
            )}

            {connectionStatus === 'error' && (
              <Alert variant="destructive">
                <Warning className="w-4 h-4" weight="fill" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  Unable to connect to WebSocket server at {wsUrl}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-mono">Active Jobs</p>
                <p className="text-2xl font-bold font-display text-primary">{activeJobs.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-mono">Connection Status</p>
                <p className="text-lg font-semibold capitalize">{connectionStatus}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-mono">Last Update</p>
                <p className="text-lg font-semibold font-mono">
                  {lastMessageTime > 0 ? `${Math.floor((Date.now() - lastMessageTime) / 1000)}s ago` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {activeJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Lightning className="w-16 h-16 text-muted-foreground/50 mb-4" weight="duotone" />
              <p className="text-lg font-semibold text-muted-foreground">No active flash operations</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isConnected ? 'Waiting for flash jobs from backend...' : 'Connect to start monitoring'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <Card key={job.jobId} className="border-border/50 bg-muted/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-display tracking-wide">
                            {job.deviceName || job.deviceId}
                          </CardTitle>
                          <CardDescription className="font-mono text-xs">
                            Job ID: {job.jobId}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(job.status)}
                          <Button
                            onClick={() => clearJob(job.jobId)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Trash className="w-3 h-3" weight="duotone" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{job.stage}</span>
                          <span className="font-mono font-semibold text-primary">{job.progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-3 bg-background/50 rounded-lg border border-border/30">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HardDrive className="w-3 h-3" weight="duotone" />
                            <span className="font-mono">Transferred</span>
                          </div>
                          <p className="text-sm font-semibold font-mono">
                            {formatBytes(job.bytesTransferred)} / {formatBytes(job.totalBytes)}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Gauge className="w-3 h-3" weight="duotone" />
                            <span className="font-mono">Speed</span>
                          </div>
                          <p className="text-sm font-semibold font-mono text-accent">
                            {formatSpeed(job.transferSpeed)}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" weight="duotone" />
                            <span className="font-mono">ETA</span>
                          </div>
                          <p className="text-sm font-semibold font-mono">
                            {job.estimatedTimeRemaining > 0 ? formatTime(job.estimatedTimeRemaining) : 'Calculating...'}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <DownloadSimple className="w-3 h-3" weight="duotone" />
                            <span className="font-mono">Elapsed</span>
                          </div>
                          <p className="text-sm font-semibold font-mono">
                            {formatTime((Date.now() - job.startedAt) / 1000)}
                          </p>
                        </div>
                      </div>

                      {job.error && (
                        <Alert variant="destructive">
                          <Warning className="w-4 h-4" weight="fill" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription className="font-mono text-xs">
                            {job.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
