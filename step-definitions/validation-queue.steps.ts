import { Then, When } from '@cucumber/cucumber';
import { ValidationQueuePage } from '../pages/validation-queue-page';
import { CustomWorld } from '../support/world';

Then(
  'the validation queue summary cards should show numeric counters, status colors, and icons',
  async function (this: CustomWorld) {
    await this.validationQueuePage.expectSummaryCards();
  },
);

Then('every validation queue filter should open its options', async function (this: CustomWorld) {
  await this.validationQueuePage.expectEveryFilterIsInteractive();
});

When(
  'I filter validation cards by card type {string} and source {string}',
  async function (this: CustomWorld, cardType: string, source: string) {
    await this.validationQueuePage.filterByTypeAndSource(cardType, source);
  },
);

Then(
  'every visible validation row should match card type {string} and source {string}',
  async function (this: CustomWorld, cardType: string, source: string) {
    await this.validationQueuePage.expectRowsMatchFilters(cardType, source);
  },
);

When('I open the first pending card from the validation queue', async function (this: CustomWorld) {
  await this.validationQueuePage.openFirstPendingCard();
});

Then(
  'the selected card details and verification controls should be displayed',
  async function (this: CustomWorld) {
    await this.validationQueuePage.expectSelectedCardDetails();
  },
);
