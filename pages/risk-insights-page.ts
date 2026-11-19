import { expect, Locator, Page } from '@playwright/test';

type RiskColor = 'red' | 'amber' | 'green' | 'blue';

const riskMetrics: Array<{ label: string; color?: RiskColor }> = [
  { label: 'Total Incidents' },
  { label: 'High Risk Incidents', color: 'red' },
  { label: 'Medium Risk Incidents', color: 'amber' },
  { label: 'Low Risk Incidents', color: 'blue' },
];

export class RiskInsightsPage {
  private firstIndicatorDescription: string | undefined;

  constructor(private readonly page: Page) {}

  async expectSummaryCards(): Promise<void> {
    for (const { label, color } of riskMetrics) {
      const labelLocator = this.page.getByText(label, { exact: true });
      await expect(labelLocator, `Expected the "${label}" risk metric.`).toBeVisible();
      const countLocator = labelLocator.locator('xpath=following-sibling::p[1]');
      await expect(countLocator, `Expected a live numeric count for "${label}".`)
        .toHaveText(/^\d[\d,]*$/, { timeout: 30_000 });

      if (color) {
        const styles = await this.metricStyles(labelLocator, countLocator);
        expect(matchesRiskColor(styles.borderColor, color), `${label} border should be ${color}.`)
          .toBe(true);
        expect(matchesRiskColor(styles.textColor, color), `${label} text should be ${color}.`)
          .toBe(true);
      }
    }
  }

  async expectLeadingIndicators(count: number): Promise<void> {
    const sourceActions = this.sourceDataActions();
    await expect(
      sourceActions,
      'Expected one source-data action for each leading indicator.',
    ).toHaveCount(count);

    for (let index = 0; index < count; index += 1) {
      const sourceAction = sourceActions.nth(index);
      await expect(sourceAction).toBeEnabled();

      const indicator = await sourceAction.evaluate((action) => {
        let container = action.parentElement;
        while (container && container !== document.body) {
          const text = container.innerText.trim();
          const severity = text.match(/\b(High|Medium|Low)\b/)?.[0];
          if (text.length > 40 && severity) {
            const badge = Array.from(container.querySelectorAll<HTMLElement>('*')).find(
              (element) => element.innerText.trim() === severity,
            );
            const colors: string[] = [];
            let styledBadge: HTMLElement | null = badge ?? null;
            while (styledBadge && styledBadge !== container.parentElement) {
              const style = getComputedStyle(styledBadge);
              colors.push(style.color, style.backgroundColor, style.borderTopColor);
              styledBadge = styledBadge.parentElement;
            }
            return { text, severity, colors };
          }
          container = container.parentElement;
        }
        return { text: '', severity: '', colors: [] };
      });

      expect(
        indicator.text.length,
        `Leading indicator ${index + 1} should include a description and severity badge.`,
      ).toBeGreaterThan(40);
      expect(indicator.severity).toMatch(/^(High|Medium|Low)$/);
      const badgeColor: RiskColor =
        indicator.severity === 'High' ? 'red' : indicator.severity === 'Medium' ? 'amber' : 'green';
      expect(
        indicator.colors.some((color) => matchesRiskColor(color, badgeColor)),
        `${indicator.severity} severity badge should use ${badgeColor} styling.`,
      ).toBe(true);
    }
  }

  async openFirstIndicatorSourceData(): Promise<void> {
    const sourceAction = this.sourceDataActions().first();
    await expect(sourceAction).toBeEnabled();

    const indicatorCard = sourceAction.locator('xpath=ancestor::div[contains(@class, "p-4")][1]');
    const cardText = await indicatorCard.innerText();
    const cardLines = cardText.split('\n').map((line) => line.trim()).filter(Boolean);
    const severityIndex = cardLines.findIndex((line) => /^(High|Medium|Low)$/.test(line));
    const description = severityIndex >= 0 ? cardLines[severityIndex + 1] : undefined;
    if (!description) {
      throw new Error('Could not find the first leading indicator description.');
    }

    this.firstIndicatorDescription = description;
    await sourceAction.click();
    await expect(this.sourceDataDialog()).toBeEnabled();
  }

  async expectFirstIndicatorDescription(): Promise<void> {
    const dialog = this.sourceDataDialog();
    await expect(dialog).toBeEnabled();

    if (!this.firstIndicatorDescription) {
      throw new Error('The first leading indicator description has not been captured.');
    }

    await expect(dialog.getByText(this.firstIndicatorDescription, { exact: true }))
      .toBeEnabled();
  }

  private sourceDataActions(): Locator {
    return this.page.locator(
      'div > .p-4 > .space-y-3 > .flex.flex-wrap > .inline-flex',
    );
  }

  private sourceDataDialog(): Locator {
    return this.page.getByRole('dialog', { name: 'Source data' });
  }

  private async metricStyles(
    label: Locator,
    countLocator: Locator,
  ): Promise<{ borderColor: string; textColor: string }> {
    const count = (await countLocator.innerText()).trim();
    const borderColor = await label.evaluate((element, expectedCount) => {
      let container: HTMLElement | null = element.parentElement;
      while (container && !container.innerText.includes(expectedCount)) {
        container = container.parentElement;
      }

      if (!container) {
        throw new Error(`Could not find the "${expectedCount}" count in the "${element.textContent}" card.`);
      }

      while (container) {
        const style = getComputedStyle(container);
        if (
          style.borderLeftWidth !== '0px' &&
          style.borderLeftStyle !== 'none' &&
          style.borderLeftColor !== 'rgba(0, 0, 0, 0)'
        ) {
          return style.borderLeftColor;
        }
        container = container.parentElement;
      }

      return '';
    }, count);

    return {
      borderColor,
      textColor: await countLocator.evaluate((element) => getComputedStyle(element).color),
    };
  }
}

function matchesRiskColor(value: string, expected: RiskColor): boolean {
  const channels = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!channels) {
    return false;
  }

  const [red, green, blue] = channels.slice(1).map(Number);
  if (expected === 'red') {
    return red > green * 1.3 && red > blue * 1.3;
  }
  if (expected === 'amber') {
    return red > green && green > blue;
  }
  if (expected === 'blue') {
    return blue > red && blue > green;
  }
  return green > red && green > blue;
}
