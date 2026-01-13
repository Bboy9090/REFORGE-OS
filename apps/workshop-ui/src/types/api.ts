// API Type Definitions
// Safe, analysis-only types - no execution types

export interface DeviceProfile {
  model: string;
  platform: string;
  deviceClass: string;
  securityState: string;
  capabilityClass: string;
}

export interface OwnershipAttestation {
  id: string;
  deviceId: string;
  attestorType: 'user' | 'enterprise' | 'executor';
  confidence: number; // 0-100
  createdAt: string;
}

export interface LegalClassification {
  id: string;
  deviceId: string;
  jurisdiction: string;
  classification: 'permitted' | 'conditional' | 'prohibited';
  rationale: string;
  createdAt: string;
}

export interface LanguageOutput {
  tone: string;
  warning_level: string;
  recommended_path: string;
  user_facing_copy: string;
  compliance_disclaimer: string;
}

export interface ComplianceReport {
  device: DeviceProfile;
  ownership: OwnershipAttestation;
  legal: LegalClassification;
  language: LanguageOutput;
  auditReference: string;
  generatedAt: string;
}

export interface AuthorityRoute {
  id: string;
  deviceId: string;
  authorityType: 'oem' | 'carrier' | 'court';
  reference: string;
  contactPath: string;
  documentationRequired: string[];
  createdAt: string;
}

export interface ApiError {
  error: string;
  message?: string;
  detail?: string;
  code?: string;
  timestamp?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  deviceId?: string;
  userId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface AuditEventsResponse {
  events: AuditEvent[];
  total: number;
  limit: number;
  offset: number;
}
