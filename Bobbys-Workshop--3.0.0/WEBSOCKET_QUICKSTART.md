# WebSocket Hotplug - Quick Start Guide

## Overview

This guide will help you get the WebSocket device hotplug monitoring system up and running in under 5 minutes.

## Prerequisites

- Node.js installed (v16 or higher)
- npm or pnpm package manager
- The `ws` package (already included in dependencies)

## Quick Start

### Step 1: Start the Mock WebSocket Server

For testing and development, use the included mock server:

```bash
node scripts/mock-ws-server.js
```

You should see output like:

```
╔════════════════════════════════════════════════════════════════╗
║   Pandora Codex - Mock WebSocket Device Hotplug Server        ║
╚════════════════════════════════════════════════════════════════╝

WebSocket Server: ws://localhost:3001/ws/device-events

This mock server simulates device hotplug events for testing.
Press Ctrl+C to stop the server.

Mock server is running...
Simulating random device events every 8-12 seconds.
```

**What the mock server does:**

- Listens on `ws://localhost:3001/ws/device-events`
- Simulates random device connect/disconnect events every 8-12 seconds
- Broadcasts events to all connected clients
- Sends ping messages every 30 seconds to keep connections alive
- Logs all activity to console with timestamps

### Step 2: Start the Frontend Application

In a new terminal window:

```bash
npm run dev
```

Or with pnpm:

```bash
pnpm dev
```

### Step 3: Open the Application

Navigate to `http://localhost:5173` in your browser.

### Step 4: Access the Live Hotplug Monitor

1. Click on the **"Live Hotplug"** tab in the main navigation
2. You should see:
   - A green "Connected" badge indicating WebSocket connection is active
   - Statistics showing 0 connections/disconnections initially
   - A message "Waiting for device events..."

### Step 5: Watch Events Arrive

Within 8-12 seconds, you should see:

- Toast notifications appearing for device connections/disconnections
- The event stream updating with new events
- Statistics incrementing (connections, disconnections, current devices)
- Color-coded badges showing platform (iOS/Android) and confidence levels

## What You'll See

### Connection Status

- **Green Badge**: WebSocket connected successfully
- **Red Badge**: WebSocket disconnected (will auto-reconnect)

### Statistics Dashboard

- **Connected**: Total number of device connection events
- **Disconnected**: Total number of device disconnection events
- **Current Devices**: Net count of currently connected devices
- **Total Events**: Number of events in the history buffer

### Event Cards

Each event shows:

- **Event Type Badge**: Connected (green) or Disconnected (red)
- **Platform Badge**: iOS (blue) or Android (green)
- **Confidence Badge**: Percentage with color coding (high/medium/low)
- **Device Name**: Human-readable device identifier
- **Device UID**: USB identifier (vid:pid:bus:address)
- **Mode**: Device mode (e.g., "android adb confirmed")
- **Time**: Relative timestamp (e.g., "2 seconds ago")

### Toast Notifications

- **Success Toast (Green)**: Device connected
- **Info Toast (Blue)**: Device disconnected
- **Success Toast (Green)**: WebSocket connection established
- **Error Toast (Red)**: Connection failed or disconnected

## Testing Different Scenarios

### Manual Disconnect/Reconnect

1. Click the **"Disconnect"** button
2. Watch the status change to red
3. Click the **"Reconnect"** button
4. Status should turn green again

### Clear Event History

1. Click the **"Clear All"** button
2. All events and statistics will be reset
3. New events will continue to arrive

### Stop the Mock Server

1. In the mock server terminal, press `Ctrl+C`
2. Frontend will detect disconnection
3. Auto-reconnection will attempt 5 times with exponential backoff
4. After max attempts, an error toast will appear

## Production Setup

For production use with real device detection:

### Option 1: BootForgeUSB Integration

See [WEBSOCKET_HOTPLUG.md](./WEBSOCKET_HOTPLUG.md) for detailed backend implementation.

Basic steps:

1. Implement WebSocket endpoint in your Node.js backend
2. Poll BootForgeUSB CLI for device changes
3. Broadcast events to connected WebSocket clients

Example code snippet:

```javascript
const { exec } = require("child_process");
let lastDeviceList = [];

function checkDevices() {
  exec("bootforgeusb-cli scan --json", (error, stdout) => {
    if (!error) {
      const currentDevices = JSON.parse(stdout);
      // Compare with lastDeviceList and broadcast changes
    }
  });
}

setInterval(checkDevices, 1000);
```

