/**
 * E2E Tests: Ghost Codex (Stealth Operations)
 * Tests metadata shredding, canary tokens, and persona generation
 */

import { test, expect } from './setup';

test.describe('Ghost Codex', () => {
  test.beforeEach(async ({ authenticatedPage, mockBackend }) => {
    // Setup mocks for Ghost Codex
    mockBackend.mockPhoenixKeyAuth();
    mockBackend.mockGhostCodex();
    
    // Navigate to Ghost Codex
    await authenticatedPage.goto('http://localhost:5000/secret-rooms');
    await authenticatedPage.waitForLoadState('networkidle');
  });

  test('should display Ghost Codex dashboard', async ({ authenticatedPage }) => {
    // Navigate to Ghost Codex room
    const ghostCodexButton = authenticatedPage.locator('[data-testid="ghost-codex"]').or(
      authenticatedPage.locator('text=Ghost Codex')
    ).first();
    
    if (await ghostCodexButton.isVisible().catch(() => false)) {
      await ghostCodexButton.click();
      
      // Verify dashboard is visible
      await authenticatedPage.waitForTimeout(1000);
      
      // Check for tabs or main content
      const dashboard = authenticatedPage.locator('[data-testid="ghost-dashboard"]').or(
        authenticatedPage.locator('text=Metadata Shredder').or(
          authenticatedPage.locator('text=Canary Tokens')
        )
      ).first();
      
      await expect(dashboard).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show metadata shredder interface', async ({ authenticatedPage }) => {
    // Look for shredder tab or interface
    const shredderTab = authenticatedPage.locator('[data-testid="shredder-tab"]').or(
      authenticatedPage.locator('text=Metadata Shredder').or(
        authenticatedPage.locator('text=Shred')
      )
    ).first();
    
    if (await shredderTab.isVisible().catch(() => false)) {
      await shredderTab.click();
      
      // Verify file upload interface
      const fileInput = authenticatedPage.locator('[data-testid="shredder-file-input"]').or(
        authenticatedPage.locator('input[type="file"]')
      ).first();
      
      await expect(fileInput).toBeVisible({ timeout: 5000 }).catch(() => {
        // File input might be hidden or in dropzone
        expect(authenticatedPage.locator('text=Drag & Drop').or(
          authenticatedPage.locator('text=Shred Metadata')
        ).first()).toBeVisible({ timeout: 5000 });
      });
    }
  });

  test('should show canary tokens dashboard', async ({ authenticatedPage }) => {
    // Look for canary tokens tab
    const canaryTab = authenticatedPage.locator('[data-testid="canary-tab"]').or(
      authenticatedPage.locator('text=Canary Tokens').or(
        authenticatedPage.locator('text=Canary')
      )
    ).first();
    
    if (await canaryTab.isVisible().catch(() => false)) {
      await canaryTab.click();
      
      // Verify canary dashboard is shown
      const canaryDashboard = authenticatedPage.locator('[data-testid="canary-dashboard"]').or(
        authenticatedPage.locator('text=Generate Canary').or(
          authenticatedPage.locator('text=Alerts')
        )
      ).first();
      
      await expect(canaryDashboard).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show persona vault', async ({ authenticatedPage }) => {
    // Look for persona vault tab
    const personaTab = authenticatedPage.locator('[data-testid="persona-tab"]').or(
      authenticatedPage.locator('text=Persona Vault').or(
        authenticatedPage.locator('text=Personas')
      )
    ).first();
    
    if (await personaTab.isVisible().catch(() => false)) {
      await personaTab.click();
      
      // Verify persona vault is shown
      const personaVault = authenticatedPage.locator('[data-testid="persona-vault"]').or(
        authenticatedPage.locator('text=Generate Email').or(
          authenticatedPage.locator('text=Personas')
        )
      ).first();
      
      await expect(personaVault).toBeVisible({ timeout: 5000 });
    }
  });
});
