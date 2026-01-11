#!/usr/bin/env node
/**
 * Test setup script - starts backend server for tests
 * Used by CI and local test runs
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_DIR = join(__dirname, '..', 'server');
const SERVER_INDEX = join(SERVER_DIR, 'index.js');
const PORT = process.env.PORT || 3001;
const MAX_WAIT = 30000; // 30 seconds max wait
const CHECK_INTERVAL = 500; // Check every 500ms

let serverProcess = null;

async function checkServerReady() {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/v1/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer() {
  const startTime = Date.now();
  
  while (Date.now() - startTime < MAX_WAIT) {
    if (await checkServerReady()) {
      console.log(`✅ Backend server ready on port ${PORT}`);
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
  
  return false;
}

function startServer() {
  if (!fs.existsSync(SERVER_INDEX)) {
    console.error(`❌ Server file not found: ${SERVER_INDEX}`);
    process.exit(1);
  }

  console.log(`🚀 Starting backend server on port ${PORT}...`);
  
  serverProcess = spawn('node', [SERVER_INDEX], {
    cwd: SERVER_DIR,
    env: {
      ...process.env,
      PORT: PORT.toString(),
      NODE_ENV: 'test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (data) => {
    // Only log errors/warnings in test mode
    const output = data.toString();
    if (output.includes('error') || output.includes('Error') || output.includes('WARN')) {
      console.error(`[Server] ${output}`);
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data.toString()}`);
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Server exited with code ${code}`);
    }
  });

  // Handle cleanup on process termination
  process.on('SIGINT', () => {
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(0);
  });

  return serverProcess;
}

async function main() {
  // Check if server is already running
  if (await checkServerReady()) {
    console.log(`✅ Backend server already running on port ${PORT}`);
    process.exit(0);
  }

  // Start server
  startServer();

  // Wait for server to be ready
  const ready = await waitForServer();
  
  if (!ready) {
    console.error(`❌ Server failed to start within ${MAX_WAIT}ms`);
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(1);
  }

  // Keep process alive
  // Server will be killed by parent process (vitest) or signal handlers
}

main().catch((error) => {
  console.error('❌ Test setup failed:', error);
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(1);
});
