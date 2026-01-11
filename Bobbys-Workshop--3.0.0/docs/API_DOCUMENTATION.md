# Trapdoor API Documentation

## Overview

The Trapdoor API provides secure REST endpoints for executing sensitive device operations. All endpoints require admin-level authentication and are designed for authorized repair technicians only.

## Authentication

All Trapdoor API endpoints require API key authentication via the `X-API-Key` header.

### Development Mode

```bash
export ADMIN_API_KEY=dev-admin-key
```

### Production Mode

Set a secure API key in your environment:

```bash
export ADMIN_API_KEY=your-secure-random-key-here
```

### Making Authenticated Requests

```bash
curl -X POST http://localhost:3001/api/trapdoor/workflows \
  -H "X-API-Key: dev-admin-key" \
  -H "Content-Type: application/json"
```

## Endpoints

### List Available Workflows

**GET** `/api/trapdoor/workflows`

Returns a list of all available workflows.

**Response:**

```json
{
  "success": true,
  "workflows": [
    {
      "category": "android",
      "id": "fastboot-unlock",
      "name": "Fastboot Bootloader Unlock",
      "description": "Unlock device bootloader via Fastboot",
      "platform": "android",
      "risk_level": "destructive",
      "requires_authorization": true
    }
  ]
}
```

**cURL Example:**

```bash
curl -H "X-API-Key: dev-admin-key" \
  http://localhost:3001/api/trapdoor/workflows
```

---

### Execute FRP Bypass Workflow

**POST** `/api/trapdoor/frp`

Execute Factory Reset Protection bypass workflow.

⚠️ **LEGAL WARNING**: Only use on devices you legally own or have explicit written authorization to service.

**Request Body:**

```json
{
  "deviceSerial": "ABC123XYZ",
  "authorization": {
    "confirmed": true,
    "userInput": "I OWN THIS DEVICE"
  }
}
```

**Response:**

```json
{
  "success": true,
  "workflow": "FRP Bypass Workflow",
  "results": [
    {
      "stepId": "verify-adb",
      "stepName": "Verify ADB Connection",
      "success": true,
      "output": "Device connected"
    }
  ]
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/trapdoor/frp \
  -H "X-API-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceSerial": "ABC123XYZ",
    "authorization": {
      "confirmed": true,
      "userInput": "I OWN THIS DEVICE"
    }
  }'
```

---

### Execute Bootloader Unlock Workflow

**POST** `/api/trapdoor/unlock`

Execute bootloader unlock workflow for Android devices.

⚠️ **WARNING**: This operation ERASES ALL DATA on the device.

**Request Body:**

```json
{
  "deviceSerial": "ABC123XYZ",
  "authorization": {
    "confirmed": true,
    "userInput": "UNLOCK"
  }
}
```

**Response:**

```json
{
  "success": true,
  "workflow": "Fastboot Bootloader Unlock",
  "results": [
    {
      "stepId": "execute-unlock",
      "stepName": "Execute Bootloader Unlock",
      "success": true,
      "output": "Bootloader unlocked successfully"
    }
  ]
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/trapdoor/unlock \
  -H "X-API-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceSerial": "ABC123XYZ",
    "authorization": {
      "confirmed": true,
      "userInput": "UNLOCK"
    }
  }'
```

---

### Execute Custom Workflow

**POST** `/api/trapdoor/workflow/execute`

Execute any available workflow by category and workflow ID.

**Request Body:**

```json
{
  "category": "ios",
  "workflowId": "device-restore",
  "deviceSerial": "00008030-001234567890401E",
  "authorization": {
    "confirmed": true,
    "userInput": "CONTINUE"
  }
}
```

**Response:**

```json
{
  "success": true,
  "workflow": "iOS Device Restore Workflow",
  "results": [
    {
      "stepId": "detect-device",
      "stepName": "Detect Connected iOS Device",
      "success": true,
      "output": "Device detected: iPhone 12"
    }
  ]
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/trapdoor/workflow/execute \
  -H "X-API-Key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "ios",
    "workflowId": "device-restore",
    "deviceSerial": "00008030-001234567890401E",
    "authorization": {
      "confirmed": true,
      "userInput": "CONTINUE"
    }
  }'
```

---

### Access Shadow Logs

**GET** `/api/trapdoor/logs/shadow?date=2024-12-17`

Retrieve encrypted shadow logs for audit and compliance purposes.

**Query Parameters:**

- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.

**Response:**

```json
{
  "success": true,
  "date": "2024-12-17",
  "entries": [
    {
      "timestamp": "2024-12-17T10:30:00.000Z",
      "operation": "frp_bypass_requested",
      "deviceSerial": "ABC123XYZ",
      "userId": "192.168.1.100",
      "authorization": "I OWN THIS DEVICE",
      "success": true,
      "metadata": {
        "timestamp": "2024-12-17T10:30:00.000Z",
        "endpoint": "/api/trapdoor/frp"
      }
    }
  ],
  "count": 1
}
```

