import { useState, useEffect } from "react";
import { devicesApi, diagnosticsApi } from "../lib/api-client";

interface Device {
  id?: string;
  serial?: string;
  platform: string;
  model?: string;
  connection_state: string;
  trust_state: Record<string, any>;
}

export default function DiagnosticsTab() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>("");
  
  // Policy gates
  const [ownershipAttested, setOwnershipAttested] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [operations, setOperations] = useState<string[]>(["properties", "logcat"]);
  
  useEffect(() => {
    detectDevices();
  }, []);

  const detectDevices = async () => {
    setDetecting(true);
    setError("");
    try {
      const response = await devicesApi.detect();
      if (response.ok && response.devices) {
        setDevices(response.devices);
      } else {
        setError(response.error || "Failed to detect devices");
      }
    } catch (err: any) {
      setError(err.message || "Device detection failed");
      setDevices([]);
    } finally {
      setDetecting(false);
    }
  };

  const runDiagnostics = async () => {
    if (!selectedDevice) {
      setError("Please select a device first");
      return;
    }

    if (!ownershipAttested) {
      setError("Ownership attestation is required");
      return;
    }

    setRunning(true);
    setError("");
    setResults(null);

    try {
      const response = await diagnosticsApi.run({
        device_serial: selectedDevice.serial || selectedDevice.id || "",
        platform: selectedDevice.platform,
        connection_state: selectedDevice.connection_state,
        trust_state: selectedDevice.trust_state || {},
        operations: operations,
        ownership_attested: ownershipAttested,
        confirmation_phrase: confirmationPhrase || undefined,
      });

      if (response.ok && response.result) {
        if (response.result.allowed) {
          setResults(response.result);
        } else {
          setError(`Blocked by policy gates: ${response.result.blocking_reasons?.join(", ") || "Unknown reason"}`);
        }
      } else {
        setError(response.error || "Diagnostics failed");
      }
    } catch (err: any) {
      setError(err.message || "Diagnostics failed");
    } finally {
      setRunning(false);
    }
  };

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setResults(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Device Diagnostics</h2>
        <p className="text-gray-400">Run authorized diagnostics on connected devices</p>
      </div>

      {/* Device Detection */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Available Devices</h3>
          <button
            onClick={detectDevices}
            disabled={detecting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm"
          >
            {detecting ? "Detecting..." : "Refresh Devices"}
          </button>
        </div>

        {error && !results && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded">
            {error}
          </div>
        )}

        {devices.length === 0 && !detecting ? (
          <div className="text-center py-8 text-gray-400">
            No devices detected. Ensure device is connected and authorized (ADB for Android, paired for iOS).
          </div>
        ) : (
          <div className="space-y-2">
            {devices.map((device, idx) => (
              <div
                key={idx}
                onClick={() => handleDeviceSelect(device)}
                className={`p-4 rounded cursor-pointer border-2 transition-colors ${
                  selectedDevice?.serial === device.serial || selectedDevice?.id === device.id
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-gray-700 bg-gray-700/50 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {device.platform.toUpperCase()} - {device.model || "Unknown Model"}
                    </div>
                    <div className="text-sm text-gray-400">
                      Serial: {device.serial || device.id || "N/A"} | 
                      Status: {device.connection_state} |
                      Authorized: {device.trust_state?.adb_authorized || device.trust_state?.paired ? "Yes" : "No"}
                    </div>
                  </div>
                  {(selectedDevice?.serial === device.serial || selectedDevice?.id === device.id) && (
                    <div className="text-blue-400">✓ Selected</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Policy Gates */}
      {selectedDevice && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Policy Gates</h3>
          
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ownershipAttested}
                onChange={(e) => setOwnershipAttested(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">
                I own this device or have written permission to service it *
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirmation Phrase (Optional)
            </label>
            <input
              type="text"
              value={confirmationPhrase}
              onChange={(e) => setConfirmationPhrase(e.target.value)}
              placeholder="Type 'I CONFIRM AUTHORIZED SERVICE' to confirm"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Diagnostics Operations</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={operations.includes("properties")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setOperations([...operations, "properties"]);
                    } else {
                      setOperations(operations.filter((op) => op !== "properties"));
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Device Properties</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={operations.includes("logcat")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setOperations([...operations, "logcat"]);
                    } else {
                      setOperations(operations.filter((op) => op !== "logcat"));
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Logcat Snapshot</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={operations.includes("bugreport")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setOperations([...operations, "bugreport"]);
                    } else {
                      setOperations(operations.filter((op) => op !== "bugreport"));
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Bugreport (takes longer)</span>
              </label>
            </div>
          </div>

          <button
            onClick={runDiagnostics}
            disabled={running || !ownershipAttested || operations.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium"
          >
            {running ? "Running Diagnostics..." : "Run Diagnostics"}
          </button>
        </div>
      )}

      {/* Results */}
      {results && results.diagnostics && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Diagnostics Results</h3>
          
          {results.diagnostics.authorized ? (
            <div className="space-y-4">
              {results.diagnostics.operations?.properties && (
                <div>
                  <h4 className="font-medium mb-2">Device Properties</h4>
                  <div className="bg-gray-900 rounded p-4 overflow-auto max-h-64">
                    <pre className="text-xs">
                      {JSON.stringify(
                        results.diagnostics.operations.properties.data?.properties || {},
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}

              {results.diagnostics.operations?.logcat && (
                <div>
                  <h4 className="font-medium mb-2">Logcat Snapshot</h4>
                  <div className="bg-gray-900 rounded p-4">
                    <div className="text-sm text-gray-400 mb-2">
                      File: {results.diagnostics.operations.logcat.data?.output_file || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500 max-h-32 overflow-auto">
                      {results.diagnostics.operations.logcat.stdout || "No output"}
                    </div>
                  </div>
                </div>
              )}

              {results.diagnostics.operations?.bugreport && (
                <div>
                  <h4 className="font-medium mb-2">Bugreport</h4>
                  <div className="bg-gray-900 rounded p-4">
                    <div className="text-sm">
                      File: {results.diagnostics.operations.bugreport.data?.output_file || "N/A"}
                    </div>
                    <div className="text-xs text-gray-400">
                      Size: {results.diagnostics.operations.bugreport.data?.file_size || 0} bytes
                    </div>
                  </div>
                </div>
              )}

              {results.report_path && (
                <div className="p-3 bg-green-900/50 text-green-200 rounded">
                  Report generated: {results.report_path}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-red-900/50 text-red-200 rounded">
              Device not authorized. Please accept ADB RSA key on device.
            </div>
          )}
        </div>
      )}

      {error && results && (
        <div className="p-3 bg-red-900/50 text-red-200 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
