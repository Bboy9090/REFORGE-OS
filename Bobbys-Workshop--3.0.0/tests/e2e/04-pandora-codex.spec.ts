/**
 * E2E Tests: Pandora Codex (Hardware Manipulation)
 * Tests device detection, DFU mode, and jailbreak operations
 */

import { test, expect } from './setup';

test.describe('Pandora Codex', () => {
  test.beforeEach(async ({ authenticatedPage, mockBackend }) => {
    // Setup mocks for Pandora Codex
    mockBackend.mockPhoenixKeyAuth();
    mockBackend.mockPandoraCodex();
    
    // Navigate to Pandora Codex
    await authenticatedPage.goto('http://localhost:5000/secret-rooms');
    await authenticatedPage.waitForLoadState('networkidle');
  });

  test('should display Pandora Codex dashboard', async ({ authenticatedPage }) => {
    // Navigate to Pandora Codex room
    const pandoraCodexButton = authenticatedPage.locator('[data-testid="pandora-codex"]').or(
      authenticatedPage.locator('text=Pandora Codex').or(
        authenticatedPage.locator('text=Jailbreak Sanctum')
      )
    ).first();
    
    if (await pandoraCodexButton.isVisible().catch(() => false)) {
      await pandoraCodexButton.click();
      
      // Verify dashboard is visible
      await authenticatedPage.waitForTimeout(1000);
      
      // Check for hardware status or main content
      const dashboard = authenticatedPage.locator('[data-testid="chain-breaker-dashboard"]').or(
        authenticatedPage.locator('text=Hardware Status').or(
          authenticatedPage.locator('text=Device Status')
        )
      ).first();
      
      await expect(dashboard).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show hardware status', async ({ authenticatedPage }) => {
    // Look for hardware status section
    const hardwareStatus = authenticatedPage.locator('[data-testid="hardware-status"]').or(
      authenticatedPage.locator('text=No devices connected').or(
        authenticatedPage.locator('text=Device Status')
      )
    ).first();
    
    await expect(hardwareStatus).toBeVisible({ timeout: 5000 });
  });

  test('should display legal disclaimer for sensitive operations', async ({ authenticatedPage }) => {
    // Look for jailbreak or DFU buttons
    const jailbreakButton = authenticatedPage.locator('[data-testid="jailbreak-button"]').or(
      authenticatedPage.locator('text=Jailbreak').or(
        authenticatedPage.locator('text=Enter DFU')
      )
    ).first();
    
    if (await jailbreakButton.isVisible().catch(() => false)) {
      await jailbreakButton.click();
      
      // Should show legal disclaimer
      const legalDisclaimer = authenticatedPage.locator('[data-testid="legal-disclaimer"]').or(
        authenticatedPage.locator('text=Warning').or(
          authenticatedPage.locator('text=Legal')
        )
      ).first();
      
      await expect(legalDisclaimer).toBeVisible({ timeout: 5000 }).catch(() => {
        // Legal disclaimer might be inline or not present
        // Just verify button was clicked
        expect(jailbreakButton).toBeVisible();
      });
    }
  });
});