### Option 2: Native USB Monitoring

For production systems, implement native USB event monitoring:

- **Linux**: Use `libudev` for hardware events
- **macOS**: Use `IOKit` notifications
- **Windows**: Use `SetupAPI` device notifications

These provide instant event notifications without polling.

## Troubleshooting

### "WebSocket Disconnected" Message

**Problem**: Frontend shows disconnected status

**Solutions**:

1. Check if backend server is running: `ps aux | grep mock-ws-server`
2. Verify port 3001 is not in use by another process
3. Check firewall settings
4. Look at browser console for error messages

### No Events Appearing

**Problem**: Connected but no events show up

**Solutions**:

1. Verify mock server is running and logging events
2. Check browser console for JavaScript errors
3. Refresh the page
4. Try disconnecting and reconnecting manually

### Events Not Showing Toast Notifications

**Problem**: Events appear but no toasts

**Solutions**:

1. Check if notifications are blocked in browser
2. Verify the `<Toaster />` component is mounted in App.tsx
3. Check browser console for errors related to `sonner`

### Port 3001 Already in Use

**Problem**: Mock server won't start

**Error**: `EADDRINUSE: address already in use :::3001`

**Solutions**:

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or use a different port by editing scripts/mock-ws-server.js
```

### Reconnection Not Working

**Problem**: WebSocket won't reconnect after server restart

**Solutions**:

1. Check max reconnection attempts (default: 5)
2. Manually click "Reconnect" button
3. Refresh the browser page
4. Check browser console for detailed error messages

## Advanced Configuration

### Change WebSocket URL

Edit `src/components/LiveDeviceHotplugMonitor.tsx`:

```typescript
const { isConnected } = useDeviceHotplug({
  wsUrl: "ws://your-server:port/path",
});
```

### Adjust Event Simulation Rate

Edit `scripts/mock-ws-server.js`:

```javascript
// Change from 8-12 seconds to 3-5 seconds
const eventInterval = setInterval(
  () => {
    simulateRandomEvent();
  },
  3000 + Math.random() * 2000,
); // 3-5 seconds
```

### Increase Event Buffer Size

Edit `src/hooks/use-device-hotplug.ts`:

```typescript
// Change from 100 to 500 events
setEvents((prev) => [event, ...prev].slice(0, 500));
```

### Disable Toast Notifications

```typescript
const { isConnected } = useDeviceHotplug({
  showToasts: false,
});
```

## Next Steps

1. **Read Full Documentation**: [WEBSOCKET_HOTPLUG.md](./WEBSOCKET_HOTPLUG.md)
2. **Backend Integration**: [BOOTFORGEUSB_BACKEND_WIRING.md](./BOOTFORGEUSB_BACKEND_WIRING.md)
3. **API Documentation**: [BACKEND_API_IMPLEMENTATION.md](./BACKEND_API_IMPLEMENTATION.md)
4. **Test with Real Devices**: Connect actual Android/iOS devices and implement real backend

## Example Use Cases

### Automated Testing

Use hotplug events to trigger automated tests when devices connect:

```typescript
const { events } = useDeviceHotplug({
  onConnect: (event) => {
    if (event.platform_hint === "android" && event.mode.includes("adb")) {
      runAutomatedTests(event.device_uid);
    }
  },
});
```

### Device Inventory Tracking

Track which devices have been connected:

```typescript
const [deviceInventory, setDeviceInventory] = useState<Set<string>>(new Set());

useDeviceHotplug({
  onConnect: (event) => {
    setDeviceInventory((prev) => new Set(prev).add(event.device_uid));
  },
});
```

### Alert on Specific Devices

Monitor for specific device types:

```typescript
useDeviceHotplug({
  onConnect: (event) => {
    if (event.platform_hint === "ios" && event.mode.includes("dfu")) {
      alert("iPhone in DFU mode detected!");
    }
  },
});
```

## Support

For issues or questions:

1. Check the [WEBSOCKET_HOTPLUG.md](./WEBSOCKET_HOTPLUG.md) documentation
2. Review browser console for errors
3. Check mock server logs for connection issues
4. Verify all prerequisites are met

## Summary

You now have:

- ✅ A working WebSocket server for device hotplug events
- ✅ A real-time monitoring UI with live updates
- ✅ Toast notifications for device events
- ✅ Statistics tracking and event history
- ✅ Automatic reconnection on connection loss
- ✅ A foundation for production device monitoring

Happy monitoring! 🚀
