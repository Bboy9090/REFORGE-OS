/**
 * E2E Test Setup
 * Global setup and configuration for end-to-end tests
 */

import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Test timeout (30 seconds per test)
const TEST_TIMEOUT = 30000;

// Extended test context with custom fixtures
export const test = base.extend<{
  authenticatedPage: Page;
  mockBackend: MockBackend;
}>({
  // Authenticated page fixture
  authenticatedPage: async ({ page, mockBackend }, use) => {
    // Mock Phoenix Key authentication
    await page.goto('http://localhost:5000');
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="app"]', { timeout: 10000 }).catch(() => {
      // App might not have data-testid, try alternative selectors
      return page.waitForSelector('body', { timeout: 10000 });
    });

    // Mock authentication token
    await page.evaluate(() => {
      localStorage.setItem('phoenix-key-auth', JSON.stringify({
        token: 'mock-test-token',
        isAuthenticated: true,
        lastActivity: Date.now(),
      }));
    });

    // Navigate to secret rooms
    await page.click('[data-testid="secret-rooms-tab"]').catch(() => {
      // Fallback: try alternative navigation
      return page.click('text=Secret Rooms').catch(() => {
        // If that fails, just continue
      });
    });

    await use(page);
  },

  // Mock backend fixture
  mockBackend: async ({ page }, use) => {
    const mockBackend = new MockBackend(page);
    await mockBackend.setup();
    await use(mockBackend);
    await mockBackend.teardown();
  },
});

/**
 * Mock Backend Helper
 * Intercepts API calls and returns mock responses
 */
export class MockBackend {
  private page: Page;
  private routes: Map<string, any> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  async setup() {
    // Setup route interceptors
    await this.page.route('**/api/v1/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      // Check if we have a mock response for this route
      const routeKey = `${method} ${url}`;
      if (this.routes.has(routeKey)) {
        const mockResponse = this.routes.get(routeKey);
        await route.fulfill(mockResponse);
        return;
      }

      // Default: continue with actual request (will fail if backend not running)
      await route.continue();
    });
  }

  async teardown() {
    this.routes.clear();
  }

  /**
   * Mock an API endpoint
   */
  mockRoute(method: string, path: string, response: any, status: number = 200) {
    const routeKey = `${method} ${path}`;
    this.routes.set(routeKey, {
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  }

  /**
   * Mock Phoenix Key authentication
   */
  mockPhoenixKeyAuth(token: string = 'mock-test-token') {
    this.mockRoute('POST', '**/api/v1/trapdoor/phoenix/unlock', {
      token,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });

    this.mockRoute('POST', '**/api/v1/trapdoor/phoenix/validate', {
      valid: true,
      token,
    });
  }

  /**
   * Mock Sonic Codex endpoints
   */
  mockSonicCodex() {
    this.mockRoute('GET', '**/api/v1/trapdoor/sonic/jobs', {
      jobs: [
        {
          job_id: 'test-job-1',
          metadata: {
            title: 'Test Audio',
            device: 'Test Device',
            timestamp: new Date().toISOString(),
          },
          pipeline: {
            stage: 'completed',
            progress: 100,
          },
        },
      ],
    });

    this.mockRoute('POST', '**/api/v1/trapdoor/sonic/upload', {
      job_id: 'test-job-1',
      status: 'uploaded',
    });

    this.mockRoute('GET', '**/api/v1/trapdoor/sonic/jobs/test-job-1', {
      job_id: 'test-job-1',
      metadata: {
        title: 'Test Audio',
        device: 'Test Device',
        timestamp: new Date().toISOString(),
      },
      pipeline: {
        stage: 'completed',
        progress: 100,
      },
      outputs: {
        transcript_original: {
          segments: [
            {
              start: 0,
              end: 5,
              text: 'Test transcript segment',
              speaker: 'Speaker 1',
            },
          ],
        },
      },
    });
  }

  /**
   * Mock Ghost Codex endpoints
   */
  mockGhostCodex() {
    this.mockRoute('POST', '**/api/v1/trapdoor/ghost/shred', {
      success: true,
      files_shredded: ['test-file.jpg'],
    });

    this.mockRoute('POST', '**/api/v1/trapdoor/ghost/canary/generate', {
      token: 'test-canary-token',
      url: 'http://example.com/test-canary',
    });

    this.mockRoute('GET', '**/api/v1/trapdoor/ghost/canary/alerts', {
      alerts: [],
    });

    this.mockRoute('POST', '**/api/v1/trapdoor/ghost/persona/generate', {
      persona: {
        email: 'test@example.com',
        phone: '+1234567890',
        name: 'Test Persona',
      },
    });

    this.mockRoute('GET', '**/api/v1/trapdoor/ghost/persona/list', {
      personas: [],
    });
  }

  /**
   * Mock Pandora Codex endpoints
   */
  mockPandoraCodex() {
    this.mockRoute('GET', '**/api/v1/trapdoor/pandora/hardware/status', {
      devices: [],
      connected: false,
    });

    this.mockRoute('POST', '**/api/v1/trapdoor/pandora/dfu/enter', {
      success: true,
      message: 'DFU mode entered',
    });

    this.mockRoute('POST', '**/api/v1/trapdoor/pandora/jailbreak/execute', {
      success: true,
      message: 'Jailbreak initiated',
    });
  }
}

// Global test configuration
test.setTimeout(TEST_TIMEOUT);

// Test expectations
export { expect };
