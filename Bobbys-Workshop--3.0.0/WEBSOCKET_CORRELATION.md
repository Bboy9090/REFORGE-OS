# WebSocket Live Correlation Tracking

## Overview

The WebSocket Live Correlation Tracking system provides real-time device correlation updates via WebSocket connections. This enables instant notification of device connections, disconnections, and correlation badge changes without polling.

## Architecture

### Client-Side Components

1. **useCorrelationWebSocket Hook** (`src/hooks/use-correlation-websocket.ts`)

   - Manages WebSocket connection lifecycle
   - Handles message parsing and routing
   - Provides auto-reconnect functionality
   - Integrates with `useCorrelationTracking` for state updates
   - Toast notifications for connection events

2. **RealTimeCorrelationTracker Component** (Updated)
   - WebSocket connection controls
   - Connection status display
   - Configurable WebSocket URL
   - Real-time device list updates
   - Live statistics dashboard

### Server-Side Integration

The WebSocket server should implement the message protocol defined below. Example implementations are provided for:

- Node.js (Express + ws)
- Python (FastAPI)

## Message Protocol

All messages are JSON-encoded with the following structure:

### Base Message Format

```typescript
interface CorrelationWebSocketMessage {
  type:
    | "correlation_update"
    | "device_connected"
    | "device_disconnected"
    | "batch_update"
    | "ping"
    | "pong";
  deviceId?: string;
  device?: Partial<CorrelatedDevice>;
  devices?: Partial<CorrelatedDevice>[];
  timestamp: number;
}
```

### Message Types

#### 1. correlation_update

**Direction**: Server → Client  
**Purpose**: Update correlation status for a specific device

```json
{
  "type": "correlation_update",
  "deviceId": "device-123",
  "device": {
    "correlationBadge": "CORRELATED",
    "matchedIds": ["ABC123XYZ", "adb-ABC123XYZ"],
    "confidence": 0.95,
    "correlationNotes": ["Per-device correlation present (matched tool ID(s))."]
  },
  "timestamp": 1704067200000
}
```

#### 2. device_connected

**Direction**: Server → Client  
**Purpose**: Notify when a new device is detected

```json
{
  "type": "device_connected",
  "deviceId": "device-456",
  "device": {
    "id": "device-456",
    "serial": "XYZ789",
    "platform": "android",
    "mode": "confirmed_android_os",
    "confidence": 0.92,
    "correlationBadge": "CORRELATED",
    "matchedIds": ["XYZ789"],
    "correlationNotes": [
      "Per-device correlation present (matched tool ID(s))."
    ],
    "vendorId": 6353,
    "productId": 20199
  },
  "timestamp": 1704067200000
}
```

#### 3. device_disconnected

**Direction**: Server → Client  
**Purpose**: Notify when a device is disconnected

```json
{
  "type": "device_disconnected",
  "deviceId": "device-123",
  "timestamp": 1704067200000
}
```

#### 4. batch_update

**Direction**: Server → Client  
**Purpose**: Send multiple device updates at once (initial state, rescan, etc.)

```json
{
  "type": "batch_update",
  "devices": [
    {
      "id": "device-1",
      "correlationBadge": "CORRELATED",
      "confidence": 0.95
    },
    {
      "id": "device-2",
      "correlationBadge": "SYSTEM-CONFIRMED",
      "confidence": 0.91
    }
  ],
  "timestamp": 1704067200000
}
```

#### 5. ping / pong

**Direction**: Bidirectional  
**Purpose**: Keep-alive / connection health check

Client sends ping every 30 seconds:

```json
{
  "type": "ping",
  "timestamp": 1704067200000
}
```

Server responds with pong:

```json
{
  "type": "pong",
  "timestamp": 1704067200000
}
```

## Client Usage

### Basic Setup

