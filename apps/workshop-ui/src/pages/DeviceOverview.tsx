import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface DeviceProfile {
  model: string;
  platform: string;
  security_state: string;
  capability_class: string;
}

export default function DeviceOverview() {
  const [device, setDevice] = useState<DeviceProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // This is a read-only analysis view
  // No actions are executed

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Device Insight</h2>
        <p className="text-gray-400">
          Read-only summary of observed device metadata and protection posture
        </p>
      </div>

      {device ? (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400">Device Model</label>
            <div className="text-lg font-semibold">{device.model}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Platform</label>
            <div className="text-lg">{device.platform}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Observed Protection Layer</label>
            <div className="text-lg">{device.security_state}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Capability Class</label>
            <div className="text-lg">{device.capability_class}</div>
            <p className="text-sm text-gray-500 mt-1">
              This assessment documents analysis only. No modification or circumvention is performed.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400">
            Connect a device to begin analysis
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Analysis is read-only. No device changes are made.
          </p>
        </div>
      )}
    </div>
  );
}
