// ForgeWorks Core - End-to-End Flow
// COMPLIANCE-FIRST: Device → Ownership → Legal → Audit → Routing

use serde::{Deserialize, Serialize};
use device_analysis::{analyze, DeviceProfile};
use ownership_verification::{verify_ownership, OwnershipAttestation, VerificationResult};
use legal_classification::{classify_legal_status, Jurisdiction, LegalClassification};
use audit_logging::{log_event, AuditEntry, AuditResult};
use authority_routing::{generate_routing_result, RoutingResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceReport {
    pub device: DeviceProfile,
    pub ownership: VerificationResult,
    pub legal: LegalClassification,
    pub routing: RoutingResult,
    pub audit_entries: Vec<AuditEntry>,
    pub report_timestamp: chrono::DateTime<chrono::Utc>,
    pub audit_integrity_verified: bool,
}

/**
 * End-to-end flow: Device → Ownership → Legal → Audit → Routing
 * 
 * This is the main orchestration function that connects all services.
 * It performs analysis and routing only - no execution.
 */
pub fn process_device_flow(
    device_metadata: &str,
    ownership_attestation: OwnershipAttestation,
    jurisdiction: Jurisdiction,
    actor: &str,
    previous_audit_hash: Option<&str>,
) -> ComplianceReport {
    // Step 1: Device Analysis
    let device = analyze(device_metadata);
    let audit1 = log_event(
        actor,
        "device_analysis",
        &device.device_id,
        AuditResult::Allowed,
        previous_audit_hash,
        serde_json::json!({
            "device_id": device.device_id,
            "classification": format!("{:?}", device.classification),
        }),
    );
    
    // Step 2: Ownership Verification
    let ownership = verify_ownership(&ownership_attestation, &device);
    let audit2 = log_event(
        actor,
        "ownership_verification",
        &device.device_id,
        if ownership.verified {
            AuditResult::Allowed
        } else {
            AuditResult::Blocked
        },
        Some(&audit1.current_hash),
        serde_json::json!({
            "verified": ownership.verified,
            "confidence": ownership.confidence,
        }),
    );
    
    // Step 3: Legal Classification
    let legal = classify_legal_status(&device, &ownership, jurisdiction);
    let audit3 = log_event(
        actor,
        "legal_classification",
        &device.device_id,
        match legal.status {
            legal_classification::LegalStatus::Prohibited => AuditResult::Blocked,
            _ => AuditResult::Allowed,
        },
        Some(&audit2.current_hash),
        serde_json::json!({
            "status": format!("{:?}", legal.status),
            "risk_level": format!("{:?}", legal.risk_level),
        }),
    );
    
    // Step 4: Authority Routing
    let routing = generate_routing_result(&legal, ownership.verified);
    let audit4 = log_event(
        actor,
        "authority_routing",
        &device.device_id,
        AuditResult::Routed,
        Some(&audit3.current_hash),
        serde_json::json!({
            "route_to": format!("{:?}", routing.path.target),
            "reason": routing.routing_reason,
        }),
    );
    
    // Step 5: Verify audit integrity
    let audit_entries = vec![audit1, audit2, audit3, audit4];
    let integrity_verified = audit_logging::verify_audit_integrity(&audit_entries);
    
    ComplianceReport {
        device,
        ownership,
        legal,
        routing,
        audit_entries,
        report_timestamp: chrono::Utc::now(),
        audit_integrity_verified: integrity_verified,
    }
}

/**
 * Export compliance report as JSON
 */
pub fn export_compliance_report(report: &ComplianceReport) -> String {
    serde_json::to_string_pretty(report).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_end_to_end_flow() {
        let attestation = OwnershipAttestation {
            user_id: "user123".to_string(),
            device_id: "device456".to_string(),
            attestation_type: ownership_verification::AttestationType::PurchaseReceipt,
            documentation_references: vec!["doc1".to_string(), "doc2".to_string()],
            timestamp: Utc::now(),
        };
        
        let report = process_device_flow(
            "iPhone 13 Pro - Clean device",
            attestation,
            Jurisdiction::US,
            "user123",
            None,
        );
        
        assert!(report.audit_integrity_verified);
        assert_eq!(report.audit_entries.len(), 4);
        assert_eq!(report.device.non_invasive, true);
    }

    #[test]
    fn test_export_json() {
        let attestation = OwnershipAttestation {
            user_id: "user123".to_string(),
            device_id: "device456".to_string(),
            attestation_type: ownership_verification::AttestationType::PurchaseReceipt,
            documentation_references: vec!["doc1".to_string()],
            timestamp: Utc::now(),
        };
        
        let report = process_device_flow(
            "Clean device",
            attestation,
            Jurisdiction::US,
            "user123",
            None,
        );
        
        let json = export_compliance_report(&report);
        assert!(json.contains("device"));
        assert!(json.contains("ownership"));
        assert!(json.contains("legal"));
        assert!(json.contains("routing"));
        assert!(json.contains("audit_entries"));
    }

    #[test]
    fn test_audit_hash_chain() {
        let attestation = OwnershipAttestation {
            user_id: "user123".to_string(),
            device_id: "device456".to_string(),
            attestation_type: ownership_verification::AttestationType::PurchaseReceipt,
            documentation_references: vec!["doc1".to_string()],
            timestamp: Utc::now(),
        };
        
        let report = process_device_flow(
            "Clean device",
            attestation,
            Jurisdiction::US,
            "user123",
            None,
        );
        
        // Verify hash chain
        for i in 1..report.audit_entries.len() {
            let prev = &report.audit_entries[i - 1];
            let curr = &report.audit_entries[i];
            
            assert_eq!(
                curr.previous_hash,
                Some(prev.current_hash.clone()),
                "Hash chain broken at index {}",
                i
            );
        }
        
        assert!(report.audit_integrity_verified);
    }
}
