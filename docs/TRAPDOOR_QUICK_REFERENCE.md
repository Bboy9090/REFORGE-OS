# Trapdoor Admin Architecture - Quick Reference

**Quick access guide for developers working with the Trapdoor admin subsystem.**

## 📚 Core Documents

- **[Full Architecture](./TRAPDOOR_ADMIN_ARCHITECTURE.md)** - Complete specification
- **[API Reference](./TRAPDOOR_API.md)** - Endpoint documentation  
- **[Operation Envelopes](../OPERATION_ENVELOPES.md)** - Response format specification
- **[Security Notes](../SECURITY_NOTES.md)** - Security best practices

## 🚀 Quick Start

### Adding a New Operation (5 Steps)

1. **Define operation spec** → `core/catalog/operations/your-op.json`
2. **Create workflow** → `workflows/{category}/your-op.json`
3. **Implement handler** → `core/operations/your-op.js`
4. **Add API endpoint** → `core/api/trapdoor.js`
5. **Write tests** → `tests/operations/your-op.test.js`

[Full guide with examples →](./TRAPDOOR_ADMIN_ARCHITECTURE.md#developer-guide)

## 🔐 Authorization Quick Check

### Role Hierarchy
```
Owner > Admin > Technician > Viewer
```

### Risk Levels
- **Low** - Read-only, no state changes
- **Medium** - Reversible state changes  
- **High** - Data modifications, limited reversibility
- **Destructive** - Permanent changes, cannot be undone

### Role Permissions Matrix

| Operation Type | Owner | Admin | Tech | Viewer |
|---------------|-------|-------|------|--------|
| Diagnostics   | ✅ | ✅ | ✅ | ✅ |
| Safe Ops      | ✅ | ✅ | ✅ | ❌ |
| Medium Risk   | ✅ | ✅ | ⚠️ | ❌ |
| Destructive   | ✅ | ⚠️ | ❌ | ❌ |

⚠️ = Requires explicit confirmation

## 🛡️ Security Checklist

Before committing any operation code:

- [ ] ✅ Input validation with schema (Zod/Yup)
- [ ] ✅ Path traversal protection (no `../` in paths)
- [ ] ✅ Command injection prevention (array-based execution)
- [ ] ✅ Timeout enforcement (default: 30s)
- [ ] ✅ Error handling with proper envelopes
- [ ] ✅ Shadow logging (request + result)
- [ ] ❌ No shell execution with user input
- [ ] ❌ No password/key logging
- [ ] ❌ No full path disclosure in errors

## 📦 Operation Envelope Types

### Execute (Success)
```json
{
  "envelope": { "type": "execute", ... },
  "operation": { "status": "success" },
  "data": { "success": true, "result": {...} }
}
```

### Execute (Failure)
```json
{
  "envelope": { "type": "execute", ... },
  "operation": { 
    "status": "failure",
    "error": { "code": "ERROR_CODE", "message": "..." }
  },
  "data": { "success": false }
}
```

### Policy Deny
```json
{
  "envelope": { "type": "policy-deny", ... },
  "operation": { "status": "denied" },
  "data": { 
    "denied": true,
    "reason": "Operation requires owner role"
  }
}
```

### Simulate (Dry Run)
```json
{
  "envelope": { "type": "simulate", ... },
  "data": {
    "wouldSucceed": true,
    "simulation": { "checks": [...] }
  }
}
```

## 🔨 Safe Command Execution Patterns

### ❌ NEVER Do This
```javascript
// DANGER: Command injection vulnerability
exec(`adb -s ${userSerial} reboot`);
```

### ✅ Always Do This
```javascript
// SAFE: Array-based execution, no shell
spawn('adb', ['-s', serial, 'reboot'], { shell: false });
```

## 🗂️ File Path Safety

### ❌ NEVER Do This
```javascript
// DANGER: Path traversal vulnerability
const filePath = baseDir + '/' + userInput;
fs.readFile(filePath);
```

### ✅ Always Do This
```javascript
// SAFE: Validate paths before access
import path from 'path';

const resolved = path.resolve(baseDir, userInput);
if (!resolved.startsWith(baseDir)) {
  throw new Error('Path traversal attempt');
}
fs.readFile(resolved);
```

## 📝 Shadow Logging

### Log Every Operation
```javascript
// Before execution
await shadowLogger.logShadow({
  operation: 'operation_name_started',
  deviceSerial,
  userId: req.ip,
  authorization: 'ADMIN',
  success: true,
  metadata: { /* context */ }
});

// After execution
await shadowLogger.logShadow({
  operation: 'operation_name_completed',
  deviceSerial,
  userId: req.ip,
  authorization: 'ADMIN',
  success: result.success,
  metadata: { /* result details */ }
});
```

### Never Log Sensitive Data
❌ Passwords, API keys, private keys, PINs, credit cards

## 🧪 Testing Requirements

Every operation needs:

1. **Unit tests** - Core logic validation
2. **Integration tests** - API endpoint behavior
3. **Failure tests** - Error handling verification
4. **Authorization tests** - Role enforcement

```bash
# Run operation tests
npm run test:workflows

# Run API tests
npm run test:trapdoor
```

## 📊 Common Error Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| `INVALID_SERIAL` | Device serial validation failed | Input validation |
| `DEVICE_NOT_FOUND` | Device not connected | Device detection |
| `DEVICE_UNAUTHORIZED` | ADB not authorized | Authorization check |
| `OPERATION_TIMEOUT` | Operation exceeded timeout | Timeout handler |
| `OPERATION_FAILED` | Generic operation failure | Catch-all errors |
| `PERMISSION_DENIED` | Insufficient privileges | Policy enforcement |
| `INVALID_PARAMETERS` | Bad request parameters | Schema validation |

## 🚦 Rate Limits

| Endpoint Pattern | Limit | Window |
|-----------------|-------|--------|
| `/api/catalog` | 100 req | 1 min |
| `/api/tools/inspect` | 50 req | 1 min |
| `/api/trapdoor/*` | 20 req | 1 min |
| `/api/logs/shadow` | 10 req | 1 min |

## 🔍 Common Validations

### Device Serial
```javascript
const SERIAL_REGEX = /^[A-Za-z0-9]{6,20}$/;
if (!SERIAL_REGEX.test(serial)) {
  throw new Error('Invalid device serial');
}
```

### File Name (no path components)
```javascript
if (filename.includes('/') || filename.includes('\\')) {
  throw new Error('Invalid filename');
}
```

### Timeout
```javascript
async function withTimeout(promise, ms = 30000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}
```

## 🎯 Operation Workflow

```
Request → Validate → Authenticate → Authorize → Execute → Log → Respond
   ↓         ↓            ↓             ↓          ↓       ↓       ↓
Schema   API Key     Policy Check   Workflow   Shadow  Envelope
Check                               Engine     Logger  
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `core/api/trapdoor.js` | Admin API endpoints |
| `core/lib/shadow-logger.js` | Encrypted audit logging |
| `core/tasks/workflow-engine.js` | Workflow execution |
| `core/lib/operation-envelope.js` | Envelope creation |
| `workflows/{category}/*.json` | Workflow definitions |
| `core/catalog/operations/*.json` | Operation specifications |

## 🆘 Getting Help

1. **Read the full architecture** - [TRAPDOOR_ADMIN_ARCHITECTURE.md](./TRAPDOOR_ADMIN_ARCHITECTURE.md)
2. **Check existing operations** - Look in `workflows/` for examples
3. **Review security notes** - [SECURITY_NOTES.md](../SECURITY_NOTES.md)
4. **Ask in PR comments** - Tag security reviewers for guidance

## ⚖️ Legal Reminder

**All Trapdoor operations must be:**
- ✅ Legitimate device management tasks
- ✅ Require proper authorization
- ✅ Fully auditable
- ✅ Defensible in legal contexts

**Never implement:**
- ❌ Security bypasses without authorization
- ❌ Exploit techniques
- ❌ Theft-enabling features
- ❌ Warranty-voiding operations (without explicit warnings)

---

**Quick Reference Version:** 1.0  
**Last Updated:** 2024-12-27  
**Full Documentation:** [TRAPDOOR_ADMIN_ARCHITECTURE.md](./TRAPDOOR_ADMIN_ARCHITECTURE.md)
