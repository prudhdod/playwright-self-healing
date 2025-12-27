import { Page } from '@playwright/test';

export class FallbackStrategies {
  constructor(private page: Page) {}

  /**
   * Try multiple fallback strategies in sequence
   */
  async tryFallbacks(
    elementName: string,
    action: 'click' | 'fill',
    fillValue?: string
  ): Promise<{ success: boolean; usedLocator?: string }> {
    const fallbacks = [
      // Strategy 1: Text-based
      () => this.page.getByText(new RegExp(elementName, 'i')),
      // Strategy 2: Label-based
      () => this.page.getByLabel(new RegExp(elementName, 'i')),
      // Strategy 3: Role-based
      () => this.page.getByRole('button', { name: new RegExp(elementName, 'i') }),
      // Strategy 4: Placeholder-based
      () => this.page.locator(`input[placeholder*="${elementName}"]`),
      // Strategy 5: XPath partial text
      () => this.page.locator(`//*[contains(text(), "${elementName}")]`),
    ];

    for (const [index, fallbackFn] of fallbacks.entries()) {
      try {
        const locator = fallbackFn();
        if (action === 'click') {
          await locator.click({ timeout: 3000 });
        } else if (action === 'fill' && fillValue) {
          await locator.fill(fillValue, { timeout: 3000 });
        }
        console.log(`✅ Fallback ${index + 1} succeeded: ${locator}`);
        return { success: true, usedLocator: locator.toString() };
      } catch {
        // Continue to next fallback
      }
    }

    return { success: false };
  }
}