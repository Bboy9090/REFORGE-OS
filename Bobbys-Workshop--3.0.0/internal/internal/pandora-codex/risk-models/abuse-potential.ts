/**
 * RISK MODEL: ABUSE POTENTIAL
 * 
 * INTERNAL ONLY - For classification and risk assessment
 * 
 * Measures potential for misuse/abuse of tool categories
 */

export enum AbusePotential {
  MINIMAL = "MINIMAL",     // Diagnostic/analysis only
  LOW = "LOW",             // Requires technical expertise
  MODERATE = "MODERATE",   // Consumer-accessible but complex
  HIGH = "HIGH",           // Consumer-friendly interfaces
  EXTREME = "EXTREME"      // One-click, automated abuse risk
}

export interface AbusePotentialModel {
  toolCategory: string;
  abusePotential: AbusePotential;
  factors: string[];
  mitigation: string[];
  classificationImpact: string;
}

/**
 * Abuse potential database (for risk scoring)
 */
export const ABUSE_POTENTIAL_DB: AbusePotentialModel[] = [
  {
    toolCategory: "Hardware Exploit",
    abusePotential: AbusePotential.MODERATE,
    factors: ["Requires hardware access", "Technical expertise needed"],
    mitigation: ["Ownership verification", "Authorization gates"],
    classificationImpact: "Flags hardware modification scenarios"
  },
  {
    toolCategory: "One-Click Root",
    abusePotential: AbusePotential.EXTREME,
    factors: ["Consumer-friendly", "Automated process"],
    mitigation: ["Strict ownership checks", "Education requirements"],
    classificationImpact: "High-risk classification required"
  },
  {
    toolCategory: "Professional Service Tool",
    abusePotential: AbusePotential.LOW,
    factors: ["Enterprise-focused", "License required"],
    mitigation: ["License verification", "Audit logging"],
    classificationImpact: "Enterprise-tier classification"
  },
  {
    toolCategory: "IMEI Repair",
    abusePotential: AbusePotential.HIGH,
    factors: ["Can enable fraud", "Service-level access"],
    mitigation: ["Service center authorization", "Court orders"],
    classificationImpact: "Requires highest authorization level"
  }
];

/**
 * Get abuse-adjusted risk classification
 */
export function getAbuseAdjustedClassification(
  toolCategory: string
): AbusePotentialModel | null {
  return ABUSE_POTENTIAL_DB.find(m => m.toolCategory === toolCategory) || null;
}