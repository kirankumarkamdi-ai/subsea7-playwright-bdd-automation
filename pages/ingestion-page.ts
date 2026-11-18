import { expect, Page } from '@playwright/test';
import { resolve } from 'node:path';

const observationCardPdf = resolve(
  __dirname,
  '../test-data/HSSEQ Card Final rev2 [withCrops] (1).pdf',
);

export class IngestionPage {
  private manualSubmissionMarker?: string;

  constructor(private readonly page: Page) {}

  async openAiAssistedCreation(): Promise<void> {
    await this.page.getByRole('button', { name: '+ New HSSEQ Card', exact: true }).click();
    await expect(
      this.page.getByRole('heading', { name: 'AI-Assisted Submission', exact: true }),
    ).toBeEnabled();
  }

  async uploadSampleObservationCard(): Promise<void> {
    const fileInput = this.page.locator('input[type="file"]');
    await expect(fileInput, 'Expected the AI-assisted PDF upload control.').toHaveCount(1);
    await fileInput.setInputFiles(observationCardPdf);
  }

  async selectSamplePdfThroughDropZone(): Promise<void> {
    const dropZone = this.page.getByRole('heading', {
      name: 'Drag & Drop your scanned HSSEQ Cards here',
      exact: true,
    });
    await expect(dropZone, 'Expected the AI-assisted PDF upload drop zone.').toBeVisible();
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await dropZone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(observationCardPdf);
    await expect(this.page.getByRole('heading', { name: 'Card uploaded successfully' }))
      .toBeVisible({ timeout: 60_000 });
  }