```typescript
import { useCorrelationWebSocket } from '@/hooks/use-correlation-websocket';

function MyComponent() {
  const {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    send
  } = useCorrelationWebSocket({
    url: 'ws://localhost:3001',
    autoConnect: true,
    enableNotifications: true,
    reconnectDelay: 3000,
    maxReconnectAttempts: 5
  });

  return (
    <div>
      <p>Status: {connectionStatus}</p>
      {isConnected ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
    </div>
  );
}
```

### Configuration Options

```typescript
interface CorrelationWebSocketConfig {
  url: string; // WebSocket server URL
  reconnectDelay?: number; // Delay between reconnect attempts (ms)
  maxReconnectAttempts?: number; // Max reconnect attempts before giving up
  enableNotifications?: boolean; // Show toast notifications
  autoConnect?: boolean; // Connect automatically on mount
}
```

### Connection States

- **disconnected**: No active connection
- **connecting**: Connection attempt in progress
- **connected**: Active WebSocket connection
- **error**: Connection error occurred

## Server Implementation Examples

### Node.js (Express + ws)

```javascript
const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Track connected clients
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Client connected. Total clients:", clients.size);

  // Send initial batch update
  ws.send(
    JSON.stringify({
      type: "batch_update",
      devices: getCurrentDevices(),
      timestamp: Date.now(),
    }),
  );

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);

      // Handle ping
      if (message.type === "ping") {
        ws.send(
          JSON.stringify({
            type: "pong",
            timestamp: Date.now(),
          }),
        );
      }
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected. Total clients:", clients.size);
  });
});

// Broadcast to all clients
function broadcast(message) {
  const data = JSON.stringify({
    ...message,
    timestamp: Date.now(),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Example: Device correlation updated
function onDeviceCorrelationUpdate(deviceId, device) {
  broadcast({
    type: "correlation_update",
    deviceId,
    device,
  });
}

// Example: Device connected
function onDeviceConnected(device) {
  broadcast({
    type: "device_connected",
    deviceId: device.id,
    device,
  });
}

// Example: Device disconnected
function onDeviceDisconnected(deviceId) {
  broadcast({
    type: "device_disconnected",
    deviceId,
  });
}

server.listen(3001, () => {
  console.log("WebSocket server listening on port 3001");
});
```

### Python (FastAPI)

```python
from fastapi import FastAPI, WebSocket
from typing import Set
import json
import asyncio
from datetime import datetime

app = FastAPI()

# Track connected clients
clients: Set[WebSocket] = set()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    print(f"Client connected. Total clients: {len(clients)}")

    try:
        # Send initial batch update
        await websocket.send_json({
            "type": "batch_update",
            "devices": get_current_devices(),
            "timestamp": int(datetime.now().timestamp() * 1000)
        })

        # Message loop
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            # Handle ping
            if message.get("type") == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": int(datetime.now().timestamp() * 1000)
                })

    except Exception as e:
        print(f"Error: {e}")
    finally:
        clients.remove(websocket)
        print(f"Client disconnected. Total clients: {len(clients)}")

# Broadcast to all clients
async def broadcast(message: dict):
    message["timestamp"] = int(datetime.now().timestamp() * 1000)
    data = json.dumps(message)

    for client in clients.copy():
        try:
            await client.send_text(data)
        except Exception as e:
            print(f"Failed to send to client: {e}")
            clients.discard(client)

# Example: Device correlation updated
async def on_device_correlation_update(device_id: str, device: dict):
    await broadcast({
        "type": "correlation_update",
        "deviceId": device_id,
        "device": device
    })

# Example: Device connected
async def on_device_connected(device: dict):
    await broadcast({
        "type": "device_connected",
        "deviceId": device["id"],
        "device": device
    })

# Example: Device disconnected
async def on_device_disconnected(device_id: str):
    await broadcast({
        "type": "device_disconnected",
        "deviceId": device_id
    })

def get_current_devices():
    # Return current device list
    return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
```

## Integration with BootForge USB

To integrate WebSocket correlation tracking with BootForge USB device detection:

