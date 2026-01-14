// Report History / Archive Viewer
// View past compliance reports with search and filter

import React, { useState, useEffect } from 'react';
import { ForgeWorksAPI } from '../services/api';
import { ComplianceReport } from '../types/api';

export default function ReportHistory() {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [filter, setFilter] = useState<'all' | 'permitted' | 'conditional' | 'prohibited'>('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, this would call an API endpoint
      // const response = await fetch('/api/v1/reports/history');
      // const data = await response.json();
      // setReports(data.reports);

      // Mock data for now
      setReports([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.auditReference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || report.legal.classification === filter;

    return matchesSearch && matchesFilter;
  });

  const exportReport = async (report: ComplianceReport) => {
    try {
      // Trigger PDF export
      const blob = await ForgeWorksAPI.exportAuditLog(report.device.model);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Compliance_Report_${report.auditReference}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export report');
    }
  };

  return (
    <section className="report-history">
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Report History</h2>
            <p style={{ color: 'var(--ink-secondary)' }}>View and manage past compliance reports</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="rounded-lg shadow-sm border p-4 mb-6" style={{ 
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)'
        }}>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by device model or audit reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--surface-tertiary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--ink-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor: 'var(--surface-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--ink-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <option value="all">All Classifications</option>
              <option value="permitted">Permitted</option>
              <option value="conditional">Conditionally Permitted</option>
              <option value="prohibited">Prohibited</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ 
              borderColor: 'var(--accent-gold)',
              borderTopColor: 'transparent'
            }}></div>
          </div>
        )}

        {error && (
          <div className="border px-4 py-3 rounded mb-6" style={{ 
            backgroundColor: 'var(--state-error)',
            borderColor: 'var(--state-error)',
            color: 'var(--ink-primary)',
            opacity: 0.1
          }}>
            <div style={{ color: 'var(--state-error)' }}>{error}</div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Report List */}
            <div className="rounded-lg shadow-sm border" style={{ 
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)'
            }}>
              {filteredReports.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--ink-muted)' }}>
                  <p>No reports found</p>
                  <p className="text-sm mt-2">Generate your first compliance report to see it here</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                  {filteredReports.map((report) => (
                    <div
                      key={report.auditReference}
                      className="p-4 cursor-pointer transition-colors"
                      style={{ 
                        borderColor: 'var(--border-primary)',
                        hover: { backgroundColor: 'var(--surface-tertiary)' }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{report.device.model}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${
                              report.legal.classification === 'permitted' ? '' :
                              report.legal.classification === 'conditional' ? '' :
                              ''
                            }`} style={{
                              backgroundColor: report.legal.classification === 'permitted' ? 'var(--state-success)' :
                                             report.legal.classification === 'conditional' ? 'var(--state-warning)' :
                                             'var(--state-error)',
                              color: 'var(--ink-primary)',
                              opacity: 0.2
                            }}>
                              {report.legal.classification}
                            </span>
                          </div>
                          <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>
                            {report.device.platform} • {report.legal.jurisdiction}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
                            Audit Reference: {report.auditReference}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportReport(report);
                            }}
                            className="px-3 py-1 text-sm rounded transition-all duration-300"
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
                            Export
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
              <div className="fixed inset-0 flex items-center justify-center z-50" style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}>
                <div className="rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ 
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-primary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>Report Details</h3>
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="text-2xl transition-colors"
                        style={{ color: 'var(--ink-muted)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--ink-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--ink-muted)';
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    {/* Render full report details here */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>Device Information</h4>
                        <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>{selectedReport.device.model}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>Legal Classification</h4>
                        <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>{selectedReport.legal.classification}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>Audit Reference</h4>
                        <p className="text-sm font-mono mt-1" style={{ color: 'var(--ink-secondary)' }}>{selectedReport.auditReference}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={() => exportReport(selectedReport)}
                        className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300"
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
                        Export Full Report (PDF)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
