import { expect, Locator, Page } from '@playwright/test';

type RiskColor = 'red' | 'amber' | 'green';

const riskMetrics: Array<{ label: string; count: string; color?: RiskColor }> = [
  { label: 'Total Incidents', count: '29,335' },
  { label: 'High Risk Incidents', count: '1,292', color: 'red' },
  { label: 'Medium Risk Incidents', count: '6,881', color: 'amber' },
  { label: 'Low Risk Incidents', count: '21,089', color: 'green' },
];

export class RiskInsightsPage {
  private sourceRecordPage?: Page;
  private expectedSourceUrl?: string;

  constructor(private readonly page: Page) {}

  async expectSummaryCards(): Promise<void> {
    for (const { label, count, color } of riskMetrics) {
      const labelLocator = this.page.getByText(label, { exact: true });
      await expect(labelLocator, `Expected the "${label}" risk metric.`).toBeEnabled();
      const countLocator = this.page.getByText(count, { exact: true });
      await expect(countLocator).toBeEnabled();

      if (color) {
        const styles = await this.metricStyles(labelLocator, countLocator, count);
        expect(matchesRiskColor(styles.borderColor, color), `${label} border should be ${color}.`)
          .toBe(true);
        expect(matchesRiskColor(styles.textColor, color), `${label} text should be ${color}.`)
          .toBe(true);
      }
    }
  }

  async expectLeadingIndicators(count: number): Promise<void> {
    const sourceLinks = this.sourceDataLinks();
    await expect(sourceLinks, 'Expected one source-data link for each leading indicator.').toHaveCount(
      count,
    );

    for (let index = 0; index < count; index += 1) {
      const sourceLink = sourceLinks.nth(index);
      await expect(sourceLink).toBeEnabled();

      const indicator = await sourceLink.evaluate((link) => {
        let container = link.parentElement;
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
    const sourceLink = this.sourceDataLinks().first();
    await expect(sourceLink).toBeEnabled();

    const href = await sourceLink.getAttribute('href');
    if (!href) {
      throw new Error('The first leading indicator source-data link does not have a destination.');
    }

    this.expectedSourceUrl = new URL(href, this.page.url()).href;
    if ((await sourceLink.getAttribute('target')) === '_blank') {
      const [popup] = await Promise.all([this.page.waitForEvent('popup'), sourceLink.click()]);
      this.sourceRecordPage = popup;
      await popup.waitForLoadState('domcontentloaded');
      return;
    }

    this.sourceRecordPage = this.page;
    await sourceLink.click();
  }

  async expectMatchingSourceRecord(): Promise<void> {
    if (!this.sourceRecordPage || !this.expectedSourceUrl) {
      throw new Error('Open a leading indicator source-data link before checking its record.');
    }

    await expect.poll(() => this.sourceRecordPage!.url()).toBe(this.expectedSourceUrl);
    await expect(this.sourceRecordPage.locator('body')).not.toBeEmpty();
  }

  private sourceDataLinks(): Locator {
    return this.page.getByRole('link', { name: /View Source Data/i });
  }

  private async metricStyles(
    label: Locator,
    countLocator: Locator,
    count: string,
  ): Promise<{ borderColor: string; textColor: string }> {
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
          style.borderTopWidth !== '0px' &&
          style.borderTopStyle !== 'none' &&
          style.borderTopColor !== 'rgba(0, 0, 0, 0)'
        ) {
          return style.borderTopColor;
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
  return green > red && green > blue;
}
