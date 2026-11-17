import { expect, Page } from '@playwright/test';

const modules = {
  'User Dashboard': '/',
  'Manual Submission': '/submit',
  'AI-Assisted Submission': '/ai-submit',
  'My History': '/history',
  'Admin Dashboard': '/dashboard',
  'Luna7 Safety Agent': '/ai-agent',
  'Validation Queue': '/validation',
  'Risk Insights': '/risk-insights',
  'Data Search': '/data-search',
  'Audit Logs': '/audit-logs',
} as const;

type ModuleName = keyof typeof modules;

export class ModuleNavigationPage {
  constructor(private readonly page: Page) {}

  async openUserDashboard(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Recent Submissions', exact: true })).toBeEnabled();
  }

  async clickModule(moduleName: string): Promise<void> {
    if (!isModuleName(moduleName)) {
      throw new Error(`Unknown sidebar module "${moduleName}".`);
    }

    const route = modules[moduleName];
    // The icon-only sidebar links expose no accessible names, so resolve them by route.
    const sidebarLink = this.page
      .getByRole('navigation')
      .locator(`a[href="${route}"]`);
    await expect(sidebarLink, `Expected one sidebar link for ${moduleName} at ${route}.`).toHaveCount(1);
    await sidebarLink.click();
  }

  async expectModuleAtRoute(route: string, heading: string): Promise<void> {
    await expect.poll(() => new URL(this.page.url()).pathname).toBe(route);
    await expect(this.page.getByRole('heading', { name: heading, exact: true })).toBeEnabled();
  }

  async expectValidationQueueBadgeMatchesPendingCount(expectedCount: string): Promise<void> {
    await this.expectModuleAtRoute('/validation', 'Validation Queue');

    const sidebarLink = this.page.getByRole('navigation').locator('a[href="/validation"]');
    const badge = sidebarLink.getByText(expectedCount, { exact: true });
    await expect(badge, 'The Validation Queue sidebar should show its pending badge.')
      .toBeEnabled();

    const pendingLabel = this.page.getByText('Pending', { exact: true });
    await expect(pendingLabel, 'The Validation Queue should show its pending summary card.')
      .toBeEnabled();
    const summaryCount = await pendingLabel.evaluate((label) => {
      let container = label.parentElement;
      while (container) {
        const numericValues = Array.from(container.querySelectorAll<HTMLElement>('*'))
          .filter((element) => element.children.length === 0)
          .map((element) => element.textContent?.trim() ?? '')
          .filter((text) => /^\d+$/.test(text));
        if (numericValues.length > 0) {
          return numericValues[0];
        }
        container = container.parentElement;
      }

      throw new Error('Could not find the pending count in the Validation Queue summary card.');
    });

    expect(summaryCount, 'The sidebar badge should match the queue summary pending count.')
      .toBe(expectedCount);
  }
}

function isModuleName(value: string): value is ModuleName {
  return Object.prototype.hasOwnProperty.call(modules, value);
}
