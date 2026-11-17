import { Download, expect, Locator, Page } from '@playwright/test';

const globalFilters = [
  { option: 'All Countries' },
  { option: 'All Shores' },
  { option: 'All Worksites' },
  { option: 'All Projects' },
];

const statusColors = [
  { status: 'closed', color: 'green' },
  { status: 'pending-review', color: 'amber' },
  { status: 'processing', color: 'blue' },
  { status: 'failed-processing', color: 'red' },
] as const;

type BadgeColor = (typeof statusColors)[number]['color'];

export class DataSearchPage {
  private allClientsResults?: { count: string; rows: string[] };

  constructor(private readonly page: Page) {}

  async expectGlobalFilters(): Promise<void> {
    const filters = this.globalFilterControls();
    await expect.poll(() => filters.count()).toBeGreaterThanOrEqual(5);
    for (let index = 0; index < 5; index += 1) {
      await expect(filters.nth(index)).toBeEnabled();
    }
    await expect(this.page.getByRole('table')).toBeEnabled();
  }

  async setGlobalScopesAndClient(client: string): Promise<void> {
    const filters = this.globalFilterControls();
    for (let index = 0; index < 3; index += 1) {
      await this.selectOption(filters.nth(index), globalFilters[index].option);
    }

    await this.selectOption(filters.nth(4), globalFilters[3].option);
    await this.selectOption(filters.nth(3), 'All Clients');
    this.allClientsResults = await this.resultsSnapshot();
    await this.selectOption(filters.nth(3), client);
  }

  async expectResultsFilteredByClient(client: string): Promise<void> {
    await expect(this.globalFilterControls().nth(3)).toContainText(client);
    if (!this.allClientsResults) {
      throw new Error('Capture the All Clients results before checking the client filter.');
    }

    await expect.poll(async () => JSON.stringify(await this.resultsSnapshot()), {
      message: `Expected selecting "${client}" to change the Data Search results.`,
    }).not.toBe(JSON.stringify(this.allClientsResults));
    await this.expectRecordCountMatchesResults();
  }

  async searchByLocation(location: string): Promise<void> {
    const search = this.page.getByRole('textbox', { name: 'Search by location' });
    await expect(search).toBeEnabled();
    await search.fill(location);

    if (location.toLowerCase() === 'mumbai') {
      const locationCell = this.page.getByRole('cell', { name: 'Mumbai Office', exact: true }).first();
      await expect(locationCell).toBeEnabled();
      await locationCell.click();

      const detailsDialog = this.page.getByRole('dialog', {
        name: 'HSSEQ Card Details Print View',
      });
      await expect(detailsDialog).toBeEnabled();
      await this.page.getByRole('button', { name: 'Close', exact: true }).click();
    }

    await this.recordCount().waitFor({ state: 'visible' });
  }

  async configureTableFilters(): Promise<void> {
    const cardTypeFilter = this.filterContaining('All Card Types');
    await this.openAndSelectCurrentOption(cardTypeFilter);

    const statusFilter = this.filterContaining('All Statuses');
    await this.openAndSelectCurrentOption(statusFilter);

    const filters = this.page.getByRole('combobox');
    await expect.poll(() => filters.count()).toBeGreaterThanOrEqual(8);
    await this.openAndSelectCurrentOption(filters.nth(7));
  }

  async expectRecordCountMatchesResults(): Promise<void> {
    const countLocator = this.recordCount();
    await expect(countLocator).toBeEnabled();
    const countText = (await countLocator.innerText()).replace(/,/g, '');
    const match = countText.match(/(\d+)(\+)?\s*records found/i);
    if (!match) {
      throw new Error(`Could not read the Data Search record count from "${countText}".`);
    }

    const expectedCount = Number(match[1]);
    const visibleRows = Math.max(0, (await this.tableRows().count()) - 1);
    if (match[2]) {
      expect(
        visibleRows,
        'The visible results should meet the minimum indicated by the approximate record count.',
      ).toBeGreaterThanOrEqual(expectedCount);
    } else {
      expect(visibleRows, 'The displayed record count should match the table rows.').toBe(
        expectedCount,
      );
    }
  }

  async expectCardTypeAndStatusOptions(): Promise<void> {
    await this.expectOptions(this.filterContaining('All Card Types'), [
      'Intervention',
      'Observation',
    ]);
    await this.expectOptions(this.filterContaining('All Statuses'), [
      'Processing',
      'Pending Review',
      'Pending Approval',
      'Approved',
      'Rejected',
      'Ingested',
      'Open',
      'Closed',
    ]);
  }

