import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface LegalResult {
  jurisdiction: string;
  classification: string;
  rationale: string;
}

interface LegalClassificationProps {
  deviceId?: string;
}

export default function LegalClassification({ deviceId }: LegalClassificationProps) {
  const [result, setResult] = useState<LegalResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deviceId) {
      loadClassification();
    }
  }, [deviceId]);

  const loadClassification = async () => {
    setLoading(true);
    try {
      const response = await invoke<string>("get_legal_classification", {
        deviceId: deviceId || undefined,
      });
      const data = JSON.parse(response);
      setResult(data);
    } catch (error) {
      console.error("Failed to load legal classification:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Jurisdictional Considerations</h2>
        <p className="text-gray-400">
          Legal classification based on device profile and jurisdiction
        </p>
      </div>

      {loading ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400">Classifying...</p>
        </div>
      ) : result ? (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400">Jurisdiction</label>
            <div className="text-lg font-semibold">{result.jurisdiction}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Status</label>
            <div className={`text-lg font-semibold ${
              result.classification === "permitted" ? "text-green-400" :
              result.classification === "conditional" ? "text-amber-400" :
              "text-red-400"
            }`}>
              {result.classification === "permitted" ? "Permitted" :
               result.classification === "conditional" ? "Permitted with Conditions" :
               "Prohibited"}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Context</label>
            <div className="text-gray-300 mt-1">{result.rationale}</div>
          </div>

          {result.classification === "conditional" && (
            <div className="bg-amber-900/20 border border-amber-700/50 rounded p-4">
              <p className="text-sm text-amber-200">
                External authorization likely required. Based on device profile and jurisdiction,
                recovery may require approval from manufacturer, carrier, or legal authority.
              </p>
            </div>
          )}

          {result.classification === "prohibited" && (
            <div className="bg-red-900/20 border border-red-700/50 rounded p-4">
              <p className="text-sm text-red-200">
                This scenario is not supported through this platform.
                Please contact support for routing guidance.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400">Select a device to view legal classification</p>
        </div>
      )}
    </div>
  );
}
