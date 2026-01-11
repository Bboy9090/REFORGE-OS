# Operation Envelopes Specification

**Version:** 1.0  
**Status:** Tier-1 Foundation Complete  
**Last Updated:** 2024-12-25

## Overview

Operation Envelopes provide a standardized, consistent response format for ALL operations in Bobby's Workshop. This "truth format" ensures predictable responses across inspect, execute, simulate, and policy-deny operations.

## Core Design Principles

1. **One Response Shape**: All operation types use the same envelope structure
2. **Consistent Logging**: Built-in audit trail support
3. **Explicit Errors**: No silent failures or fake success
4. **Future-Proof**: Plugins and new features use the same format
5. **Truth-Only**: No placeholders, mocks, or simulated data in production

## Envelope Structure

### Base Envelope

```json
{
  "envelope": {
    "type": "inspect|execute|simulate|policy-deny",
    "version": "1.0",
    "timestamp": "2024-12-25T20:00:00.000Z",
    "correlationId": "unique-correlation-id"
  },
  "operation": {
    "id": "operation_identifier",
    "status": "success|failure|denied|partial"
  },
  "data": {
    // Operation-specific data
  },
  "metadata": {
    "processedAt": "2024-12-25T20:00:00.000Z",
    // Additional metadata
  }
}
```

### Envelope Types

#### 1. Inspect Envelope

Used for tool/device detection and availability checks.

```json
{
  "envelope": {
    "type": "inspect",
    "version": "1.0",
    "timestamp": "2024-12-25T20:00:00.000Z",
    "correlationId": "abc123-def456"
  },
  "operation": {
    "id": "detect_android_adb",
    "status": "success"
  },
  "data": {
    "available": true,
    "details": {
      "installed": true,
      "version": "1.0.41",
      "devices": [
        {
          "serial": "ABC123",
          "state": "device",
          "transport": "usb"
        }
      ],
      "deviceCount": 1
    }
  },
  "metadata": {
    "processedAt": "2024-12-25T20:00:00.100Z",
    "inspectionType": "availability_check",
    "tool": "adb",
    "platform": "linux"
  }
}
```

**When to Use:**
- Tool availability checks
- Device detection
- Capability inspection
- Status queries

#### 2. Execute Envelope

Used for actual operation execution results.

```json
{
  "envelope": {
    "type": "execute",
    "version": "1.0",
    "timestamp": "2024-12-25T20:00:00.000Z",
    "correlationId": "xyz789-uvw012"
  },
  "operation": {
    "id": "reboot_device",
    "status": "success"
  },
  "data": {
    "success": true,
    "result": {
      "deviceSerial": "ABC123",
      "rebootMode": "system",
      "message": "Device rebooted successfully"
    }
  },
  "metadata": {
    "processedAt": "2024-12-25T20:00:01.000Z",
    "executionType": "real_operation",
    "role": "tech",
    "capability": "Reboot Device",
    "riskLevel": "medium"
  }
}
```

**When to Use:**
- Real operation execution
- Command execution results
- State changes
- Data modifications

#### 3. Simulate Envelope

Used for dry-run and policy evaluation without execution.

```json
{
  "envelope": {
    "type": "simulate",
    "version": "1.0",
    "timestamp": "2024-12-25T20:00:00.000Z",
    "correlationId": "sim123-dry456"
  },
  "operation": {
    "id": "flash_partition",
    "status": "success"
  },
  "data": {
    "wouldSucceed": true,
    "simulation": {
      "checks": [
        {
          "name": "policy_evaluation",
          "passed": true,
          "details": {
            "allowed": true,
            "matchedRule": "destructive_requires_admin"
          }
        },
        {
          "name": "tools_availability",
          "passed": true,
          "details": {
            "available": true,
            "missing": []
          }
        }
      ],
      "capability": {
        "name": "Flash Partition",
        "category": "action",
        "riskLevel": "destructive"
      },
      "requirements": ["typed_confirmation", "device_state_validation"],
      "warnings": []
    },
    "dryRun": true
  },
  "metadata": {
    "processedAt": "2024-12-25T20:00:00.500Z",
    "executionType": "simulation",
    "role": "admin",
    "simulationType": "dry_run"
  }
}
```

**When to Use:**
- Pre-execution validation
- Policy evaluation
- Requirement checking
- Risk assessment

#### 4. Policy-Deny Envelope

Used when operations are denied by policy rules.

