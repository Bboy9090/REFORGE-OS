import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { Smartphone, Usb, Wifi, Battery } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  os?: string;
  osVersion?: string;
  serialNumber?: string;
  batteryLevel?: number;
  connectionType?: 'usb' | 'wifi' | 'unknown';
  status?: 'connected' | 'offline' | 'unknown';
}

interface DevicesListProps {
  devices: Device[];
  onRefresh: () => void;
}

export const DevicesList: React.FC<DevicesListProps> = ({ devices, onRefresh }) => {
  if (devices.length === 0) {
    return (
      <EmptyState
        icon={<Smartphone className="h-12 w-12" />}
        title="No devices connected"
        description="Connect a device via USB or network to get started"
        action={{ label: 'Scan for Devices', onClick: onRefresh }}
      />
    );
  }

  const getStatusVariant = (status: Device['status']) => {
    switch (status) {
      case 'connected': return 'default';
      case 'offline': return 'destructive';
      default: return 'outline';
    }
  };

  const getModeIcon = (device: Device) => {
    if (device.connectionType === 'usb') return <Usb className="h-4 w-4" />;
    if (device.connectionType === 'wifi') return <Wifi className="h-4 w-4" />;
    return <Smartphone className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {devices.map((device) => (
        <Card key={device.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                  {getModeIcon(device)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{device.name}</h3>
                    <Badge variant={getStatusVariant(device.status)}>
                      {device.status ?? 'unknown'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[device.manufacturer, device.model].filter(Boolean).join(' ')}
                    {device.os || device.osVersion ? ` • ${[device.os, device.osVersion].filter(Boolean).join(' ')}` : ''}
                  </p>
                  {device.serialNumber && (
                    <p className="text-xs text-muted-foreground mt-1">SN: {device.serialNumber}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {device.batteryLevel !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Battery className="h-4 w-4" />
                    <span>{device.batteryLevel}%</span>
                  </div>
                )}
                <Badge variant="outline">{device.connectionType ?? 'unknown'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
