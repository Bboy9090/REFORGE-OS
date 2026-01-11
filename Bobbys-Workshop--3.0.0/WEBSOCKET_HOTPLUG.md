# WebSocket Device Hotplug Implementation

## Overview

This implementation provides real-time device hotplug event notifications using WebSocket connections. It enables live monitoring of USB device connections and disconnections with instant UI updates and toast notifications.

## Architecture

### Frontend Components

#### 1. `useDeviceHotplug` Hook (`src/hooks/use-device-hotplug.ts`)

A comprehensive React hook that manages WebSocket connections and device event streams.

**Features:**

- Automatic connection management with configurable auto-connect
- Exponential backoff reconnection strategy (max 5 attempts)
- Event buffering (stores last 100 events)
- Real-time statistics tracking
- Toast notification integration
- Heartbeat/ping-pong support

**API:**

```typescript
const {
  isConnected,       // boolean - WebSocket connection status
  events,            // DeviceHotplugEvent[] - event history
  stats,             // HotplugStats - connection/disconnection counts
  connect,           // () => void - manual connect
  disconnect,        // () => void - manual disconnect
  clearEvents,       // () => void - clear event history
  resetStats,        // () => void - reset statistics
} = useDeviceHotplug({
  wsUrl?: string,                              // default: 'ws://localhost:3001/ws/device-events'
  autoConnect?: boolean,                       // default: true
  showToasts?: boolean,                        // default: true
  onConnect?: (event) => void,                 // callback for device connect events
  onDisconnect?: (event) => void,              // callback for device disconnect events
  onError?: (error) => void,                   // callback for WebSocket errors
});
```

**Event Types:**

```typescript
interface DeviceHotplugEvent {
  type: "connected" | "disconnected";
  device_uid: string; // e.g., "usb:05ac:12a8:bus3:addr12"
  platform_hint: string; // 'ios' | 'android' | 'unknown'
  mode: string; // device mode (e.g., 'ios_dfu_likely')
  confidence: number; // 0.0 - 1.0
  timestamp: string; // ISO 8601 timestamp
  display_name: string; // human-readable device name
}

interface HotplugStats {
  totalConnections: number;
  totalDisconnections: number;
  currentDevices: number;
  lastEventTime: string | null;
}
```

#### 2. `LiveDeviceHotplugMonitor` Component (`src/components/LiveDeviceHotplugMonitor.tsx`)

A full-featured UI for monitoring real-time device events.

**Features:**

- Real-time event stream display with timestamps
- Connection status indicator
- Statistics dashboard (connections, disconnections, current devices, total events)
- Manual connect/disconnect controls
- Event history with scrollable list
- Clear all events functionality
- Color-coded badges for:
  - Event type (connected/disconnected)
  - Platform (iOS/Android/unknown)
  - Confidence level
- Time-ago formatting for events

### Backend Requirements

The backend server must implement a WebSocket endpoint at `/ws/device-events` that:

1. Accepts WebSocket connections
2. Sends device hotplug events in the following format:

```json
{
  "type": "device_event",
  "event": {
    "type": "connected",
    "device_uid": "usb:18d1:4ee7:bus1:addr5",
    "platform_hint": "android",
    "mode": "android_adb_confirmed",
    "confidence": 0.94,
    "timestamp": "2024-01-15T10:30:45.123Z",
    "display_name": "Pixel 7 (ADB Mode)"
  }
}
```

3. Supports ping/pong heartbeat messages:

```json
// Server sends:
{ "type": "ping" }

// Client responds:
{ "type": "pong" }
```

## Backend Implementation Guide

### Node.js/Express with `ws` library

```javascript
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on("connection", (ws) => {
  console.log("Client connected to device event stream");
  clients.add(ws);

  // Send ping every 30 seconds
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }));
    }
  }, 30000);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === "pong") {
        console.log("Received pong from client");
      }
    } catch (err) {
      console.error("Invalid message from client:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected from device event stream");
    clients.delete(ws);
    clearInterval(pingInterval);
  });
});

// Function to broadcast device events to all connected clients
function broadcastDeviceEvent(event) {
  const message = JSON.stringify({
    type: "device_event",
    event: event,
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Example: Simulate device connect event
function simulateDeviceConnect() {
  broadcastDeviceEvent({
    type: "connected",
    device_uid: "usb:18d1:4ee7:bus1:addr5",
    platform_hint: "android",
    mode: "android_adb_confirmed",
    confidence: 0.94,
    timestamp: new Date().toISOString(),
    display_name: "Pixel 7 (ADB Mode)",
  });
}

// Example: Simulate device disconnect event
function simulateDeviceDisconnect() {
  broadcastDeviceEvent({
    type: "disconnected",
    device_uid: "usb:18d1:4ee7:bus1:addr5",
    platform_hint: "android",
    mode: "android_adb_confirmed",
    confidence: 0.94,
    timestamp: new Date().toISOString(),
    display_name: "Pixel 7 (ADB Mode)",
  });
}

server.listen(3001, () => {
  console.log("Server listening on port 3001");
  console.log("WebSocket endpoint: ws://localhost:3001/ws/device-events");
});
```

