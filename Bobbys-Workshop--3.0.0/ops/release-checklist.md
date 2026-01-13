# Release Checklist
## ForgeWorks Core - Pre-Release Verification

## Pre-Release Requirements

### Code Quality
- [ ] All unit tests passing (`cargo test --workspace`)
- [ ] Integration tests passing
- [ ] Code coverage >= 80%
- [ ] No critical linter warnings
- [ ] Security audit completed (if major release)

### Compliance
- [ ] CI guardrails passing (no forbidden terms)
- [ ] Audit logs append-only (no UPDATE/DELETE on audit_logs table)
- [ ] No execution capabilities in codebase
- [ ] Legal disclaimers reviewed and up-to-date
- [ ] Jurisdiction maps updated (if legal changes)

### Database
- [ ] Migration scripts tested on staging
- [ ] Hash chain integrity verified
- [ ] Retention policies configured
- [ ] Backup/restore procedures tested
- [ ] No breaking schema changes without migration path

### Metrics & Monitoring
- [ ] Metrics dashboard functional
- [ ] All SQL views working
- [ ] Alerting rules configured
- [ ] Dashboard accessible to ops team

### Authentication & Authorization
- [ ] SSO integration tested (OIDC/SAML)
- [ ] Role-based permissions verified
- [ ] No role enables execution (verified)
- [ ] Custodian access requires acknowledgment (verified)

### Hardware (if applicable)
- [ ] EVT firmware tests passing
- [ ] Secure element provisioning verified
- [ ] USB enumeration tested
- [ ] Thermal safety verified
- [ ] Manufacturing QA completed

### Documentation
- [ ] README updated
- [ ] API documentation current
- [ ] Runbooks updated
- [ ] Changelog updated
- [ ] Release notes prepared

## Release Process

### 1. Pre-Release (1 week before)
- [ ] Create release branch
- [ ] Freeze features (bug fixes only)
- [ ] Complete all checklist items above

### 2. Staging Deployment
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Verify all metrics
- [ ] Test SSO integration
- [ ] Load test (if performance-critical release)

### 3. Security Review
- [ ] Security team review (if major release)
- [ ] Penetration testing (if required)
- [ ] Compliance officer sign-off

### 4. Production Deployment
- [ ] Backup production database
- [ ] Deploy application code
- [ ] Run database migrations (if applicable)
- [ ] Verify deployment successful
- [ ] Monitor metrics for 1 hour post-deploy

### 5. Post-Deployment
- [ ] Verify all services healthy
- [ ] Check audit log coverage = 100%
- [ ] Verify no integrity violations
- [ ] Monitor error rates
- [ ] Customer notification (if required)

## Rollback Plan

### Automatic Rollback Triggers
- Audit coverage drops below 100%
- Hash chain integrity violations detected
- Critical error rate > 1%
- Authentication failures > 5%

### Manual Rollback Procedure
1. **Immediate**: Revert to previous version
2. **Database**: Restore from backup if migrations were applied
3. **Verify**: Confirm previous version is working
4. **Investigate**: Determine cause of failure
5. **Fix**: Address issue before retry

## Version Numbering

- **Major** (X.0.0): Breaking changes, major features
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible

## Hotfix Procedure

For critical bugs requiring immediate fix:

1. **Branch**: Create hotfix branch from production
2. **Fix**: Implement fix and tests
3. **Review**: Expedited code review (2 reviewers minimum)
4. **Deploy**: Deploy to staging, verify, then production
5. **Document**: Add to next patch release notes

## Sign-Off Requirements

- **Engineering Lead**: Code quality and functionality
- **Compliance Officer**: Compliance and audit requirements
- **Product Owner**: Feature completeness
- **Ops Lead**: Deployment readiness

---

## Release Notes Template

```markdown
# ForgeWorks Core vX.Y.Z

## New Features
- [Feature list]

## Bug Fixes
- [Bug fix list]

## Improvements
- [Improvement list]

## Security
- [Security updates]

## Breaking Changes
- [Breaking changes, if any]

## Upgrade Notes
- [Migration instructions, if any]
```

---

## Emergency Release

For Tier 3 incidents requiring immediate fix:

1. **Expedited Process**: Skip non-critical checklist items
2. **Minimum Requirements**: 
   - Unit tests passing
   - Compliance verified
   - Security review (expedited)
3. **Deploy**: Deploy immediately with monitoring
4. **Post-Deploy**: Complete remaining checklist items
5. **Document**: Document why expedited process was used
