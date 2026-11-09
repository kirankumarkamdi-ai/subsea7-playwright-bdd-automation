import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(baseUrl: string): Promise<void> {
    await this.navigateTo(baseUrl);
  }

  heading(text: string): Locator {
    return this.page.getByRole('heading', { name: text, exact: true });
  }
}
