// ForgeWorks Core - Audit Logging Service
// COMPLIANCE-FIRST: Immutable logging, no modifications

use serde::{Deserialize, Serialize};
use chrono::Utc;
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AuditEntry {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub actor: String,
    pub action: String,
    pub resource: String,
    pub result: AuditResult,
    pub previous_hash: Option<String>, // For hash chain
    pub current_hash: String,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AuditResult {
    Allowed,
    Denied,
    Blocked,
    Routed,
}

/**
 * Create immutable audit log entry
 * 
 * All actions must be logged. No exceptions.
 */
pub fn log_event(
    actor: &str,
    action: &str,
    resource: &str,
    result: AuditResult,
    previous_hash: Option<&str>,
    metadata: serde_json::Value,
) -> AuditEntry {
    let timestamp = Utc::now();
    let id = uuid::Uuid::new_v4().to_string();
    
    // Create hash chain for tamper detection
    let entry_data = format!(
        "{}|{}|{}|{}|{}|{}",
        id,
        timestamp.to_rfc3339(),
        actor,
        action,
        resource,
        serde_json::to_string(&result).unwrap()
    );
    
    let hash_input = if let Some(prev_hash) = previous_hash {
        format!("{}|{}", prev_hash, entry_data)
    } else {
        entry_data
    };
    
    let mut hasher = Sha256::new();
    hasher.update(hash_input.as_bytes());
    let current_hash = format!("{:x}", hasher.finalize());
    
    AuditEntry {
        id,
        timestamp,
        actor: actor.to_string(),
        action: action.to_string(),
        resource: resource.to_string(),
        result,
        previous_hash: previous_hash.map(|s| s.to_string()),
        current_hash: current_hash.clone(),
        metadata,
    }
}

/**
 * Verify audit log integrity (hash chain verification)
 */
pub fn verify_audit_integrity(entries: &[AuditEntry]) -> bool {
    if entries.is_empty() {
        return true;
    }
    
    for i in 1..entries.len() {
        let prev_entry = &entries[i - 1];
        let curr_entry = &entries[i];
        
        // Verify hash chain
        if curr_entry.previous_hash.as_ref() != Some(&prev_entry.current_hash) {
            return false;
        }
        
        // Recompute hash to verify
        let entry_data = format!(
            "{}|{}|{}|{}|{}|{}",
            curr_entry.id,
            curr_entry.timestamp.to_rfc3339(),
            curr_entry.actor,
            curr_entry.action,
            curr_entry.resource,
            serde_json::to_string(&curr_entry.result).unwrap()
        );
        
        let hash_input = format!("{}|{}", prev_entry.current_hash, entry_data);
        let mut hasher = Sha256::new();
        hasher.update(hash_input.as_bytes());
        let expected_hash = format!("{:x}", hasher.finalize());
        
        if curr_entry.current_hash != expected_hash {
            return false;
        }
    }
    
    true
}

/**
 * Export audit log for compliance (immutable format)
 */
pub fn export_audit_log(entries: &[AuditEntry]) -> String {
    serde_json::to_string_pretty(entries).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_log_event() {
        let entry = log_event(
            "user123",
            "analyze_device",
            "device456",
            AuditResult::Allowed,
            None,
            serde_json::json!({"test": true}),
        );
        
        assert_eq!(entry.actor, "user123");
        assert_eq!(entry.action, "analyze_device");
        assert!(!entry.current_hash.is_empty());
    }

    #[test]
    fn test_hash_chain() {
        let entry1 = log_event(
            "user123",
            "action1",
            "resource1",
            AuditResult::Allowed,
            None,
            serde_json::json!({}),
        );
        
        let entry2 = log_event(
            "user123",
            "action2",
            "resource2",
            AuditResult::Allowed,
            Some(&entry1.current_hash),
            serde_json::json!({}),
        );
        
        assert_eq!(entry2.previous_hash, Some(entry1.current_hash.clone()));
    }

    #[test]
    fn test_verify_integrity() {
        let entry1 = log_event(
            "user123",
            "action1",
            "resource1",
            AuditResult::Allowed,
            None,
            serde_json::json!({}),
        );
        
        let entry2 = log_event(
            "user123",
            "action2",
            "resource2",
            AuditResult::Allowed,
            Some(&entry1.current_hash),
            serde_json::json!({}),
        );
        
        let entries = vec![entry1, entry2];
        assert!(verify_audit_integrity(&entries));
    }

    #[test]
    fn test_verify_integrity_fails_on_tamper() {
        let mut entry1 = log_event(
            "user123",
            "action1",
            "resource1",
            AuditResult::Allowed,
            None,
            serde_json::json!({}),
        );
        
        let entry2 = log_event(
            "user123",
            "action2",
            "resource2",
            AuditResult::Allowed,
            Some(&entry1.current_hash),
            serde_json::json!({}),
        );
        
        // Tamper with entry1
        entry1.action = "tampered_action".to_string();
        
        let entries = vec![entry1, entry2];
        assert!(!verify_audit_integrity(&entries));
    }
}
