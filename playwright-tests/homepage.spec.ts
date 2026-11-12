import { test, expect } from '@playwright/test';

// test('homepage displays the expected title and heading', async ({ page }) => {
//   await page.goto('/');
//   await expect(page).toHaveTitle(/Example Domain/i);
//   await expect(page.getByRole('heading', { name: 'Example Domain', exact: true })).toBeVisible();
// });

test('homepage displays the expected title and heading', async ({ page }) => {
  await page.goto('/');

  // Pauses so you can manually complete Google IAP / MFA login
  await page.pause();

  // Save the authenticated session so you don't have to log in every time
  await page.context().storageState({ path: 'playwright/.auth/user.json' });

  // Update this to match your actual internal app's title
  await expect(page).toHaveTitle('HSSEQ Cards');
  console.log('Current page title:', await page.title());
});
