import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface ComplianceResult {
  device_id?: string;
  classification: string;
  jurisdiction: string;
  rationale: string;
}

interface ComplianceSummaryProps {
  deviceId?: string;
}

export default function ComplianceSummary({ deviceId }: ComplianceSummaryProps) {
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deviceId) {
      loadCompliance();
    }
  }, [deviceId]);

  const loadCompliance = async () => {
    setLoading(true);
    try {
      const response = await invoke<string>("get_compliance_summary", {
        deviceId: deviceId || undefined,
      });
      const data = JSON.parse(response);
      setResult(data);
    } catch (error) {
      console.error("Failed to load compliance summary:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Compliance Summary</h2>
        <p className="text-gray-400">
          This assessment documents analysis and jurisdictional considerations only.
          No modification, circumvention, or account interference was performed or advised.
        </p>
      </div>

      {loading ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400">Analyzing...</p>
        </div>
      ) : result ? (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400">Jurisdiction</label>
            <div className="text-lg font-semibold">{result.jurisdiction}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Legal Classification</label>
            <div className={`text-lg font-semibold ${
              result.classification === "permitted" ? "text-green-400" :
              result.classification === "conditional" ? "text-amber-400" :
              "text-red-400"
            }`}>
              {result.classification.toUpperCase()}
            </div>
            {result.classification === "conditional" && (
              <p className="text-sm text-amber-200 mt-2">
                External authorization may be required.
              </p>
            )}
            {result.classification === "prohibited" && (
              <p className="text-sm text-red-200 mt-2">
                This scenario is not supported. Please contact support for routing guidance.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400">Rationale</label>
            <div className="text-gray-300 mt-1">{result.rationale}</div>
          </div>

          <div className="bg-gray-900 rounded p-4 mt-4">
            <p className="text-sm text-gray-400">
              This platform provides analysis and documentation only.
              No modification, circumvention, or account interference is performed or advised.
              Certain recoveries require third-party authorization.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400">No compliance data available</p>
        </div>
      )}
    </div>
  );
}
