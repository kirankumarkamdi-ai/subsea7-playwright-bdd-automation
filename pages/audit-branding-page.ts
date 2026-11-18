import { expect, Page } from '@playwright/test';

export class AuditBrandingPage {
  constructor(private readonly page: Page) {}

  async expectAuditLogsAvailable(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Audit Logs', exact: true }))
      .toBeVisible();
    await expect(
      this.page.getByText('Complete audit trail of all validation activities', { exact: true }),
    ).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Activity Log', exact: true }))
      .toBeVisible();
  }

  async expectBrandingAndUserInitials(): Promise<void> {
    const logo = this.page.getByRole('img', { name: 'Subsea7 HSEQ', exact: true });
    await expect(logo).toBeVisible();
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
    await expect(greeting).toBeVisible();
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
    ).toBeVisible();
    const badgeBounds = await profileInitials.boundingBox();
    const viewport = this.page.viewportSize();
    if (!badgeBounds || !viewport || badgeBounds.x > 80 || badgeBounds.y < viewport.height - 80) {
      throw new Error('The user profile badge is not positioned at the bottom-left of the sidebar.');
    }
  }
}
