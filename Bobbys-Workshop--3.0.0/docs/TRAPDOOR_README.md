# Trapdoor Admin Architecture - Quick Start

**Secure admin subsystem for Bobby's Workshop - Legal, Safe, and Auditable Operations**

## 🎯 What is Trapdoor?

Trapdoor is Bobby's Workshop secure admin subsystem that provides privileged device operations with:
- ✅ **Strict Authorization** - Role-based access control (Owner, Admin, Technician, Viewer)
- ✅ **Complete Auditability** - AES-256 encrypted shadow logs for all operations
- ✅ **Defense in Depth** - Input validation, command hardening, path safety, rate limiting
- ✅ **Legal Compliance** - No bypass/exploit features, explicit user authorization required

## 📚 Documentation

### Start Here
**New to Trapdoor?** → [Documentation Index](./TRAPDOOR_DOCUMENTATION_INDEX.md)

### Core Documents
1. **[Admin Architecture](./TRAPDOOR_ADMIN_ARCHITECTURE.md)** - Complete system specification (1,373 lines)
2. **[Quick Reference](./TRAPDOOR_QUICK_REFERENCE.md)** - Daily developer guide (283 lines)
3. **[Operation Template](./TRAPDOOR_OPERATION_TEMPLATE.md)** - Step-by-step operation creation (554 lines)
4. **[Security Audit](./TRAPDOOR_SECURITY_AUDIT.md)** - Comprehensive security checklist (516 lines)

### Quick Links
- [System Architecture](./TRAPDOOR_ADMIN_ARCHITECTURE.md#system-architecture) - 4-layer design
- [Authorization Model](./TRAPDOOR_ADMIN_ARCHITECTURE.md#authorization-model) - Roles and permissions
- [Adding New Operations](./TRAPDOOR_OPERATION_TEMPLATE.md) - Developer guide
- [Security Checklist](./TRAPDOOR_ADMIN_ARCHITECTURE.md#security-checklist) - Best practices

## 🚀 Quick Start for Developers

### Adding a New Operation (5 Steps)

1. **Define Operation Spec** → `core/catalog/operations/your-op.json`
2. **Create Workflow** → `workflows/{category}/your-op.json`
3. **Implement Handler** → `core/operations/your-op.js`
4. **Add API Endpoint** → `core/api/trapdoor.js`
5. **Write Tests** → `tests/operations/your-op.test.js`

**Full Guide:** [Operation Template](./TRAPDOOR_OPERATION_TEMPLATE.md)

## 🔐 Security First

### Safe Patterns (Always Do This)
```javascript
// ✅ Input validation
const schema = z.object({
  deviceSerial: z.string().regex(/^[A-Za-z0-9]{6,20}$/)
});

// ✅ Safe command execution
spawn('adb', ['-s', serial, 'reboot'], { shell: false });

// ✅ Path validation
const resolved = path.resolve(baseDir, userInput);
if (!resolved.startsWith(baseDir)) throw new Error('Invalid path');
```

### Unsafe Patterns (Never Do This)
```javascript
// ❌ Command injection vulnerability
exec(`adb -s ${userSerial} reboot`);

// ❌ Path traversal vulnerability
const filePath = baseDir + '/' + userInput;

// ❌ Logging sensitive data
logger.log({ password: userPassword });
```

**Full Security Guide:** [Security Checklist](./TRAPDOOR_ADMIN_ARCHITECTURE.md#security-checklist)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                  │
│  (Normal Tabs | Pandora's Room | Shadow Logs Viewer)    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      API Gateway Layer                    │
│  (Public API | /api/trapdoor/* | Authentication)        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Core Operations Layer                   │
│  (Workflow Engine | Policy Evaluator | Shadow Logger)   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Provider Layer (Real)                   │
│       (ADB | Fastboot | iOS | File System)              │
└─────────────────────────────────────────────────────────┘
```

**Key Principle:** UI never touches OS APIs - all operations go through authenticated API

## 🔑 Authorization Model

### Roles
- **Owner** - Full privileges, all operations
- **Admin** - Most operations, shadow logs
- **Technician** - Safe operations, diagnostics
- **Viewer** - Read-only access

### Risk Levels
- **Low** - Read-only, no state changes
- **Medium** - Reversible state changes
- **High** - Limited reversibility
- **Destructive** - Permanent, irreversible

**Full Matrix:** [Permission Matrix](./TRAPDOOR_ADMIN_ARCHITECTURE.md#permission-matrix)

## 📦 Operation Envelopes

All operations return standardized envelopes:

```javascript
{
  "envelope": {
    "type": "execute|simulate|inspect|policy-deny",
    "version": "1.0",
    "timestamp": "2024-12-27T15:00:00.000Z",
    "correlationId": "unique-id"
  },
  "operation": {
    "id": "operation_name",
    "status": "success|failure|denied"
  },
  "data": { /* operation results */ },
  "metadata": { /* additional info */ }
}
```

**Full Specification:** [Operation Envelopes](./TRAPDOOR_ADMIN_ARCHITECTURE.md#operation-envelopes)

## ✅ Before Deployment Checklist

- [ ] All operations have explicit authorization requirements
- [ ] Input validation implemented for all parameters
- [ ] Command execution uses array-based (not shell string)
- [ ] Path traversal prevention in place
- [ ] Timeout enforcement configured
- [ ] Shadow logging integrated
- [ ] Rate limiting applied
- [ ] Tests passing (unit + integration)
- [ ] Security audit completed

**Full Checklist:** [Security Audit](./TRAPDOOR_SECURITY_AUDIT.md)

## 🆘 Getting Help

1. **Quick answers?** → [Quick Reference](./TRAPDOOR_QUICK_REFERENCE.md)
2. **Architecture questions?** → [Admin Architecture](./TRAPDOOR_ADMIN_ARCHITECTURE.md)
3. **Adding operations?** → [Operation Template](./TRAPDOOR_OPERATION_TEMPLATE.md)
4. **Security concerns?** → [Security Audit](./TRAPDOOR_SECURITY_AUDIT.md)

## ⚖️ Legal & Compliance

### Allowed Operations
✅ Device diagnostics  
✅ Information queries  
✅ Backups and restores  
✅ Legitimate administrative tasks  
✅ Operations with explicit user authorization

### Prohibited Operations
❌ Security bypasses without authorization  
❌ Exploit techniques  
❌ Theft-enabling features  
❌ Unauthorized access methods

**All operations must be defensible in legal contexts.**

## 📊 Documentation Statistics

- **Total Documents:** 6 comprehensive guides
- **Total Lines:** 3,200+ lines of documentation
- **Code Examples:** 50+ safe pattern examples
- **Checklists:** 10+ comprehensive checklists
- **Coverage:** 100% of development lifecycle

## 🎓 Learning Path

**Week 1:** Read [Architecture](./TRAPDOOR_ADMIN_ARCHITECTURE.md) + [Quick Reference](./TRAPDOOR_QUICK_REFERENCE.md)  
**Week 2:** Follow [Operation Template](./TRAPDOOR_OPERATION_TEMPLATE.md) to create first operation  
**Week 3:** Review [Security Audit](./TRAPDOOR_SECURITY_AUDIT.md) and conduct first audit

## 📞 Support

- **Documentation Issues:** Create PR with improvements
- **Security Concerns:** Contact security team directly (not public issues)
- **Feature Requests:** Discuss in team channels first

---

**Version:** 1.0  
**Last Updated:** 2024-12-27  
**Next Review:** 2025-03-27 (Quarterly)

**Full Documentation:** [Trapdoor Documentation Index](./TRAPDOOR_DOCUMENTATION_INDEX.md)
