import { After, Before, setDefaultTimeout, setWorldConstructor, Status } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getBaseUrl } from './environment';
import { CustomWorld } from './world';

setWorldConstructor(CustomWorld);
setDefaultTimeout(240_000);

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
  const authStatePath = resolve('playwright/.auth/user.json');
  this.context = await this.browser.newContext({
    baseURL: getBaseUrl(),
    storageState: existsSync(authStatePath) ? authStatePath : undefined,
  });
  this.context.setDefaultTimeout(10_000);
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const safeName = scenario.pickle.name
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const screenshotPath = `reports/screenshots/${safeName || 'failed-scenario'}.png`;
    await mkdir('reports/screenshots', { recursive: true });
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
  }

  await this.context?.close();
  await this.browser?.close();
});
