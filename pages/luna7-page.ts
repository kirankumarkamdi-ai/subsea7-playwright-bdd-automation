import { expect, Locator, Page } from '@playwright/test';

export class Luna7Page {
  private readonly safetyQuestion = 'What precautions help prevent slips and trips at work?';

  constructor(private readonly page: Page) {}

  async sendSafetyQuery(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Luna7', exact: true })).toBeEnabled();
    const bubbles = this.messageBubbles();

    await this.page.getByRole('button', { name: 'Open hazards', exact: true }).click();
    const beforeSuggestion = await bubbles.count();
    await this.waitForResponse(beforeSuggestion);

    const input = this.page.getByRole('textbox', { name: 'Ask the AI Safety Agent...' });
    await input.fill(this.safetyQuestion);
    const beforeQuestion = await bubbles.count();
    await input.locator('xpath=..').getByRole('button').click();
    await this.waitForResponse(beforeQuestion);
  }

  async expectSafetyResponse(): Promise<void> {
    const bubbles = this.messageBubbles();
    const count = await bubbles.count();
    if (count < 2) {
      throw new Error('Luna7 did not display a user message and assistant response.');
    }

    const userBubble = bubbles.nth(count - 2);
    const responseBubble = bubbles.last();
    await expect(userBubble).toContainText(this.safetyQuestion);
    await expect(responseBubble, 'Luna7 should return a non-empty safety response.')
      .not.toBeEmpty();
    await this.expectDistinctMessageStyles(userBubble, responseBubble);
    await expect(
      this.page.getByText('AI can make mistakes. Verify important information with official sources.'),
    ).toBeEnabled();
  }

  private messageBubbles(): Locator {
    return this.page.locator('div[class*="rounded-2xl"][class*="max-w-"]');
  }

  private async waitForResponse(previousBubbleCount: number): Promise<void> {
    await expect
      .poll(() => this.messageBubbles().count(), {
        timeout: 90_000,
        message: 'Wait for Luna7 to display the submitted prompt and its response.',
      })
      .toBeGreaterThan(previousBubbleCount + 1);
    await expect
      .poll(() => this.messageBubbles().last().innerText(), {
        timeout: 90_000,
        message: 'Wait for Luna7 to finish rendering its response.',
      })
      .toMatch(/\S{10}/);
  }

  private async expectDistinctMessageStyles(
    userBubble: Locator,
    assistantBubble: Locator,
  ): Promise<void> {
    await expect(userBubble).toBeVisible();
    await expect(assistantBubble).toBeVisible();
    const userStyle = await userBubble.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      color: getComputedStyle(element).color,
    }));
    const assistantStyle = await assistantBubble.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      color: getComputedStyle(element).color,
    }));
    expect(userStyle.background, 'The user message should have a distinct background color.')
      .not.toBe(assistantStyle.background);
    expect(userStyle.color, 'The user and assistant messages should have contrasting text colors.')
      .not.toBe(assistantStyle.color);
  }
}
