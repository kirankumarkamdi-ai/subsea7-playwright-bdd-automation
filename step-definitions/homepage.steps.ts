import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { CustomWorld } from '../support/world';

Given('I open the home page', async function (this: CustomWorld) {
  this.homePage = new HomePage(this.page);
  await this.homePage.open(process.env.BASE_URL || 'https://example.com');
});

Then('the page title should contain {string}', async function (this: CustomWorld, expectedText: string) {
  await expect(this.page).toHaveTitle(new RegExp(expectedText, 'i'));
});

Then('I should see the heading {string}', async function (this: CustomWorld, heading: string) {
  await expect(this.homePage.heading(heading)).toBeVisible();
});
