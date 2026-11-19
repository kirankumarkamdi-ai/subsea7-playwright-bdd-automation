import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { DashboardSubmissionsPage } from '../pages/dashboard-submissions-page';
import { ModuleNavigationPage } from '../pages/module-navigation-page';
import { SynergiGlobalFiltersPage } from '../pages/synergi-global-filters-page';
import { CustomWorld } from '../support/world';

Given(
  'an authenticated Analytics user session is open on the dashboard',
  async function (this: CustomWorld) {
    const authStatePath = resolve(__dirname, '../playwright/.auth/user.json');
    if (!existsSync(authStatePath)) {
      throw new Error(
        'No saved browser session was found. Run `npm run auth:setup` and sign in as an Analytics user.',
      );
    }

    this.moduleNavigationPage ??= new ModuleNavigationPage(this.page);
    await this.moduleNavigationPage.openUserDashboard();
    await this.moduleNavigationPage.expectAnalyticsModulesAvailable();
  },
);

Then(
  'the Analytics dashboard components should be visible',
  async function (this: CustomWorld) {
    this.dashboardSubmissionsPage ??= new DashboardSubmissionsPage(this.page);
    await this.dashboardSubmissionsPage.expectAnalyticsDashboardComponents();
  },
);

When(
  'I filter Recent Submissions by card type {string}, source {string}, and status {string}',
  async function (this: CustomWorld, cardType: string, source: string, status: string) {
    this.dashboardSubmissionsPage ??= new DashboardSubmissionsPage(this.page);
    await this.dashboardSubmissionsPage.filterByCardTypeSourceAndStatus(cardType, source, status);
  },
);

Then(
  'Recent Submissions should show its expected columns and active filters',
  async function (this: CustomWorld) {
    this.dashboardSubmissionsPage ??= new DashboardSubmissionsPage(this.page);
    await this.dashboardSubmissionsPage.expectAnalyticsRecentSubmissions(
      'Observation',
      'Online',
      'Pending Approval',
    );
  },
);

When(
  'I hide and restore the {string} Recent Submissions column',
  async function (this: CustomWorld, columnName: string) {
    this.dashboardSubmissionsPage ??= new DashboardSubmissionsPage(this.page);
    await this.dashboardSubmissionsPage.hideAndRestoreRecentSubmissionColumn(columnName);
  },
);

When('I clear Recent Submissions search and filters', async function (this: CustomWorld) {
  this.dashboardSubmissionsPage ??= new DashboardSubmissionsPage(this.page);
  await this.dashboardSubmissionsPage.clearRecentSubmissionSearchAndFilters();
});

When('I reset global dashboard filters and refresh', async function (this: CustomWorld) {
  this.synergiGlobalFiltersPage ??= new SynergiGlobalFiltersPage(this.page);
  await this.synergiGlobalFiltersPage.resetFiltersAndRefresh();
});

Then('Recent Submissions should show the default dashboard view', async function (this: CustomWorld) {
  this.dashboardSubmissionsPage ??= new DashboardSubmissionsPage(this.page);
  await this.dashboardSubmissionsPage.expectDefaultRecentSubmissionView();
  await expect(this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }))
    .toBeVisible();
});
