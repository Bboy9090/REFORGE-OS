# WebSocket Live Progress Integration Guide

## Overview

Bobby's World now supports real-time progress updates via WebSocket connections for device flashing operations. This allows the frontend to receive live updates about flash progress, transfer speeds, and job status without polling.

## Architecture

```
Frontend (React)
    ↓
useFlashProgressWebSocket Hook
    ↓
WebSocket Connection (ws://localhost:3001/flash-progress)
    ↓
Backend WebSocket Server (Python/Node.js)
    ↓
Flash Operations Engine (Pandora Agent / BootForge USB)
```

## Frontend Integration

### Hook: `useFlashProgressWebSocket`

Location: `src/hooks/use-flash-progress-websocket.ts`

```typescript
import { useFlashProgressWebSocket } from "@/hooks/use-flash-progress-websocket";

const {
  isConnected,
  connectionStatus,
  reconnectAttempts,
  lastMessageTime,
  activeJobs,
  connect,
  disconnect,
  send,
  clearJob,
  clearAllJobs,
} = useFlashProgressWebSocket({
  url: "ws://localhost:3001/flash-progress",
  reconnectDelay: 3000,
  maxReconnectAttempts: 5,
  enableNotifications: true,
  autoConnect: true,
});
```

### Component: `LiveProgressMonitor`

Location: `src/components/LiveProgressMonitor.tsx`

This component provides a full UI for monitoring live flash operations:

- Connection status indicator
- Active job cards with progress bars
- Real-time transfer speed display
- Estimated time remaining
- Bytes transferred tracking
- Error display

## WebSocket Message Protocol

### Message Types

#### 1. Flash Started

```json
{
  "type": "flash_started",
  "jobId": "job_abc123",
  "deviceId": "ABC123XYZ",
  "stage": "Initializing",
  "totalBytes": 4294967296,
  "timestamp": 1703001234567
}
```

#### 2. Flash Progress

```json
{
  "type": "flash_progress",
  "jobId": "job_abc123",
  "deviceId": "ABC123XYZ",
  "progress": 45.5,
  "stage": "Writing system partition",
  "bytesTransferred": 1953857536,
  "totalBytes": 4294967296,
  "transferSpeed": 21250000,
  "estimatedTimeRemaining": 110,
  "timestamp": 1703001234567
}
```

#### 3. Flash Completed

```json
{
  "type": "flash_completed",
  "jobId": "job_abc123",
  "deviceId": "ABC123XYZ",
  "timestamp": 1703001234567
}
```

#### 4. Flash Failed

```json
{
  "type": "flash_failed",
  "jobId": "job_abc123",
  "deviceId": "ABC123XYZ",
  "error": "USB connection lost during transfer",
  "timestamp": 1703001234567
}
```

#### 5. Flash Paused

```json
{
  "type": "flash_paused",
  "jobId": "job_abc123",
  "deviceId": "ABC123XYZ",
  "timestamp": 1703001234567
}
```

#### 6. Flash Resumed

```json
{
  "type": "flash_resumed",
  "jobId": "job_abc123",
  "deviceId": "ABC123XYZ",
  "timestamp": 1703001234567
}
```

#### 7. Ping/Pong (Keep-Alive)

```json
{
  "type": "ping",
  "timestamp": 1703001234567
}
```

Server responds with:

```json
{
  "type": "pong",
  "timestamp": 1703001234567
}
```

## Backend Implementation

### Python FastAPI WebSocket Server

