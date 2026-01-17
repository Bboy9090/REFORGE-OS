/**
 * WorkbenchDevices
 * 
 * Device pile list, correlations, hotplug events
 */

import React, { useState, useEffect } from 'react';
import { WorkbenchDeviceStack } from '../core/WorkbenchDeviceStack';
import { OrnamentCableRun } from '../ornaments/OrnamentCableRun';
import { useDeviceEvents } from '@/hooks/useDeviceEvents';
import { useCorrelation } from '@/hooks/useCorrelation';
import { api } from '@/lib/api-client';

interface Device {
  serial: string;
  brand: string;
  model: string;
  state: 'connected' | 'unauthorized' | 'offline' | 'fastboot' | 'recovery';
  mode?: string;
  correlation?: 'CORRELATED' | 'LIKELY' | 'UNKNOWN';
  platform?: string;
}

export function WorkbenchDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedSerial, setSelectedSerial] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { events, lastEvent } = useDeviceEvents();
  const { getCorrelation } = useCorrelation();

  useEffect(() => {
    async function fetchDevices() {
      setLoading(true);
      try {
        const result = await api.get<{ devices: any[] }>('/api/v1/adb/devices');
        if (result.success && result.data) {
          const deviceList: Device[] = ((result.data as any)?.devices || []).map((d: any) => ({
            serial: d.serial || d.id || 'unknown',
            brand: d.brand || d.manufacturer || 'Unknown',
            model: d.model || 'Unknown',
            state: d.state || 'offline',
            mode: d.mode,
            platform: d.platform || 'android',
            correlation: getCorrelation(d.serial)?.correlation || 'UNKNOWN',
          }));
          setDevices(deviceList);
        }
      } catch (error) {
        console.error('[WorkbenchDevices] Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, [getCorrelation]);

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-primary font-mono mb-2">
          Devices
        </h1>
        <p className="text-sm text-ink-muted">
          Device pile list — lived-in, mixed old and new
        </p>
      </div>

      {/* Hotplug Event Indicator */}
      {lastEvent && (
        <div className="p-3 rounded-lg border border-spray-cyan/30 bg-spray-cyan/10">
          <p className="text-xs font-mono text-spray-cyan">
            {lastEvent.type === 'connected' ? '🔌' : '🔌'} Device {lastEvent.type}: {lastEvent.device.serial}
          </p>
        </div>
      )}

      {/* Cable Divider */}
      <div className="h-px relative">
        <OrnamentCableRun variant="horizontal" color="cyan" animated={false} />
      </div>

      {/* Device Stack */}
      {loading ? (
        <div className="p-8 text-center text-ink-muted">
          <p className="text-sm font-mono">Loading devices...</p>
        </div>
      ) : (
        <WorkbenchDeviceStack
          devices={devices}
          onSelectDevice={(device) => setSelectedSerial(device.serial)}
          selectedSerial={selectedSerial || undefined}
        />
      )}

      {/* Device Count */}
      <div className="text-xs font-mono text-ink-muted text-center">
        {devices.length} device{devices.length !== 1 ? 's' : ''} detected
      </div>
    </div>
  );
}
