/**
 * PANDORA CODEX ACCESS CONTROL
 * 
 * INTERNAL ONLY - Defines who can see what
 */

export enum AccessLevel {
  NONE = "NONE",
  ENTERPRISE = "ENTERPRISE",     // Risk classifications only
  RESEARCH = "RESEARCH",         // Full knowledge index
  INSTITUTIONAL = "INSTITUTIONAL" // Complete access + custom models
}

export interface PandoraAccess {
  level: AccessLevel;
  canViewRiskModels: boolean;
  canViewToolClassifications: boolean;
  canViewHistoricalContext: boolean;
  canExportKnowledge: boolean;
  canCreateCustomModels: boolean;
}

/**
 * Access level definitions
 */
export const ACCESS_LEVELS: Record<AccessLevel, PandoraAccess> = {
  [AccessLevel.NONE]: {
    level: AccessLevel.NONE,
    canViewRiskModels: false,
    canViewToolClassifications: false,
    canViewHistoricalContext: false,
    canExportKnowledge: false,
    canCreateCustomModels: false
  },
  [AccessLevel.ENTERPRISE]: {
    level: AccessLevel.ENTERPRISE,
    canViewRiskModels: true,
    canViewToolClassifications: true, // Abstract classifications only
    canViewHistoricalContext: false,
    canExportKnowledge: false,
    canCreateCustomModels: false
  },
  [AccessLevel.RESEARCH]: {
    level: AccessLevel.RESEARCH,
    canViewRiskModels: true,
    canViewToolClassifications: true, // Full classifications
    canViewHistoricalContext: true,
    canExportKnowledge: true, // With authorization
    canCreateCustomModels: false
  },
  [AccessLevel.INSTITUTIONAL]: {
    level: AccessLevel.INSTITUTIONAL,
    canViewRiskModels: true,
    canViewToolClassifications: true,
    canViewHistoricalContext: true,
    canExportKnowledge: true,
    canCreateCustomModels: true
  }
};

/**
 * Check if user has required access level
 */
export function hasAccess(
  userLevel: AccessLevel,
  requiredLevel: AccessLevel
): boolean {
  const levelHierarchy = [
    AccessLevel.NONE,
    AccessLevel.ENTERPRISE,
    AccessLevel.RESEARCH,
    AccessLevel.INSTITUTIONAL
  ];
  
  return levelHierarchy.indexOf(userLevel) >= levelHierarchy.indexOf(requiredLevel);
}

/**
 * Get filtered knowledge based on access level
 */
export function filterByAccessLevel(
  knowledge: any,
  accessLevel: AccessLevel
): any {
  const access = ACCESS_LEVELS[accessLevel];
  
  // Filter based on access permissions
  // Implementation depends on knowledge structure
  // This is a placeholder for the actual filtering logic
  
  if (!access.canViewToolClassifications) {
    // Remove tool-specific classifications
  }
  
  if (!access.canViewHistoricalContext) {
    // Remove historical references
  }
  
  return knowledge;
}