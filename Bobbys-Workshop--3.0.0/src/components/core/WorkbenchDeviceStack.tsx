/**
 * WorkbenchDeviceStack
 * 
 * Device list styled as a "pile" of phones on the workbench.
 * Not a sterile table - lived-in, mixed old and new.
 */

import React from 'react';
import { Smartphone, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeviceIcon, type DevicePlatform } from './DeviceIcon';

interface Device {
  serial: string;
  brand: string;
  model: string;
  state: 'connected' | 'unauthorized' | 'offline' | 'fastboot' | 'recovery';
  mode?: string;
  correlation?: 'CORRELATED' | 'LIKELY' | 'UNKNOWN';
  platform?: DevicePlatform | string;
}

interface WorkbenchDeviceStackProps {
  devices: Device[];
  onSelectDevice?: (device: Device) => void;
  selectedSerial?: string;
}

export function WorkbenchDeviceStack({ 
  devices, 
  onSelectDevice,
  selectedSerial 
}: WorkbenchDeviceStackProps) {
  if (devices.length === 0) {
    return (
      <div className="p-8 text-center text-ink-muted">
        <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-sm">No devices detected</p>
        <p className="text-xs mt-2">Connect a device via USB</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {devices.map((device) => {
        const isSelected = device.serial === selectedSerial;
        const isConnected = device.state === 'connected' || device.state === 'fastboot' || device.state === 'recovery';
        
        return (
          <div
            key={device.serial}
            onClick={() => onSelectDevice?.(device)}
            className={cn(
              "relative p-4 rounded-lg border transition-all motion-snap cursor-pointer",
              "bg-workbench-steel border-panel",
              isSelected && "border-spray-cyan glow-cyan",
              !isSelected && "hover:border-accent hover:bg-basement-concrete"
            )}
          >
            {/* Device Icon - Styled like it's on the workbench */}
            <div className="flex items-start gap-4">
              <div className={cn(
                "relative flex-shrink-0",
                isConnected ? "text-spray-cyan" : "text-ink-muted"
              )}>
                <DeviceIcon 
                  platform={device.platform || 'android'}
                  className="w-8 h-8"
                  size={32}
                />
                {isConnected && (
                  <CheckCircle2 className="w-3 h-3 absolute -top-1 -right-1 text-state-ready" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-mono text-sm text-ink-primary truncate">
                    {device.serial}
                  </h3>
                  {device.correlation && (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded font-mono",
                      device.correlation === 'CORRELATED' && "bg-spray-cyan/20 text-spray-cyan border border-spray-cyan/30",
                      device.correlation === 'LIKELY' && "bg-tape-yellow/20 text-tape-yellow border border-tape-yellow/30",
                      device.correlation === 'UNKNOWN' && "bg-ink-muted/20 text-ink-muted border border-hairline"
                    )}>
                      {device.correlation}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-ink-muted">
                  {device.brand} {device.model}
                </p>
                
                <div className="flex items-center gap-3 mt-2">
                  <span className={cn(
                    "text-xs font-mono px-2 py-0.5 rounded",
                    device.state === 'connected' && "bg-state-ready/20 text-state-ready",
                    device.state === 'fastboot' && "bg-tape-yellow/20 text-tape-yellow",
                    device.state === 'recovery' && "bg-spray-cyan/20 text-spray-cyan",
                    device.state === 'unauthorized' && "bg-state-warning/20 text-state-warning",
                    device.state === 'offline' && "bg-ink-muted/20 text-ink-muted"
                  )}>
                    {device.state.toUpperCase()}
                  </span>
                  
                  {device.mode && (
                    <span className="text-xs text-ink-muted font-mono">
                      {device.mode}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Worn edge effect */}
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-r from-transparent to-workbench-steel opacity-50" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

