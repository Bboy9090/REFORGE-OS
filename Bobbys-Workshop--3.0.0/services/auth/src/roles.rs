// ForgeWorks Core - Role-Based Access Control
// Centralized role definitions and permissions

use serde::{Deserialize, Serialize};
use crate::auth::oidc::Role;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserContext {
    pub user_id: String,
    pub email: String,
    pub roles: Vec<Role>,
    pub session_id: String,
}

/**
 * Role mapping (STRICT)
 * 
 * - viewer        -> read reports
 * - operator      -> submit analyses
 * - custodian     -> interpretive mode (logged)
 * - admin         -> policy/config only
 * 
 * RULES:
 * - No role enables execution
 * - Custodian access requires ownership confidence + acknowledgment
 */
pub struct RolePermissions;

impl RolePermissions {
    pub fn can_read_reports(roles: &[Role]) -> bool {
        roles.iter().any(|r| matches!(r, Role::Viewer | Role::Operator | Role::Custodian | Role::Admin))
    }
    
    pub fn can_submit_analysis(roles: &[Role]) -> bool {
        roles.iter().any(|r| matches!(r, Role::Operator | Role::Custodian))
    }
    
    pub fn can_use_interpretive_mode(roles: &[Role]) -> bool {
        roles.contains(&Role::Custodian)
    }
    
    pub fn can_manage_policy(roles: &[Role]) -> bool {
        roles.contains(&Role::Admin)
    }
    
    pub fn can_execute(_roles: &[Role]) -> bool {
        // NO ROLE enables execution - this is always false
        false
    }
    
    pub fn can_bypass(_roles: &[Role]) -> bool {
        // NO ROLE enables bypass - this is always false
        false
    }
}

/**
 * Check if user has required role for action
 */
pub fn check_permission(context: &UserContext, action: &str) -> bool {
    match action {
        "read_reports" => RolePermissions::can_read_reports(&context.roles),
        "submit_analysis" => RolePermissions::can_submit_analysis(&context.roles),
        "interpretive_mode" => RolePermissions::can_use_interpretive_mode(&context.roles),
        "manage_policy" => RolePermissions::can_manage_policy(&context.roles),
        "execute" => RolePermissions::can_execute(&context.roles), // Always false
        "bypass" => RolePermissions::can_bypass(&context.roles), // Always false
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_role_permissions() {
        let viewer = vec![Role::Viewer];
        assert!(RolePermissions::can_read_reports(&viewer));
        assert!(!RolePermissions::can_submit_analysis(&viewer));
        
        let operator = vec![Role::Operator];
        assert!(RolePermissions::can_read_reports(&operator));
        assert!(RolePermissions::can_submit_analysis(&operator));
        assert!(!RolePermissions::can_execute(&operator));
        
        let custodian = vec![Role::Custodian];
        assert!(RolePermissions::can_use_interpretive_mode(&custodian));
        assert!(!RolePermissions::can_execute(&custodian));
        
        let admin = vec![Role::Admin];
        assert!(RolePermissions::can_manage_policy(&admin));
        assert!(!RolePermissions::can_execute(&admin));
    }
}
