/**
 * PERMISSION MATRIX
 * 
 * Detailed permission matrix for all platform features
 */

import { UserRole, hasPermission } from './roles';

export enum Feature {
  DEVICE_ANALYSIS = "DEVICE_ANALYSIS",
  OWNERSHIP_VERIFICATION = "OWNERSHIP_VERIFICATION",
  LEGAL_CLASSIFICATION = "LEGAL_CLASSIFICATION",
  AUDIT_LOG_VIEW = "AUDIT_LOG_VIEW",
  AUDIT_LOG_EXPORT = "AUDIT_LOG_EXPORT",
  PANDORA_CODEX_ABSTRACT = "PANDORA_CODEX_ABSTRACT",
  PANDORA_CODEX_FULL = "PANDORA_CODEX_FULL",
  AUTHORITY_ROUTING = "AUTHORITY_ROUTING",
  REPORT_GENERATION = "REPORT_GENERATION",
  CERTIFICATION_LEVEL_I = "CERTIFICATION_LEVEL_I",
  CERTIFICATION_LEVEL_II = "CERTIFICATION_LEVEL_II",
  CERTIFICATION_LEVEL_III = "CERTIFICATION_LEVEL_III",
}

/**
 * Permission matrix: Role → Feature → Allowed
 */
export const PERMISSION_MATRIX: Record<UserRole, Record<Feature, boolean>> = {
  [UserRole.CONSUMER]: {
    [Feature.DEVICE_ANALYSIS]: true,
    [Feature.OWNERSHIP_VERIFICATION]: true,
    [Feature.LEGAL_CLASSIFICATION]: false,
    [Feature.AUDIT_LOG_VIEW]: false,
    [Feature.AUDIT_LOG_EXPORT]: false,
    [Feature.PANDORA_CODEX_ABSTRACT]: false,
    [Feature.PANDORA_CODEX_FULL]: false,
    [Feature.AUTHORITY_ROUTING]: true,
    [Feature.REPORT_GENERATION]: true,
    [Feature.CERTIFICATION_LEVEL_I]: false,
    [Feature.CERTIFICATION_LEVEL_II]: false,
    [Feature.CERTIFICATION_LEVEL_III]: false,
  },
  [UserRole.PROFESSIONAL]: {
    [Feature.DEVICE_ANALYSIS]: true,
    [Feature.OWNERSHIP_VERIFICATION]: true,
    [Feature.LEGAL_CLASSIFICATION]: true,
    [Feature.AUDIT_LOG_VIEW]: true, // Own logs
    [Feature.AUDIT_LOG_EXPORT]: true, // Own logs
    [Feature.PANDORA_CODEX_ABSTRACT]: false,
    [Feature.PANDORA_CODEX_FULL]: false,
    [Feature.AUTHORITY_ROUTING]: true,
    [Feature.REPORT_GENERATION]: true,
    [Feature.CERTIFICATION_LEVEL_I]: true,
    [Feature.CERTIFICATION_LEVEL_II]: true,
    [Feature.CERTIFICATION_LEVEL_III]: false,
  },
  [UserRole.ENTERPRISE]: {
    [Feature.DEVICE_ANALYSIS]: true,
    [Feature.OWNERSHIP_VERIFICATION]: true,
    [Feature.LEGAL_CLASSIFICATION]: true,
    [Feature.AUDIT_LOG_VIEW]: true, // Enterprise logs
    [Feature.AUDIT_LOG_EXPORT]: true, // Enterprise logs
    [Feature.PANDORA_CODEX_ABSTRACT]: true,
    [Feature.PANDORA_CODEX_FULL]: false,
    [Feature.AUTHORITY_ROUTING]: true,
    [Feature.REPORT_GENERATION]: true,
    [Feature.CERTIFICATION_LEVEL_I]: true,
    [Feature.CERTIFICATION_LEVEL_II]: true,
    [Feature.CERTIFICATION_LEVEL_III]: true,
  },
  [UserRole.RESEARCH]: {
    [Feature.DEVICE_ANALYSIS]: true,
    [Feature.OWNERSHIP_VERIFICATION]: true,
    [Feature.LEGAL_CLASSIFICATION]: true,
    [Feature.AUDIT_LOG_VIEW]: true,
    [Feature.AUDIT_LOG_EXPORT]: true,
    [Feature.PANDORA_CODEX_ABSTRACT]: true,
    [Feature.PANDORA_CODEX_FULL]: true,
    [Feature.AUTHORITY_ROUTING]: true,
    [Feature.REPORT_GENERATION]: true,
    [Feature.CERTIFICATION_LEVEL_I]: true,
    [Feature.CERTIFICATION_LEVEL_II]: true,
    [Feature.CERTIFICATION_LEVEL_III]: true,
  },
  [UserRole.INSTITUTIONAL]: {
    [Feature.DEVICE_ANALYSIS]: true,
    [Feature.OWNERSHIP_VERIFICATION]: true,
    [Feature.LEGAL_CLASSIFICATION]: true,
    [Feature.AUDIT_LOG_VIEW]: true,
    [Feature.AUDIT_LOG_EXPORT]: true,
    [Feature.PANDORA_CODEX_ABSTRACT]: true,
    [Feature.PANDORA_CODEX_FULL]: true,
    [Feature.AUTHORITY_ROUTING]: true,
    [Feature.REPORT_GENERATION]: true,
    [Feature.CERTIFICATION_LEVEL_I]: true,
    [Feature.CERTIFICATION_LEVEL_II]: true,
    [Feature.CERTIFICATION_LEVEL_III]: true,
  },
  [UserRole.ADMIN]: {
    [Feature.DEVICE_ANALYSIS]: true,
    [Feature.OWNERSHIP_VERIFICATION]: true,
    [Feature.LEGAL_CLASSIFICATION]: true,
    [Feature.AUDIT_LOG_VIEW]: true, // All logs
    [Feature.AUDIT_LOG_EXPORT]: true, // All logs
    [Feature.PANDORA_CODEX_ABSTRACT]: true,
    [Feature.PANDORA_CODEX_FULL]: true,
    [Feature.AUTHORITY_ROUTING]: true,
    [Feature.REPORT_GENERATION]: true,
    [Feature.CERTIFICATION_LEVEL_I]: true,
    [Feature.CERTIFICATION_LEVEL_II]: true,
    [Feature.CERTIFICATION_LEVEL_III]: true,
  },
};

/**
 * Check feature access for role
 */
export function hasFeatureAccess(role: UserRole, feature: Feature): boolean {
  return PERMISSION_MATRIX[role]?.[feature] ?? false;
}