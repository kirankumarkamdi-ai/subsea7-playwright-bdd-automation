import { expect, Locator, Page } from '@playwright/test';

type SummaryColor = 'orange' | 'green' | 'red';

const summaryCards: Array<{ label: string; color: SummaryColor }> = [
  { label: 'Pending', color: 'orange' },
  { label: 'Validated Today', color: 'green' },
  { label: 'Rejected Today', color: 'red' },
];

export class ValidationQueuePage {
  private selectedCardId = '';

  constructor(private readonly page: Page) {}

  async expectSummaryCards(): Promise<void> {
    for (const { label, color } of summaryCards) {
      const labelText = this.page.getByText(label, { exact: true });
      await expect(labelText).toBeEnabled();

      const card = labelText.locator('..').locator('..');
      const counter = card.getByText(/^\d+$/);
      await expect(counter, `${label} should display a numeric counter.`).toHaveText(/^\d+$/);

      const renderedColor = await counter.evaluate((element) => getComputedStyle(element).color);
      expectColor(renderedColor, color, label);
      await expect(card.locator('svg'), `${label} summary card should display an icon.`).toHaveCount(1);
    }
  }

  async expectEveryFilterIsInteractive(): Promise<void> {
    const filters = this.page.getByRole('combobox');
    await expect.poll(() => filters.count()).toBeGreaterThan(0);

    const filterCount = await filters.count();
    for (let index = 0; index < filterCount; index += 1) {
      const filter = filters.nth(index);
      await expect(filter, `Validation queue filter ${index + 1} should be enabled.`).toBeEnabled();
      await filter.click();

      const options = this.page.getByRole('option');
      await expect.poll(() => options.count()).toBeGreaterThan(0);
      await expect(options.first()).toBeEnabled();
      await this.page.keyboard.press('Escape');
    }
  }

  async filterByTypeAndSource(cardType: string, source: string): Promise<void> {
    const filters = this.page.getByRole('combobox');
    await expect.poll(() => filters.count()).toBeGreaterThanOrEqual(7);
    const defaults = [
      'All Countries',
      'All Shores',
      'All Worksites',
      'All Clients',
      'All Projects',
      'All Card Types',
      'All Sources',
    ];
    for (let index = 0; index < defaults.length; index += 1) {
      await this.selectOption(filters.nth(index), defaults[index]);
    }

    const cardTypeFilter = filters.nth(5);
    const sourceFilter = filters.nth(6);
    await this.selectOption(cardTypeFilter, cardType);
    await this.selectOption(sourceFilter, source);
  }

  async expectRowsMatchFilters(cardType: string, source: string): Promise<void> {
    const rows = this.tableRows();
    await expect.poll(() => rows.count()).toBeGreaterThan(1);
    const rowCount = await rows.count();
    for (let index = 1; index < rowCount; index += 1) {
      const cells = rows.nth(index).getByRole('cell');
      await expect(cells.nth(4)).toHaveText(cardType);
      await expect(cells.nth(5)).toHaveText(source);
    }
  }

  async openFirstPendingCard(): Promise<void> {
    const rows = this.tableRows();
    await expect.poll(() => rows.count()).toBeGreaterThan(1);
    const firstCardRow = rows.nth(1);
    const cardId = (await firstCardRow.getByRole('cell').nth(1).innerText()).trim();
    if (!cardId) {
      throw new Error('The first validation queue row does not contain a card ID.');
    }

    this.selectedCardId = cardId;
    await firstCardRow.getByRole('button', { name: 'Review', exact: true }).click();
    await expect.poll(() => new URL(this.page.url()).pathname).toBe(`/validation/${cardId}`);
  }

  async expectSelectedCardDetails(): Promise<void> {
    if (!this.selectedCardId) {
      throw new Error('Open a validation queue card before checking its details.');
    }

    await expect(this.page.getByRole('heading').filter({ hasText: this.selectedCardId })).toBeEnabled();
    await expect(this.page.getByText('Submitted Data', { exact: true })).toBeEnabled();
    await expect(this.page.getByText('Card Data', { exact: true })).toBeEnabled();
    await expect(this.page.getByRole('button', { name: 'Next Step', exact: true })).toBeEnabled();
    await expect(this.page.getByRole('button', { name: 'Reject Card', exact: true })).toBeEnabled();
  }

  private tableRows(): Locator {
    return this.page.getByRole('table').getByRole('row');
  }

  private async selectOption(filter: Locator, optionName: string): Promise<void> {
    await expect(filter).toBeEnabled();
    if ((await filter.innerText()).trim() === optionName) {
      return;
    }

    await filter.click();
    const option = this.page.getByRole('option', { name: optionName, exact: true });
    await expect(option, `Expected "${optionName}" in the validation queue filter options.`)
      .toBeEnabled();
    await option.click();
    await expect(filter).toContainText(optionName);
  }
}

function expectColor(color: string, expected: SummaryColor, label: string): void {
  const channels = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!channels) {
    throw new Error(`Could not read the rendered color of the ${label} counter: ${color}`);
  }

  const [red, green, blue] = channels.slice(1).map(Number);
  const matches =
    expected === 'orange'
      ? red > green && green > blue
      : expected === 'green'
        ? green > red && green > blue
        : red > green && red > blue;

  expect(matches, `${label} counter should be ${expected}; rendered color was ${color}.`).toBe(true);
}
