# Trapdoor Security Audit Checklist

**Pre-deployment and periodic security review checklist for Trapdoor admin operations.**

## Overview

Use this checklist to audit Trapdoor operations before deployment and quarterly thereafter. Every item must be verified and documented.

**Audit Schedule:**
- ✅ Before production deployment
- ✅ After adding new operations
- ✅ Quarterly (every 90 days)
- ✅ After security incidents
- ✅ After major dependency updates

---

## 1. Authentication & Authorization

### Authentication Mechanisms

- [ ] **API Key Authentication**
  - [ ] API keys are stored in environment variables (not hardcoded)
  - [ ] Default development keys are not used in production
  - [ ] API keys are rotated regularly (every 90 days)
  - [ ] API key length is sufficient (minimum 32 characters)
  - [ ] Failed authentication attempts are logged

- [ ] **JWT Implementation** (if applicable)
  - [ ] Tokens have reasonable expiration (15-60 minutes)
  - [ ] Refresh tokens are implemented
  - [ ] Token signing key is stored securely
  - [ ] Token claims include role information
  - [ ] Expired tokens are properly rejected

- [ ] **Rate Limiting**
  - [ ] Rate limits are configured for all protected endpoints
  - [ ] Limits are appropriate for operation types
  - [ ] Rate limit exceeded responses are logged
  - [ ] IP-based or key-based identification

### Authorization Model

- [ ] **Role Definitions**
  - [ ] Owner role has appropriate highest privileges
  - [ ] Admin role has reasonable restricted privileges
  - [ ] Technician role is limited to safe operations
  - [ ] Viewer role is truly read-only
  - [ ] No role can escalate to higher privilege

- [ ] **Operation Allowlists**
  - [ ] Every operation has explicit allowedRoles list
  - [ ] Risk levels accurately reflect operation danger
  - [ ] Destructive operations require owner role
  - [ ] No operations allow guest/anonymous access

- [ ] **Policy Enforcement**
  - [ ] Policy checks happen before execution
  - [ ] Policy denials are logged
  - [ ] Policy bypass is impossible
  - [ ] Simulate mode validates policies without execution

---

## 2. Input Validation

### Parameter Validation

- [ ] **Schema Validation**
  - [ ] All operations use Zod/Yup schemas
  - [ ] Required parameters are enforced
  - [ ] Type checking is strict
  - [ ] Enum values are validated against allowlists

- [ ] **Device Identifiers**
  - [ ] Serial numbers validated with regex (`/^[A-Za-z0-9]{6,20}$/`)
  - [ ] No special characters allowed in serials
  - [ ] Empty/null serials are rejected
  - [ ] Serial format matches expected device types

- [ ] **String Inputs**
  - [ ] Maximum length enforced
  - [ ] Special characters are validated/escaped
  - [ ] No shell metacharacters in user input
  - [ ] Unicode normalization applied where needed

- [ ] **Numeric Inputs**
  - [ ] Range validation (min/max)
  - [ ] Integer vs float enforcement
  - [ ] Negative number handling
  - [ ] Overflow protection

- [ ] **File Paths**
  - [ ] Path traversal prevention (`../` blocked)
  - [ ] Absolute paths resolved and validated
  - [ ] Symlink following is controlled
  - [ ] Base directory restrictions enforced

---

## 3. Command Execution Security

### Command Injection Prevention

- [ ] **Array-Based Execution**
  - [ ] All commands use array syntax (not string concatenation)
  - [ ] `shell: false` option is set on spawn/exec
  - [ ] No eval() or similar dynamic code execution
  - [ ] No backticks or $() shell expansions

- [ ] **Argument Handling**
  - [ ] Arguments are never concatenated with commands
  - [ ] User input never becomes part of command string
  - [ ] Whitespace in arguments is properly handled
  - [ ] Quote escaping is not manually implemented

- [ ] **Tool Validation**
  - [ ] Command executables are validated before use
  - [ ] Full paths to executables are used when possible
  - [ ] PATH manipulation is avoided
  - [ ] Tool availability is checked before execution

### Example Audit
```javascript
// ❌ FAIL - Command injection vulnerability
exec(`adb -s ${userSerial} reboot`);

// ✅ PASS - Safe array-based execution
spawn('adb', ['-s', validatedSerial, 'reboot'], { shell: false });
```

---

## 4. File System Security

### Path Safety

- [ ] **Path Traversal Prevention**
  - [ ] User paths are resolved to absolute paths
  - [ ] Resolved paths are validated against base directory
  - [ ] `path.resolve()` and `path.join()` are used correctly
  - [ ] Manual string concatenation is avoided

- [ ] **File Operations**
  - [ ] Read operations validate file existence
  - [ ] Write operations use safe temp directories
  - [ ] File size limits are enforced
  - [ ] Symlinks are handled appropriately
  - [ ] File permissions are checked before access

