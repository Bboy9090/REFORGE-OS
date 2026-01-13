// ForgeWorks Core - Metrics Exporter
// Exports dashboard metrics for monitoring and alerting

use serde::{Deserialize, Serialize};
use chrono::Utc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardMetrics {
    pub active_units: i64,
    pub audit_coverage_pct: f64,
    pub compliance_escalations_30d: i64,
    pub audit_entries_24h: i64,
    pub integrity_violations: i64,
    pub active_jurisdictions: i64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskDistribution {
    pub risk_level: String,
    pub count: i64,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingStats {
    pub authority_type: String,
    pub status: String,
    pub route_count: i64,
    pub routes_last_7_days: i64,
    pub routes_last_30_days: i64,
}

/**
 * Export dashboard summary metrics
 * 
 * This function queries the dashboard_summary view and returns
 * current operational metrics for the control tower.
 */
pub fn export_dashboard_metrics(_db_pool: &str) -> DashboardMetrics {
    // In production, this would query the Postgres database
    // For now, return mock metrics structure
    DashboardMetrics {
        active_units: 0,
        audit_coverage_pct: 100.0,
        compliance_escalations_30d: 0,
        audit_entries_24h: 0,
        integrity_violations: 0,
        active_jurisdictions: 0,
        timestamp: Utc::now(),
    }
}

/**
 * Export risk distribution metrics
 */
pub fn export_risk_distribution(_db_pool: &str) -> Vec<RiskDistribution> {
    // In production, query risk_distribution view
    vec![]
}

/**
 * Export routing statistics
 */
pub fn export_routing_stats(_db_pool: &str) -> Vec<RoutingStats> {
    // In production, query routing_stats view
    vec![]
}

/**
 * Check if system health is acceptable
 */
pub fn check_system_health(metrics: &DashboardMetrics) -> bool {
    // Health checks:
    // 1. Audit coverage must be 100%
    // 2. No integrity violations allowed
    // 3. Escalations within acceptable threshold
    
    metrics.audit_coverage_pct >= 100.0
        && metrics.integrity_violations == 0
        && metrics.compliance_escalations_30d < 1000 // Threshold
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_system_health() {
        let healthy_metrics = DashboardMetrics {
            active_units: 100,
            audit_coverage_pct: 100.0,
            compliance_escalations_30d: 10,
            audit_entries_24h: 1000,
            integrity_violations: 0,
            active_jurisdictions: 5,
            timestamp: Utc::now(),
        };
        
        assert!(check_system_health(&healthy_metrics));
        
        let unhealthy_metrics = DashboardMetrics {
            active_units: 100,
            audit_coverage_pct: 95.0, // Below 100%
            compliance_escalations_30d: 10,
            audit_entries_24h: 1000,
            integrity_violations: 0,
            active_jurisdictions: 5,
            timestamp: Utc::now(),
        };
        
        assert!(!check_system_health(&unhealthy_metrics));
    }
}
