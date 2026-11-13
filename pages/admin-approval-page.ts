import { expect, Page } from '@playwright/test';
import cardData from '../test-data/admin-approval.json';
import { getBaseUrl } from '../support/environment';

export class AdminApprovalPage {
  private readonly existingCardIds = new Set<string>();
  private createdCardId = '';

  constructor(private readonly page: Page) {}

  async submitManualCard(): Promise<void> {
    await this.openValidationQueue();
    const queueRows = await this.page.getByRole('row').allTextContents();
    queueRows.flatMap(extractCardIds).forEach((id) => this.existingCardIds.add(id));

    await this.page.goto('/submit');
    await expect(
      this.page.getByRole('heading', { name: 'Manual Submission', exact: true }),
    ).toBeEnabled();

    await this.selectOption('Country', cardData.country);
    await this.selectOption('Onshore/OffShore', cardData.shore);
    await this.selectOption('Worksite', cardData.worksite);

    await this.page.getByText('Pick a date', { exact: true }).click();
    await this.page
      .getByRole('gridcell', { name: String(new Date().getDate()), exact: true })
      .click();
    await this.selectTime('Hour');
    await this.selectTime('Minute');

    await this.page.getByLabel('Site / Location *').fill(cardData.siteLocation);
    await this.page.getByLabel('Client / Project *').fill(cardData.handwrittenClientProject);
    await this.clickNextSteps(1);
    await this.page.getByRole('radio', { name: 'Observation', exact: true }).click();
    await this.clickNextSteps(3);
    await this.page.getByRole('button', { name: 'Submit Card', exact: true }).click();
    await this.page.getByRole('button', { name: 'View My Dashboard', exact: true }).click();

    await this.openValidationQueue();
    await expect
      .poll(
        async () => {
          const currentRows = await this.page.getByRole('row').allTextContents();
          this.createdCardId =
            currentRows.flatMap(extractCardIds).find((id) => !this.existingCardIds.has(id)) ?? '';
          return this.createdCardId;
        },
        { timeout: 30_000, message: 'The manually submitted card did not appear in the validation queue.' },
      )
      .not.toBe('');
  }

  async openCreatedCardForReview(): Promise<void> {
    await this.openValidationQueue();
    const row = this.page.getByRole('row').filter({ hasText: this.createdCardId });
    await expect(row, `Expected card "${this.createdCardId}" in the validation queue.`).toHaveCount(
      1,
      { timeout: 30_000 },
    );
    await row.getByRole('button', { name: 'Review', exact: true }).click();
    await this.selectOption('Client', cardData.approvalClient);
    await this.selectOption('Project', cardData.approvalProject);
    await this.clickNextSteps(4);
    await expect(
      this.page.getByRole('button', { name: 'Validate & Approve Data', exact: true }),
    ).toBeEnabled();
  }

  async validateAndApprove(): Promise<void> {
    await this.page.getByRole('button', { name: 'Validate & Approve Data', exact: true }).click();
  }

  async rejectCreatedCard(): Promise<void> {
    const rejectButton = this.page.getByRole('button', { name: 'Reject Card', exact: true });
    await expect(rejectButton).toBeEnabled();
    await rejectButton.click();

    const reasonField = this.page.getByRole('textbox', { name: 'Reason for Rejection' });
    await expect(reasonField).toBeEnabled();
    await reasonField.fill(cardData.rejectionReason);

    const confirmButton = this.page.getByRole('button', { name: 'Confirm Rejection', exact: true });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();
    await expect(confirmButton).toBeHidden({ timeout: 30_000 });
  }

  async expectStatusInMyHistory(status: string): Promise<void> {
    await this.page.goto('/history');
    await expect(this.page.getByRole('heading', { name: 'My History', exact: true })).toBeEnabled();
    const row = this.page.getByRole('row').filter({ hasText: this.createdCardId });
    await expect(row, `Expected card "${this.createdCardId}" in My History.`).toBeEnabled({
      timeout: 30_000,
    });
    await expect(row.getByRole('cell', { name: status, exact: true })).toBeEnabled({
      timeout: 30_000,
    });
  }

  private async openValidationQueue(): Promise<void> {
    await this.page.goto('/validation');

    const expectedOrigin = new URL(getBaseUrl()).origin;
    const currentUrl = new URL(this.page.url());
    if (currentUrl.origin !== expectedOrigin) {
      throw new Error(
        `Opening the validation queue redirected to ${currentUrl.hostname}; the saved session is not authenticated. ` +
          'Run `npm run auth:setup` again, complete sign-in and MFA, then retry.',
      );
    }
  }

  private async selectOption(name: string, optionName: string): Promise<void> {
    const combo = this.page.getByRole('combobox', { name });
    await expect(combo, `${name} field should be enabled before selecting a value.`).toBeEnabled({
      timeout: 30_000,
    });
    await combo.click();
    const option = this.page.getByRole('option', { name: optionName, exact: true });
    await expect(option).toBeEnabled();
    await option.click();
  }

  private async selectTime(label: 'Hour' | 'Minute'): Promise<void> {
    await this.page.getByRole('combobox', { name: label }).click();
    await this.page.getByRole('option', { name: '00', exact: true }).click();
  }

  private async clickNextSteps(count: number): Promise<void> {
    for (let step = 0; step < count; step += 1) {
      await this.page.getByRole('button', { name: 'Next Step', exact: true }).click();
    }
  }

}

function extractCardIds(text: string): string[] {
  return text.match(/[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}/gi) ?? [];
}
