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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Device Insight</h2>
        <p className="text-gray-400">
          Read-only summary of observed device metadata and protection posture
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}

      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Device Metadata
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={deviceMetadata}
              onChange={(e) => setDeviceMetadata(e.target.value)}
              placeholder="e.g., iPhone 13 Pro - Clean device"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && analyzeDevice()}
            />
            <button
              onClick={analyzeDevice}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "Analyzing..." : "Analyze Device"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter device information to begin read-only analysis
          </p>
        </div>
      </div>

      {loading && (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <LoadingSpinner size="lg" text="Analyzing device..." />
        </div>
      )}

      {device && !loading && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400">Device Model</label>
            <div className="text-lg font-semibold">{device.model}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Manufacturer</label>
            <div className="text-lg">{device.manufacturer}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Platform</label>
            <div className="text-lg uppercase">{device.platform}</div>
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

          {device.restrictions.length > 0 && (
            <div>
              <label className="text-sm text-gray-400">Restrictions</label>
              <ul className="list-disc list-inside text-gray-300 mt-1 space-y-1">
                {device.restrictions.map((restriction, idx) => (
                  <li key={idx} className="text-sm">{restriction}</li>
                ))}
              </ul>
            </div>
          )}

          {ownership && (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <label className="text-sm text-gray-400">Ownership Confidence</label>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">
                    {ownership.verified ? "Verified" : "Not Verified"}
                  </span>
                  <span className={`text-sm font-semibold ${
                    ownership.confidence >= 0.85 ? "text-green-400" :
                    ownership.confidence >= 0.50 ? "text-amber-400" :
                    "text-red-400"
                  }`}>
                    {Math.round(ownership.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      ownership.confidence >= 0.85 ? "bg-green-500" :
                      ownership.confidence >= 0.50 ? "bg-amber-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${ownership.confidence * 100}%` }}
                  />
                </div>
                {ownership.required_authorization && (
                  <p className="text-xs text-amber-300 mt-1">
                    Additional authorization required: {ownership.required_authorization}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!device && !loading && (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400">
            Enter device metadata above to begin analysis
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Analysis is read-only. No device changes are made.
          </p>
        </div>
      )}
    </div>
  );
}
