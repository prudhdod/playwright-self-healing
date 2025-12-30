import { Page, Locator } from '@playwright/test';
import { DOMAnalyzer } from './domAnalyzer';
import { FallbackStrategies } from './fallbackStrategies';
import { LocatorSuggester } from '@ai/locatorSuggester';
import { HealingLogger } from '../logging/healingLogger';

export class HealingEngine {
  private page: Page;
  private domAnalyzer: DOMAnalyzer;
  private fallbackStrategies: FallbackStrategies;
  private locatorSuggester: LocatorSuggester;
  private healingLogger: HealingLogger;

  constructor(page: Page) {
    this.page = page;
    this.domAnalyzer = new DOMAnalyzer(page);
    this.fallbackStrategies = new FallbackStrategies(page);
    this.locatorSuggester = new LocatorSuggester();
    this.healingLogger = new HealingLogger();
  }

  /**
   * Main healing attempt workflow
   */
  async attemptHealing(
    originalLocator: Locator,
    action: 'click' | 'fill' | 'selectOption',
    elementName?: string,
    fillValue?: string
  ): Promise<boolean> {
    const startTime = Date.now();
    const healingAttempt = {
      timestamp: new Date().toISOString(),
      elementName,
      action,
      originalSelector: originalLocator?.toString() || 'unknown',
      fallbackAttempts: [] as string[],
      suggestedLocators: [] as string[],
      healed: false,
      duration: 0,
    };

    try {
      // Step 1: Attempt fallback strategies (rule-based)
      console.log(`🔧 Attempting fallback strategies for "${elementName}"...`);
      const fallbackResult = await this.fallbackStrategies.tryFallbacks(
        elementName || 'element',
        action,
        fillValue
      );

      if (fallbackResult.success) {
        healingAttempt.healed = true;
        healingAttempt.fallbackAttempts.push(fallbackResult.usedLocator || '');
        console.log(`✅ Healed using fallback: ${fallbackResult.usedLocator}`);
      } else {
        // Step 2: Use AI to suggest new locators
        console.log(`🤖 Requesting AI locator suggestions...`);
        const domSnapshot = await this.domAnalyzer.captureDOM(elementName);
        const suggestions = await this.locatorSuggester.suggestLocators(
          elementName || 'element',
          domSnapshot,
          action
        );

        healingAttempt.suggestedLocators = suggestions;

        if (suggestions.length > 0) {
          console.log(`🎯 AI suggested locators: ${suggestions.join(', ')}`);
          const used = await this.tryLocatorSuggestions(suggestions, action, fillValue);
          if (used) {
            healingAttempt.healed = true;
            healingAttempt.suggestedLocators.push(used);
            console.log(`✅ Healed using AI suggestion: ${used}`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Self-healing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Log healing attempt
    healingAttempt.duration = Date.now() - startTime;
    await this.healingLogger.logHealing(healingAttempt);

    return healingAttempt.healed;
  }

  
  /**
   * Try AI-suggested locators in sequence
   */
  private async tryLocatorSuggestions(
    suggestions: string[],
    action: 'click' | 'fill' | 'selectOption',
    fillValue?: string
  ): Promise<string | null> {
    for (const selector of suggestions) {
      try {
        const locator = this.page.locator(selector);
        if (action === 'click') {
          await locator.click({ timeout: 3000 });
        } else if (action === 'fill' && typeof fillValue !== 'undefined') {
          await locator.fill(fillValue, { timeout: 3000 });
        } else if (action === 'selectOption' && typeof fillValue !== 'undefined') {
          try {
            await locator.selectOption(fillValue, { timeout: 3000 });
          } catch {
            const optionByText = locator.locator(`option:has-text("${fillValue}")`);
            await optionByText.click({ timeout: 3000 });
          }
        }
        console.log(`✅ Successfully used suggested selector: ${selector}`);
        return selector;
      } catch {
        // Continue to next suggestion
      }
    }
    return null;
  }
}