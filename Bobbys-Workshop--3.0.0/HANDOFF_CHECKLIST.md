# Final Handoff Checklist
## ForgeWorks Core - Platform Readiness Verification

This checklist must be completed before platform launch or handoff to operations team.

## Compliance & Security

- [ ] **CI guardrails passing**: No forbidden terms (`bypass`, `unlock`, `jailbreak`, `root`, `execute`) in codebase
- [ ] **Audit logs append-only**: Verified that `UPDATE` and `DELETE` are revoked on `audit_logs` table
- [ ] **No execution capabilities**: Verified no code can execute device modifications
- [ ] **Hash chain integrity**: All audit logs maintain valid hash chain (0 violations)
- [ ] **Legal disclaimers**: All disclaimers reviewed and displayed appropriately
- [ ] **Jurisdiction compliance**: All jurisdiction maps loaded and functional

## Database & Infrastructure

- [ ] **Postgres schema deployed**: Production database schema matches `schema.postgres.sql`
- [ ] **Migrations tested**: All migration scripts tested on staging environment
- [ ] **Retention policies**: 7-year retention configured for audit logs
- [ ] **Backup procedures**: Automated backups configured and tested
- [ ] **Database security**: Row-level security policies active on audit_logs
- [ ] **Connection pooling**: Database connection pooling configured appropriately

## Metrics & Monitoring

- [ ] **Metrics visible on one screen**: Dashboard shows all key metrics at a glance
- [ ] **Audit coverage = 100%**: Verified no operations bypass audit logging
- [ ] **Integrity violations = 0**: Hash chain verification shows no breaks
- [ ] **Alerting configured**: Alerts set up for critical metrics (coverage < 100%, integrity violations)
- [ ] **Dashboard accessible**: Ops team can access metrics dashboard
- [ ] **SQL views working**: All metric views (`audit_coverage`, `compliance_escalations`, etc.) functional

## Authentication & Authorization

- [ ] **SSO roles enforced**: OIDC/SAML integration tested and working
- [ ] **Role mapping verified**: Viewer/Operator/Custodian/Admin roles working as specified
- [ ] **No execution permission**: Verified no role enables execution (`can_execute` always returns false)
- [ ] **Custodian access gates**: Custodian mode requires ownership confidence + acknowledgment
- [ ] **Admin restrictions**: Admin role limited to policy/config (no execution)

## International Legal

- [ ] **Jurisdiction packs loaded**: All jurisdiction maps (US, EU, UK, CA, AU, Global) loaded
- [ ] **Jurisdiction loader functional**: `load_jurisdiction()` working correctly
- [ ] **Authorization requirements**: Jurisdiction-specific authorization requirements working
- [ ] **Risk guidelines**: Risk level guidelines mapped per jurisdiction

## Hardware (If Applicable)

- [ ] **EVT firmware tests green**: All EVT test suites passing (USB enum, secure element, thermal safety)
- [ ] **Secure element provisioning**: Verified secure element provisioning process
- [ ] **Manufacturing QA laminated**: QA checklist completed and documented
- [ ] **Serial number binding**: Serial-to-account binding functional
- [ ] **No write paths**: Verified firmware has no device modification capability

## Operations

- [ ] **Runbooks complete**: All runbooks (incident-response, release-checklist, rma-procedure) reviewed
- [ ] **Emergency contacts**: Contact list up-to-date
- [ ] **Incident response tested**: Team knows Tier 1/2/3 procedures
- [ ] **Release process defined**: Release checklist followed for initial deployment
- [ ] **RMA procedure ready**: RMA process documented and team trained

## Documentation

- [ ] **API documentation**: All APIs documented
- [ ] **Database schema**: Schema documented with comments
- [ ] **Deployment guide**: Step-by-step deployment instructions
- [ ] **Troubleshooting guide**: Common issues and solutions documented
- [ ] **Architecture diagrams**: System architecture documented

## Testing

- [ ] **Unit tests passing**: `cargo test --workspace` passes
- [ ] **Integration tests**: End-to-end flow tests passing
- [ ] **Load testing**: Performance tested (if applicable)
- [ ] **Security testing**: Security audit completed
- [ ] **Compliance testing**: Compliance requirements verified

## Deployment Readiness

- [ ] **Staging deployment**: Successfully deployed to staging
- [ ] **Production environment**: Production environment provisioned
- [ ] **Monitoring tools**: Monitoring and alerting tools configured
- [ ] **Log aggregation**: Centralized logging configured
- [ ] **Backup verification**: Backup and restore procedures tested

## Sign-Off

### Engineering Lead
- [ ] Code quality verified
- [ ] All tests passing
- [ ] Architecture reviewed
- [ ] **Signed**: _________________ Date: _________

### Compliance Officer
- [ ] Compliance requirements met
- [ ] Audit logging verified
- [ ] Legal disclaimers approved
- [ ] **Signed**: _________________ Date: _________

### Operations Lead
- [ ] Runbooks reviewed
- [ ] Team trained
- [ ] Monitoring configured
- [ ] **Signed**: _________________ Date: _________

### Product Owner
- [ ] Features complete
- [ ] Documentation complete
- [ ] Launch readiness confirmed
- [ ] **Signed**: _________________ Date: _________

---

## Post-Launch Monitoring (First 48 Hours)

- [ ] Monitor audit coverage (must stay at 100%)
- [ ] Monitor integrity violations (must stay at 0)
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Review all audit log entries
- [ ] Verify SSO authentication working
- [ ] Check metrics dashboard accuracy

---

## Final Operator Rule

**Speed never beats trust.**

If any choice threatens auditability, **don't ship it**.

Any deviation from this checklist requires explicit approval from Engineering Lead + Compliance Officer.

---

**Checklist Version**: 1.0  
**Last Updated**: [Date]  
**Status**: [ ] Ready for Launch  [ ] Needs Attention
