/**
 * ACCESS CONTROL ROLES
 * 
 * Defines user roles and permissions for the platform
 */

export enum UserRole {
  CONSUMER = "CONSUMER",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE",
  RESEARCH = "RESEARCH",
  INSTITUTIONAL = "INSTITUTIONAL",
  ADMIN = "ADMIN",
}

export interface RolePermissions {
  role: UserRole;
  deviceAnalysis: boolean;
  ownershipVerification: boolean;
  legalClassification: boolean;
  auditLogAccess: boolean;
  pandoraCodexAccess: boolean;
  authorityRouting: boolean;
  reportGeneration: boolean;
  certificationAccess: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.CONSUMER]: {
    role: UserRole.CONSUMER,
    deviceAnalysis: true,
    ownershipVerification: true,
    legalClassification: false, // Classification results only
    auditLogAccess: false,
    pandoraCodexAccess: false,
    authorityRouting: true,
    reportGeneration: true,
    certificationAccess: false,
  },
  [UserRole.PROFESSIONAL]: {
    role: UserRole.PROFESSIONAL,
    deviceAnalysis: true,
    ownershipVerification: true,
    legalClassification: true, // Full classification
    auditLogAccess: true, // Own logs only
    pandoraCodexAccess: false,
    authorityRouting: true,
    reportGeneration: true,
    certificationAccess: true, // Level I/II
  },
  [UserRole.ENTERPRISE]: {
    role: UserRole.ENTERPRISE,
    deviceAnalysis: true,
    ownershipVerification: true,
    legalClassification: true,
    auditLogAccess: true, // Enterprise logs
    pandoraCodexAccess: true, // Abstract classifications only
    authorityRouting: true,
    reportGeneration: true,
    certificationAccess: true, // All levels
  },
  [UserRole.RESEARCH]: {
    role: UserRole.RESEARCH,
    deviceAnalysis: true,
    ownershipVerification: true,
    legalClassification: true,
    auditLogAccess: true,
    pandoraCodexAccess: true, // Full knowledge index
    authorityRouting: true,
    reportGeneration: true,
    certificationAccess: true,
  },
  [UserRole.INSTITUTIONAL]: {
    role: UserRole.INSTITUTIONAL,
    deviceAnalysis: true,
    ownershipVerification: true,
    legalClassification: true,
    auditLogAccess: true,
    pandoraCodexAccess: true, // Complete access
    authorityRouting: true,
    reportGeneration: true,
    certificationAccess: true,
  },
  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    deviceAnalysis: true,
    ownershipVerification: true,
    legalClassification: true,
    auditLogAccess: true, // All logs
    pandoraCodexAccess: true,
    authorityRouting: true,
    reportGeneration: true,
    certificationAccess: true,
  },
};

/**
 * Check if user has required permission
 */
export function hasPermission(
  role: UserRole,
  permission: keyof Omit<RolePermissions, 'role'>
): boolean {
  return ROLE_PERMISSIONS[role][permission];
}