import { After, Before, setWorldConstructor, Status } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { CustomWorld } from './world';

setWorldConstructor(CustomWorld);

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
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