  async expectStatusBadgeColors(): Promise<void> {
    const rows = this.tableRows();
    await expect.poll(() => rows.count()).toBeGreaterThan(1);
    for (const { status, color } of statusColors) {
      const cells = this.page.getByRole('table').getByRole('cell', { name: status, exact: true });
      const count = await cells.count();
      for (let index = 0; index < count; index += 1) {
        const colors = await cells.nth(index).evaluate((cell) => {
          const rendered: string[] = [];
          let element: Element | null = cell;
          while (element && element.tagName !== 'TR') {
            const style = getComputedStyle(element);
            rendered.push(style.color, style.backgroundColor, style.borderTopColor);
            element = element.parentElement;
          }
          return rendered;
        });
        expect(
          colors.some((value) => matchesColor(value, color)),
          `The "${status}" badge should use ${color} styling.`,
        ).toBe(true);
      }
    }
  }

  async openExportForClient(client: string): Promise<void> {
    const clientFilter = this.globalFilterControls().nth(3);
    if (!(await clientFilter.innerText()).includes(client)) {
      await this.selectOption(clientFilter, client);
    }

    await this.openExcelExport();
    const limitWarning = this.page.getByRole('heading', { name: 'Export limit exceeded!' });
    const exportDialog = this.exportDialog();
    await expect.poll(async () => (await limitWarning.isVisible()) || (await exportDialog.isVisible()))
      .toBe(true);

    if (await limitWarning.isVisible()) {
      await expect(limitWarning).toBeEnabled();
      await this.page.getByRole('button', { name: 'Close', exact: true }).first().click();
      await expect(limitWarning).toBeHidden();

      const filters = this.globalFilterControls();
      for (let index = 0; index < 3; index += 1) {
        await this.selectOption(filters.nth(index), globalFilters[index].option);
      }

      await this.openExcelExport();
    }
  }

  async expectExportModal(): Promise<void> {
    const dialog = this.exportDialog();
    await expect(dialog).toBeEnabled();
    await expect(dialog).toContainText(/\d[\d,]*\s+filtered records?/i);
    await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeEnabled();
    await expect(dialog.getByRole('button', { name: 'Generate', exact: true })).toBeEnabled();
  }

  async cancelAndGenerateExport(): Promise<void> {
    await this.exportDialog().getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(this.exportDialog()).toBeHidden();

    await this.page.getByRole('button', { name: 'To Excel', exact: true }).click();
    const dialog = this.exportDialog();
    await expect(dialog).toBeEnabled();

    const downloadPromise = this.page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Generate', exact: true }).click();
    this.download = await downloadPromise;
  }

  async expectExcelDownload(): Promise<void> {
    if (!this.download) {
      throw new Error('Generate the Data Search export before checking the download.');
    }

    expect(this.download.suggestedFilename()).toMatch(/\.xlsx$/i);
    const failure = await this.download.failure();
    expect(failure, 'The Excel export should download without errors.').toBeNull();
    await expect(this.page.getByText('Export Success', { exact: true })).toBeEnabled();
  }

  private download?: Download;

  private globalFilterControls(): Locator {
    return this.page.getByRole('combobox');
  }

  private async resultsSnapshot(): Promise<{ count: string; rows: string[] }> {
    const count = (await this.recordCount().innerText()).trim();
    const rows = (await this.tableRows().allInnerTexts()).map((row) => row.trim());
    return { count, rows };
  }

  private filterContaining(text: string | RegExp): Locator {
    return this.page.getByRole('combobox').filter({ hasText: text }).first();
  }

  private async selectOption(filter: Locator, optionName: string): Promise<void> {
    await expect(filter).toBeEnabled();
    await filter.click();
    const option = this.page.getByRole('option', { name: optionName, exact: true });
    await expect(option, `Expected option "${optionName}".`).toBeEnabled();
    await option.click();
  }

  private async openAndSelectCurrentOption(filter: Locator): Promise<void> {
    await expect(filter).toBeEnabled();
    await filter.click();
    const options = this.page.getByRole('option');
    await expect.poll(() => options.count()).toBeGreaterThan(0);
    await options.first().click();
  }

  private async expectOptions(filter: Locator, expectedOptions: string[]): Promise<void> {
    await expect(filter).toBeEnabled();
    await filter.click();
    for (const optionName of expectedOptions) {
      await expect(
        this.page.getByRole('option', { name: optionName, exact: true }),
        `Expected "${optionName}" in the filter options.`,
      ).toBeEnabled();
    }
    await this.page.keyboard.press('Escape');
  }

  private recordCount(): Locator {
    return this.page.getByText(/\d+\+?\s*records found/i);
  }

  private tableRows(): Locator {
    return this.page.getByRole('table').getByRole('row');
  }

  private exportDialog(): Locator {
    return this.page.getByRole('dialog', { name: 'Export to Excel' });
  }

  private async openExcelExport(): Promise<void> {
    await this.page.getByRole('button', { name: 'To Excel', exact: true }).click();
  }
}

function matchesColor(value: string, expected: BadgeColor): boolean {
  const channels = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!channels) {
    return false;
  }

  const [red, green, blue] = channels.slice(1).map(Number);
  switch (expected) {
    case 'green':
      return green > red && green > blue;
    case 'amber':
      return red > green && green > blue;
    case 'blue':
      return blue > red && blue > green;
    case 'red':
      return red > green * 1.3 && red > blue * 1.3;
  }
}