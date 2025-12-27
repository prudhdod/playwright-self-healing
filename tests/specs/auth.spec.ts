import { test, expect } from '@fixtures/fixtures';

test.describe('Authentication Flow', () => {
  test('Login with valid credentials should succeed', async ({ loginPage, dashboardPage, page }) => {
    // Login
    await loginPage.goto();
    await loginPage.login('test@example.com', 'testpassword123');

    // Verify dashboard
    const isLoggedIn = await dashboardPage.isUserLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Verify URL
   // expect(page.url()).toContain('/dashboard');
  });

  test('Login with invalid credentials should show error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.toLowerCase()).toContain('invalid');
  });

  test('Logout should redirect to login page', async ({ page, context }) => {
    // First, log in (assuming persistent session or manual login)
    // This is simplified; in real tests you'd use API for auth or session storage
    
    const dashboardPage = new (await import('@pages/dashboardPage')).DashboardPage(page);
    
    // Assume already logged in by navigating to dashboard
    //await page.goto('/dashboard');
    await page.goto('/');
    
    // Logout
    await dashboardPage.logout();

    // Verify redirect
    expect(page.url()).toContain('/login');
  });
});