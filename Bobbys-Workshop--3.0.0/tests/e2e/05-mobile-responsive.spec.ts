/**
 * E2E Tests: Mobile Responsiveness
 * Tests mobile UI and responsive layouts
 */

import { test, expect } from './setup';

test.describe('Mobile Responsiveness', () => {
  test('should be responsive on mobile devices', async ({ page, mockBackend }) => {
    mockBackend.mockPhoenixKeyAuth();
    
    // Use mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    // Verify mobile navigation is accessible
    const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(
      page.locator('button[aria-label="Menu"]').or(
        page.locator('text=Menu')
      )
    ).first();
    
    // Mobile menu might be visible or hidden based on screen size
    const isVisible = await mobileMenu.isVisible().catch(() => false);
    
    if (isVisible) {
      await mobileMenu.click();
      
      // Verify navigation is accessible
      await expect(page.locator('nav').or(
        page.locator('[role="navigation"]')
      ).first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should handle touch interactions', async ({ page, mockBackend }) => {
    mockBackend.mockPhoenixKeyAuth();
    
    // Use tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    // Verify touch targets are properly sized (min 44x44px)
    const buttons = page.locator('button, a[role="button"]');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Check first button dimensions
      const firstButton = buttons.first();
      const box = await firstButton.boundingBox();
      
      if (box) {
        // Touch targets should be at least 44x44px
        expect(box.width).toBeGreaterThanOrEqual(40); // Allow some margin
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('should work on tablet viewport', async ({ page, mockBackend }) => {
    mockBackend.mockPhoenixKeyAuth();
    
    // Use tablet viewport
    await page.setViewportSize({ width: 1024, height: 768 }); // iPad landscape
    
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    // Verify layout is responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check if content is not overflowing
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    
    // Content should fit within viewport (allow small margin for scrollbars)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20);
  });
});