```json
{
  "envelope": {
    "type": "policy-deny",
    "version": "1.0",
    "timestamp": "2024-12-25T20:00:00.000Z",
    "correlationId": "deny123-pol456"
  },
  "operation": {
    "id": "unlock_bootloader",
    "status": "denied"
  },
  "data": {
    "denied": true,
    "reason": "Destructive operations require admin or owner role. Please request supervisor approval.",
    "policy": {
      "matchedRule": "deny_destructive_for_tech",
      "defaultPolicy": false
    }
  },
  "metadata": {
    "processedAt": "2024-12-25T20:00:00.200Z",
    "denialType": "policy_enforcement",
    "requestedRole": "tech",
    "capability": "Unlock Bootloader"
  }
}
```

**When to Use:**
- Policy enforcement
- Authorization failures
- Role-based denials
- Compliance gates

## API Endpoints

### Catalog API

#### GET /api/catalog

Get the complete tool catalog including capabilities, tools, and policies.

**Response:** Inspect envelope with catalog data

```bash
curl http://localhost:3001/api/catalog
```

#### GET /api/catalog/capabilities

Get just the capabilities list.

**Response:** Inspect envelope with capabilities array

#### GET /api/catalog/tools

Get just the tools list.

**Response:** Inspect envelope with tools array

#### GET /api/catalog/policies

Get just the policies.

**Response:** Inspect envelope with policies object

### Tools Inspection API

#### POST /api/tools/inspect

Inspect one or more tools for availability and device detection.

**Request:**
```json
{
  "tools": ["adb", "fastboot"]  // or "all"
}
```

**Response:** Single envelope (one tool) or batch envelope (multiple tools)

```bash
curl -X POST http://localhost:3001/api/tools/inspect \
  -H "Content-Type: application/json" \
  -d '{"tools": ["adb"]}'
```

#### GET /api/tools/inspect/:tool

Inspect a single tool by name.

**Response:** Inspect envelope for that tool

```bash
curl http://localhost:3001/api/tools/inspect/adb
```

#### GET /api/tools/available

Quick check of which tools are available (installed check only, no device detection).

**Response:** Inspect envelope with availability map

### Operations API

#### POST /api/operations/execute

Execute an operation with policy enforcement and audit logging.

**Request:**
```json
{
  "operation": "reboot_device",
  "params": {
    "deviceSerial": "ABC123",
    "mode": "system"
  },
  "role": "tech",
  "correlationId": "optional-id"
}
```

**Response:** Execute envelope or Policy-deny envelope

```bash
curl -X POST http://localhost:3001/api/operations/execute \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "detect_android_adb",
    "params": {},
    "role": "tech"
  }'
```

#### POST /api/operations/simulate

Simulate/dry-run an operation without executing it.

**Request:**
```json
{
  "operation": "flash_partition",
  "params": {
    "partition": "boot",
    "image": "/path/to/boot.img"
  },
  "role": "admin"
}
```

**Response:** Simulate envelope

```bash
curl -X POST http://localhost:3001/api/operations/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "flash_partition",
    "params": {},
    "role": "admin"
  }'
```

## Audit Logging

Every envelope can be converted to an audit log entry:

```javascript
import { createAuditLogFromEnvelope } from './core/lib/operation-envelope.js';

const auditLog = createAuditLogFromEnvelope(envelope, {
  userId: 'user123',
  ipAddress: '192.168.1.100'
});

// Audit log structure:
{
  "auditId": "audit-abc123-def456",
  "timestamp": "2024-12-25T20:00:00.000Z",
  "envelopeType": "execute",
  "operation": "reboot_device",
  "status": "success",
  "success": true,
  "data": { /* operation data */ },
  "metadata": { /* combined metadata */ },
  "correlationId": "abc123-def456"
}
```

## Batch Envelopes

Multiple envelopes can be wrapped in a batch response:

```json
{
  "envelope": {
    "type": "batch",
    "version": "1.0",
    "timestamp": "2024-12-25T20:00:00.000Z",
    "correlationId": "batch123-multi456",
    "count": 2
  },
  "data": {
    "envelopes": [
      { /* envelope 1 */ },
      { /* envelope 2 */ }
    ]
  },
  "metadata": {
    "batchType": "multiple_operations",
    "requestedTools": ["adb", "fastboot"],
    "inspectionCount": 2,
    "processedAt": "2024-12-25T20:00:00.500Z"
  }
}
```

## Error Handling

When operations fail, the envelope includes error details:

```json
{
  "envelope": { /* ... */ },
  "operation": {
    "id": "flash_partition",
    "status": "failure",
    "error": {
      "message": "Device not in fastboot mode",
      "code": "DEVICE_WRONG_MODE",
      "details": {
        "currentMode": "adb",
        "requiredMode": "fastboot"
      }
    }
  },
  "data": {
    "success": false,
    "result": null
  },
  "metadata": { /* ... */ }
}
```

