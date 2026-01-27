# Diagnostic and Repair App - API Documentation

## Base URL

```
http://localhost:3001/api/v1
```

For production, replace with your deployed backend URL.

## Authentication

Currently, the API does not require authentication. For production deployment, implement authentication headers:

```http
Authorization: Bearer YOUR_API_TOKEN
```

---

## Repair Tickets API

### Create Ticket

Create a new repair ticket.

**Endpoint:** `POST /tickets`

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "customerEmail": "john@example.com",
  "deviceType": "android",
  "deviceManufacturer": "Samsung",
  "deviceModel": "Galaxy S21",
  "deviceSerial": "ABC123456",
  "deviceImei": "123456789012345",
  "issueDescription": "Screen not working",
  "estimatedCost": 150.00,
  "priority": "high"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "correlationId": "...",
  "data": {
    "success": true,
    "ticket": {
      "id": "uuid",
      "ticketNumber": "TKT-1234567890",
      "status": "pending",
      "customer": { ... },
      "device": { ... },
      "timeline": { ... }
    }
  }
}
```

---

### List Tickets

Get all repair tickets with optional filters.

**Endpoint:** `GET /tickets`

**Query Parameters:**
- `status` (optional): Filter by status (pending, in_progress, completed, cancelled)
- `priority` (optional): Filter by priority (low, normal, high, urgent)
- `deviceType` (optional): Filter by device type (android, ios)

**Example:**
```
GET /tickets?status=pending&priority=high
```

**Response:** `200 OK`
```json
{
  "success": true,
  "correlationId": "...",
  "data": {
    "success": true,
    "count": 5,
    "tickets": [
      {
        "id": "uuid",
        "ticketNumber": "TKT-1234567890",
        "status": "pending",
        ...
      }
    ]
  }
}
```

---

### Get Ticket

Get a specific ticket by ID.

**Endpoint:** `GET /tickets/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "correlationId": "...",
  "data": {
    "success": true,
    "ticket": {
      "id": "uuid",
      "ticketNumber": "TKT-1234567890",
      ...
    }
  }
}
```

---

### Update Ticket

Update ticket status, priority, cost, or add notes.

**Endpoint:** `PUT /tickets/:id`

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "urgent",
  "actualCost": 175.00,
  "notes": "Replaced screen assembly"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "correlationId": "...",
  "data": {
    "success": true,
    "ticket": { ... }
  }
}
```

---

### Delete Ticket

Delete a ticket (use with caution).

**Endpoint:** `DELETE /tickets/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "correlationId": "...",
  "data": {
    "success": true,
    "message": "Ticket deleted",
    "ticketId": "uuid"
  }
}
```

---

### Add Diagnostic Result

Add diagnostic test results to a ticket.

**Endpoint:** `POST /tickets/:id/diagnostics`

**Request Body:**
```json
{
  "type": "battery",
  "results": {
    "percentage": 85,
    "health": "good",
    "temperature": 32.5
  }
}
```

**Response:** `200 OK`

---

### Add Repair Step

Add a repair step to track progress.

**Endpoint:** `POST /tickets/:id/repair-steps`

**Request Body:**
```json
{
  "description": "Replaced screen assembly",
  "status": "completed"
}
```

**Response:** `200 OK`

---

## Diagnostics API

### Battery Diagnostics

Get comprehensive battery health information.

**Endpoint:** `GET /diagnostics/battery/:serial`

**Response:** `200 OK`
```json
{
  "success": true,
  "correlationId": "...",
  "data": {
    "success": true,
    "level": 85,
    "percentage": 85,
    "status": "Charging",
    "health": "Good",
    "voltage": 4.2,
    "temperature": 32.5,
    "cycles": 150,
    "healthPercentage": 92
  }
}
```

---

### Hardware Diagnostics

Run hardware tests (screen, sensors, camera, audio).

**Endpoint:** `GET /diagnostics/hardware/:serial`

**Response:** `200 OK`
```json
{
  "success": true,
  "correlationId": "...",
  "data": {
    "success": true,
    "screen": {
      "resolution": "1080x2400",
      "density": "420dpi"
    },
    "sensors": [...],
    "camera": {...},
    "audio": {...}
  }
}
```

---

### Network Diagnostics

Get network connectivity information.

