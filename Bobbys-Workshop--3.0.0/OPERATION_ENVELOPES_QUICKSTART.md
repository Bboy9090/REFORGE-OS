# Operation Envelopes - Quick Start Guide

## What Are Operation Envelopes?

Operation Envelopes are a standardized response format for ALL operations in Bobby's Workshop. Think of them as the "truth format" that ensures consistent, auditable, and future-proof API responses.

## Quick Example

Every API response looks like this:

```json
{
  "envelope": {
    "type": "inspect",
    "version": "1.0",
    "timestamp": "2025-12-25T20:00:00.000Z",
    "correlationId": "abc123-def456"
  },
  "operation": {
    "id": "detect_android_adb",
    "status": "success"
  },
  "data": {
    "available": true,
    "details": { /* operation-specific data */ }
  },
  "metadata": {
    "processedAt": "2025-12-25T20:00:00.100Z"
  }
}
```

## The 4 Envelope Types

1. **Inspect** - Tool/device detection and availability checks
2. **Execute** - Real operation execution results
3. **Simulate** - Dry-run without execution
4. **Policy-Deny** - Operations denied by policy

## Try It Now

### 1. Start the server

```bash
cd server
npm install
node index.js
```

### 2. Test the endpoints

```bash
# Get the tool catalog
curl http://localhost:3001/api/catalog

# Inspect ADB tool
curl http://localhost:3001/api/tools/inspect/adb

# Simulate a destructive operation
curl -X POST http://localhost:3001/api/operations/simulate \
  -H "Content-Type: application/json" \
  -d '{"operation": "flash_partition", "role": "admin"}'
```

### 3. Run the test suite

```bash
# Make sure server is running first
./scripts/test-operation-envelopes.sh
```

Expected output: `14/14 tests passed ✅`

## Key Endpoints

### Catalog API
- `GET /api/catalog` - Full catalog (capabilities, tools, policies)
- `GET /api/catalog/capabilities` - Just capabilities
- `GET /api/catalog/tools` - Just tools
- `GET /api/catalog/policies` - Just policies

### Tools Inspection
- `POST /api/tools/inspect` - Inspect one or multiple tools
- `GET /api/tools/inspect/:tool` - Inspect single tool
- `GET /api/tools/available` - Quick availability check

### Operations
- `POST /api/operations/execute` - Execute with policy enforcement
- `POST /api/operations/simulate` - Dry-run with validation

## Frontend Integration

```typescript
// Fetch catalog
const response = await fetch('/api/catalog');
const envelope = await response.json();

if (envelope.operation.status === 'success') {
  const { capabilities, tools, policies } = envelope.data.details;
  // Use the data
}
```

## Policy Enforcement

Built-in role-based access control:
- **guest** - Read-only operations
- **tech** - Device diagnostics and monitoring
- **admin** - Most operations including destructive ones
- **owner** - Full system access

Example:
```bash
# Tech role denied for destructive ops
curl -X POST http://localhost:3001/api/operations/execute \
  -H "Content-Type: application/json" \
  -d '{"operation": "flash_partition", "role": "tech"}'

# Returns policy-deny envelope
```

## Audit Logging

Every operation is automatically logged with:
- Correlation ID for tracking
- Operation details
- User role and params
- Success/failure status
- Timestamp

Check server console for `[AUDIT]` entries.

## Documentation

- **Full Specification**: `OPERATION_ENVELOPES.md`
- **Implementation Summary**: `VERSION_4_SUMMARY.md`
- **Test Suite**: `scripts/test-operation-envelopes.sh`

## What's Next?

With Operation Envelopes in place, you can now:

1. **Build USB Passive Memory Layer** - Device detection using inspect envelopes
2. **Wire Frontend Catalog** - UI consumes catalog API
3. **Add Real Operations** - Implement actual device operations
4. **Extend Plugins** - Plugins adopt envelope format

## Need Help?

1. Check `OPERATION_ENVELOPES.md` for complete specification
2. Run test suite to verify installation: `./scripts/test-operation-envelopes.sh`
3. Check server logs for audit trail

---

**Status**: ✅ Production Ready  
**Version**: 1.0  
**Last Updated**: 2025-12-25
