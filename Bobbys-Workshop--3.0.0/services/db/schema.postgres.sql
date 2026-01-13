-- Postgres Schema for Production
-- ForgeWorks Core Database Schema
-- COMPLIANCE-FIRST: Append-only audit logs, immutable records

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  platform TEXT NOT NULL,
  security_state TEXT NOT NULL,
  classification TEXT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ownership_attestations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  attestor_type TEXT NOT NULL,
  confidence INT NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  documentation_references TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE legal_classifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  jurisdiction TEXT NOT NULL,
  status TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  rationale TEXT NOT NULL,
  authorization_required TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- APPEND-ONLY AUDIT LOGS (IMMUTABLE)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  actor TEXT NOT NULL,
  resource TEXT NOT NULL,
  result TEXT NOT NULL,
  prev_hash TEXT,
  hash TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce append-only: REVOKE UPDATE and DELETE
REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only INSERT allowed on audit_logs
CREATE POLICY audit_logs_append_only ON audit_logs
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE TABLE authority_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  authority_type TEXT NOT NULL,
  reference TEXT NOT NULL,
  status TEXT NOT NULL,
  routing_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_devices_observed_at ON devices(observed_at DESC);
CREATE INDEX idx_devices_classification ON devices(classification);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_hash ON audit_logs(hash);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX idx_ownership_device_id ON ownership_attestations(device_id);
CREATE INDEX idx_legal_device_id ON legal_classifications(device_id);
CREATE INDEX idx_legal_jurisdiction ON legal_classifications(jurisdiction);
CREATE INDEX idx_routes_device_id ON authority_routes(device_id);

-- Partition audit_logs by month for retention management
-- (Implementation deferred - can be added when retention policies are finalized)

-- View for audit log integrity verification
CREATE VIEW audit_log_integrity AS
SELECT 
  id,
  prev_hash,
  hash,
  created_at,
  CASE 
    WHEN prev_hash IS NULL THEN true
    ELSE prev_hash = LAG(hash) OVER (ORDER BY created_at)
  END AS chain_valid
FROM audit_logs
ORDER BY created_at;

COMMENT ON TABLE audit_logs IS 'Immutable append-only audit trail. UPDATE and DELETE operations are revoked.';
COMMENT ON COLUMN audit_logs.hash IS 'SHA-256 hash chained to previous entry for tamper detection.';
