import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('I open the home page', async function (this: CustomWorld) {
  await this.page.goto(process.env.BASE_URL || 'https://example.com');
});

Then('the page title should contain {string}', async function (this: CustomWorld, expectedText: string) {
  await expect(this.page).toHaveTitle(new RegExp(expectedText, 'i'));
});
