import { Then, When } from '@cucumber/cucumber';
import { MyHistoryPage } from '../pages/my-history-page';
import { CustomWorld } from '../support/world';

function myHistoryPage(world: CustomWorld): MyHistoryPage {
  world.myHistoryPage ??= new MyHistoryPage(world.page);
  return world.myHistoryPage;
}

When('I open My History', async function (this: CustomWorld) {
  await myHistoryPage(this).open();
});

When('I search My History by location {string}', async function (this: CustomWorld, location: string) {
  await myHistoryPage(this).searchByLocation(location);
});

Then(
  'the My History results should match the location search and show a record count',
  async function (this: CustomWorld) {
    await myHistoryPage(this).expectLocationSearchAndCount('3rd Party Premises');
  },
);

When(
  'I filter My History by card type {string} and status {string}',
  async function (this: CustomWorld, cardType: string, status: string) {
    await myHistoryPage(this).filterByCardTypeAndStatus(cardType, status);
  },
);

Then(
  'the selected My History filters and record count should be displayed',
  async function (this: CustomWorld) {
    await myHistoryPage(this).expectSelectedFiltersAndCount('Observation', 'Pending Approval');
  },
);

When('I open a pending-approval card from My History', async function (this: CustomWorld) {
  await myHistoryPage(this).openPendingApprovalCard();
});

Then(
  'the card details should expose Print View and Delete actions',
  async function (this: CustomWorld) {
    await myHistoryPage(this).expectDetailsActions();
  },
);

When('I open and close the card print view', async function (this: CustomWorld) {
  await myHistoryPage(this).openAndClosePrintView();
});

When('I open and cancel the delete confirmation', async function (this: CustomWorld) {
  await myHistoryPage(this).openAndCancelDelete();
});

Then(
  'the card details should remain open and the card should not be deleted',
  async function (this: CustomWorld) {
    await myHistoryPage(this).expectCardNotDeleted();
  },
);

When('I close the card details', async function (this: CustomWorld) {
  await myHistoryPage(this).closeDetails();
});

Then('the My History submission list should be visible', async function (this: CustomWorld) {
  await myHistoryPage(this).expectSubmissionList();
});
