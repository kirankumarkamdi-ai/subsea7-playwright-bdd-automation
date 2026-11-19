import { expect, Locator, Page } from '@playwright/test';

export class AuditBrandingPage {
  constructor(private readonly page: Page) {}

  async expectAuditLogsAvailable(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Audit Logs', exact: true }))
      .toBeEnabled();
    await expect(
      this.page.getByText('Complete audit trail of all validation activities', { exact: true }),
    ).toBeEnabled();
    await expect(this.page.getByRole('heading', { name: 'Activity Log', exact: true }))
      .toBeEnabled();
  }

  async searchForCard(cardId: string): Promise<void> {
    const search = this.page.getByRole('textbox', { name: 'Search audit logs' });
    await expect(search).toBeEnabled();
    await search.fill(cardId);

    const matchingRows = this.activityRows().filter({ hasText: cardId });
    await expect(matchingRows, `Expected audit activity for card "${cardId}".`).toHaveCount(1, {
      timeout: 30_000,
    });
  }

  async expectActivityForCard(cardId: string): Promise<void> {
    const table = this.page.getByRole('table');
    const headers = (await table.getByRole('row').first().getByRole('columnheader').allTextContents())
      .map((header) => header.trim());
    expect(headers).toEqual(['Timestamp', 'User ID', 'Action', 'Card ID', 'Description']);

    const row = this.activityRows().filter({ hasText: cardId });
    await expect(row, `Expected one audit activity row for card "${cardId}".`).toHaveCount(1);
    const cells = row.getByRole('cell');
    await expect(cells).toHaveCount(headers.length);
    await expect(cells.nth(0)).toContainText(
      /^\d{1,2}(st|nd|rd|th)\s+[A-Z][a-z]{2}\s+\d{4},\s+\d{1,2}:\d{2}$/,
    );
    await expect(cells.nth(1)).not.toBeEmpty();
    await expect(cells.nth(2)).toHaveText('Submitted');
    await expect(cells.nth(3)).toHaveText(cardId);
    await expect(cells.nth(4)).toContainText('Card submitted for admin review');
  }

  async expectDynamicSummaryCountersAndColors(): Promise<void> {
    await expect(this.page.getByText('Loading…', { exact: true })).toBeHidden({
      timeout: 30_000,
    });

    const expectedIcons = [
      { label: 'Total Actions Today', colorClass: /text-primary\/20/ },
      {
        label: 'Validations',
        colorClass: /text-\[hsl\(var\(--stat-success\)\)\]\/20/,
      },
      { label: 'Rejections', colorClass: /text-destructive\/20/ },
      { label: 'Submits Made', colorClass: /text-primary\/20/ },
    ];

    for (const { label, colorClass } of expectedIcons) {
      const metricLabel = this.page.getByText(label, { exact: true });
      await expect(metricLabel).toBeVisible();
      const metric = metricLabel.locator('xpath=../..');
      await expect(metric.locator('p').nth(1)).toHaveText(/^\d+$/);
      await expect(metric.locator('svg')).toHaveClass(colorClass);
    }
  }

  async expectBrandingAndUserInitials(): Promise<void> {
    const logo = this.page.getByRole('img', { name: 'Subsea7 HSEQ', exact: true });
    await expect(logo).toBeEnabled();
    const logoBounds = await logo.boundingBox();
    if (!logoBounds || logoBounds.x > 40 || logoBounds.y > 40) {
      throw new Error('The Subsea7 logo is not positioned at the top-left of the sidebar.');
    }

    const redPixelCount = await logo.evaluate((image) => {
      const logoImage = image as HTMLImageElement;
      const canvas = document.createElement('canvas');
      canvas.width = logoImage.naturalWidth;
      canvas.height = logoImage.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context || canvas.width === 0 || canvas.height === 0) {
        return 0;
      }

      context.drawImage(logoImage, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let redCount = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index] > 170 && pixels[index + 1] < 90 && pixels[index + 2] < 90) {
          redCount += 1;
        }
      }
      return redCount;
    });
    expect(redPixelCount, 'The Subsea7 logo should include its red accent.').toBeGreaterThan(0);

    const greeting = this.page.getByRole('heading', { name: /^Welcome,\s+.+$/ });
    await expect(greeting).toBeEnabled();
    const name = (await greeting.innerText()).replace(/^Welcome,\s*/, '').trim();
    const nameParts = name.split(/\s+/).filter(Boolean);
    const initials = [nameParts[0], nameParts.at(-1)]
      .filter((part): part is string => Boolean(part))
      .map((part) => part[0].toUpperCase())
      .join('');
    if (initials.length < 2) {
      throw new Error(`Could not derive first and last initials from the dashboard greeting "${name}".`);
    }

    const profileInitials = this.page.getByText(initials, { exact: true });
    await expect(
      profileInitials,
      `The profile badge should show the signed-in user's initials "${initials}".`,
    ).toBeEnabled();
    const badgeBounds = await profileInitials.boundingBox();
    const viewport = this.page.viewportSize();
    if (!badgeBounds || !viewport || badgeBounds.x > 80 || badgeBounds.y < viewport.height - 80) {
      throw new Error('The user profile badge is not positioned at the bottom-left of the sidebar.');
    }
  }

  private activityRows(): Locator {
    return this.page.getByRole('table').getByRole('row').filter({
      has: this.page.getByRole('cell'),
    });
  }
}