### Integration with BootForgeUSB

To integrate with your existing BootForgeUSB Rust implementation:

1. **Poll-based monitoring** (simple approach):

```javascript
const { exec } = require("child_process");

let lastDeviceList = [];

function checkDevices() {
  exec("bootforgeusb-cli scan --json", (error, stdout) => {
    if (error) {
      console.error("BootForgeUSB scan failed:", error);
      return;
    }

    try {
      const currentDevices = JSON.parse(stdout);
      const currentUIDs = new Set(currentDevices.map((d) => d.device_uid));
      const lastUIDs = new Set(lastDeviceList.map((d) => d.device_uid));

      // Detect new connections
      currentDevices.forEach((device) => {
        if (!lastUIDs.has(device.device_uid)) {
          broadcastDeviceEvent({
            type: "connected",
            device_uid: device.device_uid,
            platform_hint: device.platform_hint,
            mode: device.mode,
            confidence: device.confidence,
            timestamp: new Date().toISOString(),
            display_name: generateDisplayName(device),
          });
        }
      });

      // Detect disconnections
      lastDeviceList.forEach((device) => {
        if (!currentUIDs.has(device.device_uid)) {
          broadcastDeviceEvent({
            type: "disconnected",
            device_uid: device.device_uid,
            platform_hint: device.platform_hint,
            mode: device.mode,
            confidence: device.confidence,
            timestamp: new Date().toISOString(),
            display_name: generateDisplayName(device),
          });
        }
      });

      lastDeviceList = currentDevices;
    } catch (err) {
      console.error("Failed to parse BootForgeUSB output:", err);
    }
  });
}

// Poll every 1 second
setInterval(checkDevices, 1000);

function generateDisplayName(device) {
  const manufacturer = device.evidence?.usb?.manufacturer || "";
  const product = device.evidence?.usb?.product || "";
  const mode = device.mode.replace(/_/g, " ");

  if (manufacturer && product) {
    return `${manufacturer} ${product} (${mode})`;
  }
  return `${device.device_uid} (${mode})`;
}
```

2. **Native USB event monitoring** (advanced approach):

For production systems, implement native USB hotplug monitoring in Rust using:

- **Linux**: `libudev` for uevents
- **macOS**: `IOKit` notifications
- **Windows**: `SetupAPI` device notifications

Then expose these events through the Node.js bridge.

## Usage Examples

### Basic Usage

```typescript
import { LiveDeviceHotplugMonitor } from '@/components/LiveDeviceHotplugMonitor';

function App() {
  return <LiveDeviceHotplugMonitor />;
}
```

### Custom Hook Usage

```typescript
import { useDeviceHotplug } from '@/hooks/use-device-hotplug';

function CustomDeviceMonitor() {
  const { isConnected, events, stats } = useDeviceHotplug({
    autoConnect: true,
    showToasts: false,
    onConnect: (event) => {
      console.log('Device connected:', event);
    },
    onDisconnect: (event) => {
      console.log('Device disconnected:', event);
    },
  });

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Current Devices: {stats.currentDevices}</p>
      <ul>
        {events.map((event, idx) => (
          <li key={idx}>
            {event.type}: {event.display_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Features

### Reconnection Strategy

The hook implements exponential backoff reconnection:

- Attempt 1: 1 second delay
- Attempt 2: 2 seconds delay
- Attempt 3: 4 seconds delay
- Attempt 4: 8 seconds delay
- Attempt 5: 16 seconds delay
- Maximum 5 attempts, then gives up

### Event Buffer

Events are stored in a rolling buffer of 100 items. When new events arrive, the oldest events are removed to maintain the limit.

### Statistics Tracking

Real-time statistics are maintained:

- **Total Connections**: Cumulative count of all device connect events
- **Total Disconnections**: Cumulative count of all device disconnect events
- **Current Devices**: Net count of currently connected devices
- **Last Event Time**: Timestamp of the most recent event

### Toast Notifications

When enabled (default), the system shows toast notifications:

- **Success (Green)**: Device connected
- **Info (Blue)**: Device disconnected
- **Success (Green)**: WebSocket connected
- **Error (Red)**: WebSocket disconnected after max retries

## Configuration

### Change WebSocket URL

```typescript
const { isConnected } = useDeviceHotplug({
  wsUrl: "ws://custom-server:8080/device-stream",
});
```

### Disable Auto-Connect

```typescript
const { connect, disconnect } = useDeviceHotplug({
  autoConnect: false,
});

