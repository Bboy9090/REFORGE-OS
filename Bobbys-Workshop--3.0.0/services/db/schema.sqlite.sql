-- SQLite Schema for Local/Development Use
-- ForgeWorks Core Database Schema

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  model TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  platform TEXT NOT NULL,
  security_state TEXT NOT NULL,
  classification TEXT NOT NULL,
  observed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ownership_attestations (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  attestor_type TEXT NOT NULL,
  confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS legal_classifications (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  status TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  rationale TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  actor TEXT NOT NULL,
  resource TEXT NOT NULL,
  result TEXT NOT NULL,
  prev_hash TEXT,
  hash TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS authority_routes (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  authority_type TEXT NOT NULL,
  reference TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_devices_observed_at ON devices(observed_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_hash ON audit_logs(hash);
CREATE INDEX IF NOT EXISTS idx_ownership_device_id ON ownership_attestations(device_id);

-- Note: SQLite does not support REVOKE, but application code must enforce append-only for audit_logs
