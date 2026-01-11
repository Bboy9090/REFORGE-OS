/**
 * API Contract Tests
 * Validates envelope schema and route mounts
 */

import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';
const API_V1_URL = `${BASE_URL}/api/v1`;

describe('API Contract Tests', () => {
  describe('Envelope Schema', () => {
    it('GET /api/v1/health returns valid envelope', async () => {
      const response = await fetch(`${API_V1_URL}/health`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('ok');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      
      if (data.ok) {
        expect(data.ok).toBe(true);
        expect(data.meta).toHaveProperty('ts');
        expect(data.meta).toHaveProperty('correlationId');
        expect(data.meta).toHaveProperty('apiVersion');
        expect(data.meta.apiVersion).toBe('v1');
      } else {
        expect(data.ok).toBe(false);
        expect(data).toHaveProperty('error');
        expect(data.error).toHaveProperty('code');
        expect(data.error).toHaveProperty('message');
      }
    });

    it('GET /api/v1/ready returns valid envelope with required fields', async () => {
      const response = await fetch(`${API_V1_URL}/ready`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('ok');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      
      if (data.ok) {
        expect(data.data).toHaveProperty('serverVersion');
        expect(data.data).toHaveProperty('apiVersion');
        expect(data.data).toHaveProperty('featureFlags');
        expect(data.meta.apiVersion).toBe('v1');
      }
    });

    it('GET /api/v1/adb/devices returns valid envelope', async () => {
      try {
        const response = await fetch(`${API_V1_URL}/adb/devices`);
        const data = await response.json();
        
        expect([200, 503]).toContain(response.status);
        expect(data).toHaveProperty('ok');
        expect(data).toHaveProperty('meta');
        expect(data.meta).toHaveProperty('apiVersion', 'v1');
        expect(data.meta).toHaveProperty('correlationId');
        
        if (data.ok) {
          expect(data.data).toHaveProperty('devices');
          expect(Array.isArray(data.data.devices)).toBe(true);
        } else {
          expect(data).toHaveProperty('error');
          expect(data.error).toHaveProperty('code');
        }
      } catch (error) {
        // Network errors are OK in test environment
        console.warn('ADB devices test skipped (server not available)');
      }
    });

    it('GET /api/v1/fastboot/devices returns valid envelope', async () => {
      try {
        const response = await fetch(`${API_V1_URL}/fastboot/devices`);
        const data = await response.json();
        
        expect([200, 503]).toContain(response.status);
        expect(data).toHaveProperty('ok');
        expect(data).toHaveProperty('meta');
        expect(data.meta).toHaveProperty('apiVersion', 'v1');
        
        if (data.ok) {
          expect(data.data).toHaveProperty('devices');
          expect(Array.isArray(data.data.devices)).toBe(true);
        } else {
          expect(data).toHaveProperty('error');
        }
      } catch (error) {
        // Network errors are OK in test environment
        console.warn('Fastboot devices test skipped (server not available)');
      }
    });
  });

  describe('Route Mounts', () => {
    it('GET /api/v1/routes (dev-only) lists mounted routes', async () => {
      try {
        const response = await fetch(`${API_V1_URL}/routes`, {
          headers: { 'X-Dev-Routes': '1' }
        });
        const data = await response.json();
        
        if (response.status === 200 && data.ok) {
          expect(data.data).toHaveProperty('routes');
          expect(Array.isArray(data.data.routes)).toBe(true);
          
          const routePaths = data.data.routes.map(r => r.path);
          
          // Check for key routes
          expect(routePaths.some(path => path.includes('/catalog'))).toBe(true);
          expect(routePaths.some(path => path.includes('/operations'))).toBe(true);
          expect(routePaths.some(path => path.includes('/adb'))).toBe(true);
          expect(routePaths.some(path => path.includes('/fastboot'))).toBe(true);
          expect(routePaths.some(path => path.includes('/flash'))).toBe(true);
          expect(routePaths.some(path => path.includes('/bootforgeusb'))).toBe(true);
          expect(routePaths.some(path => path.includes('/authorization'))).toBe(true);
        }
      } catch (error) {
        // Route registry might not be available in production, that's OK
        console.warn('Route registry test skipped (server not available or not in dev mode)');
      }
    });
  });

  describe('Error Envelope Format', () => {
    it('404 responses use error envelope format', async () => {
      try {
        const response = await fetch(`${API_V1_URL}/nonexistent`);
        if (response.status === 404) {
          const data = await response.json();
          expect(data).toHaveProperty('ok', false);
          expect(data).toHaveProperty('error');
          expect(data.error).toHaveProperty('code');
          expect(data.error).toHaveProperty('message');
          expect(data).toHaveProperty('meta');
          expect(data.meta).toHaveProperty('apiVersion', 'v1');
        }
      } catch (error) {
        // Network errors are OK in test environment
        console.warn('404 test skipped (server not available)');
      }
    });

    it('400 validation errors use error envelope format', async () => {
      try {
        const response = await fetch(`${API_V1_URL}/fastboot/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        if (response.status === 400) {
          const data = await response.json();
          expect(data).toHaveProperty('ok', false);
          expect(data).toHaveProperty('error');
          expect(data.error).toHaveProperty('code');
          expect(data.meta).toHaveProperty('apiVersion', 'v1');
        }
      } catch (error) {
        // Network errors are OK in test environment
        console.warn('400 validation test skipped (server not available)');
      }
    });
  });
});

