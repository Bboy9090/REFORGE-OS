// Test suite for Trapdoor API
// Tests admin authentication, throttling, batch workflows, and monitoring

import { describe, it, beforeAll, afterAll } from 'vitest';
import assert from 'node:assert';
import express from 'express';
import trapdoorRouter from '../core/api/trapdoor.js';

// Test server setup
let server;
let API_BASE;
const ADMIN_KEY = 'test-admin-key';

beforeAll(async () => {
  // Set test environment variables
  process.env.PANDORA_ROOM_PASSWORD = ADMIN_KEY;
  process.env.SHADOW_LOG_KEY = 'deadbeef'.repeat(8); // 32 bytes for AES-256
  
  // Create test server
  const app = express();
  app.use(express.json());
  app.use('/api/trapdoor', trapdoorRouter);
  
  // Start server on random available port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      API_BASE = `http://localhost:${port}/api/trapdoor`;
      resolve();
    });
  });
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('Trapdoor API Tests', () => {

  describe('Authentication', () => {
    it('should reject requests without password', async () => {
      const response = await fetch(`${API_BASE}/workflows`);
      assert.strictEqual(response.status, 401);
      const data = await response.json();
      assert.strictEqual(data.error, 'Unauthorized');
    });

    it('should reject requests with invalid password', async () => {
      const response = await fetch(`${API_BASE}/workflows`, {
        headers: { 'x-admin-password': 'invalid-password' }
      });
      assert.strictEqual(response.status, 403);
    });

    it('should accept requests with valid password', async () => {
      const response = await fetch(`${API_BASE}/workflows`, {
        headers: { 'x-admin-password': ADMIN_KEY }
      });
      assert.ok(response.status === 200);
    });
  });

  describe('Workflow Execution', () => {
    it('should list available workflows', async () => {
      const response = await fetch(`${API_BASE}/workflows`, {
        headers: { 'x-admin-password': ADMIN_KEY }
      });
      
      assert.strictEqual(response.status, 200);
      const data = await response.json();
      assert.ok(data.success);
      assert.ok(Array.isArray(data.workflows));
    });

    it('should validate workflow parameters', async () => {
      const response = await fetch(`${API_BASE}/workflow/execute`, {
        method: 'POST',
        headers: {
          'x-admin-password': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Missing required parameters
          category: 'android'
        })
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.ok(data.error);
    });
  });

  describe('Batch Workflows', () => {
    it('should reject empty batch', async () => {
      const response = await fetch(`${API_BASE}/batch/execute`, {
        method: 'POST',
        headers: {
          'x-admin-password': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflows: []
        })
      });

      assert.strictEqual(response.status, 400);
    });

    it('should enforce batch size limit', async () => {
      const workflows = Array(15).fill({
        category: 'android',
        workflowId: 'adb-diagnostics',
        deviceSerial: 'test-device'
      });

      const response = await fetch(`${API_BASE}/batch/execute`, {
        method: 'POST',
        headers: {
          'x-admin-password': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workflows })
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.ok(data.error.includes('limit'));
    });
  });

  describe('Monitoring', () => {
    it('should return monitoring statistics', async () => {
      const response = await fetch(`${API_BASE}/monitoring/stats`, {
        headers: { 'x-admin-password': ADMIN_KEY }
      });

      assert.strictEqual(response.status, 200);
      const data = await response.json();
      assert.ok(data.success);
      assert.ok(data.apiUsage);
      assert.ok(data.rateLimiting);
      assert.ok(data.logging);
    });
  });

  describe('Shadow Logs', () => {
    it('should retrieve shadow logs', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE}/logs/shadow?date=${today}`, {
        headers: { 'x-admin-password': ADMIN_KEY }
      });

      // May not have logs yet, but should not error
      assert.ok(response.status === 200 || response.status === 404);
    });

    it('should allow log cleanup', async () => {
      const response = await fetch(`${API_BASE}/logs/cleanup`, {
        method: 'POST',
        headers: { 'x-admin-password': ADMIN_KEY }
      });

      assert.strictEqual(response.status, 200);
      const data = await response.json();
      assert.ok(data.success);
    });
  });

  // Run throttling test last since it triggers rate limiting
  describe('Throttling', () => {
    it('should enforce rate limits', async () => {
      const requests = [];
      
      // Make 35 requests (exceeds 30/min limit)
      for (let i = 0; i < 35; i++) {
        requests.push(
          fetch(`${API_BASE}/workflows`, {
            headers: { 'x-admin-password': ADMIN_KEY }
          })
        );
      }

      const responses = await Promise.all(requests);
      const throttled = responses.filter(r => r.status === 429);
      
      assert.ok(throttled.length > 0, 'Should have throttled requests');
    });
  });
});
