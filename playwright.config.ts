import 'dotenv/config';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { getBaseUrl } from './support/environment';

const authStatePath = resolve(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './playwright-tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: getBaseUrl(),
    storageState: existsSync(authStatePath) ? authStatePath : undefined,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
