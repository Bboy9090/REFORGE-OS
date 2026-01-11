#!/usr/bin/env node

const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.FLASH_PROGRESS_PORT || 3002);

console.log('[flash-progress-server] Starting standalone WS server.');
console.log('[flash-progress-server] NOTE: The main backend (server/index.js) already provides /ws/flash-progress on port 3001.');
console.log(`[flash-progress-server] This standalone server listens on port ${PORT} to avoid conflicts.`);

const wss = new WebSocket.Server({ port: PORT });

class FlashProgressManager {
  constructor() {
    this.clients = new Set();
    this.activeJobs = new Map();
  }

  broadcast(message) {
    const data = JSON.stringify({
      ...message,
      timestamp: Date.now()
    });

    console.log('[WS] Broadcasting:', message.type, message.jobId || '');

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (err) {
          console.error('[WS] Send error:', err);
        }
      }
    });
  }

  flashStarted(jobId, deviceId, deviceName, totalBytes) {
    this.activeJobs.set(jobId, {
      jobId,
      deviceId,
      deviceName,
      status: 'running',
      startedAt: Date.now()
    });

    this.broadcast({
      type: 'flash_started',
      jobId,
      deviceId,
      deviceName,
      stage: 'Initializing',
      totalBytes
    });
  }

  sendProgress(jobId, deviceId, progress, stage, bytesTransferred, 
               totalBytes, transferSpeed, eta) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.progress = progress;
      job.stage = stage;
    }

    this.broadcast({
      type: 'flash_progress',
      jobId,
      deviceId,
      progress,
      stage,
      bytesTransferred,
      totalBytes,
      transferSpeed,
      estimatedTimeRemaining: eta
    });
  }

  flashCompleted(jobId, deviceId) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'completed';
    }

    this.broadcast({
      type: 'flash_completed',
      jobId,
      deviceId
    });
  }

  flashFailed(jobId, deviceId, error) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error;
    }

    this.broadcast({
      type: 'flash_failed',
      jobId,
      deviceId,
      error
    });
  }

  flashPaused(jobId, deviceId) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'paused';
    }

    this.broadcast({
      type: 'flash_paused',
      jobId,
      deviceId
    });
  }

  flashResumed(jobId, deviceId) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'running';
    }

    this.broadcast({
      type: 'flash_resumed',
      jobId,
      deviceId
    });
  }
}

const manager = new FlashProgressManager();

wss.on('connection', (ws) => {
  manager.clients.add(ws);
  console.log(`[WS] Client connected. Total: ${manager.clients.size}`);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      console.error('[WS] Message parse error:', err);
    }
  });

  ws.on('close', () => {
    manager.clients.delete(ws);
    console.log(`[WS] Client disconnected. Total: ${manager.clients.size}`);
  });

  ws.on('error', (err) => {
    console.error('[WS] Error:', err);
  });
});

async function performFlash(jobId, deviceId, deviceName, partition, imageSize) {
  console.log(`[FLASH] Starting job ${jobId} for device ${deviceId}`);
  
  const totalBytes = imageSize || 4294967296;
  const chunkSize = 10485760;
  const updateInterval = 500;
  
  manager.flashStarted(jobId, deviceId, deviceName, totalBytes);
  
  let bytesTransferred = 0;
  let startTime = Date.now();
  
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      bytesTransferred += chunkSize;
      
      if (bytesTransferred >= totalBytes) {
        clearInterval(interval);
        manager.flashCompleted(jobId, deviceId);
        console.log(`[FLASH] Completed job ${jobId}`);
        resolve();
        return;
      }
      
      const progress = (bytesTransferred / totalBytes) * 100;
      const elapsed = (Date.now() - startTime) / 1000;
      const transferSpeed = bytesTransferred / elapsed;
      const remaining = totalBytes - bytesTransferred;
      const eta = remaining / transferSpeed;
      
      let stage = 'Writing system partition';
      if (progress < 5) stage = 'Initializing flash operation';
      else if (progress < 10) stage = 'Verifying device connection';
      else if (progress < 20) stage = 'Unlocking bootloader';
      else if (progress < 30) stage = 'Erasing existing partition';
      else if (progress < 90) stage = `Flashing ${partition} partition`;
      else if (progress < 95) stage = 'Verifying flash integrity';
      else stage = 'Finalizing and rebooting';
      
      manager.sendProgress(
        jobId, deviceId, progress, stage,
        bytesTransferred, totalBytes, transferSpeed, eta
      );
    }, updateInterval);
  });
}

app.post('/api/flash/start', async (req, res) => {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const { deviceId, deviceName, partition, imageSize } = req.body;
  
  console.log(`[API] Starting flash job: ${jobId}`);
  console.log(`[API] Device: ${deviceId} (${deviceName})`);
  console.log(`[API] Partition: ${partition}`);
  console.log(`[API] Image size: ${imageSize} bytes`);
  
  performFlash(jobId, deviceId, deviceName || deviceId, partition || 'system', imageSize);
  
  res.json({ 
    success: true,
    jobId, 
    status: 'started',
    deviceId,
    partition
  });
});

app.get('/api/flash/jobs', (req, res) => {
  const jobs = Array.from(manager.activeJobs.values());
  res.json({ jobs });
});

app.get('/api/flash/job/:jobId', (req, res) => {
  const job = manager.activeJobs.get(req.params.jobId);
  if (job) {
    res.json({ job });
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

app.post('/api/flash/demo', async (req, res) => {
  const devices = [
    { id: 'PIXEL6_001', name: 'Google Pixel 6', partition: 'system', size: 3221225472 },
    { id: 'SAMSUNG_S21_002', name: 'Samsung Galaxy S21', partition: 'boot', size: 2147483648 },
    { id: 'ONEPLUS_9_003', name: 'OnePlus 9 Pro', partition: 'vendor', size: 1073741824 }
  ];

  const jobs = devices.map(device => {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setTimeout(() => {
      performFlash(jobId, device.id, device.name, device.partition, device.size);
    }, Math.random() * 2000);
    
    return {
      jobId,
      deviceId: device.id,
      deviceName: device.name,
      partition: device.partition
    };
  });

  res.json({ 
    success: true,
    message: 'Demo flash operations started',
    jobs 
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    websocket: {
      port: 3001,
      connected_clients: manager.clients.size
    },
    active_jobs: manager.activeJobs.size
  });
});

const HTTP_PORT = process.env.PORT || 3000;

app.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Bobby\'s World - Flash Progress WebSocket Server         ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  HTTP API:       http://localhost:${HTTP_PORT}                     ║`);
  console.log('║  WebSocket:      ws://localhost:3001/flash-progress       ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║  Endpoints:                                               ║');
  console.log('║    POST /api/flash/start    - Start flash job            ║');
  console.log('║    POST /api/flash/demo     - Start demo jobs (3 devices)║');
  console.log('║    GET  /api/flash/jobs     - List active jobs           ║');
  console.log('║    GET  /health             - Server health check        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('[SERVER] Ready to accept connections...');
  console.log('');
});

process.on('SIGINT', () => {
  console.log('\n[SERVER] Shutting down gracefully...');
  wss.clients.forEach(client => {
    client.close();
  });
  wss.close(() => {
    console.log('[WS] WebSocket server closed');
    process.exit(0);
  });
});
