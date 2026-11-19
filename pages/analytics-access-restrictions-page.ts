import { expect, Page } from '@playwright/test';

export class AnalyticsAccessRestrictionsPage {
  constructor(private readonly page: Page) {}

  async expectAiSubmissionRestricted(): Promise<void> {
    await this.expectModuleHidden('/ai-submit');
    await this.expectRestrictedRoute('/ai-submit');
    await expect(this.page.locator('input[type="file"]')).toHaveCount(0);
  }

  async expectValidationRestricted(): Promise<void> {
    await this.expectModuleHidden('/validation');
    await this.expectRestrictedRoute('/validation');

    await this.page.goto('/history');
    const recordCount = this.page.getByText(/^\s*\d[\d,]*\s+records found\s*$/i);
    await expect(recordCount).toBeVisible({ timeout: 30_000 });
    const activeCard = this.page.getByRole('table').getByRole('row').filter({
      hasText: /pending-review/i,
    }).first();
    if (await activeCard.count()) {
      await activeCard.getByRole('button', { name: 'Review', exact: true }).click();
      await this.expectDashboard();
      await expect(
        this.page.getByRole('button', { name: /Validate|Approve|Reject|Save Changes/i }),
      ).toHaveCount(0);
    }
  }

  async expectClosedCardActionsRestricted(): Promise<void> {
    await this.page.goto('/');
    await this.expectDashboard();
    const statusFilter = this.page.getByRole('combobox').nth(7);
    await statusFilter.click();
    await this.page.getByRole('option', { name: 'Closed', exact: true }).click();

    const closedCardRow = this.page.getByRole('table').getByRole('row').filter({
      hasText: /\bclosed\b/i,
    }).first();
    await expect(closedCardRow, 'Expected a closed card for the Analytics access check.')
      .toBeVisible({ timeout: 30_000 });
    await closedCardRow.click();

    const details = this.page.getByRole('dialog', { name: 'HSSEQ Card Details' });
    await expect(details).toBeVisible();
    await expect(details.getByText('Card status', { exact: true })).toBeVisible();
    await expect(details.getByText('Closed', { exact: true })).toBeVisible();
    await expect(
      details.getByRole('button', { name: /^(Delete|Reopen|Edit)( Card)?$/i }),
    ).toHaveCount(0);
    await details.getByRole('button', { name: 'Close', exact: true }).click();
  }

  async expectAuditLogRestricted(): Promise<void> {
    await this.expectModuleHidden('/audit-logs');
    await this.expectRestrictedRoute('/audit-logs');
  }

  private async expectModuleHidden(route: string): Promise<void> {
    await expect(
      this.page.getByRole('navigation').locator(`a[href="${route}"]`),
      `The Analytics sidebar should not expose ${route}.`,
    ).toHaveCount(0);
  }

  private async expectRestrictedRoute(route: string): Promise<void> {
    await this.page.goto(route);
    await expect.poll(() => new URL(this.page.url()).pathname, {
      message: `Expected Analytics access to ${route} to redirect to the dashboard.`,
      timeout: 30_000,
    }).toBe('/');
    await this.expectDashboard();
  }

  private async expectDashboard(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Recent Submissions', exact: true }),
    ).toBeVisible({ timeout: 30_000 });
  }
}
