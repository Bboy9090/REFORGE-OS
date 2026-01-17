/**
 * E2E Tests - Pandora Codex Chain-Breaker
 */

import { test, expect } from '@playwright/test';

test.describe('Pandora Codex', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // TODO: Add authentication
  });

  test('hardware detection display', async ({ page }) => {
    await page.click('[data-testid="jailbreak-sanctum-room"]');
    
    // Check hardware status is displayed
    await expect(page.locator('text=Device Pulse')).toBeVisible();
    await expect(page.locator('.hardware-status')).toBeVisible();
  });

  test('exploit selector', async ({ page }) => {
    await page.click('[data-testid="jailbreak-sanctum-room"]');
    
    // Select exploit
    await page.click('text=Checkm8');
    await expect(page.locator('button:has-text("Execute Exploit")')).toBeEnabled();
  });

  test('console log updates', async ({ page }) => {
    await page.click('[data-testid="jailbreak-sanctum-room"]');
    
    // Wait for console messages
    await expect(page.locator('.console-log')).toBeVisible();
    // Should have at least one log entry
    await expect(page.locator('.console-log p')).toHaveCount({ min: 1 });
  });
});
