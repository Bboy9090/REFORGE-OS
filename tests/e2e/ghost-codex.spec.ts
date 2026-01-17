/**
 * E2E Tests - Ghost Codex
 */

import { test, expect } from '@playwright/test';

test.describe('Ghost Codex', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // TODO: Add authentication
  });

  test('metadata shredder workflow', async ({ page }) => {
    await page.click('[data-testid="ghost-codex-room"]');
    
    // Upload file to shred
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/test-image.jpg');
    await page.click('text=Shred Metadata');
    
    // Wait for download
    const downloadPromise = page.waitForEvent('download');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('ghost_');
  });

  test('canary token generation', async ({ page }) => {
    await page.click('[data-testid="ghost-codex-room"]');
    await page.click('text=Canary Tokens');
    
    // Generate token
    await page.click('text=Generate New Token');
    await page.fill('input[name="filename"]', 'Passwords.html');
    await page.click('text=Generate');
    
    await expect(page.locator('text=Token created')).toBeVisible();
  });

  test('persona generation', async ({ page }) => {
    await page.click('[data-testid="ghost-codex-room"]');
    await page.click('text=Persona Vault');
    
    // Generate email
    await page.click('text=Generate Email');
    await expect(page.locator('.persona-item')).toContainText('@');
    
    // Generate phone
    await page.click('text=Generate Number');
    await expect(page.locator('.persona-item')).toContainText('+');
  });
});
