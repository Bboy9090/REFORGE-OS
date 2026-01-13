// ForgeWorks Core - CLI Entry Point
// For testing the end-to-end flow

use forgeworks_core::{process_device_flow, export_compliance_report};
use ownership_verification::OwnershipAttestation;
use ownership_verification::AttestationType;
use legal_classification::Jurisdiction;
use chrono::Utc;

fn main() {
    println!("=== ForgeWorks Core - End-to-End Flow Test ===\n");
    
    // Mock input data
    let device_metadata = "iPhone 13 Pro - Clean device";
    let ownership_attestation = OwnershipAttestation {
        user_id: "user123".to_string(),
        device_id: "device456".to_string(),
        attestation_type: AttestationType::PurchaseReceipt,
        documentation_references: vec!["receipt.pdf".to_string(), "invoice.pdf".to_string()],
        timestamp: Utc::now(),
    };
    let jurisdiction = Jurisdiction::US;
    let actor = "user123";
    
    // Process the flow
    let report = process_device_flow(
        device_metadata,
        ownership_attestation,
        jurisdiction,
        actor,
        None,
    );
    
    // Export JSON report
    let json_report = export_compliance_report(&report);
    
    println!("✅ Device Analysis Complete");
    println!("✅ Ownership Verification Complete");
    println!("✅ Legal Classification Complete");
    println!("✅ Authority Routing Complete");
    println!("✅ Audit Logging Complete");
    println!("\n=== Compliance Report ===\n");
    println!("{}", json_report);
    
    // Verify integrity
    if report.audit_integrity_verified {
        println!("\n✅ Audit integrity verified - Hash chain intact");
    } else {
        println!("\n❌ Audit integrity check failed!");
    }
}
