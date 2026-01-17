import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CorrelationBadgeDisplay } from './CorrelationBadgeDisplay';
import type { CorrelationBadge } from '@/types/correlation';
import {
  DeviceMobile,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Usb,
  Lightning,
  Circle,
  CircleDashed,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:3001';

interface USBEvidence {
  vid: string;
  pid: string;
  manufacturer: string | null;
  product: string | null;
  serial: string | null;
}

interface ConnectedDevice {
  device_uid: string;
  platform_hint: string;
  mode: string;
  confidence: number;
  evidence: {
    usb: USBEvidence;
    tools: any;
  };
  matched_tool_ids: string[];
  correlation_badge?: CorrelationBadge;
  display_name?: string;
}

interface LiveDeviceSelectorProps {
  onDeviceSelected: (device: ConnectedDevice | null) => void;
  selectedDeviceId?: string | null;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function LiveDeviceSelector({
  onDeviceSelected,
  selectedDeviceId = null,
  autoRefresh = true,
  refreshInterval = 5000,
}: LiveDeviceSelectorProps) {
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const scanDevices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/bootforge/scan`);
      
      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'ok' && data.devices) {
        const connectedDevices = data.devices.map((device: any) => ({
          ...device,
          display_name: generateDeviceDisplayName(device),
        }));
        
        setDevices(connectedDevices);
        setLastScan(new Date());
        
        if (connectedDevices.length === 0) {
          toast.info('No devices detected', {
            description: 'Connect a device via USB to begin diagnostics.',
          });
        } else {
          toast.success('Device scan complete', {
            description: `Found ${connectedDevices.length} device(s)`,
          });
        }
      } else {
        throw new Error('Invalid response format from BootForge API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan devices';
      setError(errorMessage);
      toast.error('Scan failed', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceDisplayName = (device: any): string => {
    const platform = device.platform_hint || 'Unknown';
    const mode = device.mode || 'Unknown';
    const serial = device.evidence?.usb?.serial || device.device_uid?.slice(0, 8);
    const product = device.evidence?.usb?.product;
    
    if (product) {
      return `${product} (${mode})`;
    }
    
    return `${platform} Device - ${mode} (${serial})`;
  };

  const handleDeviceChange = (deviceUid: string) => {
    const selected = devices.find(d => d.device_uid === deviceUid);
    onDeviceSelected(selected || null);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-success';
    if (confidence >= 0.7) return 'text-warning';
    return 'text-muted-foreground';
  };

  useEffect(() => {
    scanDevices();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      scanDevices();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const selectedDevice = devices.find(d => d.device_uid === selectedDeviceId);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-display tracking-wide">
          Live Device Selection
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={scanDevices}
          disabled={loading}
        >
          <ArrowsClockwise className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="ml-2">Scan</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <Warning className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!error && devices.length === 0 && !loading && (
          <Alert>
            <CircleDashed className="w-4 h-4" />
            <AlertDescription>
              No devices detected. Connect a device via USB and click Scan.
            </AlertDescription>
          </Alert>
        )}

        {devices.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {devices.length} device{devices.length !== 1 ? 's' : ''} detected
              </span>
              {lastScan && (
                <span className="text-xs text-muted-foreground">
                  Last scan: {lastScan.toLocaleTimeString()}
                </span>
              )}
            </div>

            <Select onValueChange={handleDeviceChange} value={selectedDeviceId || undefined}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a device to run diagnostics" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.device_uid} value={device.device_uid}>
                    <div className="flex items-center gap-2">
                      <DeviceMobile className="w-4 h-4" weight="duotone" />
                      <span>{device.display_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedDevice && (
              <>
                <Separator />
                
                <div className="space-y-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Selected Device</span>
                    {selectedDevice.correlation_badge && (
                      <CorrelationBadgeDisplay badge={selectedDevice.correlation_badge} size="sm" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Platform:</span>
                      <div className="font-mono font-medium">{selectedDevice.platform_hint}</div>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Mode:</span>
                      <div className="font-mono font-medium">{selectedDevice.mode}</div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <div className={`font-mono font-medium ${getConfidenceColor(selectedDevice.confidence)}`}>
                        {(selectedDevice.confidence * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">USB VID:PID:</span>
                      <div className="font-mono text-xs">
                        {selectedDevice.evidence.usb.vid}:{selectedDevice.evidence.usb.pid}
                      </div>
                    </div>
                  </div>

                  {selectedDevice.matched_tool_ids && selectedDevice.matched_tool_ids.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">Correlated Tool IDs:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDevice.matched_tool_ids.map((id, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs font-mono">
                            {id}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDevice.evidence.usb.serial && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">Serial:</span>
                      <div className="font-mono text-xs mt-1 break-all">
                        {selectedDevice.evidence.usb.serial}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {loading && devices.length === 0 && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Circle className="w-5 h-5 animate-spin mr-2" />
            <span>Scanning for connected devices...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
