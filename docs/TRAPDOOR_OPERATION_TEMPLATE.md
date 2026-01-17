# Operation Template: [Operation Name]

**Use this template when adding a new Trapdoor operation.**

---

## Step 1: Operation Specification

**File:** `core/catalog/operations/[operation-id].json`

```json
{
  "operation": "[operation_id]",
  "displayName": "[Operation Display Name]",
  "description": "[Brief description of what this operation does]",
  "category": "[diagnostics|safe|backup|restore|destructive]",
  "riskLevel": "[low|medium|high|destructive]",
  "requiresConfirmation": false,
  "allowedRoles": ["owner", "admin", "technician"],
  "requiredCapabilities": ["adb"],
  "parameters": {
    "deviceSerial": {
      "type": "string",
      "required": true,
      "pattern": "^[A-Za-z0-9]{6,20}$",
      "description": "Device serial number"
    }
  },
  "auditLogging": "standard",
  "rateLimitPerMinute": 10,
  "estimatedDuration": 5000
}
```

**Checklist:**
- [ ] Operation ID is unique and descriptive (snake_case)
- [ ] Display name is user-friendly
- [ ] Category matches operation type
- [ ] Risk level is accurately assessed
- [ ] Required roles are appropriate for risk level
- [ ] All parameters have validation rules
- [ ] Rate limit is reasonable for operation type

---

## Step 2: Workflow Definition

**File:** `workflows/[category]/[operation-id].json`

```json
{
  "id": "[operation-id]",
  "name": "[Operation Name]",
  "description": "[Detailed description]",
  "platform": "[android|ios|universal]",
  "category": "[diagnostics|safe|backup|restore|destructive]",
  "risk_level": "[low|medium|high|destructive]",
  "requires_authorization": false,
  "steps": [
    {
      "id": "step-1",
      "name": "Step 1 Name",
      "type": "check",
      "action": "[what to check]",
      "success_criteria": "[what defines success]",
      "on_failure": "abort"
    },
    {
      "id": "step-2",
      "name": "Step 2 Name",
      "type": "command",
      "action": "[command to execute]",
      "success_criteria": "[what defines success]",
      "on_failure": "abort"
    }
  ],
  "metadata": {
    "status": "in_progress",
    "placeholder_found": false,
    "version": "1.0.0",
    "author": "[Your Name]",
    "created_at": 0,
    "updated_at": 0,
    "tags": ["[tag1]", "[tag2]"]
  }
}
```

**Checklist:**
- [ ] All steps have unique IDs
- [ ] Success criteria are explicit and testable
- [ ] Failure handling is appropriate for each step
- [ ] Metadata is filled out (use timestamps in milliseconds)
- [ ] No placeholder data in production steps

---

## Step 3: Operation Handler

**File:** `core/operations/[operation-id].js`

```javascript
import { createExecuteEnvelope, createErrorEnvelope } from '../lib/operation-envelope.js';
import { validateDeviceSerial } from '../lib/adb.js';
import { z } from 'zod';

/**
 * [Operation description]
 * 
 * @param {Object} params - Operation parameters
 * @param {string} params.deviceSerial - Device serial number
 * @returns {Promise<OperationEnvelope>}
 */
export async function [operationFunctionName](params) {
  const startTime = Date.now();
  
  try {
    // 1. INPUT VALIDATION
    const schema = z.object({
      deviceSerial: z.string().regex(/^[A-Za-z0-9]{6,20}$/)
      // Add other parameter validations
    });
    
    const validated = schema.parse(params);
    const { deviceSerial } = validated;
    
    // 2. PRE-EXECUTION CHECKS
    // Verify device availability, required tools, etc.
    
    // 3. EXECUTE OPERATION
    // Your operation logic here
    // Use safe command execution patterns
    // Apply timeout enforcement
    
    // 4. VERIFY SUCCESS
    // Check that operation completed as expected
    
    // 5. RETURN SUCCESS ENVELOPE
    return createExecuteEnvelope({
      operation: '[operation_id]',
      success: true,
      result: {
        deviceSerial,
        // Operation-specific results
        message: 'Operation completed successfully'
      },
      metadata: {
        executionTimeMs: Date.now() - startTime
      }
    });
  } catch (error) {
    // 6. ERROR HANDLING
    return createErrorEnvelope(
      '[operation_id]',
      '[ERROR_CODE]',
      `Operation failed: ${error.message}`,
      { 
        deviceSerial: params.deviceSerial,
        originalError: error.message 
      }
    );
  }
}
```