```python
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
import json
import asyncio
from datetime import datetime

app = FastAPI()

class FlashProgressManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.active_jobs = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)

    async def send_progress_update(self, job_id: str, device_id: str, progress: float,
                                   stage: str, bytes_transferred: int, total_bytes: int,
                                   transfer_speed: float, eta: float):
        """Send progress update for a specific job"""
        message = {
            "type": "flash_progress",
            "jobId": job_id,
            "deviceId": device_id,
            "progress": progress,
            "stage": stage,
            "bytesTransferred": bytes_transferred,
            "totalBytes": total_bytes,
            "transferSpeed": transfer_speed,
            "estimatedTimeRemaining": eta,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
        await self.broadcast(message)

    async def flash_started(self, job_id: str, device_id: str, total_bytes: int):
        """Notify that a flash operation has started"""
        message = {
            "type": "flash_started",
            "jobId": job_id,
            "deviceId": device_id,
            "stage": "Initializing",
            "totalBytes": total_bytes,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
        await self.broadcast(message)

    async def flash_completed(self, job_id: str, device_id: str):
        """Notify that a flash operation completed successfully"""
        message = {
            "type": "flash_completed",
            "jobId": job_id,
            "deviceId": device_id,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
        await self.broadcast(message)

    async def flash_failed(self, job_id: str, device_id: str, error: str):
        """Notify that a flash operation failed"""
        message = {
            "type": "flash_failed",
            "jobId": job_id,
            "deviceId": device_id,
            "error": error,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
        await self.broadcast(message)

manager = FlashProgressManager()

@app.websocket("/flash-progress")
async def flash_progress_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
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
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket)

# Example: Integration with flash operation
async def perform_flash_operation(job_id: str, device_id: str, image_path: str):
    """
    Example flash operation that sends progress updates
    """
    total_bytes = 4294967296  # 4GB example
    bytes_per_chunk = 10485760  # 10MB chunks

    # Notify start
    await manager.flash_started(job_id, device_id, total_bytes)

    try:
        bytes_transferred = 0
        while bytes_transferred < total_bytes:
            # Simulate flash write
            await asyncio.sleep(0.5)
            bytes_transferred += bytes_per_chunk

            progress = (bytes_transferred / total_bytes) * 100
            transfer_speed = 21250000  # ~20MB/s
            eta = (total_bytes - bytes_transferred) / transfer_speed

            stage = "Writing system partition"
            if progress < 10:
                stage = "Initializing"
            elif progress > 95:
                stage = "Finalizing"

            # Send progress update
            await manager.send_progress_update(
                job_id, device_id, progress, stage,
                bytes_transferred, total_bytes, transfer_speed, eta
            )

        # Notify completion
        await manager.flash_completed(job_id, device_id)

    except Exception as e:
        # Notify failure
        await manager.flash_failed(job_id, device_id, str(e))

# Start flash operation endpoint
@app.post("/api/flash/start")
async def start_flash(device_id: str, partition: str):
    import uuid
    job_id = f"job_{uuid.uuid4().hex[:8]}"

    # Start flash in background
    asyncio.create_task(perform_flash_operation(
        job_id, device_id, f"/path/to/{partition}.img"
    ))

    return {"jobId": job_id, "status": "started"}
```

### Node.js WebSocket Server

```javascript
const WebSocket = require("ws");
const express = require("express");
const app = express();

const wss = new WebSocket.Server({ port: 3001 });

class FlashProgressManager {
  constructor() {
    this.clients = new Set();
  }

  broadcast(message) {
    const data = JSON.stringify({
      ...message,
      timestamp: Date.now(),
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  flashStarted(jobId, deviceId, totalBytes) {
    this.broadcast({
      type: "flash_started",
      jobId,
      deviceId,
      stage: "Initializing",
      totalBytes,
    });
  }

  sendProgress(
    jobId,
    deviceId,
    progress,
    stage,
    bytesTransferred,
    totalBytes,
    transferSpeed,
    eta,
  ) {
    this.broadcast({
      type: "flash_progress",
      jobId,
      deviceId,
      progress,
      stage,
      bytesTransferred,
      totalBytes,
      transferSpeed,
      estimatedTimeRemaining: eta,
    });
  }

  flashCompleted(jobId, deviceId) {
    this.broadcast({
      type: "flash_completed",
      jobId,
      deviceId,
    });
  }

  flashFailed(jobId, deviceId, error) {
    this.broadcast({
      type: "flash_failed",
      jobId,
      deviceId,
      error,
    });
  }
}

const manager = new FlashProgressManager();

wss.on("connection", (ws) => {
  manager.clients.add(ws);
  console.log(`Client connected. Total: ${manager.clients.size}`);

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);

      if (message.type === "ping") {
        ws.send(
          JSON.stringify({
            type: "pong",
            timestamp: Date.now(),
          }),
        );
      }
    } catch (err) {
      console.error("Message parse error:", err);
    }
  });

  ws.on("close", () => {
    manager.clients.delete(ws);
    console.log(`Client disconnected. Total: ${manager.clients.size}`);
  });
});

// Example flash operation
async function performFlash(jobId, deviceId, imagePath) {
  const totalBytes = 4294967296; // 4GB
  const chunkSize = 10485760; // 10MB

  manager.flashStarted(jobId, deviceId, totalBytes);

  let bytesTransferred = 0;

  const interval = setInterval(() => {
    bytesTransferred += chunkSize;

    if (bytesTransferred >= totalBytes) {
      clearInterval(interval);
      manager.flashCompleted(jobId, deviceId);
      return;
    }

    const progress = (bytesTransferred / totalBytes) * 100;
    const transferSpeed = 21250000;
    const eta = (totalBytes - bytesTransferred) / transferSpeed;

    let stage = "Writing system partition";
    if (progress < 10) stage = "Initializing";
    else if (progress > 95) stage = "Finalizing";

    manager.sendProgress(
      jobId,
      deviceId,
      progress,
      stage,
      bytesTransferred,
      totalBytes,
      transferSpeed,
      eta,
    );
  }, 500);
}

app.post("/api/flash/start", (req, res) => {
  const jobId = `job_${Math.random().toString(36).substr(2, 9)}`;
  const { deviceId, partition } = req.body;

  performFlash(jobId, deviceId, `/path/to/${partition}.img`);

  res.json({ jobId, status: "started" });
});

app.listen(3000, () => {
  console.log("HTTP server on port 3000");
  console.log("WebSocket server on port 3001");
});
```

