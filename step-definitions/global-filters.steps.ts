import { DataTable, Then, When } from '@cucumber/cucumber';
import { SynergiGlobalFiltersPage } from '../pages/synergi-global-filters-page';
import { CustomWorld } from '../support/world';

function globalFiltersPage(world: CustomWorld): SynergiGlobalFiltersPage {
  world.synergiGlobalFiltersPage ??= new SynergiGlobalFiltersPage(world.page);
  return world.synergiGlobalFiltersPage;
}

When(
  'I select these Synergi global filters:',
  async function (this: CustomWorld, table: DataTable) {
    const selections = table.rowsHash() as Record<
      'Country' | 'Shore' | 'Worksite' | 'Client' | 'Project',
      string
    >;
    await globalFiltersPage(this).selectFilters(selections);
  },
);

Then(
  'the dashboard should show the selected filters and refreshed results',
  async function (this: CustomWorld) {
    await globalFiltersPage(this).expectSelectedFiltersAndRefreshedResults();
  },
);
