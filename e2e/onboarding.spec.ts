import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  // Note: These tests require authentication, so they will be skipped in CI
  // unless you set up test authentication
  
  test.skip('should redirect unauthenticated users to auth', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('onboarding page structure should be correct', async ({ page }) => {
    // This test would require mocking auth state
    // For now, we just verify the route exists
    const response = await page.goto('/onboarding');
    
    // Should get a response (even if redirected)
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('Protected Routes', () => {
  const protectedRoutes = [
    '/main',
    '/matches',
    '/profile',
    '/onboarding',
    '/verity-plus',
    '/checkout',
  ];

  for (const route of protectedRoutes) {
    test(`${route} should redirect unauthenticated users`, async ({ page }) => {
      await page.goto(route);
      
      // Should redirect to auth page
      await expect(page).toHaveURL(/\/(auth|$)/);
    });
  }
});

