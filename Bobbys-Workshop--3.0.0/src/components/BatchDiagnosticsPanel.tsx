import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Play,
  Pause,
  Stop,
  CheckCircle,
  Warning,
  XCircle,
  DeviceMobile,
  ClockClockwise,
  ListChecks,
  ArrowsClockwise,
  Info,
  WifiHigh,
  WifiSlash,
  Circle,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useBatchDiagnosticsWebSocket } from '@/hooks/use-batch-diagnostics-websocket';
import { getAPIUrl, getWSUrl } from '@/lib/apiConfig';
import { useAutoSnapshot } from '@/hooks/use-auto-snapshot';
import {
  batteryHealthManifest,
  BatteryHealthData,
  execute as executeBatteryHealth,
} from '@/lib/plugins/battery-health';
import {
  storageAnalyzerManifest,
  StorageHealthData,
  execute as executeStorageAnalyzer,
} from '@/lib/plugins/storage-analyzer';
import {
  thermalMonitorManifest,
  ThermalHealthData,
  execute as executeThermalMonitor,
} from '@/lib/plugins/thermal-monitor';
import { PluginContext } from '@/types/plugin-sdk';

interface ConnectedDevice {
  device_uid: string;
  platform_hint: string;
  mode: string;
  confidence: number;
  evidence: any;
  matched_tool_ids: string[];
  correlation_badge?: any;
  display_name?: string;
}

interface DeviceDiagnosticState {
  device: ConnectedDevice;
  selected: boolean;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  batteryData?: BatteryHealthData;
  storageData?: StorageHealthData;
  thermalData?: ThermalHealthData;
  currentOperation?: string;
  errors: string[];
  completedOperations: string[];
  startTime?: number;
  endTime?: number;
}

type DiagnosticType = 'battery' | 'storage' | 'thermal' | 'all';

