import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { useApp } from '@/lib/app-context';
import { 
  Play, 
  Pause, 
  Stop, 
  Lightning, 
  CheckCircle,
  XCircle,
  Clock,
  CircleNotch
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { featureFlags } from '@/lib/featureFlags';

interface FlashOperation {
  id: string;
  device: string;
  firmware: string;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
}

const API_BASE = 'http://localhost:3001';

export function PandoraFlashPanel() {
  const { isDemoMode } = useApp();
  const [operations, setOperations] = useState<FlashOperation[]>([]);
  const [history, setHistory] = useState<FlashOperation[]>([]);
  const [_loading, _setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/flash/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load flash history:', err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const _loadHistoryLegacy = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/flash/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      } else {
        setError('Failed to load flash history from backend');
      }
    } catch (err) {
      console.error('Failed to load flash history:', err);
      setError('Backend API unavailable');
    }
  };

  const startFlash = async () => {
    toast.error('Flashing is disabled', {
      description: 'This panel does not run simulated flash operations. Use the Universal Flash Station when flashing is enabled and the backend supports real operations.',
    });
  };

  const pauseOperation = (opId: string) => {
    setOperations(prev => 
      prev.map(op => op.id === opId ? { ...op, status: 'paused' as const } : op)
    );
    toast.info('Operation paused');
  };

  const resumeOperation = (opId: string) => {
    setOperations(prev => 
      prev.map(op => op.id === opId ? { ...op, status: 'running' as const } : op)
    );
    toast.info('Operation resumed');
  };

  const cancelOperation = (opId: string) => {
    setOperations(prev => prev.filter(op => op.id !== opId));
    toast.warning('Operation cancelled');
  };

  const formatDuration = useCallback((startTime: number, endTime?: number) => {
    const now = Date.now();
    const duration = (endTime || now) - startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightning className="w-5 h-5 text-primary" weight="duotone" />
                Flash Operations
              </CardTitle>
              <CardDescription>Manage device firmware flashing operations</CardDescription>
            </div>
            <Button onClick={startFlash} disabled={_loading || !featureFlags.experimentalFlashing}>
              {_loading ? (
                <CircleNotch className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" weight="fill" />
              )}
              {featureFlags.experimentalFlashing ? 'Start Flash' : 'Flashing Disabled'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {operations.length === 0 ? (
            <EmptyState
              icon={<Lightning className="w-12 h-12" weight="duotone" />}
              title="No operations queued"
              description={featureFlags.experimentalFlashing
                ? 'Backend flashing must be implemented to start real operations'
                : 'Flashing is disabled in this build'}
            />
          ) : (
            <div className="space-y-3">
              {operations.map((op) => (
                <Card key={op.id} className="border-primary/30">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">{op.device}</div>
                          <div className="text-sm text-muted-foreground">{op.firmware}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {op.status === 'running' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => pauseOperation(op.id)}>
                                <Pause className="w-4 h-4" weight="fill" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => cancelOperation(op.id)}>
                                <Stop className="w-4 h-4" weight="fill" />
                              </Button>
                            </>
                          )}
                          {op.status === 'paused' && (
                            <>
                              <Button size="sm" onClick={() => resumeOperation(op.id)}>
                                <Play className="w-4 h-4" weight="fill" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => cancelOperation(op.id)}>
                                <Stop className="w-4 h-4" weight="fill" />
                              </Button>
                            </>
                          )}
                          {op.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-emerald-400" weight="fill" />
                          )}
                          {op.status === 'failed' && (
                            <XCircle className="w-5 h-5 text-rose-400" weight="fill" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-mono">{Math.floor(op.progress)}%</span>
                        </div>
                        <Progress value={op.progress} />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant={
                          op.status === 'completed' ? 'default' :
                          op.status === 'failed' ? 'destructive' :
                          op.status === 'paused' ? 'secondary' : 'outline'
                        }>
                          {op.status.toUpperCase()}
                        </Badge>
                        {op.startTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(op.startTime, op.endTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Flash History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {error ? (
              <ErrorState
                title="Failed to load history"
                message={error}
                action={{
                  label: 'Retry',
                  onClick: loadHistory
                }}
                variant="warning"
              />
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No flash history available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry: any, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 py-1">
                    {entry.entry || entry}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
