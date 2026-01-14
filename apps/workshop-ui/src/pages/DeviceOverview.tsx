import { useState, useEffect } from "react";
import { deviceAnalysisApi, ownershipApi } from "../lib/api-client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";

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
  const [device, setDevice] = useState<DeviceProfile | null>(null);
  const [ownership, setOwnership] = useState<OwnershipConfidence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [deviceMetadata, setDeviceMetadata] = useState("");

  // This is a read-only analysis view
  // No actions are executed

  const analyzeDevice = async () => {
    if (!deviceMetadata.trim()) {
      setError("Please enter device metadata to analyze");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Analyze device
      const analysisResult = await deviceAnalysisApi.analyze({
        device_metadata: deviceMetadata,
        platform: deviceMetadata.includes("iPhone") ? "ios" : 
                  deviceMetadata.includes("Samsung") || deviceMetadata.includes("Android") ? "android" : 
                  "unknown",
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
        };
        setDevice(deviceData);
        if (onDeviceSelected) {
          onDeviceSelected(deviceData.device_id);
        }

        // Step 2: Verify ownership (mock for now)
        try {
          const ownershipResult = await ownershipApi.verify({
            user_id: "current_user",
            device_id: deviceData.device_id,
            attestation_type: "PurchaseReceipt",
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
      setError(err.message || "Failed to analyze device");
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Device Insight</h2>
        <p style={{ color: 'var(--ink-muted)' }}>
          Read-only summary of observed device metadata and protection posture
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}

      <div className="rounded-lg p-6 space-y-4" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
            Device Metadata
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={deviceMetadata}
              onChange={(e) => setDeviceMetadata(e.target.value)}
              placeholder="e.g., iPhone 13 Pro - Clean device"
              className="flex-1 px-4 py-2 rounded-lg transition-all duration-300"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
              onKeyPress={(e) => e.key === "Enter" && analyzeDevice()}
            />
            <button
              onClick={analyzeDevice}
              disabled={loading}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-300"
              style={{
                backgroundColor: loading ? 'var(--surface-tertiary)' : 'var(--accent-gold)',
                color: loading ? 'var(--ink-muted)' : 'var(--ink-inverse)',
                boxShadow: loading ? 'none' : 'var(--glow-gold)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                }
              }}
            >
              {loading ? "Analyzing..." : "Analyze Device"}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--ink-muted)' }}>
            Enter device information to begin read-only analysis
          </p>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg p-12 text-center" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)'
        }}>
          <LoadingSpinner size="lg" text="Analyzing device..." />
        </div>
      )}

      {device && !loading && (
        <div className="rounded-lg p-6 space-y-4" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)'
        }}>
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
            <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Observed Protection Layer</label>
            <div className="text-lg" style={{ color: 'var(--ink-primary)' }}>{device.security_state}</div>
          </div>

          <div>
            <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Capability Class</label>
            <div className="text-lg" style={{ color: 'var(--ink-primary)' }}>{device.capability_class}</div>
            <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
              This assessment documents analysis only. No modification or circumvention is performed.
            </p>
          </div>

          {device.restrictions.length > 0 && (
            <div>
              <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Restrictions</label>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {device.restrictions.map((restriction, idx) => (
                  <li key={idx} className="text-sm" style={{ color: 'var(--ink-secondary)' }}>{restriction}</li>
                ))}
              </ul>
            </div>
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

      {!device && !loading && (
        <div className="rounded-lg p-12 text-center" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          <p style={{ color: 'var(--ink-muted)' }}>
            Enter device metadata above to begin analysis
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--ink-muted)' }}>
            Analysis is read-only. No device changes are made.
          </p>
        </div>
      )}
    </div>
  );
}
