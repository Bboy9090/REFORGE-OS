/**
 * RISK MODEL: TOOL VOLATILITY
 * 
 * INTERNAL ONLY - For classification and risk assessment
 * 
 * Measures how quickly tool capabilities change in the ecosystem
 * High volatility = higher risk of classification mismatch
 */

export enum ToolVolatility {
  STABLE = "STABLE",        // Tool unchanged for 6+ months
  MODERATE = "MODERATE",    // Updates quarterly
  HIGH = "HIGH",            // Monthly updates
  EXTREME = "EXTREME"       // Weekly/daily updates
}

export interface ToolVolatilityModel {
  toolName: string;
  category: string;
  volatility: ToolVolatility;
  lastUpdate: Date;
  updateFrequency: string;
  riskAdjustment: number; // 0.0 - 1.0 multiplier for risk scoring
}

/**
 * Tool volatility database (abstract classifications only)
 */
export const TOOL_VOLATILITY_DB: ToolVolatilityModel[] = [
  {
    toolName: "Palera1n",
    category: "Hardware Exploit",
    volatility: ToolVolatility.STABLE,
    lastUpdate: new Date("2024-01-01"),
    updateFrequency: "Quarterly",
    riskAdjustment: 0.9 // Stable = lower risk adjustment
  },
  {
    toolName: "Dopamine",
    category: "Userland Exploit",
    volatility: ToolVolatility.MODERATE,
    lastUpdate: new Date("2024-12-01"),
    updateFrequency: "Monthly",
    riskAdjustment: 1.0
  },
  {
    toolName: "Misaka26",
    category: "Kernel Exploit",
    volatility: ToolVolatility.HIGH,
    lastUpdate: new Date("2025-01-01"),
    updateFrequency: "Bi-weekly",
    riskAdjustment: 1.2 // Higher volatility = higher risk
  },
  {
    toolName: "Magisk",
    category: "Systemless Root",
    volatility: ToolVolatility.MODERATE,
    lastUpdate: new Date("2024-12-01"),
    updateFrequency: "Monthly",
    riskAdjustment: 1.0
  },
  {
    toolName: "KernelSU",
    category: "Kernel Root",
    volatility: ToolVolatility.MODERATE,
    lastUpdate: new Date("2024-11-01"),
    updateFrequency: "Monthly",
    riskAdjustment: 1.0
  }
];

/**
 * Get volatility-adjusted risk score
 */
export function getVolatilityAdjustedRisk(
  baseRisk: number,
  toolName: string
): number {
  const tool = TOOL_VOLATILITY_DB.find(t => t.toolName === toolName);
  if (!tool) {
    return baseRisk; // Unknown tool = no adjustment
  }
  
  return baseRisk * tool.riskAdjustment;
}