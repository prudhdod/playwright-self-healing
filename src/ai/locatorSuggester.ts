import axios from 'axios';
import dotenv from 'dotenv';
import { PROMPT_TEMPLATES } from './promptTemplates';

dotenv.config();

export class LocatorSuggester {
  private llmProvider: string = process.env.LLM_PROVIDER || 'huggingface';
  private apiKey: string = '';
  private baseURL: string = '';
  private model: string = '';

  constructor() {
    this.setupProvider();
  }

  /**
   * Setup LLM provider based on env config
   */
  private setupProvider() {
    switch (this.llmProvider) {
      case 'huggingface':
        this.apiKey = process.env.HF_API_TOKEN || '';
        this.baseURL = 'https://api-inference.huggingface.co';
        this.model = process.env.HF_MODEL || 'meta-llama/Llama-2-7b-chat-hf';
        break;
      case 'anthropic':
        this.apiKey = process.env.ANTHROPIC_API_KEY || '';
        this.baseURL = 'https://api.anthropic.com/v1';
        this.model = 'claude-3-haiku-20240307'; // Fast & cheap
        break;
      case 'ollama':
        this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.model = process.env.OLLAMA_MODEL || 'llama2';
        break;
    }
  }

   /**
   * Main method: get locator suggestions from LLM
   */
  async suggestLocators(
    elementName: string,
    domSnapshot: string,
    action: 'click' | 'fill' | 'selectOption'
  ): Promise<string[]> {
    try {
      const prompt = PROMPT_TEMPLATES.locatorSuggestion(elementName, domSnapshot, action);

      let response: string;

      if (this.llmProvider === 'huggingface') {
        response = await this.callHuggingFace(prompt);
      } else if (this.llmProvider === 'anthropic') {
        response = await this.callAnthropic(prompt);
      } else if (this.llmProvider === 'ollama') {
        response = await this.callOllama(prompt);
      } else {
        throw new Error(`Unknown LLM provider: ${this.llmProvider}`);
      }

      return this.parseLocators(response);
    } catch (error) {
      console.error(`LLM call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Call Hugging Face Inference API
   */
  private async callHuggingFace(prompt: string): Promise<string> {
    const response = await axios.post(
      `${this.baseURL}/models/${this.model}`,
      { inputs: prompt },
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: parseInt(process.env.AI_TIMEOUT || '10000'),
      }
    );

    const result = response.data?.[0]?.generated_text || '';
    return result;
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(prompt: string): Promise<string> {
    const response = await axios.post(
      `${this.baseURL}/messages`,
      {
        model: this.model,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        timeout: parseInt(process.env.AI_TIMEOUT || '10000'),
      }
    );

    return response.data?.content?.[0]?.text || '';
  }

  /**
   * Call local Ollama API
   */
  private async callOllama(prompt: string): Promise<string> {
    const response = await axios.post(
      `${this.baseURL}/api/generate`,
      {
        model: this.model,
        prompt,
        stream: false,
      },
      { timeout: parseInt(process.env.AI_TIMEOUT || '10000') }
    );

    return response.data?.response || '';
  }

  /**
   * Parse LLM response to extract CSS/XPath selectors
   */
  private parseLocators(response: string): string[] {
    const locators: string[] = [];

    // Pattern 1: Markdown code blocks
    const codeBlockMatches = response.match(/```(?:css|xpath|js)?\n(.*?)\n```/gs);
    if (codeBlockMatches) {
      codeBlockMatches.forEach(block => {
        const content = block.replace(/```(?:css|xpath|js)?\n/, '').replace(/\n```/, '').trim();
        if (content) locators.push(content);
      });
    }

    // Pattern 2: Backtick-wrapped selectors
    const backticksMatches = response.match(/`([^`]+)`/g);
    if (backticksMatches) {
      backticksMatches.forEach(match => {
        const selector = match.slice(1, -1).trim();
        // Heuristic: valid selectors contain . # [ / or start with [role
        if (selector.match(/^[\.\#\[\/@]/)) {
          locators.push(selector);
        }
      });
    }

    // Pattern 3: Lines starting with common selector symbols
    const lines = response.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('.') || trimmed.startsWith('#') || trimmed.startsWith('[') || trimmed.startsWith('//')) {
        locators.push(trimmed);
      }
    });

    // Deduplicate & return top 5
    return [...new Set(locators)].slice(0, 5);
  }
}