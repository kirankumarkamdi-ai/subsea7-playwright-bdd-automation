import { expect, Locator, Page } from '@playwright/test';

export class MyHistoryPage {
  private readonly table: Locator;

  constructor(private readonly page: Page) {
    this.table = page.getByRole('table');
  }

  async open(): Promise<void> {
    await this.page.goto('/history');
    await expect(this.page.getByRole('heading', { name: 'My History', exact: true })).toBeEnabled();
    await expect(this.page.getByText('Submission History', { exact: true })).toBeEnabled();
    await this.waitForRecordCount();
  }

  async searchByLocation(location: string): Promise<void> {
    const search = this.page.getByRole('textbox', { name: 'Search by location...' });
    await expect(search).toBeEnabled();
    await search.fill(location);
    await this.waitForRecordCount();

    const matchingRows = this.dataRows().filter({ hasText: location });
    await expect
      .poll(() => matchingRows.count(), {
        message: `Expected My History results to contain the searched location "${location}".`,
      })
      .toBeGreaterThan(0);
  }

  async expectLocationSearchAndCount(location: string): Promise<void> {
    await expect(this.page.getByRole('textbox', { name: 'Search by location...' })).toHaveValue(
      location,
    );
    await this.expectNumericRecordCount();

    const rows = this.dataRows();
    const rowCount = await rows.count();
    for (let index = 0; index < rowCount; index += 1) {
      await expect(rows.nth(index)).toContainText(location);
    }
  }

  async filterByCardTypeAndStatus(cardType: string, status: string): Promise<void> {
    await this.selectFilter(0, cardType);
    await this.selectFilter(1, status);
    await this.waitForRecordCount();
  }

  async expectSelectedFiltersAndCount(cardType: string, status: string): Promise<void> {
    await expect(this.filterAt(0)).toHaveText(cardType);
    await expect(this.filterAt(1)).toHaveText(status);
    await this.expectNumericRecordCount();
  }

  async openPendingApprovalCard(): Promise<void> {
    const row = this.dataRows().filter({ hasText: /pending-approval|pending approval/i }).first();
    await expect(
      row,
      'Expected at least one pending-approval card in My History.',
    ).toBeEnabled();
    await row.getByText(/pending-approval|pending approval/i).first().click();
    await expect(this.detailsDialog()).toBeEnabled();
  }

  async expectDetailsActions(): Promise<void> {
    const details = this.detailsDialog();
    await expect(details.getByRole('button', { name: 'Print View', exact: true })).toBeEnabled();
    await expect(details.getByRole('button', { name: 'Delete', exact: true })).toBeEnabled();
    await expect(details.getByRole('button', { name: 'Close', exact: true })).toBeEnabled();
  }

  async openAndClosePrintView(): Promise<void> {
    const popupPromise = this.page.waitForEvent('popup');
    await this.detailsDialog().getByRole('button', { name: 'Print View', exact: true }).click();
    const printPage = await popupPromise;
    await printPage.waitForLoadState('domcontentloaded');
    await expect(printPage.locator('body')).not.toBeEmpty();
    await printPage.close();
    await expect(this.detailsDialog()).toBeEnabled();
  }

  async openAndCancelDelete(): Promise<void> {
    const details = this.detailsDialog();
    await details.getByRole('button', { name: 'Delete', exact: true }).click();
    const confirmationHeading = this.page.getByRole('heading', {
      name: 'Are you absolutely sure?',
      exact: true,
    });
    await expect(confirmationHeading).toBeEnabled();
    await expect(this.page.getByRole('button', { name: 'Delete Card', exact: true })).toBeEnabled();
    await this.page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(confirmationHeading).toBeHidden();
    await expect(details).toBeEnabled();
  }

  async expectCardNotDeleted(): Promise<void> {
    await expect(this.detailsDialog()).toBeEnabled();
    await this.expectNumericRecordCount();
  }

  async closeDetails(): Promise<void> {
    await this.detailsDialog().getByRole('button', { name: 'Close', exact: true }).click();
    await expect(this.detailsDialog()).toBeHidden();
  }

  async expectSubmissionList(): Promise<void> {
    await expect(this.page.getByText('Submission History', { exact: true })).toBeEnabled();
    await this.expectNumericRecordCount();
  }

  private async selectFilter(index: number, optionName: string): Promise<void> {
    const filter = this.filterAt(index);
    await expect(filter).toBeEnabled();
    await filter.click();
    const option = this.page.getByRole('option', { name: optionName, exact: true });
    await expect(option, `Expected "${optionName}" as a My History filter option.`).toBeEnabled();
    await option.click();
    await expect(filter).toContainText(optionName);
  }

  private filterAt(index: number): Locator {
    return this.page.getByRole('combobox').nth(index);
  }

  private detailsDialog(): Locator {
    return this.page.getByRole('dialog', { name: 'HSSEQ Card Details Print View' });
  }

  private dataRows(): Locator {
    return this.table.getByRole('row').filter({ has: this.page.getByRole('cell') });
  }

  private async waitForRecordCount(): Promise<void> {
    await expect
      .poll(() => this.recordCount().textContent(), {
        message: 'Wait for the My History record count to load.',
      })
      .toMatch(/^\s*\d[\d,]*\s+records found\s*$/i);
  }

  private async expectNumericRecordCount(): Promise<void> {
    await expect(this.recordCount()).toHaveText(/^\s*\d[\d,]*\s+records found\s*$/i);
  }

  private recordCount(): Locator {
    return this.page.getByText(/^\s*\d[\d,]*\s+records found\s*$/i);
  }
}
