import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Lightning,
  DeviceMobile,
  Gauge,
  Play,
  Stop,
  CheckCircle,
  Warning,
  ClockCounterClockwise,
  ArrowsDownUp,
  HardDrive,
  Usb,
  Timer,
  Info,
  PlugsConnected
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import type { FlashProgress } from './FlashProgressMonitor';
import { LiveProgressMonitor } from './LiveProgressMonitor';
import { useAudioNotifications } from '@/hooks/use-audio-notifications';
import { getAPIUrl } from '@/lib/apiConfig';

interface Device {
  serial: string;
  model?: string;
  platform: 'android' | 'ios' | 'unknown';
  mode: string;
  confidence: number;
  correlationBadge: string;
  matchedIds: string[];
  usbPort?: string;
  vendor?: string;
}

interface FlashJob {
  id: string;
  deviceSerial: string;
  deviceModel?: string;
  partition: string;
  imagePath: string;
  imageSize: number;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: number;
  endTime?: number;
  progress?: FlashProgress;
  error?: string;
  averageSpeed?: number;
  peakSpeed?: number;
}

interface FlashMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageSpeed: number;
  totalDataTransferred: number;
  activeJobs: number;
}

export function DeviceFlashingDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedPartition, setSelectedPartition] = useState<string>('system');
  const [flashJobs, setFlashJobs] = useKV<FlashJob[]>('flash-jobs', []);
  const [activeJob, setActiveJob] = useState<FlashJob | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [metrics, setMetrics] = useState<FlashMetrics>({
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    averageSpeed: 0,
    totalDataTransferred: 0,
    activeJobs: 0
  });

  const flashingEnabled = false;
  const { handleJobStart, handleJobError, handleJobComplete } = useAudioNotifications();

  useEffect(() => {
    scanForDevices();
  }, []);

  useEffect(() => {
    if (flashJobs) {
      calculateMetrics();
    }
  }, [flashJobs]);

  const scanForDevices = async () => {
    setIsScanning(true);
    try {
      const response = await fetch(getAPIUrl('/api/devices/scan'));
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const scanned = Array.isArray(data.devices) ? data.devices : [];
      const mapped: Device[] = scanned.map((d: any) => {
        const evidence = (d?.evidence ?? {}) as any;
        const rawConfidence = typeof d?.confidence === 'number' ? d.confidence : 0;
        const percentConfidence = rawConfidence <= 1 ? Math.round(rawConfidence * 100) : Math.round(rawConfidence);
        const serial = typeof evidence?.serial === 'string' ? evidence.serial : (typeof d?.display_name === 'string' ? d.display_name : String(d?.device_uid ?? 'unknown'));

        return {
          serial,
          model: typeof d?.display_name === 'string' ? d.display_name : undefined,
          platform: d?.platform_hint === 'android' || d?.platform_hint === 'ios' ? d.platform_hint : 'unknown',
          mode: typeof d?.mode === 'string' ? d.mode : 'unknown',
          confidence: Number.isFinite(percentConfidence) ? percentConfidence : 0,
          correlationBadge: typeof d?.correlation_badge === 'string' ? d.correlation_badge : 'UNCONFIRMED',
          matchedIds: Array.isArray(d?.matched_tool_ids) ? d.matched_tool_ids : [],
          usbPort: typeof evidence?.pnpDeviceId === 'string' ? evidence.pnpDeviceId : undefined,
          vendor: typeof evidence?.manufacturer === 'string' ? evidence.manufacturer : undefined,
        };
      });

      setDevices(mapped);
      toast.success(`Found ${mapped.length} device(s)`);
    } catch (error) {
      setDevices([]);
      toast.error('Device scan failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const calculateMetrics = () => {
    if (!flashJobs) return;

    const completed = flashJobs.filter(j => j.status === 'completed');
    const failed = flashJobs.filter(j => j.status === 'failed');
    const active = flashJobs.filter(j => j.status === 'running');

    const totalSpeed = completed.reduce((sum, j) => sum + (j.averageSpeed || 0), 0);
    const avgSpeed = completed.length > 0 ? totalSpeed / completed.length : 0;

    const totalData = completed.reduce((sum, j) => sum + j.imageSize, 0);

    setMetrics({
      totalJobs: flashJobs.length,
      completedJobs: completed.length,
      failedJobs: failed.length,
      averageSpeed: avgSpeed,
      totalDataTransferred: totalData,
      activeJobs: active.length
    });
  };

  const startFlashJob = async () => {
    if (!flashingEnabled) {
      toast.error('Flashing disabled', {
        description: 'Flashing is not yet wired to a real backend implementation. This UI will be re-enabled when real fastboot flashing is available.',
      });
      return;
    }

    if (!selectedDevice) {
      toast.error('Please select a device');
      return;
    }

    const device = devices.find(d => d.serial === selectedDevice);
    if (!device) {
      toast.error('Device not found');
      return;
    }

    if (device.mode !== 'fastboot') {
      toast.error('Device must be in fastboot mode to flash');
      return;
    }

    toast.error('Flashing disabled', {
      description: 'Device is detected, but flashing is currently disabled until backed by real endpoints and progress reporting.',
    });
  };

  const completeActiveJob = (progress: FlashProgress) => {
    if (!activeJob) return;

    const completedJob: FlashJob = {
      ...activeJob,
      status: 'completed',
      endTime: Date.now(),
      averageSpeed: progress.averageSpeed,
      peakSpeed: progress.peakSpeed,
      progress
    };

    setFlashJobs(prev => 
      (prev || []).map(j => j.id === activeJob.id ? completedJob : j)
    );
    setActiveJob(null);
    
    // Audio notification for successful completion
    handleJobComplete();
    
    toast.success('Flash operation completed successfully');
  };

  const failActiveJob = (error: string) => {
    if (!activeJob) return;

    const failedJob: FlashJob = {
      ...activeJob,
      status: 'failed',
      endTime: Date.now(),
      error
    };

    setFlashJobs(prev =>
      (prev || []).map(j => j.id === activeJob.id ? failedJob : j)
    );
    setActiveJob(null);
    
    // Audio notification for error
    handleJobError();
    
    toast.error(`Flash operation failed: ${error}`);
  };

  const cancelActiveJob = () => {
    if (!activeJob) return;

    const cancelledJob: FlashJob = {
      ...activeJob,
      status: 'cancelled',
      endTime: Date.now()
    };

    setFlashJobs(prev =>
      (prev || []).map(j => j.id === activeJob.id ? cancelledJob : j)
    );
    setActiveJob(null);
    toast.info('Flash operation cancelled');
  };

  const clearHistory = () => {
    setFlashJobs([]);
    toast.success('Flash history cleared');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusColor = (status: FlashJob['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getCorrelationColor = (badge: string) => {
    switch (badge) {
      case 'CORRELATED': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'SYSTEM-CONFIRMED': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'LIKELY': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Lightning weight="duotone" className="w-6 h-6 text-primary" />
                Device Flashing Dashboard
              </CardTitle>
              <CardDescription className="mt-2">
                Flash firmware to devices with real-time progress tracking and performance monitoring
              </CardDescription>
            </div>
            <Button onClick={scanForDevices} disabled={isScanning} variant="outline">
              <Usb className="w-4 h-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Scan Devices'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lightning className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Jobs</p>
                    <p className="text-2xl font-bold">{metrics.totalJobs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{metrics.completedJobs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Warning className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold">{metrics.failedJobs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Gauge className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Speed</p>
                    <p className="text-xl font-bold">{formatSpeed(metrics.averageSpeed)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <HardDrive className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data Written</p>
                    <p className="text-xl font-bold">{formatBytes(metrics.totalDataTransferred)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Timer className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Jobs</p>
                    <p className="text-2xl font-bold">{metrics.activeJobs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {!flashingEnabled && (
        <Alert className="border-amber-500/30 bg-amber-600/10">
          <Warning className="w-4 h-4 text-amber-400" weight="fill" />
          <AlertTitle className="text-amber-300">Flashing disabled</AlertTitle>
          <AlertDescription className="text-amber-300">
            Flashing and simulated progress were removed for truth-first behavior. This will be re-enabled only when real flashing endpoints and real progress reporting are available.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="flash" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flash">Flash Device</TabsTrigger>
          <TabsTrigger value="live">
            <PlugsConnected className="w-4 h-4 mr-2" weight="duotone" />
            Live Progress
          </TabsTrigger>
          <TabsTrigger value="devices">Connected Devices</TabsTrigger>
          <TabsTrigger value="history">Flash History</TabsTrigger>
        </TabsList>

        <TabsContent value="flash" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DeviceMobile weight="duotone" className="w-5 h-5" />
                Flash Configuration
              </CardTitle>
              <CardDescription>
                Select device and partition to flash firmware
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {devices.length === 0 ? (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertTitle>No devices found</AlertTitle>
                  <AlertDescription>
                    Connect a device in fastboot mode and click "Scan Devices" to begin.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Device</label>
                    <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a device" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map(device => (
                          <SelectItem key={device.serial} value={device.serial}>
                            <div className="flex items-center gap-2">
                              <span>{device.model || device.serial}</span>
                              <Badge variant="outline" className="text-xs">
                                {device.mode}
                              </Badge>
                              <Badge className={`text-xs ${getCorrelationColor(device.correlationBadge)}`}>
                                {device.correlationBadge}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Partition</label>
                    <Select value={selectedPartition} onValueChange={setSelectedPartition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">system</SelectItem>
                        <SelectItem value="boot">boot</SelectItem>
                        <SelectItem value="recovery">recovery</SelectItem>
                        <SelectItem value="vendor">vendor</SelectItem>
                        <SelectItem value="product">product</SelectItem>
                        <SelectItem value="super">super</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {selectedDevice && (
                    <Alert className="border-primary/20">
                      <Info className="w-4 h-4" />
                      <AlertTitle>Ready to Flash</AlertTitle>
                      <AlertDescription>
                        Device: {devices.find(d => d.serial === selectedDevice)?.model || selectedDevice}
                        <br />
                        Partition: {selectedPartition}.img
                        <br />
                        <span className="text-xs text-muted-foreground">
                          Make sure the device has sufficient battery and stable USB connection
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      onClick={startFlashJob}
                      disabled={!flashingEnabled || !selectedDevice || !!activeJob}
                      className="gap-2"
                    >
                      <Play weight="fill" className="w-4 h-4" />
                      Start Flashing
                    </Button>

                    {activeJob && (
                      <Button 
                        onClick={cancelActiveJob}
                        variant="destructive"
                        className="gap-2"
                      >
                        <Stop weight="fill" className="w-4 h-4" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-4 mt-6">
          <LiveProgressMonitor />
        </TabsContent>

        <TabsContent value="devices" className="space-y-4 mt-6">
          {devices.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-8">
                  <DeviceMobile className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No devices connected</p>
                  <p className="text-sm mt-2">Connect a device and scan to begin</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {devices.map(device => (
                <Card key={device.serial}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DeviceMobile weight="duotone" className="w-5 h-5" />
                        {device.model || device.serial}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{device.platform}</Badge>
                        <Badge variant="outline">{device.mode}</Badge>
                        <Badge className={getCorrelationColor(device.correlationBadge)}>
                          {device.correlationBadge}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Serial</p>
                        <p className="font-mono">{device.serial}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Vendor</p>
                        <p>{device.vendor || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">USB Port</p>
                        <p className="font-mono text-xs">{device.usbPort || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                        <p className="font-semibold">{device.confidence}%</p>
                      </div>
                    </div>
                    {device.matchedIds.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Matched IDs:</p>
                        <div className="flex flex-wrap gap-2">
                          {device.matchedIds.map((id, idx) => (
                            <Badge key={idx} variant="outline" className="font-mono text-xs">
                              {id}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {flashJobs && flashJobs.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClockCounterClockwise className="w-4 h-4" />
                  <span>{flashJobs.length} total job(s)</span>
                </div>
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  Clear History
                </Button>
              </div>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {flashJobs.map(job => (
                    <Card key={job.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {job.partition} → {job.deviceModel || job.deviceSerial}
                          </CardTitle>
                          <Badge variant={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Image Size</p>
                            <p className="font-mono">{formatBytes(job.imageSize)}</p>
                          </div>
                          {job.averageSpeed && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Avg Speed</p>
                              <p className="font-mono">{formatSpeed(job.averageSpeed)}</p>
                            </div>
                          )}
                          {job.peakSpeed && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Peak Speed</p>
                              <p className="font-mono">{formatSpeed(job.peakSpeed)}</p>
                            </div>
                          )}
                          {job.startTime && job.endTime && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Duration</p>
                              <p className="font-mono">{formatDuration(job.endTime - job.startTime)}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                            <p className="text-xs">
                              {job.startTime ? new Date(job.startTime).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {job.error && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-destructive">{job.error}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-8">
                  <ClockCounterClockwise className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No flash history</p>
                  <p className="text-sm mt-2">Flashing is currently disabled.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
