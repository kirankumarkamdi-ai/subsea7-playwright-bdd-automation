import { BasePage } from './base-page';

export class HomePage extends BasePage {
  async open(baseUrl: string): Promise<void> {
    await this.navigateTo(baseUrl);
  }
}
