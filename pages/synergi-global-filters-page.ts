import { expect, Locator, Page } from '@playwright/test';

const filterNames = ['Country', 'Shore', 'Worksite', 'Client', 'Project'] as const;
type FilterName = (typeof filterNames)[number];
type FilterSelections = Record<FilterName, string>;

const defaultOptions: Record<FilterName, string> = {
  Country: 'All Countries',
  Shore: 'All Shores',
  Worksite: 'All Worksites',
  Client: 'All Clients',
  Project: 'All Projects',
};

export class SynergiGlobalFiltersPage {
  constructor(private readonly page: Page) {}

  async selectFilters(selections: FilterSelections): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }))
      .toBeVisible();
    const filters = this.page.getByRole('combobox');
    await expect.poll(() => filters.count()).toBeGreaterThanOrEqual(filterNames.length);
    await this.expectDashboardResultsLoaded();

    for (let index = 0; index < filterNames.length; index += 1) {
      const filterName = filterNames[index];
      await this.selectOption(filters.nth(index), filterName, defaultOptions[filterName]);
      await expect(filters.nth(index)).toContainText(defaultOptions[filterName]);
      await this.expectDashboardResultsLoaded();
    }

    for (let index = 0; index < filterNames.length; index += 1) {
      const filterName = filterNames[index];
      await this.selectOption(filters.nth(index), filterName, selections[filterName]);
      await expect(filters.nth(index)).toContainText(selections[filterName]);
      await this.expectDashboardResultsLoaded();
    }
  }

  async expectSelectedFiltersAndRefreshedResults(): Promise<void> {
    const filters = this.page.getByRole('combobox');
    for (let index = 0; index < filterNames.length; index += 1) {
      const filterName = filterNames[index];
      await expect(filters.nth(index)).toContainText(
        this.selectedFilters[filterName],
      );
    }

    await this.expectDashboardResultsLoaded();
    const counters = this.page.getByRole('heading', {
      name: /^(Total Submissions|Pending Processing|Safety Actions Closed)$/,
    });
    await expect(counters).toHaveCount(3);
    for (const counter of await counters.all()) {
      await expect(counter.locator('..')).not.toContainText(/loading/i);
    }

    const recentSubmissions = this.page.getByRole('heading', {
      name: 'Recent Submissions',
      exact: true,
    });
    await expect(recentSubmissions).toBeVisible();
    const resultsArea = recentSubmissions.locator('..').locator('..');
    await expect(resultsArea).not.toContainText(/loading/i);
  }

  private selectedFilters: FilterSelections = { ...defaultOptions };

  private async selectOption(
    filter: Locator,
    filterName: FilterName,
    optionName: string,
  ): Promise<void> {
    await expect(filter).toBeEnabled();
    if ((await filter.innerText()).trim() === optionName) {
      this.selectedFilters[filterName] = optionName;
      return;
    }

    await filter.click();
    const option = this.page.getByRole('option', { name: optionName, exact: true });
    const optionCount = await option.count();
    if (optionCount === 0) {
      const availableOptions = (await this.page.getByRole('option').allInnerTexts())
        .map((text) => text.trim())
        .filter(Boolean);
      throw new Error(
        `Global-filter option "${optionName}" is unavailable for ${filterName}. Available options: ${availableOptions.join(', ')}`,
      );
    }
    await expect(option).toBeVisible();
    await option.click();
    this.selectedFilters[filterName] = optionName;
  }

  private async expectDashboardResultsLoaded(): Promise<void> {
    const counters = this.page.getByRole('heading', {
      name: /^(Total Submissions|Pending Processing|Safety Actions Closed)$/,
    });
    await expect(counters).toHaveCount(3);
    for (const counter of await counters.all()) {
      await expect(counter).toBeVisible();
      await expect.poll(
        () => counter.locator('xpath=../..').evaluate((card) =>
          Array.from(card.querySelectorAll<HTMLElement>('*'))
            .filter((element) => element.children.length === 0)
            .map((element) => element.textContent?.trim() ?? '')
            .find((text) => /^\d[\d,]*$/.test(text)) ?? '',
        ),
        { message: `Wait for the "${await counter.innerText()}" dashboard counter to load.` },
      ).toMatch(/^\d[\d,]*$/);
    }

    await expect(this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }))
      .toBeVisible();
    const noResults = this.page.getByRole('cell', { name: /No submissions match your filters/i });
    const rows = this.page.getByRole('row');
    await expect.poll(async () => (await noResults.count()) > 0 || (await rows.count()) > 1, {
      message: 'Wait for the Recent Submissions results to finish loading.',
    }).toBe(true);
  }
}
