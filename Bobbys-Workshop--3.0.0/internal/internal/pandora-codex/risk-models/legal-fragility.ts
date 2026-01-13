/**
 * RISK MODEL: LEGAL FRAGILITY
 * 
 * INTERNAL ONLY - For classification and jurisdiction awareness
 * 
 * Measures legal sensitivity of tool categories by jurisdiction
 */

export enum Jurisdiction {
  US = "US",
  EU = "EU",
  UK = "UK",
  CANADA = "CANADA",
  AUSTRALIA = "AUSTRALIA",
  GLOBAL = "GLOBAL"
}

export enum LegalFragility {
  LOW = "LOW",           // Well-established legal framework
  MODERATE = "MODERATE", // Some ambiguity
  HIGH = "HIGH",         // Significant legal risk
  EXTREME = "EXTREME"    // Prohibited or highly restricted
}

export interface LegalFragilityModel {
  toolCategory: string;
  jurisdiction: Jurisdiction;
  fragility: LegalFragility;
  notes: string;
  authorizationRequired: boolean;
  courtOrderRequired: boolean;
}

/**
 * Legal fragility database (for classification only)
 */
export const LEGAL_FRAGILITY_DB: LegalFragilityModel[] = [
  {
    toolCategory: "Hardware Exploit",
    jurisdiction: Jurisdiction.US,
    fragility: LegalFragility.MODERATE,
    notes: "DMCA Section 1201 exemption possible with authorization",
    authorizationRequired: true,
    courtOrderRequired: false
  },
  {
    toolCategory: "Activation Bypass",
    jurisdiction: Jurisdiction.US,
    fragility: LegalFragility.HIGH,
    notes: "Requires proof of ownership and authorization",
    authorizationRequired: true,
    courtOrderRequired: false
  },
  {
    toolCategory: "IMEI Repair",
    jurisdiction: Jurisdiction.US,
    fragility: LegalFragility.EXTREME,
    notes: "Highly restricted, typically requires service authorization",
    authorizationRequired: true,
    courtOrderRequired: true
  },
  {
    toolCategory: "Systemless Root",
    jurisdiction: Jurisdiction.US,
    fragility: LegalFragility.MODERATE,
    notes: "Ownership verification required, research exemption possible",
    authorizationRequired: true,
    courtOrderRequired: false
  },
  {
    toolCategory: "Hardware Exploit",
    jurisdiction: Jurisdiction.EU,
    fragility: LegalFragility.HIGH,
    notes: "GDPR considerations, research exemptions vary by country",
    authorizationRequired: true,
    courtOrderRequired: false
  }
];

/**
 * Get legal fragility for classification
 */
export function getLegalFragility(
  toolCategory: string,
  jurisdiction: Jurisdiction
): LegalFragilityModel | null {
  return LEGAL_FRAGILITY_DB.find(
    m => m.toolCategory === toolCategory && 
         (m.jurisdiction === jurisdiction || m.jurisdiction === Jurisdiction.GLOBAL)
  ) || null;
}