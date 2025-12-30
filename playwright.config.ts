import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',
    // If a daily auth storage state exists, reuse it for all tests by default.
    // Individual tests (like registration) can opt-out with `test.use({ storageState: undefined })`.
    storageState: (() => {
      try {
        if (process.env.DISABLE_DAILY_AUTH === '1') return undefined;
        // require fs at runtime
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs');
        const path = require('path');
        const p = path.resolve(process.cwd(), '.auth', 'daily.json');
        if (fs.existsSync(p)) return p;
      } catch (e) {
        // ignore
      }
      return undefined;
    })(),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // // Mobile testing
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],
  webServer: undefined, // Use external server
});