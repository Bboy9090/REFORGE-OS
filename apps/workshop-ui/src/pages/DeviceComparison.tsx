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
      case 'permitted': return 'text-green-600';
      case 'conditional': return 'text-yellow-600';
      case 'prohibited': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <section className="device-comparison">
      <div className="container max-w-7xl mx-auto py-8">
        <h2 className="text-3xl font-bold mb-2">Device Comparison</h2>
        <p className="text-gray-600 mb-8">Compare multiple devices side-by-side</p>

        {/* Device Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="font-semibold mb-4">Select Devices to Compare (Max 4)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableDevices.map((device) => (
              <div
                key={device.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedDevices.find(d => d.id === device.id) ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => addDevice(device)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{device.profile.model}</p>
                    <p className="text-sm text-gray-600">{device.profile.platform}</p>
                  </div>
                  {selectedDevices.find(d => d.id === device.id) && (
                    <span className="text-blue-600">✓ Selected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedDevices.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Property</th>
                  {selectedDevices.map((device) => (
                    <th key={device.id} className="text-left p-4 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <span>{device.profile.model}</span>
                        <button
                          onClick={() => removeDevice(device.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">Platform</td>
                  {selectedDevices.map((device) => (
                    <td key={device.id} className="p-4">{device.profile.platform}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Device Class</td>
                  {selectedDevices.map((device) => (
                    <td key={device.id} className="p-4">{device.profile.deviceClass}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Security State</td>
                  {selectedDevices.map((device) => (
                    <td key={device.id} className="p-4">{device.profile.securityState}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Capability Class</td>
                  {selectedDevices.map((device) => (
                    <td key={device.id} className="p-4">{device.profile.capabilityClass}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Ownership Confidence</td>
                  {selectedDevices.map((device) => (
                    <td key={device.id} className="p-4">
                      <span className={`font-medium ${
                        device.ownership.confidence >= 85 ? 'text-green-600' :
                        device.ownership.confidence >= 70 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {device.ownership.confidence}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Legal Classification</td>
                  {selectedDevices.map((device) => (
                    <td key={device.id} className={`p-4 ${getClassificationColor(device.legal.classification)}`}>
                      {device.legal.classification}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium">Jurisdiction</td>
                  {selectedDevices.map((device) => (
                    <td key={device.id} className="p-4">{device.legal.jurisdiction.toUpperCase()}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <p className="text-gray-500">Select devices from above to compare</p>
          </div>
        )}

        {selectedDevices.length > 0 && (
          <div className="mt-6">
            <button className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700">
              Export Comparison Report
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
