import { Page } from '@playwright/test';

export class FallbackStrategies {
  constructor(private page: Page) {}

  /**
   * Try multiple fallback strategies in sequence
   */
  async tryFallbacks(
    elementName: string,
    action: 'click' | 'fill' | 'selectOption',
    fillValue?: string
  ): Promise<{ success: boolean; usedLocator?: string }> {
    const fallbacks = [
      // Strategy 1: Text-based
      () => this.page.getByText(new RegExp(elementName, 'i')),
      // Strategy 2: Label-based
      () => this.page.getByLabel(new RegExp(elementName, 'i')),
      // Strategy 3: Role-based (buttons)
      () => this.page.getByRole('button', { name: new RegExp(elementName, 'i') }),
      // Strategy 4: Select by name or label (for dropdowns)
      () => this.page.locator(`select[name*="${elementName}"]`),
      // Strategy 5: Placeholder-based
      () => this.page.locator(`input[placeholder*="${elementName}"]`),
      // Strategy 6: XPath partial text
      () => this.page.locator(`//*[contains(text(), "${elementName}")]`),
    ];

    for (const [index, fallbackFn] of fallbacks.entries()) {
      try {
        const locator = fallbackFn();
        if (action === 'click') {
          await locator.click({ timeout: 3000 });
        } else if (action === 'fill' && fillValue) {
          await locator.fill(fillValue, { timeout: 3000 });
        } else if (action === 'selectOption' && typeof fillValue !== 'undefined') {
          // Try selectOption on select elements or locate option by text
          try {
            await locator.selectOption(fillValue, { timeout: 3000 });
          } catch {
            // As fallback, try to click option by visible text
            const optionByText = locator.locator(`option:has-text("${fillValue}")`);
            await optionByText.click({ timeout: 3000 });
          }
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