// Multi-Device Monitoring Dashboard
// Side-by-side diagnostics for multiple devices with real-time status
import React, { useState, useEffect } from 'react';
import { Activity, Smartphone, Wifi, Battery, HardDrive, Cpu } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  platform: 'android' | 'ios' | 'windows' | 'iot';
  serial: string;
  status: 'connected' | 'disconnected' | 'diagnostics' | 'error';
  battery?: number;
  storage?: { used: number; total: number };
  cpu?: number;
  memory?: { used: number; total: number };
  lastUpdate: Date;
}

interface DiagnosticData {
  deviceId: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
  metrics: {
    batteryHealth?: number;
    storageHealth?: number;
    networkStrength?: number;
    systemLoad?: number;
  };
}

export function MultiDeviceMonitor() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [diagnostics, setDiagnostics] = useState<Map<string, DiagnosticData>>(new Map());
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');

  useEffect(() => {
    // Connect to WebSocket for real-time device updates
    const ws = new WebSocket('ws://localhost:3001/ws/device-events');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected' || data.type === 'updated') {
        setDevices(prev => {
          const existing = prev.find(d => d.id === data.device_uid);
          const device: Device = {
            id: data.device_uid,
            name: data.display_name || data.device_uid,
            platform: data.platform_hint,
            serial: data.device_uid,
            status: 'connected',
            battery: data.battery_level,
            storage: data.storage,
            cpu: data.cpu_usage,
            memory: data.memory,
            lastUpdate: new Date()
          };

          if (existing) {
            return prev.map(d => d.id === device.id ? device : d);
          }
          return [...prev, device];
        });
      } else if (data.type === 'disconnected') {
        setDevices(prev => 
          prev.map(d => d.id === data.device_uid 
            ? { ...d, status: 'disconnected' as const }
            : d
          )
        );
      } else if (data.type === 'diagnostic_update') {
        setDiagnostics(prev => {
          const newMap = new Map(prev);
          newMap.set(data.deviceId, data.diagnostics);
          return newMap;
        });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const getHealthColor = (health?: string) => {
    switch (health) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-neutral-500';
    }
  };

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'diagnostics': return 'bg-blue-500';
      case 'disconnected': return 'bg-neutral-500';
      case 'error': return 'bg-red-500';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'android':
      case 'ios':
        return <Smartphone className="w-5 h-5" />;
      case 'windows':
        return <Cpu className="w-5 h-5" />;
      case 'iot':
        return <Wifi className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const renderDeviceCard = (device: Device) => {
    const diagnostic = diagnostics.get(device.id);

    return (
      <div
        key={device.id}
        className={`bg-neutral-2 border border-neutral-6 rounded-lg p-4 hover:border-accent-7 transition-colors ${
          selectedDevices.includes(device.id) ? 'ring-2 ring-accent-9' : ''
        }`}
        onClick={() => toggleDeviceSelection(device.id)}
      >
        {/* Device Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {getPlatformIcon(device.platform)}
            <div>
              <h3 className="text-sm font-semibold text-fg">{device.name}</h3>
              <p className="text-xs text-fg-secondary">{device.serial}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`} />
            {diagnostic && (
              <span className={`text-xs font-medium ${getHealthColor(diagnostic.health)}`}>
                {diagnostic.health}
              </span>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Battery */}
          {device.battery !== undefined && (
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-fg-secondary" />
              <div>
                <p className="text-xs text-fg-secondary">Battery</p>
                <p className="text-sm font-semibold text-fg">{device.battery}%</p>
              </div>
            </div>
          )}

          {/* Storage */}
          {device.storage && (
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-fg-secondary" />
              <div>
                <p className="text-xs text-fg-secondary">Storage</p>
                <p className="text-sm font-semibold text-fg">
                  {Math.round((device.storage.used / device.storage.total) * 100)}%
                </p>
              </div>
            </div>
          )}

          {/* CPU */}
          {device.cpu !== undefined && (
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-fg-secondary" />
              <div>
                <p className="text-xs text-fg-secondary">CPU</p>
                <p className="text-sm font-semibold text-fg">{device.cpu}%</p>
              </div>
            </div>
          )}

          {/* Memory */}
          {device.memory && (
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-fg-secondary" />
              <div>
                <p className="text-xs text-fg-secondary">Memory</p>
                <p className="text-sm font-semibold text-fg">
                  {Math.round((device.memory.used / device.memory.total) * 100)}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Issues */}
        {diagnostic?.issues && diagnostic.issues.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-6">
            <p className="text-xs font-medium text-fg-secondary mb-1">Issues:</p>
            <ul className="space-y-1">
              {diagnostic.issues.slice(0, 2).map((issue, idx) => (
                <li key={idx} className="text-xs text-fg-secondary flex items-start gap-1">
                  <span className="text-red-500">•</span>
                  {issue}
                </li>
              ))}
              {diagnostic.issues.length > 2 && (
                <li className="text-xs text-accent-11">+{diagnostic.issues.length - 2} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Last Update */}
        <div className="mt-3 pt-3 border-t border-neutral-6">
          <p className="text-xs text-fg-secondary">
            Updated {new Date(device.lastUpdate).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  const renderCompareView = () => {
    const selectedDeviceData = devices.filter(d => selectedDevices.includes(d.id));

    if (selectedDeviceData.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-fg-secondary">Select devices to compare</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-6">
              <th className="text-left text-xs font-medium text-fg-secondary p-3">Metric</th>
              {selectedDeviceData.map(device => (
                <th key={device.id} className="text-left text-xs font-medium text-fg-secondary p-3">
                  {device.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-5">
              <td className="text-sm text-fg p-3">Platform</td>
              {selectedDeviceData.map(device => (
                <td key={device.id} className="text-sm text-fg-secondary p-3 capitalize">
                  {device.platform}
                </td>
              ))}
            </tr>
            <tr className="border-b border-neutral-5">
              <td className="text-sm text-fg p-3">Status</td>
              {selectedDeviceData.map(device => (
                <td key={device.id} className="text-sm p-3">
                  <span className={`inline-flex items-center gap-2 ${
                    device.status === 'connected' ? 'text-green-500' : 'text-neutral-500'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(device.status)}`} />
                    {device.status}
                  </span>
                </td>
              ))}
            </tr>
            <tr className="border-b border-neutral-5">
              <td className="text-sm text-fg p-3">Battery</td>
              {selectedDeviceData.map(device => (
                <td key={device.id} className="text-sm text-fg-secondary p-3">
                  {device.battery !== undefined ? `${device.battery}%` : 'N/A'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-neutral-5">
              <td className="text-sm text-fg p-3">Storage Used</td>
              {selectedDeviceData.map(device => (
                <td key={device.id} className="text-sm text-fg-secondary p-3">
                  {device.storage 
                    ? `${Math.round((device.storage.used / device.storage.total) * 100)}%`
                    : 'N/A'
                  }
                </td>
              ))}
            </tr>
            <tr className="border-b border-neutral-5">
              <td className="text-sm text-fg p-3">CPU Usage</td>
              {selectedDeviceData.map(device => (
                <td key={device.id} className="text-sm text-fg-secondary p-3">
                  {device.cpu !== undefined ? `${device.cpu}%` : 'N/A'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-neutral-5">
              <td className="text-sm text-fg p-3">Health</td>
              {selectedDeviceData.map(device => {
                const diagnostic = diagnostics.get(device.id);
                return (
                  <td key={device.id} className="text-sm p-3">
                    {diagnostic ? (
                      <span className={`font-medium ${getHealthColor(diagnostic.health)}`}>
                        {diagnostic.health}
                      </span>
                    ) : (
                      <span className="text-fg-secondary">Unknown</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-fg">Multi-Device Monitor</h2>
          <p className="text-sm text-fg-secondary mt-1">
            {devices.length} device{devices.length !== 1 ? 's' : ''} detected
            {selectedDevices.length > 0 && ` • ${selectedDevices.length} selected`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-accent-9 text-white'
                : 'bg-neutral-3 text-fg hover:bg-neutral-4'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'compare'
                ? 'bg-accent-9 text-white'
                : 'bg-neutral-3 text-fg hover:bg-neutral-4'
            }`}
            disabled={selectedDevices.length === 0}
          >
            Compare View
          </button>
        </div>
      </div>

      {/* Device Grid or Compare View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {devices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Activity className="w-12 h-12 text-fg-secondary mx-auto mb-4" />
              <p className="text-fg-secondary">No devices connected</p>
              <p className="text-xs text-fg-secondary mt-2">
                Connect devices to start monitoring
              </p>
            </div>
          ) : (
            devices.map(renderDeviceCard)
          )}
        </div>
      ) : (
        renderCompareView()
      )}
    </div>
  );
}

export default MultiDeviceMonitor;
