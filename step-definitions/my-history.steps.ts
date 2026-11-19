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
  'the card details should expose the Delete action without Print View',
  async function (this: CustomWorld) {
    await myHistoryPage(this).expectDeleteActionWithoutPrintView();
  },
);

When('I confirm deleting the card from My History', async function (this: CustomWorld) {
  await myHistoryPage(this).confirmDeletePendingApprovalCard();
});

Then('the card should be deleted successfully', async function (this: CustomWorld) {
  await myHistoryPage(this).expectSubmissionList();
});

When('I close the card details', async function (this: CustomWorld) {
  await myHistoryPage(this).closeDetails();
});

Then('the My History submission list should be visible', async function (this: CustomWorld) {
  await myHistoryPage(this).expectSubmissionList();
});
