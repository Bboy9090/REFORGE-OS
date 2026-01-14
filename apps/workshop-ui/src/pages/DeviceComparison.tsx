// Multi-Device Comparison View
// Compare multiple devices side-by-side

import React, { useState } from 'react';
import { DeviceProfile, LegalClassification, OwnershipAttestation } from '../types/api';

interface ComparisonDevice {
  id: string;
  profile: DeviceProfile;
  ownership: OwnershipAttestation;
  legal: LegalClassification;
}

export default function DeviceComparison() {
  const [selectedDevices, setSelectedDevices] = useState<ComparisonDevice[]>([]);
  const [availableDevices, setAvailableDevices] = useState<ComparisonDevice[]>([]);

  // Mock available devices
  React.useEffect(() => {
    setAvailableDevices([
      {
        id: '1',
        profile: {
          model: 'iPhone 12',
          platform: 'iOS',
          deviceClass: 'A14',
          securityState: 'Restricted',
          capabilityClass: 'Kernel Research',
        },
        ownership: {
          id: 'own1',
          deviceId: '1',
          attestorType: 'user',
          confidence: 85,
          createdAt: new Date().toISOString(),
        },
        legal: {
          id: 'legal1',
          deviceId: '1',
          jurisdiction: 'us',
          classification: 'conditional',
          rationale: 'Requires external authorization',
          createdAt: new Date().toISOString(),
        },
      },
      {
        id: '2',
        profile: {
          model: 'Samsung Galaxy S21',
          platform: 'Android',
          deviceClass: 'Snapdragon 888',
          securityState: 'Restricted',
          capabilityClass: 'System Modification Research',
        },
        ownership: {
          id: 'own2',
          deviceId: '2',
          attestorType: 'user',
          confidence: 92,
          createdAt: new Date().toISOString(),
        },
        legal: {
          id: 'legal2',
          deviceId: '2',
          jurisdiction: 'us',
          classification: 'permitted',
          rationale: 'Standard analysis permitted',
          createdAt: new Date().toISOString(),
        },
      },
    ]);
  }, []);

  const addDevice = (device: ComparisonDevice) => {
    if (selectedDevices.length < 4 && !selectedDevices.find(d => d.id === device.id)) {
      setSelectedDevices([...selectedDevices, device]);
    }
  };

  const removeDevice = (id: string) => {
    setSelectedDevices(selectedDevices.filter(d => d.id !== id));
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'permitted': return 'var(--state-success)';
      case 'conditional': return 'var(--state-warning)';
      case 'prohibited': return 'var(--state-error)';
      default: return 'var(--ink-muted)';
    }
  };

  return (
    <section className="device-comparison">
      <div className="container max-w-7xl mx-auto py-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Device Comparison</h2>
        <p className="mb-8" style={{ color: 'var(--ink-secondary)' }}>Compare multiple devices side-by-side</p>

        {/* Device Selection */}
        <div className="rounded-lg shadow-sm border p-6 mb-6" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)'
        }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Available Devices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDevices.map((device) => (
              <div
                key={device.id}
                className="border rounded-lg p-4 cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--surface-tertiary)',
                  borderColor: 'var(--border-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                }}
                onClick={() => addDevice(device)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{device.profile.model}</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>
                      {device.profile.platform} • {device.ownership.confidence}% confidence
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded" style={{
                    backgroundColor: getClassificationColor(device.legal.classification),
                    color: 'var(--ink-primary)',
                    opacity: 0.2
                  }}>
                    {device.legal.classification}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedDevices.length > 0 && (
          <div className="rounded-lg shadow-sm border overflow-x-auto" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <th className="text-left p-4 font-semibold" style={{ color: 'var(--ink-primary)' }}>Device</th>
                  {selectedDevices.map((device) => (
                    <th key={device.id} className="text-left p-4 font-semibold" style={{ color: 'var(--ink-primary)' }}>
                      <div className="flex items-center justify-between">
                        <span>{device.profile.model}</span>
                        <button
                          onClick={() => removeDevice(device.id)}
                          className="text-sm transition-colors"
                          style={{ color: 'var(--state-error)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--ink-secondary)' }}>Platform</td>
                  {selectedDevices.map((device) => (
                    <td key={device.id} className="p-4" style={{ color: 'var(--ink-primary)' }}>{device.profile.platform}</td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--ink-secondary)' }}>Ownership Confidence</td>
                  {selectedDevices.map((device) => (
                    <td key={device.id} className="p-4" style={{ color: 'var(--ink-primary)' }}>{device.ownership.confidence}%</td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--ink-secondary)' }}>Legal Classification</td>
                  {selectedDevices.map((device) => (
                    <td key={device.id} className="p-4">
                      <span className="px-2 py-1 text-xs rounded" style={{
                        backgroundColor: getClassificationColor(device.legal.classification),
                        color: 'var(--ink-primary)',
                        opacity: 0.2
                      }}>
                        {device.legal.classification}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium" style={{ color: 'var(--ink-secondary)' }}>Jurisdiction</td>
                  {selectedDevices.map((device) => (
                    <td key={device.id} className="p-4" style={{ color: 'var(--ink-primary)' }}>{device.legal.jurisdiction}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedDevices.length === 0 && (
          <div className="rounded-lg shadow-sm border p-12 text-center" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <p style={{ color: 'var(--ink-muted)' }}>Select devices from above to compare</p>
          </div>
        )}
      </div>
    </section>
  );
}
