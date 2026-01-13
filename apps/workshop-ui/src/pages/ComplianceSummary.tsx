// Compliance Summary Page
// One-screen truth for users, shops, and regulators
// Includes auto-generated compliance disclaimer

import React from 'react';
import { ComplianceReport } from '../types/api';

interface ComplianceSummaryProps {
  report: ComplianceReport;
  onExportPDF: () => void;
}

export default function ComplianceSummary({ report, onExportPDF }: ComplianceSummaryProps) {
  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'permitted':
        return <span className="badge badge-permitted">Permitted</span>;
      case 'conditional':
        return <span className="badge badge-conditional">Conditionally Permitted</span>;
      case 'prohibited':
        return <span className="badge badge-prohibited">Prohibited</span>;
      default:
        return <span className="badge badge-unknown">Under Review</span>;
    }
  };

  return (
    <section className="compliance-summary">
      <div className="container">
        <h2>Compliance Summary</h2>
        
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Device Information</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="label">Model:</span>
                <span className="value">{report.device.model}</span>
              </div>
              <div className="info-item">
                <span className="label">Platform:</span>
                <span className="value">{report.device.platform}</span>
              </div>
              <div className="info-item">
                <span className="label">Security State:</span>
                <span className="value">{report.device.securityState}</span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h3>Ownership Assessment</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="label">Attestation Type:</span>
                <span className="value">{report.ownership.attestorType}</span>
              </div>
              <div className="info-item">
                <span className="label">Confidence Score:</span>
                <span className={`value confidence-${report.ownership.confidence >= 85 ? 'high' : report.ownership.confidence >= 70 ? 'medium' : 'low'}`}>
                  {report.ownership.confidence}%
                </span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h3>Legal Classification</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="label">Jurisdiction:</span>
                <span className="value">{report.legal.jurisdiction}</span>
              </div>
              <div className="info-item">
                <span className="label">Classification:</span>
                <div className="value">
                  {getClassificationBadge(report.legal.classification)}
                </div>
              </div>
              <div className="info-item">
                <span className="label">Rationale:</span>
                <span className="value">{report.legal.rationale}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="compliance-disclaimer">
          <h3>Compliance Statement</h3>
          <p className="disclaimer-text">{report.language.compliance_disclaimer}</p>
        </div>

        <div className="audit-section">
          <h3>Audit Trail</h3>
          <div className="audit-info">
            <div className="audit-item">
              <span className="label">Audit Reference ID:</span>
              <span className="value monospace">{report.auditReference}</span>
            </div>
            <div className="audit-item">
              <span className="label">Report Generated:</span>
              <span className="value">{new Date(report.generatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="actions">
          <button onClick={onExportPDF} className="btn btn-primary">
            Export Compliance Report (PDF)
          </button>
        </div>
      </div>
    </section>
  );
}
