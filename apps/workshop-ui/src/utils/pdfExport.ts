/**
 * PDF Export Utility
 * Generates branded compliance reports with audit trails
 */

import { auditApi } from '../lib/api-client';

export interface PDFExportOptions {
  deviceId: string;
  reportData: any;
  includeAudit?: boolean;
}

/**
 * Export compliance report as PDF
 * Calls backend to generate branded PDF with compliance disclaimers
 */
export async function exportCompliancePDF(options: PDFExportOptions): Promise<void> {
  const { deviceId, includeAudit = true } = options;

  try {
    // Call audit export endpoint which triggers PDF generation
    const response = await auditApi.export(deviceId);

    if (response.ok) {
      // If download URL is provided, open it
      if (response.download_url) {
        window.open(response.download_url, '_blank');
        return;
      }

      // Otherwise, construct download URL from ForgeWorks API
      const baseUrl = import.meta.env.VITE_FORGEWORKS_API_URL || 'http://localhost:8001';
      const downloadUrl = `${baseUrl}/api/v1/audit/export?device_id=${encodeURIComponent(deviceId)}&include_audit=${includeAudit}`;
      
      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Compliance_Report_${deviceId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      throw new Error(response.error || 'PDF export failed');
    }
  } catch (error: any) {
    console.error('PDF export error:', error);
    throw new Error(error.message || 'Failed to export PDF');
  }
}

/**
 * Format report data for PDF template
 */
export function formatReportData(reportData: any): {
  title: string;
  device: any;
  ownership: any;
  legal: any;
  routing: any;
  audit: any;
  timestamp: string;
} {
  return {
    title: 'Bobby\'s Workshop 3.0 — Compliance Report',
    device: reportData.device || {},
    ownership: reportData.ownership || {},
    legal: reportData.legal || {},
    routing: reportData.routing || {},
    audit: reportData.audit_entries || [],
    timestamp: reportData.report_timestamp || new Date().toISOString(),
  };
}
