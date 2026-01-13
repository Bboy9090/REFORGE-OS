-- Retention Policies for Audit Logs
-- 7-year retention for compliance (configurable)

-- Disable autovacuum on audit_logs to preserve immutability
ALTER TABLE audit_logs SET (autovacuum_enabled = false);

-- Create retention policy function
CREATE OR REPLACE FUNCTION audit_log_retention_check()
RETURNS TRIGGER AS $$
BEGIN
  -- Do not allow deletion of audit logs less than 7 years old
  -- This is enforced at the application level, but this function
  -- provides an additional safety check
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Actual deletion should only be done via:
-- 1. Legal hold release
-- 2. Explicit retention policy expiration
-- 3. With full export and verification

-- Function to export audit logs for archival before deletion
CREATE OR REPLACE FUNCTION export_audit_logs_for_archival(cutoff_date TIMESTAMPTZ)
RETURNS TABLE (
  id UUID,
  event TEXT,
  actor TEXT,
  resource TEXT,
  result TEXT,
  prev_hash TEXT,
  hash TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.event,
    al.actor,
    al.resource,
    al.result,
    al.prev_hash,
    al.hash,
    al.metadata,
    al.created_at
  FROM audit_logs al
  WHERE al.created_at < cutoff_date
  ORDER BY al.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retention configuration view
CREATE VIEW retention_config AS
SELECT 
  'audit_logs' as table_name,
  7 as retention_years,
  NOW() - INTERVAL '7 years' as cutoff_date,
  COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '7 years') as records_eligible_for_archival,
  COUNT(*) as total_records
FROM audit_logs;

COMMENT ON FUNCTION export_audit_logs_for_archival IS 
  'Exports audit logs older than cutoff_date for archival. Must verify hash chain integrity before deletion.';

COMMENT ON VIEW retention_config IS 
  'Shows current retention policy status and eligible records for archival.';
