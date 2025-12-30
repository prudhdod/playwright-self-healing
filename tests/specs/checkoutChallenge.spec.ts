//Mock test code from another repo for xpaths and flow details only
import fs from 'fs';
import path from 'path';
import { test, expect } from '@fixtures/fixtures';

test.describe('Checkout challenge', () => {
  // If ensure-auth has been run, this file will contain email/password
  async function getDailyCredentials() {
    const credPath = path.resolve(process.cwd(), '.auth', 'daily-credentials.json');
    if (!fs.existsSync(credPath)) {
      throw new Error('Daily credentials not found. Run `npm run ensure-auth` first.');
    }
    return JSON.parse(fs.readFileSync(credPath, 'utf-8')) as { email: string; password: string };
  }

  // Login using the pre-created daily account before each test
  test.beforeEach(async ({ loginPage, page }) => {
    const creds = await getDailyCredentials();
    await loginPage.goto();
    await loginPage.login(creds.email, creds.password);
    await expect(page.locator('[data-test="page-title"]')).toBeVisible();
    // Ensure starting from site root
    await page.locator('[data-test="nav-home"]').click();
    //await page.goto('/');
  });

  test('buy now pay later', async ({ page }) => {
    // After login, navigate to the product via homepage
    //wait page.locator('[data-test="Home"]').click();
    await page.getByText('Claw Hammer with Shock Reduction Grip').click();
    
    await page.locator('[data-test="add-to-cart"]').click();
    //await expect(page.getByTestId('cart-quantity')).toHaveText('1');
    await expect(page.locator('div').filter({ hasText: 'Product added to shopping' }).nth(2)).toBeVisible();
    await expect(page.locator('[data-test="cart-quantity"]')).toContainText('1');
    await page.locator('[data-test="nav-cart"]').click();
    await page.locator('[data-test="proceed-1"]').click();
    await page.locator('[data-test="proceed-2"]').click();

    await expect(
      page.locator('.step-indicator').filter({ hasText: '2' })
    ).toHaveCSS('background-color', 'rgb(51, 153, 51)');

    // Fill address form
    //await page.getByTestId('street').fill('123 Testing Way');
    await page.locator('[data-test="street"]').fill('123 Testing Way');
    await page.locator('[data-test="city"]').fill('Sacramento');
    await page.locator('[data-test="state"]').fill('California');
    await page.locator('[data-test="country"]').fill('USA');
    await page.locator('[data-test="postal_code"]').fill('98765');

    await page.locator('[data-test="proceed-3"]').click();

    //await expect(page.getByTestId('finish')).toBeDisabled();

    // Select payment method and installments
    await page.locator('[data-test="payment-method"]').selectOption({ label: 'Buy Now Pay Later' });
     await page.locator('[data-test="monthly_installments"]').selectOption({ label: '6 Monthly Installments' });
    //await page.getByTestId('payment-method').selectOption({ label: 'Buy Now Pay Later' });
    //await page.getByTestId('monthly_installments').selectOption({ label: '6 Monthly Installments' });

    await page.locator('[data-test="finish"]').click();

    await expect(page.locator('.help-block')).toHaveText('Payment was successful');

    // Optional visual check when running headed with HEADED_MODE=true
    if (process.env.HEADED_MODE === 'true') {
      await expect(page).toHaveScreenshot('checkout.png', {
        mask: [page.getByTitle('Practice Software Testing - Toolshop')],
      });
    } else {
      console.log('Running in headless mode — screenshot comparison skipped');
    }
  });
});




// import { test, expect } from '@playwright/test';

// test('test', async ({ page }) => {
//   await page.goto('https://practicesoftwaretesting.com/');
//   await page.locator('[data-test="nav-sign-in"]').click();
//   await page.locator('[data-test="password"]').click();
//   await page.locator('[data-test="password"]').click();
//   await page.locator('[data-test="password"]').fill('Q2@Atest123!');
//   await page.locator('[data-test="email"]').click();
//   await page.locator('[data-test="email"]').fill('qa_daily_1767062488995@example.com');
//   await page.locator('[data-test="login-submit"]').click();
//   await expect(page.locator('[data-test="page-title"]')).toBeVisible();
//   await page.locator('[data-test="nav-menu"]').click();
//   await expect(page.locator('[data-test="page-title"]')).toBeVisible();
//   await expect(page.locator('[data-test="nav-menu"]')).toContainText('QA Daily');
//   await expect(page.locator('[data-test="nav-profile"]')).toBeVisible();
// });


// import { test, expect } from '@playwright/test';

// test('test', async ({ page }) => {
//   await page.goto('https://practicesoftwaretesting.com/product/01KDPCA8QKFEGHZT1J4R29E6N8');
//   await page.locator('[data-test="add-to-cart"]').click();
//   await page.locator('[data-test="nav-cart"]').click();
//   await page.locator('[data-test="proceed-1"]').click();
//   await page.locator('[data-test="email"]').click();
//   await page.locator('[data-test="password"]').click();
//   await page.locator('[data-test="login-submit"]').click();
//   await page.locator('[data-test="email"]').click();
//   await page.locator('[data-test="email"]').fill('qa@aafa.com');
//   await page.locator('[data-test="email"]').press('Tab');
//   await page.locator('[data-test="password"]').fill('sadadasdasdasdasdasd');
//   await page.locator('[data-test="login-submit"]').click();
//   await page.locator('[data-test="login-submit"]').click();
// });

// import { test, expect } from '@playwright/test';

// test('test', async ({ page }) => {
//   await page.goto('https://practicesoftwaretesting.com/product/01KDPCA8QKFEGHZT1J4R29E6N8');
//   await page.locator('[data-test="nav-categories"]').click();
//   await page.locator('[data-test="nav-power-tools"]').click();
//   await page.locator('[data-test="product-01KDPFR48CANJ8ADQHVFG2AKXZ"]').click();
//   await page.locator('[data-test="add-to-cart"]').click();
//   await page.locator('div').filter({ hasText: 'Product added to shopping' }).nth(2).click();
//   await page.getByText('Practice Black Box Testing & Bug Hunting Testing Guide 🐛 Bug Hunting').click();
//   await expect(page.locator('[data-test="nav-cart"]')).toBeVisible();
//   await expect(page.locator('[data-test="cart-quantity"]')).toContainText('1');
//   await page.locator('[data-test="add-to-cart"]').click();
//   await expect(page.locator('div').filter({ hasText: 'Product added to shopping' }).nth(2)).toBeVisible();
//   await page.getByRole('alert', { name: 'Product added to shopping' }).click();
// });