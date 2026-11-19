import { Then } from '@cucumber/cucumber';
import { OperationalDashboardPage } from '../pages/operational-dashboard-page';
import { CustomWorld } from '../support/world';

Then(
  'the seven-day submission volume chart should show both ingestion channels',
  async function (this: CustomWorld) {
    this.operationalDashboardPage ??= new OperationalDashboardPage(this.page);
    await this.operationalDashboardPage.expectSevenDaySubmissionVolumeChart();
  },
);
