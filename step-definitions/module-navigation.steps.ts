import { Given, Then, When } from '@cucumber/cucumber';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ModuleNavigationPage } from '../pages/module-navigation-page';
import { CustomWorld } from '../support/world';

Given('an authenticated session is open on the user dashboard', async function (this: CustomWorld) {
  const authStatePath = resolve('playwright/.auth/user.json');
  if (!existsSync(authStatePath)) {
    throw new Error(
      'No saved browser session was found. Run `npm run auth:setup`, sign in, and retry this scenario.',
    );
  }

  this.moduleNavigationPage = new ModuleNavigationPage(this.page);
  await this.moduleNavigationPage.openUserDashboard();
});

When('I click the {string} sidebar module', async function (this: CustomWorld, moduleName: string) {
  await this.moduleNavigationPage.clickModule(moduleName);
});

Then(
  'the module should open at route {string} with heading {string}',
  async function (this: CustomWorld, route: string, heading: string) {
    await this.moduleNavigationPage.expectModuleAtRoute(route, heading);
  },
);
