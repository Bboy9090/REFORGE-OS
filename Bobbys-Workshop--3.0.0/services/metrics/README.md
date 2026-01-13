# Metrics Dashboard - Control Tower

## Overview

The metrics dashboard provides real-time operational visibility into the ForgeWorks Core platform. All metrics are derived from the Postgres database views.

## Key Metrics

### Audit Coverage
- **Target**: 100%
- **Critical**: Any value below 100% indicates audit logging failures
- **Query**: `SELECT * FROM audit_coverage;`

### Compliance Escalations
- **Threshold**: < 1000 per 30 days
- **Alert**: If exceeded, review legal classification logic
- **Query**: `SELECT * FROM compliance_escalations;`

### Active Units
- **Definition**: Unique devices with activity in last 30 days
- **Use**: Capacity planning and license enforcement
- **Query**: `SELECT * FROM active_units;`

### Hash Chain Integrity
- **Target**: 0 violations
- **Critical**: Any violation indicates tampering or data corruption
- **Query**: `SELECT * FROM hash_chain_integrity;`

## Dashboard Summary

Quick access to all key metrics:
```sql
SELECT * FROM dashboard_summary;
```

## Alerting Rules

1. **Audit Coverage < 100%**: Immediate alert, stop all operations
2. **Integrity Violations > 0**: Immediate alert, freeze system, export logs
3. **Escalations > 1000/30d**: Review classification logic
4. **Active Units > License Limit**: Warn about license compliance

## Export Functions

Use the Rust exporter (`services/metrics/exporter.rs`) to:
- Export metrics as JSON for external monitoring
- Check system health programmatically
- Integrate with alerting systems (Prometheus, etc.)

## Refresh Frequency

- **Real-time**: Hash chain integrity checks
- **1 minute**: Dashboard summary
- **5 minutes**: Distribution views
- **1 hour**: Aggregated statistics
