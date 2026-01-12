// Role-based access control
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Role {
    Viewer,
    Operator,
    Custodian,
    Admin,
}

impl Role {
    pub fn can_access_interpretive_mode(&self) -> bool {
        matches!(self, Role::Custodian | Role::Admin)
    }

    pub fn can_view_audit_logs(&self) -> bool {
        matches!(self, Role::Operator | Role::Custodian | Role::Admin)
    }
}