**Endpoint:** `GET /diagnostics/network/:serial`

**Response:** `200 OK`
```json
{
  "success": true,
  "correlationId": "...",
  "data": {
    "success": true,
    "results": {
      "wifi": {
        "enabled": true,
        "connected": true,
        "ssid": "MyNetwork",
        "signalStrength": "good",
        "ipAddress": "192.168.1.100"
      },
      "bluetooth": {
        "enabled": true,
        "pairedDevices": 3
      },
      "cellular": {
        "connected": true,
        "operator": "AT&T",
        "networkType": "LTE"
      }
    }
  }
}
```

**Sub-endpoints:**
- `GET /diagnostics/network/:serial/wifi` - WiFi only
- `GET /diagnostics/network/:serial/bluetooth` - Bluetooth only
- `GET /diagnostics/network/:serial/cellular` - Cellular only

---

### System Logs

Retrieve system logs from the device.

**Endpoint:** `GET /diagnostics/logs/:serial/logcat`

**Query Parameters:**
- `level` (optional): Log level (V, D, I, W, E, F)
- `tag` (optional): Filter by tag
- `lines` (optional): Number of lines (default: 500)

**Example:**
```
GET /diagnostics/logs/ABC123/logcat?level=E&lines=100
```

**Response:** `200 OK`
```json
{
  "success": true,
  "correlationId": "...",
  "data": {
    "success": true,
    "logType": "logcat",
    "logs": "..."
  }
}
```

**Other log types:**
- `GET /diagnostics/logs/:serial/dmesg` - Kernel logs
- `GET /diagnostics/logs/:serial/events` - Event logs

**Clear logs:**
- `DELETE /diagnostics/logs/:serial/logcat` - Clear logcat buffer

---

## WebSocket API

### Device Events

Real-time device connection/disconnection events.

**Endpoint:** `ws://localhost:3001/ws/device-events`

**Event Format:**
```json
{
  "type": "connected",
  "platform": "android",
  "deviceId": "ABC123456",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### Analytics

Real-time analytics and metrics.

**Endpoint:** `ws://localhost:3001/ws/analytics`

---

### Correlation

Request correlation tracking.

**Endpoint:** `ws://localhost:3001/ws/correlation`

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "correlationId": "...",
  "data": {
    "error": "Error message",
    "message": "Detailed error description"
  }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Some endpoints have rate limiting:
- Flash operations: 10 requests/minute
- Authorization operations: 5 requests/minute
- Trapdoor operations: 20 requests/minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1234567890
```

---

## Response Envelope

All responses are wrapped in a standard envelope:

```json
{
  "success": true,
  "correlationId": "req-abc123",
  "data": { ... }
}
```

---

## Testing with cURL

### Create a ticket:
```bash
curl -X POST http://localhost:3001/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerPhone": "1234567890",
    "deviceType": "android",
    "issueDescription": "Test issue"
  }'
```

### Get tickets:
```bash
curl http://localhost:3001/api/v1/tickets
```

### Get battery diagnostics:
```bash
curl http://localhost:3001/api/v1/diagnostics/battery/ABC123
```

---

## SDKs and Libraries

### Flutter/Dart
Use the provided `ApiService` class in `lib/services/api_service.dart`.

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

// Create ticket
const ticket = await api.post('/tickets', {
  customerName: 'John Doe',
  customerPhone: '1234567890',
  deviceType: 'android',
  issueDescription: 'Screen broken'
});
```

### Python
```python
import requests

API_BASE = 'http://localhost:3001/api/v1'

# Create ticket
response = requests.post(f'{API_BASE}/tickets', json={
    'customerName': 'John Doe',
    'customerPhone': '1234567890',
    'deviceType': 'android',
    'issueDescription': 'Screen broken'
})
```

---

## Additional Resources

- [Server README](/server/README.md)
- [Flutter App README](/apps/diagnostic-repair-app/README.md)
- [Deployment Guide](/apps/diagnostic-repair-app/DEPLOYMENT_GUIDE.md)

---

## Support

For issues or questions:
- GitHub Issues: [Bboy9090/REFORGE-OS](https://github.com/Bboy9090/REFORGE-OS/issues)
- Documentation: Check README files in respective directories

---

Last Updated: 2024-01-26
