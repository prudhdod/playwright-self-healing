export const PROMPT_TEMPLATES = {
  /**
   * Prompt for generating locator suggestions
   */
  locatorSuggestion: (elementName: string, domSnapshot: string, action: 'click' | 'fill'): string => `
You are a Playwright test automation expert. Your task is to suggest CSS selectors and XPath expressions for locating a web element.

**Target Element:** "${elementName}"
**Action:** ${action === 'click' ? 'Click the element' : 'Fill the element with text'}

**Current DOM Context:**
\`\`\`html
${domSnapshot}
\`\`\`

Based on the DOM context provided, suggest 3-5 robust locators (CSS selectors and XPath) that would reliably locate the "${elementName}" element.

**Requirements:**
1. Use Playwright-compatible selectors
2. Prefer role-based and text-based selectors
3. Avoid brittle ID-based selectors if possible
4. Suggest XPath as fallback if CSS is not reliable
5. Include alternative selectors that handle UI variations

**Response Format:**
For each selector, provide it on a new line:
- CSS Selector 1: \`selector1\`
- XPath 1: \`selector2\`
- etc.

**Example Format:**
- button[type="submit"]
- //button[contains(text(), "Login")]
- [role="button"][aria-label="Submit"]
`,
};