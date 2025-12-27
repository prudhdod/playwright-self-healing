import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class DashboardPage extends BasePage {
  readonly userGreeting = () => this.page.getByRole('heading', { name: /Welcome/ });
  readonly logoutButton = () => this.page.getByRole('button', { name: 'Logout' });
  readonly balanceCard = () => this.page.getByRole('region', { name: /Balance/ });

  constructor(page: Page) {
    super(page);
  }

  async isUserLoggedIn(): Promise<boolean> {
    try {
      await this.userGreeting().waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async logout() {
    await this.safeClick(this.logoutButton(), 'Logout Button');
    await this.page.waitForURL('**/login');
  }

  async getBalance(): Promise<string | null> {
    try {
      return await this.balanceCard().textContent({ timeout: 5000 });
    } catch {
      return null;
    }
  }
}