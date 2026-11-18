import { Then, When } from '@cucumber/cucumber';
import { DashboardSubmissionsPage } from '../pages/dashboard-submissions-page';
import { CustomWorld } from '../support/world';

function dashboardSubmissionsPage(world: CustomWorld): DashboardSubmissionsPage {
  world.dashboardSubmissionsPage ??= new DashboardSubmissionsPage(world.page);
  return world.dashboardSubmissionsPage;
}

Then(
  'the dashboard greeting, live date, and new-card action should be correct',
  async function (this: CustomWorld) {
    await dashboardSubmissionsPage(this).expectHeaderAndNewCardAction();
  },
);

When(
  'I filter recent submissions by card type {string} and status {string}',
  async function (this: CustomWorld, cardType: string, status: string) {
    await dashboardSubmissionsPage(this).filterByCardTypeAndStatus(cardType, status);
  },
);

When(
  'I search recent submissions by location {string}',
  async function (this: CustomWorld, location: string) {
    await dashboardSubmissionsPage(this).searchByLocation(location);
  },
);

When(
  'I hide all Recent Submissions columns',
  async function (this: CustomWorld) {
    await dashboardSubmissionsPage(this).hideAllColumns();
  },
);

Then(
  'the table should ask me to choose at least one column',
  async function (this: CustomWorld) {
    await dashboardSubmissionsPage(this).expectNoColumnsMessage();
  },
);

Then(
  'the recent submissions grid should show matching results or a clean empty state',
  async function (this: CustomWorld) {
    await dashboardSubmissionsPage(this).expectResultsOrEmptyState(
      '3rd Party Premises',
      'Intervention',
      'Processing',
    );
  },
);
