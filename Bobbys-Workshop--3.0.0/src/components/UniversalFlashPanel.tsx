import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  DeviceMobile,
  Lightning,
  Play,
  Pause,
  Stop,
  CheckCircle,
  Warning,
  XCircle,
  ClockCounterClockwise,
  Usb,
  ArrowsDownUp,
  Info,
  ShieldCheck,
  Timer,
  HardDrive,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useBootForgeFlash } from '@/hooks/use-bootforge-flash';
import { DEVICE_BRAND_CAPABILITIES, type DeviceBrand, type FlashMethod, type FlashJobConfig } from '@/types/flash-operations';
import { DeviceStateGuide, type DeviceState } from './DeviceStateGuide';

export function UniversalFlashPanel() {
  const {
    connectedDevices,
    activeOperations,
    flashHistory,
    isScanning,
    wsConnected,
    scanDevices,
    startFlash,
    pauseFlash,
    resumeFlash,
    cancelFlash,
  } = useBootForgeFlash();

  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [flashMethod, setFlashMethod] = useState<FlashMethod>('fastboot');
  const [imagePath, setImagePath] = useState('');
  const [selectedPartitions, setSelectedPartitions] = useState<string[]>(['boot', 'system']);
  const [verifyAfterFlash, setVerifyAfterFlash] = useState(true);
  const [autoReboot, setAutoReboot] = useState(true);
  const [wipeUserData, setWipeUserData] = useState(false);

  const device = connectedDevices.find(d => d.serial === selectedDevice);
  const capabilities = device ? device.capabilities : null;

  const requiredState: DeviceState = (() => {
    switch (flashMethod) {
      case 'fastboot':
        return 'fastboot';
      case 'odin':
      case 'heimdall':
        return 'download';
      case 'edl':
        return 'edl';
      case 'dfu':
        return 'dfu';
      case 'adb-sideload':
      case 'recovery':
        return 'recovery';
      default:
        return 'normal';
    }
  })();

  const guidePlatform = device?.platform === 'ios' ? 'ios' : 'android';
  const guideDeviceName = device?.model || device?.serial || 'Your device';

  const handleStartFlash = async () => {
    if (!selectedDevice || !imagePath || selectedPartitions.length === 0) {
      toast.error('Missing required fields', {
        description: 'Please select a device, image, and partitions',
      });
      return;
    }

    const device = connectedDevices.find(d => d.serial === selectedDevice);
    if (!device) {
      toast.error('Device not found');
      return;
    }

    const config: FlashJobConfig = {
      deviceSerial: selectedDevice,
      deviceBrand: device.brand,
      flashMethod,
      partitions: selectedPartitions.map(name => ({
        name,
        imagePath: `${imagePath}/${name}.img`,
        size: 0,
      })),
      verifyAfterFlash,
      autoReboot,
      wipeUserData,
    };

    await startFlash(config);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'idle':
        return <Badge variant="secondary">Idle</Badge>;
      case 'preparing':
        return <Badge variant="secondary">Preparing</Badge>;
      case 'verifying':
        return <Badge variant="secondary">Verifying</Badge>;
      case 'flashing':
        return <Badge className="bg-primary">Flashing</Badge>;
      case 'paused':
        return <Badge variant="outline" className="border-warning text-warning">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-accent">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-display uppercase flex items-center gap-2">
                <Lightning className="w-6 h-6 text-primary" weight="fill" />
                Universal Flash Station
              </CardTitle>
              <CardDescription>Flash any brand • Pause/Resume support • Real-time monitoring</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={wsConnected ? "default" : "secondary"} className="gap-1">
                <Usb className="w-3 h-3" />
                {wsConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Button onClick={scanDevices} disabled={isScanning} size="sm">
                <ArrowsDownUp className="w-4 h-4 mr-2" weight="bold" />
                {isScanning ? 'Scanning...' : 'Scan Devices'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="flash" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="flash">Flash Setup</TabsTrigger>
              <TabsTrigger value="active">
                Active Operations ({activeOperations.length})
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="flash" className="space-y-4 mt-4">
              <DeviceStateGuide
                requiredState={requiredState}
                platform={guidePlatform}
                deviceName={guideDeviceName}
              />

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Device Selection</Label>
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a device" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectedDevices.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          No devices connected
                        </div>
                      ) : (
                        connectedDevices.map((dev) => (
                          <SelectItem key={dev.serial} value={dev.serial}>
                            <div className="flex items-center gap-2">
                              <DeviceMobile className="w-4 h-4" />
                              <span className="font-mono text-xs">{dev.serial}</span>
                              <Badge variant="secondary" className="text-xs">
                                {dev.brand}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {dev.currentMode}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {device && capabilities && (
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertTitle>Device Capabilities</AlertTitle>
                    <AlertDescription className="space-y-2 mt-2">
                      <div className="flex flex-wrap gap-2">
                        {capabilities.supportedMethods.map(method => (
                          <Badge key={method} variant="secondary">{method}</Badge>
                        ))}
                      </div>
                      {capabilities.bootloaderUnlockRequired && (
                        <div className="flex items-center gap-2 text-sm text-warning">
                          <ShieldCheck className="w-4 h-4" />
                          Bootloader unlock required
                        </div>
                      )}
                      {capabilities.specialInstructions && (
                        <p className="text-sm text-muted-foreground">
                          {capabilities.specialInstructions}
                        </p>
                      )}
                      {capabilities.warningMessage && (
                        <p className="text-sm text-destructive">
                          ⚠️ {capabilities.warningMessage}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Flash Method</Label>
                  <Select value={flashMethod} onValueChange={(v) => setFlashMethod(v as FlashMethod)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {capabilities ? (
                        capabilities.supportedMethods.map(method => (
                          <SelectItem key={method} value={method}>
                            {method.toUpperCase()}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="fastboot">Fastboot</SelectItem>
                          <SelectItem value="odin">Odin</SelectItem>
                          <SelectItem value="edl">EDL</SelectItem>
                          <SelectItem value="recovery">Recovery</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Firmware Image Path</Label>
                  <Input
                    placeholder="/path/to/firmware"
                    value={imagePath}
                    onChange={(e) => setImagePath(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Partitions to Flash</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(capabilities?.partitionSupport || ['boot', 'system', 'recovery', 'vendor']).map(partition => (
                      <div key={partition} className="flex items-center space-x-2">
                        <Switch
                          checked={selectedPartitions.includes(partition)}
                          onCheckedChange={(checked) => {
                            setSelectedPartitions(prev =>
                              checked
                                ? [...prev, partition]
                                : prev.filter(p => p !== partition)
                            );
                          }}
                        />
                        <Label className="text-sm font-mono">{partition}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Verify After Flash</Label>
                    <Switch checked={verifyAfterFlash} onCheckedChange={setVerifyAfterFlash} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto Reboot</Label>
                    <Switch checked={autoReboot} onCheckedChange={setAutoReboot} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-destructive">Wipe User Data</Label>
                    <Switch checked={wipeUserData} onCheckedChange={setWipeUserData} />
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleStartFlash}
                  disabled={!selectedDevice || !imagePath || selectedPartitions.length === 0}
                >
                  <Play className="w-5 h-5 mr-2" weight="fill" />
                  Start Flash Operation
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="active" className="mt-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {activeOperations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Lightning className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No active flash operations</p>
                    </div>
                  ) : (
                    activeOperations.map((op) => (
                      <Card key={op.id} className="border-primary/20">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <DeviceMobile className="w-5 h-5 text-primary" weight="duotone" />
                              <div>
                                <CardTitle className="text-lg">
                                  {op.progress.deviceBrand} • {op.progress.deviceSerial}
                                </CardTitle>
                                <CardDescription className="font-mono text-xs">
                                  Job ID: {op.id}
                                </CardDescription>
                              </div>
                            </div>
                            {getStatusBadge(op.progress.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Overall Progress</span>
                              <span className="font-semibold">{op.progress.overallProgress}%</span>
                            </div>
                            <Progress value={op.progress.overallProgress} className="h-3" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Current Stage</div>
                              <div className="font-medium">{op.progress.currentStage}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Transfer Speed</div>
                              <div className="font-medium font-mono">
                                {op.progress.transferSpeed.toFixed(2)} MB/s
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Data Transferred</div>
                              <div className="font-medium font-mono">
                                {formatBytes(op.progress.bytesTransferred)} / {formatBytes(op.progress.totalBytes)}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Time Remaining</div>
                              <div className="font-medium font-mono">
                                <Timer className="w-3 h-3 inline mr-1" />
                                {formatTime(op.progress.estimatedTimeRemaining)}
                              </div>
                            </div>
                          </div>

                          {op.progress.currentPartition && (
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              <HardDrive className="w-4 h-4 text-primary" weight="duotone" />
                              <span className="text-sm">
                                Flashing partition: <span className="font-mono font-semibold">{op.progress.currentPartition}</span>
                              </span>
                            </div>
                          )}

                          {op.progress.warnings.length > 0 && (
                            <Alert>
                              <Warning className="w-4 h-4" />
                              <AlertTitle>Warnings</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {op.progress.warnings.map((warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}

                          {op.progress.error && (
                            <Alert variant="destructive">
                              <XCircle className="w-4 h-4" />
                              <AlertTitle>Error</AlertTitle>
                              <AlertDescription>{op.progress.error}</AlertDescription>
                            </Alert>
                          )}

                          <div className="flex gap-2">
                            {op.progress.status === 'flashing' && op.canPause && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => pauseFlash(op.id)}
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </Button>
                            )}
                            {op.progress.status === 'paused' && op.canResume && (
                              <Button
                                size="sm"
                                onClick={() => resumeFlash(op.id)}
                              >
                                <Play className="w-4 h-4 mr-2" weight="fill" />
                                Resume
                              </Button>
                            )}
                            {op.canCancel && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => cancelFlash(op.id)}
                              >
                                <Stop className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                          </div>

                          {op.logs.length > 0 && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                View logs ({op.logs.length})
                              </summary>
                              <ScrollArea className="h-32 mt-2 border rounded p-2 bg-muted/20">
                                <pre className="font-mono text-xs space-y-1">
                                  {op.logs.map((log, idx) => (
                                    <div key={idx}>{log}</div>
                                  ))}
                                </pre>
                              </ScrollArea>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {flashHistory.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ClockCounterClockwise className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No flash history yet</p>
                    </div>
                  ) : (
                    flashHistory.map((op) => (
                      <Card key={op.id} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <DeviceMobile className="w-4 h-4 text-muted-foreground" weight="duotone" />
                              <div>
                                <div className="font-medium">
                                  {op.progress.deviceBrand} • {op.progress.deviceSerial}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {new Date(op.progress.startedAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(op.progress.status)}
                              {op.progress.status === 'completed' && (
                                <CheckCircle className="w-5 h-5 text-accent" weight="fill" />
                              )}
                              {op.progress.status === 'failed' && (
                                <XCircle className="w-5 h-5 text-destructive" weight="fill" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