## Frontend Integration

### Using Envelopes in React

```typescript
interface OperationEnvelope {
  envelope: {
    type: 'inspect' | 'execute' | 'simulate' | 'policy-deny';
    version: string;
    timestamp: string;
    correlationId: string;
  };
  operation: {
    id: string;
    status: 'success' | 'failure' | 'denied' | 'partial';
    error?: {
      message: string;
      code: string;
      details?: any;
    };
  };
  data: any;
  metadata: Record<string, any>;
}

async function inspectTools(tools: string[]) {
  const response = await fetch('/api/tools/inspect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tools })
  });
  
  const envelope: OperationEnvelope = await response.json();
  
  if (envelope.operation.status === 'success') {
    console.log('Tools available:', envelope.data.details);
  } else {
    console.error('Inspection failed:', envelope.operation.error);
  }
  
  return envelope;
}
```

### Handling Different Envelope Types

```typescript
function handleEnvelope(envelope: OperationEnvelope) {
  switch (envelope.envelope.type) {
    case 'inspect':
      return handleInspect(envelope);
    case 'execute':
      return handleExecute(envelope);
    case 'simulate':
      return handleSimulate(envelope);
    case 'policy-deny':
      return handlePolicyDeny(envelope);
  }
}

function handlePolicyDeny(envelope: OperationEnvelope) {
  // Show user why operation was denied
  alert(`Operation denied: ${envelope.data.reason}`);
  
  // Optionally request supervisor approval
  if (envelope.data.policy.matchedRule === 'deny_destructive_for_tech') {
    // Show "Request Approval" button
  }
}
```

## Validation

All envelopes can be validated:

```javascript
import { validateEnvelope } from './core/lib/operation-envelope.js';

const result = validateEnvelope(envelope);
if (!result.valid) {
  console.error('Invalid envelope:', result.errors);
}
```

## Testing

### Smoke Tests

```bash
# 1. Test catalog endpoint
curl http://localhost:3001/api/catalog

# 2. Test tool inspection
curl -X POST http://localhost:3001/api/tools/inspect \
  -H "Content-Type: application/json" \
  -d '{"tools": "all"}'

# 3. Test single tool inspection
curl http://localhost:3001/api/tools/inspect/adb

# 4. Test operation simulation
curl -X POST http://localhost:3001/api/operations/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "detect_android_adb",
    "role": "tech"
  }'
```

### Expected Results

All endpoints should return:
- Valid envelope structure
- Correct envelope type
- Status field populated
- Correlation ID present
- Timestamp in ISO format
- No missing required fields

## Benefits

### For Frontend Developers

✅ **Predictable Responses**: Always know what shape data will be in  
✅ **Type Safety**: Easy to create TypeScript interfaces  
✅ **Error Handling**: Consistent error structure across all endpoints  
✅ **Audit Trail**: Built-in correlation IDs for request tracking

### For Backend Developers

✅ **Consistent Implementation**: Same pattern for all operations  
✅ **Easy Testing**: Standard validation for all responses  
✅ **Logging Integration**: Audit logs generated from envelopes  
✅ **Policy Enforcement**: Built-in policy evaluation framework

### For Operations/DevOps

✅ **Audit Trail**: Every operation logged with correlation ID  
✅ **Compliance**: Structured logs for regulatory requirements  
✅ **Debugging**: Easy to trace requests across system  
✅ **Monitoring**: Standardized metrics and alerting

## Next Steps

### Phase 2 Extensions (Future Work)

- [ ] USB Passive Memory Layer (device expertise + USB awareness)
- [ ] Frontend Catalog Wiring (UI consumes truth-table API)
- [ ] Real operation implementations (flash, reboot, etc.)
- [ ] Advanced policy rules (time-based, device-based)
- [ ] Persistent audit log storage
- [ ] Envelope streaming for long-running operations

### Plugin Integration

Plugins can use the same envelope format:

```javascript
// Plugin operation
const pluginEnvelope = createExecuteEnvelope({
  operation: 'plugin_custom_diagnostic',
  success: true,
  result: { /* plugin data */ },
  metadata: {
    pluginId: 'battery-health-pro',
    pluginVersion: '3.2.1'
  }
});
```

## Conclusion

Operation Envelopes provide the "truth format" foundation for Bobby's Workshop. By standardizing responses across all operations, we ensure:

- **Consistency**: Same shape everywhere
- **Reliability**: Explicit errors, no fake success
- **Auditability**: Built-in logging support
- **Scalability**: Easy to add new operations
- **Maintainability**: Single pattern to understand

**Status**: ✅ Tier-1 Foundation Complete and Ready for Extension
