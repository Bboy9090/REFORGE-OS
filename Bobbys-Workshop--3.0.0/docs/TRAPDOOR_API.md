# Trapdoor API Documentation

## Overview

The Trapdoor API provides secure REST endpoints for sensitive device operations, including FRP bypass, bootloader unlocking, and workflow execution. All operations require admin-level authentication and are logged with AES-256 encrypted shadow logs for compliance and audit purposes.

## Authentication

All Trapdoor API endpoints require admin authentication via API key.

### Headers

```
X-API-Key: <admin-api-key>
```

Set the `ADMIN_API_KEY` environment variable on the server, or use the default `dev-admin-key` for development.

## Endpoints

### 1. Execute FRP Bypass Workflow

Execute Factory Reset Protection bypass workflow on authorized devices.

**Endpoint:** `POST /api/trapdoor/frp`

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
      "stepId": "verify-frp-status",
      "stepName": "Verify FRP Status",
      "stepIndex": 0,
      "success": true,
      "output": "...",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

**Legal Notice:** FRP bypass is only legal on devices you own or have explicit written authorization to service.

### 2. Execute Bootloader Unlock Workflow

Unlock device bootloader (WARNING: Erases all data).

**Endpoint:** `POST /api/trapdoor/unlock`

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

**Response:** Same structure as FRP bypass response.

### 3. Execute Custom Workflow

Execute any available workflow by category and ID.

**Endpoint:** `POST /api/trapdoor/workflow/execute`

**Request Body:**

```json
{
  "category": "android",
  "workflowId": "adb-diagnostics",
  "deviceSerial": "ABC123XYZ",
  "authorization": {
    "confirmed": true,
    "userInput": "I AUTHORIZE THIS OPERATION"
  }
}
```

**Response:**

```json
{
  "success": true,
  "workflow": "ADB Device Diagnostics",
  "results": [...]
}
```

### 4. List Available Workflows

Get all available workflows across all categories.

**Endpoint:** `GET /api/trapdoor/workflows`

**Response:**

```json
{
  "success": true,
  "workflows": [
    {
      "id": "android-adb-diagnostics",
      "name": "ADB Device Diagnostics",
      "platform": "android",
      "category": "diagnostics",
      "risk_level": "low",
      "requires_authorization": false
    }
  ]
}
```

### 5. Retrieve Shadow Logs

Access encrypted audit logs for a specific date.

**Endpoint:** `GET /api/trapdoor/logs/shadow?date=2024-01-01`

**Query Parameters:**

- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.

**Response:**

```json
{
  "success": true,
  "date": "2024-01-01",
  "entries": [
    {
      "timestamp": "2024-01-01T12:00:00.000Z",
      "operation": "frp_bypass_requested",
      "deviceSerial": "ABC123XYZ",
      "userId": "192.168.1.100",
      "authorization": "I OWN THIS DEVICE",
      "success": true,
      "metadata": {},
      "tampered": false,
      "recordVersion": "1.0"
    }
  ],
  "count": 1,
  "totalEntries": 1,
  "tamperedEntries": 0
}
```

### 6. Get Shadow Log Statistics

Retrieve statistics about shadow and public logs.

**Endpoint:** `GET /api/trapdoor/logs/stats`

**Response:**

```json
{
  "success": true,
  "stats": {
    "shadowLogs": 5,
    "publicLogs": 12,
    "retentionDays": 90,
    "anonymousMode": false,
    "logDirectory": "/path/to/.shadow-logs"
  }
}
```

### 7. Manually Rotate Logs

Trigger log rotation based on retention policy.

**Endpoint:** `POST /api/trapdoor/logs/rotate`

**Response:**

```json
{
  "success": true,
  "message": "Log rotation completed"
}
```

### 8. Execute Batch Commands

Execute multiple workflows in sequence with optional throttling.

**Endpoint:** `POST /api/trapdoor/batch/execute`

**Request Body:**

```json
{
  "deviceSerial": "ABC123XYZ",
  "throttle": 1000,
  "commands": [
    {
      "category": "android",
      "workflowId": "adb-diagnostics",
      "authorization": null
    },
    {
      "category": "mobile",
      "workflowId": "battery-health",
      "authorization": null
    }
  ]
}
```

**Query Parameters:**

- `throttle` (optional): Milliseconds to wait between commands. Default: 0.

**Response:**

```json
{
  "success": true,
  "totalCommands": 2,
  "results": [
    {
      "index": 0,
      "command": {...},
      "result": {
        "success": true,
        "workflow": "ADB Device Diagnostics",
        "results": [...]
      },
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

## Shadow Logging

### Encryption

All sensitive operations are logged to encrypted shadow logs using:

- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Authentication**: GCM authentication tag
- **Tamper Detection**: SHA-256 hash of entry data

### Configuration

Set the encryption key via environment variable:

```bash
export SHADOW_LOG_KEY="your-secure-encryption-key-here"
```

### Log Retention

- **Default Retention**: 90 days
- **Archive Location**: `.shadow-logs/archive/`
- **Automatic Rotation**: Daily check for old logs
- **Manual Rotation**: `/api/trapdoor/logs/rotate`

### Anonymous Mode

Enable anonymous mode to hash all user identifiers:

```javascript
const logger = new ShadowLogger({ anonymousMode: true });
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**

- `200`: Success
- `400`: Bad Request (missing parameters)
- `403`: Unauthorized (invalid API key)
- `404`: Not Found (workflow or logs not found)
- `500`: Internal Server Error

## Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Rotate encryption keys** regularly for production
3. **Monitor shadow logs** for unauthorized access attempts
4. **Verify device ownership** before executing sensitive operations
5. **Use HTTPS** in production environments
6. **Implement rate limiting** on sensitive endpoints
7. **Regular security audits** of log files

## Example Usage

### Node.js

```javascript
const axios = require("axios");

async function executeFRPBypass(deviceSerial) {
  try {
    const response = await axios.post(
      "http://localhost:3001/api/trapdoor/frp",
      {
        deviceSerial,
        authorization: {
          confirmed: true,
          userInput: "I OWN THIS DEVICE",
        },
      },
      {
        headers: {
          "X-API-Key": "your-admin-key",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("FRP bypass failed:", error.response.data);
  }
}
```

### cURL

```bash
curl -X POST http://localhost:3001/api/trapdoor/frp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-admin-key" \
  -d '{
    "deviceSerial": "ABC123XYZ",
    "authorization": {
      "confirmed": true,
      "userInput": "I OWN THIS DEVICE"
    }
  }'
```

## Compliance

Shadow logging provides:

- **Audit Trail**: Complete record of all sensitive operations
- **Tamper Detection**: SHA-256 hashes detect unauthorized modifications
- **Encryption**: AES-256 protects sensitive data at rest
- **Non-repudiation**: Timestamped, authenticated records
- **Data Retention**: Configurable retention policies for compliance

## Support

For issues or questions:

- GitHub Issues: https://github.com/Bboy9090/Bobbys_World_Tools/issues
- Documentation: See README.md and BOBBY_SECRET_WORKSHOP.md
