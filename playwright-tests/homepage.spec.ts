import { test, expect } from '@playwright/test';

test('homepage displays the expected title and heading', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Example Domain/i);
  await expect(page.getByRole('heading', { name: 'Example Domain', exact: true })).toBeVisible();
});
