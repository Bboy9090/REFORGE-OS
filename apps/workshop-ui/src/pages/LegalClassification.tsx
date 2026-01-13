import { useState, useEffect } from "react";
import { legalApi } from "../lib/api-client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";

interface LegalResult {
  status: string;
  jurisdiction: string;
  authorization_required: string[];
  risk_level: string;
  routing_instructions: {
    route_to: string;
    contact_information: string;
    required_documentation: string[];
    compliance_notes: string;
  };
}

interface LegalClassificationProps {
  deviceId?: string;
  ownershipConfidence?: number;
}

export default function LegalClassification({ 
  deviceId, 
  ownershipConfidence = 0.85 
}: LegalClassificationProps) {
  const [result, setResult] = useState<LegalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [jurisdiction, setJurisdiction] = useState("US");

  useEffect(() => {
    if (deviceId) {
      loadClassification();
    }
  }, [deviceId, ownershipConfidence, jurisdiction]);

  const loadClassification = async () => {
    if (!deviceId) {
      setError("No device selected");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await legalApi.classify({
        device_id: deviceId,
        ownership_confidence: ownershipConfidence,
        jurisdiction: jurisdiction,
      });

      if (response.ok) {
        setResult(response as any);
      } else {
        setError(response.error || "Failed to load legal classification");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load legal classification");
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

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}

      {!deviceId && (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400">Select a device to view legal classification</p>
          <p className="text-sm text-gray-500 mt-2">
            Go to Device Analysis tab to analyze a device first
          </p>
        </div>
      )}

      {deviceId && !result && !loading && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Jurisdiction
            </label>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="US">United States</option>
              <option value="EU">European Union</option>
              <option value="UK">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Global">Global</option>
            </select>
          </div>
          <button
            onClick={loadClassification}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Classify Legal Status
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <LoadingSpinner size="lg" text="Classifying legal status..." />
        </div>
      )}

      {result && !loading && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400">Jurisdiction</label>
            <div className="text-lg font-semibold">{result.jurisdiction}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Legal Status</label>
            <div className={`text-lg font-semibold ${
              result.status === "Permitted" ? "text-green-400" :
              result.status === "ConditionallyPermitted" ? "text-amber-400" :
              result.status === "RequiresAuthorization" ? "text-orange-400" :
              "text-red-400"
            }`}>
              {result.status}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Risk Level</label>
            <div className={`text-lg font-semibold ${
              result.risk_level === "Low" ? "text-green-400" :
              result.risk_level === "Medium" ? "text-amber-400" :
              result.risk_level === "High" ? "text-orange-400" :
              "text-red-400"
            }`}>
              {result.risk_level}
            </div>
          </div>

          {result.authorization_required.length > 0 && (
            <div>
              <label className="text-sm text-gray-400">Authorization Required</label>
              <ul className="list-disc list-inside text-gray-300 mt-1 space-y-1">
                {result.authorization_required.map((auth, idx) => (
                  <li key={idx} className="text-sm">{auth}</li>
                ))}
              </ul>
            </div>
          )}

          {result.routing_instructions && (
            <div className="border-t border-gray-700 pt-4">
              <label className="text-sm text-gray-400">Routing Instructions</label>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Route To:</span>
                  <span className="text-sm text-gray-300 ml-2">{result.routing_instructions.route_to}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Contact:</span>
                  <span className="text-sm text-gray-300 ml-2">{result.routing_instructions.contact_information}</span>
                </div>
                {result.routing_instructions.required_documentation.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Required Documentation:</span>
                    <ul className="list-disc list-inside text-gray-300 mt-1 ml-2">
                      {result.routing_instructions.required_documentation.map((doc, idx) => (
                        <li key={idx} className="text-sm">{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Compliance Notes:</span>
                  <span className="text-sm text-gray-300 ml-2">{result.routing_instructions.compliance_notes}</span>
                </div>
              </div>
            </div>
          )}

          {(result.status === "ConditionallyPermitted" || result.status === "RequiresAuthorization") && (
            <div className="bg-amber-900/20 border border-amber-700/50 rounded p-4">
              <p className="text-sm text-amber-200">
                External authorization likely required. Based on device profile and jurisdiction,
                recovery may require approval from manufacturer, carrier, or legal authority.
              </p>
            </div>
          )}

          {result.status === "Prohibited" && (
            <div className="bg-red-900/20 border border-red-700/50 rounded p-4">
              <p className="text-sm text-red-200">
                This scenario is not supported through this platform.
                Please contact support for routing guidance.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
