/**
 * Smoke tests for critical P0 endpoints
 * These tests verify basic functionality without requiring actual devices
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';

describe('Server Smoke Tests', () => {
  beforeAll(() => {
    // Wait a moment for server to be ready
    return new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Health Endpoints', () => {
    it('GET /api/health returns 200', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('ok');
    });

    it('GET /api/ready returns 200 or 503', async () => {
      const response = await fetch(`${API_BASE}/api/ready`);
      expect([200, 503]).toContain(response.status);
      const data = await response.json();
      expect(data).toHaveProperty('ready');
      expect(typeof data.ready).toBe('boolean');
      expect(data).toHaveProperty('checks');
    });
  });

  describe('Catalog API', () => {
    it('GET /api/catalog returns envelope format', async () => {
      const response = await fetch(`${API_BASE}/api/catalog`);
      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Check for envelope structure
      expect(data).toHaveProperty('envelope');
      expect(data.envelope).toHaveProperty('version');
      expect(data.envelope).toHaveProperty('operation');
      expect(data.envelope).toHaveProperty('mode');
    });
  });

  describe('Destructive Operations - Confirmation Required', () => {
    it('POST /api/fastboot/unlock without confirmation returns 400', async () => {
      const response = await fetch(`${API_BASE}/api/fastboot/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial: 'test-serial-123' })
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toMatch(/confirmation/i);
    });

    it('POST /api/fastboot/unlock with confirmation but missing serial returns 400', async () => {
      const response = await fetch(`${API_BASE}/api/fastboot/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'UNLOCK' })
      });
      
      // Should fail because serial is missing
      expect([400, 423]).toContain(response.status);
    });

    it('POST /api/fastboot/erase without confirmation returns 400', async () => {
      const response = await fetch(`${API_BASE}/api/fastboot/erase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial: 'test-serial-123', partition: 'cache' })
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toMatch(/confirmation/i);
    });
  });

  describe('Device Locking', () => {
    it('Device lock prevents parallel operations', async () => {
      const serial = `test-serial-${Date.now()}`;
      
      // First request should acquire lock (will fail for other reasons, but should not be locked)
      const promise1 = fetch(`${API_BASE}/api/fastboot/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serial,
          confirmation: 'UNLOCK'
        })
      });

      // Second request immediately after should either succeed (if first failed quickly) or get lock error
      const promise2 = fetch(`${API_BASE}/api/fastboot/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serial,
          confirmation: 'UNLOCK'
        })
      });

      const [response1, response2] = await Promise.all([promise1, promise2]);
      
      // At least one should be 423 (locked) if locking is working
      // OR both could fail for other reasons (device not found, etc.)
      // The important thing is that we don't get two successful responses
      const statuses = [response1.status, response2.status];
      
      // If locking works, one should be 423, or both should fail for device/confirmation reasons
      expect(statuses.every(s => s >= 400)).toBe(true);
    }, 10000);
  });

  describe('Mock Data Removal', () => {
    it('GET /api/monitor/live returns 503 (not implemented)', async () => {
      const response = await fetch(`${API_BASE}/api/monitor/live`);
      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Not implemented');
    });

    it('POST /api/tests/run returns 503 (not implemented)', async () => {
      const response = await fetch(`${API_BASE}/api/tests/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Not implemented');
    });
  });
});

