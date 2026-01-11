#!/usr/bin/env node
/**
 * Smoke-test WebSocket endpoints using the Node `ws` client.
 *
 * Usage:
 *   node scripts/ws-smoke-node.cjs
 *   node scripts/ws-smoke-node.cjs ws://127.0.0.1:3001
 */

const WebSocket = require('ws');

const base = process.argv[2] || 'ws://127.0.0.1:3001';

function join(baseUrl, path) {
  const trimmed = baseUrl.replace(/\/+$/g, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${trimmed}${p}`;
}

function connectOnce(url, { ping = false } = {}) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);

    const timeout = setTimeout(() => {
      try {
        ws.terminate();
      } catch {
        // ignore
      }
      reject(new Error(`timeout connecting/receiving: ${url}`));
    }, 5000);

    ws.on('open', () => {
      process.stdout.write(`[open] ${url}\n`);
      if (ping) {
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      } else {
        ws.close();
      }
    });

    ws.on('message', (data) => {
      const text = Buffer.isBuffer(data) ? data.toString('utf8') : String(data);
      process.stdout.write(`[message] ${url} ${text}\n`);
      ws.close();
    });

    ws.on('close', (code, reason) => {
      clearTimeout(timeout);
      const r = reason ? reason.toString() : '';
      process.stdout.write(`[close] ${url} code=${code} reason=${r}\n`);
      resolve();
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

(async () => {
  const flash = join(base, '/ws/flash-progress');
  const device = join(base, '/ws/device-events');

  try {
    await connectOnce(flash, { ping: true });
    await connectOnce(device);
    process.stdout.write('[SUCCESS] ws endpoints reachable\n');
    process.exit(0);
  } catch (err) {
    process.stderr.write(`[FAIL] ${(err && err.message) ? err.message : String(err)}\n`);
    process.exit(1);
  }
})();