```typescript
// In your device detection service
import { broadcast } from "./websocket-server";

// When device is detected
const dossier = normalizeBootForgeUSBRecord(deviceRecord);
broadcast({
  type: "device_connected",
  deviceId: dossier.id,
  device: {
    id: dossier.id,
    serial: dossier.serial,
    platform: dossier.platform,
    mode: dossier.mode,
    confidence: dossier.confidence,
    correlationBadge: dossier.correlation_badge,
    matchedIds: dossier.matched_ids,
    correlationNotes: dossier.correlation_notes,
    vendorId: dossier.usb_vid,
    productId: dossier.usb_pid,
  },
});

// When correlation is updated
broadcast({
  type: "correlation_update",
  deviceId: device.id,
  device: {
    correlationBadge: newBadge,
    matchedIds: newMatchedIds,
    confidence: newConfidence,
    correlationNotes: newNotes,
  },
});

// When device is disconnected
broadcast({
  type: "device_disconnected",
  deviceId: device.id,
});
```

## Features

### Client-Side Features

- ✅ Auto-reconnect with exponential backoff
- ✅ Connection status indicators
- ✅ Toast notifications for events
- ✅ Configurable WebSocket URL
- ✅ Keep-alive ping/pong
- ✅ Message type routing
- ✅ Integration with persistent storage (useKV)

### Server-Side Features

- ✅ Broadcast to all connected clients
- ✅ Initial state synchronization
- ✅ Ping/pong keep-alive
- ✅ Client connection tracking
- ✅ Message validation

## Testing

### Mock WebSocket Server

For testing, you can use a simple Node.js WebSocket server:

```javascript
// test-ws-server.js
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send test device every 5 seconds
  const interval = setInterval(() => {
    ws.send(
      JSON.stringify({
        type: "device_connected",
        deviceId: `device-${Date.now()}`,
        device: {
          id: `device-${Date.now()}`,
          platform: "android",
          mode: "confirmed_android_os",
          confidence: Math.random() * 0.2 + 0.8,
          correlationBadge: ["CORRELATED", "SYSTEM-CONFIRMED", "LIKELY"][
            Math.floor(Math.random() * 3)
          ],
          matchedIds: ["ABC123"],
          correlationNotes: ["Test device"],
        },
        timestamp: Date.now(),
      }),
    );
  }, 5000);

  ws.on("close", () => {
    clearInterval(interval);
    console.log("Client disconnected");
  });
});

console.log("Test WebSocket server running on ws://localhost:3001");
```

Run with:

```bash
node test-ws-server.js
```

## Security Considerations

1. **Authentication**: Implement token-based authentication for production
2. **Rate Limiting**: Limit connection attempts and message frequency
3. **Message Validation**: Validate all incoming messages
4. **TLS/SSL**: Use `wss://` (WebSocket Secure) in production
5. **Origin Checking**: Validate WebSocket origin headers
6. **Connection Limits**: Limit concurrent connections per client

## Performance

- Keep-alive interval: 30 seconds
- Reconnect delay: 3 seconds (configurable)
- Max reconnect attempts: 5 (configurable)
- Message size limit: Recommended 1MB per message
- Concurrent connections: Server-dependent

## Troubleshooting

### Connection Issues

1. Verify WebSocket server is running
2. Check firewall/network settings
3. Ensure correct WebSocket URL (ws:// not http://)
4. Check browser console for errors

### Reconnection Problems

1. Increase `maxReconnectAttempts`
2. Adjust `reconnectDelay`
3. Check server-side connection handling
4. Verify server supports reconnection

### Message Delivery

1. Ensure message format matches protocol
2. Check JSON serialization
3. Verify timestamp format (milliseconds)
4. Check server broadcast logic

## Future Enhancements

Potential improvements:

1. Message compression (gzip)
2. Binary message support (Protocol Buffers)
3. Message queue for offline clients
4. Historical message replay
5. Room/channel support for multi-client scenarios
6. Enhanced authentication (JWT, OAuth)
7. Message acknowledgment system
8. Delta updates (only changed fields)
