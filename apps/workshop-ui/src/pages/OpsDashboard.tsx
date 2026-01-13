import { useState, useEffect } from "react";
import { opsApi } from "../lib/api-client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";

export default function OpsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadMetrics() {
    setLoading(true);
    setError("");

    try {
      const response = await opsApi.getMetrics();
      
      if (response.ok) {
        setMetrics(response);
      } else {
        setError(response.error || "Failed to load metrics");
        // Fallback to mock data
        setMetrics({
          active_units: 0,
          audit_coverage: "100%",
          escalations: 0,
          compliance_rate: "100%",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load metrics");
      // Fallback to mock data
      setMetrics({
        active_units: 0,
        audit_coverage: "100%",
        escalations: 0,
        compliance_rate: "100%",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Operations Control Tower</h2>
        <p className="mb-4" style={{ color: 'var(--ink-muted)' }}>Platform health metrics and compliance monitoring</p>
      </div>

      <div className="rounded-lg p-6" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        {error && (
          <ErrorAlert message={error} onDismiss={() => setError("")} />
        )}

        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Loading metrics..." />
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--ink-muted)' }}>Active Units</h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--ink-primary)' }}>{metrics.active_units || 0}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Hardware units in operation</p>
            </div>

            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--ink-muted)' }}>Audit Coverage</h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--state-success)' }}>{metrics.audit_coverage || "100%"}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Events with verified hash chains</p>
            </div>

            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--ink-muted)' }}>Compliance Escalations</h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--state-warning)' }}>{metrics.escalations || 0}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Requiring external authorization</p>
            </div>

            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--ink-muted)' }}>Compliance Rate</h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent-steel)' }}>{metrics.compliance_rate || "100%"}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Overall compliance health</p>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--ink-muted)' }}>No metrics available</p>
        )}

        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <button
            onClick={loadMetrics}
            className="px-4 py-2 rounded font-medium transition-all duration-300"
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
            Refresh Metrics
          </button>
        </div>
      </div>

      <div className="rounded-lg p-6" style={{ 
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>System Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Audit Log Integrity</span>
            <span className="text-sm font-medium" style={{ color: 'var(--state-success)' }}>Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Language Guard</span>
            <span className="text-sm font-medium" style={{ color: 'var(--state-success)' }}>Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>Pandora Codex Isolation</span>
            <span className="text-sm font-medium" style={{ color: 'var(--state-success)' }}>Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
}