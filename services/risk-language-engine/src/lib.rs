// Risk Language Engine
// Shapes UI copy, warnings, and routing language based on tool ecosystem awareness
// WITHOUT exposing tool names, steps, or execution paths

use serde::{Deserialize, Serialize};
use capability_awareness::{CapabilityClassification, RiskProfile};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LanguageOutput {
    pub tone: String,                    // strict, cautionary, prohibitive, informational
    pub warning_level: String,           // elevated, standard, minimal
    pub recommended_path: String,        // external_authorization_required, conditional_review, permitted
    pub user_facing_copy: String,        // Safe, elegant language for UI
    pub compliance_disclaimer: String,   // Auto-included in reports
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DeviceContext {
    pub platform: String,                // ios, android
    pub device_class: String,            // A11, A12-A17, MediaTek, Qualcomm, etc.
    pub ownership_confidence: u8,        // 0-100
    pub jurisdiction: String,            // us, eu, global
}

impl LanguageOutput {
    /// Generate elegant, regulator-safe language based on device context and risk profile
    pub fn shape_language(
        context: &DeviceContext,
        classification: &CapabilityClassification,
    ) -> LanguageOutput {
        let risk_profile = &classification.risk_profile;
        
        // Determine tone based on risk levels
        let tone = Self::determine_tone(risk_profile);
        
        // Determine warning level
        let warning_level = Self::determine_warning_level(risk_profile);
        
        // Determine recommended path
        let recommended_path = Self::determine_path(risk_profile, context.ownership_confidence);
        
        // Generate user-facing copy (elegant, safe, never mentions tools)
        let user_facing_copy = Self::generate_user_copy(context, classification);
        
        // Generate compliance disclaimer
        let compliance_disclaimer = Self::generate_disclaimer(context, classification);
        
        LanguageOutput {
            tone,
            warning_level,
            recommended_path,
            user_facing_copy,
            compliance_disclaimer,
        }
    }
    
    fn determine_tone(risk: &RiskProfile) -> String {
        match risk.account.as_str() {
            "critical" => "prohibitive".to_string(),
            "high" => "strict".to_string(),
            "medium" => "cautionary".to_string(),
            _ => "informational".to_string(),
        }
    }
    
    fn determine_warning_level(risk: &RiskProfile) -> String {
        if risk.account == "critical" || risk.legal == "high" {
            "elevated".to_string()
        } else if risk.account == "high" || risk.data == "high" {
            "standard".to_string()
        } else {
            "minimal".to_string()
        }
    }
    
    fn determine_path(risk: &RiskProfile, confidence: u8) -> String {
        if risk.account == "critical" {
            "external_authorization_required".to_string()
        } else if risk.account == "high" && confidence < 85 {
            "external_authorization_required".to_string()
        } else if risk.legal == "high" {
            "external_authorization_required".to_string()
        } else if risk.account == "high" || risk.data == "high" {
            "conditional_review".to_string()
        } else {
            "permitted".to_string()
        }
    }
    
    fn generate_user_copy(context: &DeviceContext, classification: &CapabilityClassification) -> String {
        let platform_label = match context.platform.as_str() {
            "ios" => "iOS device",
            "android" => "Android device",
            _ => "device",
        };
        
        match classification.research_class.as_str() {
            "hardware_research" => {
                format!(
                    "This {} class has historically been the subject of independent security research. \
                    Any modification outside manufacturer authorization may carry significant account-level \
                    and data-loss risk. External authorization is recommended.",
                    platform_label
                )
            }
            "kernel_research" => {
                format!(
                    "This {} class has been subject to system-level modification research. \
                    Unauthorized modification may result in data loss, account restrictions, \
                    or service term violations. External authorization may be required.",
                    platform_label
                )
            }
            "account_bypass_vectors" => {
                format!(
                    "This {} class has been subject to account-level modification attempts. \
                    Such activity carries critical account risk, potential data loss, and legal exposure. \
                    External authorization is required before proceeding.",
                    platform_label
                )
            }
            "userland_research" => {
                format!(
                    "This {} class has been subject to user-level customization research. \
                    Proceeding requires understanding of potential account and data risks.",
                    platform_label
                )
            }
            _ => {
                format!(
                    "This {} requires analysis to determine appropriate recovery pathways. \
                    External authorization may be required.",
                    platform_label
                )
            }
        }
    }
    
    fn generate_disclaimer(context: &DeviceContext, classification: &CapabilityClassification) -> String {
        format!(
            "Security Context: Devices in this class have historically been subject to independent \
            security research. Unauthorized modification may result in permanent account restrictions, \
            data loss, or legal exposure. Bobby's Workshop does not facilitate such activity. \
            This assessment documents analysis only. No modification or circumvention was performed. \
            All activity is logged for compliance. Audit reference: [AUTO-GENERATED]"
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_high_risk_language() {
        let context = DeviceContext {
            platform: "ios".to_string(),
            device_class: "A11".to_string(),
            ownership_confidence: 70,
            jurisdiction: "us".to_string(),
        };
        
        let classification = CapabilityClassification {
            research_class: "hardware_research".to_string(),
            risk_profile: RiskProfile {
                account: "high".to_string(),
                data: "high".to_string(),
                legal: "medium".to_string(),
            },
            ui_tone: "strict".to_string(),
            requires_interpretive_review: true,
        };
        
        let output = LanguageOutput::shape_language(&context, &classification);
        
        assert_eq!(output.tone, "strict");
        assert_eq!(output.warning_level, "standard");
        assert!(output.user_facing_copy.contains("external authorization"));
    }
}
