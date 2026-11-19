import { expect, Locator, Page } from '@playwright/test';

export class DashboardSubmissionsPage {
  constructor(private readonly page: Page) {}

  async expectAnalyticsDashboardComponents(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /^Welcome,\s+.+$/ })).toBeVisible();
    await expect(
      this.page.getByText(
        /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\d{1,2}(st|nd|rd|th)\s+[A-Z][a-z]{2}\s+\d{4}$/,
      ),
    ).toBeVisible();

    const globalFilters = this.page.getByRole('combobox');
    await expect(globalFilters).toHaveCount(8);
    for (let index = 0; index < 5; index += 1) {
      await expect(globalFilters.nth(index)).toBeEnabled();
    }

    for (const label of ['Total Submissions', 'Pending Processing', 'Safety Actions Closed']) {
      const metricLabel = this.page.getByRole('heading', { name: label, exact: true });
      await expect(metricLabel).toBeVisible();
      await expect
        .poll(
          () =>
            metricLabel.locator('xpath=../..').evaluate((card) =>
              Array.from(card.querySelectorAll<HTMLElement>('*'))
                .filter((element) => element.children.length === 0)
                .map((element) => element.textContent?.trim() ?? '')
                .find((text) => /^\d[\d,]*$/.test(text)) ?? '',
            ),
          { message: `Wait for the "${label}" dashboard summary card to load.` },
        )
        .toMatch(/^\d[\d,]*$/);
    }

    await expect(
      this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }),
    ).toBeVisible();
    await expect(this.page.getByRole('table')).toBeVisible();
  }

  async hideAllColumns(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }),
    ).toBeEnabled();
    await this.page.getByRole('button', { name: 'Columns', exact: true }).click();
    const columnOptions = this.page.getByRole('menuitemcheckbox');
    await expect(columnOptions).toHaveCount(7);
    for (const option of await columnOptions.all()) {
      if ((await option.getAttribute('aria-checked')) === 'true') {
        await option.click();
      }
    }
    await this.page.locator('html').click();
  }

  async expectNoColumnsMessage(): Promise<void> {
    await expect(
      this.page.getByRole('cell', { name: /Choose at least one column to/i }),
    ).toBeEnabled();
  }

  async expectHeaderAndNewCardAction(): Promise<void> {
    const greeting = this.page.getByRole('heading', { name: /^Welcome,\s+\S.+$/ });
    await expect(greeting, 'The dashboard should greet the signed-in user by name.').toBeEnabled();
    await expect(greeting).toContainText(/^Welcome,\s+\S.+$/);

    const dateStamp = this.page.getByText(
      /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\d{1,2}(st|nd|rd|th)\s+[A-Z][a-z]{2}\s+\d{4}$/,
    );
    await expect(dateStamp, 'The dashboard should show a weekday and formatted live date.')
      .toBeEnabled();
    const dateText = (await dateStamp.innerText()).trim();
    const dateMatch = dateText.match(
      /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(\d{1,2})(?:st|nd|rd|th)\s+([A-Z][a-z]{2})\s+(\d{4})$/,
    );
    if (!dateMatch) {
      throw new Error(`The dashboard date has an unexpected format: "${dateText}".`);
    }

    const [, weekday, day, month, year] = dateMatch;
    const parsedDate = new Date(`${month} ${day}, ${year} 12:00:00`);
    await expect(
      parsedDate.toLocaleDateString('en-US', { weekday: 'long' }),
      'The dashboard weekday should agree with its displayed calendar date.',
    ).toBe(weekday);
    await expect(parsedDate.getDate()).toBe(Number(day));

    const newCardButton = this.page.getByRole('button', {
      name: '+ New HSSEQ Card',
      exact: true,
    });
    await expect(newCardButton).toBeEnabled();
    await expect(newCardButton).toBeEnabled();

    const buttonBounds = await newCardButton.boundingBox();
    const greetingBounds = await greeting.boundingBox();
    const viewport = this.page.viewportSize();
    if (!buttonBounds || !greetingBounds || !viewport) {
      throw new Error('Could not inspect dashboard header element positions.');
    }
    expect(
      buttonBounds.x + buttonBounds.width,
      'The New HSSEQ Card button should sit near the right edge of the viewport.',
    ).toBeGreaterThanOrEqual(viewport.width - 40);
    expect(buttonBounds.y, 'The New HSSEQ Card button should remain in the header area.')
      .toBeLessThan(100);
    expect(
      buttonBounds.x,
      'The New HSSEQ Card button should not overlap the welcome greeting.',
    ).toBeGreaterThanOrEqual(greetingBounds.x + greetingBounds.width);

    await newCardButton.click();
    await expect(
      this.page.getByRole('heading', { name: 'AI-Assisted Submission', exact: true }),
    ).toBeEnabled();
    await this.page.goto('/');
    await expect(
      this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }),
    ).toBeEnabled();
  }

  async filterByCardTypeAndStatus(cardType: string, status: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }),
    ).toBeEnabled();
    const filters = this.page.getByRole('combobox');
    await expect(filters).toHaveCount(8);

    await this.selectOption(filters.nth(5), cardType);
    await this.selectOption(filters.nth(7), status);
  }

  async filterByCardTypeSourceAndStatus(
    cardType: string,
    source: string,
    status: string,
  ): Promise<void> {
    const filters = this.page.getByRole('combobox');
    await expect(filters).toHaveCount(8);
    await this.selectOption(filters.nth(5), cardType);
    await this.selectOption(filters.nth(6), source);
    await this.selectOption(filters.nth(7), status);
  }

  async expectAnalyticsRecentSubmissions(
    cardType: string,
    source: string,
    status: string,
  ): Promise<void> {
    const headers = await this.page.getByRole('table').getByRole('columnheader').allTextContents();
    expect(headers.map((header) => header.trim())).toEqual([
      'Date',
      'Submitter',
      'Location',
      'Description',
      'Card Type',
      'Source',
      'Status',
    ]);

    const filters = this.page.getByRole('combobox');
    await expect(filters.nth(5)).toContainText(cardType);
    await expect(filters.nth(6)).toContainText(source);
    await expect(filters.nth(7)).toContainText(status);
    await this.waitForGridResponse();
  }

  async hideAndRestoreRecentSubmissionColumn(columnName: string): Promise<void> {
    const columnHeader = this.page.getByRole('columnheader', { name: columnName, exact: true });
    await expect(columnHeader).toBeVisible();
    await this.setColumnVisibility(columnName, false);
    await expect(columnHeader).toHaveCount(0);
    await expect(this.page.getByRole('columnheader', { name: 'Status', exact: true })).toBeVisible();
    await this.setColumnVisibility(columnName, true);
    await expect(columnHeader).toBeVisible();
  }

  async clearRecentSubmissionSearchAndFilters(): Promise<void> {
    const search = this.page.getByRole('textbox', { name: 'Search by location' });
    await search.fill('');
    await this.waitForGridResponse();

    const filters = this.page.getByRole('combobox');
    await this.selectOption(filters.nth(5), 'All Card Types');
    await this.selectOption(filters.nth(6), 'All Sources');
    await this.selectOption(filters.nth(7), 'All Statuses');
  }

  async expectDefaultRecentSubmissionView(): Promise<void> {
    const filters = this.page.getByRole('combobox');
    await expect(filters.nth(5)).toContainText('All Card Types');
    await expect(filters.nth(6)).toContainText('All Sources');
    await expect(filters.nth(7)).toContainText('All Statuses');
    await expect(this.page.getByRole('textbox', { name: 'Search by location' })).toHaveValue('');
    const headers = await this.page.getByRole('table').getByRole('columnheader').allTextContents();
    expect(headers.map((header) => header.trim())).toEqual([
      'Date',
      'Submitter',
      'Location',
      'Description',
      'Card Type',
      'Source',
      'Status',
    ]);
    await this.waitForGridResponse();
  }

  async searchByLocation(location: string): Promise<void> {
    const search = this.page.getByRole('textbox', { name: 'Search by location' });
    await expect(search).toBeEnabled();
    await search.fill(location);
    await this.waitForGridResponse();
  }

  async deletePendingApprovalCard(cardId: string, description: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }),
    ).toBeVisible();
    await this.selectOption(this.page.getByRole('combobox').nth(7), 'Pending Approval');

    const row = this.dataRows().filter({ hasText: description });
    await expect(row, 'Expected the newly created card in Pending Approval submissions.')
      .toHaveCount(1, { timeout: 30_000 });
    await expect(row).toContainText('pending-approval');
    await row.getByText(/pending-approval/i).click();

    const details = this.page.getByRole('dialog', { name: 'HSSEQ Card Details' });
    await expect(details).toBeVisible();
    await expect(details.getByText(cardId, { exact: true }).first()).toBeVisible();
    await details.getByRole('button', { name: 'Delete', exact: true }).click();

    const confirmation = this.page.getByRole('alertdialog', {
      name: 'Are you absolutely sure?',
    });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole('button', { name: 'Delete Card', exact: true }).click();
    await expect(this.page.getByText('Card deleted', { exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await expect(row, 'The deleted card should disappear from Recent Submissions.').toHaveCount(0, {
      timeout: 30_000,
    });
  }

  async expectCardDeleted(description: string): Promise<void> {
    await expect(this.dataRows().filter({ hasText: description })).toHaveCount(0);
  }

  async expectResultsOrEmptyState(
    location: string,
    cardType: string,
    status: string,
  ): Promise<void> {
    await expect(this.page.getByRole('textbox', { name: 'Search by location' })).toHaveValue(
      location,
    );

    const emptyState = this.page.getByRole('cell', {
      name: /No submissions match your filters/i,
    });
    if (await emptyState.isVisible()) {
      await expect(emptyState).toContainText('No submissions match your filters');
      return;
    }

    const rows = this.dataRows();
    await expect.poll(() => rows.count(), {
      message: 'Expected filtered dashboard rows or the no-results message.',
    }).toBeGreaterThan(0);

    const table = this.page.getByRole('table');
    const headerRow = table.getByRole('row').first();
    const columnHeaders = headerRow.getByRole('columnheader');
    const rawHeaders =
      (await columnHeaders.count()) > 0
        ? await columnHeaders.allTextContents()
        : await headerRow.getByRole('cell').allTextContents();
    const headers = rawHeaders.map((text) => text.trim().toLowerCase());
    const locationIndex = headers.indexOf('location');
    const cardTypeIndex = headers.indexOf('card type');
    const statusIndex = headers.indexOf('status');
    if ([locationIndex, cardTypeIndex, statusIndex].some((index) => index < 0)) {
      throw new Error(`Could not find expected dashboard table columns: ${headers.join(', ')}.`);
    }

    const rowCount = await rows.count();
    for (let index = 0; index < rowCount; index += 1) {
      const cells = rows.nth(index).getByRole('cell');
      await expect(cells.nth(locationIndex)).toContainText(location);
      await expect(cells.nth(cardTypeIndex)).toHaveText(cardType);
      await expect(cells.nth(statusIndex)).toContainText(new RegExp(status, 'i'));
    }
  }

  private async selectOption(filter: Locator, optionName: string): Promise<void> {
    await expect(filter).toBeEnabled();
    if ((await filter.innerText()).trim() === optionName) {
      return;
    }

    await filter.click();
    const option = this.page.getByRole('option', { name: optionName, exact: true });
    await expect(option, `Expected "${optionName}" as a recent-submissions filter option.`)
      .toBeEnabled();
    await option.click();
    await expect(filter).toContainText(optionName);
  }

  private async setColumnVisibility(columnName: string, visible: boolean): Promise<void> {
    await this.page.getByRole('button', { name: 'Columns', exact: true }).click();
    const option = this.page.getByRole('menuitemcheckbox', { name: columnName, exact: true });
    await expect(option).toBeVisible();
    if ((await option.getAttribute('aria-checked')) !== String(visible)) {
      await option.click();
    }
    await this.page.keyboard.press('Escape');
  }

  private async waitForGridResponse(): Promise<void> {
    const emptyState = this.page.getByRole('cell', {
      name: /No submissions match your filters/i,
    });
    const rows = this.dataRows();
    await expect.poll(async () => (await emptyState.isVisible()) || (await rows.count()) > 0, {
      message: 'Wait for Recent Submissions to show matching rows or its empty state.',
    }).toBe(true);
  }

  private dataRows(): Locator {
    return this.page.getByRole('table').getByRole('row').filter({
      has: this.page.getByRole('cell'),
    }).filter({ hasNotText: /Loading\.\.\.|No submissions match your filters/i });
  }
}