## Integration with BootForge USB

When integrating with the BootForge USB driver, the flash operation should emit progress events:

```python
from bootforgeusb import FlashOperation

async def flash_with_progress(device_id: str, partition: str, image_path: str, job_id: str):
    flash_op = FlashOperation(device_id, partition, image_path)

    # Register progress callback
    async def on_progress(progress_data):
        await manager.send_progress_update(
            job_id=job_id,
            device_id=device_id,
            progress=progress_data['percentage'],
            stage=progress_data['stage'],
            bytes_transferred=progress_data['bytes_written'],
            total_bytes=progress_data['total_bytes'],
            transfer_speed=progress_data['transfer_speed'],
            eta=progress_data['eta']
        )

    flash_op.on_progress(on_progress)

    await manager.flash_started(job_id, device_id, flash_op.total_bytes)

    try:
        await flash_op.execute()
        await manager.flash_completed(job_id, device_id)
    except Exception as e:
        await manager.flash_failed(job_id, device_id, str(e))
```

## Testing

### Manual Testing with WebSocket Client

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket server
wscat -c ws://localhost:3001/flash-progress

# Send ping
{"type": "ping", "timestamp": 1703001234567}

# Expect pong response
{"type": "pong", "timestamp": 1703001234567}
```

### Simulate Flash Progress (Python)

```python
import asyncio
import websockets
import json

async def simulate_flash():
    uri = "ws://localhost:3001/flash-progress"
    async with websockets.connect(uri) as websocket:
        # Start flash
        await websocket.send(json.dumps({
            "type": "flash_started",
            "jobId": "test_job_123",
            "deviceId": "TEST_DEVICE",
            "totalBytes": 1000000,
            "timestamp": int(time.time() * 1000)
        }))

        # Simulate progress
        for i in range(0, 101, 10):
            await asyncio.sleep(1)
            await websocket.send(json.dumps({
                "type": "flash_progress",
                "jobId": "test_job_123",
                "deviceId": "TEST_DEVICE",
                "progress": i,
                "stage": f"Writing... {i}%",
                "bytesTransferred": i * 10000,
                "totalBytes": 1000000,
                "transferSpeed": 10000,
                "estimatedTimeRemaining": (100 - i),
                "timestamp": int(time.time() * 1000)
            }))

        # Complete
        await websocket.send(json.dumps({
            "type": "flash_completed",
            "jobId": "test_job_123",
            "deviceId": "TEST_DEVICE",
            "timestamp": int(time.time() * 1000)
        }))

asyncio.run(simulate_flash())
```

## Deployment

### Production Configuration

1. **Use WSS (Secure WebSocket) in production**:

   ```javascript
   const wss = new WebSocket.Server({
     server: httpsServer,
     path: "/flash-progress",
   });
   ```

2. **Configure CORS**:

   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Add authentication**:

   ```python
   @app.websocket("/flash-progress")
   async def flash_progress_endpoint(websocket: WebSocket, token: str = Query(...)):
       # Verify token
       if not verify_token(token):
           await websocket.close(code=1008, reason="Unauthorized")
           return

       await manager.connect(websocket)
       # ... rest of handler
   ```

## Troubleshooting

### Connection Issues

1. **Check WebSocket URL**: Ensure the URL matches backend configuration
2. **Check CORS**: WebSocket connections are subject to CORS policies
3. **Check firewall**: Port 3001 must be accessible
4. **Check SSL**: Use WSS for HTTPS sites

### Message Not Received

1. **Check message format**: All messages must be valid JSON
2. **Check connection state**: Only send when `readyState === OPEN`
3. **Check server logs**: Verify backend is processing messages
4. **Check client logs**: Look for parsing errors in browser console

## Next Steps

1. Integrate with real BootForge USB driver
2. Add authentication/authorization
3. Implement job queue management
4. Add bandwidth throttling controls
5. Implement pause/resume functionality
6. Add multi-device parallel flashing
7. Store historical flash data
8. Add performance analytics
