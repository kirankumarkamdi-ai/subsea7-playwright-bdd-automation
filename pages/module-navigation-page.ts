import { expect, Locator, Page } from '@playwright/test';

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
  private validationQueueBadgeCount?: string;

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
    if (moduleName === 'Validation Queue') {
      await expect.poll(() => this.readValidationQueueSidebarCount(sidebarLink), {
        message: 'Wait for the Validation Queue sidebar badge to load.',
      }).toMatch(/^\d+$/);
      this.validationQueueBadgeCount = await this.readValidationQueueSidebarCount(sidebarLink);
    }
    await sidebarLink.click();
  }

  async expectModuleAtRoute(route: string, heading: string): Promise<void> {
    await expect.poll(() => new URL(this.page.url()).pathname).toBe(route);
    await expect(this.page.getByRole('heading', { name: heading, exact: true })).toBeEnabled();
  }

  async expectValidationQueueBadgeMatchesPendingCount(): Promise<void> {
    await this.expectModuleAtRoute('/validation', 'Validation Queue');

    if (!this.validationQueueBadgeCount) {
      throw new Error('Capture the Validation Queue sidebar badge before opening the queue.');
    }

    const pendingLabel = this.page.locator('p').getByText('Pending', { exact: true });
    await expect(pendingLabel, 'The Validation Queue should show its pending summary card.')
      .toBeEnabled();
    const readPendingCount = () =>
      pendingLabel.evaluate((label) => {
        let container = label.parentElement;
        while (container) {
          const numericValues = Array.from(container.querySelectorAll<HTMLElement>('*'))
            .filter((element) => element.children.length === 0)
            .map((element) => element.textContent?.trim() ?? '')
            .filter((text) => /^\d[\d,]*$/.test(text));
          if (numericValues.length > 0) {
            return numericValues[0].replace(/,/g, '');
          }
          container = container.parentElement;
        }

        return '';
      });
    await expect.poll(readPendingCount, {
      message: 'Wait for the Validation Queue pending summary count to load.',
    }).toMatch(/^\d+$/);
    const summaryCount = await readPendingCount();

    expect(
      this.validationQueueBadgeCount,
      'The sidebar badge should match the live pending queue count.',
    )
      .toBe(summaryCount);
  }

  private async readValidationQueueSidebarCount(sidebarLink: Locator): Promise<string> {
    const count = await sidebarLink.evaluate((link) => {
      let item: Element | null = link;
      while (item) {
        const value = Array.from(item.querySelectorAll<HTMLElement>('*'))
          .filter((element) => element.children.length === 0)
          .map((element) => element.textContent?.trim() ?? '')
          .find((text) => /^\d[\d,]*$/.test(text));
        if (value) {
          return value.replace(/,/g, '');
        }
        item = item.parentElement;
      }
      return '';
    });

    return count;
  }
}

function isModuleName(value: string): value is ModuleName {
  return Object.prototype.hasOwnProperty.call(modules, value);
}
