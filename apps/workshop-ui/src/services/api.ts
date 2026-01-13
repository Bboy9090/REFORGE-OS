// API Service Layer
// Safe, analysis-only endpoints - no execution endpoints

import { 
  DeviceProfile, 
  OwnershipAttestation, 
  LegalClassification, 
  LanguageOutput,
  ComplianceReport,
  AuthorityRoute
} from '../types/api';

const API_BASE = '/api/v1';

export class ForgeWorksAPI {
  // Device Analysis
  static async analyzeDevice(metadata: any): Promise<DeviceProfile> {
    const response = await fetch(`${API_BASE}/device/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    });
    if (!response.ok) throw new Error('Device analysis failed');
    return response.json();
  }

  // Ownership Verification
  static async verifyOwnership(
    deviceId: string, 
    attestations: any
  ): Promise<OwnershipAttestation> {
    const response = await fetch(`${API_BASE}/ownership/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, attestations }),
    });
    if (!response.ok) throw new Error('Ownership verification failed');
    return response.json();
  }

  // Legal Classification
  static async classifyLegal(
    deviceId: string,
    jurisdiction: string
  ): Promise<LegalClassification> {
    const response = await fetch(`${API_BASE}/legal/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, jurisdiction }),
    });
    if (!response.ok) throw new Error('Legal classification failed');
    return response.json();
  }

  // Language Shaping (uses risk-language-engine)
  static async shapeLanguage(
    deviceContext: any,
    classification: any
  ): Promise<LanguageOutput> {
    const response = await fetch(`${API_BASE}/language/shape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceContext, classification }),
    });
    if (!response.ok) throw new Error('Language shaping failed');
    return response.json();
  }

  // Authority Routing
  static async getAuthorityRoutes(
    deviceId: string,
    classification: string
  ): Promise<AuthorityRoute[]> {
    const response = await fetch(`${API_BASE}/route/authority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, classification }),
    });
    if (!response.ok) throw new Error('Authority routing failed');
    return response.json();
  }

  // Generate Compliance Report
  static async generateComplianceReport(
    deviceId: string
  ): Promise<ComplianceReport> {
    const response = await fetch(`${API_BASE}/report/compliance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    if (!response.ok) throw new Error('Report generation failed');
    return response.json();
  }

  // Audit Log Export
  static async exportAuditLog(deviceId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}/audit/export?deviceId=${deviceId}`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Audit export failed');
    return response.blob();
  }
}

// Forbidden endpoints (these should never exist):
// - /execute
// - /apply
// - /tool
// - /bypass
// - /unlock
// - /jailbreak
// - /root
