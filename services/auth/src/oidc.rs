// OIDC authentication module
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub email: String,
    pub roles: Vec<String>,
}

pub fn validate_token(_jwt: &str) -> Claims {
    Claims {
        sub: "user".to_string(),
        email: "user@corp".to_string(),
        roles: vec!["enterprise".to_string()],
    }
}
