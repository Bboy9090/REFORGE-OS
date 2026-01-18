import { useState, useEffect } from "react";
import { deviceAnalysisApi, ownershipApi, devicesApi } from "../lib/api-client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import SuccessAlert from "../components/SuccessAlert";

interface ConnectedDevice {
  serial: string;
  platform: string;
  model: string;
  connection_state?: string;
  trust_state?: Record<string, any>;
}

interface DeviceProfile {
  device_id: string;
  model: string;
  manufacturer: string;
  platform: string;
  security_state: string;
  capability_class: string;
  classification: string;
  restrictions: string[];
  non_invasive: boolean;
  real_device: boolean;
  raw_properties?: Record<string, any>;
}

interface OwnershipConfidence {
  verified: boolean;
  confidence: number;
  required_authorization?: string;
  blocked: boolean;
}

interface DeviceOverviewProps {
  onDeviceSelected?: (deviceId: string) => void;
}

export default function DeviceOverview({ onDeviceSelected }: DeviceOverviewProps) {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [selectedSerial, setSelectedSerial] = useState<string>("");
  const [device, setDevice] = useState<DeviceProfile | null>(null);
  const [ownership, setOwnership] = useState<OwnershipConfidence | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Load connected devices on mount
  useEffect(() => {
    scanForDevices();
  }, []);

  const scanForDevices = async () => {
    setScanning(true);
    setError("");
    
    try {
      const response = await devicesApi.getConnected();
      
      if (response.ok) {
        setConnectedDevices(response.devices || []);
        if (response.devices && response.devices.length > 0) {
          setSuccess(`Found ${response.devices.length} connected device(s)`);
        } else {
          setError("No devices connected. Connect a device via USB and authorize ADB/pairing.");
        }
      } else {
        setError(response.message || "Failed to scan for devices");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend. Ensure ForgeWorks API is running.");
    } finally {
      setScanning(false);
    }
  };

  const analyzeDevice = async () => {
    if (!selectedSerial && connectedDevices.length === 0) {
      setError("No device selected. Connect a device first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Analyze REAL device
      const analysisResult = await deviceAnalysisApi.analyze({
        device_metadata: selectedSerial || "auto-detect",
        device_serial: selectedSerial || undefined,
        platform: connectedDevices.find(d => d.serial === selectedSerial)?.platform,
      });

      if (analysisResult.ok && analysisResult.device_id) {
        const deviceData: DeviceProfile = {
          device_id: analysisResult.device_id,
          model: analysisResult.model,
          manufacturer: analysisResult.manufacturer || "Unknown",
          platform: analysisResult.platform || "unknown",
          security_state: analysisResult.security_state,
          capability_class: analysisResult.capability_class,
          classification: analysisResult.classification,
          restrictions: analysisResult.restrictions || [],
          non_invasive: analysisResult.non_invasive ?? true,
          real_device: analysisResult.real_device ?? true,
          raw_properties: analysisResult.raw_properties,
        };
        setDevice(deviceData);
        setSuccess(`Successfully analyzed real device: ${deviceData.model}`);
        
        if (onDeviceSelected) {
          onDeviceSelected(deviceData.device_id);
        }

        // Verify ownership
        try {
          const ownershipResult = await ownershipApi.verify({
            user_id: "current_user",
            device_id: deviceData.device_id,
            attestation_type: "VerbalAttestation",
            documentation_references: [],
          });

          if (ownershipResult.ok) {
            setOwnership({
              verified: ownershipResult.verified,
              confidence: ownershipResult.confidence,
              required_authorization: ownershipResult.required_authorization || undefined,
              blocked: ownershipResult.blocked,
            });
          }
        } catch (err) {
          console.warn("Ownership verification failed:", err);
        }
      } else {
        setError(analysisResult.error || "Failed to analyze device");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze device. Ensure device is connected and authorized.");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'var(--state-success)';
    if (confidence >= 0.50) return 'var(--state-warning)';
    return 'var(--state-error)';
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Device Analysis</h2>
        <p style={{ color: 'var(--ink-muted)' }}>
          REAL device analysis - Connect a device via USB to begin
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}
      
      {success && (
        <SuccessAlert message={success} onDismiss={() => setSuccess("")} />
      )}

      {/* Connected Devices Panel */}
      <div className="rounded-lg p-6" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        border: '1px solid var(--border-primary)'
      }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>
            Connected Devices ({connectedDevices.length})
          </h3>
          <button
            onClick={scanForDevices}
            disabled={scanning}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            style={{
              backgroundColor: scanning ? 'var(--surface-tertiary)' : 'var(--accent-steel)',
              color: scanning ? 'var(--ink-muted)' : 'var(--ink-primary)',
              cursor: scanning ? 'not-allowed' : 'pointer'
            }}
          >
            {scanning ? 'Scanning...' : 'Scan for Devices'}
          </button>
        </div>

        {connectedDevices.length === 0 ? (
          <div className="text-center py-8 rounded-lg" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
            <p className="text-lg mb-2" style={{ color: 'var(--ink-muted)' }}>No devices connected</p>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              Connect an Android device via USB and accept the ADB authorization prompt
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {connectedDevices.map((dev) => (
              <div
                key={dev.serial}
                onClick={() => setSelectedSerial(dev.serial)}
                className="p-4 rounded-lg cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: selectedSerial === dev.serial ? 'var(--surface-elevated)' : 'var(--surface-tertiary)',
                  border: selectedSerial === dev.serial ? '2px solid var(--accent-gold)' : '2px solid transparent'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium" style={{ color: 'var(--ink-primary)' }}>
                      {dev.model || 'Unknown Model'}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                      {dev.platform.toUpperCase()} | Serial: {dev.serial}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        color: 'var(--state-success)'
                      }}
                    >
                      Connected
                    </span>
                    {selectedSerial === dev.serial && (
                      <span style={{ color: 'var(--accent-gold)' }}>✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analyze Button */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <button
            onClick={analyzeDevice}
            disabled={loading || connectedDevices.length === 0}
            className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-300"
            style={{
              backgroundColor: (loading || connectedDevices.length === 0) ? 'var(--surface-tertiary)' : 'var(--accent-gold)',
              color: (loading || connectedDevices.length === 0) ? 'var(--ink-muted)' : 'var(--ink-inverse)',
              boxShadow: (loading || connectedDevices.length === 0) ? 'none' : 'var(--glow-gold)',
              cursor: (loading || connectedDevices.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Analyzing Real Device..." : "Analyze Selected Device"}
          </button>
          <p className="text-xs text-center mt-2" style={{ color: 'var(--ink-muted)' }}>
            Read-only analysis - No modifications to device
          </p>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg p-12 text-center" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          <LoadingSpinner size="lg" text="Analyzing real device..." />
        </div>
      )}

      {/* Analysis Results */}
      {device && !loading && (
        <div className="rounded-lg p-6 space-y-4" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-gold)'
        }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--accent-gold)' }}>
              Analysis Results
            </h3>
            {device.real_device && (
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  color: 'var(--accent-gold)'
                }}
              >
                REAL DEVICE
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Device Model</label>
              <div className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>{device.model}</div>
            </div>

            <div>
              <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Manufacturer</label>
              <div className="text-lg" style={{ color: 'var(--ink-primary)' }}>{device.manufacturer}</div>
            </div>

            <div>
              <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Platform</label>
              <div className="text-lg uppercase" style={{ color: 'var(--ink-primary)' }}>{device.platform}</div>
            </div>

            <div>
              <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Device ID</label>
              <div className="text-sm font-mono" style={{ color: 'var(--ink-secondary)' }}>{device.device_id}</div>
            </div>
          </div>

          <div className="pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Security State</label>
            <div className="text-lg" style={{ color: 'var(--state-success)' }}>{device.security_state}</div>
          </div>

          <div>
            <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Classification</label>
            <div className="text-lg" style={{ color: 'var(--ink-primary)' }}>{device.classification}</div>
          </div>

          {device.restrictions.length > 0 && (
            <div>
              <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Analysis Restrictions</label>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {device.restrictions.map((restriction, idx) => (
                  <li key={idx} className="text-sm" style={{ color: 'var(--ink-secondary)' }}>{restriction}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Raw Properties (if available) */}
          {device.raw_properties && Object.keys(device.raw_properties).length > 0 && (
            <details className="pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <summary 
                className="cursor-pointer text-sm font-medium"
                style={{ color: 'var(--accent-steel)' }}
              >
                View Raw Device Properties ({Object.keys(device.raw_properties).length} properties)
              </summary>
              <div className="mt-2 p-3 rounded-lg overflow-auto max-h-64" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                <pre className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                  {JSON.stringify(device.raw_properties, null, 2)}
                </pre>
              </div>
            </details>
          )}

          {ownership && (
            <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Ownership Confidence</label>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {ownership.verified ? "Verified" : "Not Verified"}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: getConfidenceColor(ownership.confidence) }}>
                    {Math.round(ownership.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${ownership.confidence * 100}%`,
                      backgroundColor: getConfidenceColor(ownership.confidence)
                    }}
                  />
                </div>
                {ownership.required_authorization && (
                  <p className="text-xs mt-1" style={{ color: 'var(--state-warning)' }}>
                    Additional authorization required: {ownership.required_authorization}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode Indicator */}
      <div className="rounded-lg p-4 text-center" style={{ 
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        border: '1px solid rgba(212, 175, 55, 0.3)'
      }}>
        <p className="text-sm font-medium" style={{ color: 'var(--accent-gold)' }}>
          REAL DEVICE MODE - Analysis executes on actual connected hardware
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
          All data shown is retrieved directly from the connected device
        </p>
      </div>
    </div>
  );
}
