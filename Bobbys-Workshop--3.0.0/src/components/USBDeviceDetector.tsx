import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUSBDevices } from '@/hooks/use-device-detection';
import { getUSBVendorName } from '@/lib/deviceDetection';
import { Usb, Plus, ArrowClockwise, Info, Circle } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function USBDeviceDetector() {
  const { devices, loading, error, supported, isMonitoring, refresh, requestDevice } = useUSBDevices();

  const handleRequestDevice = async () => {
    const device = await requestDevice();
    if (device) {
      toast.success(`Device added: ${device.productName || 'Unknown Device'}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Usb size={20} className="text-primary" />
            <CardTitle>USB Devices</CardTitle>
            {isMonitoring && (
              <div className="flex items-center gap-1.5 text-xs text-green-600">
                <Circle size={8} weight="fill" className="animate-pulse" />
                <span className="hidden sm:inline">Live Monitoring</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading || !supported}
            >
              <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleRequestDevice}
              disabled={!supported}
            >
              <Plus size={16} />
              Add Device
            </Button>
          </div>
        </div>
        <CardDescription>
          WebUSB API for real-time hardware detection {isMonitoring && '• Live notifications enabled'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!supported && (
          <Alert>
            <Info size={16} />
            <AlertDescription>
              WebUSB is not supported in this browser. Try Chrome, Edge, or Opera.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {supported && (
          <>
            {loading && devices.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <ArrowClockwise size={24} className="animate-spin mr-2" />
                Scanning for USB devices...
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Usb size={48} className="mx-auto mb-2 opacity-50" />
                <p>No USB devices detected</p>
                <p className="text-xs mt-1">Click "Add Device" to grant access to a USB device</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Usb size={20} className="text-primary mt-0.5" />
                        <Circle 
                          size={8} 
                          weight="fill" 
                          className="absolute -top-1 -right-1 text-green-500 animate-pulse" 
                        />
                      </div>
                      <div>
                        <div className="font-medium">
                          {device.productName || 'Unknown Device'}
                        </div>
                        {device.manufacturerName && (
                          <div className="text-sm text-muted-foreground">
                            {device.manufacturerName}
                          </div>
                        )}
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground font-mono">
                          <span>VID: 0x{device.vendorId.toString(16).padStart(4, '0')}</span>
                          <span>PID: 0x{device.productId.toString(16).padStart(4, '0')}</span>
                        </div>
                        {device.serialNumber && (
                          <div className="text-xs text-muted-foreground font-mono mt-1">
                            Serial: {device.serialNumber}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline">
                        {getUSBVendorName(device.vendorId)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Connected
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
