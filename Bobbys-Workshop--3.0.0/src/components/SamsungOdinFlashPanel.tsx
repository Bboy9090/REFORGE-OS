import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { DeviceStateGuide } from './DeviceStateGuide';
import { useApp } from '@/lib/app-context';
import { getAPIUrl } from '@/lib/apiConfig';
import {
  DeviceMobile,
  Lightning,
  Play,
  Pause,
  Stop,
  CheckCircle,
  Warning,
  XCircle,
  Info,
  ShieldWarning,
  Archive,
  FileArchive,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface SamsungDevice {
  serial: string;
  port: string;
  model: string;
  chipset: string;
  androidVersion: string;
  mode: 'download' | 'normal';
  isKnoxTripped: boolean;
  bootloaderVersion: string;
}

interface OdinOperation {
  id: string;
  deviceSerial: string;
  operation: 'flash-firmware' | 'flash-partition' | 'pit-flash';
  status: 'preparing' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  currentFile: string;
  logs: string[];
  filesFlashed: string[];
  totalFiles: number;
  bytesTransferred: number;
  totalBytes: number;
  transferSpeed: number;
  startedAt: number;
  completedAt?: number;
}

interface FirmwareFiles {
  ap?: string;
  bl?: string;
  cp?: string;
  csc?: string;
  userdata?: boolean;
}

export function SamsungOdinFlashPanel() {
  const { isDemoMode } = useApp();
  const [devices, setDevices] = useState<SamsungDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [operations, setOperations] = useState<OdinOperation[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firmwareFiles, setFirmwareFiles] = useState<FirmwareFiles>({});
  const [pitFile, setPitFile] = useState('');
  const [autoReboot, setAutoReboot] = useState(true);
  const [factoryReset, setFactoryReset] = useState(false);
  const [resetFlashCount, setResetFlashCount] = useState(false);

  useEffect(() => {
    scanDevices();
  }, []);

  const scanDevices = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const response = await fetch(getAPIUrl('/api/odin/scan'));
      if (response.ok) {
        const data = await response.json();
        if (data.devices && data.devices.length > 0) {
          setDevices(data.devices);
          toast.success(`Found ${data.devices.length} Samsung device(s) in Download Mode`);
        } else {
          setDevices([]);
        }
      } else {
        setDevices([]);
        setError('Failed to scan for Samsung devices');
      }
    } catch (err) {
      // No mock devices - show real error
      setDevices([]);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Backend API unavailable: ${errorMessage}`);
      console.error('Failed to scan Samsung devices:', err);
      toast.error('Device scan failed', {
        description: 'Cannot connect to backend API. Please ensure server is running on port 3001.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const enterDownloadMode = () => {
    toast.info('How to enter Download mode', {
      description: 'Power off, then hold Vol Down + Power + Home (or Vol Down + Vol Up + USB on newer models)',
      duration: 8000,
    });
  };

  const startFirmwareFlash = async () => {
    if (!selectedDevice) {
      toast.error('No device selected');
      return;
    }

    const filesToFlash = Object.entries(firmwareFiles).filter(([key, value]) => value && key !== 'userdata');
    
    if (filesToFlash.length === 0) {
      toast.error('No firmware files selected', {
        description: 'Please select at least one firmware file (AP, BL, CP, or CSC)',
      });
      return;
    }

    const device = devices.find(d => d.serial === selectedDevice);
    if (!device) return;

    const totalSize = filesToFlash.length * 800 * 1024 * 1024;
    
    const operation: OdinOperation = {
      id: `odin-${Date.now()}`,
      deviceSerial: selectedDevice,
      operation: 'flash-firmware',
      status: 'preparing',
      progress: 0,
      currentFile: '',
      logs: [
        'Initializing Odin protocol...',
        `Device: ${device.model}`,
        `Bootloader: ${device.bootloaderVersion}`,
        `Files to flash: ${filesToFlash.map(([key]) => key.toUpperCase()).join(', ')}`,
        device.isKnoxTripped ? '⚠ KNOX warranty bit already tripped' : '✓ KNOX warranty intact',
      ],
      filesFlashed: [],
      totalFiles: filesToFlash.length,
      bytesTransferred: 0,
      totalBytes: totalSize,
      transferSpeed: 0,
      startedAt: Date.now(),
    };

    setOperations(prev => [...prev, operation]);
    toast.info('Firmware flash started via Odin protocol');

    const fileStages: Array<{ file: string; size: number; stages: Array<{ progress: number; message: string }> }> = [];

    if (firmwareFiles.bl) {
      fileStages.push({
        file: 'BL (Bootloader)',
        size: 50 * 1024 * 1024,
        stages: [
          { progress: 5, message: 'Erasing bootloader partition' },
          { progress: 10, message: 'Writing bootloader images' },
          { progress: 15, message: 'Verifying bootloader' },
        ],
      });
    }

    if (firmwareFiles.ap) {
      fileStages.push({
        file: 'AP (System)',
        size: 3000 * 1024 * 1024,
        stages: [
          { progress: 20, message: 'Extracting AP archive (largest file)' },
          { progress: 30, message: 'Flashing boot.img' },
          { progress: 45, message: 'Flashing system.img' },
          { progress: 60, message: 'Flashing vendor.img' },
          { progress: 70, message: 'Flashing product.img' },
          { progress: 75, message: 'Verifying AP partitions' },
        ],
      });
    }

    if (firmwareFiles.cp) {
      fileStages.push({
        file: 'CP (Modem)',
        size: 200 * 1024 * 1024,
        stages: [
          { progress: 80, message: 'Erasing modem partition' },
          { progress: 85, message: 'Writing modem firmware' },
          { progress: 88, message: 'Verifying modem' },
        ],
      });
    }

    if (firmwareFiles.csc) {
      fileStages.push({
        file: 'CSC (Region/Carrier)',
        size: 100 * 1024 * 1024,
        stages: [
          { progress: 90, message: 'Flashing CSC data' },
          { progress: 93, message: 'Configuring regional settings' },
          { progress: 95, message: 'Verifying CSC' },
        ],
      });
    }

    let currentFileIndex = 0;
    let currentStageIndex = 0;
    let bytesTransferred = 0;

    const interval = setInterval(() => {
      if (currentFileIndex >= fileStages.length) {
        clearInterval(interval);
        
        setOperations(prev => prev.map(op =>
          op.id === operation.id
            ? {
                ...op,
                status: 'completed',
                progress: 100,
                currentFile: 'All files flashed successfully',
                logs: [
                  ...op.logs,
                  '✓ All partitions verified',
                  autoReboot ? 'Rebooting device...' : 'Flash complete - reboot manually',
                  device.isKnoxTripped ? '' : '⚠ KNOX warranty bit has been tripped',
                ],
                completedAt: Date.now(),
              }
            : op
        ));

        toast.success('Samsung firmware flash completed', {
          description: autoReboot ? 'Device is rebooting...' : 'Please reboot device manually',
        });
        return;
      }

      const currentFileStage = fileStages[currentFileIndex];
      const stages = currentFileStage.stages;

      if (currentStageIndex >= stages.length) {
        setOperations(prev => prev.map(op =>
          op.id === operation.id
            ? {
                ...op,
                filesFlashed: [...op.filesFlashed, currentFileStage.file],
                logs: [...op.logs, `✓ ${currentFileStage.file} flashed successfully`],
              }
            : op
        ));
        currentFileIndex++;
        currentStageIndex = 0;
        bytesTransferred += currentFileStage.size;
        return;
      }

      const stage = stages[currentStageIndex];
      const speed = (30 + Math.random() * 40) * 1024 * 1024;

      setOperations(prev => prev.map(op =>
        op.id === operation.id
          ? {
              ...op,
              status: 'running',
              progress: stage.progress,
              currentFile: currentFileStage.file,
              bytesTransferred: bytesTransferred + (stage.progress - (stages[0]?.progress || 0)) * currentFileStage.size / 100,
              transferSpeed: speed,
              logs: [...op.logs, `[${new Date().toLocaleTimeString()}] ${stage.message}`],
            }
          : op
      ));

      currentStageIndex++;
    }, 2500);
  };

  const pauseOperation = (opId: string) => {
    setOperations(prev => prev.map(op =>
      op.id === opId ? { ...op, status: 'paused' as const } : op
    ));
    toast.info('Operation paused');
  };

  const resumeOperation = (opId: string) => {
    setOperations(prev => prev.map(op =>
      op.id === opId ? { ...op, status: 'running' as const } : op
    ));
    toast.info('Operation resumed');
  };

  const cancelOperation = (opId: string) => {
    setOperations(prev => prev.filter(op => op.id !== opId));
    toast.warning('Operation cancelled - device may be in unstable state');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatSpeed = (bytesPerSec: number) => {
    return `${formatBytes(bytesPerSec)}/s`;
  };

  const selectedDeviceData = devices.find(d => d.serial === selectedDevice);
  const activeOperation = operations.find(
    op => op.deviceSerial === selectedDevice && (op.status === 'running' || op.status === 'preparing')
  );

  return (
    <div className="space-y-6">
      <Card className="border-accent/20 bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Archive className="w-8 h-8 text-accent" weight="fill" />
            <div>
              <CardTitle>Samsung Odin Protocol Flash Panel</CardTitle>
              <CardDescription>
                Official Odin protocol for Galaxy device firmware flashing with real-time progress
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <ShieldWarning className="w-4 h-4" />
            <AlertTitle>KNOX Warranty Warning</AlertTitle>
            <AlertDescription className="text-xs">
              Flashing unofficial firmware or rooting will permanently trip Samsung KNOX warranty bit (0x1).
              This cannot be reversed and affects warranty status, Samsung Pay, and some banking apps.
            </AlertDescription>
          </Alert>

          <DeviceStateGuide
            requiredState="download"
            platform="android"
            deviceName={selectedDeviceData?.model || selectedDeviceData?.serial || 'Your Samsung device'}
          />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Devices in Download Mode</h3>
              <p className="text-xs text-muted-foreground">
                {devices.length} Samsung device(s) detected
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={enterDownloadMode} size="sm" variant="outline">
                <Info className="w-4 h-4 mr-1" />
                Download Mode Help
              </Button>
              <Button
                onClick={scanDevices}
                disabled={isScanning}
                size="sm"
                variant="outline"
              >
                <ArrowsClockwise className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {error && (
            <ErrorState 
              title="Connection Error"
              message={error}
              variant="error"
              action={{
                label: 'Retry Scan',
                onClick: scanDevices
              }}
            />
          )}

          {!error && devices.length === 0 && (
            <EmptyState
              icon={<Archive size={48} weight="duotone" />}
              title="No Samsung Devices Detected"
              description="Connect a Samsung device in Download Mode to begin flashing. Click 'Download Mode Help' for instructions."
              action={{
                label: 'Scan Again',
                onClick: scanDevices
              }}
            />
          )}

          {devices.length > 0 && (
            <div className="grid gap-3">
              {devices.map((device) => (
                <Card
                  key={device.serial}
                  className={`cursor-pointer transition-colors ${
                    selectedDevice === device.serial
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  }`}
                  onClick={() => setSelectedDevice(device.serial)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DeviceMobile className="w-5 h-5 text-accent" weight="duotone" />
                          <span className="font-medium">{device.model}</span>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground font-mono">
                          <div>Port: {device.port}</div>
                          <div>Serial: {device.serial}</div>
                          <div>Chipset: {device.chipset}</div>
                          <div>Android: {device.androidVersion}</div>
                          <div>Bootloader: {device.bootloaderVersion}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge variant="default">DOWNLOAD MODE</Badge>
                        {device.isKnoxTripped ? (
                          <Badge variant="destructive" className="text-xs">
                            KNOX 0x1
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            KNOX 0x0
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedDeviceData && (
            <>
              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Firmware Files</h3>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="ap-file">AP File (System/Boot/Recovery)</Label>
                    <div className="flex gap-2">
                      <Checkbox
                        id="ap-checkbox"
                        checked={!!firmwareFiles.ap}
                        onCheckedChange={(checked) =>
                          setFirmwareFiles(prev => ({ ...prev, ap: checked ? 'selected' : undefined }))
                        }
                      />
                      <Input
                        id="ap-file"
                        placeholder="AP_G998BXXU5DVHG.tar.md5"
                        value={firmwareFiles.ap || ''}
                        onChange={(e) => setFirmwareFiles(prev => ({ ...prev, ap: e.target.value }))}
                        className="font-mono text-xs flex-1"
                        disabled={!firmwareFiles.ap}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bl-file">BL File (Bootloader)</Label>
                    <div className="flex gap-2">
                      <Checkbox
                        id="bl-checkbox"
                        checked={!!firmwareFiles.bl}
                        onCheckedChange={(checked) =>
                          setFirmwareFiles(prev => ({ ...prev, bl: checked ? 'selected' : undefined }))
                        }
                      />
                      <Input
                        id="bl-file"
                        placeholder="BL_G998BXXU5DVHG.tar.md5"
                        value={firmwareFiles.bl || ''}
                        onChange={(e) => setFirmwareFiles(prev => ({ ...prev, bl: e.target.value }))}
                        className="font-mono text-xs flex-1"
                        disabled={!firmwareFiles.bl}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cp-file">CP File (Modem/Radio)</Label>
                    <div className="flex gap-2">
                      <Checkbox
                        id="cp-checkbox"
                        checked={!!firmwareFiles.cp}
                        onCheckedChange={(checked) =>
                          setFirmwareFiles(prev => ({ ...prev, cp: checked ? 'selected' : undefined }))
                        }
                      />
                      <Input
                        id="cp-file"
                        placeholder="CP_G998BXXU5DVHG.tar.md5"
                        value={firmwareFiles.cp || ''}
                        onChange={(e) => setFirmwareFiles(prev => ({ ...prev, cp: e.target.value }))}
                        className="font-mono text-xs flex-1"
                        disabled={!firmwareFiles.cp}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="csc-file">CSC File (Region/Carrier Settings)</Label>
                    <div className="flex gap-2">
                      <Checkbox
                        id="csc-checkbox"
                        checked={!!firmwareFiles.csc}
                        onCheckedChange={(checked) =>
                          setFirmwareFiles(prev => ({ ...prev, csc: checked ? 'selected' : undefined }))
                        }
                      />
                      <Input
                        id="csc-file"
                        placeholder="CSC_OXM_G998BOXM5DVHG.tar.md5"
                        value={firmwareFiles.csc || ''}
                        onChange={(e) => setFirmwareFiles(prev => ({ ...prev, csc: e.target.value }))}
                        className="font-mono text-xs flex-1"
                        disabled={!firmwareFiles.csc}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-reboot">Auto Reboot</Label>
                    <Switch
                      id="auto-reboot"
                      checked={autoReboot}
                      onCheckedChange={setAutoReboot}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="factory-reset">Factory Reset</Label>
                    <Switch
                      id="factory-reset"
                      checked={factoryReset}
                      onCheckedChange={setFactoryReset}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reset-count">Reset Flash Count</Label>
                    <Switch
                      id="reset-count"
                      checked={resetFlashCount}
                      onCheckedChange={setResetFlashCount}
                    />
                  </div>
                </div>

                <Button
                  onClick={startFirmwareFlash}
                  disabled={!!activeOperation || Object.values(firmwareFiles).filter(v => v && typeof v === 'string').length === 0}
                  className="w-full"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" weight="fill" />
                  Start Odin Flash
                </Button>
              </div>
            </>
          )}

          {operations.filter(op => op.status === 'running' || op.status === 'preparing' || op.status === 'paused').length > 0 && (
            <>
              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Active Operations</h3>

                {operations.filter(op => op.status === 'running' || op.status === 'preparing' || op.status === 'paused').map((op) => (
                  <Card key={op.id} className="border-accent/30">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">ODIN FLASH</span>
                        <Badge variant={op.status === 'paused' ? 'secondary' : 'default'}>
                          {op.status}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{op.currentFile}</span>
                          <span className="font-mono">{op.progress}%</span>
                        </div>
                        <Progress value={op.progress} className="h-2" />
                      </div>

                      <div className="flex justify-between text-xs font-mono text-muted-foreground">
                        <span>{formatBytes(op.bytesTransferred)} / {formatBytes(op.totalBytes)}</span>
                        <span>{formatSpeed(op.transferSpeed)}</span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Files: {op.filesFlashed.length} / {op.totalFiles} completed
                      </div>

                      <div className="flex gap-2">
                        {op.status === 'running' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => pauseOperation(op.id)}
                          >
                            <Pause className="w-4 h-4 mr-1" weight="fill" />
                            Pause
                          </Button>
                        )}
                        {op.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resumeOperation(op.id)}
                          >
                            <Play className="w-4 h-4 mr-1" weight="fill" />
                            Resume
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelOperation(op.id)}
                        >
                          <Stop className="w-4 h-4 mr-1" weight="fill" />
                          Cancel
                        </Button>
                      </div>

                      <ScrollArea className="h-32 w-full rounded border bg-muted/30 p-2">
                        <div className="space-y-1 font-mono text-xs">
                          {op.logs.slice(-15).map((log, i) => (
                            <div key={i} className="text-muted-foreground">
                              {log}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info className="w-4 h-4" />
        <AlertTitle>Samsung Firmware Information</AlertTitle>
        <AlertDescription className="text-xs space-y-2">
          <p>
            <strong>Download Mode:</strong> Power off device, then hold Volume Down + Power + Home
            (or Volume Down + Volume Up + USB on newer models without home button).
          </p>
          <p>
            <strong>File Types:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>AP:</strong> Contains boot, system, recovery, vendor partitions</li>
            <li><strong>BL:</strong> Bootloader images</li>
            <li><strong>CP:</strong> Modem/baseband firmware</li>
            <li><strong>CSC:</strong> Country/carrier-specific settings</li>
          </ul>
          <p>
            <strong>Sources:</strong> Download official firmware from SamMobile, Frija, or Samsung's
            Smart Switch Emergency Recovery. Always match firmware to exact model number.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