  async expectUploadSuccess(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Card uploaded successfully', exact: true }),
      'Expected the valid observation PDF to upload and start AI ingestion.',
    ).toBeEnabled({ timeout: 60_000 });
  }

  async chooseManualSubmission(): Promise<void> {
    await this.page.getByRole('button', { name: '+ New HSSEQ Card', exact: true }).click();
    await expect(
      this.page.getByRole('heading', { name: 'AI-Assisted Submission', exact: true }),
    ).toBeEnabled();
    await this.page.getByRole('button', { name: 'Or enter manually without upload' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Manual Submission', exact: true }),
    ).toBeEnabled();
    await expect(this.page.getByText(/Step 1 of 5:/)).toBeEnabled();
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

    await expect(this.page.getByRole('radio', { name: 'Observation', exact: true })).toBeEnabled();
    await this.page.getByRole('radio', { name: 'Observation', exact: true }).click();
    await this.clickNextStep(3);
    await this.clickNextStep(4);
    await this.clickNextStep(5);
    await this.page.getByRole('button', { name: 'Submit Card', exact: true }).click();
  }

  async completeManualObservationCardWithProgressAndNavigation(): Promise<void> {
    const fields = this.page.getByRole('combobox');
    await this.selectOption('Country', 'Australia');
    await this.selectOption('Onshore/OffShore', 'Onshore');
    await this.selectOption('Worksite', '3rd Party Premises');
    await this.page.getByText('Pick a date', { exact: true }).click();
    await this.page
      .getByRole('gridcell', { name: String(new Date().getDate()), exact: true })
      .first()
      .click();
    await fields.nth(3).click();
    await this.page.getByRole('option', { name: '00', exact: true }).click();
    await fields.nth(4).click();
    await this.page.getByRole('option', { name: '00', exact: true }).click();

    await this.page.getByLabel('Site / Location *').fill('Automation QA Office');
    await this.page.getByLabel('Name of Observer').fill('Automation Test User');
    await this.page.getByLabel('Department').fill('Quality Assurance');
    await this.page.getByLabel('Client / Project *').fill('Subsea Test Project');
    await this.page.getByLabel('Task Being Observed').fill('Routine equipment inspection');
    await this.page.getByLabel('People Involved').fill('Quality assurance team');
    await this.expectProgress(1, 'General Info', 20);
    await this.clickNextStep(2);
    await this.expectProgress(2, 'Behavior Checklist', 40);

    await this.page.getByRole('radio', { name: 'Observation', exact: true }).click();
    await this.page.getByRole('checkbox').nth(1).click();
    this.manualSubmissionMarker = `Automation observation ${Date.now()}`;
    await this.page.locator('#descObs').fill(this.manualSubmissionMarker);
    await this.clickNextStep(3);
    await this.expectProgress(3, 'Conditions Checklist', 60);

    const conditionCheckboxes = this.page.getByRole('checkbox');
    for (const index of [0, 13, 18, 22]) {
      await conditionCheckboxes.nth(index).click();
      await expect(conditionCheckboxes.nth(index)).toHaveAttribute('aria-checked', 'true');
    }
    await this.clickNextStep(4);
    await this.expectProgress(4, 'Description of Observation', 80);

    await this.page.locator('#action-taken-resolution-yes').click();
    await this.page.getByPlaceholder('Describe the action taken...').fill('Stopped and inspected the equipment.');
    await this.page.locator('#further-action-required-improvement-no').click();
    await this.page
      .getByPlaceholder('Describe further actions needed...')
      .fill('No further action required.');
    await this.page.locator('#observation-close-out-commitment-yes').click();
    await this.page
      .getByPlaceholder('Describe closeout commitment...')
      .fill('Inspection completed and area left safe.');

    await this.clickNextStep(5);
    await this.expectProgress(5, 'Work Insights', 100);
    await this.page.getByRole('button', { name: 'Previous', exact: true }).click();
    await this.expectProgress(4, 'Description of Observation', 80);
    await expect(this.page.getByPlaceholder('Describe the action taken...')).toHaveValue(
      'Stopped and inspected the equipment.',
    );
    await expect(this.page.getByPlaceholder('Describe further actions needed...')).toHaveValue(
      'No further action required.',
    );
    await expect(this.page.getByPlaceholder('Describe closeout commitment...')).toHaveValue(
      'Inspection completed and area left safe.',
    );
    await this.clickNextStep(5);

    await this.page.getByPlaceholder('Describe preparations, briefings, permits...').fill(
      'Reviewed the inspection plan and required PPE.',
    );
    await this.page.getByPlaceholder('Describe activities, conditions observed...').fill(
      'Completed the equipment inspection.',
    );
    await this.page.getByPlaceholder('Describe cleanup, debrief, lessons...').fill(
      'Shared the inspection outcome with the team.',
    );
    await this.page.getByRole('button', { name: 'Submit Card', exact: true }).click();
  }

  async expectManualSubmissionComplete(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: /HSSEQ Card Submitted/ }),
      'Expected the manual card submission confirmation.',
    ).toBeEnabled({ timeout: 30_000 });

    if (!this.manualSubmissionMarker) {
      throw new Error('Submit the manual card before checking the dashboard record.');
    }

    await this.page.goto('/');
    await expect(
      this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }),
    ).toBeEnabled();
    const search = this.page.getByRole('textbox', { name: 'Search by location' });
    await search.fill('3rd Party Premises');
    const submittedRow = this.page.getByRole('row').filter({
      hasText: this.manualSubmissionMarker,
    });
    await expect(
      submittedRow,
      'The newly submitted card should appear in Recent Submissions.',
    ).toBeEnabled({ timeout: 30_000 });
  }

  async expectManualSubmissionSuccess(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: /HSSEQ Card Submitted Successfully/ }),
      'Expected the completed manual card to be submitted successfully.',
    ).toBeEnabled({ timeout: 30_000 });
  }

  private async selectOption(fieldName: string, optionName: string): Promise<void> {
    const field = this.page.getByRole('combobox', { name: fieldName });
    await expect(field, `${fieldName} is required for manual submission.`).toBeEnabled();
    await field.click();
    const option = this.page.getByRole('option', { name: optionName, exact: true });
    await expect(option, `Expected ${optionName} in the ${fieldName} options.`).toBeEnabled();
    await option.click();
  }

  private async selectTime(fieldName: 'Hour' | 'Minute'): Promise<void> {
    await this.page.getByRole('combobox', { name: fieldName }).click();
    await this.page.getByRole('option', { name: '00', exact: true }).click();
  }

  private async clickNextStep(expectedStep: number): Promise<void> {
    await this.page.getByRole('button', { name: 'Next Step', exact: true }).click();
    await expect(this.page.getByText(new RegExp(`Step ${expectedStep} of 5:`))).toBeEnabled();
  }

  private async expectProgress(step: number, title: string, percent: number): Promise<void> {
    await expect(this.page.getByText(`Step ${step} of 5: ${title}`, { exact: true })).toBeEnabled();
    await expect(this.page.getByText(`${percent}% complete`, { exact: true })).toBeEnabled();
  }
}
