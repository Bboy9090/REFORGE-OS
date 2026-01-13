// Capability Awareness Module
// This module classifies device capability ceilings and risk profiles
// WITHOUT providing instructions or execution paths
// Uses Pandora Codex ecosystem awareness for risk modeling

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CapabilityClassification {
    pub research_class: String,
    pub risk_profile: RiskProfile,
    pub ui_tone: String,
    pub requires_interpretive_review: bool,
    pub ecosystem_context: String,  // High-level context, never tool names
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RiskProfile {
    pub account: String,
    pub data: String,
    pub legal: String,
}

impl CapabilityClassification {
    /// Classify device based on platform and device class
    /// Uses capability_map.json + Pandora Codex awareness (internal only)
    pub fn classify(device_class: &str, platform: &str) -> CapabilityClassification {
        // This is a classification engine, not an execution engine
        // It assigns risk signals and language choices only
        
        // Map device class to research category (based on Pandora Codex awareness)
        let (research_class, risk_profile, ecosystem_context) = 
            Self::map_device_to_research_class(device_class, platform);

        let ui_tone = Self::determine_ui_tone(&risk_profile);

        CapabilityClassification {
            research_class: research_class.to_string(),
            risk_profile: risk_profile.clone(),
            ui_tone,
            requires_interpretive_review: risk_profile.account == "high" || risk_profile.account == "critical",
            ecosystem_context,
        }
    }

    /// Map device class to research category (internal logic, never exposed)
    fn map_device_to_research_class(device_class: &str, platform: &str) -> (String, RiskProfile, String) {
        match platform {
            "ios" => {
                // iOS device classification based on chip generation
                if device_class.starts_with("A7") || device_class.starts_with("A8") || 
                   device_class.starts_with("A9") || device_class.starts_with("A10") || 
                   device_class.starts_with("A11") {
                    // Hardware-based research era (Checkm8/Palera1n)
                    (
                        "hardware_research".to_string(),
                        RiskProfile {
                            account: "high".to_string(),
                            data: "high".to_string(),
                            legal: "medium".to_string(),
                        },
                        "Legacy hardware with historical research exposure".to_string(),
                    )
                } else if device_class.starts_with("A12") || device_class.starts_with("A13") ||
                          device_class.starts_with("A14") || device_class.starts_with("A15") ||
                          device_class.starts_with("A16") || device_class.starts_with("A17") {
                    // Modern kernel research era (Dopamine/Fugu)
                    (
                        "kernel_research".to_string(),
                        RiskProfile {
                            account: "high".to_string(),
                            data: "high".to_string(),
                            legal: "medium".to_string(),
                        },
                        "Modern ARM64e research category".to_string(),
                    )
                } else if device_class.starts_with("A18") || device_class.starts_with("A19") {
                    // Userland research era (Misaka26)
                    (
                        "userland_research".to_string(),
                        RiskProfile {
                            account: "medium".to_string(),
                            data: "medium".to_string(),
                            legal: "low".to_string(),
                        },
                        "System customization research category".to_string(),
                    )
                } else {
                    // Unknown/unsupported
                    (
                        "unknown".to_string(),
                        RiskProfile {
                            account: "medium".to_string(),
                            data: "medium".to_string(),
                            legal: "medium".to_string(),
                        },
                        "Device class requires further analysis".to_string(),
                    )
                }
            }
            "android" => {
                // Android classification based on chipset
                if device_class.contains("MediaTek") || device_class.contains("MTK") {
                    (
                        "kernel_research".to_string(),
                        RiskProfile {
                            account: "medium".to_string(),
                            data: "high".to_string(),
                            legal: "medium".to_string(),
                        },
                        "MediaTek bootloader research category".to_string(),
                    )
                } else if device_class.contains("Qualcomm") || device_class.contains("Snapdragon") {
                    (
                        "kernel_research".to_string(),
                        RiskProfile {
                            account: "medium".to_string(),
                            data: "high".to_string(),
                            legal: "medium".to_string(),
                        },
                        "Qualcomm bootloader research category".to_string(),
                    )
                } else if device_class.contains("Samsung") || device_class.contains("Exynos") {
                    (
                        "kernel_research".to_string(),
                        RiskProfile {
                            account: "medium".to_string(),
                            data: "high".to_string(),
                            legal: "medium".to_string(),
                        },
                        "Samsung bootloader research category".to_string(),
                    )
                } else {
                    (
                        "kernel_research".to_string(),
                        RiskProfile {
                            account: "medium".to_string(),
                            data: "high".to_string(),
                            legal: "medium".to_string(),
                        },
                        "Android system modification research category".to_string(),
                    )
                }
            }
            _ => {
                (
                    "unknown".to_string(),
                    RiskProfile {
                        account: "medium".to_string(),
                        data: "medium".to_string(),
                        legal: "medium".to_string(),
                    },
                    "Platform requires further analysis".to_string(),
                )
            }
        }
    }

    fn determine_ui_tone(risk: &RiskProfile) -> String {
        match risk.account.as_str() {
            "critical" => "prohibitive".to_string(),
            "high" => "strict".to_string(),
            "medium" => "cautionary".to_string(),
            _ => "informational".to_string(),
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
