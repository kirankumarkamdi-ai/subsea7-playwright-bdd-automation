import { expect, Page } from '@playwright/test';

export class OperationalDashboardPage {
  constructor(private readonly page: Page) {}

  async expectSevenDaySubmissionVolumeChart(): Promise<void> {
    const chartHeading = this.page.getByRole('heading', {
      name: 'Submission Volume Last 7 Days',
      exact: true,
    });
    await expect(chartHeading).toBeEnabled();
    const chart = chartHeading.locator('xpath=ancestor::div[contains(@class, "rounded-lg")][1]');
    await expect(chart.locator('svg.recharts-surface').first()).toBeEnabled();

    const today = new Date();
    const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - 6 + index);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    });
    for (const day of lastSevenDays) {
      await expect(chart.getByText(day, { exact: true })).toBeEnabled();
    }

    await expect(chart.getByText('Handwritten', { exact: true })).toBeEnabled();
    await expect(chart.getByText('Online E-Form', { exact: true })).toBeEnabled();
  }
}