// Manually control connection
connect();
disconnect();
```

### Disable Toast Notifications

```typescript
const { events } = useDeviceHotplug({
  showToasts: false,
});
```

## Testing

### Manual Testing with wscat

```bash
npm install -g wscat
wscat -c ws://localhost:3001/ws/device-events

# Send test events from server side or manually:
{"type":"device_event","event":{"type":"connected","device_uid":"test:1234:5678","platform_hint":"android","mode":"android_adb_confirmed","confidence":0.95,"timestamp":"2024-01-15T10:30:00Z","display_name":"Test Device"}}
```

### Simulated Events for Development

You can create a mock WebSocket server for development:

```javascript
// mock-ws-server.js
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3001, path: "/ws/device-events" });

wss.on("connection", (ws) => {
  console.log("Mock client connected");

  // Simulate device events every 10 seconds
  const interval = setInterval(() => {
    const eventType = Math.random() > 0.5 ? "connected" : "disconnected";
    const event = {
      type: "device_event",
      event: {
        type: eventType,
        device_uid: `usb:${Math.random().toString(16).slice(2, 6)}:test`,
        platform_hint: Math.random() > 0.5 ? "android" : "ios",
        mode: "test_mode",
        confidence: 0.85 + Math.random() * 0.15,
        timestamp: new Date().toISOString(),
        display_name: `Test Device ${Math.floor(Math.random() * 100)}`,
      },
    };
    ws.send(JSON.stringify(event));
  }, 10000);

  ws.on("close", () => {
    clearInterval(interval);
  });
});

console.log(
  "Mock WebSocket server running on ws://localhost:3001/ws/device-events",
);
```

Run with: `node mock-ws-server.js`

## Security Considerations

1. **Origin Validation**: In production, validate WebSocket origin headers
2. **Authentication**: Implement token-based authentication if needed
3. **Rate Limiting**: Prevent abuse by limiting connection attempts
4. **SSL/TLS**: Use `wss://` in production environments

## Performance

- WebSocket connections are lightweight (~5KB overhead)
- Event messages are typically <500 bytes
- Reconnection delays prevent server overload
- Event buffer prevents memory leaks
- Automatic cleanup on component unmount

## Troubleshooting

### Connection Failed

- Verify backend server is running on `localhost:3001`
- Check browser console for WebSocket errors
- Ensure no firewall blocking port 3001
- Verify `/ws/device-events` endpoint exists

### No Events Appearing

- Check backend is broadcasting events correctly
- Verify JSON message format matches expected schema
- Check browser console for parsing errors
- Test with manual WebSocket client (wscat)

### Reconnection Not Working

- Check browser console for error messages
- Verify backend server is accepting new connections
- Check max reconnection attempts haven't been exceeded
- Manually trigger reconnect with `connect()` function

## Future Enhancements

1. **Event Filtering**: Filter events by platform, mode, or confidence
2. **Event Search**: Search through event history
3. **Event Export**: Export event history as JSON/CSV
4. **Device Grouping**: Group events by device UID
5. **Connection Quality Metrics**: Track latency and packet loss
6. **Audio Notifications**: Optional sound alerts for events
7. **Desktop Notifications**: Browser notification API integration
8. **Event Replay**: Replay historical events for debugging
9. **Multi-server Support**: Connect to multiple WebSocket servers
10. **Compression**: WebSocket per-message deflate for reduced bandwidth

## Related Documentation

- [BootForgeUSB Backend Wiring](./BOOTFORGEUSB_BACKEND_WIRING.md)
- [Backend API Implementation](./BACKEND_API_IMPLEMENTATION.md)
- [WebUSB Monitoring](./WEBUSB_MONITORING.md)
- [USB Device Detection](./ADB_FASTBOOT_DETECTION.md)
