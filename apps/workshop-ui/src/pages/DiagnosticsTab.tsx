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
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Device Diagnostics</h2>
        <p style={{ color: 'var(--ink-muted)' }}>Run authorized diagnostics on connected devices</p>
      </div>

      {/* Device Detection */}
      <div className="rounded-lg p-6" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>Available Devices</h3>
          <button
            onClick={detectDevices}
            disabled={detecting}
            className="px-4 py-2 rounded text-sm transition-all duration-300"
            style={{
              backgroundColor: detecting ? 'var(--surface-tertiary)' : 'var(--accent-gold)',
              color: detecting ? 'var(--ink-muted)' : 'var(--ink-inverse)',
              boxShadow: detecting ? 'none' : 'var(--glow-gold)',
              cursor: detecting ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!detecting) {
                e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
              }
            }}
            onMouseLeave={(e) => {
              if (!detecting) {
                e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
              }
            }}
          >
            {detecting ? "Detecting..." : "Refresh Devices"}
          </button>
        </div>

        {error && !results && (
          <div className="mb-4 p-3 rounded" style={{ 
            backgroundColor: 'var(--state-error)',
            borderColor: 'var(--state-error)',
            border: '1px solid var(--state-error)',
            opacity: 0.1
          }}>
            <div style={{ color: 'var(--state-error)' }}>{error}</div>
          </div>
        )}

        {devices.length === 0 && !detecting ? (
          <div className="text-center py-8" style={{ color: 'var(--ink-muted)' }}>
            No devices detected. Ensure device is connected and authorized (ADB for Android, paired for iOS).
          </div>
        ) : (
          <div className="space-y-2">
            {devices.map((device, idx) => (
              <div
                key={idx}
                onClick={() => handleDeviceSelect(device)}
                className="p-4 rounded cursor-pointer transition-colors"
                style={{
                  backgroundColor: (selectedDevice?.serial === device.serial || selectedDevice?.id === device.id) ? 'var(--surface-tertiary)' : 'var(--surface-primary)',
                  borderColor: (selectedDevice?.serial === device.serial || selectedDevice?.id === device.id) ? 'var(--accent-steel)' : 'var(--border-primary)',
                  border: '2px solid var(--border-primary)'
                }}
                onMouseEnter={(e) => {
                  if (selectedDevice?.serial !== device.serial && selectedDevice?.id !== device.id) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                    e.currentTarget.style.borderColor = 'var(--accent-steel)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDevice?.serial !== device.serial && selectedDevice?.id !== device.id) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium" style={{ color: 'var(--ink-primary)' }}>
                      {device.platform.toUpperCase()} - {device.model || "Unknown Model"}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                      Serial: {device.serial || device.id || "N/A"} | 
                      Status: {device.connection_state} |
                      Authorized: {device.trust_state?.adb_authorized || device.trust_state?.paired ? "Yes" : "No"}
                    </div>
                  </div>
                  {(selectedDevice?.serial === device.serial || selectedDevice?.id === device.id) && (
                    <div style={{ color: 'var(--accent-steel)' }}>✓ Selected</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Policy Gates */}
      {selectedDevice && (
        <div className="rounded-lg p-6 space-y-4" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)'
        }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>Policy Gates</h3>
          
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ownershipAttested}
                onChange={(e) => setOwnershipAttested(e.target.checked)}
                className="w-4 h-4"
                style={{ accentColor: 'var(--accent-gold)' }}
              />
              <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                I own this device or have written permission to service it *
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
              Confirmation Phrase (Optional)
            </label>
            <input
              type="text"
              value={confirmationPhrase}
              onChange={(e) => setConfirmationPhrase(e.target.value)}
              placeholder="Type 'I CONFIRM AUTHORIZED SERVICE' to confirm"
              className="w-full rounded px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>Diagnostics Operations</label>
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
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
                <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Device Properties</span>
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
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
                <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Logcat Snapshot</span>
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
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
                <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Bugreport (takes longer)</span>
              </label>
            </div>
          </div>

          <button
            onClick={runDiagnostics}
            disabled={running || !ownershipAttested || operations.length === 0}
            className="w-full px-4 py-2 rounded font-medium transition-all duration-300"
            style={{
              backgroundColor: (running || !ownershipAttested || operations.length === 0) ? 'var(--surface-tertiary)' : 'var(--accent-bronze)',
              color: (running || !ownershipAttested || operations.length === 0) ? 'var(--ink-muted)' : 'var(--ink-inverse)',
              cursor: (running || !ownershipAttested || operations.length === 0) ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!running && ownershipAttested && operations.length > 0) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!running && ownershipAttested && operations.length > 0) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {running ? "Running Diagnostics..." : "Run Diagnostics"}
          </button>
        </div>
      )}

      {/* Results */}
      {results && results.diagnostics && (
        <div className="rounded-lg p-6 space-y-4" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)'
        }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>Diagnostics Results</h3>
          
          {results.diagnostics.authorized ? (
            <div className="space-y-4">
              {results.diagnostics.operations?.properties && (
                <div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--ink-primary)' }}>Device Properties</h4>
                  <div className="rounded p-4 overflow-auto max-h-64" style={{ backgroundColor: 'var(--surface-primary)' }}>
                    <pre className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
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
                  <h4 className="font-medium mb-2" style={{ color: 'var(--ink-primary)' }}>Logcat Snapshot</h4>
                  <div className="rounded p-4" style={{ backgroundColor: 'var(--surface-primary)' }}>
                    <div className="text-sm mb-2" style={{ color: 'var(--ink-muted)' }}>
                      File: {results.diagnostics.operations.logcat.data?.output_file || "N/A"}
                    </div>
                    <div className="text-xs max-h-32 overflow-auto" style={{ color: 'var(--ink-muted)' }}>
                      {results.diagnostics.operations.logcat.stdout || "No output"}
                    </div>
                  </div>
                </div>
              )}

              {results.diagnostics.operations?.bugreport && (
                <div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--ink-primary)' }}>Bugreport</h4>
                  <div className="rounded p-4" style={{ backgroundColor: 'var(--surface-primary)' }}>
                    <div className="text-sm" style={{ color: 'var(--ink-primary)' }}>
                      File: {results.diagnostics.operations.bugreport.data?.output_file || "N/A"}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                      Size: {results.diagnostics.operations.bugreport.data?.file_size || 0} bytes
                    </div>
                  </div>
                </div>
              )}

              {results.report_path && (
                <div className="p-3 rounded" style={{ 
                  backgroundColor: 'var(--state-success)',
                  borderColor: 'var(--state-success)',
                  border: '1px solid var(--state-success)',
                  opacity: 0.1
                }}>
                  <div style={{ color: 'var(--state-success)' }}>Report generated: {results.report_path}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded" style={{ 
              backgroundColor: 'var(--state-error)',
              borderColor: 'var(--state-error)',
              border: '1px solid var(--state-error)',
              opacity: 0.1
            }}>
              <div style={{ color: 'var(--state-error)' }}>Device not authorized. Please accept ADB RSA key on device.</div>
            </div>
          )}
        </div>
      )}

      {error && results && (
        <div className="p-3 rounded" style={{ 
          backgroundColor: 'var(--state-error)',
          borderColor: 'var(--state-error)',
          border: '1px solid var(--state-error)',
          opacity: 0.1
        }}>
          <div style={{ color: 'var(--state-error)' }}>{error}</div>
        </div>
      )}
    </div>
  );
}
