import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export type HealingAttempt = {
  timestamp: string;
  elementName?: string;
  action: 'click' | 'fill' | 'selectOption';
  originalSelector: string;
  fallbackAttempts: string[];
  suggestedLocators: string[];
  healed: boolean;
  duration: number;
};

export class HealingLogger {
  private logFilePath: string;

  constructor() {
    const dir = process.env.HEALING_LOG_DIR || 'src/logging';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.logFilePath = path.join(dir, 'healingReport.json');
    if (!fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '[]', 'utf-8');
    }
  }

  async logHealing(attempt: HealingAttempt): Promise<void> {
    try {
      const raw = fs.readFileSync(this.logFilePath, 'utf-8');
      const data: HealingAttempt[] = raw ? JSON.parse(raw) : [];
      data.push(attempt);
      fs.writeFileSync(this.logFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write healing log', err);
    }
  }
}
