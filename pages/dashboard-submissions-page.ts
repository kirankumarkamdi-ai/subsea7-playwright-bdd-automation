import { expect, Locator, Page } from '@playwright/test';

export class DashboardSubmissionsPage {
  constructor(private readonly page: Page) {}

  async expectHeaderAndNewCardAction(): Promise<void> {
    const greeting = this.page.getByRole('heading', { name: /^Welcome,\s+\S.+$/ });
    await expect(greeting, 'The dashboard should greet the signed-in user by name.').toBeVisible();
    await expect(greeting).toContainText(/^Welcome,\s+\S.+$/);

    const dateStamp = this.page.getByText(
      /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\d{1,2}(st|nd|rd|th)\s+[A-Z][a-z]{2}\s+\d{4}$/,
    );
    await expect(dateStamp, 'The dashboard should show a weekday and formatted live date.')
      .toBeVisible();
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
    await expect(newCardButton).toBeVisible();
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
    ).toBeVisible();
    await this.page.goto('/');
    await expect(
      this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }),
    ).toBeVisible();
  }

  async filterByCardTypeAndStatus(cardType: string, status: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }),
    ).toBeVisible();
    const filters = this.page.getByRole('combobox');
    await expect(filters).toHaveCount(8);

    await this.selectOption(filters.nth(5), cardType);
    await this.selectOption(filters.nth(7), status);
  }

  async searchByLocation(location: string): Promise<void> {
    const search = this.page.getByRole('textbox', { name: 'Search by location' });
    await expect(search).toBeEnabled();
    await search.fill(location);
    await this.waitForGridResponse();
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
      .toBeVisible();
    await option.click();
    await expect(filter).toContainText(optionName);
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