**Security Checklist:**
- [ ] ✅ Input validation with schema
- [ ] ✅ Device serial validation
- [ ] ✅ Path traversal prevention (if using file system)
- [ ] ✅ Command injection prevention (array-based execution)
- [ ] ✅ Timeout enforcement
- [ ] ✅ Proper error envelope on failure
- [ ] ❌ No shell execution with user input
- [ ] ❌ No sensitive data in error messages
- [ ] ❌ No hardcoded credentials

---

## Step 4: API Endpoint

**File:** `core/api/trapdoor.js`

```javascript
/**
 * POST /api/trapdoor/[operation-path]
 * [Operation description]
 */
router.post('/[operation-path]', requireAdmin, async (req, res) => {
  try {
    const { deviceSerial /* other params */ } = req.body;
    
    // Validate required parameters
    if (!deviceSerial) {
      return res.status(400).json({
        error: 'Device serial required'
      });
    }
    
    // Log operation request
    await shadowLogger.logShadow({
      operation: '[operation_id]_requested',
      deviceSerial,
      userId: req.ip,
      authorization: 'ADMIN',
      success: true,
      metadata: {
        timestamp: new Date().toISOString()
        // Add relevant request metadata
      }
    });
    
    // Execute operation
    const result = await [operationFunctionName]({ 
      deviceSerial 
      // Pass other parameters
    });
    
    // Log completion
    await shadowLogger.logShadow({
      operation: '[operation_id]_completed',
      deviceSerial,
      userId: req.ip,
      authorization: 'ADMIN',
      success: result.operation.status === 'success',
      metadata: {
        timestamp: new Date().toISOString(),
        result: result.data.result
      }
    });
    
    return res.json(result);
  } catch (error) {
    console.error('[Operation] error:', error);
    
    // Log error
    await shadowLogger.logShadow({
      operation: '[operation_id]_error',
      deviceSerial: req.body.deviceSerial || 'unknown',
      userId: req.ip,
      authorization: 'ADMIN',
      success: false,
      metadata: {
        error: error.message
      }
    });
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});
```

**Checklist:**
- [ ] Endpoint path is RESTful and descriptive
- [ ] requireAdmin middleware applied
- [ ] Parameter validation before execution
- [ ] Shadow logging for request, completion, and errors
- [ ] Proper HTTP status codes (400 for bad request, 500 for errors)
- [ ] Error messages are safe (no sensitive data)

---

## Step 5: Tests

**File:** `tests/operations/[operation-id].test.js`

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { [operationFunctionName] } from '../../core/operations/[operation-id].js';

