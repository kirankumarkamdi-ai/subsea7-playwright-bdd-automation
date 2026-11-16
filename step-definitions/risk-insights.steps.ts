import { Then, When } from '@cucumber/cucumber';
import { RiskInsightsPage } from '../pages/risk-insights-page';
import { CustomWorld } from '../support/world';

Then(
  'the risk summary cards should show the expected counts and severity colors',
  async function (this: CustomWorld) {
    this.riskInsightsPage ??= new RiskInsightsPage(this.page);
    await this.riskInsightsPage.expectSummaryCards();
  },
);

Then(
  'all {int} AI detected leading indicators should show descriptions and severity badges',
  async function (this: CustomWorld, count: number) {
    this.riskInsightsPage ??= new RiskInsightsPage(this.page);
    await this.riskInsightsPage.expectLeadingIndicators(count);
  },
);

When(
  'I open the source data for the first AI detected leading indicator',
  async function (this: CustomWorld) {
    this.riskInsightsPage ??= new RiskInsightsPage(this.page);
    await this.riskInsightsPage.openFirstIndicatorSourceData();
  },
);

Then(
  'the matching source record should be displayed',
  async function (this: CustomWorld) {
    if (!this.riskInsightsPage) {
      throw new Error('The Risk Insights page has not been initialized.');
    }
    await this.riskInsightsPage.expectMatchingSourceRecord();
  },
);
