// ForgeWorks Core - OIDC Authentication
// Enterprise SSO Integration

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub email: String,
    pub roles: Vec<String>,
    pub iat: i64,
    pub exp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Role {
    Viewer,      // Read reports only
    Operator,    // Submit analyses
    Custodian,   // Interpretive mode (logged)
    Admin,       // Policy/config only
}

impl Role {
    pub fn from_string(s: &str) -> Option<Role> {
        match s.to_lowercase().as_str() {
            "viewer" => Some(Role::Viewer),
            "operator" => Some(Role::Operator),
            "custodian" => Some(Role::Custodian),
            "admin" => Some(Role::Admin),
            _ => None,
        }
    }
}

/**
 * Validate OIDC JWT token
 * 
 * In production, this would:
 * - Verify JWT signature against issuer public keys
 * - Validate expiration and issuer claims
 * - Extract roles from token claims
 */
pub fn validate_token(_jwt: &str) -> Result<Claims, String> {
    // Mock implementation - in production, use a JWT library like jsonwebtoken
    Ok(Claims {
        sub: "user-123".to_string(),
        email: "user@corp.example.com".to_string(),
        roles: vec!["operator".to_string()],
        iat: chrono::Utc::now().timestamp(),
        exp: chrono::Utc::now().timestamp() + 3600, // 1 hour
    })
}

/**
 * Check if role has permission for action
 * 
 * STRICT RULES:
 * - No role enables execution
 * - Custodian access requires ownership confidence + acknowledgment
 */
pub fn has_permission(role: &Role, action: &str) -> bool {
    match (role, action) {
        // Viewer: Read-only
        (Role::Viewer, "read_reports") => true,
        (Role::Viewer, "view_metrics") => true,
        
        // Operator: Analysis submission
        (Role::Operator, "read_reports") => true,
        (Role::Operator, "submit_analysis") => true,
        (Role::Operator, "view_metrics") => true,
        
        // Custodian: Interpretive mode (requires acknowledgment)
        (Role::Custodian, "read_reports") => true,
        (Role::Custodian, "submit_analysis") => true,
        (Role::Custodian, "interpretive_mode") => true, // Requires additional checks
        (Role::Custodian, "view_metrics") => true,
        
        // Admin: Policy/config only
        (Role::Admin, "read_reports") => true,
        (Role::Admin, "view_metrics") => true,
        (Role::Admin, "manage_policy") => true,
        (Role::Admin, "manage_config") => true,
        
        // NO ROLE enables execution
        (_, "execute") => false,
        (_, "bypass") => false,
        (_, "modify_device") => false,
        
        _ => false,
    }
}

/**
 * Check if custodian access is authorized
 * 
 * Requires:
 * - Ownership confidence >= 0.85
 * - Explicit acknowledgment from user
 * - Audit log entry
 */
pub fn authorize_custodian_access(
    ownership_confidence: f64,
    acknowledged: bool,
) -> bool {
    ownership_confidence >= 0.85 && acknowledged
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_viewer_permissions() {
        assert!(has_permission(&Role::Viewer, "read_reports"));
        assert!(!has_permission(&Role::Viewer, "submit_analysis"));
        assert!(!has_permission(&Role::Viewer, "execute"));
    }

    #[test]
    fn test_no_execution_permission() {
        assert!(!has_permission(&Role::Operator, "execute"));
        assert!(!has_permission(&Role::Custodian, "execute"));
        assert!(!has_permission(&Role::Admin, "execute"));
    }

    #[test]
    fn test_custodian_authorization() {
        assert!(authorize_custodian_access(0.90, true));
        assert!(!authorize_custodian_access(0.70, true)); // Low confidence
        assert!(!authorize_custodian_access(0.90, false)); // Not acknowledged
    }
}
