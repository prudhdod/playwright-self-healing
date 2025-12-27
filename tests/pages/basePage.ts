import { Page, Locator } from '@playwright/test';
import { HealingEngine } from '@healing/healingEngine';

export class BasePage {
  readonly page: Page;
  readonly healingEngine: HealingEngine;

  constructor(page: Page) {
    this.page = page;
    this.healingEngine = new HealingEngine(page);
  }

  /**
   * Navigate to a URL
   */
  async goto(url: string) {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  /**
   * Safe click with self-healing fallback
   */
  async safeClick(locator: Locator, name?: string) {
    try {
      await locator.click({ force: false, timeout: 5000 });
    } catch (error) {
      console.warn(`Click failed for ${name || 'element'}. Attempting self-healing...`);
      await this.healingEngine.attemptHealing(locator, 'click', name);
    }
  }

  /**
   * Safe fill with self-healing fallback
   */
  async safeFill(locator: Locator, text: string, name?: string) {
    try {
      await locator.fill(text, { timeout: 5000 });
    } catch (error) {
      console.warn(`Fill failed for ${name || 'element'}. Attempting self-healing...`);
      await this.healingEngine.attemptHealing(locator, 'fill', name, text);
    }
  }

  /**
   * Get element with resilient selectors (fallback chain)
   */
  getElementByRole(role: string, name: string | RegExp) {
    return this.page.getByRole(role, { name });
  }

  getElementByText(text: string | RegExp) {
    return this.page.getByText(text);
  }

  getElementByLabel(label: string) {
    return this.page.getByLabel(label);
  }

  /**
   * Wait for navigation and element visibility
   */
  async waitForNavigation(timeout = 10000) {
    await this.page.waitForLoadState('networkidle');
  }
}