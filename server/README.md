# Flash Progress WebSocket Server

This directory contains WebSocket server implementations for live flash progress updates in Bobby's World.

## Available Servers

### 1. Node.js Server (`flash-progress-server.js`)

- **Port**: 3000 (HTTP API), 3001 (WebSocket)
- **Dependencies**: `ws`, `express`, `cors`

### 2. Python Server (`flash_progress_server.py`)

- **Port**: 8000 (HTTP API + WebSocket)
- **Dependencies**: `fastapi`, `uvicorn`, `websockets`

## Quick Start

### Node.js Server

```bash
# Install dependencies
cd server
npm install ws express cors

# Run server
node flash-progress-server.js
```

The server will be available at:

- HTTP API: `http://localhost:3000`
- WebSocket: `ws://localhost:3001/flash-progress`

### Python Server

```bash
# Install dependencies
pip install fastapi uvicorn websockets

# Run server
python3 server/flash_progress_server.py
```

The server will be available at:

- HTTP API: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/flash-progress`

## API Endpoints

### Start Flash Operation

```bash
POST /api/flash/start
Content-Type: application/json

{
  "deviceId": "PIXEL6_001",
  "deviceName": "Google Pixel 6",
  "partition": "system",
  "imageSize": 4294967296
}
```

### Start Demo (3 Devices)

```bash
POST /api/flash/demo
```

This starts flash operations on three simulated devices simultaneously.

### Get All Active Jobs

```bash
GET /api/flash/jobs
```

### Get Specific Job

```bash
GET /api/flash/job/{jobId}
```

### Health Check

```bash
GET /health
```

## Testing

### Using curl

```bash
# Start a demo flash
curl -X POST http://localhost:3000/api/flash/demo

# Check health
curl http://localhost:3000/health

# Get active jobs
curl http://localhost:3000/api/flash/jobs
```

### Using wscat (WebSocket testing)

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:3001/flash-progress

# Send ping (optional)
{"type": "ping", "timestamp": 1703001234567}
```

### From Frontend

Make sure the `LiveProgressMonitor` component is configured with the correct WebSocket URL:

```typescript
// Default configuration in LiveProgressMonitor.tsx
const [wsUrl, setWsUrl] = useState("ws://localhost:3001/flash-progress");
```

For the Python server:

```typescript
const [wsUrl, setWsUrl] = useState("ws://localhost:8000/flash-progress");
```

## WebSocket Message Flow

1. **Client Connects** → Server accepts connection
2. **Flash Started** → Server broadcasts `flash_started` message
3. **Progress Updates** → Server broadcasts `flash_progress` every 500ms
4. **Completion** → Server broadcasts `flash_completed` or `flash_failed`
5. **Keep-Alive** → Client sends `ping`, server responds with `pong`

## Example Message Sequence

```json
// 1. Flash Started
{
  "type": "flash_started",
  "jobId": "job_1703001234_abc123",
  "deviceId": "PIXEL6_001",
  "deviceName": "Google Pixel 6",
  "stage": "Initializing",
  "totalBytes": 4294967296,
  "timestamp": 1703001234567
}

// 2. Progress Update (sent multiple times)
{
  "type": "flash_progress",
  "jobId": "job_1703001234_abc123",
  "deviceId": "PIXEL6_001",
  "progress": 45.5,
  "stage": "Flashing system partition",
  "bytesTransferred": 1953857536,
  "totalBytes": 4294967296,
  "transferSpeed": 21250000,
  "estimatedTimeRemaining": 110,
  "timestamp": 1703001234567
}

// 3. Flash Completed
{
  "type": "flash_completed",
  "jobId": "job_1703001234_abc123",
  "deviceId": "PIXEL6_001",
  "timestamp": 1703001346789
}
```

## Integration with Bobby's World Frontend

The frontend automatically connects to the WebSocket server when you open the "Live Progress" tab in the Device Flashing Dashboard.

### Steps

