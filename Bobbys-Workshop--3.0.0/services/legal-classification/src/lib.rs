// ForgeWorks Core - Legal Classification Service
// COMPLIANCE-FIRST: Classification and routing only, no execution

use serde::{Deserialize, Serialize};
use device_analysis::{DeviceProfile, RiskLevel};
use ownership_verification::VerificationResult;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LegalStatus {
    Permitted,
    ConditionallyPermitted,
    Prohibited,
    RequiresAuthorization,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Jurisdiction {
    US,
    EU,
    UK,
    Canada,
    Australia,
    Global,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LegalClassification {
    pub status: LegalStatus,
    pub jurisdiction: Jurisdiction,
    pub authorization_required: Vec<AuthorizationType>,
    pub risk_level: RiskLevel,
    pub routing_instructions: RoutingInstructions,
    pub precedent_references: Vec<String>, // Abstract references only
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AuthorizationType {
    OwnershipProof,
    CourtOrder,
    OEMAuthorization,
    CarrierAuthorization,
    ServiceCenterAuthorization,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RoutingInstructions {
    pub route_to: RouteTarget,
    pub contact_information: String, // Generic contact info
    pub required_documentation: Vec<String>,
    pub compliance_notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RouteTarget {
    OEM,
    Carrier,
    ServiceCenter,
    CourtSystem,
    LegalCounsel,
}

/**
 * Classify legal status based on device scenario
 * 
 * This function classifies legal status for routing purposes.
 * It does NOT provide legal advice or execution instructions.
 */
pub fn classify_legal_status(
    device: &DeviceProfile,
    ownership: &VerificationResult,
    jurisdiction: Jurisdiction,
) -> LegalClassification {
    let (status, auth_required, risk) = determine_legal_status(device, ownership, &jurisdiction);
    let routing = generate_routing_instructions(&status, &jurisdiction, &auth_required);
    
    LegalClassification {
        status: status.clone(),
        jurisdiction,
        authorization_required: auth_required.clone(),
        risk_level: risk.clone(),
        routing_instructions: routing,
        precedent_references: vec![
            "DMCA Section 1201".to_string(),
            "CFAA".to_string(),
            "GDPR (EU only)".to_string(),
        ],
    }
}

fn determine_legal_status(
    device: &DeviceProfile,
    ownership: &VerificationResult,
    jurisdiction: &Jurisdiction,
) -> (LegalStatus, Vec<AuthorizationType>, RiskLevel) {
    match device.classification {
        device_analysis::DeviceClassification::ServiceModified => {
            (
                LegalStatus::Prohibited,
                vec![
                    AuthorizationType::CourtOrder,
                    AuthorizationType::ServiceCenterAuthorization,
                ],
                RiskLevel::VeryHigh,
            )
        }
        device_analysis::DeviceClassification::HardwareModified => {
            (
                LegalStatus::RequiresAuthorization,
                vec![
                    AuthorizationType::OEMAuthorization,
                    AuthorizationType::OwnershipProof,
                ],
                RiskLevel::High,
            )
        }
        device_analysis::DeviceClassification::SoftwareModified => {
            if ownership.verified {
                (
                    LegalStatus::ConditionallyPermitted,
                    vec![AuthorizationType::OwnershipProof],
                    RiskLevel::Medium,
                )
            } else {
                (
                    LegalStatus::RequiresAuthorization,
                    vec![AuthorizationType::OwnershipProof],
                    RiskLevel::Medium,
                )
            }
        }
        _ => {
            (
                LegalStatus::Permitted,
                vec![],
                RiskLevel::Low,
            )
        }
    }
}

fn generate_routing_instructions(
    status: &LegalStatus,
    jurisdiction: &Jurisdiction,
    auth_required: &[AuthorizationType],
) -> RoutingInstructions {
    match status {
        LegalStatus::Prohibited | LegalStatus::RequiresAuthorization => {
            let route_target = if auth_required.contains(&AuthorizationType::CourtOrder) {
                RouteTarget::CourtSystem
            } else if auth_required.contains(&AuthorizationType::OEMAuthorization) {
                RouteTarget::OEM
            } else if auth_required.contains(&AuthorizationType::ServiceCenterAuthorization) {
                RouteTarget::ServiceCenter
            } else {
                RouteTarget::LegalCounsel
            };
            
            RoutingInstructions {
                route_to: route_target,
                contact_information: format!(
                    "Contact {} for jurisdiction-specific guidance",
                    match jurisdiction {
                        Jurisdiction::US => "US legal counsel",
                        Jurisdiction::EU => "EU legal counsel",
                        _ => "legal counsel",
                    }
                ),
                required_documentation: vec![
                    "Ownership proof".to_string(),
                    "Authorization documents".to_string(),
                ],
                compliance_notes: "External authority routing required".to_string(),
            }
        }
        _ => {
            RoutingInstructions {
                route_to: RouteTarget::OEM,
                contact_information: "Contact OEM service program".to_string(),
                required_documentation: vec!["Ownership proof".to_string()],
                compliance_notes: "Standard routing".to_string(),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_classify_prohibited_service_modified() {
        let device = device_analysis::analyze("Device with IMEI modification");
        let ownership = ownership_verification::VerificationResult {
            verified: true,
            confidence: 0.9,
            required_authorization: None,
            blocked: false,
            verification_timestamp: chrono::Utc::now(),
        };
        
        let result = classify_legal_status(&device, &ownership, Jurisdiction::US);
        assert_eq!(result.status, LegalStatus::Prohibited);
        assert_eq!(result.risk_level, RiskLevel::VeryHigh);
    }

    #[test]
    fn test_classify_permitted_clean_device() {
        let device = device_analysis::analyze("Clean iPhone");
        let ownership = ownership_verification::VerificationResult {
            verified: true,
            confidence: 0.9,
            required_authorization: None,
            blocked: false,
            verification_timestamp: chrono::Utc::now(),
        };
        
        let result = classify_legal_status(&device, &ownership, Jurisdiction::US);
        assert_eq!(result.status, LegalStatus::Permitted);
        assert_eq!(result.risk_level, RiskLevel::Low);
    }
}
