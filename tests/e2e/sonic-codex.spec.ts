/**
 * E2E Tests - Sonic Codex
 * Playwright tests for full user workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Sonic Codex', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and authenticate
    await page.goto('/');
    // TODO: Add authentication steps
  });

  test('complete wizard flow', async ({ page }) => {
    // Navigate to Sonic Codex
    await page.click('[data-testid="sonic-codex-room"]');
    
    // Step 1: Import
    await page.click('text=Upload File');
    // TODO: Upload test file
    
    // Step 2: Metadata
    await page.fill('input[placeholder*="title"]', 'Test Recording');
    await page.fill('input[placeholder*="device"]', 'iPhone 13');
    await page.click('text=Next: Enhance');
    
    // Step 3: Enhance
    await page.click('text=Speech Clear');
    await page.click('text=Next: Transcribe');
    
    // Step 4: Transcribe
    await page.waitForSelector('text=Transcribing...', { timeout: 30000 });
    await page.waitForSelector('text=Complete', { timeout: 60000 });
    
    // Step 5: Review
    await page.click('text=Review');
    await expect(page.locator('text=Test Recording')).toBeVisible();
    
    // Step 6: Export
    await page.click('text=Export');
    await page.click('text=Download Package');
    
    // Verify download started
    const downloadPromise = page.waitForEvent('download');
    await downloadPromise;
  });

  test('job library search and filter', async ({ page }) => {
    await page.click('[data-testid="sonic-codex-room"]');
    await page.click('text=Job Library');
    
    // Search
    await page.fill('input[placeholder*="Search"]', 'Test');
    await expect(page.locator('.job-item')).toContainText('Test');
    
    // Filter
    await page.selectOption('select', 'complete');
    await expect(page.locator('.job-item')).toHaveCount(1);
  });

  test('live recording workflow', async ({ page }) => {
    await page.click('[data-testid="sonic-codex-room"]');
    await page.click('text=Live Capture');
    
    // Start recording
    await page.click('text=Start Recording');
    await expect(page.locator('text=Recording...')).toBeVisible();
    
    // Wait a bit
    await page.waitForTimeout(2000);
    
    // Stop recording
    await page.click('text=Stop Recording');
    await expect(page.locator('text=Ready to record')).toBeVisible();
  });
});