1. Start the WebSocket server (Node.js or Python)
2. Open Bobby's World in your browser
3. Navigate to: Hub → Device Flashing Dashboard
4. Click the "Live Progress" tab
5. Click "Connect" button
6. Start a demo flash: `POST http://localhost:3000/api/flash/demo`
7. Watch live progress updates in real-time!

## Production Deployment

### Using PM2 (Node.js)

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start server/flash-progress-server.js --name flash-ws

# View logs
pm2 logs flash-ws

# Monitor
pm2 monit
```

### Using systemd (Python)

Create `/etc/systemd/system/flash-progress.service`:

```ini
[Unit]
Description=Bobby's World Flash Progress WebSocket Server
After=network.target

[Service]
Type=simple
User=bobby
WorkingDirectory=/path/to/spark-template
ExecStart=/usr/bin/python3 /path/to/spark-template/server/flash_progress_server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable flash-progress
sudo systemctl start flash-progress
sudo systemctl status flash-progress
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/flash-progress-server.js .
RUN npm install ws express cors
EXPOSE 3000 3001
CMD ["node", "flash-progress-server.js"]
```

```bash
docker build -t bobbys-world-flash-ws .
docker run -p 3000:3000 -p 3001:3001 bobbys-world-flash-ws
```

## Security Considerations

### For Production

1. **Use WSS (Secure WebSocket)**

   ```javascript
   const https = require("https");
   const fs = require("fs");

   const server = https.createServer({
     cert: fs.readFileSync("/path/to/cert.pem"),
     key: fs.readFileSync("/path/to/key.pem"),
   });

   const wss = new WebSocket.Server({ server });
   ```

2. **Add Authentication**

   ```javascript
   wss.on("connection", (ws, req) => {
     const token = new URL(req.url, "ws://base").searchParams.get("token");
     if (!verifyToken(token)) {
       ws.close(1008, "Unauthorized");
       return;
     }
     // ... handle connection
   });
   ```

3. **Rate Limiting**

   ```javascript
   const rateLimit = require("express-rate-limit");

   app.use(
     "/api/flash",
     rateLimit({
       windowMs: 15 * 60 * 1000,
       max: 100,
     }),
   );
   ```

4. **CORS Configuration**

   ```javascript
   app.use(
     cors({
       origin: "https://yourdomain.com",
       credentials: true,
     }),
   );
   ```

## Troubleshooting

### Connection Refused

- Check if server is running: `curl http://localhost:3000/health`
- Check firewall: `sudo ufw allow 3000` and `sudo ufw allow 3001`
- Check port conflicts: `lsof -i :3000` and `lsof -i :3001`

### WebSocket Not Connecting

- Verify URL in frontend matches server port
- Check browser console for errors
- Verify CORS is configured correctly
- Check if running behind proxy (may need proxy configuration)

### No Progress Updates

- Verify WebSocket connection is established
- Check server logs for broadcast messages
- Ensure flash job was started successfully
- Check for JavaScript errors in browser console

## Development Tips

### Enable Debug Logging

Node.js:

```bash
DEBUG=* node flash-progress-server.js
```

Python:

```bash
LOG_LEVEL=debug python3 flash_progress_server.py
```

### Test with Multiple Clients

Open multiple browser tabs and connect each to the WebSocket. All should receive the same progress updates.

### Simulate Failures

Modify the `perform_flash` function to randomly fail:

```javascript
if (Math.random() < 0.1) {
  manager.flashFailed(jobId, deviceId, "Simulated random failure");
  return;
}
```

## Next Steps

1. **Integrate with real BootForge USB driver**
2. **Add pause/resume functionality**
3. **Implement job queue management**
4. **Add bandwidth throttling**
5. **Store flash history in database**
6. **Add multi-device parallel flashing support**
7. **Implement rollback on failure**
8. **Add verification checksums**

## Support

For issues or questions, check:

- Main documentation: `WEBSOCKET_PROGRESS_INTEGRATION.md`
- Backend API guide: `BACKEND_API_IMPLEMENTATION.md`
- Device flashing guide: `DEVICE_FLASHING_INTEGRATION.md`
