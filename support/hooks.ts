import { Before, After, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, chromium } from '@playwright/test';
import { CustomWorld } from './world';

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshotPath = `reports/screenshots/${scenario.pickle.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
  }

  await this.context?.close();
  await this.browser?.close();
});