- [ ] **Directory Operations**
  - [ ] Recursive operations have depth limits
  - [ ] Directory creation uses safe mode (0755 or stricter)
  - [ ] Directory deletion requires explicit confirmation
  - [ ] Hidden files are handled appropriately

### Example Audit
```javascript
// ❌ FAIL - Path traversal vulnerability
const filePath = baseDir + '/' + userInput;

// ✅ PASS - Safe path validation
const resolved = path.resolve(baseDir, userInput);
if (!resolved.startsWith(baseDir)) {
  throw new Error('Invalid path');
}
```

---

## 5. Timeout & Resource Management

### Operation Timeouts

- [ ] **Timeout Enforcement**
  - [ ] Default timeout is set (30 seconds)
  - [ ] Timeouts are configurable per operation
  - [ ] Timeout errors are properly caught
  - [ ] Timeout values are reasonable for operation type

- [ ] **Resource Limits**
  - [ ] Maximum file size for reads (10MB default)
  - [ ] Maximum number of concurrent operations
  - [ ] Memory usage is monitored
  - [ ] Cleanup happens on timeout/error

---

## 6. Error Handling & Logging

### Error Handling

- [ ] **Error Envelopes**
  - [ ] All errors return proper operation envelopes
  - [ ] Error codes are consistent and documented
  - [ ] Error messages are user-friendly
  - [ ] Stack traces are not exposed to clients

- [ ] **Error Information**
  - [ ] Sensitive data is not included in errors
  - [ ] File paths are sanitized (basename only)
  - [ ] Internal system details are hidden
  - [ ] Actionable resolution hints are provided

### Shadow Logging

- [ ] **Log Content**
  - [ ] Operation type is logged
  - [ ] User identifier is logged (IP or email)
  - [ ] Device serial is logged
  - [ ] Operation result (success/failure) is logged
  - [ ] Correlation IDs are used for tracing

- [ ] **Sensitive Data Protection**
  - [ ] Passwords are NEVER logged
  - [ ] API keys are NEVER logged
  - [ ] Private keys are NEVER logged
  - [ ] PINs/passwords are NEVER logged
  - [ ] Full file paths are sanitized

- [ ] **Log Encryption**
  - [ ] Shadow logs use AES-256-CBC encryption
  - [ ] Encryption key is stored securely
  - [ ] Encryption key is not in version control
  - [ ] Log files are append-only
  - [ ] Log rotation is automated (90-day retention)

### Example Audit
```javascript
// ❌ FAIL - Logging sensitive data
logger.log({ password: userPassword, apiKey: key });

// ✅ PASS - Safe logging
logger.log({ 
  operation: 'user_login',
  userId: user.id,
  success: true 
});
```

---

## 7. Dependency Security

### Package Audit

- [ ] **NPM Audit**
  - [ ] `npm audit` shows no high/critical vulnerabilities
  - [ ] Known vulnerabilities have mitigation plans
  - [ ] Dependencies are up to date
  - [ ] Unused dependencies are removed

- [ ] **Specific Dependencies**
  - [ ] Multer updated to 2.x (if used)
  - [ ] Express version is current
  - [ ] No deprecated packages in use
  - [ ] Dev dependencies are not in production

### Audit Commands
```bash
# Run security audit
npm audit

# Check for outdated packages
npm outdated

# Review dependency tree
npm list --depth=0
```

---

## 8. Network Security

### API Endpoints

- [ ] **HTTPS Enforcement**
  - [ ] Production uses HTTPS only
  - [ ] HTTP redirects to HTTPS
  - [ ] TLS version is 1.2 or higher
  - [ ] Certificate is valid and not self-signed

- [ ] **CORS Configuration**
  - [ ] CORS is configured (not wide-open)
  - [ ] Allowed origins are explicitly listed
  - [ ] Credentials are handled properly
  - [ ] Preflight requests are handled

- [ ] **Security Headers**
  - [ ] `X-Frame-Options` is set
  - [ ] `X-Content-Type-Options` is set
  - [ ] `Strict-Transport-Security` is set (HTTPS)
  - [ ] `Content-Security-Policy` is configured

---

## 9. Operation-Specific Security

### Per-Operation Audit

For each Trapdoor operation, verify:

- [ ] **Operation Specification**
  - [ ] Risk level is accurate
  - [ ] Allowed roles are appropriate
  - [ ] Required capabilities are documented
  - [ ] Rate limit is reasonable

- [ ] **Implementation**
  - [ ] Input validation is complete
  - [ ] No command injection vulnerabilities
  - [ ] No path traversal vulnerabilities
  - [ ] Timeout is enforced
  - [ ] Error handling is proper

- [ ] **Testing**
  - [ ] Unit tests exist and pass
  - [ ] Security tests exist (injection, traversal)
  - [ ] Failure cases are tested
  - [ ] Envelope format is validated

- [ ] **Documentation**
  - [ ] Operation is documented
  - [ ] Examples are provided
  - [ ] Error codes are documented
  - [ ] Safety warnings are included

---

## 10. Compliance & Legal

