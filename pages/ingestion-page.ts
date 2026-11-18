import { expect, Page } from '@playwright/test';
import { resolve } from 'node:path';

const observationCardPdf = resolve(
  __dirname,
  '../test-data/HSSEQ Card Final rev2 [withCrops] (1).pdf',
);

export class IngestionPage {
  constructor(private readonly page: Page) {}

  async openAiAssistedCreation(): Promise<void> {
    await this.page.getByRole('button', { name: '+ New HSSEQ Card', exact: true }).click();
    await expect(
      this.page.getByRole('heading', { name: 'AI-Assisted Submission', exact: true }),
    ).toBeVisible();
  }

  async uploadSampleObservationCard(): Promise<void> {
    const fileInput = this.page.locator('input[type="file"]');
    await expect(fileInput, 'Expected the AI-assisted PDF upload control.').toHaveCount(1);
    await fileInput.setInputFiles(observationCardPdf);
  }

  async expectUploadSuccess(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Card uploaded successfully', exact: true }),
      'Expected the valid observation PDF to upload and start AI ingestion.',
    ).toBeVisible({ timeout: 60_000 });
  }

  async chooseManualSubmission(): Promise<void> {
    await this.page.getByRole('button', { name: '+ New HSSEQ Card', exact: true }).click();
    await expect(
      this.page.getByRole('heading', { name: 'AI-Assisted Submission', exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Or enter manually without upload' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Manual Submission', exact: true }),
    ).toBeVisible();
    await expect(this.page.getByText(/Step 1 of 5:/)).toBeVisible();
  }

  async completeManualObservationCard(): Promise<void> {
    await this.selectOption('Country', 'UK');
    await this.selectOption('Onshore/OffShore', 'Onshore');
    await this.selectOption('Worksite', '3rd Party Premises');

    await this.page.getByRole('button', { name: /^(Date|Pick a date)$/ }).click();
    await this.page
      .getByRole('gridcell', { name: String(new Date().getDate()), exact: true })
      .first()
      .click();
    await this.selectTime('Hour');
    await this.selectTime('Minute');
    await this.page.getByLabel('Site / Location *').fill('London Office');
    await this.page.getByLabel('Client / Project *').fill('Subsea Test Project');
    await this.clickNextStep(2);

    await expect(this.page.getByRole('radio', { name: 'Observation', exact: true })).toBeVisible();
    await this.page.getByRole('radio', { name: 'Observation', exact: true }).click();
    await this.clickNextStep(3);
    await this.clickNextStep(4);
    await this.clickNextStep(5);
    await this.page.getByRole('button', { name: 'Submit Card', exact: true }).click();
  }

  async expectManualSubmissionSuccess(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: /HSSEQ Card Submitted Successfully/ }),
      'Expected the completed manual card to be submitted successfully.',
    ).toBeVisible({ timeout: 30_000 });
  }

  private async selectOption(fieldName: string, optionName: string): Promise<void> {
    const field = this.page.getByRole('combobox', { name: fieldName });
    await expect(field, `${fieldName} is required for manual submission.`).toBeEnabled();
    await field.click();
    const option = this.page.getByRole('option', { name: optionName, exact: true });
    await expect(option, `Expected ${optionName} in the ${fieldName} options.`).toBeVisible();
    await option.click();
  }

  private async selectTime(fieldName: 'Hour' | 'Minute'): Promise<void> {
    await this.page.getByRole('combobox', { name: fieldName }).click();
    await this.page.getByRole('option', { name: '00', exact: true }).click();
  }

  private async clickNextStep(expectedStep: number): Promise<void> {
    await this.page.getByRole('button', { name: 'Next Step', exact: true }).click();
    await expect(this.page.getByText(new RegExp(`Step ${expectedStep} of 5:`))).toBeVisible();
  }
}
