import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CorrelationBadgeDisplay } from './CorrelationBadgeDisplay';
import { BootForgeUSBInstallGuide } from './BootForgeUSBInstallGuide';
import { useCorrelationTracking } from '@/hooks/use-correlation-tracking';
import { getAPIUrl } from '@/lib/apiConfig';
import type { CorrelationBadge } from '@/types/correlation';
import { 
  MagnifyingGlass, 
  CheckCircle, 
  XCircle, 
  Warning, 
  DeviceMobile,
  Lightning,
  CircleNotch,
  Gauge,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface USBEvidence {
  vid: string;
  pid: string;
  manufacturer: string | null;
  product: string | null;
  serial: string | null;
  bus: number;
  address: number;
  interface_hints: Array<{
    class: number;
    subclass: number;
    protocol: number;
  }>;
}

interface ToolProbe {
  present: boolean;
  seen: boolean;
  raw: string;
  device_ids: string[];
}

interface ToolsEvidence {
  adb: ToolProbe;
  fastboot: ToolProbe;
  idevice_id: ToolProbe;
}

interface DeviceRecord {
  device_uid: string;
  platform_hint: string;
  mode: string;
  confidence: number;
  evidence: {
    usb: USBEvidence;
    tools: ToolsEvidence;
  };
  notes: string[];
  matched_tool_ids: string[];
  correlation_badge?: CorrelationBadge;
  correlation_notes?: string[];
}

interface ScanResponse {
  success: boolean;
  count: number;
  devices: DeviceRecord[];
  timestamp: string;
  available: boolean;
  error?: string;
  message?: string;
  demo?: boolean;
}

interface StatusResponse {
  available: boolean;
  cli: {
    installed: boolean;
    command: string;
  };
  buildEnvironment: {
    rust: boolean;
    cargo: boolean;
    canBuild: boolean;
  };
  library: {
    path: string;
    version: string;
  } | null;
  systemTools: {
    adb: boolean;
    fastboot: boolean;
    idevice_id: boolean;
  };
  timestamp: string;
}

function getPlatformColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'ios':
      return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
    case 'android':
      return 'bg-green-600/20 text-green-300 border-green-500/30';
    default:
      return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
  }
}

function getModeColor(mode: string): string {
  if (mode.includes('confirmed')) {
    return 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30';
  } else if (mode.includes('likely')) {
    return 'bg-amber-600/20 text-amber-300 border-amber-500/30';
  }
  return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
}

function getConfidenceBadge(confidence: number) {
  if (confidence >= 0.90) {
    return <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30">High Confidence</Badge>;
  } else if (confidence >= 0.75) {
    return <Badge className="bg-amber-600/20 text-amber-300 border-amber-500/30">Medium Confidence</Badge>;
  }
  return <Badge className="bg-rose-600/20 text-rose-300 border-rose-500/30">Low Confidence</Badge>;
}

function deriveCorrelationBadge(device: DeviceRecord): CorrelationBadge {
  if (device.correlation_badge) {
    return device.correlation_badge;
  }
  
  const hasMatchedIds = device.matched_tool_ids.length > 0;
  const mode = device.mode.toLowerCase();
  const confidence = device.confidence;
  
  if (hasMatchedIds) {
    if (mode.includes('confirmed') && confidence >= 0.90) {
      return 'CORRELATED';
    }
    return 'CORRELATED (WEAK)';
  }
  
  if (mode.includes('confirmed') && confidence >= 0.90) {
    return 'SYSTEM-CONFIRMED';
  }
  
  if (mode.includes('likely')) {
    return 'LIKELY';
  }
  
  return 'UNCONFIRMED';
}