describe('[operationFunctionName]', () => {
  const testSerial = 'TEST123456';
  
  beforeEach(() => {
    // Setup test environment
  });
  
  afterEach(() => {
    // Cleanup test environment
  });
  
  describe('Input Validation', () => {
    it('should reject invalid device serial', async () => {
      const result = await [operationFunctionName]({
        deviceSerial: 'invalid../serial'
      });
      
      expect(result.operation.status).toBe('failure');
      expect(result.operation.error.code).toBe('INVALID_SERIAL');
    });
    
    it('should reject missing required parameters', async () => {
      const result = await [operationFunctionName]({});
      
      expect(result.operation.status).toBe('failure');
    });
  });
  
  describe('Operation Execution', () => {
    it('should return execute envelope on success', async () => {
      const result = await [operationFunctionName]({
        deviceSerial: testSerial
      });
      
      expect(result.envelope.type).toBe('execute');
      expect(result.operation.id).toBe('[operation_id]');
      expect(result.operation.status).toBe('success');
    });
    
    it('should handle device not found', async () => {
      // Test with non-existent device
      const result = await [operationFunctionName]({
        deviceSerial: 'NONEXISTENT'
      });
      
      expect(result.operation.status).toBe('failure');
      expect(result.operation.error.code).toBe('DEVICE_NOT_FOUND');
    });
  });
  
  describe('Security', () => {
    it('should prevent path traversal', async () => {
      // If operation uses file paths
      const result = await [operationFunctionName]({
        deviceSerial: testSerial,
        path: '../../etc/passwd'
      });
      
      expect(result.operation.status).toBe('failure');
    });
    
    it('should enforce timeout', async () => {
      // Test timeout handling if applicable
    });
  });
  
  describe('Envelope Format', () => {
    it('should return valid envelope structure', async () => {
      const result = await [operationFunctionName]({
        deviceSerial: testSerial
      });
      
      expect(result.envelope).toBeDefined();
      expect(result.envelope.type).toBeDefined();
      expect(result.envelope.version).toBeDefined();
      expect(result.operation).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });
});
```

**Test Coverage Checklist:**
- [ ] Input validation tests (invalid inputs)
- [ ] Success case tests (happy path)
- [ ] Failure case tests (errors handled)
- [ ] Security tests (path traversal, injection, etc.)
- [ ] Envelope format tests (structure validation)
- [ ] Edge case tests (boundary conditions)

---

## Step 6: Documentation

**File:** `docs/operations/[operation-id].md`

```markdown
# [Operation Display Name]

## Overview

[Brief description of what the operation does and why it's useful]

## Authorization

- **Allowed Roles:** [Owner, Admin, Technician, Viewer]
- **Risk Level:** [Low, Medium, High, Destructive]
- **Requires Confirmation:** [Yes/No]

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deviceSerial` | string | Yes | Device serial number (6-20 alphanumeric) |
| `[param2]` | [type] | [Yes/No] | [Description] |

## Example Usage

### API Request

\`\`\`bash
curl -X POST http://localhost:3001/api/trapdoor/[operation-path] \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-admin-key" \\
  -d '{
    "deviceSerial": "ABC123XYZ"
  }'
\`\`\`

### Response (Success)

\`\`\`json
{
  "envelope": {
    "type": "execute",
    "version": "1.0",
    "timestamp": "2024-12-27T15:30:00.000Z"
  },
  "operation": {
    "id": "[operation_id]",
    "status": "success"
  },
  "data": {
    "success": true,
    "result": {
      "deviceSerial": "ABC123XYZ",
      "message": "Operation completed successfully"
    }
  }
}
\`\`\`

### Response (Failure)

\`\`\`json
{
  "operation": {
    "status": "failure",
    "error": {
      "code": "[ERROR_CODE]",
      "message": "[Error description]"
    }
  }
}
\`\`\`

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_SERIAL` | Device serial validation failed | Provide valid serial |
| `DEVICE_NOT_FOUND` | Device not connected | Connect device |
| `[ERROR_CODE]` | [Description] | [How to resolve] |

## Implementation Notes

- [Important detail 1]
- [Important detail 2]
- [Timeout information]
- [Prerequisites]

## Related Operations

- `[related_op_1]` - [Brief description]
- `[related_op_2]` - [Brief description]

## Safety Considerations

[Any safety warnings or precautions users should be aware of]
```

**Documentation Checklist:**
- [ ] Clear overview of operation purpose
- [ ] Authorization requirements documented
- [ ] All parameters documented with types
- [ ] Example requests and responses provided
- [ ] Error codes documented with resolutions
- [ ] Implementation notes for developers
- [ ] Related operations linked
- [ ] Safety considerations noted

---

## Step 7: Catalog Update

**File:** `core/catalog/catalog.json`

```json
{
  "capabilities": [
    {
      "id": "[operation_id]",
      "name": "[Operation Display Name]",
      "category": "[diagnostics|safe|backup|restore|destructive]",
      "riskLevel": "[low|medium|high|destructive]",
      "roles": ["owner", "admin", "technician"],
      "endpoint": "/api/trapdoor/[operation-path]",
      "documentation": "/docs/operations/[operation-id].md"
    }
  ]
}
```

---

## Final Review Checklist

Before submitting PR:

### Functionality
- [ ] Operation works as expected with real devices
- [ ] All edge cases handled
- [ ] Error messages are clear and actionable

### Security
- [ ] Input validation implemented
- [ ] Path traversal prevented
- [ ] Command injection prevented
- [ ] Timeout enforced
- [ ] No sensitive data in logs/errors
- [ ] Shadow logging implemented

### Code Quality
- [ ] Code follows existing patterns
- [ ] No hardcoded values
- [ ] Proper error handling
- [ ] Comments for complex logic
- [ ] No placeholder/mock data

### Testing
- [ ] All tests passing
- [ ] Edge cases covered
- [ ] Security tests included
- [ ] Envelope format validated

### Documentation
- [ ] Operation spec created
- [ ] Workflow JSON created
- [ ] API documentation written
- [ ] Examples provided
- [ ] Error codes documented

### Integration
- [ ] Catalog updated
- [ ] API endpoint added
- [ ] Shadow logging configured
- [ ] Rate limiting applied

---

## Resources

- **[Full Architecture](./TRAPDOOR_ADMIN_ARCHITECTURE.md)** - Complete specification
- **[Quick Reference](./TRAPDOOR_QUICK_REFERENCE.md)** - Developer guide
- **[Security Notes](../SECURITY_NOTES.md)** - Security best practices
- **[Operation Envelopes](../OPERATION_ENVELOPES.md)** - Response format spec

---

**Template Version:** 1.0  
**Last Updated:** 2024-12-27
