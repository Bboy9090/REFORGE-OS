-- Migration Script: SQLite to Postgres
-- Safe migration preserving audit log integrity

-- Step 1: Export from SQLite (run separately via application)
-- This file documents the migration process

-- Step 2: Create Postgres schema (run schema.postgres.sql first)

-- Step 3: Migrate data (preserving hash chains)
-- Note: This assumes data is exported from SQLite in a compatible format

BEGIN;

-- Migrate devices
INSERT INTO devices (id, model, manufacturer, platform, security_state, classification, observed_at)
SELECT 
  id::UUID,
  model,
  manufacturer,
  platform,
  security_state,
  classification,
  observed_at::TIMESTAMPTZ
FROM devices_staging;

-- Migrate ownership attestations
INSERT INTO ownership_attestations (id, device_id, user_id, attestor_type, confidence, verified, created_at)
SELECT 
  id::UUID,
  device_id::UUID,
  user_id,
  attestor_type,
  CAST(confidence * 100 AS INT), -- Convert 0.0-1.0 to 0-100
  verified = 1,
  created_at::TIMESTAMPTZ
FROM ownership_attestations_staging;

-- Migrate legal classifications
INSERT INTO legal_classifications (id, device_id, jurisdiction, status, risk_level, rationale, created_at)
SELECT 
  id::UUID,
  device_id::UUID,
  jurisdiction,
  status,
  risk_level,
  rationale,
  created_at::TIMESTAMPTZ
FROM legal_classifications_staging;

-- CRITICAL: Migrate audit logs preserving hash chain
-- Must be done in chronological order to maintain chain integrity
INSERT INTO audit_logs (id, event, actor, resource, result, prev_hash, hash, metadata, created_at)
SELECT 
  id::UUID,
  event,
  actor,
  resource,
  result,
  prev_hash,
  hash,
  metadata::JSONB,
  created_at::TIMESTAMPTZ
FROM audit_logs_staging
ORDER BY created_at ASC;

-- Verify hash chain integrity after migration
DO $$
DECLARE
  broken_chains INT;
BEGIN
  SELECT COUNT(*)
  INTO broken_chains
  FROM audit_logs a1
  JOIN audit_logs a2 ON a1.prev_hash = a2.hash
  WHERE a1.created_at < a2.created_at;
  
  IF broken_chains > 0 THEN
    RAISE EXCEPTION 'Hash chain integrity violation detected: % broken chains', broken_chains;
  END IF;
END $$;

-- Migrate authority routes
INSERT INTO authority_routes (id, device_id, authority_type, reference, status, created_at)
SELECT 
  id::UUID,
  device_id::UUID,
  authority_type,
  reference,
  status,
  created_at::TIMESTAMPTZ
FROM authority_routes_staging;

COMMIT;

-- Post-migration verification
SELECT 
  (SELECT COUNT(*) FROM devices) as device_count,
  (SELECT COUNT(*) FROM ownership_attestations) as attestation_count,
  (SELECT COUNT(*) FROM legal_classifications) as classification_count,
  (SELECT COUNT(*) FROM audit_logs) as audit_count,
  (SELECT COUNT(*) FROM audit_logs WHERE hash IS NOT NULL) as audit_with_hash_count,
  (SELECT COUNT(*) FROM authority_routes) as route_count;
