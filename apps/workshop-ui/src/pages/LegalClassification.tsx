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
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Jurisdictional Considerations</h2>
        <p style={{ color: 'var(--ink-muted)' }}>
          Legal classification based on device profile and jurisdiction
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}

      {!deviceId && (
        <div className="rounded-lg p-12 text-center" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          <p style={{ color: 'var(--ink-muted)' }}>Select a device to view legal classification</p>
          <p className="text-sm mt-2" style={{ color: 'var(--ink-muted)' }}>
            Go to Device Analysis tab to analyze a device first
          </p>
        </div>
      )}

      {deviceId && !result && !loading && (
        <div className="rounded-lg p-6 space-y-4" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
              Jurisdiction
            </label>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full px-4 py-2 rounded-lg"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
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
            className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-300"
            style={{
              backgroundColor: 'var(--accent-gold)',
              color: 'var(--ink-inverse)',
              boxShadow: 'var(--glow-gold)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
            }}
          >
            Classify Legal Status
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-lg p-12 text-center" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          <LoadingSpinner size="lg" text="Classifying legal status..." />
        </div>
      )}

      {result && !loading && (
        <div className="rounded-lg p-6 space-y-4" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          <div>
            <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Jurisdiction</label>
            <div className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>{result.jurisdiction}</div>
          </div>

          <div>
            <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Legal Status</label>
            <div className="text-lg font-semibold" style={{
              color: result.status === "Permitted" ? 'var(--state-success)' :
                     result.status === "ConditionallyPermitted" ? 'var(--state-warning)' :
                     result.status === "RequiresAuthorization" ? 'var(--state-warning)' :
                     'var(--state-error)'
            }}>
              {result.status}
            </div>
          </div>

          <div>
            <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Risk Level</label>
            <div className="text-lg font-semibold" style={{
              color: result.risk_level === "Low" ? 'var(--state-success)' :
                     result.risk_level === "Medium" ? 'var(--state-warning)' :
                     result.risk_level === "High" ? 'var(--state-warning)' :
                     'var(--state-error)'
            }}>
              {result.risk_level}
            </div>
          </div>

          {result.authorization_required.length > 0 && (
            <div>
              <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Authorization Required</label>
              <ul className="list-disc list-inside mt-1 space-y-1" style={{ color: 'var(--ink-secondary)' }}>
                {result.authorization_required.map((auth, idx) => (
                  <li key={idx} className="text-sm">{auth}</li>
                ))}
              </ul>
            </div>
          )}

          {result.routing_instructions && (
            <div className="pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <label className="text-sm" style={{ color: 'var(--ink-muted)' }}>Routing Instructions</label>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Route To:</span>
                  <span className="text-sm ml-2" style={{ color: 'var(--ink-secondary)' }}>{result.routing_instructions.route_to}</span>
                </div>
                <div>
                  <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Contact:</span>
                  <span className="text-sm ml-2" style={{ color: 'var(--ink-secondary)' }}>{result.routing_instructions.contact_information}</span>
                </div>
                {result.routing_instructions.required_documentation.length > 0 && (
                  <div>
                    <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Required Documentation:</span>
                    <ul className="list-disc list-inside mt-1 ml-2" style={{ color: 'var(--ink-secondary)' }}>
                      {result.routing_instructions.required_documentation.map((doc, idx) => (
                        <li key={idx} className="text-sm">{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Compliance Notes:</span>
                  <span className="text-sm ml-2" style={{ color: 'var(--ink-secondary)' }}>{result.routing_instructions.compliance_notes}</span>
                </div>
              </div>
            </div>
          )}

          {(result.status === "ConditionallyPermitted" || result.status === "RequiresAuthorization") && (
            <div className="border rounded p-4" style={{ 
              backgroundColor: 'var(--state-warning)',
              borderColor: 'var(--state-warning)',
              opacity: 0.1
            }}>
              <p className="text-sm" style={{ color: 'var(--state-warning)' }}>
                External authorization likely required. Based on device profile and jurisdiction,
                recovery may require approval from manufacturer, carrier, or legal authority.
              </p>
            </div>
          )}

          {result.status === "Prohibited" && (
            <div className="border rounded p-4" style={{ 
              backgroundColor: 'var(--state-error)',
              borderColor: 'var(--state-error)',
              opacity: 0.1
            }}>
              <p className="text-sm" style={{ color: 'var(--state-error)' }}>
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
