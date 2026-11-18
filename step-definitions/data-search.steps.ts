import { Then, When } from '@cucumber/cucumber';
import { DataSearchPage } from '../pages/data-search-page';
import { CustomWorld } from '../support/world';

function dataSearchPage(world: CustomWorld): DataSearchPage {
  world.dataSearchPage ??= new DataSearchPage(world.page);
  return world.dataSearchPage;
}

Then('the Data Search module should show all Synergi global filters', async function (this: CustomWorld) {
  await dataSearchPage(this).expectGlobalFilters();
});

When(
  'I set the Synergi global filters to their default scopes and client {string}',
  async function (this: CustomWorld, client: string) {
    await dataSearchPage(this).setGlobalScopesAndClient(client);
  },
);

Then(
  'selecting client {string} should filter the historical results',
  async function (this: CustomWorld, client: string) {
    await dataSearchPage(this).expectResultsFilteredByClient(client);
  },
);

When(
  'I search Data Search by location {string}',
  async function (this: CustomWorld, location: string) {
    await dataSearchPage(this).searchByLocation(location);
  },
);

When('I configure the Data Search table filters', async function (this: CustomWorld) {
  await dataSearchPage(this).configureTableFilters();
});

Then(
  'the Data Search record count should match the displayed results',
  async function (this: CustomWorld) {
    await dataSearchPage(this).expectRecordCountMatchesResults();
  },
);

Then(
  'the export modal should show the filtered record count and actions',
  async function (this: CustomWorld) {
    await dataSearchPage(this).expectExportModal();
  },
);

When(
  'I open the Excel export for client {string}',
  async function (this: CustomWorld, client: string) {
    await dataSearchPage(this).openExportForClient(client);
  },
);

When('I cancel and then generate the Excel export', async function (this: CustomWorld) {
  await dataSearchPage(this).cancelAndGenerateExport();
});

Then('an Excel file should be downloaded successfully', async function (this: CustomWorld) {
  await dataSearchPage(this).expectExcelDownload();
});

Then(
  'the Card Type and Status filters should list their available options',
  async function (this: CustomWorld) {
    await dataSearchPage(this).expectCardTypeAndStatusOptions();
  },
);

Then('visible status badges should use the expected colors', async function (this: CustomWorld) {
  await dataSearchPage(this).expectStatusBadgeColors();
});