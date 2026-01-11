import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAllDevices } from '@/hooks/use-device-detection';
import { ArrowClockwise, CheckCircle, XCircle, Usb, Broadcast, Wrench } from '@phosphor-icons/react';

export function BobbyDevArsenalDashboard() {
  const { systemTools, usbDevices, networkDevices, isLoading, refreshAll } = useAllDevices();

  const totalDevices = systemTools.tools.filter(t => t.installed).length + 
                       usbDevices.devices.length + 
                       networkDevices.devices.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wrench size={24} className="text-primary" />
              <CardTitle className="text-2xl">Arsenal Status</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Complete device detection overview
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={isLoading}
          >
            <ArrowClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wrench size={20} className="text-primary" />
                <h3 className="font-semibold">System Tools</h3>
              </div>
              <Badge variant="secondary">
                {systemTools.tools.filter(t => t.installed).length}/{systemTools.tools.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {systemTools.tools.slice(0, 5).map((tool) => (
                <div key={tool.name} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{tool.name}</span>
                  {tool.installed ? (
                    <CheckCircle size={16} className="text-green-500" weight="fill" />
                  ) : (
                    <XCircle size={16} className="text-red-500" weight="fill" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Usb size={20} className="text-primary" />
                <h3 className="font-semibold">USB Devices</h3>
              </div>
              <Badge variant="secondary">{usbDevices.devices.length}</Badge>
            </div>
            {usbDevices.supported ? (
              <div className="space-y-2">
                {usbDevices.devices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No devices detected</p>
                ) : (
                  usbDevices.devices.slice(0, 3).map((device) => (
                    <div key={device.id} className="text-sm truncate">
                      {device.productName || 'Unknown Device'}
                    </div>
                  ))
                )}
                {usbDevices.isMonitoring && (
                  <Badge variant="outline" className="text-xs">Live Monitoring</Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">WebUSB not supported</p>
            )}
          </div>

          <div className="rounded-lg border p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Broadcast size={20} className="text-primary" />
                <h3 className="font-semibold">Network</h3>
              </div>
              <Badge variant="secondary">{networkDevices.devices.length}</Badge>
            </div>
            <div className="space-y-2">
              {networkDevices.devices.length === 0 ? (
                <p className="text-sm text-muted-foreground">Click scan to discover</p>
              ) : (
                networkDevices.devices.slice(0, 3).map((device) => (
                  <div key={device.ip} className="text-sm font-mono truncate">
                    {device.ip}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total devices detected: <span className="font-semibold text-foreground">{totalDevices}</span>
          </div>
          {usbDevices.isMonitoring && (
            <Badge variant="default" className="text-xs">Real-time monitoring active</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