export function BootForgeUSBScanner() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const { updateDevice, isTracking } = useCorrelationTracking();

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getAPIUrl('/api/bootforgeusb/status'));
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: StatusResponse = await res.json();
      setStatus(data);
      
      if (data.available) {
        await scanDevices();
      }
    } catch (err: any) {
      setError(`Backend API unavailable: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function scanDevices(forceReal = false) {
    setScanning(true);
    setError(null);
    setIsDemoMode(false);
    try {
      const useDemoFallback = !forceReal;
      const res = await fetch(getAPIUrl(`/api/bootforgeusb/scan${useDemoFallback ? '?demo=true' : ''}`));
      const data: ScanResponse = await res.json();
      
      if (!res.ok) {
        if (res.status === 503) {
          setError(data.message || 'BootForgeUSB CLI not installed');
          setDevices([]);
        }
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      
      if (data.demo) {
        setIsDemoMode(true);
        setError('⚠️ Demo Mode: Showing sample data. Install BootForgeUSB CLI to scan real USB devices connected to your system.');
      }
      
      setDevices(data.devices || []);
      
      if (isTracking && data.devices && data.devices.length > 0) {
        data.devices.forEach((device) => {
          const correlationBadge = deriveCorrelationBadge(device);
          updateDevice(device.device_uid, {
            id: device.device_uid,
            serial: device.evidence.usb.serial || undefined,
            platform: device.platform_hint,
            mode: device.mode,
            confidence: device.confidence,
            correlationBadge,
            correlationNotes: device.correlation_notes || [],
            vendorId: parseInt(device.evidence.usb.vid, 16),
            productId: parseInt(device.evidence.usb.pid, 16),
          });
        });
        toast.success(`Updated ${data.devices.length} devices in correlation tracker`);
      }
    } catch (err: any) {
      setError(`Scan failed: ${err.message}`);
      setDevices([]);
    } finally {
      setScanning(false);
    }
  }

  const selectedDeviceData = devices.find(d => d.device_uid === selectedDevice);

  return (
    <div className="grid gap-6">
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Lightning className="w-5 h-5 text-primary" weight="duotone" />
              BootForgeUSB Device Scanner
              {isTracking && (
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  Live Tracking Active
                </Badge>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Advanced USB device detection with iOS/Android classification
              {isTracking && ' • Feeding correlation tracker'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BootForgeUSBInstallGuide />
            <Button
              onClick={checkStatus}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <CircleNotch className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowsClockwise className="w-4 h-4" />
              )}
              Refresh Status
            </Button>
            {status?.cli.installed ? (
              <Button
                onClick={() => scanDevices(true)}
                disabled={scanning}
                size="sm"
              >
                {scanning ? (
                  <CircleNotch className="w-4 h-4 animate-spin" />
                ) : (
                  <MagnifyingGlass className="w-4 h-4" />
                )}
                Scan Real Devices
              </Button>
            ) : (
              <Button
                onClick={() => scanDevices(false)}
                disabled={scanning}
                size="sm"
                variant="secondary"
              >
                {scanning ? (
                  <CircleNotch className="w-4 h-4 animate-spin" />
                ) : (
                  <MagnifyingGlass className="w-4 h-4" />
                )}
                View Demo Data
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert className={`mb-4 ${isDemoMode ? 'border-amber-500/30 bg-amber-600/10' : 'border-rose-500/30 bg-rose-600/10'}`}>
            <Warning className={`w-4 h-4 ${isDemoMode ? 'text-amber-400' : 'text-rose-400'}`} />
            <AlertDescription className={`${isDemoMode ? 'text-amber-300' : 'text-rose-300'} space-y-2`}>
              <div>{error}</div>
              {isDemoMode && status && !status.cli.installed && (
                <div className="text-xs space-y-1 mt-2">
                  <div className="font-semibold">To scan real USB devices:</div>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Install Rust toolchain: <code className="bg-black/20 px-1 rounded">curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh</code></li>
                    <li>Build BootForgeUSB CLI: <code className="bg-black/20 px-1 rounded">cd libs/bootforgeusb && cargo install --path .</code></li>
                    <li>Connect your Android or iOS device via USB</li>
                    <li>Click "Scan Real Devices" button below</li>
                  </ol>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 rounded-lg border border-border bg-muted/20">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">CLI Status</div>
                <div className="flex items-center gap-2">
                  {status.cli.installed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" weight="fill" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" weight="fill" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {status.cli.installed ? 'Installed' : 'Not Found'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Rust Toolchain</div>
                <div className="flex items-center gap-2">
                  {status.buildEnvironment.rust ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" weight="fill" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" weight="fill" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {status.buildEnvironment.rust ? 'Ready' : 'Missing'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">ADB</div>
                <div className="flex items-center gap-2">
                  {status.systemTools.adb ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" weight="fill" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" weight="fill" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {status.systemTools.adb ? 'Available' : 'Not Found'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Fastboot</div>
                <div className="flex items-center gap-2">
                  {status.systemTools.fastboot ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" weight="fill" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" weight="fill" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {status.systemTools.fastboot ? 'Available' : 'Not Found'}
                  </span>
                </div>
              </div>
            </div>

            {!status.cli.installed && (
              <Card className="p-4 mb-6 border-blue-500/30 bg-blue-600/10">
                <div className="flex items-start gap-3">
                  <Lightning className="w-5 h-5 text-blue-400 mt-0.5" weight="duotone" />
                  <div className="flex-1 space-y-2">
                    <h3 className="text-sm font-semibold text-blue-300">Connect Real USB Devices</h3>
                    <p className="text-xs text-blue-300/80">
                      Install BootForgeUSB CLI to scan actual USB devices connected to your computer. This enables:
                    </p>
                    <ul className="text-xs text-blue-300/80 space-y-1 list-disc list-inside ml-2">
                      <li>Real-time USB device detection and classification</li>
                      <li>Android/iOS platform identification via USB signatures</li>
                      <li>Correlation with ADB, Fastboot, and iOS tools</li>
                      <li>Device mode detection (Normal OS, Fastboot, Recovery, DFU)</li>
                    </ul>
                    {!status.buildEnvironment.canBuild && (
                      <div className="bg-amber-600/20 border border-amber-500/30 rounded p-2 mt-2">
                        <p className="text-xs text-amber-300">
                          <strong>Prerequisites needed:</strong> Install Rust toolchain first to build BootForgeUSB CLI
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        <Separator className="my-4" />

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <DeviceMobile className="w-5 h-5 text-primary" weight="duotone" />
            {isDemoMode ? 'Demo Devices' : 'Detected Devices'} ({devices.length})
            {isDemoMode && (
              <Badge variant="outline" className="text-xs bg-amber-600/20 text-amber-300 border-amber-500/30">
                DEMO MODE
              </Badge>
            )}
            {!isDemoMode && devices.length > 0 && status?.cli.installed && (
              <Badge variant="outline" className="text-xs bg-emerald-600/20 text-emerald-300 border-emerald-500/30">
                LIVE USB SCAN
              </Badge>
            )}
          </h3>
          {devices.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Last scan: {new Date().toLocaleTimeString()}
            </Badge>
          )}
        </div>

        {devices.length === 0 && !scanning && (
          <div className="text-center py-12">
            <DeviceMobile className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">No devices detected</p>
            {status?.cli.installed ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">Connect a USB device and click "Scan Real Devices"</p>
                <div className="max-w-md mx-auto text-left bg-muted/20 rounded-lg p-4 text-xs text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground">For Android devices:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Enable Developer Options on your device</li>
                    <li>Enable USB Debugging in Developer Options</li>
                    <li>Connect via USB cable</li>
                    <li>Accept "Allow USB debugging" prompt on device</li>
                  </ol>
                  <p className="font-semibold text-foreground mt-3">For iOS devices:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Connect via USB cable</li>
                    <li>Tap "Trust" on the device prompt</li>
                  </ol>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">Install BootForgeUSB CLI to scan USB devices</p>
            )}
          </div>
        )}

        <div className="grid gap-3">
          {devices.map((device) => {
            const correlationBadge = deriveCorrelationBadge(device);
            
            return (
            <Card
              key={device.device_uid}
              className={`p-4 border transition-all cursor-pointer hover:border-primary/50 ${
                selectedDevice === device.device_uid ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setSelectedDevice(device.device_uid === selectedDevice ? null : device.device_uid)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className={getPlatformColor(device.platform_hint)}>
                      {device.platform_hint.toUpperCase()}
                    </Badge>
                    <Badge className={getModeColor(device.mode)}>
                      {device.mode.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    {getConfidenceBadge(device.confidence)}
                  </div>
                  
                  <div className="mb-3">
                    <CorrelationBadgeDisplay 
                      badge={correlationBadge}
                      matchedIds={device.matched_tool_ids}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">VID:PID:</span>{' '}
                      <span className="font-mono text-foreground">{device.evidence.usb.vid}:{device.evidence.usb.pid}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bus:</span>{' '}
                      <span className="font-mono text-foreground">{device.evidence.usb.bus}</span>{' '}
                      <span className="text-muted-foreground">Addr:</span>{' '}
                      <span className="font-mono text-foreground">{device.evidence.usb.address}</span>
                    </div>
                    {device.evidence.usb.manufacturer && (
                      <div>
                        <span className="text-muted-foreground">Manufacturer:</span>{' '}
                        <span className="text-foreground">{device.evidence.usb.manufacturer}</span>
                      </div>
                    )}
                    {device.evidence.usb.product && (
                      <div>
                        <span className="text-muted-foreground">Product:</span>{' '}
                        <span className="text-foreground">{device.evidence.usb.product}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <Gauge className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Confidence: {(device.confidence * 100).toFixed(0)}%
                    </span>
                    {device.matched_tool_ids.length > 0 && (
                      <>
                        <Separator orientation="vertical" className="h-3" />
                        <CheckCircle className="w-3 h-3 text-emerald-400" weight="fill" />
                        <span className="text-xs text-emerald-400">
                          Correlated via {device.matched_tool_ids.length} tool ID(s)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {selectedDevice === device.device_uid && (
                <>
                  <Separator className="my-4" />
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {device.correlation_notes && device.correlation_notes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Correlation Analysis</h4>
                          <ul className="space-y-1">
                            {device.correlation_notes.map((note, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-accent">•</span>
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Classification Notes</h4>
                        <ul className="space-y-1">
                          {device.notes.map((note, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Tool Evidence</h4>
                        <div className="grid gap-2">
                          {Object.entries(device.evidence.tools).map(([tool, probe]) => (
                            <div key={tool} className="p-2 rounded border border-border bg-muted/10">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-foreground uppercase">{tool}</span>
                                <div className="flex items-center gap-2">
                                  {probe.present ? (
                                    <Badge className="text-xs bg-emerald-600/20 text-emerald-300 border-emerald-500/30">
                                      Present
                                    </Badge>
                                  ) : (
                                    <Badge className="text-xs bg-gray-600/20 text-gray-300 border-gray-500/30">
                                      Missing
                                    </Badge>
                                  )}
                                  {probe.seen && (
                                    <Badge className="text-xs bg-blue-600/20 text-blue-300 border-blue-500/30">
                                      Device Seen
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {probe.device_ids.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  IDs: {probe.device_ids.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">USB Interfaces</h4>
                        <div className="space-y-1">
                          {device.evidence.usb.interface_hints.map((iface, idx) => (
                            <div key={idx} className="text-xs font-mono text-muted-foreground">
                              Class: {iface.class.toString(16).padStart(2, '0')} | 
                              Subclass: {iface.subclass.toString(16).padStart(2, '0')} | 
                              Protocol: {iface.protocol.toString(16).padStart(2, '0')}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Device UID</h4>
                        <code className="text-xs font-mono text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                          {device.device_uid}
                        </code>
                      </div>
                    </div>
                  </ScrollArea>
                </>
              )}
            </Card>
          );
          })}
        </div>
      </Card>
    </div>
  );
}
