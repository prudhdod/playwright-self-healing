import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  // Define locators using resilient selectors (role-based > text > css)
  //readonly emailInput = () => this.page.getByLabel('Username');
  readonly emailInput = () =>  this.page.getByRole('textbox', { name: 'Enter your username' });
  
  //readonly passwordInput = () => this.page.getByLabel('Password');
  readonly passwordInput = () =>  this.page.getByRole('textbox', { name: 'Enter your password' });

  readonly loginButton = () => this.page.getByRole('link', { name: 'Sign in' });
  readonly errorMessage = () => this.page.getByRole('alert');
  

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    //await this.page.goto('/login');
    //await this.page.waitForLoadState('networkidle');
    await this.page.goto('/', { waitUntil: 'networkidle' });
  }

  async login(email: string, password: string) {
    await this.safeFill(this.emailInput(), email, 'Username Input');
    await this.safeFill(this.passwordInput(), password, 'Password Input');
    await this.safeClick(this.loginButton(), 'Login Button');
    await this.waitForNavigation();
  }

  async getErrorMessage(): Promise<string> {
    try {
      return await this.errorMessage().textContent({ timeout: 5000 }).then(text => text || '');
    } catch {
      return '';
    }
  }
}

