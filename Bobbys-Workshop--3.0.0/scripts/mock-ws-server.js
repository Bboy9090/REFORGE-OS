#!/usr/bin/env node

const WebSocket = require('ws');

const PORT = 3001;
const PATH = '/ws/device-events';

const wss = new WebSocket.Server({ 
  port: PORT,
  path: PATH,
});

const platforms = ['ios', 'android'];
const iosModes = ['ios_normal_confirmed', 'ios_recovery_likely', 'ios_dfu_likely'];
const androidModes = ['android_adb_confirmed', 'android_fastboot_confirmed', 'android_recovery_adb_confirmed'];

const deviceNames = [
  'iPhone 14 Pro',
  'iPhone 13',
  'iPad Air',
  'Pixel 7 Pro',
  'Pixel 6a',
  'Samsung Galaxy S23',
  'OnePlus 11',
  'Xiaomi 13',
];

let connectedClients = new Set();
let deviceCounter = 0;

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║   Pandora Codex - Mock WebSocket Device Hotplug Server        ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`WebSocket Server: ws://localhost:${PORT}${PATH}`);
console.log('');
console.log('This mock server simulates device hotplug events for testing.');
console.log('Press Ctrl+C to stop the server.');
console.log('');

wss.on('connection', (ws) => {
  console.log(`[${new Date().toISOString()}] ✓ Client connected`);
  console.log(`   Total clients: ${connectedClients.size + 1}`);
  connectedClients.add(ws);

  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'pong') {
        console.log(`[${new Date().toISOString()}] ← Pong received from client`);
      }
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ✗ Invalid message from client:`, err.message);
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
    clearInterval(pingInterval);
    console.log(`[${new Date().toISOString()}] ✗ Client disconnected`);
    console.log(`   Total clients: ${connectedClients.size}`);
  });

  ws.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] ✗ WebSocket error:`, error.message);
  });
});

function generateDeviceUID() {
  const vid = Math.random().toString(16).slice(2, 6).padStart(4, '0');
  const pid = Math.random().toString(16).slice(2, 6).padStart(4, '0');
  const bus = Math.floor(Math.random() * 8) + 1;
  const addr = Math.floor(Math.random() * 127) + 1;
  return `usb:${vid}:${pid}:bus${bus}:addr${addr}`;
}

function generateDeviceEvent(type) {
  deviceCounter++;
  
  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  const modes = platform === 'ios' ? iosModes : androidModes;
  const mode = modes[Math.floor(Math.random() * modes.length)];
  const deviceName = deviceNames[Math.floor(Math.random() * deviceNames.length)];
  const confidence = 0.75 + Math.random() * 0.25;

  return {
    type: type,
    device_uid: generateDeviceUID(),
    platform_hint: platform,
    mode: mode,
    confidence: parseFloat(confidence.toFixed(2)),
    timestamp: new Date().toISOString(),
    display_name: `${deviceName} (${mode.replace(/_/g, ' ')})`,
  };
}

function broadcastEvent(event) {
  const message = JSON.stringify({
    type: 'device_event',
    event: event,
  });

  let successCount = 0;
  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        successCount++;
      } catch (err) {
        console.error(`[${new Date().toISOString()}] ✗ Failed to send to client:`, err.message);
      }
    }
  });

  const eventIcon = event.type === 'connected' ? '🔌' : '🔴';
  console.log(`[${new Date().toISOString()}] ${eventIcon} ${event.type.toUpperCase()}`);
  console.log(`   Device: ${event.display_name}`);
  console.log(`   UID: ${event.device_uid}`);
  console.log(`   Platform: ${event.platform_hint} | Mode: ${event.mode}`);
  console.log(`   Confidence: ${(event.confidence * 100).toFixed(0)}%`);
  console.log(`   Broadcast to ${successCount} client(s)`);
  console.log('');
}

function simulateRandomEvent() {
  if (connectedClients.size === 0) {
    return;
  }

  const eventType = Math.random() > 0.5 ? 'connected' : 'disconnected';
  const event = generateDeviceEvent(eventType);
  broadcastEvent(event);
}

const eventInterval = setInterval(() => {
  simulateRandomEvent();
}, 8000 + Math.random() * 4000);

console.log('Mock server is running...');
console.log('Simulating random device events every 8-12 seconds.');
console.log('');

wss.on('error', (error) => {
  console.error('Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error('');
    console.error('ERROR: Port 3001 is already in use.');
    console.error('Please stop any other service using this port and try again.');
    console.error('');
    process.exit(1);
  }
});

process.on('SIGINT', () => {
  console.log('');
  console.log('Shutting down mock WebSocket server...');
  clearInterval(eventInterval);
  
  connectedClients.forEach((client) => {
    client.close();
  });
  
  wss.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('');
  console.log('Received SIGTERM, shutting down...');
  clearInterval(eventInterval);
  wss.close();
  process.exit(0);
});
