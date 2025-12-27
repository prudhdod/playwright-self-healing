import { Page } from '@playwright/test';

export class DOMAnalyzer {
  constructor(private page: Page) {}

  /**
   * Capture relevant DOM context around target element
   */
  async captureDOM(elementName?: string): Promise<string> {
    try {
      const domSnapshot = await this.page.evaluate(
        (targetName: string | undefined) => {
          // Find element by visible text or aria-label
          let targetElement: Element | null = null;

          if (targetName) {
            const elements = Array.from(document.querySelectorAll('button, input, a, [role="button"]'));
            targetElement = elements.find(
              el =>
                el.textContent?.toLowerCase().includes(targetName.toLowerCase()) ||
                (el as HTMLElement).innerText?.toLowerCase().includes(targetName.toLowerCase()) ||
                el.getAttribute('aria-label')?.toLowerCase().includes(targetName.toLowerCase())
            ) || null;
          }

          if (!targetElement) {
            return JSON.stringify({
              found: false,
              message: `Element "${targetName}" not found`,
              pageHTML: document.documentElement.outerHTML.substring(0, 2000),
            });
          }

          // Extract element context
          return JSON.stringify({
            found: true,
            tag: targetElement.tagName,
            classes: (targetElement as HTMLElement).className,
            id: targetElement.id,
            textContent: targetElement.textContent?.substring(0, 100),
            ariaLabel: targetElement.getAttribute('aria-label'),
            ariaRole: targetElement.getAttribute('role'),
            type: (targetElement as HTMLInputElement).type,
            placeholder: (targetElement as HTMLInputElement).placeholder,
            parentHTML: targetElement.parentElement?.outerHTML.substring(0, 500),
            siblings: Array.from(targetElement.parentElement?.children || [])
              .map(el => ({
                tag: el.tagName,
                text: el.textContent?.substring(0, 30),
              }))
              .slice(0, 3),
          });
        },
        elementName
      );

      return domSnapshot;
    } catch (error) {
      console.error(`Failed to capture DOM: ${error}`);
      return JSON.stringify({ error: 'DOM capture failed' });
    }
  }
}