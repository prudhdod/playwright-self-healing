import { test, expect } from '@fixtures/fixtures';

// This test creates a fresh user and therefore must opt-out of shared storageState
test.use({ storageState: undefined });

function randomEmail() {
  const ts = Date.now();
  return `qa_${ts}@example.com`;
}

test.describe('Authentication Flow', () => {
test('Register new user and login successfully', async ({ registerPage, loginPage, page }) => {
  const user = {
    firstName: 'QA',
    lastName: 'User',
    email: randomEmail(),
    password: 'Q2@Atest123!',
    dob: '1990-01-01',
    street: '123 Test St',
    city: 'Testville',
    state: 'Teststate',
    zip: '12345',
    country: 'Australia',
    phone: '1234567890'
  };

  // Register
  await registerPage.goto();
  await registerPage.registerUser(user);

  await page.waitForLoadState('networkidle');
  // Optional: assert some success message or redirect
  await expect(page.url()).toContain('/auth/login');

  // Login with same credentials
  await loginPage.login(user.email, user.password);

  // Assert login success by checking URL or header
  await expect(page).toHaveURL(/.*\/(profile|account|home|products)/);
});
});
