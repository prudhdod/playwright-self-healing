import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/auth/login', { waitUntil: 'networkidle' });
  }

  //get email()    { return this.page.getByLabel(/email address/i); }
  get email()    { return this.page.locator('input[placeholder*="Email"]'); }
  get password() { return this.page.locator('[data-test="password"]'); }
  get loginBtn() { return this.page.locator('[data-test="login-submit"]'); }
  get errorBox() { return this.page.getByText(/invalid|failed|incorrect/i); }

  async login(email: string, password: string) {
    await this.safeFill(this.email, email, 'Email');
    await this.safeFill(this.password, password, 'Password');
    await this.safeClick(this.loginBtn, 'Login button');
    await this.waitForNavigation();
  }
}
