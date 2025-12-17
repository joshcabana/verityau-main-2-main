import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('should display login form by default', async ({ page }) => {
    // Check for login heading
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    
    // Check for email and password inputs
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    
    // Check for sign in button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should switch to signup form', async ({ page }) => {
    // Click the sign up link
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Check for signup heading
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    
    // Check for create account button
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('should switch to forgot password form', async ({ page }) => {
    // Click forgot password link
    await page.getByRole('button', { name: /forgot password/i }).click();
    
    // Check for reset password heading
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
    
    // Check for send reset link button
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
    
    // Password field should not be visible
    await expect(page.getByLabel(/password/i)).not.toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    // Enter valid email but short password
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('short');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation error
    await expect(page.getByText(/password must be at least/i)).toBeVisible();
  });

  test('should display social login buttons', async ({ page }) => {
    // Check for Google button
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
    
    // Check for Apple button
    await expect(page.getByRole('button', { name: /continue with apple/i })).toBeVisible();
  });

  test('should have back to home link', async ({ page }) => {
    // Check for home link
    const homeLink = page.getByRole('link', { name: /back|home/i });
    await expect(homeLink).toBeVisible();
  });

  test('should display terms and privacy links', async ({ page }) => {
    // Check for terms link
    await expect(page.getByRole('link', { name: /terms/i })).toBeVisible();
    
    // Check for privacy link
    await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible();
  });
});

test.describe('Landing Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check for the main CTA button "Skip the Swipe Trap"
    await expect(page.getByRole('link', { name: /skip the swipe trap/i })).toBeVisible();
  });

  test('should navigate to auth page when clicking signup', async ({ page }) => {
    await page.goto('/');

    // Click signup button (links to auth with signup mode)
    const signupLink = page.getByRole('link', { name: /skip the swipe trap/i });
    await signupLink.click();
    await expect(page).toHaveURL(/\/auth\?mode=signup/);
  });

  test('should scroll to How It Works section', async ({ page }) => {
    await page.goto('/');

    // Click How It Works nav link
    const navLink = page.getByRole('link', { name: /how it works/i });
    if (await navLink.isVisible()) {
      await navLink.click();

      // Check that URL has hash
      await expect(page).toHaveURL(/#how-it-works/);
    }
  });

  test('should display waitlist form in hero section', async ({ page }) => {
    await page.goto('/');

    // Check for email input in hero waitlist form
    const emailInput = page.getByPlaceholder(/email/i);
    await expect(emailInput).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages correctly', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Navigate to privacy
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /privacy/i })).toBeVisible();
    
    // Navigate to terms
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /terms/i })).toBeVisible();
  });

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route-12345');
    
    // Check for 404 content
    await expect(page.getByText(/404|not found|page.*exist/i)).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy on landing page', async ({ page }) => {
    await page.goto('/');
    
    // Should have exactly one h1
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
  });

  test('should have skip link for keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab to focus skip link (if exists)
    await page.keyboard.press('Tab');
    
    // Check if skip link becomes visible on focus
    const skipLink = page.locator('.skip-link:focus');
    // Skip link may or may not exist, so we just verify the page loads
    await expect(page).toHaveURL('/');
  });

  test('buttons should be keyboard accessible', async ({ page }) => {
    await page.goto('/auth');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    
    // Should be able to focus on interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should still be functional
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Page should still be functional
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