### Legal Compliance

- [ ] **Operation Legality**
  - [ ] No bypass/exploit/evasion features
  - [ ] Authorization is required for sensitive ops
  - [ ] User consent is obtained
  - [ ] Legal warnings are displayed

- [ ] **Audit Trail**
  - [ ] All operations are logged
  - [ ] Logs are tamper-evident (append-only)
  - [ ] Log retention meets requirements (90 days)
  - [ ] Logs are encrypted at rest

- [ ] **Data Protection**
  - [ ] User data is encrypted
  - [ ] Data retention policies are enforced
  - [ ] Data deletion is possible
  - [ ] GDPR/privacy requirements are met (if applicable)

---

## 11. Deployment Security

### Production Configuration

- [ ] **Environment Variables**
  - [ ] No secrets in source code
  - [ ] `.env` file is in `.gitignore`
  - [ ] Environment variables are documented
  - [ ] Production values are different from dev

- [ ] **Access Controls**
  - [ ] Production systems have restricted access
  - [ ] Admin accounts use strong passwords
  - [ ] SSH keys are used (not passwords)
  - [ ] Two-factor authentication is enabled

- [ ] **Monitoring**
  - [ ] Failed login attempts are monitored
  - [ ] Unusual operation patterns are detected
  - [ ] Shadow log access is monitored
  - [ ] Alerts are configured for security events

---

## 12. Incident Response

### Preparedness

- [ ] **Documentation**
  - [ ] Incident response plan exists
  - [ ] Contact information is current
  - [ ] Escalation procedures are defined
  - [ ] Backup/restore procedures are documented

- [ ] **Backups**
  - [ ] Shadow logs are backed up regularly
  - [ ] Encryption keys are backed up securely
  - [ ] Database backups are automated
  - [ ] Backup restoration is tested

- [ ] **Recovery**
  - [ ] Rollback procedures are documented
  - [ ] Service restart procedures are documented
  - [ ] Data recovery procedures are tested
  - [ ] Communication plan is defined

---

## Audit Report Template

### Audit Information

- **Audit Date:** [YYYY-MM-DD]
- **Auditor:** [Name/Team]
- **Scope:** [All operations / Specific operations]
- **Environment:** [Production / Staging / Development]

### Summary

- **Total Items Checked:** [X]
- **Items Passed:** [X]
- **Items Failed:** [X]
- **Critical Issues:** [X]
- **Medium Issues:** [X]
- **Low Issues:** [X]

### Critical Issues Found

| Issue | Operation | Risk | Remediation | Due Date |
|-------|-----------|------|-------------|----------|
| [Description] | [Op ID] | [High/Critical] | [Fix plan] | [Date] |

### Recommendations

1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

### Sign-Off

- **Auditor Signature:** _________________ Date: _______
- **Security Lead Approval:** _________________ Date: _______

---

## Quick Audit Scripts

### Run Basic Security Checks

```bash
# 1. Check for sensitive data in code
grep -r "password\|api_key\|secret" core/ --exclude-dir=node_modules

# 2. Check for shell execution
grep -r "exec\|spawn.*shell.*true" core/ --exclude-dir=node_modules

# 3. Check for path concatenation
grep -r "\+ '/'.*userInput\|baseDir + " core/ --exclude-dir=node_modules

# 4. Run npm audit
npm audit --audit-level=moderate

# 5. Check for eval usage
grep -r "eval(" core/ --exclude-dir=node_modules

# 6. Check for TODO security items
grep -r "TODO.*SECURITY\|FIXME.*SECURITY" core/ --exclude-dir=node_modules
```

### Automated Vulnerability Scan

```bash
# Install security tools
npm install -g snyk
npm install -g retire

# Run scans
snyk test
retire --path ./

# Check dependencies
npm audit --json > audit-report.json
```

---

## Continuous Monitoring

### Daily Checks
- [ ] Review failed authentication logs
- [ ] Check shadow log access patterns
- [ ] Monitor operation failure rates

### Weekly Checks
- [ ] Review shadow logs for unusual patterns
- [ ] Check rate limit violations
- [ ] Review new operations added

### Monthly Checks
- [ ] Run full security audit
- [ ] Update dependencies
- [ ] Review access logs

### Quarterly Checks
- [ ] Complete full audit checklist
- [ ] Rotate API keys
- [ ] Update documentation
- [ ] Review incident response plan

---

## Resources

- **[Full Architecture](./TRAPDOOR_ADMIN_ARCHITECTURE.md)** - Complete security architecture
- **[Security Notes](../SECURITY_NOTES.md)** - Known issues and recommendations
- **[Operation Template](./TRAPDOOR_OPERATION_TEMPLATE.md)** - Secure operation development
- **[Quick Reference](./TRAPDOOR_QUICK_REFERENCE.md)** - Security quick checks

---

**Checklist Version:** 1.0  
**Last Updated:** 2024-12-27  
**Next Review:** 2025-03-27 (Quarterly)
