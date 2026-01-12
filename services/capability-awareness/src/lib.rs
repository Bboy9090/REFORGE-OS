// Capability Awareness Module
// This module classifies device capability ceilings and risk profiles
// WITHOUT providing instructions or execution paths

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CapabilityClassification {
    pub research_class: String,
    pub risk_profile: RiskProfile,
    pub ui_tone: String,
    pub requires_interpretive_review: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RiskProfile {
    pub account: String,
    pub data: String,
    pub legal: String,
}

impl CapabilityClassification {
    pub fn classify(device_class: &str, platform: &str) -> CapabilityClassification {
        // This is a classification engine, not an execution engine
        // It assigns risk signals and language choices only
        
        let research_class = match platform {
            "ios" => "hardware_research",
            "android" => "kernel_research",
            _ => "unknown",
        };

        let risk_profile = RiskProfile {
            account: "high".to_string(),
            data: "high".to_string(),
            legal: "medium".to_string(),
        };

        CapabilityClassification {
            research_class: research_class.to_string(),
            risk_profile,
            ui_tone: "strict".to_string(),
            requires_interpretive_review: true,
        }
    }

    pub fn get_warning_level(&self) -> String {
        match self.risk_profile.account.as_str() {
            "critical" => "prohibitive",
            "high" => "strict",
            "medium" => "cautionary",
            _ => "informational",
        }.to_string()
    }
}
