// Compliance Summary Page (New Implementation)
// Wired to ForgeWorks API

import { useState, useEffect } from "react";
import { complianceApi, auditApi } from "../lib/api-client";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import { exportCompliancePDF } from "../utils/pdfExport";

interface ComplianceSummaryProps {
  deviceId?: string;
}

export default function ComplianceSummary({ deviceId }: ComplianceSummaryProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (deviceId) {
      loadCompliance();
    }
  }, [deviceId]);

  const loadCompliance = async () => {
    if (!deviceId) {
      setError("No device selected");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await complianceApi.getSummary({
        device_id: deviceId,
        include_audit: true,
      });

      if (response.ok) {
        setResult(response);
      } else {
        setError(response.error || "Failed to load compliance summary");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load compliance summary");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!deviceId || !result) {
      setError("No compliance data available to export");
      return;
    }

    setExporting(true);
    setError("");

    try {
      // Use PDF export utility
      await exportCompliancePDF({
        deviceId,
        reportData: result,
        includeAudit: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  const getClassificationBadge = (classification: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-semibold";
    switch (classification) {
      case 'Permitted':
        return <span className={baseClasses} style={{ backgroundColor: 'rgba(46, 204, 113, 0.2)', color: '#2ECC71' }}>Permitted</span>;
      case 'ConditionallyPermitted':
        return <span className={baseClasses} style={{ backgroundColor: 'rgba(241, 196, 15, 0.2)', color: '#F1C40F' }}>Conditionally Permitted</span>;
      case 'RequiresAuthorization':
        return <span className={baseClasses} style={{ backgroundColor: 'rgba(230, 126, 34, 0.2)', color: '#E67E22' }}>Requires Authorization</span>;
      case 'Prohibited':
        return <span className={baseClasses} style={{ backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#E74C3C' }}>Prohibited</span>;
      default:
        return <span className={baseClasses} style={{ backgroundColor: 'var(--surface-tertiary)', color: 'var(--ink-muted)' }}>Under Review</span>;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Compliance Summary</h2>
        <p style={{ color: 'var(--ink-muted)' }}>
          This assessment documents analysis and jurisdictional considerations only.
          No modification, circumvention, or account interference was performed or advised.
        </p>
      </div>

      {error && (
        <ErrorAlert message={error} onDismiss={() => setError("")} />
      )}

      {!deviceId && (
        <div className="rounded-lg p-12 text-center fade-in" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          <p style={{ color: 'var(--ink-muted)' }}>Select a device to view compliance summary</p>
          <p className="text-sm mt-2" style={{ color: 'var(--ink-muted)' }}>
            Go to Device Analysis tab to analyze a device first
          </p>
        </div>
      )}

      {deviceId && !result && !loading && (
        <div className="rounded-lg p-6" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          <button
            onClick={loadCompliance}
            className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-300"
            style={{
              backgroundColor: 'var(--accent-gold)',
              color: 'var(--ink-inverse)',
              boxShadow: 'var(--glow-gold)',
            }}
          >
            Generate Compliance Summary
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-lg p-12 text-center fade-in" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          <LoadingSpinner size="lg" text="Generating compliance summary..." />
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          {/* Device Information */}
          <div className="rounded-lg p-6 fade-in" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border-primary)'
          }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>Device Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Model:</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>{result.device?.model || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Security State:</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>{result.device?.security_state || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Analysis Type:</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--state-success)' }}>
                  {result.device?.non_invasive ? "Non-Invasive (Read-Only)" : "Analysis"}
                </span>
              </div>
            </div>
          </div>

          {/* Ownership Assessment */}
          <div className="rounded-lg p-6 fade-in" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border-primary)'
          }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>Ownership Assessment</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Verification Status:</span>
                <span className="text-sm font-semibold" style={{
                  color: result.ownership?.verified ? 'var(--state-success)' : 'var(--state-warning)'
                }}>
                  {result.ownership?.verified ? "Verified" : "Not Verified"}
                </span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Confidence Score:</span>
                  <span className="text-sm font-semibold" style={{
                    color: (result.ownership?.confidence || 0) >= 0.85 ? 'var(--state-success)' :
                           (result.ownership?.confidence || 0) >= 0.50 ? 'var(--state-warning)' : 'var(--state-error)'
                  }}>
                    {Math.round((result.ownership?.confidence || 0) * 100)}%
                  </span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(result.ownership?.confidence || 0) * 100}%`,
                      backgroundColor: (result.ownership?.confidence || 0) >= 0.85 ? 'var(--state-success)' :
                                      (result.ownership?.confidence || 0) >= 0.50 ? 'var(--state-warning)' : 'var(--state-error)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Legal Classification */}
          <div className="rounded-lg p-6 fade-in" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border-primary)'
          }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>Legal Classification</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Jurisdiction:</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>{result.legal?.jurisdiction || "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Classification:</span>
                {getClassificationBadge(result.legal?.status || "Unknown")}
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Risk Level:</span>
                <span className="text-sm font-semibold" style={{
                  color: result.legal?.risk_level === "Low" ? 'var(--state-success)' :
                         result.legal?.risk_level === "Medium" ? 'var(--state-warning)' :
                         result.legal?.risk_level === "High" ? 'var(--state-warning)' : 'var(--state-error)'
                }}>
                  {result.legal?.risk_level || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Authority Routing */}
          {result.routing && (
            <div className="rounded-lg p-6 fade-in" style={{ 
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-primary)'
            }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--accent-bronze)' }}>External Authorization Pathways</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Route To:</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>{result.routing.route_to || "N/A"}</span>
                </div>
                <div>
                  <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>Compliance Notes:</span>
                  <p className="text-sm mt-1" style={{ color: 'var(--ink-primary)' }}>{result.routing.compliance_notes || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Audit Trail */}
          {result.audit_entries && result.audit_entries.length > 0 && (
            <div className="rounded-lg p-6 fade-in" style={{ 
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-primary)'
            }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>Audit Trail</h3>
              <div className="space-y-2">
                {result.audit_entries.map((entry: any, idx: number) => (
                  <div key={idx} className="rounded p-3" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>{entry.action}</span>
                      <span className="text-xs px-2 py-1 rounded" style={{
                        backgroundColor: entry.result === "Allowed" ? 'var(--state-success)' :
                                        entry.result === "Blocked" ? 'var(--state-error)' :
                                        'var(--state-warning)',
                        color: 'var(--ink-inverse)',
                        opacity: 0.2
                      }}>
                        <span style={{ 
                          color: entry.result === "Allowed" ? 'var(--state-success)' :
                                 entry.result === "Blocked" ? 'var(--state-error)' :
                                 'var(--state-warning)'
                        }}>{entry.result}</span>
                      </span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>{entry.timestamp}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm" style={{
                  color: result.audit_integrity_verified ? 'var(--state-success)' : 'var(--state-error)'
                }}>
                  {result.audit_integrity_verified ? "✓" : "✗"}
                </span>
                <span className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                  Audit integrity {result.audit_integrity_verified ? "verified" : "failed"}
                </span>
              </div>
            </div>
          )}

          {/* Compliance Disclaimer */}
          <div className="rounded-lg p-4 border" style={{ 
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-primary)' }}>Compliance Statement</h3>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              This platform provides analysis and documentation only.
              No modification, circumvention, or account interference is performed or advised.
              Certain recoveries require third-party authorization.
            </p>
            {result.report_timestamp && (
              <p className="text-xs mt-2" style={{ color: 'var(--ink-muted)' }}>
                Report generated: {new Date(result.report_timestamp).toLocaleString()}
              </p>
            )}
          </div>

          {/* Export Button */}
          <div>
            <button
              onClick={handleExportPDF}
              disabled={loading || !result || exporting}
              className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-300"
              style={{
                backgroundColor: (loading || !result || exporting) ? 'var(--surface-tertiary)' : 'var(--accent-gold)',
                color: (loading || !result || exporting) ? 'var(--ink-muted)' : 'var(--ink-inverse)',
                boxShadow: (loading || !result || exporting) ? 'none' : 'var(--glow-gold)',
                cursor: (loading || !result || exporting) ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading && result && !exporting) {
                  e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && result && !exporting) {
                  e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                }
              }}
            >
              {exporting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Generating PDF...
                </span>
              ) : (
                'Generate Compliance Record (PDF)'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