**cURL Example:**

```bash
curl -H "X-API-Key: dev-admin-key" \
  "http://localhost:3001/api/trapdoor/logs/shadow?date=2024-12-17"
```

---

## Error Responses

### 403 Unauthorized

Missing or invalid API key:

```json
{
  "error": "Unauthorized",
  "message": "Admin access required"
}
```

### 400 Bad Request

Missing required parameters:

```json
{
  "error": "Device serial required"
}
```

### 500 Internal Server Error

Server-side error:

```json
{
  "error": "Internal server error",
  "message": "Error details here"
}
```

## Security Features

### 1. API Key Authentication

- All requests require valid API key
- Keys should be rotated regularly
- Failed authentication attempts are logged

### 2. Authorization Prompts

- Destructive operations require explicit user confirmation
- Authorization text must match expected input exactly
- All authorization attempts are logged to shadow logs

### 3. Shadow Logging

- All sensitive operations logged with AES-256-GCM encryption
- Append-only logs for compliance
- 90-day retention policy
- Logs include: timestamp, operation, device serial, user ID, authorization status

### 4. Rate Limiting

- Recommended: 10 requests per minute per API key
- Configurable via middleware
- Prevents brute force attacks

## Compliance

### Audit Trail

All operations through the Trapdoor API are logged to encrypted shadow logs:

- Operation type
- Device identifier
- User/IP address
- Authorization status
- Timestamp
- Success/failure status

### Legal Requirements

- Only use on devices you own or have written authorization to service
- Maintain documentation of authorization
- Review shadow logs regularly for compliance
- Report any unauthorized access attempts

### Data Retention

- Shadow logs retained for 90 days
- Older logs automatically deleted
- Logs encrypted at rest with AES-256-GCM
- Encryption key should be stored securely (HSM recommended for production)

## Best Practices

### 1. Secure API Key Storage

```bash
# Use environment variables
export ADMIN_API_KEY=$(openssl rand -hex 32)

# Or use secrets management
# - AWS Secrets Manager
# - HashiCorp Vault
# - Azure Key Vault
```

### 2. Network Security

- Use HTTPS in production
- Restrict API access to trusted networks
- Implement firewall rules
- Use VPN for remote access

### 3. Monitoring

- Monitor failed authentication attempts
- Alert on unusual activity patterns
- Regular security audits
- Review shadow logs for compliance

### 4. Authorization Verification

- Always verify device ownership before operations
- Document authorization (photos, signatures, receipts)
- Maintain records for legal protection
- Never bypass security on devices without consent

## Integration Examples

### Node.js

```javascript
import fetch from "node-fetch";

async function unlockBootloader(deviceSerial) {
  const response = await fetch("http://localhost:3001/api/trapdoor/unlock", {
    method: "POST",
    headers: {
      "X-API-Key": process.env.ADMIN_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deviceSerial,
      authorization: {
        confirmed: true,
        userInput: "UNLOCK",
      },
    }),
  });

  return await response.json();
}
```

### Python

```python
import requests
import os

def execute_workflow(category, workflow_id, device_serial):
    response = requests.post(
        'http://localhost:3001/api/trapdoor/workflow/execute',
        headers={
            'X-API-Key': os.environ['ADMIN_API_KEY'],
            'Content-Type': 'application/json'
        },
        json={
            'category': category,
            'workflowId': workflow_id,
            'deviceSerial': device_serial
        }
    )
    return response.json()
```

### React/TypeScript

```typescript
interface WorkflowExecuteParams {
  category: string;
  workflowId: string;
  deviceSerial: string;
  authorization?: {
    confirmed: boolean;
    userInput: string;
  };
}

async function executeWorkflow(params: WorkflowExecuteParams) {
  // Call your own backend API route. The backend should attach the admin X-API-Key
  // from a server-side environment variable when forwarding to the Trapdoor API.
  const response = await fetch("/api/trapdoor/workflow/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}
```

## Troubleshooting

### API Key Issues

```bash
# Check if API key is set
echo $ADMIN_API_KEY

# Test authentication
curl -H "X-API-Key: dev-admin-key" \
  http://localhost:3001/api/trapdoor/workflows
```

### Workflow Not Found

- Verify workflow exists: `GET /api/trapdoor/workflows`
- Check category and workflowId spelling
- Ensure workflow JSON is valid

### Authorization Errors

- Ensure `authorization.confirmed` is `true`
- Match `userInput` exactly with workflow requirement
- Check workflow's `requires_authorization` field

---

**For support, open an issue on GitHub or contact the development team.**

**Remember: Use responsibly. Repair ethically. Respect the law.**
