import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNetworkDevices } from '@/hooks/use-device-detection';
import { Broadcast, ArrowClockwise, Desktop, Info } from '@phosphor-icons/react';

export function NetworkDeviceScanner() {
  const { devices, loading, error, scanning, scan } = useNetworkDevices();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Broadcast size={20} className="text-primary" />
            <CardTitle>Network Devices</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={scan}
            disabled={loading}
          >
            <ArrowClockwise size={16} className={scanning ? 'animate-spin' : ''} />
            {scanning ? 'Scanning...' : 'Scan Network'}
          </Button>
        </div>
        <CardDescription>
          Local network scanner for device discovery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info size={16} />
          <AlertDescription>
            Network scanning requires backend API access. Click "Scan Network" to detect devices.
          </AlertDescription>
        </Alert>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <ArrowClockwise size={24} className="animate-spin mr-2" />
            Scanning local network...
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Broadcast size={48} className="mx-auto mb-2 opacity-50" />
            <p>No network scan performed yet</p>
            <p className="text-xs mt-1">Click "Scan Network" to discover devices</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {devices.map((device) => (
              <div
                key={device.ip}
                className="rounded-lg border p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <Desktop size={20} className="text-primary mt-0.5" />
                    <div>
                      <div className="font-medium font-mono">{device.ip}</div>
                      {device.hostname && (
                        <div className="text-sm text-muted-foreground">
                          {device.hostname}
                        </div>
                      )}
                    </div>
                  </div>
                  {device.vendor && (
                    <Badge variant="outline">{device.vendor}</Badge>
                  )}
                </div>

                {device.mac && (
                  <div className="text-xs text-muted-foreground font-mono mb-2">
                    MAC: {device.mac}
                  </div>
                )}

                {device.ports && device.ports.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {device.ports.map((port) => (
                      <Badge key={port} variant="secondary" className="text-xs">
                        Port {port}
                      </Badge>
                    ))}
                  </div>
                )}

                {device.services && device.services.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Services: {device.services.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