export function BatchDiagnosticsPanel() {
  const [devices, setDevices] = useState<Map<string, DeviceDiagnosticState>>(new Map());
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchPaused, setBatchPaused] = useState(false);
  const [selectedDiagnostics, setSelectedDiagnostics] = useState<Set<DiagnosticType>>(
    new Set(['battery', 'storage', 'thermal'])
  );
  const [concurrencyMode, setConcurrencyMode] = useState<'sequential' | 'parallel'>('sequential');
  const [maxConcurrent, setMaxConcurrent] = useState(2);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);

  const ws = useBatchDiagnosticsWebSocket({
    wsUrl: getWSUrl('/ws/batch-diagnostics'),
  });

  const autoSnapshot = useAutoSnapshot({
    enabled: true,
    beforeDiagnostics: true,
    afterDiagnostics: true,
    onErrors: true,
    minIntervalMs: 30000,
  });

  const scanDevices = useCallback(async () => {
    setIsScanning(true);
    try {
      const response = await fetch(getAPIUrl('/api/devices/scan'));
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `HTTP ${response.status}`);
      }
      const data = await response.json();
      const scannedDevices: ConnectedDevice[] = Array.isArray(data.devices) ? data.devices : [];
      
      if (scannedDevices.length >= 0) {
        setConnectedDevices(scannedDevices);
        
        setDevices(prev => {
          const newDevices = new Map<string, DeviceDiagnosticState>();
          scannedDevices.forEach((device: ConnectedDevice) => {
            const existing = prev.get(device.device_uid);
            newDevices.set(device.device_uid, {
              device,
              selected: existing?.selected || false,
              status: existing?.status || 'pending',
              progress: existing?.progress || 0,
              batteryData: existing?.batteryData,
              storageData: existing?.storageData,
              thermalData: existing?.thermalData,
              errors: existing?.errors || [],
              completedOperations: existing?.completedOperations || [],
            });
          });
          return newDevices;
        });
        
        toast.success('Device scan complete', {
          description: `Found ${scannedDevices.length} device(s)`,
        });
      }
    } catch (error) {
      toast.error('Failed to scan devices', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      setConnectedDevices([]);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const toggleDeviceSelection = (deviceId: string) => {
    setDevices(prev => {
      const newDevices = new Map(prev);
      const device = newDevices.get(deviceId);
      if (device) {
        device.selected = !device.selected;
      }
      return newDevices;
    });
  };

  const selectAllDevices = () => {
    setDevices(prev => {
      const newDevices = new Map(prev);
      newDevices.forEach(device => {
        device.selected = true;
      });
      return newDevices;
    });
  };

  const deselectAllDevices = () => {
    setDevices(prev => {
      const newDevices = new Map(prev);
      newDevices.forEach(device => {
        device.selected = false;
      });
      return newDevices;
    });
  };

  const toggleDiagnostic = (type: DiagnosticType) => {
    setSelectedDiagnostics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle weight="fill" className="text-success" />;
      case 'failed':
        return <XCircle weight="fill" className="text-destructive" />;
      case 'running':
        return <ArrowsClockwise className="text-primary animate-spin" />;
      case 'paused':
        return <Pause weight="fill" className="text-warning" />;
      default:
        return <ClockClockwise className="text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-muted text-muted-foreground', text: 'Pending' },
      running: { color: 'bg-primary text-primary-foreground', text: 'Running' },
      completed: { color: 'bg-success text-success-foreground', text: 'Completed' },
      failed: { color: 'bg-destructive text-destructive-foreground', text: 'Failed' },
      paused: { color: 'bg-warning text-warning-foreground', text: 'Paused' },
    };

    const variant = variants[status] || variants.pending;
    return <Badge className={variant.color}>{variant.text}</Badge>;
  };

  const selectedDeviceCount = Array.from(devices.values()).filter(d => d.selected).length;
  const totalDevices = devices.size;
  const completedCount = Array.from(devices.values()).filter(d => d.status === 'completed').length;
  const failedCount = Array.from(devices.values()).filter(d => d.status === 'failed').length;
  const runningCount = Array.from(devices.values()).filter(d => d.status === 'running').length;

  const connectionStatusColor = useMemo(() => {
    switch (ws.connectionStatus) {
      case 'connected':
        return 'text-success';
      case 'connecting':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  }, [ws.connectionStatus]);

  const connectionStatusText = useMemo(() => {
    switch (ws.connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  }, [ws.connectionStatus]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Batch Diagnostic Operations</h1>
          <p className="text-muted-foreground mt-1">Run diagnostics across multiple connected devices</p>
          <div className="flex items-center gap-2 mt-2">
            {ws.isConnected ? (
              <WifiHigh weight="fill" className={connectionStatusColor} />
            ) : (
              <WifiSlash weight="fill" className={connectionStatusColor} />
            )}
            <span className={`text-xs ${connectionStatusColor}`}>
              WebSocket: {connectionStatusText}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={scanDevices} disabled={isScanning} variant="outline">
            <ArrowsClockwise className={`mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Refresh Devices'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connected Devices</CardTitle>
                <CardDescription>
                  {totalDevices} device(s) found, {selectedDeviceCount} selected
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllDevices}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllDevices}>
                  Deselect All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {totalDevices === 0 ? (
              <Alert>
                <DeviceMobile className="w-4 h-4" />
                <AlertDescription>
                  No devices detected. Connect devices and click Refresh.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {Array.from(devices.values()).map(deviceState => {
                    const { device, selected, status, progress, currentOperation, errors, completedOperations } = deviceState;

                    return (
                      <Card key={device.device_uid} className="border-border">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => toggleDeviceSelection(device.device_uid)}
                              disabled={batchRunning}
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(status)}
                                  <span className="font-mono text-sm font-medium">
                                    {device.display_name || device.device_uid}
                                  </span>
                                </div>
                                {getStatusBadge(status)}
                              </div>

                              <div className="text-xs text-muted-foreground space-y-1">
                                <div>Platform: {device.platform_hint}</div>
                                <div>Mode: {device.mode}</div>
                                {device.matched_tool_ids.length > 0 && (
                                  <div>IDs: {device.matched_tool_ids.join(', ')}</div>
                                )}
                              </div>

                              {status === 'running' && (
                                <div className="space-y-1">
                                  <div className="text-xs text-muted-foreground">{currentOperation}</div>
                                  <Progress value={progress} className="h-1" />
                                </div>
                              )}

                              {completedOperations.length > 0 && (
                                <div className="text-xs text-success">
                                  ✓ Completed: {completedOperations.join(', ')}
                                </div>
                              )}

                              {errors.length > 0 && (
                                <div className="text-xs text-destructive space-y-1">
                                  {errors.map((error, idx) => (
                                    <div key={idx}>✗ {error}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Selection</CardTitle>
              <CardDescription>Choose which diagnostics to run</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={selectedDiagnostics.has('battery')}
                  onCheckedChange={() => toggleDiagnostic('battery')}
                  disabled={batchRunning}
                />
                <div>
                  <div className="font-medium">Battery Health</div>
                  <div className="text-xs text-muted-foreground">Capacity, cycles, status</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={selectedDiagnostics.has('storage')}
                  onCheckedChange={() => toggleDiagnostic('storage')}
                  disabled={batchRunning}
                />
                <div>
                  <div className="font-medium">Storage Health</div>
                  <div className="text-xs text-muted-foreground">SMART data, wear level</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={selectedDiagnostics.has('thermal')}
                  onCheckedChange={() => toggleDiagnostic('thermal')}
                  disabled={batchRunning}
                />
                <div>
                  <div className="font-medium">Thermal Monitor</div>
                  <div className="text-xs text-muted-foreground">Temperature zones, throttling</div>
                </div>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution Mode</CardTitle>
              <CardDescription>Control batch operation behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Concurrency</label>
                <Select value={concurrencyMode} onValueChange={(v: any) => setConcurrencyMode(v)} disabled={batchRunning}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sequential">Sequential (One at a time)</SelectItem>
                    <SelectItem value="parallel">Parallel (Multiple devices)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {concurrencyMode === 'parallel' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Concurrent</label>
                  <Select value={maxConcurrent.toString()} onValueChange={(v) => setMaxConcurrent(Number(v))} disabled={batchRunning}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 device</SelectItem>
                      <SelectItem value="2">2 devices</SelectItem>
                      <SelectItem value="3">3 devices</SelectItem>
                      <SelectItem value="4">4 devices</SelectItem>
                      <SelectItem value="5">5 devices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Button 
                  className="w-full"
                  disabled={selectedDeviceCount === 0 || selectedDiagnostics.size === 0}
                >
                  <Play className="mr-2" />
                  Start Batch Operation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Batch Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Selected:</span>
                <span className="font-medium">{selectedDeviceCount} / {totalDevices}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Running:</span>
                <span className="font-medium text-primary">{runningCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium text-success">{completedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Failed:</span>
                <span className="font-medium text-destructive">{failedCount}</span>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Sequential mode processes one device at a time. Parallel mode processes multiple devices simultaneously for faster completion.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}