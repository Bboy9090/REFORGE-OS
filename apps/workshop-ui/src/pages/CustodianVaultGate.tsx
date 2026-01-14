import { useState, useEffect } from "react";
import { interpretiveApi, solutionsApi } from "../lib/api-client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";

interface CustodianVaultProps {
  ownershipConfidence?: number;
  deviceId?: string;
}

interface Solution {
  id: string;
  title: string;
  description: string;
  device_type: string;
  category: string;
  solution_steps: string[];
  difficulty: string;
  estimated_time: string;
  tools_needed: string[];
  warnings: string[];
  tags: string[];
}

const DEVICE_TYPE_LABELS: Record<string, string> = {
  computer_windows: "Windows PC",
  computer_linux: "Linux PC",
  macbook: "MacBook",
  imac: "iMac",
  android_phone: "Android Phone",
  android_tablet: "Android Tablet",
  ios_iphone: "iPhone",
  ios_ipad: "iPad",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "badge-success",
  medium: "badge-info",
  hard: "badge-warning",
  expert: "badge-error",
};

export default function CustodianVaultGate({ 
  ownershipConfidence = 0,
  deviceId 
}: CustodianVaultProps) {
  const [acknowledged, setAcknowledledged] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [interpretiveReview, setInterpretiveReview] = useState<any>(null);
  const [showInterpretiveReview, setShowInterpretiveReview] = useState(false);

  useEffect(() => {
    if (acknowledged) {
      loadSolutions();
    }
  }, [acknowledged, selectedDeviceType, selectedCategory, searchQuery]);

  const loadSolutions = async () => {
    setLoading(true);
    setError("");

    try {
      // Load repair solutions database
      const response = await solutionsApi.list({
        device_type: selectedDeviceType || undefined,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: 100,
      });

      if (response.ok && response.solutions) {
        setSolutions(response.solutions);
      } else {
        setError(response.error || "Failed to load solutions");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load solutions");
      setSolutions([]);
    } finally {
      setLoading(false);
    }
  };

  // Interpretive Review (for high-risk scenarios)
  const loadInterpretiveReview = async (deviceId: string, scenario: string) => {
    if (ownershipConfidence < 85) {
      setError("Ownership confidence must be ≥ 85% for interpretive review");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await interpretiveApi.review(
        {
          device_id: deviceId,
          scenario: scenario,
          ownership_confidence: ownershipConfidence,
        },
        ownershipConfidence
      );

      if (response.ok) {
        setInterpretiveReview(response);
        setShowInterpretiveReview(true);
      } else {
        setError(response.error || "Interpretive review unavailable");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load interpretive review");
    } finally {
      setLoading(false);
    }
  };

  if (ownershipConfidence < 85) {
    return (
      <div className="space-y-6 fade-in">
        <div className="card rounded-lg p-6" style={{ 
          backgroundColor: 'var(--state-warning)',
          borderColor: 'var(--state-warning)',
          border: '1px solid var(--state-warning)',
          opacity: 0.1
        }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--state-warning)' }}>
            Ownership Confidence Insufficient
          </h3>
          <p style={{ color: 'var(--ink-primary)' }}>
            Additional documentation may be required to access the Custodial Closet.
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--ink-secondary)' }}>
            External authorization may be required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>
          Custodial Closet — Solutions Database
        </h2>
        <p style={{ color: 'var(--ink-muted)' }}>
          Access repair solutions for all device types. Analysis and documentation only.
        </p>
      </div>

      <div className="card" style={{ 
        backgroundColor: 'var(--surface-secondary)', 
        borderColor: 'var(--border-gold)',
        borderWidth: '1px',
        borderStyle: 'solid'
      }}>
        <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-gold)' }}>
          Custodial Closet — Interpretive Review Mode
        </h3>
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
          This environment provides contextual analysis for complex scenarios.
          Historical context provided for assessment only. No procedural guidance is displayed.
          All access is logged for compliance.
        </p>
      </div>

      {deviceId && ownershipConfidence >= 85 && (
        <div className="card" style={{ 
          backgroundColor: 'var(--surface-secondary)', 
          borderColor: 'var(--border-primary)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>Interpretive Review Access</h3>
            <button
              onClick={() => loadInterpretiveReview(deviceId, "device_analysis")}
              disabled={loading}
              className="btn btn-outline"
            >
              {loading ? "Loading..." : "Request Interpretive Review"}
            </button>
          </div>
        </div>
      )}

      {!acknowledged && (
        <div className="card" style={{ 
          backgroundColor: 'var(--surface-secondary)', 
          borderColor: 'var(--border-primary)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Acknowledgment Required</h3>
          <p className="mb-4" style={{ color: 'var(--ink-secondary)' }}>
            Accessing the Custodial Closet requires acknowledgment of the following:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6" style={{ color: 'var(--ink-secondary)' }}>
            <li>All solutions are for analysis and documentation purposes only</li>
            <li>No execution paths or procedural guidance are provided</li>
            <li>All access is logged for compliance and audit purposes</li>
            <li>Historical context is provided for risk assessment only</li>
          </ul>
          <button
            onClick={() => setAcknowledledged(true)}
            className="btn btn-primary"
          >
            I Acknowledge and Proceed
          </button>
        </div>
      )}

      {acknowledged && (
        <div className="card" style={{ 
          backgroundColor: 'var(--surface-secondary)', 
          borderColor: 'var(--border-primary)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}>
          {error && (
            <ErrorAlert message={error} onDismiss={() => setError("")} />
          )}

          {loading && (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" text="Loading solutions..." />
            </div>
          )}

          {!loading && selectedSolution && (
            <div>
              <button
                onClick={() => setSelectedSolution(null)}
                className="btn btn-outline mb-4"
              >
                ← Back to Solutions
              </button>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--ink-primary)' }}>{selectedSolution.title}</h3>
                  <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>{selectedSolution.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`badge ${DIFFICULTY_COLORS[selectedSolution.difficulty] || "badge-info"}`}>
                      {selectedSolution.difficulty}
                    </span>
                    <span className="badge badge-info">
                      {DEVICE_TYPE_LABELS[selectedSolution.device_type] || selectedSolution.device_type}
                    </span>
                    <span className="badge badge-info">
                      {selectedSolution.estimated_time}
                    </span>
                  </div>
                </div>

                {selectedSolution.warnings.length > 0 && (
                  <div className="alert alert-warning">
                    <div>
                      <strong className="font-semibold" style={{ color: 'var(--ink-primary)' }}>Warnings:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1" style={{ color: 'var(--ink-secondary)' }}>
                        {selectedSolution.warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedSolution.tools_needed.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>Tools Needed:</h4>
                    <ul className="list-disc list-inside" style={{ color: 'var(--ink-secondary)' }}>
                      {selectedSolution.tools_needed.map((tool, idx) => (
                        <li key={idx}>{tool}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--ink-primary)' }}>Solution Steps:</h4>
                  <ol className="list-decimal list-inside space-y-2" style={{ color: 'var(--ink-secondary)' }}>
                    {selectedSolution.solution_steps.map((step, idx) => (
                      <li key={idx} className="pl-2">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {!loading && !selectedSolution && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>
                  Solutions ({solutions.length})
                </h3>
              </div>

              {solutions.length === 0 ? (
                <div className="card text-center py-8">
                  <p style={{ color: 'var(--ink-muted)' }}>No solutions found. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solutions.map((solution) => (
                    <div
                      key={solution.id}
                      className="card cursor-pointer transition-all"
                      onClick={() => setSelectedSolution(solution)}
                      style={{
                        borderColor: 'var(--border-primary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-lg flex-1" style={{ color: 'var(--ink-primary)' }}>{solution.title}</h4>
                        <span className={`badge ${DIFFICULTY_COLORS[solution.difficulty] || "badge-info"} ml-2`}>
                          {solution.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--ink-muted)' }}>
                        {solution.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-info text-xs">
                          {DEVICE_TYPE_LABELS[solution.device_type] || solution.device_type}
                        </span>
                        <span className="badge badge-info text-xs">
                          {solution.estimated_time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
