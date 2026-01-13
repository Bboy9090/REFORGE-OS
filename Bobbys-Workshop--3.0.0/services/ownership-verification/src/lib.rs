// ForgeWorks Core - Ownership Verification Service
// COMPLIANCE-FIRST: Verification only, no bypass

use serde::{Deserialize, Serialize};
use chrono::Utc;
use device_analysis::DeviceProfile;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct OwnershipAttestation {
    pub user_id: String,
    pub device_id: String,
    pub attestation_type: AttestationType,
    pub documentation_references: Vec<String>, // Hashed/document references only
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AttestationType {
    PurchaseReceipt,
    CourtOrder,
    InheritanceDocument,
    GiftDocument,
    EnterpriseAuthorization,
    ServiceCenterAuthorization,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VerificationResult {
    pub verified: bool,
    pub confidence: f64, // 0.0 - 1.0
    pub required_authorization: Option<AuthorizationRequirement>,
    pub blocked: bool,
    pub verification_timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AuthorizationRequirement {
    OwnershipProof,
    CourtOrder,
    OEMAuthorization,
    CarrierAuthorization,
    ServiceCenterAuthorization,
}

/**
 * Verify ownership claim
 * 
 * This function verifies ownership through attestation.
 * It does NOT bypass any locks or security features.
 */
pub fn verify_ownership(
    attestation: &OwnershipAttestation,
    device: &DeviceProfile,
) -> VerificationResult {
    let confidence = calculate_confidence(attestation, device);
    let required_auth = determine_authorization_requirement(&confidence, device);
    let verified = confidence >= 0.85; // Threshold for verification
    let blocked = confidence < 0.50; // Too low = block
    
    VerificationResult {
        verified,
        confidence,
        required_authorization: required_auth,
        blocked,
        verification_timestamp: Utc::now(),
    }
}

fn calculate_confidence(
    attestation: &OwnershipAttestation,
    device: &DeviceProfile,
) -> f64 {
    // Base confidence from attestation type
    let base_confidence = match attestation.attestation_type {
        AttestationType::CourtOrder => 0.95,
        AttestationType::ServiceCenterAuthorization => 0.90,
        AttestationType::EnterpriseAuthorization => 0.85,
        AttestationType::PurchaseReceipt => 0.80,
        AttestationType::InheritanceDocument => 0.75,
        AttestationType::GiftDocument => 0.70,
    };
    
    // Adjust based on documentation quality
    let doc_quality = if attestation.documentation_references.is_empty() {
        0.5
    } else if attestation.documentation_references.len() >= 3 {
        1.0
    } else {
        0.8
    };
    
    // Adjust based on device classification (high-risk devices require higher confidence)
    let device_adjustment = match device.classification {
        device_analysis::DeviceClassification::ServiceModified => 0.7, // Lower confidence allowed
        device_analysis::DeviceClassification::HardwareModified => 0.8,
        device_analysis::DeviceClassification::SoftwareModified => 0.9,
        _ => 1.0,
    };
    
    if (base_confidence * doc_quality * device_adjustment) > 1.0_f64 { 1.0_f64 } else { base_confidence * doc_quality * device_adjustment }
}

fn determine_authorization_requirement(
    confidence: &f64,
    device: &DeviceProfile,
) -> Option<AuthorizationRequirement> {
    if *confidence < 0.85 {
        // High-risk devices require specific authorization
        match device.classification {
            device_analysis::DeviceClassification::ServiceModified => {
                Some(AuthorizationRequirement::ServiceCenterAuthorization)
            }
            device_analysis::DeviceClassification::HardwareModified => {
                Some(AuthorizationRequirement::OEMAuthorization)
            }
            _ => Some(AuthorizationRequirement::OwnershipProof),
        }
    } else {
        None
    }
}

/**
 * Gate check: Ownership verification required before proceeding
 */
pub fn require_ownership_verification(device: &DeviceProfile) -> bool {
    // Always require for high-risk scenarios
    matches!(
        device.classification,
        device_analysis::DeviceClassification::ServiceModified
            | device_analysis::DeviceClassification::HardwareModified
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verify_ownership_with_court_order() {
        let device = device_analysis::analyze("iPhone - Clean");
        let attestation = OwnershipAttestation {
            user_id: "user123".to_string(),
            device_id: device.device_id.clone(),
            attestation_type: AttestationType::CourtOrder,
            documentation_references: vec!["doc1".to_string(), "doc2".to_string()],
            timestamp: Utc::now(),
        };
        
        let result = verify_ownership(&attestation, &device);
        assert!(result.verified);
        assert!(result.confidence >= 0.85);
    }

    #[test]
    fn test_verify_ownership_low_confidence() {
        let device = device_analysis::analyze("Device with hardware modification");
        let attestation = OwnershipAttestation {
            user_id: "user123".to_string(),
            device_id: device.device_id.clone(),
            attestation_type: AttestationType::GiftDocument,
            documentation_references: vec![],
            timestamp: Utc::now(),
        };
        
        let result = verify_ownership(&attestation, &device);
        assert!(!result.verified || result.confidence < 0.85);
    }

    #[test]
    fn test_require_verification_for_high_risk() {
        let device = device_analysis::analyze("Device with IMEI modification");
        assert!(require_ownership_verification(&device));
    }
}
