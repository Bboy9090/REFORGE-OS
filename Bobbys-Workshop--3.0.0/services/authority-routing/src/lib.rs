// ForgeWorks Core - Authority Routing Service
// COMPLIANCE-FIRST: Routes to external authority, never executes

use serde::{Deserialize, Serialize};
use legal_classification::{LegalClassification, RouteTarget};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RoutingPath {
    pub target: RouteTarget,
    pub contact_information: String,
    pub required_documentation: Vec<String>,
    pub compliance_checklist: Vec<String>,
    pub estimated_timeline: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RoutingResult {
    pub path: RoutingPath,
    pub routing_reason: String,
    pub authorization_status: AuthorizationStatus,
    pub next_steps: Vec<String>, // Guidance only, not instructions
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AuthorizationStatus {
    NotRequired,
    Required,
    InProgress,
    Completed,
    Rejected,
}

/**
 * Route to OEM authority
 * 
 * This function identifies OEM routing pathways.
 * It does NOT contact OEMs or execute any actions.
 */
pub fn route_to_oem(device_brand: &str, _legal_status: &str) -> RoutingPath {
    RoutingPath {
        target: RouteTarget::OEM,
        contact_information: format!("Contact {} authorized service program", device_brand),
        required_documentation: vec![
            "Ownership proof".to_string(),
            "Device identification".to_string(),
            "Authorization request (if applicable)".to_string(),
        ],
        compliance_checklist: vec![
            "Ownership verified".to_string(),
            "Legal classification reviewed".to_string(),
            "Audit log exported".to_string(),
        ],
        estimated_timeline: "Varies by OEM (typically 1-2 weeks)".to_string(),
    }
}

/**
 * Route to carrier authority
 * 
 * This function identifies carrier unlock pathways.
 * It does NOT execute unlocks or bypass carrier locks.
 */
pub fn route_to_carrier(carrier: &str, jurisdiction: &str) -> RoutingPath {
    RoutingPath {
        target: RouteTarget::Carrier,
        contact_information: format!("Contact {} carrier unlock service", carrier),
        required_documentation: vec![
            "Ownership proof".to_string(),
            "Account information".to_string(),
            "Device identification".to_string(),
        ],
        compliance_checklist: vec![
            "Carrier eligibility verified".to_string(),
            "Ownership confirmed".to_string(),
            "Legal compliance checked".to_string(),
        ],
        estimated_timeline: format!(
            "Varies by carrier in {} (typically 24-72 hours)",
            jurisdiction
        ),
    }
}

/**
 * Route to court system
 * 
 * This function identifies court order pathways.
 * It does NOT file court orders or provide legal advice.
 */
pub fn route_to_court(jurisdiction: &str) -> RoutingPath {
    RoutingPath {
        target: RouteTarget::CourtSystem,
        contact_information: format!(
            "Consult legal counsel for {} jurisdiction court processes",
            jurisdiction
        ),
        required_documentation: vec![
            "Legal justification".to_string(),
            "Ownership documentation".to_string(),
            "Authorization request".to_string(),
        ],
        compliance_checklist: vec![
            "Legal counsel consulted".to_string(),
            "Court order process initiated".to_string(),
            "All documentation prepared".to_string(),
        ],
        estimated_timeline: "Varies by jurisdiction (typically 2-8 weeks)".to_string(),
    }
}

/**
 * Generate routing result with all required information
 */
pub fn generate_routing_result(
    classification: &LegalClassification,
    ownership_verified: bool,
) -> RoutingResult {
    let path = match classification.routing_instructions.route_to {
        RouteTarget::OEM => {
            route_to_oem("Unknown", &format!("{:?}", classification.status))
        }
        RouteTarget::Carrier => {
            route_to_carrier(
                "Unknown",
                &format!("{:?}", classification.jurisdiction),
            )
        }
        RouteTarget::CourtSystem => {
            route_to_court(&format!("{:?}", classification.jurisdiction))
        }
        RouteTarget::ServiceCenter => RoutingPath {
            target: RouteTarget::ServiceCenter,
            contact_information: "Contact authorized service center".to_string(),
            required_documentation: vec!["Service authorization".to_string()],
            compliance_checklist: vec!["Authorization verified".to_string()],
            estimated_timeline: "Varies (typically 1-2 weeks)".to_string(),
        },
        RouteTarget::LegalCounsel => RoutingPath {
            target: RouteTarget::LegalCounsel,
            contact_information: "Contact legal counsel".to_string(),
            required_documentation: vec!["Legal documentation".to_string()],
            compliance_checklist: vec!["Legal review completed".to_string()],
            estimated_timeline: "Varies".to_string(),
        },
    };
    
    RoutingResult {
        path: path.clone(),
        routing_reason: format!(
            "Legal classification: {:?}, Risk: {:?}",
            classification.status, classification.risk_level
        ),
        authorization_status: if ownership_verified {
            AuthorizationStatus::Required
        } else {
            AuthorizationStatus::NotRequired
        },
        next_steps: vec![
            "Contact identified authority".to_string(),
            "Prepare required documentation".to_string(),
            "Follow compliance checklist".to_string(),
        ],
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use legal_classification::{Jurisdiction, LegalStatus, AuthorizationType};

    #[test]
    fn test_route_to_oem() {
        let path = route_to_oem("Apple", "RequiresAuthorization");
        assert_eq!(path.target, RouteTarget::OEM);
        assert!(path.contact_information.contains("Apple"));
    }

    #[test]
    fn test_generate_routing_result() {
        let classification = LegalClassification {
            status: LegalStatus::RequiresAuthorization,
            jurisdiction: Jurisdiction::US,
            authorization_required: vec![AuthorizationType::OEMAuthorization],
            risk_level: RiskLevel::High,
            routing_instructions: legal_classification::RoutingInstructions {
                route_to: RouteTarget::OEM,
                contact_information: "Contact OEM".to_string(),
                required_documentation: vec![],
                compliance_notes: "".to_string(),
            },
            precedent_references: vec![],
        };
        
        let result = generate_routing_result(&classification, true);
        assert_eq!(result.authorization_status, AuthorizationStatus::Required);
        assert!(!result.next_steps.is_empty());
    }
}
