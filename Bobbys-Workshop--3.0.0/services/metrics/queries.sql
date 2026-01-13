-- Metrics Queries for Operations Dashboard
-- ForgeWorks Core - Control Tower Metrics

-- AUDIT COVERAGE: Percentage of operations that are logged with valid hash
CREATE OR REPLACE VIEW audit_coverage AS
SELECT 
  COUNT(*) FILTER (WHERE hash IS NOT NULL AND hash != '')::FLOAT / 
  NULLIF(COUNT(*), 0) * 100 AS coverage_percentage,
  COUNT(*) FILTER (WHERE hash IS NOT NULL AND hash != '') AS logged_count,
  COUNT(*) AS total_count,
  MAX(created_at) AS last_audit_entry
FROM audit_logs;

-- COMPLIANCE ESCALATIONS: Count of prohibited/requires_authorization classifications
CREATE OR REPLACE VIEW compliance_escalations AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'Prohibited' OR status = 'RequiresAuthorization') AS escalation_count,
  COUNT(*) FILTER (WHERE status = 'Prohibited') AS prohibited_count,
  COUNT(*) FILTER (WHERE status = 'RequiresAuthorization') AS authorization_required_count,
  COUNT(*) AS total_classifications,
  DATE_TRUNC('day', created_at) AS day
FROM legal_classifications
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;

-- ACTIVE UNITS: Unique devices with activity in last 30 days
CREATE OR REPLACE VIEW active_units AS
SELECT 
  COUNT(DISTINCT device_id) AS active_device_count,
  COUNT(DISTINCT actor) AS active_user_count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '30 days';

-- RISK DISTRIBUTION: Breakdown by risk level
CREATE OR REPLACE VIEW risk_distribution AS
SELECT 
  risk_level,
  COUNT(*) AS count,
  COUNT(*)::FLOAT / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100 AS percentage
FROM legal_classifications
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY risk_level
ORDER BY 
  CASE risk_level
    WHEN 'VeryHigh' THEN 1
    WHEN 'High' THEN 2
    WHEN 'Medium' THEN 3
    WHEN 'Low' THEN 4
    ELSE 5
  END;

-- AUTHORITY ROUTING STATS: Where are devices being routed
CREATE OR REPLACE VIEW routing_stats AS
SELECT 
  authority_type,
  status,
  COUNT(*) AS route_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS routes_last_7_days,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS routes_last_30_days
FROM authority_routes
GROUP BY authority_type, status
ORDER BY route_count DESC;

-- OWNERSHIP VERIFICATION STATS
CREATE OR REPLACE VIEW ownership_stats AS
SELECT 
  attestor_type,
  COUNT(*) AS total_attestations,
  COUNT(*) FILTER (WHERE verified = TRUE) AS verified_count,
  COUNT(*) FILTER (WHERE verified = FALSE) AS unverified_count,
  AVG(confidence) AS avg_confidence,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS attestations_last_30_days
FROM ownership_attestations
GROUP BY attestor_type
ORDER BY total_attestations DESC;

-- HASH CHAIN INTEGRITY CHECK
CREATE OR REPLACE VIEW hash_chain_integrity AS
SELECT 
  COUNT(*) AS total_entries,
  COUNT(*) FILTER (WHERE prev_hash IS NULL) AS first_entries,
  COUNT(*) FILTER (
    WHERE prev_hash IS NOT NULL 
    AND prev_hash = LAG(hash) OVER (ORDER BY created_at)
  ) AS valid_chain_links,
  COUNT(*) FILTER (
    WHERE prev_hash IS NOT NULL 
    AND prev_hash != LAG(hash) OVER (ORDER BY created_at)
  ) AS broken_chain_links
FROM audit_logs;

-- JURISDICTION DISTRIBUTION
CREATE OR REPLACE VIEW jurisdiction_distribution AS
SELECT 
  jurisdiction,
  COUNT(*) AS classification_count,
  COUNT(*) FILTER (WHERE status = 'Prohibited') AS prohibited_count,
  COUNT(*) FILTER (WHERE status = 'RequiresAuthorization') AS authorization_required_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS recent_count
FROM legal_classifications
GROUP BY jurisdiction
ORDER BY classification_count DESC;

-- DASHBOARD SUMMARY (All key metrics in one view)
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT 
  (SELECT active_device_count FROM active_units) AS active_units,
  (SELECT coverage_percentage FROM audit_coverage) AS audit_coverage_pct,
  (SELECT SUM(escalation_count) FROM compliance_escalations) AS compliance_escalations_30d,
  (SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '24 hours') AS audit_entries_24h,
  (SELECT COUNT(*) FILTER (WHERE broken_chain_links > 0) FROM hash_chain_integrity) AS integrity_violations,
  (SELECT COUNT(DISTINCT jurisdiction) FROM legal_classifications) AS active_jurisdictions;
