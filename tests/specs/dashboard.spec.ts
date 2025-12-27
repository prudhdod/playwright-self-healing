import { test, expect } from '@fixtures/fixtures';

test.describe('Dashboard Features', () => {
  test.beforeEach(async ({ page }) => {
    // Pre-login (ideally via API or session)
    //await page.goto('/dashboard');
    await page.goto('/');
    // Or manually:
    // await page.goto('/login');
    // Fill and submit login form
  });

  test('Display user balance on dashboard', async ({ dashboardPage }) => {
    const balance = await dashboardPage.getBalance();
    expect(balance).toBeTruthy();
    expect(balance).toMatch(/\d+\.\d{2}/); // Currency format
  });

  test('Self-healing demo: click button with broken locator', async ({ page }) => {
    // Simulate a button whose locator might break
    const logoutButton = page.getByRole('button', { name: /logout/i });
    
    // Even if the exact selector breaks, our BasePage.safeClick
    // will attempt fallback strategies and AI healing
    const dashboardPage = new (await import('@pages/dashboardPage')).DashboardPage(page);
    await dashboardPage.safeClick(logoutButton, 'Logout Button');

    // Verify we're logged out
    expect(page.url()).toContain('/login');
  });

  test('API integration: fetch user data and verify UI', async ({ page, request }) => {
    // Make API call
    const apiResponse = await request.get('/api/user/balance');
    const apiData = await apiResponse.json();

    // Verify UI matches API data
    const dashboardPage = new (await import('@pages/dashboardPage')).DashboardPage(page);
    const uiBalance = await dashboardPage.getBalance();

    expect(uiBalance).toContain(apiData.balance.toString());
  });
});